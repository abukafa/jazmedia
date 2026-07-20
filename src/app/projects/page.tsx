"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import {
  FolderOpen,
  Users,
  Clock,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";
import { getPublicProjects } from "@/lib/actions/project";
import { useRouter } from "next/navigation";

export default function Projects() {
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  const { data: projects = [], isFetching: loading } = useQuery({
    queryKey: ["projects", filter],
    queryFn: async () => {
      const res = await getPublicProjects(filter);
      return res.success ? res.data || [] : [];
    },
  });

  // Kalkulasi durasi berjalan
  const calculateDays = (createdAt: string) => {
    const start = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? "Hari ini" : `${diffDays} Hari`;
  };

  const openProjectDetails = (project: any) => {
    router.push(`/projects/${project.id}`);
  };

  return (
    <div className="pt-6 pb-8 px-4 bg-slate-50 min-h-screen">
      <h1 className="text-xl font-black text-slate-900 mb-6 flex items-center">
        <FolderOpen className="w-5 h-5 mr-2 text-blue-600" />
        Projects
      </h1>

      {/* Filter Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-1.5 text-sm font-bold rounded-full whitespace-nowrap transition-colors ${filter === "all" ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200 shadow-sm hover:bg-slate-50"}`}
        >
          Semua
        </button>
        <button
          onClick={() => setFilter("active")}
          className={`px-4 py-1.5 text-sm font-bold rounded-full whitespace-nowrap transition-colors ${filter === "active" ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200 shadow-sm hover:bg-slate-50"}`}
        >
          Sedang Aktif
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`px-4 py-1.5 text-sm font-bold rounded-full whitespace-nowrap transition-colors ${filter === "completed" ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200 shadow-sm hover:bg-slate-50"}`}
        >
          Selesai
        </button>
      </div>

      {/* Projects List */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="py-6 flex justify-center">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : projects.length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-10">
            Belum ada proyek yang sesuai filter.
          </p>
        ) : (
          projects.map((p) => (
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
                        Berjalan {calculateDays(p.createdAt)}
                      </span>
                    </span>
                    <p>
                      <span className="text-[11px] text-slate-500 font-medium mt-1">
                        PIC: {p.mentorName} • PM: {p.projectManagerName || "-"}
                      </span>
                    </p>
                  </div>
                  <div className="text-center">
                    <span
                      className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${p.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                    >
                      {p.status}
                    </span>
                    <div
                      className={`flex items-center text-[11px] ${p.tasks?.length ? "text-blue-700" : "text-slate-400"} font-bold px-2.5 py-1.5`}
                    >
                      <ClipboardList className="w-3.5 h-3.5 mr-1.5" />
                      {p.tasks?.length || 0} Tasks
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
