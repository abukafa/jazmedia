import { NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";

export async function GET() {
  try {
    const res = await apiClient.get("/public/tasks/best");
    return NextResponse.json(res);
  } catch (error: any) {
    console.error("Error fetching best tasks:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch best tasks" },
      { status: 500 }
    );
  }
}
