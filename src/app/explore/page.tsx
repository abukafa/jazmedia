"use client";

import { Search, Hash, User, Folder } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Explore() {
  return (
    <div className="pt-6 pb-8 bg-white">
      <div className="px-4 mb-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Cari user, project..." 
            className="w-full bg-white border border-slate-200 shadow-sm rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <Tabs defaultValue="tasks" className="w-full mt-2">
        <TabsList className="w-full justify-between h-14 bg-white rounded-none border-b border-slate-200 px-4 shadow-sm">
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
        
        <TabsContent value="tasks" className="p-8 mt-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-sm font-bold text-slate-900">Cari Tugas</p>
          <p className="text-xs text-slate-500 mt-1">Mulai ketik untuk mencari postingan tugas atau hashtag.</p>
        </TabsContent>
        
        <TabsContent value="users" className="p-8 mt-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-sm font-bold text-slate-900">Cari Member</p>
          <p className="text-xs text-slate-500 mt-1">Temukan member, mentor, atau teman kolaborasimu.</p>
        </TabsContent>

        <TabsContent value="projects" className="p-8 mt-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Folder className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-sm font-bold text-slate-900">Cari Proyek</p>
          <p className="text-xs text-slate-500 mt-1">Temukan proyek menarik yang sedang berjalan.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
