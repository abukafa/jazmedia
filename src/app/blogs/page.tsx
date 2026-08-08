"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Bell,
  Search,
  SlidersHorizontal,
  Heart,
  Star,
  Plus,
  Loader2,
  Clock,
  Edit,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import { getBlogs, getBlogCategories, deleteBlog } from "@/lib/actions/blog";
import { getDirectMediaUrl } from "@/lib/utils/media";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useAlert } from "@/components/providers/AlertProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function BlogsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { showAlert, showConfirm } = useAlert();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [showFilter, setShowFilter] = useState(false);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchCategories() {
      const res = await getBlogCategories();
      if (res.success && res.data) {
        setCategories(["All", ...res.data]);
      } else {
        setCategories([
          "All",
          "Creative",
          "Tips",
          "Technology",
          "Community",
          "Journal",
          "Design",
        ]);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchBlogsData() {
      setIsLoading(true);
      const res = await getBlogs({
        category: selectedCategory === "All" ? undefined : selectedCategory,
        query: searchQuery,
      });
      if (res && res.data) {
        setBlogs(res.data);
        const initialFavs: Record<string, boolean> = {};
        res.data.forEach((b: any) => {
          if (b.isLikedByMe) {
            initialFavs[b.id || b._id] = true;
          }
        });
        setFavorites(initialFavs);
      }
      setIsLoading(false);
    }

    fetchBlogsData();
  }, [selectedCategory, searchQuery]);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    showConfirm({
      title: "Hapus Artikel",
      message:
        "Apakah Anda yakin ingin menghapus artikel ini? Tindakan ini tidak dapat dibatalkan.",
      type: "warning",
      onConfirm: async () => {
        setIsDeleting(id);
        const res = await deleteBlog(id);
        if (res.success) {
          setBlogs((prev) => prev.filter((b) => b.id !== id));
          showAlert({
            title: "Berhasil",
            message: "Artikel berhasil dihapus.",
            type: "success",
          });
        } else {
          showAlert({
            title: "Gagal",
            message: res.error || "Gagal menghapus artikel.",
            type: "error",
          });
        }
        setIsDeleting(null);
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] pb-24 pt-4 px-4 sm:px-6 max-w-md mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between py-3">
        <button
          onClick={() => router.push("/")}
          className="p-2 -ml-2 rounded-full hover:bg-white/80 text-slate-800 transition-colors cursor-pointer"
          title="Kembali ke beranda"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Artikel &amp; Wawasan
        </h1>

        <div className="flex items-center gap-1">
          <Link
            href={session ? "/blogs/create" : "/login"}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold flex items-center gap-1 shadow-sm transition-transform hover:scale-105 active:scale-95"
            title="Tulis artikel baru"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tulis</span>
          </Link>
        </div>
      </div>

      {/* Search and Filter Row */}
      <div className="flex items-center gap-2.5 mt-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul atau topik..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`p-3 rounded-2xl shadow-sm transition-colors cursor-pointer ${showFilter ? "bg-blue-50 text-blue-600" : "bg-white text-slate-700 hover:bg-slate-50"}`}
          aria-label="Filter"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Categories Horizontal Scroll */}
      <div
        className={`flex items-center gap-2 overflow-x-auto scrollbar-hide pb-3 mb-1 -mx-4 px-4 ${showFilter ? "" : "hidden"}`}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Blog Cards Feed */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-semibold">Memuat daftar artikel...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="py-20 text-center text-slate-400">
          <p className="text-sm font-semibold">Tidak ada artikel ditemukan</p>
          <p className="text-xs mt-1">Coba kata kunci pencarian yang lain</p>
        </div>
      ) : (
        <div className="space-y-4">
          {blogs.map((blog) => {
            const isFav = !!favorites[blog.id];
            return (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => router.push(`/blogs/${blog.slug || blog.id}`)}
                className="bg-white rounded-[26px] p-3 shadow-md shadow-slate-200/50 border border-slate-100 cursor-pointer group hover:shadow-xl transition-all duration-300"
              >
                {/* Hero Image Container */}
                <div className="relative h-[180px] rounded-[20px] overflow-hidden bg-slate-100">
                  <img
                    src={getDirectMediaUrl(blog.image, "image")}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Top Left Tag */}
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    {blog.category}
                  </div>

                  {/* Top Right Favorite Heart */}
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={(e) => toggleFavorite(e, blog.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md shadow-md flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Heart
                      className="w-3.5 h-3.5"
                      fill={isFav ? "#f43f5e" : "none"}
                      color={isFav ? "#f43f5e" : "currentColor"}
                    />
                  </motion.button>

                  {/* Bottom Image Metadata */}
                  <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between text-white">
                    <p className="text-sm font-bold leading-snug drop-shadow-md line-clamp-2 pr-2">
                      {blog.title}
                    </p>

                    <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{blog.rating || 4.9}</span>
                    </div>
                  </div>
                </div>

                {/* Card Bottom Bar */}
                <div className="flex items-center justify-between px-2 pt-3 pb-1">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-7 h-7 ring-1 ring-white shadow-sm border border-slate-100">
                      <AvatarImage
                        src={blog.authorAvatar}
                        alt={blog.authorName}
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-[10px] font-bold">
                        {blog.authorName ? blog.authorName.charAt(0) : "T"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {blog.authorName || "Tim Jazmedia"}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 inline" />
                        {blog.readTime || "3 min read"} • {blog.date}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {session?.user &&
                    (blog.authorId === (session.user as any).id ||
                      (session.user as any).role === "admin") ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/blogs/edit/${blog.id}`);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Artikel"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, blog.id)}
                          disabled={isDeleting === blog.id}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Hapus Artikel"
                        >
                          {isDeleting === blog.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </>
                    ) : (
                      <span className="text-sm font-bold text-blue-400 group-hover:text-blue-600 mr-2">
                        Baca →
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
