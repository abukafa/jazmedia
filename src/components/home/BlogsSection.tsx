"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { getDirectMediaUrl } from "@/lib/utils/media";
import { getBlogs, likeBlog } from "@/lib/actions/blog";
import { Blog } from "@/lib/types";

export default function BlogsSection() {
  const router = useRouter();
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const { data: blogItems = [], isLoading } = useQuery<Blog[]>({
    queryKey: ["home", "blogs"],
    queryFn: async () => {
      const res = await getBlogs({ limit: 5 });
      return res?.success && res.data ? res.data : [];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="my-6 px-5 flex justify-center">
        <div className="w-full h-[180px] rounded-3xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  if (blogItems.length === 0) {
    return null;
  }

  const toggleLike = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
    if (!likedPosts[id]) {
      await likeBlog(id);
    }
  };

  return (
    <div className="my-3">
      <div className="flex items-center justify-between px-5 mb-1 py-2">
        <h2 className="text-xl sm:text-2xl font-bold text-blue-600 tracking-tight">
          Blogs &amp; Insights
        </h2>
        <Link
          href="/blogs"
          className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1 bg-slate-100 hover:bg-blue-50 px-2.5 py-1 rounded-full"
          title="Lihat semua artikel blog"
        >
          View All
        </Link>
      </div>

      {/* Vertical Feed Container (Applied everywhere now: mobile, tablet, PC) */}
      <div className="flex flex-col gap-4 px-5 py-2 pb-4">
        {blogItems.map((blog, index) => {
          const isLiked = !!likedPosts[blog.id || blog._id];

          return (
            <div
              key={`${blog.id || blog._id}-${index}`}
              onClick={() => router.push(`/blogs/${blog.slug || blog.id}`)}
              className="w-full cursor-pointer rounded-xl mb-0"
            >
              <div className="flex flex-col h-auto bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm transition-shadow hover:shadow-md">
                {/* Landscape Image Header */}
                <div className="h-[180px] md:h-[220px] relative overflow-hidden bg-slate-100 group flex-shrink-0">
                  <img
                    src={getDirectMediaUrl(blog.image, "image")}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    {blog.category}
                  </div>

                  {/* Heart / Like Button */}
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={(e) => toggleLike(e, blog.id || blog._id)}
                    className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 backdrop-blur-md shadow-md flex items-center justify-center transition-colors ${
                      isLiked
                        ? "text-rose-600 bg-rose-50/95"
                        : "text-slate-400 hover:text-rose-500"
                    }`}
                    aria-label="Like post"
                  >
                    <Heart
                      className="w-4 h-4"
                      fill={isLiked ? "currentColor" : "none"}
                    />
                  </motion.button>

                  {/* Read time badge */}
                  <div className="absolute bottom-2.5 left-3 flex items-center gap-1 text-white/90 text-[11px] font-medium bg-black/30 backdrop-blur-sm px-2.5 py-0.5 rounded-full">
                    <Clock className="w-3 h-3" />
                    <span>{blog.readTime || "4 min read"}</span>
                  </div>
                </div>

                {/* Content Footer */}
                <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between bg-white">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base md:text-lg text-slate-900 leading-snug line-clamp-2 md:line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-500 line-clamp-2 md:line-clamp-3 mt-1.5 md:mt-2 leading-relaxed">
                      {blog.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100/80 mt-2">
                    <span className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline cursor-pointer">
                      read more
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>

                    <span className="text-[11px] font-medium text-slate-400">
                      {blog.date}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
