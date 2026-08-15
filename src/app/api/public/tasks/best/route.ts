import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Task from "@/models/Task";
import User from "@/models/User";
import Comment from "@/models/Comment";

export async function GET() {
  try {
    await connectToDatabase();
    
    // Ensure models are registered (prevents tree-shaking from removing them)
    if (!User || !Comment) console.warn("Models not loaded");
    
    // Get date for 1 week ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get 10 best tasks from the last 1 week, sorted by mentor review grade
    const bestTasks = await Task.find({
      "review.grade": { $exists: true, $ne: null },
      createdAt: { $gte: oneWeekAgo }
    })
      .sort({ "review.grade": -1 })
      .limit(10)
      .populate({
        path: "authorId",
        select: "name image username email _id",
      })
      .populate({
        path: "likes",
        select: "name image username email _id",
      })
      .lean();
      
    // Fetch comments for these tasks
    const tasksWithComments = await Promise.all(
      bestTasks.map(async (task) => {
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
    console.error("Error fetching best tasks:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch best tasks" },
      { status: 500 }
    );
  }
}
