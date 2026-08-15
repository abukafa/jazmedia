import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    await connectToDatabase();
    
    // Get all members, exclude password, but include email as requested
    const members = await User.find({ role: "member" })
      .select("-password")
      .lean();
      
    return NextResponse.json({ success: true, data: members });
  } catch (error: any) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}
