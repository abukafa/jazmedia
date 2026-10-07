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

export async function searchStudents(query: string) {
  if (!query) return [];
  try {
    const res: any = await apiClient.get('/v1/public/students');
    const data = res.data || res;
    const items = Array.isArray(data) ? data : [];
    
    const q = query.toLowerCase();
    const filtered = items.filter((item: any) => 
      (item.name && item.name.toLowerCase().includes(q)) || 
      (item.nickname && item.nickname.toLowerCase().includes(q))
    );
    
    return filtered.map((s: any) => ({
      _id: s.id.toString(),
      id: s.id.toString(),
      name: s.name,
      username: s.nickname || s.name.toLowerCase().replace(/\s/g, ""),
      image: s.image ? (s.image.startsWith('http') ? s.image : 'https://jazacademy.id/storage/' + s.image) : '',
      role: s.role || 'Siswa',
      bio: s.ambition || s.hobby || ''
    }));
  } catch (error) {
    console.error("searchStudents error:", error);
    return [];
  }
}

export async function searchTeachers(query: string) {
  if (!query) return [];
  try {
    const res: any = await apiClient.get('/v1/public/teachers');
    const data = res.data || res;
    const items = Array.isArray(data) ? data : [];
    
    const q = query.toLowerCase();
    const filtered = items.filter((item: any) => 
      (item.name && item.name.toLowerCase().includes(q)) || 
      (item.nickname && item.nickname.toLowerCase().includes(q))
    );
    
    return filtered.map((t: any) => ({
      _id: t.id.toString(),
      id: t.id.toString(),
      name: t.name,
      username: t.nickname || t.name.toLowerCase().replace(/\s/g, ""),
      image: t.image ? (t.image.startsWith('http') ? t.image : 'https://jazacademy.id/storage/' + t.image) : '',
      role: 'mentor',
      bio: t.note || ''
    }));
  } catch (error) {
    console.error("searchTeachers error:", error);
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
