"use server";

import { apiClient } from "@/lib/api-client";
import { uploadToGDrive, finalizeDriveUpload } from "@/lib/actions/upload";
import { revalidatePath } from "next/cache";

export async function submitTask(formData: FormData) {
  const caption = formData.get("caption") as string;
  const projectId = formData.get("projectId") as string;
  const mediaType = (formData.get("mediaType") as string) || "image";

  const files = formData.getAll("files") as File[];
  const preuploadedIds = formData.getAll("preuploadedIds") as string[];

  const collaboratorsStr = formData.get("collaborators") as string;
  const collaborators = collaboratorsStr ? JSON.parse(collaboratorsStr) : [];

  if ((!files || files.length === 0) && (!preuploadedIds || preuploadedIds.length === 0)) {
    return { success: false, error: "Media harus diisi." };
  }
  if (!projectId) {
    return { success: false, error: "Project harus diisi." };
  }

  try {
    // 1. Upload new files via Google Drive
    const mediaUrls: string[] = [];
    if (files && files.length > 0) {
      const newUrls = await Promise.all(
        files.map(async (file) => await uploadToGDrive(file, mediaType + "s"))
      );
      mediaUrls.push(...newUrls);
    }

    // 2. Finalize pre-uploaded files
    if (preuploadedIds && preuploadedIds.length > 0) {
      const finalizedUrls = await Promise.all(
        preuploadedIds.map(async (id) => {
          const res = await finalizeDriveUpload(id);
          if (!res.success) throw new Error("Gagal mengamankan akses file: " + res.error);
          return res.url as string;
        })
      );
      mediaUrls.push(...finalizedUrls);
    }

    // 3. Submit Task to JazAcademy API
    const payload = {
      projectId,
      mediaType,
      caption,
      mediaUrls,
      mediaUrl: mediaUrls[0] || "",
      collaborators,
    };

    const res = await apiClient.post("/media/tasks", payload);

    revalidatePath("/");
    revalidatePath("/profile");

    return {
      success: true,
      taskId: res.taskId || res.data?.id,
    };
  } catch (error: any) {
    console.error("Submit task error:", error);
    return { success: false, error: error.message };
  }
}

export async function getTasks({ pageParam = 1 }: { pageParam?: number }) {
  try {
    const res = await apiClient.get(`/media/tasks?pageParam=${pageParam}&limit=5`);
    return {
      data: res.data || [],
      nextPage: res.nextPage || undefined,
    };
  } catch (error) {
    console.error("Get tasks error:", error);
    return {
      data: [],
      nextPage: undefined,
    };
  }
}

export interface PostFormData {
  projects: { id: string; title: string }[];
  users: { id: string; name: string; username?: string; image?: string }[];
}

export interface BestPerformanceTask {
  id: string;
  caption: string;
  mediaUrl: string;
  mediaUrls?: string[];
  mediaType: "image" | "video" | "document";
  status: string;
  createdAt: string;
  likesCount?: number;
  isLikedByMe?: boolean;
  commentsCount?: number;
  author: {
    id?: string;
    name: string;
    image: string;
    username?: string;
  };
  collaborators?: {
    name: string;
    image: string;
  }[];
  projectTitle: string;
  project?: {
    id: string;
    title: string;
    managerId?: string;
  };
  review?: {
    grade: number;
    comment: string;
    mentorName: string;
  };
}

export async function getPostFormData(): Promise<{ success: boolean; data?: PostFormData; error?: string }> {
  try {
    const res = await apiClient.get<{ success: boolean; data: PostFormData }>("/media/tasks/form-data");
    return {
      success: true,
      data: res.data || { projects: [], users: [] },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getUserTasks(userId: string) {
  try {
    const res = await apiClient.get(`/media/tasks/user/${userId}`);
    return {
      success: true,
      data: res.data || [],
    };
  } catch (error: any) {
    console.error("Get user tasks error:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleLike(taskId: string) {
  try {
    const res = await apiClient.post(`/media/tasks/${taskId}/like`);
    revalidatePath("/");
    revalidatePath("/explore");
    return {
      success: true,
      isLikedByMe: res.isLikedByMe,
      likesCount: res.likesCount,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addComment(taskId: string, content: string) {
  try {
    const res = await apiClient.post(`/media/tasks/${taskId}/comments`, { content });
    return { success: true, data: res.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getComments(taskId: string) {
  try {
    const res = await apiClient.get(`/media/tasks/${taskId}/comments`);
    return { success: true, data: res.data || [] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function submitReview(
  taskId: string,
  grade: number,
  comment: string,
  status: "reviewed" | "rejected" | "pending" = "reviewed"
) {
  try {
    const res = await apiClient.put(`/media/tasks/${taskId}/review`, {
      grade,
      comment,
      status,
    });
    revalidatePath("/");
    revalidatePath("/profile");
    return { success: true, ...res };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function approveTask(taskId: string) {
  try {
    const res = await apiClient.put(`/media/tasks/${taskId}/approve`);
    revalidatePath("/");
    revalidatePath("/explore");
    revalidatePath("/profile");
    return { success: true, ...res };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTaskCaption(taskId: string, newCaption: string) {
  try {
    const res = await apiClient.put(`/media/tasks/${taskId}/caption`, {
      caption: newCaption,
    });
    revalidatePath("/");
    revalidatePath("/explore");
    revalidatePath("/profile");
    return { success: true, ...res };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTask(taskId: string) {
  try {
    const res = await apiClient.delete(`/media/tasks/${taskId}`);
    revalidatePath("/");
    revalidatePath("/explore");
    revalidatePath("/profile");
    return { success: true, ...res };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getBestPerformanceTasks(): Promise<{ success: boolean; data: BestPerformanceTask[] }> {
  try {
    const res = await apiClient.get<{ success: boolean; data: BestPerformanceTask[] }>("/media/tasks/best-performance");
    return {
      success: true,
      data: res.data || [],
    };
  } catch (error: any) {
    console.error("getBestPerformanceTasks error:", error);
    return { success: false, data: [] };
  }
}
