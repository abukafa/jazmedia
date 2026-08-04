"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Heart,
  Bell,
  Star,
  Play,
  MapPin,
  Share2,
  Compass,
} from "lucide-react";
import { DUMMY_BLOGS } from "@/lib/data/blogs";
import { motion } from "framer-motion";

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const blog =
    DUMMY_BLOGS.find((b) => b.id === id) ||
    DUMMY_BLOGS[0] ||
    null;

  const [isFav, setIsFav] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (!blog) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center p-4">
        <p className="text-slate-500 font-semibold">Artikel tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] pb-24 pt-4 px-5 sm:px-6 max-w-md mx-auto">
      {/* Top Header - < (Left) | Heart & Bell (Right) */}
      <div className="flex items-center justify-between py-3">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-white/80 text-slate-800 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFav(!isFav)}
            className="p-2 rounded-full hover:bg-white/80 text-slate-800 transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${
                isFav ? "fill-current text-rose-500" : "text-slate-700"
              }`}
            />
          </button>
          <button className="p-2 -mr-2 rounded-full hover:bg-white/80 text-slate-800 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Header Titles (pic_1 style) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mt-2"
      >
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          {blog.subtitle}
        </p>
        <h1 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight leading-tight mt-0.5">
          {blog.welcomeTitle}
        </h1>

        {/* Star Rating & Review line */}
        <div className="flex items-center gap-1.5 mt-2 text-xs sm:text-sm">
          <Star className="w-4 h-4 fill-current text-amber-500" />
          <span className="font-bold text-indigo-600">{blog.rating}</span>
          <span className="text-slate-500 font-medium">
            ({blog.reviewsCount} Review)
          </span>
        </div>
      </motion.div>

      {/* Hero Photo with center sleek play overlay */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative aspect-[16/11] w-full rounded-3xl overflow-hidden shadow-[0_10px_30px_rgb(0,0,0,0.08)] my-5 bg-slate-200 group"
      >
        <img
          src={blog.image}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />

        {/* Center Play Overlay (matching pic_1) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/35 backdrop-blur-md flex items-center justify-center shadow-xl border border-white/40 group-hover:scale-110 transition-transform cursor-pointer">
            <Play className="w-7 h-7 text-white fill-current ml-1" />
          </div>
        </div>
      </motion.div>

      {/* Location Section / Subheading */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.18 }}
        className="mt-4"
      >
        <p className="text-xs font-medium text-slate-500">Located in</p>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
          {blog.locationTitle}
        </h2>

        {/* Address with MapPin Icon */}
        <div className="flex items-center text-xs font-semibold text-slate-600 mt-1 mb-3">
          <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
          <span>{blog.locationAddress}</span>
        </div>

        {/* Excerpt / Content with ...Read more toggle */}
        <div className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
          {expanded ? (
            <>
              <p className="mb-3">{blog.content}</p>
              <button
                onClick={() => setExpanded(false)}
                className="font-bold text-indigo-600 hover:underline"
              >
                Read less
              </button>
            </>
          ) : (
            <p>
              {blog.excerpt}{" "}
              <button
                onClick={() => setExpanded(true)}
                className="font-bold text-indigo-600 hover:underline inline ml-1"
              >
                ...Read more
              </button>
            </p>
          )}
        </div>
      </motion.div>

      {/* Location Bottom Heading & Info Card (matching pic_1 bottom) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25 }}
        className="mt-6"
      >
        <h3 className="text-base font-bold text-slate-900 mb-3">Location</h3>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                {blog.locationAddress}
              </p>
              <p className="text-[11px] text-slate-500">
                Open in Maps • {blog.distanceOrMeta}
              </p>
            </div>
          </div>
          <button className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors">
            View Map
          </button>
        </div>
      </motion.div>
    </div>
  );
}
