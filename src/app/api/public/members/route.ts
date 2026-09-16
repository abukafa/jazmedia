import { NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";

export async function GET() {
  try {
    const res = await apiClient.get("/public/members");
    return NextResponse.json(res);
  } catch (error: any) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}
