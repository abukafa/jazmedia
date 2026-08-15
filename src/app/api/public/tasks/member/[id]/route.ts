import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Task from "@/models/Task";
import User from "@/models/User";
import Comment from "@/models/Comment";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    await connectToDatabase();
    
    // We fetch tasks by authorId. We also populate likes and comments.
    const tasks = await Task.find({ authorId: id })
      .populate({
        path: "likes",
        select: "name image username email _id", // Exclude password
      })
      .lean();
      
    // Since comments are in a separate collection, we need to fetch them manually
    // or use virtuals. Here we fetch them manually.
    const tasksWithComments = await Promise.all(
      tasks.map(async (task) => {
        const comments = await Comment.find({ taskId: task._id })
          .populate({
            path: "authorId",
            select: "name image username email _id",
          })
          .sort({ createdAt: -1 })
          .lean();
          
        return {
          ...task,
          comments,
        };
      })
    );
      
    return NextResponse.json({ success: true, data: tasksWithComments });
  } catch (error: any) {
    console.error("Error fetching tasks by member id:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
