"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageCircle,
  Share2,
  Star,
  StarHalf,
  Maximize2,
  X,
  MoreVertical,
  Trash2,
  Edit3,
  AlertCircle,
  Undo2,
  CheckCircle2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { MediaCarousel } from "./media/MediaCarousel";
import { useSession } from "next-auth/react";
import { useAlert } from "@/components/providers/AlertProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  toggleLike,
  submitReview,
  addComment,
  getComments,
  updateTaskCaption,
  deleteTask,
  approveTask,
} from "@/lib/actions/task";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface TaskCardProps {
  id: string;
  author: {
    id?: string;
    name: string;
    image: string;
  };
  collaborators?: {
    name: string;
    image: string;
  }[];
  projectTitle: string;
  mediaUrl: string;
  mediaUrls?: string[];
  mediaType: "image" | "video" | "document";
  caption: string;
  review?: {
    grade: number;
    comment: string;
    mentorName: string;
  };
  likesCount?: number;
  isLikedByMe?: boolean;
  commentsCount?: number;
  timeAgo: string;
  createdAt: string;
  status?: string;
  project?: {
    id: string;
    title: string;
    managerId?: string;
  };
}

export function TaskCard({
  id,
  author,
  collaborators = [],
  projectTitle,
  mediaUrl,
  mediaUrls = [],
  mediaType,
  caption,
  review,
  likesCount = 0,
  isLikedByMe = false,
  commentsCount = 0,
  timeAgo,
  createdAt,
  status,
  project,
}: TaskCardProps) {
  const { data: session } = useSession();
  const user = session?.user as any;
  const isMentor = user?.role === "mentor" || user?.role === "admin";
  const queryClient = useQueryClient();
  const { showAlert, showConfirm } = useAlert();

  const [isLiked, setIsLiked] = useState(isLikedByMe);
  const [likes, setLikes] = useState(likesCount);
  const [showBigHeart, setShowBigHeart] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState(caption);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const isAuthor = user?.id === author.id;
  const isProjectManager = project?.managerId && project.managerId === user?.id;
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    setLikes(likesCount);
    setIsLiked(isLikedByMe);
  }, [likesCount, isLikedByMe]);

  const [localReview, setLocalReview] = useState(review);
  const [localStatus, setLocalStatus] = useState(status || "pending");

  useEffect(() => {
    setLocalReview(review);
    setLocalStatus(status || "pending");
  }, [review, status]);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewGrade, setReviewGrade] = useState(review ? review.grade : 0);
  const [reviewComment, setReviewComment] = useState(
    review ? review.comment : "",
  );

  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentContent, setCommentContent] = useState("");

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const [showMenu, setShowMenu] = useState(false);

  const urls = mediaUrls.length > 0 ? mediaUrls : [mediaUrl];

  const {
    data: comments = [],
    refetch: refetchComments,
    isFetching: commentsLoading,
  } = useQuery({
    queryKey: ["comments", id],
    queryFn: async () => {
      const res = await getComments(id);
      return res.success ? res.data : [];
    },
    enabled: isCommentModalOpen,
  });

  const getDisplayNames = () => {
    if (!collaborators || collaborators.length === 0) return author.name;
    const names = [author.name, ...collaborators.map((c) => c.name)];
    if (names.length <= 2) {
      return names.slice(0, -1).join(", ") + " dan " + names[names.length - 1];
    }
    return names.slice(0, 1).join(", ") + ` dan ${names.length - 1} lainnya`;
  };

  const likeMutation = useMutation({
    mutationFn: async () => toggleLike(id),
    onSuccess: (data) => {
      if (data.success) {
        setIsLiked(data.isLikedByMe ?? false);
        setLikes(data.likesCount);
      } else {
        showAlert({
          message: "Gagal menyukai postingan: " + data.error,
          type: "error",
        });
        // Revert optimistic update
        setIsLiked(isLikedByMe);
        setLikes(likesCount);
      }
    },
    onError: (err: any) => {
      showAlert({
        message: "Terjadi kesalahan jaringan: " + err.message,
        type: "error",
      });
      setIsLiked(isLikedByMe);
      setLikes(likesCount);
    },
  });

  const handleLike = () => {
    // Optimistic update
    const previousIsLiked = isLiked;
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);

    if (!isLiked) {
      setShowBigHeart(true);
    }

    likeMutation.mutate();
  };

  const handleDoubleClick = () => {
    if (!isLiked) {
      handleLike();
    } else {
      setShowBigHeart(true);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: projectTitle,
          text: caption,
          url: window.location.href,
        })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      showAlert({ message: "Tautan disalin ke clipboard!", type: "success" });
    }
  };

  const reviewMutation = useMutation({
    mutationFn: async ({
      grade,
      comment,
      status,
    }: {
      grade: number;
      comment: string;
      status: "reviewed" | "rejected" | "pending";
    }) => submitReview(id, grade, comment, status),
    onSuccess: (data, variables) => {
      if (data.success) {
        if (variables.status === "pending") {
          setLocalReview(undefined);
          setLocalStatus("pending");
        } else {
          setLocalReview({
            grade: variables.grade,
            comment: variables.comment,
            mentorName: user?.name || "Mentor",
          });
          setLocalStatus(variables.status);
        }
        setIsReviewModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      } else {
        showAlert({
          message: "Gagal memberikan ulasan: " + data.error,
          type: "error",
        });
      }
    },
  });

  const handleEditSubmit = async () => {
    if (!editedCaption.trim() || editedCaption === caption) {
      setIsEditing(false);
      return;
    }
    setIsSubmittingEdit(true);
    const res = await updateTaskCaption(id, editedCaption);
    setIsSubmittingEdit(false);
    if (res.success) {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } else {
      showAlert({
        message: "Gagal mengedit caption: " + res.error,
        type: "error",
      });
    }
  };

  const approveMutation = useMutation({
    mutationFn: () => approveTask(id),
    onSuccess: (data) => {
      if (data.success) {
        setLocalStatus("approved");
        showAlert({ message: "Tugas berhasil di-approve", type: "success" });
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      } else {
        showAlert({ message: "Gagal menyetujui tugas: " + data.error, type: "error" });
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => deleteTask(id),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        showAlert({
          message: "Postingan berhasil dihapus",
          type: "success",
        });
      } else {
        showAlert({
          message: "Gagal menghapus postingan: " + data.error,
          type: "error",
        });
      }
    },
  });

  const handleSubmitReview = (action: "reviewed" | "rejected") => {
    if (action === "reviewed" && !reviewGrade) {
      showAlert({
        message: "Nilai harus diisi untuk menerima postingan",
        type: "error",
      });
      return;
    }
    if (!reviewComment.trim()) {
      showAlert({
        message: "Catatan atau deskripsi evaluasi harus diisi",
        type: "error",
      });
      return;
    }
    reviewMutation.mutate({
      grade: action === "rejected" ? 0 : reviewGrade,
      comment: reviewComment,
      status: action,
    });
  };

  const commentMutation = useMutation({
    mutationFn: async () => addComment(id, commentContent),
    onSuccess: (data) => {
      if (data.success) {
        setCommentContent("");
        refetchComments();
      } else {
        showAlert({
          message: "Gagal menambahkan komentar: " + data.error,
          type: "error",
        });
      }
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    commentMutation.mutate();
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 100;
  const shouldTruncate = caption.length > maxLength;
  const displayedCaption =
    isExpanded || !shouldTruncate
      ? caption
      : `${caption.substring(0, maxLength)}...`;

  return (
    <>
      <Card
        className={`mb-6 overflow-hidden ${localStatus === "rejected" ? "border-2 border-red-600" : "border-none"} shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white transition-all rounded-3xl snap-center snap-always`}
      >
        <CardHeader className="flex flex-row items-center gap-3 px-4 pb-3 py-0">
          <div className="flex -space-x-3">
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100 relative z-30">
              <AvatarImage src={author.image} alt={author.name} />
              <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {collaborators.slice(0, 2).map((collab, i) => (
              <Avatar
                key={i}
                className={`h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100 relative ${
                  i === 0 ? "z-20" : "z-10"
                }`}
              >
                <AvatarImage src={collab.image} alt={collab.name} />
                <AvatarFallback>{collab.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <div className="flex flex-col flex-1">
            <p className="text-sm font-bold text-slate-900 leading-none truncate flex items-center gap-2">
              {getDisplayNames()}
            </p>
            <p className="text-xs text-slate-500 mt-1 font-medium truncate">
              {projectTitle} • {timeAgo}
            </p>
          </div>

          {/* Menu Dropdown */}
          {(isMentor || isAuthor || isAdmin || (localStatus === "reviewed" && isProjectManager)) && (
            <div className="relative ml-2">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 overflow-hidden transform origin-top-right transition-all">
                    {isMentor && (
                      <button
                        onClick={() => {
                          setIsReviewModalOpen(true);
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Star className="w-4 h-4 text-amber-500" /> Beri Ulasan
                      </button>
                    )}

                    {isMentor && localStatus === "rejected" && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          reviewMutation.mutate({
                            grade: 0,
                            comment: "",
                            status: "pending",
                          });
                        }}
                        disabled={reviewMutation.isPending}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Undo2 className="w-4 h-4 text-blue-500" /> Kembalikan
                        ke Pending
                      </button>
                    )}

                    {localStatus === "reviewed" && (isAdmin || isProjectManager) && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          showConfirm({
                            message: "Approve tugas ini? Tugas yang sudah di-approve tidak bisa diubah statusnya.",
                            onConfirm: () => approveMutation.mutate(),
                          });
                        }}
                        disabled={approveMutation.isPending}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50 flex items-center gap-2"
                      >
                        <Star className="w-4 h-4 text-emerald-600 fill-current" /> Approve Tugas
                      </button>
                    )}

                    {isAuthor && (
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Edit3 className="w-4 h-4 text-blue-500" /> Edit Caption
                      </button>
                    )}

                    {user?.role === "admin" && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          showConfirm({
                            message: "Hapus postingan ini?",
                            type: "error",
                            onConfirm: () => deleteMutation.mutate(),
                          });
                        }}
                        disabled={deleteMutation.isPending}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />{" "}
                        {deleteMutation.isPending
                          ? "Menghapus..."
                          : "Hapus Postingan"}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </CardHeader>

        <div
          className="relative w-full overflow-hidden group cursor-pointer bg-black"
          onDoubleClick={handleDoubleClick}
        >
          {/* Main Media Carousel extracted to component */}
          <div
            className={`w-full h-full ${localStatus === "rejected" ? "grayscale opacity-90" : ""}`}
          >
            <MediaCarousel
              urls={urls}
              mediaType={mediaType}
              activeSlide={activeSlide}
              onActiveSlideChange={setActiveSlide}
            />
          </div>

          {localStatus === "rejected" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="bg-red-600 text-white font-black text-2xl md:text-3xl tracking-widest px-60 py-2 uppercase rotate-[-35deg] shadow-2xl rounded-sm flex flex-col items-center">
                REJECTED
                <span className="text-xs tracking-normal font-bold uppercase mt-1 text-red-100">
                  Need Revision
                </span>
              </div>
            </div>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-4 right-4 z-20 text-white/70 hover:text-white p-2 rounded-full bg-black/20 hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100"
          >
            <Maximize2 className="w-5 h-5" />
          </button>

          {/* Double Click Heart Animation */}
          <AnimatePresence>
            {showBigHeart && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1.2 }}
                exit={{ opacity: 0, scale: 1 }}
                onAnimationComplete={() =>
                  setTimeout(() => setShowBigHeart(false), 800)
                }
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
              >
                <Heart className="w-28 h-28 text-white fill-white drop-shadow-2xl opacity-90" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <CardContent className="px-4 pt-3 py-0">
          <div className="flex items-center gap-4 mb-3">
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={handleLike}
              className="focus:outline-none flex items-center gap-1.5"
            >
              <Heart
                className={`w-7 h-7 transition-colors ${isLiked && isLikedByMe ? "fill-red-500 text-red-500" : "text-slate-800 hover:text-slate-600"}`}
              />
              {likes > 0 && (
                <span className="text-sm font-bold text-slate-700">
                  {likes}
                </span>
              )}
            </motion.button>
            <button
              onClick={() => setIsCommentModalOpen(true)}
              className="focus:outline-none transition-colors"
            >
              <MessageCircle
                className={`w-7 h-7 ${commentsCount > 0 ? "text-blue-500 fill-blue-500" : "text-slate-800 hover:text-slate-600"}`}
              />
            </button>
            <button
              onClick={handleShare}
              className="focus:outline-none text-slate-800 hover:text-slate-600 transition-colors"
            >
              <Share2 className="w-6 h-6" />
            </button>

            <div className="flex-1"></div>

            <div
              className={`flex items-center gap-0.5 ${isMentor ? "cursor-pointer hover:opacity-80" : ""}`}
              onClick={() => (isMentor ? setIsReviewModalOpen(true) : null)}
              title={isMentor ? "Beri ulasan" : ""}
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const rating5 = localReview ? localReview.grade / 20 : 0;

                if (rating5 >= star) {
                  return (
                    <Star
                      key={star}
                      className="w-5 h-5 fill-amber-500 text-amber-500"
                    />
                  );
                } else {
                  return <Star key={star} className="w-5 h-5 text-slate-300" />;
                }
              })}
            </div>
          </div>

          <div className="text-sm text-slate-800 leading-relaxed">
            <span className="font-bold mr-2 text-slate-900">{author.name}</span>
            {isEditing ? (
              <div className="mt-2 space-y-2">
                <Textarea
                  value={editedCaption}
                  onChange={(e) => setEditedCaption(e.target.value)}
                  className="w-full min-h-[80px] text-sm resize-none"
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedCaption(caption);
                    }}
                    disabled={isSubmittingEdit}
                    className="h-7 text-xs"
                  >
                    Batal
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleEditSubmit}
                    disabled={isSubmittingEdit}
                    className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmittingEdit ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              </div>
            ) : (
              <span>
                {displayedCaption}
                {shouldTruncate && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-blue-400 font-semibold ml-1 hover:underline focus:outline-none"
                  >
                    {isExpanded ? "less" : "read more"}
                  </button>
                )}
              </span>
            )}
          </div>
        </CardContent>

        {localReview && localStatus !== "rejected" && (
          <div className={`p-4 relative overflow-hidden border-t ${localStatus === "approved" ? "bg-emerald-50/50 border-emerald-100/50" : "bg-amber-50/50 border-amber-100/50"}`}>
            {/* Dekorasi halus */}
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none ${localStatus === "approved" ? "bg-emerald-100/30" : "bg-amber-100/30"}`} />

            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg border ${localStatus === "approved" ? "bg-emerald-100 border-emerald-200/50" : "bg-amber-100 border-amber-200/50"}`}>
                  {localStatus === "approved" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Star className="w-4 h-4 text-amber-600 fill-amber-500" />}
                </div>
                <h4 className="font-bold text-slate-800 text-sm">
                  {localReview.mentorName}{" "}
                  <span className="text-slate-500 font-medium ml-1">
                    {localStatus === "approved" ? "telah disetujui (Approved)" : "mengulas:"}
                  </span>
                </h4>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-black tracking-tight ${localStatus === "approved" ? "text-emerald-500" : "text-amber-500"}`}>
                  {localReview.grade}
                </span>
                <span className="text-slate-400 font-bold text-sm">/100</span>
              </div>
            </div>

            {localReview.comment && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="overflow-hidden relative z-10"
              >
                <div className={`bg-white/60 backdrop-blur-sm rounded-xl p-3 border shadow-sm mt-1 ${localStatus === "approved" ? "border-emerald-100" : "border-amber-100"}`}>
                  <p className="text-sm text-slate-700 italic">
                    {localReview.comment}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {localStatus === "rejected" && localReview && (
          <div className="bg-red-50/50 border-t border-red-100/50 p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-100/30 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2">
                <div className="bg-red-500 p-1.5 rounded-lg border border-red-200/50">
                  <AlertCircle className="w-4 h-4 text-red-100" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">
                  {localReview.mentorName}{" "}
                  <span className="text-slate-500 font-medium ml-1">
                    menolak post ini:
                  </span>
                </h4>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="overflow-hidden relative z-10"
            >
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-red-100 shadow-sm mt-1">
                <p className="text-sm text-slate-700 italic">
                  {localReview.comment}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </Card>

      {/* Review Form Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Beri Ulasan Tugas</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="grade">
                Nilai / Rating (1-100){" "}
                <span className="text-slate-400 font-normal">
                  (Opsional jika menolak)
                </span>
              </Label>
              <Input
                id="grade"
                type="number"
                min="1"
                max="100"
                value={reviewGrade || ""}
                onChange={(e) => setReviewGrade(Number(e.target.value))}
                className="w-full"
                placeholder="Contoh: 85"
              />
              <p className="text-xs text-slate-500 pt-1">
                Nilai akan dikonversi menjadi bintang. (cth: 80-100 = 5 bintang)
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Label htmlFor="comment">Catatan / Deskripsi Evaluasi</Label>
              <Textarea
                id="comment"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full min-h-[100px]"
                placeholder="Tulis ulasan atau catatan perbaikan di sini..."
              />
            </div>
          </div>

          <DialogFooter className="pt-2 sm:justify-between flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setIsReviewModalOpen(false)}
            >
              Batal
            </Button>
            <div className="flex w-full sm:w-auto gap-2">
              <Button
                type="button"
                disabled={reviewMutation.isPending}
                variant="destructive"
                className="flex-1 sm:flex-none"
                onClick={() => handleSubmitReview("rejected")}
              >
                Tolak
              </Button>
              <Button
                type="button"
                disabled={reviewMutation.isPending}
                variant="default"
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
                onClick={() => handleSubmitReview("reviewed")}
              >
                Terima & Nilai
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comment Modal */}
      <Dialog open={isCommentModalOpen} onOpenChange={setIsCommentModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl flex flex-col max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Komentar</DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 overflow-y-auto px-1 py-4 border-y border-slate-100 min-h-[200px]">
            {commentsLoading ? (
              <div className="text-center text-sm text-slate-500 my-4">
                Memuat komentar...
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center text-sm text-slate-500 my-4">
                Belum ada komentar. Jadilah yang pertama!
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment: any) => (
                  <div key={comment._id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.authorId?.image} />
                      <AvatarFallback>
                        {comment.authorId?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-slate-50 rounded-xl rounded-tl-none p-3 relative group">
                      <p className="text-xs font-bold text-slate-900 mb-0.5">
                        {comment.authorId?.name}
                      </p>
                      <p className="text-sm text-slate-700">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <form onSubmit={handleSubmitComment} className="mt-2 flex gap-2">
            <Input
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Tulis komentar..."
              className="flex-1"
              required
            />
            <Button
              type="submit"
              disabled={commentMutation.isPending || !commentContent.trim()}
            >
              {commentMutation.isPending ? "Kirim..." : "Kirim"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 z-50 text-white/70 hover:text-white p-2 rounded-full bg-black/20 hover:bg-black/50 transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex-1 w-full h-full flex flex-col justify-center items-center relative">
              <MediaCarousel
                urls={urls}
                mediaType={mediaType}
                activeSlide={activeSlide}
                onActiveSlideChange={setActiveSlide}
                isFs={true}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
