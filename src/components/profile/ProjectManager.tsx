"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAlert } from "@/components/providers/AlertProvider";
import { Folder, Edit2, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
  getAllProjects,
  createProject,
  updateProject,
  getAllMentors,
  getAllUsersForSelect,
  deleteProject,
} from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProjectManagerProps {
  currentUserId: string;
  isAdmin: boolean;
  readonly?: boolean;
}

export function ProjectManager({
  currentUserId,
  isAdmin,
  readonly = false,
}: ProjectManagerProps) {
  const { showAlert, showConfirm } = useAlert();
  const queryClient = useQueryClient();

  // Pagination State for Projects
  const [projectPage, setProjectPage] = useState(1);

  const { data: projectsData, isFetching: loadingProjects } = useQuery({
    queryKey: ["admin", "projects", projectPage],
    queryFn: async () => {
      const res = await getAllProjects(projectPage, 5);
      return res;
    },
  });

  const projects = projectsData?.success ? projectsData.data || [] : [];
  const projectTotalPages = projectsData?.success
    ? projectsData.pagination?.totalPages || 1
    : 1;

  const { data: mentors = [], isFetching: loadingMentors } = useQuery({
    queryKey: ["admin", "mentors"],
    queryFn: async () => {
      const res = await getAllMentors();
      return res.success ? res.data || [] : [];
    },
  });

  const { data: users = [], isFetching: loadingUsers } = useQuery({
    queryKey: ["admin", "users_select"],
    queryFn: async () => {
      const res = await getAllUsersForSelect();
      return res.success ? res.data || [] : [];
    },
  });

  const loading = loadingProjects || loadingMentors || loadingUsers;

  // Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Controlled Select States
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [selectedMentor, setSelectedMentor] = useState("none");
  const [selectedPM, setSelectedPM] = useState("none");

  const handleProjectSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    let res;
    if (editingProject) {
      res = await updateProject(editingProject.id, formData);
    } else {
      res = await createProject(formData);
    }

    if (res.success) {
      showAlert({
        message: `Proyek berhasil ${editingProject ? "diperbarui" : "dibuat"}`,
        type: "success",
      });
      setIsProjectModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
    } else {
      showAlert({
        message: "Gagal menyimpan proyek: " + res.error,
        type: "error",
      });
    }
    setIsSubmitting(false);
  };

  const handleDeleteProject = (projectId: string) => {
    showConfirm({
      message:
        "Apakah Anda yakin ingin menghapus proyek ini? Semua tugas yang terkait tidak akan memiliki induk proyek lagi.",
      onConfirm: async () => {
        const res = await deleteProject(projectId);
        if (res.success) {
          showAlert({ message: "Proyek berhasil dihapus", type: "success" });
          queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
        } else {
          showAlert({
            message: "Gagal menghapus proyek: " + res.error,
            type: "error",
          });
        }
      },
    });
  };

  const openEditProject = (project: any) => {
    setEditingProject(project);
    setSelectedStatus(project.status || "active");
    setSelectedMentor(project.mentorId || "none");
    setSelectedPM(project.projectManagerId || "none");
    setIsProjectModalOpen(true);
  };

  const isMentorRole = !isAdmin && !readonly;

  const openCreateProject = () => {
    setEditingProject(null);
    setSelectedStatus("active");
    setSelectedMentor(isMentorRole ? currentUserId : "none");
    setSelectedPM("none");
    setIsProjectModalOpen(true);
  };

  const hasEditRights = (project: any) => {
    if (isAdmin) return true;
    if (readonly) return false;
    return (
      project.creatorId === currentUserId || project.mentorId === currentUserId
    );
  };

  const showCreateButton = !readonly;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-900">Kelola Proyek</h3>
        {showCreateButton && (
          <Button
            onClick={openCreateProject}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Buat Proyek
          </Button>
        )}
      </div>

      <div className="space-y-3 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex justify-center items-center rounded-xl">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}
        {projects.map((project) => (
          <div
            key={project.id}
            className={`bg-white border rounded-xl p-4 shadow-sm flex flex-col gap-2 ${project.status === "archived" ? "border-slate-200 opacity-70 bg-slate-50" : "border-slate-100"}`}
          >
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-0.5">
                <h4 className="font-bold text-sm text-slate-900">
                  {project.title}
                </h4>
                <div className="mb-1">
                  <span
                    className={`text-[10px] font-bold bg-green-50 px-1.5 py-0.5 rounded w-fit
                ${
                  project.status === "active"
                    ? "bg-green-100 text-green-700"
                    : project.status === "completed"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-200 text-slate-600"
                }`}
                  >
                    {project.status}
                  </span>
                  <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 ml-1 rounded w-fit">
                    {project.taskCount} Tasks Terhubung
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  PIC:{" "}
                  <strong className="text-slate-900">
                    {project.mentorName}
                  </strong>
                  {" • "}
                  PM:{" "}
                  <span className="font-bold text-slate-700">
                    {project.projectManagerName || "-"}
                  </span>
                </span>
              </div>
              <div className="flex gap-2">
                {!readonly && isAdmin && (
                  <Button
                    onClick={() => handleDeleteProject(project.id)}
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    Hapus
                  </Button>
                )}
                {!readonly ? (
                  <Button
                    onClick={() => openEditProject(project)}
                    variant="outline"
                    size="sm"
                    disabled={!hasEditRights(project)}
                    className="h-8 rounded-lg text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <Edit2 className="w-3 h-3 mr-1.5" /> Edit
                  </Button>
                ) : (
                  <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 flex items-center h-8">
                    {project.myTaskCount} Tasks
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {projects.length === 0 && !loading && (
          <p className="text-center text-sm text-slate-500 py-4">
            Belum ada proyek dibuat.
          </p>
        )}
      </div>

      {/* Pagination */}
      {projectTotalPages > 1 && (
        <div className="flex justify-between items-center mt-4 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setProjectPage((p) => Math.max(1, p - 1))}
            disabled={projectPage === 1 || loading}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Prev
          </Button>
          <span className="text-xs font-bold text-slate-600">
            Hal {projectPage} / {projectTotalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setProjectPage((p) => Math.min(projectTotalPages, p + 1))
            }
            disabled={projectPage === projectTotalPages || loading}
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Dialog Form Project */}
      {!readonly && (
        <Dialog open={isProjectModalOpen} onOpenChange={setIsProjectModalOpen}>
          <DialogContent className="sm:max-w-[425px] w-[90vw] rounded-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? "Edit Proyek" : "Buat Proyek Baru"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Isi detail proyek di bawah ini. Pastikan untuk menunjuk seorang
                Mentor.
              </DialogDescription>
            </DialogHeader>
            <form
              key={editingProject?.id || "new"}
              onSubmit={handleProjectSubmit}
            >
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title" className="text-xs font-bold">
                    Judul Proyek
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={editingProject?.title || ""}
                    required
                    placeholder="Contoh: UI/UX Bootcamp Batch 1"
                    className="text-sm"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description" className="text-xs font-bold">
                    Deskripsi
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingProject?.description || ""}
                    required
                    placeholder="Deskripsikan tujuan dan detail proyek..."
                    rows={3}
                    className="text-sm resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col gap-2 w-[40%]">
                    <Label htmlFor="status" className="text-xs font-bold">
                      Status
                    </Label>
                    <Select
                      name="status"
                      value={selectedStatus}
                      onValueChange={(val) => setSelectedStatus(val || "")}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2 w-[60%]">
                    <Label htmlFor="mentorId" className="text-xs font-bold">
                      Mentor PIC
                    </Label>
                    <input
                      type="hidden"
                      name="mentorId"
                      value={selectedMentor === "none" ? "" : selectedMentor}
                    />
                    <Select
                      value={selectedMentor}
                      onValueChange={(val) => setSelectedMentor(val || "none")}
                      disabled={isMentorRole}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue>
                          {selectedMentor !== "none"
                            ? mentors.find((m) => m.id === selectedMentor)
                                ?.name || "Pilih Mentor"
                            : "Pilih Mentor"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {!isMentorRole && (
                          <SelectItem value="none">-- Kosong --</SelectItem>
                        )}
                        {mentors.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Project Manager Field */}
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="projectManagerId"
                    className="text-xs font-bold"
                  >
                    Project Manager (Opsional)
                  </Label>
                  <input
                    type="hidden"
                    name="projectManagerId"
                    value={selectedPM === "none" ? "" : selectedPM}
                  />
                  <Select
                    value={selectedPM}
                    onValueChange={(val) => setSelectedPM(val || "none")}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue>
                        {selectedPM !== "none"
                          ? users.find((u: any) => u.id === selectedPM)?.name ||
                            "Pilih Project Manager"
                          : "Pilih Project Manager"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Kosong --</SelectItem>
                      {users.map((u: any) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="w-full sm:w-auto mb-2 sm:mb-0"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Proyek"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
