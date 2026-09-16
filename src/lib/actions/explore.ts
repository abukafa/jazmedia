"use server";

import { apiClient } from "@/lib/api-client";

export async function searchTasks(query: string) {
  if (!query) return [];
  try {
    const res = await apiClient.get(`/media/explore/tasks?q=${encodeURIComponent(query)}`);
    return Array.isArray(res) ? res : res.data || [];
  } catch (error) {
    console.error("searchTasks error:", error);
    return [];
  }
}

export async function getMemberStreaks(query: string = "") {
  try {
    const res = await apiClient.get(`/media/explore/streaks?q=${encodeURIComponent(query)}`);
    return Array.isArray(res) ? res : res.data || [];
  } catch (error) {
    console.error("getMemberStreaks error:", error);
    return [];
  }
}

export async function searchUsers(query: string) {
  if (!query) return [];
  try {
    const res = await apiClient.get(`/media/explore/users?q=${encodeURIComponent(query)}`);
    return Array.isArray(res) ? res : res.data || [];
  } catch (error) {
    console.error("searchUsers error:", error);
    return [];
  }
}

export async function searchProjects(query: string) {
  if (!query) return [];
  try {
    const res = await apiClient.get(`/media/explore/projects?q=${encodeURIComponent(query)}`);
    return Array.isArray(res) ? res : res.data || [];
  } catch (error) {
    console.error("searchProjects error:", error);
    return [];
  }
}
