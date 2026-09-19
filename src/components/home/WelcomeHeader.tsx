"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMemberStreaks } from "@/lib/actions/explore";
import { motion } from "framer-motion";
import { Flame, Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MemberStreakItem {
  id: string;
  name: string;
  nickname: string;
  username: string;
  image: string;
  totalTasks: number;
  totalCollabs: number;
  streakCount: number;
  hasTaskThisWeek: boolean;
  hasReflectionThisWeek: boolean;
}

const DUMMY_MEMBERS: MemberStreakItem[] = [];

export default function WelcomeHeader() {
  const { data: members = [] } = useQuery({
    queryKey: ["explore", "streaks", ""],
    queryFn: () => getMemberStreaks(""),
    staleTime: 60 * 1000,
  });

  const BATCH_SIZE = 8;
  const [visibleCount, setVisibleCount] = useState(10);
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Sort: Active streaks first -> Has reflection this week -> Most tasks/collabs -> Alphabetical by name
  const sortedMembers = useMemo(() => {
    if (!members || members.length === 0) return DUMMY_MEMBERS;

    return [...members].sort((a: MemberStreakItem, b: MemberStreakItem) => {
      // 1. Active streaks (highest streak first)
      if ((b.streakCount || 0) !== (a.streakCount || 0)) {
        return (b.streakCount || 0) - (a.streakCount || 0);
      }

      // 2. Has reflection this week
      const bRef = b.hasReflectionThisWeek ? 1 : 0;
      const aRef = a.hasReflectionThisWeek ? 1 : 0;
      if (bRef !== aRef) {
        return bRef - aRef;
      }

      // 3. Most tasks + collabs
      const totalB = (b.totalTasks || 0) + (b.totalCollabs || 0);
      const totalA = (a.totalTasks || 0) + (a.totalCollabs || 0);
      if (totalB !== totalA) {
        return totalB - totalA;
      }

      // 4. Alphabetical by name
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [members]);

  const displayMembers = sortedMembers.slice(0, visibleCount);
  const hasMore = visibleCount < sortedMembers.length;

  // Lazy loading via IntersectionObserver on the sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = containerRef.current;
    if (!sentinel || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) =>
            Math.min(prev + BATCH_SIZE, sortedMembers.length),
          );
        }
      },
      {
        root: container,
        rootMargin: "0px 160px 0px 0px", // Pre-fetch before user reaches the edge
        threshold: 0.1,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sortedMembers.length, visibleCount]);

  // Fallback onScroll listener for containers where observer root margin might behave differently
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollLeft + target.clientWidth >= target.scrollWidth - 140) {
      if (visibleCount < sortedMembers.length) {
        setVisibleCount((prev) =>
          Math.min(prev + BATCH_SIZE, sortedMembers.length),
        );
      }
    }
  };

  const hasAnyReflection = useMemo(() => {
    return members.some((m: MemberStreakItem) => m.hasReflectionThisWeek);
  }, [members]);

  const getRankRing = (member: MemberStreakItem) => {
    if (member.hasReflectionThisWeek) {
      return "bg-blue-600 p-[2.5px] shadow-sm"; // Biru jika ada refleksi pekan ini
    }
    return "bg-slate-200 p-[2.5px]"; // Slate jika belum ada refleksi
  };

  return (
    <div className="px-5 pt-4 pb-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h1 className="text-[30px]  font-black tracking-tight leading-tight">
          Welcome to <span className="text-blue-600">Jaz Academy</span>
        </h1>
        <p className="text-lg text-slate-500 font-medium mt-0.5 ms-0.5">
          Let&apos;s make something amazing
        </p>
      </motion.div>

      {/* Link to Reflections Feed if any reflection exists */}
      {hasAnyReflection && (
        <div className="flex items-center justify-end mt-4 -mb-3 px-0.5">
          <Link
            href="/reflections"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors group select-none"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
            <span>Check Reflections Feed</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      )}

      {/* Avatars Carousel / Row */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex items-start gap-2 sm:gap-3 mt-6 overflow-x-auto scrollbar-hide -my-1 scroll-smooth"
      >
        {displayMembers.map((member) => {
          const shortName = member.name.split(" ")[0];

          return (
            <Link
              href={`/user/${member.id}`}
              key={member.id}
              className="shrink-0"
            >
              {/* Increased wrapper width by ~10%: 64px -> 70px, 72px -> 80px */}
              <div className="flex flex-col items-center gap-1.5 w-[70px] sm:w-[80px] cursor-pointer select-none group">
                <div className="relative">
                  {/* Avatar Outer Ring: increased size by ~10%: 58px -> 64px, 64px(w-16) -> 70px */}
                  <div
                    className={`w-[64px] h-[64px] sm:w-[70px] sm:h-[70px] rounded-full transition-all duration-300 ${getRankRing(member)}`}
                    title={
                      member.hasReflectionThisWeek
                        ? "✨ Ada refleksi pekan ini"
                        : "💤 Belum ada refleksi pekan ini"
                    }
                  >
                    {/* border-[3px] border-white adds the visual gap between the blue border and the pic */}
                    <Avatar className="w-full h-full rounded-full border-[3px] border-white bg-white">
                      <AvatarImage
                        src={member.image}
                        alt={member.name}
                        className="object-cover w-full h-full"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs font-bold">
                        {member.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Fire Badge Icon - Menyala jika di pekan ini ada task */}
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 z-20 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                      member.hasTaskThisWeek
                        ? "bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/50 animate-pulse"
                        : "bg-slate-200 text-slate-400 shadow-sm opacity-90"
                    }`}
                    title={
                      member.hasTaskThisWeek
                        ? `🔥 Aktif pekan ini (${member.streakCount} streak)`
                        : "💤 Belum ada tugas pekan ini"
                    }
                  >
                    <Flame
                      className={`w-3 h-3 ${
                        member.hasTaskThisWeek ? "fill-current" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* User Name below the avatar */}
                <span className="text-xs sm:text-[13px] font-semibold text-slate-700 truncate max-w-full text-center tracking-tight">
                  {member.username || shortName}
                </span>
              </div>
            </Link>
          );
        })}

        {/* Sentinel loader for progressive lazy loading */}
        {hasMore && (
          <div
            ref={sentinelRef}
            className="shrink-0 flex flex-col items-center justify-center gap-1.5 w-[70px] sm:w-[80px] h-[90px] text-slate-400"
          >
            <div className="w-[52px] h-[52px] rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50/50">
              <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-600 rounded-full animate-spin" />
            </div>
            <span className="text-[10px] font-medium text-slate-400">
              Lainnya...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
