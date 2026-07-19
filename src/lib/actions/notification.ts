"use server";

import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";
import Task from "@/models/Task";
import User from "@/models/User";
import Project from "@/models/Project";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.id;
}

export async function getPendingTaskNotifications() {
  try {
    await dbConnect();
    const tasks = await Task.find({ status: "pending" })
      .populate({ path: "authorId", select: "name image", model: User })
      .populate({ path: "collaborators", select: "name image", model: User })
      .populate({ path: "projectId", select: "title", model: Project })
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(tasks)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getReviewedTaskNotifications() {
  try {
    await dbConnect();
    const tasks = await Task.find({ status: { $in: ["reviewed", "approved"] } })
      .populate({ path: "authorId", select: "name image", model: User })
      .populate({ path: "collaborators", select: "name image", model: User })
      .populate({ path: "projectId", select: "title", model: Project })
      .populate({ path: "review.mentorId", select: "name image", model: User })
      .sort({ "review.reviewedAt": -1, updatedAt: -1 })
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(tasks)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getSystemReminders() {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    await dbConnect();
    const user = await User.findById(userId).lean();
    if (!user) return { success: false, error: "User not found" };

    const reminders = [];

    // Reminder > 3 hari belum ada postingan
    const lastTask = await Task.findOne({
      $or: [{ authorId: userId }, { collaborators: userId }]
    }).sort({ createdAt: -1 }).lean();

    const now = new Date();
    if (!lastTask) {
      reminders.push({ type: "no_post", message: "Anda belum pernah memposting tugas. Yuk mulai unggah karya Anda!" });
    } else {
      const diffTime = Math.abs(now.getTime() - new Date(lastTask.createdAt).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 3) {
        reminders.push({ type: "inactive", message: `Sudah ${diffDays} hari sejak postingan terakhir Anda. Ayo unggah progress terbaru!` });
      }
    }

    // Reminder khusus mentor/admin
    if (user.role === "mentor" || user.role === "admin") {
      const pendingCount = await Task.countDocuments({ status: "pending" });
      if (pendingCount > 0) {
        reminders.push({ type: "pending_review", message: `Ada ${pendingCount} postingan yang menunggu untuk direview.` });
      }
    }

    return { success: true, data: reminders };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUnreadCount() {
  const userId = await getUserId();
  if (!userId) return 0;

  try {
    await dbConnect();
    const user = await User.findById(userId).lean();
    if (!user) return 0;

    let count = 0;
    
    // Untuk mentor, hitung task pending
    if (user.role === "mentor" || user.role === "admin") {
      count = await Task.countDocuments({ status: "pending" });
    } else {
      // Untuk member, hitung task yang sudah di-review
      count = await Task.countDocuments({ status: { $in: ["reviewed", "approved"] } });
    }

    return count;
  } catch (error) {
    return 0;
  }
}
