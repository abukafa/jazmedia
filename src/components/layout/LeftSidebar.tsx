"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { getDirectMediaUrl } from "@/lib/utils/media";

export default function LeftSidebar() {
  const { data: session, status } = useSession();

  // If loading or unauthenticated, we can show a skeleton or a generic prompt
  if (status === "loading") {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 min-h-[300px] flex flex-col items-center animate-pulse">
        <div className="h-16 w-full bg-slate-200 rounded-md mb-8 relative">
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full p-1">
            <div className="w-full h-full bg-slate-300 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  const user = session?.user;

  // Render generic guest prompt if not logged in
  if (!user) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 text-center">
        <h3 className="font-semibold text-slate-800 mb-2">Join Jazmedia</h3>
        <p className="text-sm text-slate-500 mb-4">
          Sign in to see your personalized feed and connect with others.
        </p>
        <Link
          href="/login"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const userImage = user.image
    ? user.image.includes("pravatar") ||
      user.image.includes("dicebear") ||
      user.image.includes("unsplash")
      ? "/no-photo.png"
      : getDirectMediaUrl(user.image, "image")
    : "/no-photo.png";

  return (
    <div className="sticky top-[80px] space-y-4">
      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Cover Photo */}
        <div className="h-16 w-full bg-gradient-to-r from-blue-100 to-blue-200 relative">
          {/* Avatar */}
          <Link
            href="/profile"
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full p-1 border border-slate-100 shadow-sm z-10 block hover:scale-105 transition-transform"
          >
            <img
              src={userImage}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          </Link>
        </div>

        <div className="pt-10 pb-4 px-4 text-center border-b border-slate-100">
          <Link href="/profile" className="hover:underline">
            <h3 className="font-semibold text-slate-900 leading-tight">
              {user.name || "User"}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {(user as any).role === "guest"
              ? "Guest User"
              : "Jazacademy Member"}
          </p>
        </div>

        {/* Stats */}
        <div className="py-3">
          <Link
            href="/profile"
            className="flex justify-between items-center px-4 py-1 hover:bg-slate-50 transition-colors"
          >
            <span className="text-xs font-medium text-slate-500">
              Connections
            </span>
            <span className="text-xs font-semibold text-blue-600">500+</span>
          </Link>
          <Link
            href="/profile"
            className="flex justify-between items-center px-4 py-1 hover:bg-slate-50 transition-colors"
          >
            <span className="text-xs font-medium text-slate-500">
              Portfolio Views
            </span>
            <span className="text-xs font-semibold text-blue-600">654</span>
          </Link>
        </div>
      </div>

      {/* Group Widget */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hidden md:block">
        <div className="p-4 border-b border-slate-100">
          <h4 className="text-xs font-semibold text-slate-800">Groups</h4>
          <div className="mt-3 space-y-3 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2 hover:text-blue-600 cursor-pointer">
              <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px]">
                UI
              </div>
              UI/UX Design Inspiration
            </div>
            <div className="flex items-center gap-2 hover:text-blue-600 cursor-pointer">
              <div className="w-6 h-6 rounded bg-yellow-100 text-yellow-700 flex items-center justify-center text-[10px]">
                Pro
              </div>
              Pro Designer
            </div>
          </div>
        </div>
        <div className="p-4 hover:bg-slate-50 cursor-pointer text-xs font-semibold text-slate-500 transition-colors">
          Followed Hashtags
        </div>
      </div>
    </div>
  );
}
