"use server";

import dbConnect from "@/lib/db";
import Task from "@/models/Task";
import User from "@/models/User";
import Project from "@/models/Project";
import Comment from "@/models/Comment";
import { uploadToGDrive, finalizeDriveUpload } from "@/lib/actions/upload";
import { revalidatePath } from "next/cache";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function submitTask(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "Unauthorized" };
  
  await dbConnect();
  const dbUser = await User.findById((session.user as any).id).lean();
  if (!dbUser) return { success: false, error: "User not found" };

  const authorId = dbUser._id;

  const caption = formData.get("caption") as string;
  const projectId = formData.get("projectId") as string;
  const mediaType = formData.get("mediaType") as string; // image, video, document
  
  const files = formData.getAll("files") as File[];
  const preuploadedIds = formData.getAll("preuploadedIds") as string[];
  
  const collaboratorsStr = formData.get("collaborators") as string;
  const collaborators = collaboratorsStr ? JSON.parse(collaboratorsStr) : [];

  if ((!files || files.length === 0) && (!preuploadedIds || preuploadedIds.length === 0)) {
    return { success: false, error: "Media harus diisi." };
  }
  if (!projectId) {
    return { success: false, error: "Project harus diisi." };
  }

  try {
    // 1. Upload new files (fallback)
    let mediaUrls: string[] = [];
    if (files && files.length > 0) {
      const newUrls = await Promise.all(
        files.map(async (file) => await uploadToGDrive(file, mediaType + "s"))
      );
      mediaUrls.push(...newUrls);
    }

    // 2. Finalize pre-uploaded files
    if (preuploadedIds && preuploadedIds.length > 0) {
      const finalizedUrls = await Promise.all(
        preuploadedIds.map(async (id) => {
          const res = await finalizeDriveUpload(id);
          if (!res.success) throw new Error("Gagal mengamankan akses file: " + res.error);
          return res.url as string;
        })
      );
      mediaUrls.push(...finalizedUrls);
    }
    
    // 3. Save to MongoDB
    const newTask = await Task.create({
      mediaUrl: mediaUrls[0],
      mediaUrls,
      mediaType,
      caption,
      projectId,
      authorId,
      collaborators,
      status: "pending",
    });

    revalidatePath("/");
    revalidatePath("/profile");
    
    return { success: true, taskId: newTask._id.toString() };
  } catch (error: any) {
    console.error("Submit task error:", error);
    return { success: false, error: error.message };
  }
}

export async function getTasks({ pageParam = 1 }: { pageParam?: number }) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const limit = 5;
    const skip = (pageParam - 1) * limit;

    const tasks = await Task.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("authorId", "name image")
      .populate("collaborators", "name image")
      .populate("projectId", "title")
      .lean();

    // Calculate time ago helper
    const timeAgo = (date: Date) => {
      const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
      let interval = seconds / 31536000;
      if (interval > 1) return Math.floor(interval) + " tahun";
      interval = seconds / 2592000;
      if (interval > 1) return Math.floor(interval) + " bulan";
      interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + " hari";
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + " jam";
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + " menit";
      return Math.floor(seconds) + " detik";
    };

    // Map to MVP TaskCard format
    const formattedTasks = await Promise.all(tasks.map(async (task: any) => {
      const commentsCount = await Comment.countDocuments({ taskId: task._id });
      return {
        id: task._id.toString(),
        author: {
          id: task.authorId?._id?.toString() || "",
          name: task.authorId?.name || "Member",
          image: task.authorId?.image || "https://i.pravatar.cc/150",
        },
        collaborators: task.collaborators?.map((c: any) => ({
          name: c.name,
          image: c.image || "https://i.pravatar.cc/150",
        })) || [],
        projectTitle: task.projectId?.title || "Project",
        mediaUrl: task.mediaUrl,
        mediaUrls: task.mediaUrls || [task.mediaUrl],
        mediaType: task.mediaType,
        caption: task.caption,
        timeAgo: timeAgo(task.createdAt) + " yang lalu",
        review: task.review?.grade ? {
          grade: task.review.grade,
          comment: task.review.comment,
          mentorName: "Mentor", // Should probably populate this later
        } : undefined,
        likesCount: task.likes?.length || 0,
        isLikedByMe: userId ? task.likes?.some((id: any) => id.toString() === userId.toString()) : false,
        commentsCount,
        createdAt: task.createdAt.toISOString(),
      };
    }));

    return {
      data: formattedTasks,
      nextPage: tasks.length === limit ? pageParam + 1 : undefined,
    };
  } catch (error) {
    console.error("Get tasks error:", error);
    return {
      data: [],
      nextPage: undefined,
    };
  }
}

export async function getPostFormData() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "Unauthorized" };
  
  try {
    await dbConnect();
    const projects = await Project.find({ status: "active" }).select("title _id").lean();
    const users = await User.find({ _id: { $ne: (session.user as any).id } }).select("name username image").lean();
    
    return {
      success: true,
      data: {
        projects: projects.map(p => ({ id: p._id.toString(), title: p.title })),
        users: users.map(u => ({ id: u._id.toString(), name: u.name, username: u.username, image: u.image }))
      }
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getUserTasks(userId: string) {
  try {
    await dbConnect();

    const tasks = await Task.find({
      $or: [{ authorId: userId }, { collaborators: userId }]
    })
      .sort({ createdAt: -1 })
      .populate("authorId", "name image")
      .populate("collaborators", "name image")
      .populate("projectId", "title")
      .lean();

    // Calculate time ago helper
    const timeAgo = (date: Date) => {
      const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
      let interval = seconds / 31536000;
      if (interval > 1) return Math.floor(interval) + " tahun";
      interval = seconds / 2592000;
      if (interval > 1) return Math.floor(interval) + " bulan";
      interval = seconds / 86400;
      if (interval > 1) return Math.floor(interval) + " hari";
      interval = seconds / 3600;
      if (interval > 1) return Math.floor(interval) + " jam";
      interval = seconds / 60;
      if (interval > 1) return Math.floor(interval) + " menit";
      return Math.floor(seconds) + " detik";
    };

    const session = await getServerSession(authOptions);
    const sessionUserId = (session?.user as any)?.id;

    // Map to MVP TaskCard format
    const formattedTasks = await Promise.all(tasks.map(async (task: any) => {
      const commentsCount = await Comment.countDocuments({ taskId: task._id });
      return {
        id: task._id.toString(),
        author: {
          id: task.authorId?._id?.toString() || "",
          name: task.authorId?.name || "Member",
          image: task.authorId?.image || "https://i.pravatar.cc/150",
        },
        collaborators: task.collaborators?.map((c: any) => ({
          name: c.name,
          image: c.image || "https://i.pravatar.cc/150",
        })) || [],
        projectTitle: task.projectId?.title || "Project",
        mediaUrl: task.mediaUrl,
        mediaUrls: task.mediaUrls || [task.mediaUrl],
        mediaType: task.mediaType,
        caption: task.caption,
        timeAgo: timeAgo(task.createdAt) + " yang lalu",
        review: task.review?.grade ? {
          grade: task.review.grade,
          comment: task.review.comment,
          mentorName: "Mentor",
        } : undefined,
        likesCount: task.likes?.length || 0,
        isLikedByMe: sessionUserId ? task.likes?.some((id: any) => id.toString() === sessionUserId.toString()) : false,
        commentsCount,
        createdAt: task.createdAt.toISOString(),
      };
    }));

    return { success: true, data: formattedTasks };
  } catch (error: any) {
    console.error("Get user tasks error:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleLike(taskId: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return { success: false, error: "Unauthorized" };
  await dbConnect();
  try {
    const task = await Task.findById(taskId);
    if (!task) return { success: false, error: "Not found" };
    
    const isLiked = task.likes?.some((id: any) => id.toString() === userId.toString());
    
    if (isLiked) {
      await Task.findByIdAndUpdate(taskId, { $pull: { likes: userId } });
    } else {
      await Task.findByIdAndUpdate(taskId, { $addToSet: { likes: userId } });
    }
    
    const updatedTask = await Task.findById(taskId);
    revalidatePath("/");
    revalidatePath("/explore");
    return { success: true, isLikedByMe: !isLiked, likesCount: updatedTask?.likes?.length || 0 };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addComment(taskId: string, content: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) return { success: false, error: "Unauthorized" };
  await dbConnect();
  try {
    const comment = await Comment.create({ taskId, authorId: userId, content });
    return { success: true, data: JSON.parse(JSON.stringify(comment)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getComments(taskId: string) {
  await dbConnect();
  try {
    const comments = await Comment.find({ taskId })
      .populate("authorId", "name image")
      .sort({ createdAt: 1 })
      .lean();
    return { success: true, data: JSON.parse(JSON.stringify(comments)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function submitReview(taskId: string, grade: number, comment: string) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user || (user.role !== "mentor" && user.role !== "admin")) {
    return { success: false, error: "Unauthorized" };
  }
  await dbConnect();
  try {
    const task = await Task.findById(taskId);
    if (!task) return { success: false, error: "Not found" };
    
    task.review = {
      mentorId: user.id as any,
      grade,
      comment,
      reviewedAt: new Date()
    };
    task.status = "reviewed";
    await task.save();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTaskCaption(taskId: string, newCaption: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const userRole = (session?.user as any)?.role;
  
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  await dbConnect();
  try {
    const task = await Task.findById(taskId);
    if (!task) return { success: false, error: "Not found" };
    
    if (task.authorId.toString() !== userId && userRole !== "admin") {
      return { success: false, error: "Forbidden: You don't have permission to edit this post" };
    }
    
    task.caption = newCaption;
    await task.save();
    
    revalidatePath("/");
    revalidatePath("/explore");
    revalidatePath("/profile");
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
