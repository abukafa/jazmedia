"use server";

import { apiClient } from "@/lib/api-client";
import { revalidatePath } from "next/cache";

export async function getBlogs(
  options: {
    category?: string;
    query?: string;
    limit?: number;
  } = {}
) {
  try {
    const params = new URLSearchParams();
    if (options.category && options.category !== "All") {
      params.append("category", options.category);
    }
    if (options.query && options.query.trim()) {
      params.append("query", options.query.trim());
    }
    if (options.limit) {
      params.append("limit", options.limit.toString());
    }

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const res = await apiClient.get(`/media/blogs${queryString}`);

    return {
      success: true,
      data: res.data || [],
    };
  } catch (error: any) {
    console.error("Error fetching blogs:", error);
    return {
      success: false,
      data: [],
    };
  }
}

export async function getBlogById(idOrSlug: string) {
  try {
    const res = await apiClient.get(`/media/blogs/${encodeURIComponent(idOrSlug)}`);
    return {
      success: true,
      data: res.data,
    };
  } catch (error: any) {
    console.error("Error fetching blog by ID:", error);
    return {
      success: false,
      error: error.message || "Gagal mengambil data artikel.",
    };
  }
}

export async function createBlog(formData: FormData) {
  try {
    const res = await apiClient.post("/media/blogs", formData);

    revalidatePath("/blogs");
    revalidatePath("/");

    return {
      success: true,
      data: res.data,
    };
  } catch (error: any) {
    console.error("Error creating blog:", error);
    return {
      success: false,
      error: error.message || "Gagal membuat artikel blog.",
    };
  }
}

export async function likeBlog(id: string) {
  try {
    const res = await apiClient.post(`/media/blogs/${id}/like`);

    revalidatePath("/blogs");

    return {
      success: true,
      likes: res.likes,
      isLiked: res.isLiked,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal menyukai artikel.",
    };
  }
}

export async function getBlogComments(blogId: string) {
  try {
    const res = await apiClient.get(`/media/blogs/${blogId}/comments`);
    return {
      success: true,
      data: res.data || [],
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengambil komentar." };
  }
}

export async function addBlogComment(blogId: string, content: string) {
  try {
    const res = await apiClient.post(`/media/blogs/${blogId}/comments`, { content });

    revalidatePath("/blogs");

    return {
      success: true,
      data: res.data,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menambahkan komentar." };
  }
}

export async function getBlogCategories() {
  try {
    const res = await apiClient.get("/media/blogs/categories");
    return {
      success: true,
      data: res.data || [],
    };
  } catch (error) {
    return { success: false, data: [] };
  }
}

export async function deleteBlog(id: string) {
  try {
    const res = await apiClient.delete(`/media/blogs/${id}`);

    revalidatePath("/blogs");
    revalidatePath("/");

    return { success: true, ...res };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus artikel." };
  }
}

export async function updateBlog(id: string, formData: FormData) {
  try {
    const res = await apiClient.put(`/media/blogs/${id}`, formData);

    revalidatePath("/blogs");
    revalidatePath("/");

    return { success: true, ...res };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal memperbarui artikel." };
  }
}
