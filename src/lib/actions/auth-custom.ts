"use server";

import { apiClient } from "@/lib/api-client";

export async function registerUser(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !username || !password) {
      return { success: false, error: "Semua field wajib diisi" };
    }

    const res = await apiClient.post("/media/auth/register", {
      name,
      email,
      username,
      password,
    });

    return { success: true, ...res };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function linkInstagramAccount(
  instagramId: string,
  name: string,
  username: string,
  image: string,
  bio: string
) {
  try {
    const res = await apiClient.post("/media/auth/instagram/link", {
      instagramId,
      name,
      username,
      image,
      bio,
    });

    return { success: true, ...res };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function unlinkInstagramAccount() {
  try {
    const res = await apiClient.post("/media/auth/instagram/unlink");
    return { success: true, ...res };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
