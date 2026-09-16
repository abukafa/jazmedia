"use server";

import { apiClient } from "@/lib/api-client";

export async function exchangeInstagramCode(code: string) {
  try {
    const res = await apiClient.post("/media/auth/instagram/exchange-code", {
      code,
    });
    return res;
  } catch (err: any) {
    return { error: err.message || "Gagal menukarkan kode Instagram" };
  }
}
