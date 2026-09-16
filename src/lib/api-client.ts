import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const API_BASE_URL = process.env.JAZACADEMY_API_URL || "http://localhost:8000/api";

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
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

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
