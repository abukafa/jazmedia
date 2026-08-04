"use client";

import { useQuery } from "@tanstack/react-query";
import { getMemberStreaks } from "@/lib/actions/explore";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MemberStreakItem {
  id: string;
  name: string;
  username: string;
  image: string;
  totalTasks: number;
  totalCollabs: number;
  streakCount: number;
  hasTaskThisWeek: boolean;
}

const DUMMY_MEMBERS: MemberStreakItem[] = [
  {
    id: "user-1",
    name: "Alex",
    username: "alex_dev",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    totalTasks: 14,
    totalCollabs: 5,
    streakCount: 12,
    hasTaskThisWeek: true,
  },
  {
    id: "user-2",
    name: "Nadia",
    username: "nadia_ui",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    totalTasks: 10,
    totalCollabs: 3,
    streakCount: 8,
    hasTaskThisWeek: true,
  },
  {
    id: "user-3",
    name: "Sarah",
    username: "sarah_k",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    totalTasks: 7,
    totalCollabs: 2,
    streakCount: 5,
    hasTaskThisWeek: false,
  },
  {
    id: "user-4",
    name: "Marcus",
    username: "marcus_j",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    totalTasks: 4,
    totalCollabs: 1,
    streakCount: 3,
    hasTaskThisWeek: true,
  },
  {
    id: "user-5",
    name: "Alya",
    username: "alya_dsgn",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    totalTasks: 2,
    totalCollabs: 0,
    streakCount: 0,
    hasTaskThisWeek: false,
  },
];

export default function WelcomeHeader() {
  const { data: members = [] } = useQuery({
    queryKey: ["explore", "streaks", ""],
    queryFn: () => getMemberStreaks(""),
    staleTime: 60 * 1000,
  });

  // Sort descending by streak count, then fallback to dummy if DB has no members yet
  const sortedMembers: MemberStreakItem[] =
    members.length > 0
      ? [...members].sort(
          (a: MemberStreakItem, b: MemberStreakItem) =>
            b.streakCount - a.streakCount,
        )
      : DUMMY_MEMBERS;

  const displayMembers = sortedMembers.slice(0, 6);

  const getRankRing = (index: number) => {
    if (index === 0)
      return "bg-gradient-to-tr from-amber-400 via-yellow-500 to-orange-500 p-[2.5px] shadow-md shadow-amber-500/30";
    if (index === 1)
      return "bg-gradient-to-tr from-slate-300 via-blue-400 to-indigo-500 p-[2px]";
    if (index === 2)
      return "bg-gradient-to-tr from-orange-400 via-rose-400 to-pink-500 p-[2px]";
    return "bg-gradient-to-tr from-[#0a1931] via-blue-900 to-indigo-950 p-[2px]";
  };

  return (
    <div className="px-5 pt-4 pb-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h1 className="text-[32px] font-black tracking-tight leading-tight">
          Welcome to <span className="text-blue-600">Jaz Academy</span>
        </h1>
        <p className="text-lg text-slate-500 font-medium mt-0.5 ms-0.5">
          Let&apos;s make something amazing
        </p>
      </motion.div>

      {/* Avatars Carousel / Row sorted by streak ranking */}
      <div className="flex items-start gap-2 sm:gap-3 mt-6 overflow-x-auto scrollbar-hide -my-1">
        {displayMembers.map((member, index) => {
          const shortName = member.name.split(" ")[0];

          return (
            <Link
              href={`/user/${member.id}`}
              key={member.id}
              className="shrink-0"
            >
              <div className="flex flex-col items-center gap-1.5 w-[64px] sm:w-[72px] cursor-pointer select-none group">
                <div className="relative">
                  {/* Avatar Outer Ring with Rank Colors (+10% larger: w-[58px] sm:w-16) */}
                  <div
                    className={`w-[58px] h-[58px] sm:w-16 sm:h-16 rounded-full bg-white transition-all duration-300 ${getRankRing(
                      index,
                    )}`}
                  >
                    <Avatar className="w-full h-full rounded-full border border-white">
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
                  {shortName}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
