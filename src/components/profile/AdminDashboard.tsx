"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAlert } from "@/components/providers/AlertProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Folder, Grid3X3, ShieldAlert, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getDirectMediaUrl } from "@/lib/utils/media";
import {
  getAllUsers,
  updateUserRole,
  getAllTasks,
  getAllMentors,
  deleteUser,
  deleteTask,
} from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { ProjectManager } from "@/components/profile/ProjectManager";

interface AdminDashboardProps {
  currentUserId: string;
}

export default function AdminDashboard({ currentUserId }: AdminDashboardProps) {
  const { showAlert, showConfirm } = useAlert();
  const queryClient = useQueryClient();

  const { data: users = [], isFetching: loadingUsers } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const res = await getAllUsers();
      return res.success ? res.data || [] : [];
    },
  });

  const { data: tasks = [], isFetching: loadingTasks } = useQuery({
    queryKey: ["admin", "tasks"],
    queryFn: async () => {
      const res = await getAllTasks();
      return res.success ? res.data || [] : [];
    },
  });

  const loading = loadingUsers || loadingTasks;

  const handleRoleChange = async (userId: string, newRole: string) => {
    const res = await updateUserRole(userId, newRole);
    if (res.success) {
      showAlert({ message: "Role berhasil diperbarui", type: "success" });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    } else {
      showAlert({
        message: "Gagal mengubah role: " + res.error,
        type: "error",
      });
    }
  };

  const handleDeleteUser = (userId: string) => {
    showConfirm({
      message:
        "Apakah Anda yakin ingin menghapus pengguna ini? Semua data yang terkait mungkin juga terhapus.",
      onConfirm: async () => {
        const res = await deleteUser(userId);
        if (res.success) {
          showAlert({ message: "Pengguna berhasil dihapus", type: "success" });
          queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
        } else {
          showAlert({
            message: "Gagal menghapus pengguna: " + res.error,
            type: "error",
          });
        }
      },
    });
  };

  const handleDeleteTask = (taskId: string) => {
    showConfirm({
      message: "Apakah Anda yakin ingin menghapus postingan ini?",
      onConfirm: async () => {
        const res = await deleteTask(taskId);
        if (res.success) {
          showAlert({ message: "Postingan berhasil dihapus", type: "success" });
          queryClient.invalidateQueries({ queryKey: ["admin", "tasks"] });
        } else {
          showAlert({
            message: "Gagal menghapus postingan: " + res.error,
            type: "error",
          });
        }
      },
    });
  };

  if (loading && users.length === 0) {
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
              <div className="mt-2 flex justify-between items-center">
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteUser(user.id)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" x2="10" y1="11" y2="17" />
                    <line x1="14" x2="14" y1="11" y2="17" />
                  </svg>
                </Button>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <p className="text-center text-sm text-slate-500 py-4">
              Belum ada pengguna.
            </p>
          )}
        </TabsContent>

        <TabsContent value="projects" className="p-4 space-y-3">
          <ProjectManager currentUserId={currentUserId} isAdmin={true} />
        </TabsContent>

        <TabsContent value="tasks" className="p-4 space-y-3">
          {tasks.map((task: any) => (
            <div
              key={task.id}
              className="bg-white border border-slate-100 rounded-xl p-3 flex gap-3 shadow-sm"
            >
              <div className="w-16 h-16 bg-slate-100 rounded-lg shrink-0 overflow-hidden relative border border-slate-200/50">
                {task.mediaType === "document" ? (
                  <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-500">
                    <FileText className="w-6 h-6" />
                  </div>
                ) : task.mediaType === "video" ? (
                  <video
                    src={getDirectMediaUrl(
                      task.mediaUrl || task.mediaUrls?.[0] || "",
                      "video",
                    )}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={getDirectMediaUrl(
                      task.mediaUrl || task.mediaUrls?.[0] || "",
                      "image",
                    )}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://ui-avatars.com/api/?name=P&background=f1f5f9&color=94a3b8`;
                    }}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-2 my-0.5">
                  <h4 className="font-bold text-sm text-slate-900 truncate">
                    {task.projectTitle}
                  </h4>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${task.status === "approved" ? "bg-green-100 text-green-700" : task.status === "reviewed" ? "bg-amber-100 text-amber-700" : task.status === "rejected" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}
                  >
                    {task.status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 truncate">
                  {task.caption || "Tidak ada caption"}
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Avatar className="h-5 w-5 border-2 border-white shadow-sm relative z-20">
                      <AvatarImage src={task.author?.image} />
                      <AvatarFallback className="text-[8px] bg-blue-100 text-blue-700">
                        {task.author?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    {task.collaborators && task.collaborators.length > 0 && (
                      <div className="flex -ml-1.5">
                        {task.collaborators
                          .slice(0, 2)
                          .map((collab: any, i: number) => (
                            <Avatar
                              key={i}
                              className={`h-5 w-5 border-2 border-white shadow-sm relative ${i === 0 ? "z-10" : "z-0"} -ml-0.5`}
                            >
                              <AvatarImage src={collab.image} />
                              <AvatarFallback className="text-[8px] bg-slate-100 text-slate-600">
                                {collab.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        {task.collaborators.length > 2 && (
                          <div className="h-5 w-5 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center -ml-1.5 z-[-1] shadow-sm">
                            <span className="text-[8px] font-bold text-slate-600">
                              +{task.collaborators.length - 2}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <span className="text-[10px] text-slate-500 font-medium ml-2 truncate">
                      {task.author?.name}{" "}
                      {task.collaborators?.length > 0 &&
                        `+${task.collaborators.length}`}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTask(task.id)}
                    className="h-6 text-[10px] text-red-500 hover:text-red-700 hover:bg-red-50 px-2 font-bold"
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
    </div>
  );
}
