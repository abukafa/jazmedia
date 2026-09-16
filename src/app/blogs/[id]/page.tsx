"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ChevronLeft,
  List,
  Star,
  Share2,
  Clock,
  Loader2,
  Calendar,
  Heart,
  MessageCircle,
  Send,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  getBlogById,
  likeBlog,
  getBlogComments,
  addBlogComment,
} from "@/lib/actions/blog";
import { getDirectMediaUrl } from "@/lib/utils/media";
import { useAlert } from "@/components/providers/AlertProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils/avatar";

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { showAlert } = useAlert();

  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [blog, setBlog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Like states
  const [isFav, setIsFav] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Comment states
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);

  useEffect(() => {
    async function fetchDetail() {
      if (!id) return;
      setIsLoading(true);
      const res = await getBlogById(id);
      if (res && res.data) {
        setBlog(res.data);
        setLikesCount(res.data.likes || 0);

        // check if liked by current user
        if (session?.user && res.data.likedBy) {
          const userId = (session.user as any).id;
          setIsFav(res.data.likedBy.includes(userId));
        }

        // fetch comments
        const commentsRes = await getBlogComments(res.data.id || res.data._id);
        if (commentsRes.success && commentsRes.data) {
          setComments(commentsRes.data);
          setCommentsCount(commentsRes.data.length);
        }
      }
      setIsLoading(false);
    }

    fetchDetail();
  }, [id, session]);

  const handleLike = async () => {
    if (!session?.user) {
      router.push("/login");
      return;
    }

    if (!blog) return;

    // Optimistic update
    setIsFav(!isFav);
    setLikesCount((prev) => (isFav ? Math.max(0, prev - 1) : prev + 1));

    const res = await likeBlog(blog.id || blog._id);
    if (res && res.success) {
      setLikesCount(res.likes || 0);
      setIsFav(res.isLiked || false);
    } else {
      // revert on failure
      setIsFav(isFav);
      setLikesCount((prev) => (isFav ? prev + 1 : Math.max(0, prev - 1)));
      showAlert({
        title: "Gagal",
        message: res?.error || "Gagal menyukai artikel.",
        type: "error",
      });
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      router.push("/login");
      return;
    }
    if (!newComment.trim() || !blog) return;

    setIsSubmitting(true);
    const res = await addBlogComment(blog.id || blog._id, newComment);
    setIsSubmitting(false);

    if (res.success && res.data) {
      setComments([res.data, ...comments]);
      setCommentsCount((prev) => prev + 1);
      setNewComment("");
    } else {
      showAlert({
        title: "Gagal",
        message: res.error || "Gagal menambahkan komentar.",
        type: "error",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] flex flex-col items-center justify-center p-4 gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-semibold">Memuat artikel...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] flex flex-col items-center justify-center p-4 gap-3">
        <p className="text-slate-600 font-semibold text-base">
          Artikel tidak ditemukan
        </p>
        <button
          onClick={() => router.push("/blogs")}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          Kembali ke Daftar Blog
        </button>
      </div>
    );
  }

  const isHtml =
    blog.content &&
    (blog.content.includes("<p>") ||
      blog.content.includes("<h1>") ||
      blog.content.includes("<h2>") ||
      blog.content.includes("<ul>") ||
      blog.content.includes("<img"));

  return (
    <div className="min-h-screen bg-[#f4f7fb] pb-24 pt-4 px-4 sm:px-6 max-w-md mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-white/80 text-slate-800 transition-colors cursor-pointer"
          title="Kembali"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-1.5">
          <LinkToBlogs router={router} />
        </div>
      </div>

      {/* Hero Image Container */}
      <div className="relative mt-2 h-[260px] sm:h-[280px] rounded-[30px] overflow-hidden bg-slate-900 shadow-lg shadow-slate-300/50 group">
        <img
          src={getDirectMediaUrl(blog.image, "image")}
          alt={blog.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

        {/* Bottom Hero Overlay */}
        <div className="absolute bottom-4 left-5 right-5 text-white space-y-1.5">
          <h1 className="text-lg sm:text-xl font-extrabold leading-snug tracking-tight drop-shadow-md line-clamp-2">
            {blog.title}
          </h1>

          <div className="flex items-center justify-between text-xs text-white/90">
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {blog.authorName || "Tim Jazmedia"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                {blog.readTime || "3 min read"}
              </span>
            </div>

            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full font-bold">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{blog.rating || 4.9}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-6 space-y-5 px-1">
        {/* Author & Share Row */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9 border-2 border-white shadow-md shadow-blue-500/20 ring-1 ring-slate-100">
              <AvatarImage src={blog.authorAvatar} alt={blog.authorName} />
              <AvatarFallback className="bg-blue-600 text-white text-xs font-extrabold">
                {getInitials(blog.authorName || "Tim Jazmedia")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs font-bold text-slate-900">
                {blog.authorName || "Tim Jazmedia"}
              </p>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 inline text-slate-400" />
                {blog.date || "4 Agustus 2026"}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: blog.title,
                  text: blog.excerpt,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Tautan artikel disalin!");
              }
            }}
            className="p-2 bg-white hover:bg-slate-50 text-slate-600 rounded-xl shadow-sm border border-slate-200/60 transition-colors cursor-pointer"
            title="Bagikan"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Full Article Body */}
        <div className="text-slate-800 text-sm sm:text-base leading-relaxed">
          {isHtml ? (
            <div
              className="prose prose-sm sm:prose-base prose-blue max-w-none space-y-4"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          ) : (
            <p className="whitespace-pre-line leading-relaxed">
              {blog.content}
            </p>
          )}
        </div>
      </div>

      {/* Engagement Card (Like & Comments) */}
      <div className="mt-10 bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-6">
        {/* Stats Row */}
        <div className="flex items-center gap-6 pb-4 border-b border-slate-100">
          <button
            onClick={handleLike}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div
              className={`p-2.5 rounded-full transition-colors ${isFav ? "bg-rose-50" : "bg-slate-50 group-hover:bg-slate-100"}`}
            >
              <Heart
                className={`w-5 h-5 ${isFav ? "fill-rose-500 text-rose-500" : "text-slate-400 group-hover:text-rose-400"}`}
              />
            </div>
            <span className="text-sm font-bold text-slate-700">
              {likesCount} Suka
            </span>
          </button>

          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-full bg-slate-50">
              <MessageCircle className="w-5 h-5 text-slate-400" />
            </div>
            <span className="text-sm font-bold text-slate-700">
              {commentsCount} Komentar
            </span>
          </div>
        </div>

        {/* Comment List */}
        <div className="space-y-4 pt-2">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden flex items-center justify-center text-slate-500 font-bold text-xs">
                {comment.author.image ? (
                  <img
                    src={getDirectMediaUrl(comment.author.image, "image")}
                    alt={comment.author.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  comment.author.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 bg-slate-50 rounded-2xl rounded-tl-none p-3.5 border border-slate-100">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800">
                    {comment.author.name}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {new Date(comment.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed break-words whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}

          {comments.length === 0 && (
            <p className="text-center text-xs font-semibold text-slate-400 py-4">
              Belum ada komentar. Jadilah yang pertama!
            </p>
          )}
        </div>

        {/* Comment Input */}
        <form onSubmit={handleCommentSubmit} className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-700 font-bold text-xs overflow-hidden">
            {session?.user?.image ? (
              <img
                src={getDirectMediaUrl(session.user.image, "image")}
                alt="User"
                className="w-full h-full object-cover"
              />
            ) : (
              (session?.user?.name || "U").charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                session?.user
                  ? "Tulis komentar Anda..."
                  : "Login untuk menulis komentar..."
              }
              disabled={isSubmitting || !session?.user}
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white resize-none transition-all placeholder:text-slate-400 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
            />
            {session?.user ? (
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="absolute right-1 bottom-3 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition-colors cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="absolute right-2 bottom-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold cursor-pointer"
              >
                Login
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function LinkToBlogs({ router }: { router: any }) {
  return (
    <button
      onClick={() => router.push("/blogs")}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/80 hover:bg-white text-slate-700 rounded-full font-bold text-xs transition-colors cursor-pointer shadow-sm border border-slate-200/50"
      title="Daftar Blog"
    >
      <List className="w-3.5 h-3.5" />
      <span>Daftar Blog</span>
    </button>
  );
}
