"use client";

import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils/avatar";
import { Flame, Loader2 } from "lucide-react";

export interface StreakMember {
  id: string;
  name: string;
  image?: string;
  totalTasks?: number;
  totalCollabs?: number;
  streakCount?: number;
}

interface StreakListProps {
  streaks: StreakMember[];
  loading?: boolean;
}

export function StreakList({ streaks, loading }: StreakListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!streaks || streaks.length === 0) {
    return (
      <div className="p-8 mt-6 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mb-4">
          <Flame className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-sm font-bold text-slate-900">Belum Ada Streak</p>
        <p className="text-xs text-slate-500 mt-1">
          Belum ada member yang aktif.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {streaks.map((member) => (
        <Link key={member.id} href={`/user/${member.id}`}>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer mb-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 rounded-full border-2 border-slate-100">
                <AvatarImage src={member.image} />
                <AvatarFallback className="bg-slate-100 text-slate-500 font-bold">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-none mb-1">
                  {member.name}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {member.totalTasks || 0} Tasks • {member.totalCollabs || 0}{" "}
                  Collabs
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div
                className={`flex items-center px-2 py-1 rounded-full border ${
                  (member.streakCount || 0) > 0
                    ? "border-orange-100 bg-orange-100"
                    : "border-slate-200 bg-slate-100"
                } text-slate-700 font-bold text-[11px]`}
              >
                <Flame
                  className={`w-3.5 h-3.5 ${
                    (member.streakCount || 0) > 0
                      ? "text-orange-500 fill-current"
                      : "text-slate-400"
                  } mr-1`}
                />
                <span
                  className={`text-xs font-black ${
                    (member.streakCount || 0) > 0
                      ? "text-orange-600"
                      : "text-slate-500"
                  }`}
                >
                  {(member.totalTasks || 0) + (member.totalCollabs || 0)}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default StreakList;
