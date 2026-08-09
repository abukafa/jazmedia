"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Hash,
  User,
  Loader2,
  ArrowLeft,
  Play,
  FileTextIcon,
  FolderOpen,
  Clock,
  ClipboardList,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskCard } from "@/components/feed/TaskCard";
import { searchTasks, searchUsers, getMemberStreaks } from "@/lib/actions/explore";
import { getPublicProjects } from "@/lib/actions/project";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getDirectMediaUrl } from "@/lib/utils/media";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import StreakList from "@/components/explore/StreakList";

export default function Explore() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "member";
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(
    null,
  );
  const [projectFilter, setProjectFilter] = useState("all");

  const getRoleBadgeColors = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-700 border border-red-200';
      case 'mentor':
        return 'bg-purple-100 text-purple-700 border border-purple-200';
      default:
        return 'bg-slate-100 text-slate-600 border border-transparent';
    }
  };

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
    queryKey: ["explore", "streaks"],
    queryFn: () => getMemberStreaks(),
    enabled: debouncedQuery.trim().length === 0 && activeTab === "users",
  });

  const { data: projects = [], isFetching: loadingProjects } = useQuery({
    queryKey: ["explore", "projects", projectFilter],
    queryFn: async () => {
      const res = await getPublicProjects(projectFilter);
      return res.success ? res.data || [] : [];
    },
    enabled: activeTab === "projects",
  });

  const filteredProjects = debouncedQuery.trim()
    ? projects.filter(
        (p: any) =>
          p.title?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          p.mentorName?.toLowerCase().includes(debouncedQuery.toLowerCase()),
      )
    : projects;

  const hasSearched = debouncedQuery.trim().length > 0;

  const loading =
    activeTab === "tasks"
      ? loadingTasks
      : activeTab === "users"
        ? hasSearched ? loadingUsers : loadingStreaks
        : loadingProjects;

  // Kalkulasi durasi berjalan
  const calculateDays = (createdAt: string) => {
    if (!createdAt) return "Hari ini";
    const start = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return diffDays <= 0 ? "Hari ini" : `${diffDays} Hari`;
  };

  const openProjectDetails = (project: any) => {
    router.push(`/projects/${project.id}`);
  };

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
            value="projects"
            className="flex-1 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none h-full transition-all text-slate-500 font-bold"
          >
            <FolderOpen className="w-4 h-4 mr-2" /> Projects
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
                      className={`object-cover w-full h-full group-hover:scale-110 transition-transform duration-500 ${
                        task.status === "rejected" ? "grayscale opacity-90" : ""
                      }`}
                      loading="lazy"
                    />
                  ) : task.mediaType === "video" ? (
                    <div
                      className={`w-full h-full flex items-center justify-center ${
                        task.status === "rejected"
                          ? "bg-slate-700 grayscale"
                          : "bg-slate-800"
                      }`}
                    >
                      <Play className="w-8 h-8 text-white/50" />
                    </div>
                  ) : (
                    <div
                      className={`w-full h-full flex items-center justify-center ${
                        task.status === "rejected"
                          ? "bg-slate-200 grayscale"
                          : "bg-blue-50"
                      }`}
                    >
                      <FileTextIcon
                        className={`w-8 h-8 ${
                          task.status === "rejected"
                            ? "text-slate-400"
                            : "text-blue-300"
                        }`}
                      />
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
                          `/no-photo.png`
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
                    <div className={`text-[10px] font-bold px-2 py-1 rounded-lg capitalize ${getRoleBadgeColors(user.role)}`}>
                      {user.role}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <StreakList streaks={streaks} loading={loadingStreaks} />
          )}
        </TabsContent>

        <TabsContent value="projects" className="mt-4 px-4">
          {/* Filter Buttons */}
          <div className="flex gap-2 justify-center overflow-x-auto pb-4 scrollbar-hide mb-2">
            <button
              onClick={() => setProjectFilter("all")}
              className={`px-4 py-1.5 text-sm font-bold rounded-full whitespace-nowrap transition-colors ${
                projectFilter === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 shadow-sm hover:bg-slate-50"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setProjectFilter("active")}
              className={`px-4 py-1.5 text-sm font-bold rounded-full whitespace-nowrap transition-colors ${
                projectFilter === "active"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 shadow-sm hover:bg-slate-50"
              }`}
            >
              Aktif
            </button>
            <button
              onClick={() => setProjectFilter("completed")}
              className={`px-4 py-1.5 text-sm font-bold rounded-full whitespace-nowrap transition-colors ${
                projectFilter === "completed"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 shadow-sm hover:bg-slate-50"
              }`}
            >
              Selesai
            </button>
            <button
              onClick={() => setProjectFilter("archived")}
              className={`px-4 py-1.5 text-sm font-bold rounded-full whitespace-nowrap transition-colors ${
                projectFilter === "archived"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 shadow-sm hover:bg-slate-50"
              }`}
            >
              Arsip
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              Belum ada proyek yang sesuai.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredProjects.map((p: any) => (
                <Card
                  key={p.id}
                  onClick={() => openProjectDetails(p)}
                  className="border-none shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-3xl hover:shadow-md transition-shadow cursor-pointer bg-white"
                >
                  <CardContent className="pt-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-900 leading-tight inline">
                          {p.title}
                        </h3>
                        <span>
                          <Clock className="w-3.5 h-3.5 mx-1.5 text-slate-400 inline" />
                          <span className="text-[11px] text-slate-500 font-medium mt-1">
                            {calculateDays(p.createdAt)}
                          </span>
                        </span>
                        <p>
                          <span className="text-[11px] text-slate-500 font-medium mt-1">
                            PIC: {p.mentorName} • PM:{" "}
                            {p.projectManagerName || "-"}
                          </span>
                        </p>
                      </div>
                      <div className="text-center">
                        <span
                          className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                            p.status === "active"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {p.status}
                        </span>
                        <div
                          className={`flex items-center text-[11px] ${
                            p.tasks?.length ? "text-blue-700" : "text-slate-400"
                          } font-bold px-3 py-1`}
                        >
                          {p.tasks?.length || 0} Tasks
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
    // Scroll will be handled by the ref callback automatically
  }, []);
  return null;
}
