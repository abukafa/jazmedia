"use client";

import { useState, useEffect } from "react";
import { Search, Hash, User, Folder, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskCard } from "@/components/feed/TaskCard";
import { searchTasks, searchUsers, searchProjects } from "@/lib/actions/explore";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Explore() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("tasks");
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length > 0) {
        setLoading(true);
        setHasSearched(true);
        if (activeTab === "tasks") {
          searchTasks(query).then((res) => { setTasks(res); setLoading(false); });
        } else if (activeTab === "users") {
          searchUsers(query).then((res) => { setUsers(res); setLoading(false); });
        } else if (activeTab === "projects") {
          searchProjects(query).then((res) => { setProjects(res); setLoading(false); });
        }
      } else {
        setTasks([]);
        setUsers([]);
        setProjects([]);
        setHasSearched(false);
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [query, activeTab]);

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

      <Tabs defaultValue="tasks" value={activeTab} onValueChange={setActiveTab} className="w-full mt-2">
        <TabsList className="w-full justify-between h-14 bg-white rounded-none border-b border-slate-200 px-4 shadow-sm sticky top-0 z-10">
          <TabsTrigger value="tasks" className="flex-1 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none h-full transition-all text-slate-500 font-bold">
            <Hash className="w-4 h-4 mr-2" /> Tasks
          </TabsTrigger>
          <TabsTrigger value="users" className="flex-1 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none h-full transition-all text-slate-500 font-bold">
            <User className="w-4 h-4 mr-2" /> Users
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex-1 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none h-full transition-all text-slate-500 font-bold">
            <Folder className="w-4 h-4 mr-2" /> Projects
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="mt-4 px-0">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
          ) : hasSearched && tasks.length === 0 ? (
            <div className="text-center py-10 text-slate-500">Tidak ada tugas ditemukan.</div>
          ) : tasks.length > 0 ? (
            <div className="space-y-4 px-4">
              {tasks.map(task => <TaskCard key={task.id} {...task} />)}
            </div>
          ) : (
            <div className="p-8 mt-6 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mb-4">
                <Hash className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-900">Cari Tugas</p>
              <p className="text-xs text-slate-500 mt-1">Mulai ketik untuk mencari postingan tugas.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="users" className="mt-4 px-4">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
          ) : hasSearched && users.length === 0 ? (
            <div className="text-center py-10 text-slate-500">Tidak ada member ditemukan.</div>
          ) : users.length > 0 ? (
            <div className="space-y-3">
              {users.map(user => (
                <div key={user._id} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <Avatar className="w-12 h-12 border border-slate-100">
                    <AvatarImage src={user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                    <AvatarFallback>{user.name?.substring(0,2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{user.name}</h4>
                    <p className="text-xs text-slate-500 truncate">@{user.username || user.name.toLowerCase().replace(/\s/g, '')}</p>
                    {user.bio && <p className="text-xs text-slate-600 mt-1 line-clamp-1">{user.bio}</p>}
                  </div>
                  <div className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-lg capitalize">
                    {user.role}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 mt-6 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-900">Cari Member</p>
              <p className="text-xs text-slate-500 mt-1">Temukan member, mentor, atau teman kolaborasimu.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="projects" className="mt-4 px-4">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
          ) : hasSearched && projects.length === 0 ? (
            <div className="text-center py-10 text-slate-500">Tidak ada proyek ditemukan.</div>
          ) : projects.length > 0 ? (
            <div className="space-y-3">
              {projects.map(project => (
                <div key={project._id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <h4 className="text-sm font-bold text-blue-600 mb-1">{project.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{project.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 mt-6 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center mb-4">
                <Folder className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-900">Cari Proyek</p>
              <p className="text-xs text-slate-500 mt-1">Temukan proyek menarik yang sedang berjalan.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
