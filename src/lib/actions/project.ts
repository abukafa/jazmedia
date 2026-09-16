"use server";

import { apiClient } from "@/lib/api-client";

export async function getPublicProjects(statusFilter: string = "all") {
  try {
    const res = await apiClient.get(`/media/projects?status=${statusFilter}`);
    return {
      success: true,
      data: res.data || [],
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getProjectById(projectId: string) {
  try {
    const res = await apiClient.get(`/media/projects/${projectId}`);
    return {
      success: true,
      data: res.data,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
