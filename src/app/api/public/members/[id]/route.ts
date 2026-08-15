import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    await connectToDatabase();
    
    const member = await User.findOne({ _id: id, role: "member" })
      .select("-password")
      .lean();
      
    if (!member) {
      return NextResponse.json(
        { success: false, error: "Member not found" },
        { status: 404 }
      );
    }
      
    return NextResponse.json({ success: true, data: member });
  } catch (error: any) {
    console.error("Error fetching member by id:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch member" },
      { status: 500 }
    );
  }
}
