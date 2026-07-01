"use server";

import dbConnect from "@/lib/db";
import Task from "@/models/Task";
import User from "@/models/User";
import Project from "@/models/Project";
import { getDriveClient } from "@/lib/drive";
import { Readable } from "stream";
import { revalidatePath } from "next/cache";

// Helper to upload to GDrive
async function uploadToGDrive(file: File) {
  const drive = getDriveClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  
  if (!process.env.GOOGLE_DRIVE_CLIENT_EMAIL || !folderId) {
    console.warn("Mock upload enabled because Google Drive credentials are not set.");
    return "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?auto=format&fit=crop&q=80&w=1000";
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  try {
    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [folderId],
      },
      media: {
        mimeType: file.type,
        body: stream,
      },
      fields: "id, webViewLink, webContentLink",
    });

    const fileId = response.data.id;
    if (fileId) {
      // Make it public so it can be viewed by anyone
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        }
      });
      return response.data.webContentLink || response.data.webViewLink;
    }
    throw new Error("Failed to upload to Google Drive");
  } catch (error) {
    console.error("GDrive upload error:", error);
    throw error;
  }
}

export async function submitTask(formData: FormData) {
  // We will mock the user ID for MVP testing.
  const authorId = "66827f311c1d9b3b8c3a1e99"; 

  const caption = formData.get("caption") as string;
  const projectId = formData.get("projectId") as string;
  const file = formData.get("file") as File;

  if (!file || !caption || !projectId) {
    return { success: false, error: "Semua field harus diisi." };
  }

  try {
    await dbConnect();
    
    // Ensure mock user exists
    let user = await User.findById(authorId);
    if (!user) {
      user = await User.create({
        _id: authorId,
        name: "Budi Santoso",
        role: "member",
        image: "https://i.pravatar.cc/150?u=budi",
      });
    }

    // Ensure mock project exists
    let project = await Project.findById(projectId);
    if (!project) {
      project = await Project.create({
        _id: projectId,
        title: "Masterclass Project",
        description: "A placeholder project for testing.",
      });
    }

    // 1. Upload file
    const mediaUrl = await uploadToGDrive(file);
    
    // 2. Determine media type
    const mediaType = file.type.startsWith("video/") ? "video" : "image";

    // 3. Save to MongoDB
    const newTask = await Task.create({
      mediaUrl,
      mediaType,
      caption,
      projectId: project._id,
      authorId: user._id,
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
    const limit = 5;
    const skip = (pageParam - 1) * limit;

    const tasks = await Task.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("authorId", "name image")
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
    const formattedTasks = tasks.map((task: any) => ({
      id: task._id.toString(),
      author: {
        name: task.authorId?.name || "Member",
        image: task.authorId?.image || "https://i.pravatar.cc/150",
      },
      projectTitle: task.projectId?.title || "Project",
      mediaUrl: task.mediaUrl,
      mediaType: task.mediaType,
      caption: task.caption,
      timeAgo: timeAgo(task.createdAt) + " yang lalu",
      review: task.review?.grade ? {
        grade: task.review.grade,
        comment: task.review.comment,
        mentorName: "Mentor",
      } : undefined
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
