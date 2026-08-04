"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Bell,
  Search,
  SlidersHorizontal,
  Heart,
  Star,
  Play,
} from "lucide-react";
import { DUMMY_BLOGS, BlogPost } from "@/lib/data/blogs";
import { motion } from "framer-motion";

export default function BlogsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredBlogs = DUMMY_BLOGS.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.locationAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f4f7fb] pb-20 pt-4 px-4 sm:px-6 max-w-md mx-auto">
      {/* Top Header - < Recommended Bell */}
      <div className="flex items-center justify-between py-3">
        <button
          onClick={() => router.push("/")}
          className="p-2 -ml-2 rounded-full hover:bg-white/80 text-slate-800 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Recommended
        </h1>
        <button
          onClick={() => {}}
          className="p-2 -mr-2 rounded-full hover:bg-white/80 text-slate-800 transition-colors"
        >
          <Bell className="w-5 h-5" />
        </button>
      </div>

      {/* Search and Filter Row */}
      <div className="flex items-center gap-2.5 mt-3 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Discover a city"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-100 shadow-sm rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>
        <button className="bg-[#4f46e5] text-white p-3 rounded-2xl shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition-colors shrink-0">
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Blog Cards Feed (pic_2 style) */}
      <div className="flex flex-col gap-5">
        {filteredBlogs.map((blog, idx) => {
          const isFav = !!favorites[blog.id];

          return (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.07 }}
              key={blog.id}
              onClick={() => router.push(`/blogs/${blog.id}`)}
              className="bg-white rounded-[28px] p-3 sm:p-4 shadow-[0_6px_25px_rgb(0,0,0,0.04)] cursor-pointer hover:shadow-lg transition-shadow select-none group"
            >
              {/* Image Container with Heart button & Play triangle */}
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-100">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Favorite Heart Button */}
                <button
                  onClick={(e) => toggleFavorite(e, blog.id)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm text-indigo-600 hover:scale-110 transition-transform z-10"
                >
                  <Heart
                    className={`w-4 h-4 ${isFav ? "fill-current text-indigo-600" : ""}`}
                  />
                </button>

                {/* Center Sleek Translucent Play Overlay (matching pic_2) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/40 group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-white fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Title & Distance */}
              <div className="mt-3.5 px-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {blog.title}
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  {blog.distanceOrMeta}
                </p>
              </div>

              {/* Bottom Row - Start from $Price + Star Rating Badge */}
              <div className="mt-3.5 px-1 flex items-center justify-between pb-0.5">
                <div className="text-xs text-slate-500 font-medium">
                  Start from{" "}
                  <span className="text-base font-black text-slate-900">
                    {blog.priceOrTag}
                  </span>
                </div>

                <div className="bg-[#4f46e5] text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm">
                  <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                  <span>{blog.rating}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
