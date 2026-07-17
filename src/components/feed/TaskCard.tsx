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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MediaCarousel } from "./media/MediaCarousel";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  toggleLike,
  submitReview,
  addComment,
  getComments,
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
}: TaskCardProps) {
  const { data: session } = useSession();
  const user = session?.user as any;
  const isMentor = user?.role === "mentor" || user?.role === "admin";
  const queryClient = useQueryClient();

  const [isLiked, setIsLiked] = useState(isLikedByMe);
  const [likes, setLikes] = useState(likesCount);
  const [showBigHeart, setShowBigHeart] = useState(false);

  useEffect(() => {
    setLikes(likesCount);
    setIsLiked(isLikedByMe);
  }, [likesCount, isLikedByMe]);

  const [showReview, setShowReview] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewGrade, setReviewGrade] = useState(review ? review.grade : 0);
  const [reviewComment, setReviewComment] = useState(
    review ? review.comment : "",
  );

  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentContent, setCommentContent] = useState("");

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

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
        alert("Gagal menyukai postingan: " + data.error);
        // Revert optimistic update
        setIsLiked(isLikedByMe);
        setLikes(likesCount);
      }
    },
    onError: (err: any) => {
      alert("Terjadi kesalahan jaringan: " + err.message);
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
      alert("Tautan disalin ke clipboard!");
    }
  };

  const reviewMutation = useMutation({
    mutationFn: async () => submitReview(id, reviewGrade, reviewComment),
    onSuccess: (data) => {
      if (data.success) {
        setIsReviewModalOpen(false);
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      } else {
        alert("Gagal memberikan ulasan: " + data.error);
      }
    },
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    reviewMutation.mutate();
  };

  const commentMutation = useMutation({
    mutationFn: async () => addComment(id, commentContent),
    onSuccess: (data) => {
      if (data.success) {
        setCommentContent("");
        refetchComments();
      } else {
        alert("Gagal menambahkan komentar: " + data.error);
      }
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;
    commentMutation.mutate();
  };

  return (
    <>
      <Card className="mb-6 overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white transition-all rounded-3xl">
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
            <p className="text-sm font-bold text-slate-900 leading-none truncate">
              {getDisplayNames()}
            </p>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {projectTitle} • {timeAgo}
            </p>
          </div>
          {review && (
            <Badge
              variant="secondary"
              className="bg-amber-100 text-amber-800 hover:bg-amber-200 font-extrabold px-2 py-1 shadow-sm border border-amber-200/50"
            >
              <Star className="w-3.5 h-3.5 mr-1 fill-amber-500 text-amber-500" />
              {review.grade}
            </Badge>
          )}
        </CardHeader>

        <div
          className="relative w-full overflow-hidden group cursor-pointer bg-black"
          onDoubleClick={handleDoubleClick}
        >
          {/* Main Media Carousel extracted to component */}
          <MediaCarousel
            urls={urls}
            mediaType={mediaType}
            activeSlide={activeSlide}
            onActiveSlideChange={setActiveSlide}
          />

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
                const rating5 = review ? review.grade / 20 : 0;

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

          <p className="text-sm text-slate-800 leading-relaxed">
            <span className="font-bold mr-2 text-slate-900">{author.name}</span>
            {caption}
          </p>
        </CardContent>

        {review && (
          <div className="px-4 pb-0 mt-3">
            <button
              onClick={() => setShowReview(!showReview)}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              {showReview
                ? "Sembunyikan ulasan mentor"
                : "Lihat ulasan mentor..."}
            </button>

            <AnimatePresence>
              {showReview && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-xl relative shadow-inner">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-indigo-500 rounded-l-xl"></div>
                    <p className="text-xs font-bold text-slate-900 mb-1.5 flex items-center">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500 mr-1" />
                      {review.mentorName}{" "}
                      <span className="text-slate-500 font-medium ml-1">
                        mengulas:
                      </span>
                    </p>
                    <p className="text-sm text-slate-700 italic">
                      "{review.comment}"
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </Card>

      {/* Review Form Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Beri Ulasan Tugas</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Nilai / Rating (1-100)</Label>
              <Input
                id="grade"
                type="number"
                min="1"
                max="100"
                value={reviewGrade || ""}
                onChange={(e) => setReviewGrade(Number(e.target.value))}
                required
                className="w-full"
                placeholder="Contoh: 85"
              />
              <p className="text-xs text-slate-500">
                Nilai akan dikonversi menjadi bintang. (cth: 80-100 = 5 bintang,
                60-79 = 4 bintang, dll)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">Komentar / Deskripsi Evaluasi</Label>
              <Textarea
                id="comment"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                required
                className="w-full min-h-[100px]"
                placeholder="Tulis ulasan Anda di sini..."
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsReviewModalOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={reviewMutation.isPending}>
                {reviewMutation.isPending ? "Menyimpan..." : "Simpan Ulasan"}
              </Button>
            </DialogFooter>
          </form>
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
