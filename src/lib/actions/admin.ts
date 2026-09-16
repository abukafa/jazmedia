"use server";

import { apiClient } from "@/lib/api-client";
import { revalidatePath } from "next/cache";

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  image?: string;
}

export interface MentorOption {
  id: string;
  name: string;
}

export interface AdminProject {
  id: string;
  title: string;
  description: string;
  status: string;
  mentorId?: string;
  mentorName?: string;
  projectManagerId?: string;
  projectManagerName?: string;
  creatorId?: string;
  participantsCount: number;
  taskCount: number;
  myTaskCount: number;
  createdAt: string;
}

// ---------------------------
// USERS MASTER DATA
// ---------------------------
export async function getAllUsers(): Promise<{ success: boolean; data: AdminUser[]; error?: string }> {
  try {
    const res = await apiClient.get<{ success: boolean; data: AdminUser[] }>("/media/admin/users");
    return {
      success: true,
      data: res.data || [],
    };
  } catch (err: any) {
    return { success: false, data: [], error: err.message };
  }
}

export async function updateUserRole(userId: string, newRole: string) {
  try {
    const res = await apiClient.put(`/media/admin/users/${userId}/role`, {
      role: newRole,
    });
    revalidatePath("/profile");
    return { success: true, ...res };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteUser(userId: string) {
  try {
    const res = await apiClient.delete(`/media/admin/users/${userId}`);
    revalidatePath("/profile");
    return { success: true, ...res };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ---------------------------
// MENTORS DATA (For Select)
// ---------------------------
export async function getAllMentors(): Promise<{ success: boolean; data: MentorOption[]; error?: string }> {
  try {
    const res = await apiClient.get<{ success: boolean; data: MentorOption[] }>("/media/admin/mentors");
    return {
      success: true,
      data: res.data || [],
    };
  } catch (err: any) {
    return { success: false, data: [], error: err.message };
  }
}

export async function getAllUsersForSelect(): Promise<{ success: boolean; data: MentorOption[]; error?: string }> {
  try {
    const res = await apiClient.get<{ success: boolean; data: MentorOption[] }>("/media/admin/users-select");
    return {
      success: true,
      data: res.data || [],
    };
  } catch (err: any) {
    return { success: false, data: [], error: err.message };
  }
}

// ---------------------------
// PROJECTS MASTER DATA
// ---------------------------
export async function getAllProjects(page = 1, limit = 5): Promise<{
  success: boolean;
  data: AdminProject[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
  error?: string;
}> {
  try {
    const res = await apiClient.get<{
      success: boolean;
      data: AdminProject[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>(`/media/admin/projects?page=${page}&limit=${limit}`);
    return {
      success: true,
      data: res.data || [],
      pagination: res.pagination || {
        total: res.data?.length || 0,
        page,
        limit,
        totalPages: 1,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      data: [],
      pagination: { total: 0, page, limit, totalPages: 1 },
      error: err.message,
    };
  }
}

export async function createProject(formData: FormData) {
  try {
    const res = await apiClient.post("/media/projects", formData);
    revalidatePath("/profile");
    return { success: true, ...res };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateProject(projectId: string, formData: FormData) {
  try {
    const res = await apiClient.put(`/media/projects/${projectId}`, formData);
    revalidatePath("/profile");
    return { success: true, ...res };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteProject(projectId: string) {
  try {
    const res = await apiClient.delete(`/media/projects/${projectId}`);
    revalidatePath("/profile");
    return { success: true, ...res };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ---------------------------
// TASKS MASTER DATA
// ---------------------------
export async function getAllTasks() {
  try {
    const res = await apiClient.get("/media/admin/tasks");
    return {
      success: true,
      data: res.data || [],
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteTask(taskId: string) {
  try {
    const res = await apiClient.delete(`/media/tasks/${taskId}`);
    revalidatePath("/profile");
    revalidatePath("/");
    return { success: true, ...res };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
