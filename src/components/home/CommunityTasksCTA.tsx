"use client";

import Link from "next/link";
import { ArrowRight, FolderKanban } from "lucide-react";
import { motion } from "framer-motion";

export default function CommunityTasksCTA() {
  return (
    <div className="px-5 my-5">
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full rounded-3xl p-5 bg-gradient-to-r from-[#0a1931] via-[#112d58] to-[#1e427d] text-white shadow-xl shadow-blue-950/20 relative overflow-hidden flex items-center justify-between"
      >
        {/* Background glow decoration */}
        <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-blue-500/15 blur-2xl pointer-events-none" />
        <div className="absolute -left-6 -top-6 w-28 h-28 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3.5 relative z-10 min-w-0 pr-2">
          <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/15">
            <FolderKanban className="w-5 h-5 text-blue-200" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm sm:text-base tracking-tight truncate">
              Community Projects &amp; Tasks
            </h3>
            <p className="text-xs text-blue-200/80 mt-0.5 truncate">
              Jelajahi &amp; kirim tugas terbaru
            </p>
          </div>
        </div>

        <Link
          href="/tasks"
          className="relative z-10 shrink-0 px-4 py-2.5 rounded-xl bg-white text-[#0a1931] font-bold text-xs shadow-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
        >
          <span>Lihat</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </motion.div>
    </div>
  );
}
