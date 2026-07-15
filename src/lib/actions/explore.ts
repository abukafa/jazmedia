"use server";

import dbConnect from "@/lib/db";
import Task from "@/models/Task";
import User from "@/models/User";
import Project from "@/models/Project";

export async function searchTasks(query: string) {
  if (!query) return [];
  await dbConnect();
  
  const tasks = await Task.find({
    caption: { $regex: query, $options: "i" }
  })
    .populate("authorId", "name image username")
    .populate("collaborators", "name image")
    .populate("projectId", "title")
    .limit(10)
    .lean();
    
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

  const formattedTasks = tasks.map((task: any) => ({
    id: task._id.toString(),
    author: {
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
  }));
    
  return JSON.parse(JSON.stringify(formattedTasks));
}

export async function searchUsers(query: string) {
  if (!query) return [];
  await dbConnect();
  
  const users = await User.find({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { username: { $regex: query, $options: "i" } },
      { bio: { $regex: query, $options: "i" } }
    ]
  })
    .select("name username image role bio")
    .limit(15)
    .lean();
    
  return JSON.parse(JSON.stringify(users.map((u: any) => {
    u._id = u._id.toString();
    return u;
  })));
}

export async function searchProjects(query: string) {
  if (!query) return [];
  await dbConnect();
  
  const projects = await Project.find({
    $or: [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } }
    ]
  })
    .limit(15)
    .lean();
    
  return JSON.parse(JSON.stringify(projects.map((p: any) => {
    p._id = p._id.toString();
    return p;
  })));
}
