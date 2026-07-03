"use client";

import { useEffect, useState } from "react";
import { useAlert } from "@/components/providers/AlertProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Folder,
  Grid3X3,
  Edit2,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import {
  getAllUsers,
  updateUserRole,
  getAllProjects,
  createProject,
  updateProject,
  getAllTasks,
  getAllMentors,
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

export default function AdminDashboard() {
  const { showAlert } = useAlert();
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  // Pagination State for Projects
  const [projectPage, setProjectPage] = useState(1);
  const [projectTotalPages, setProjectTotalPages] = useState(1);

  // Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Controlled Select States
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [selectedMentor, setSelectedMentor] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const [usersRes, projectsRes, tasksRes, mentorsRes] = await Promise.all([
      getAllUsers(),
      getAllProjects(projectPage, 5),
      getAllTasks(),
      getAllMentors(),
    ]);

    if (usersRes.success) setUsers(usersRes.data);
    if (projectsRes.success) {
      setProjects(projectsRes.data);
      setProjectTotalPages(projectsRes.pagination?.totalPages || 1);
    }
    if (tasksRes.success) setTasks(tasksRes.data);
    if (mentorsRes.success) setMentors(mentorsRes.data);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [projectPage]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const res = await updateUserRole(userId, newRole);
    if (res.success) {
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
    } else {
      showAlert({ message: "Gagal mengubah role: " + res.error, type: "error" });
    }
  };

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

    setIsSubmitting(false);
    if (res.success) {
      setIsProjectModalOpen(false);
      setEditingProject(null);
      fetchData(); // Refresh list
    } else {
      showAlert({ message: "Gagal menyimpan proyek: " + res.error, type: "error" });
    }
  };

  const openEditProject = (project: any) => {
    setEditingProject(project);
    setSelectedStatus(project.status || "active");
    setSelectedMentor(project.mentorId || "");
    setIsProjectModalOpen(true);
  };

  const openCreateProject = () => {
    setEditingProject(null);
    setSelectedStatus("active");
    setSelectedMentor("");
    setIsProjectModalOpen(true);
  };

  if (loading && projects.length === 0) {
    return (
      <div className="py-12 flex justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full mt-2">
      <div className="px-4 mb-4">
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-bold text-red-800 uppercase tracking-wider">
              Mode Administrator Aktif
            </h3>
            <p className="text-[11px] text-red-600 mt-1">
              Anda memiliki akses penuh untuk mengubah peran dan mengelola
              seluruh data aplikasi. Harap berhati-hati.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="w-full justify-between h-12 bg-white rounded-none border-b border-slate-100 px-0">
          <TabsTrigger
            value="users"
            className="flex-1 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none h-full transition-all flex flex-col gap-1"
          >
            <Users className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger
            value="projects"
            className="flex-1 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none h-full transition-all flex flex-col gap-1"
          >
            <Folder className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger
            value="tasks"
            className="flex-1 data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none h-full transition-all flex flex-col gap-1"
          >
            <Grid3X3 className="w-4 h-4" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="p-4 space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white border border-slate-100 rounded-xl p-3 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <img
                  src={user.image || "https://i.pravatar.cc/150"}
                  alt={user.name}
                  className="w-10 h-10 rounded-full bg-slate-100"
                />
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    @{user.username || "unknown"}
                  </p>
                </div>
              </div>
              <select
                value={user.role}
                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                className={`text-xs font-bold px-2 py-1.5 rounded-lg border-none focus:ring-2 focus:ring-red-100 outline-none
                  ${
                    user.role === "admin"
                      ? "bg-red-100 text-red-700"
                      : user.role === "mentor"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-700"
                  }`}
              >
                <option value="member">Member</option>
                <option value="mentor">Mentor</option>
                <option value="admin">Admin</option>
                <option value="guest">Guest</option>
              </select>
            </div>
          ))}
          {users.length === 0 && (
            <p className="text-center text-sm text-slate-500 py-4">
              Belum ada pengguna.
            </p>
          )}
        </TabsContent>

        <TabsContent value="projects" className="p-4 space-y-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-900">Kelola Proyek</h3>
            <Button
              onClick={openCreateProject}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Buat Proyek
            </Button>
          </div>

          <div className="space-y-3 relative">
            {loading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex justify-center items-center rounded-xl">
                <div className="w-6 h-6 border-2 border-slate-200 border-t-red-600 rounded-full animate-spin"></div>
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
                    <span className="text-[10px] text-slate-500 font-medium">
                      Mentor:{" "}
                      <strong className="text-slate-900">
                        {project.mentorName}
                      </strong>
                    </span>
                    <div>
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
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => openEditProject(project)}
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-lg text-slate-600 hover:text-slate-900"
                    >
                      <Edit2 className="w-3 h-3 mr-1.5" /> Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
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
        </TabsContent>

        <TabsContent value="tasks" className="p-4 space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white border border-slate-100 rounded-xl p-3 flex gap-3 shadow-sm"
            >
              <div className="w-16 h-16 bg-slate-100 rounded-lg shrink-0 flex items-center justify-center">
                <Grid3X3 className="w-6 h-6 text-slate-300" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-slate-900 truncate">
                  {task.projectTitle}
                </h4>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  By: {task.authorName}
                </p>
                <div className="mt-2 flex justify-between items-center">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${task.status === "approved" ? "bg-green-100 text-green-700" : task.status === "reviewed" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}
                  >
                    {task.status}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[10px] text-red-500 hover:text-red-700 px-2 font-bold"
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="text-center text-sm text-slate-500 py-4">
              Belum ada tugas/post.
            </p>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog Form Project */}
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
                    onValueChange={setSelectedStatus}
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
                  <Select
                    name="mentorId"
                    value={selectedMentor}
                    onValueChange={setSelectedMentor}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue>
                        {selectedMentor
                          ? mentors.find((m) => m.id === selectedMentor)
                              ?.name || "Pilih Mentor"
                          : "Pilih Mentor"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">-- Kosong --</SelectItem>
                      {mentors.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Proyek"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
