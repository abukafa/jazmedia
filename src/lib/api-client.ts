import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export function getApiBaseUrl(): string {
  const envUrl = process.env.JAZACADEMY_API_URL;
  if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
    return envUrl.replace(/\/$/, "");
  }
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return "https://jazacademy.id/api";
  }
  return (envUrl || "http://localhost:8000/api").replace(/\/$/, "");
}

export function getIdpBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_JAZACADEMY_URL || process.env.JAZACADEMY_URL;
  if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
    return envUrl.replace(/\/$/, "");
  }
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return "https://jazacademy.id";
  }
  return (envUrl || "http://localhost:8000").replace(/\/$/, "");
}

export async function getAuthToken(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);
    return (session as any)?.accessToken || null;
  } catch (error) {
    return null;
  }
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Attach auth token if available and not already provided
  if (!headers["Authorization"]) {
    const token = options.token || (await getAuthToken());
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  // Attach platform API Key if available (for restricted API endpoints)
  if (!headers["X-API-Key"] && process.env.JAZACADEMY_API_KEY) {
    headers["X-API-Key"] = process.env.JAZACADEMY_API_KEY;
  }

  // If body is not FormData, ensure Content-Type is application/json
  if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
    cache: options.cache || "no-store",
  });

  const contentType = response.headers.get("content-type");
  let data: any = null;
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    if (response.status === 401) {
      console.warn(
        `[apiFetch 401] Unauthorized on ${options.method || "GET"} ${url}.` +
        ` Token attached: ${headers["Authorization"] ? headers["Authorization"].substring(0, 15) + "..." : "NONE"}.` +
        ` Catatan: Jika berganti konfigurasi target backend (local <-> hosting), sesi lama harus Logout dan Login ulang.`
      );
    }
    const errorMessage =
      (data && typeof data === "object" && (data.error || data.message)) ||
      `API request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data as T;
}

export const apiClient = {
  get: <T = any>(endpoint: string, options?: RequestInit & { token?: string }) =>
    apiFetch<T>(endpoint, { ...options, method: "GET" }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestInit & { token?: string }) => {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    return apiFetch<T>(endpoint, {
      ...options,
      method: "POST",
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    });
  },

  put: <T = any>(endpoint: string, body?: any, options?: RequestInit & { token?: string }) => {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    return apiFetch<T>(endpoint, {
      ...options,
      method: "PUT",
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    });
  },

  delete: <T = any>(endpoint: string, options?: RequestInit & { token?: string }) =>
    apiFetch<T>(endpoint, { ...options, method: "DELETE" }),
};
