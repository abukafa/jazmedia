"use server";

import { apiClient } from "@/lib/api-client";
import { revalidatePath } from "next/cache";

export interface MetricDetail {
  label: string;
  value: number;
  description: string;
  delta: number | null;
}

export interface ReflectionAuthor {
  id: string;
  name: string;
  username: string;
  image: string;
  role: string;
}

export interface ReflectionItem {
  id: string;
  numeric_id: number;
  date: string;
  formattedDate: string;
  timeAgo: string;
  author: ReflectionAuthor;
  narrative: string;
  metrics: {
    achievement: MetricDetail;
    obstacles: MetricDetail;
    lessons: MetricDetail;
    priority: MetricDetail;
    health: MetricDetail;
    average?: MetricDetail;
  };
  isFirstReflection: boolean;
  createdAt: string | null;
}

export interface ReflectionPayload {
  date: string;
  achievement: {
    nilai: number;
    deskripsi: string;
  };
  obstacles: {
    nilai: number;
    deskripsi: string;
  };
  lessons: {
    nilai: number;
    deskripsi: string;
  };
  priority: {
    nilai: number;
    deskripsi: string;
  };
  health: {
    nilai: number;
    deskripsi: string;
  };
}

export async function getReflections(options: {
  page?: number;
  perPage?: number;
  studentId?: string;
  userId?: string;
} = {}) {
  try {
    const params = new URLSearchParams();
    if (options.page) params.append("page", options.page.toString());
    if (options.perPage) params.append("per_page", options.perPage.toString());
    if (options.studentId) params.append("student_id", options.studentId);
    if (options.userId) params.append("user_id", options.userId);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const res = await apiClient.get(`/media/reflections${queryString}`);

    return {
      success: true,
      data: (res.data || []) as ReflectionItem[],
      pagination: res.pagination || null,
    };
  } catch (error: any) {
    console.error("Error fetching reflections:", error);
    return {
      success: false,
      data: [] as ReflectionItem[],
      pagination: null,
      error: error.message || "Gagal memuat feed refleksi.",
    };
  }
}

export async function getMyReflections() {
  try {
    const res = await apiClient.get("/media/reflections/user/me");
    return {
      success: true,
      data: (res.data || []) as ReflectionItem[],
    };
  } catch (error: any) {
    console.error("Error fetching my reflections:", error);
    return {
      success: false,
      data: [] as ReflectionItem[],
      error: error.message || "Gagal memuat refleksi saya.",
    };
  }
}

export async function getReflectionById(id: string | number) {
  try {
    const res = await apiClient.get(`/media/reflections/${id}`);
    return {
      success: true,
      data: res.data as ReflectionItem,
    };
  } catch (error: any) {
    console.error("Error fetching reflection detail:", error);
    return {
      success: false,
      error: error.message || "Gagal memuat detail refleksi.",
    };
  }
}

export async function submitReflection(payload: ReflectionPayload) {
  try {
    const res = await apiClient.post("/media/reflections", payload);

    revalidatePath("/reflections");
    revalidatePath("/post");
    revalidatePath("/profile");

    return {
      success: true,
      data: res.data as ReflectionItem,
      message: res.message || "Refleksi mingguan berhasil disimpan.",
    };
  } catch (error: any) {
    console.error("Error submitting reflection:", error);
    return {
      success: false,
      error: error.message || "Gagal menyimpan refleksi.",
    };
  }
}