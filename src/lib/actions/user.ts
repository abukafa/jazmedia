"use server";

import { apiClient } from "@/lib/api-client";
import { revalidatePath } from "next/cache";

export async function getUserProfile() {
  try {
    const res = await apiClient.get("/media/profile");
    return res.data || null;
  } catch (error) {
    return null;
  }
}

export async function updateUserProfile(formData: FormData) {
  try {
    const res = await apiClient.put("/media/profile", formData);
    revalidatePath("/profile");
    return { success: true, ...res };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getPublicProfile(userId: string) {
  try {
    const res = await apiClient.get(`/media/users/${userId}/public`);
    return {
      success: true,
      data: res.data,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
