"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FolderOpen, Star, Users } from "lucide-react";

const MOCK_PROJECTS = [
  { id: 1, title: "UI/UX Design Masterclass", status: "Active", participants: 120, rating: 4.8 },
  { id: 2, title: "Frontend Web Development", status: "Active", participants: 85, rating: 4.9 },
  { id: 3, title: "Photography 101", status: "Completed", participants: 200, rating: 4.7 },
];

export default function Projects() {
  return (
    <div className="pt-6 pb-8 px-4 bg-white">
      <h1 className="text-xl font-black text-slate-900 mb-6 flex items-center">
        <FolderOpen className="w-5 h-5 mr-2 text-blue-600" />
        Projects
      </h1>
      
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2">
        <button className="px-4 py-1.5 bg-slate-900 text-white text-sm font-bold rounded-full whitespace-nowrap">Semua</button>
        <button className="px-4 py-1.5 bg-white text-slate-600 border border-slate-200 text-sm font-bold rounded-full whitespace-nowrap shadow-sm hover:bg-slate-50 transition-colors">Sedang Aktif</button>
        <button className="px-4 py-1.5 bg-white text-slate-600 border border-slate-200 text-sm font-bold rounded-full whitespace-nowrap shadow-sm hover:bg-slate-50 transition-colors">Selesai</button>
      </div>

      <div className="flex flex-col gap-4">
        {MOCK_PROJECTS.map(p => (
          <Card key={p.id} className="border-none shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-3xl hover:shadow-md transition-shadow cursor-pointer bg-white">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-slate-900 leading-tight">{p.title}</h3>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${p.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {p.status}
                </span>
              </div>
              <div className="flex items-center gap-5 mt-5">
                <div className="flex items-center text-xs text-slate-500 font-medium bg-slate-50 px-2.5 py-1 rounded-lg">
                  <Users className="w-3.5 h-3.5 mr-1.5" />
                  {p.participants}
                </div>
                <div className="flex items-center text-xs text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-lg">
                  <Star className="w-3.5 h-3.5 mr-1.5 fill-amber-500 text-amber-500" />
                  {p.rating}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
