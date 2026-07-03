"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  FolderOpen,
  Users,
  Clock,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";
import { getPublicProjects } from "@/lib/actions/project";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    const res = await getPublicProjects(filter);
    if (res.success) {
      setProjects(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, [filter]);

  // Kalkulasi durasi berjalan
  const calculateDays = (createdAt: string) => {
    const start = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? "Hari ini" : `${diffDays} Hari`;
  };

  const openProjectDetails = (project: any) => {
    setSelectedProject(project);
    setIsModalOpen(true);
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
          <div className="py-12 flex justify-center">
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
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight">
                      {p.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">
                      PIC: {p.mentorName}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${p.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                  >
                    {p.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-5 flex-wrap">
                  <div className="flex items-center text-[10px] text-slate-500 font-bold bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                    <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    Berjalan {calculateDays(p.createdAt)}
                  </div>
                  <div className="flex items-center text-[10px] text-blue-700 font-bold bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100">
                    <ClipboardList className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                    {p.tasks?.length || 0} Tasks Terhubung
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] w-[95vw] rounded-3xl p-0 overflow-hidden bg-white border-none shadow-2xl">
          {selectedProject && (
            <>
              <div className="p-6 bg-slate-50 border-b border-slate-100 relative">
                <div className="flex items-start gap-3 mt-2 pr-8">
                  <h2 className="text-lg font-black text-slate-900 leading-tight">
                    {selectedProject.title}
                  </h2>
                  <span
                    className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shrink-0 mt-0.5 ${selectedProject.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}
                  >
                    {selectedProject.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 flex items-center">
                  <Users className="w-3.5 h-3.5 mr-1.5" /> Mentor:{" "}
                  <strong>{selectedProject.mentorName}</strong>
                </p>
                <div className="mt-4 flex items-center text-xs font-bold text-slate-600">
                  <Clock className="w-4 h-4 mr-1.5" /> Dimulai:{" "}
                  {new Date(selectedProject.createdAt).toLocaleDateString(
                    "id-ID",
                    { day: "numeric", month: "long", year: "numeric" },
                  )}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-2">
                  Deskripsi Proyek
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 max-h-32 overflow-y-auto">
                  {selectedProject.description}
                </p>

                <div className="mt-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-blue-600" />
                    Daftar Tugas ({selectedProject.tasks?.length || 0})
                  </h3>

                  <ScrollArea className="h-[200px] w-full rounded-2xl border border-slate-100 bg-white">
                    <div className="p-4 flex flex-col gap-2">
                      {selectedProject.tasks?.length === 0 ? (
                        <p className="text-center text-xs text-slate-400 py-6">
                          Belum ada tugas yang dikumpulkan.
                        </p>
                      ) : (
                        selectedProject.tasks?.map((task: any) => (
                          <div
                            key={task.id}
                            className="flex justify-between items-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-[10px] uppercase">
                                {task.authorName.charAt(0)}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900">
                                  {task.authorName}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  Tipe: {task.mediaType}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-1 rounded ${task.status === "approved" ? "bg-green-100 text-green-700" : task.status === "reviewed" ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-600"}`}
                            >
                              {task.status}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
