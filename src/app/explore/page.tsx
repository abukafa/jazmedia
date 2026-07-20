"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Hash,
  User,
  Flame,
  Loader2,
  ArrowLeft,
  Play,
  FileTextIcon,
  Folder,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskCard } from "@/components/feed/TaskCard";
import {
  searchTasks,
  searchUsers,
  getMemberStreaks,
} from "@/lib/actions/explore";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getDirectMediaUrl } from "@/lib/utils/media";
import { useSession } from "next-auth/react";

export default function Explore() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "member";

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTab, setActiveTab] = useState(
    userRole === "mentor" || userRole === "admin" ? "streak" : "tasks",
  );
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(
    null,
  );

  // Fungsi untuk scroll otomatis
  const scrollRef = (node: HTMLDivElement | null) => {
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const { data: tasks = [], isFetching: loadingTasks } = useQuery({
    queryKey: ["search", "tasks", debouncedQuery],
    queryFn: () => searchTasks(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0 && activeTab === "tasks",
  });

  const { data: users = [], isFetching: loadingUsers } = useQuery({
    queryKey: ["search", "users", debouncedQuery],
    queryFn: () => searchUsers(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0 && activeTab === "users",
  });

  const { data: streaks = [], isFetching: loadingStreaks } = useQuery({
    queryKey: ["explore", "streaks", debouncedQuery],
    queryFn: () => getMemberStreaks(debouncedQuery),
    enabled: activeTab === "streak",
  });

  const loading =
    activeTab === "tasks"
      ? loadingTasks
      : activeTab === "users"
        ? loadingUsers
        : loadingStreaks;
  const hasSearched = debouncedQuery.trim().length > 0;

  return (
    <div className="pt-6 pb-24 bg-slate-50 min-h-screen">
      <div className="px-4 mb-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Ketik untuk mencari..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 shadow-sm rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <Tabs
        defaultValue="tasks"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full mt-2"
      >
        <TabsList className="w-full justify-between h-14 bg-white rounded-none border-b border-slate-200 px-4 shadow-sm sticky top-0 z-10">
          <TabsTrigger
            value="tasks"
            className="flex-1 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none h-full transition-all text-slate-500 font-bold"
          >
            <Hash className="w-4 h-4 mr-2" /> Tasks
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="flex-1 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none h-full transition-all text-slate-500 font-bold"
          >
            <User className="w-4 h-4 mr-2" /> Users
          </TabsTrigger>
          <TabsTrigger
            value="streak"
            className="flex-1 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 rounded-none h-full transition-all text-slate-500 font-bold"
          >
            <Flame className="w-4 h-4 mr-2" /> Streak
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4 px-0">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : hasSearched && tasks.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              Tidak ada tugas ditemukan.
            </div>
          ) : tasks.length > 0 ? (
            <div className="grid grid-cols-3 gap-[2px]">
              {tasks.map((task: any, i: number) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskIndex(i)}
                  className="aspect-square bg-slate-100 relative group cursor-pointer overflow-hidden flex items-center justify-center"
                >
                  {task.mediaType === "image" ? (
                    <img
                      src={getDirectMediaUrl(task.mediaUrl, "image")}
                      alt={`Task ${i}`}
                      className={`object-cover w-full h-full group-hover:scale-110 transition-transform duration-500 ${task.status === 'rejected' ? 'grayscale opacity-90' : ''}`}
                      loading="lazy"
                    />
                  ) : task.mediaType === "video" ? (
                    <div className={`w-full h-full flex items-center justify-center ${task.status === 'rejected' ? 'bg-slate-700 grayscale' : 'bg-slate-800'}`}>
                      <Play className="w-8 h-8 text-white/50" />
                    </div>
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${task.status === 'rejected' ? 'bg-slate-200 grayscale' : 'bg-blue-50'}`}>
                      <FileTextIcon className={`w-8 h-8 ${task.status === 'rejected' ? 'text-slate-400' : 'text-blue-300'}`} />
                    </div>
                  )}
                  
                  {task.status === "rejected" && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 bg-black/10">
                      <div className="bg-red-600 text-white font-black text-[10px] sm:text-xs tracking-widest px-2 py-0.5 uppercase rotate-[-12deg] shadow-lg rounded-sm">
                        REJECTED
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 mt-6 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mb-4">
                <Hash className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-900">Cari Tugas</p>
              <p className="text-xs text-slate-500 mt-1">
                Mulai ketik untuk mencari postingan tugas.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="users" className="mt-4 px-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : hasSearched && users.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              Tidak ada member ditemukan.
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-3">
              {users.map((user: any) => (
                <Link
                  href={`/user/${user._id}`}
                  key={user._id}
                  className="block"
                >
                  <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer">
                    <Avatar className="w-12 h-12 border border-slate-100">
                      <AvatarImage
                        src={
                          user.image ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`
                        }
                      />
                      <AvatarFallback>
                        {user.name?.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {user.name}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">
                        @
                        {user.username ||
                          user.name.toLowerCase().replace(/\s/g, "")}
                      </p>
                      {user.bio && (
                        <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                          {user.bio}
                        </p>
                      )}
                    </div>
                    <div className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-lg capitalize">
                      {user.role}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 mt-6 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-900">Cari Member</p>
              <p className="text-xs text-slate-500 mt-1">
                Temukan member, mentor, atau teman kolaborasimu.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="streak" className="mt-4 px-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : streaks.length > 0 ? (
            <div className="space-y-3">
              {streaks.map((member: any) => (
                <Link key={member.id} href={`/user/${member.id}`}>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 rounded-full border-2 border-slate-100">
                        <AvatarImage src={member.image} />
                        <AvatarFallback className="bg-slate-100 text-slate-500 font-bold">
                          {member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-none mb-1">
                          {member.name}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {member.totalTasks} Tasks • {member.totalCollabs}{" "}
                          Collabs
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div
                        className={`flex items-center px-2 py-1 rounded-full border ${member.streakCount > 0 ? "border-orange-100 bg-orange-100" : "border-slate-200 bg-slate-100"} text-slate-700 font-bold text-[11px]`}
                      >
                        <Flame
                          className={`w-3.5 h-3.5 ${member.streakCount > 0 ? "text-orange-500 fill-current" : "text-slate-400"} mr-1`}
                        />
                        <span
                          className={`text-xs font-black ${member.streakCount > 0 ? "text-orange-600" : "text-slate-500"}`}
                        >
                          {member.totalTasks + member.totalCollabs}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 mt-6 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mb-4">
                <Flame className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-900">
                Belum Ada Streak
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Belum ada member yang aktif.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Post Overlay */}
      {selectedTaskIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col">
          <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 h-14 flex items-center px-4">
            <button
              onClick={() => setSelectedTaskIndex(null)}
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="flex-1 text-center font-bold text-slate-900 mr-8">
              Hasil Pencarian
            </h1>
          </div>
          <div className="flex-1 overflow-y-auto w-full px-4">
            <div className="max-w-md mx-auto w-full pb-20 pt-4">
              {tasks.map((task: any, index: number) => (
                <div
                  key={task.id}
                  ref={index === selectedTaskIndex ? scrollRef : null}
                  className="mb-6"
                >
                  <TaskCard {...task} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Auto-scroll effect */}
      {selectedTaskIndex !== null && <AutoScroll refNode={scrollRef} />}
    </div>
  );
}

// Komponen bantu untuk memicu scroll otomatis saat dirender
function AutoScroll({
  refNode,
}: {
  refNode: (node: HTMLDivElement | null) => void;
}) {
  useEffect(() => {
    // Scroll will be handled by the ref callback automatically,
    // but this component's mount ensures it runs at the right time.
  }, []);
  return null;
}
