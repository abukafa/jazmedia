"use server";

import dbConnect from "@/lib/db";
import Task from "@/models/Task";
import User from "@/models/User";
import Project from "@/models/Project";
import Comment from "@/models/Comment";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function searchTasks(query: string) {
  if (!query) return [];
  await dbConnect();
  
  // Find matching users
  const matchingUsers = await User.find({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { username: { $regex: query, $options: "i" } }
    ]
  }).select("_id");
  const userIds = matchingUsers.map(u => u._id);

  // Find matching projects
  const matchingProjects = await Project.find({
    title: { $regex: query, $options: "i" }
  }).select("_id");
  const projectIds = matchingProjects.map(p => p._id);

  const tasks = await Task.find({
    $or: [
      { caption: { $regex: query, $options: "i" } },
      { mediaType: { $regex: query, $options: "i" } },
      { authorId: { $in: userIds } },
      { projectId: { $in: projectIds } }
    ]
  })
    .populate("authorId", "name image username")
    .populate("collaborators", "name image")
    .populate("projectId", "title")
    .limit(30)
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

  const session = await getServerSession(authOptions);
  const sessionUserId = (session?.user as any)?.id;

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
        mentorName: "Mentor", // Should populate properly later
      } : undefined,
      likesCount: task.likes?.length || 0,
      isLikedByMe: sessionUserId ? task.likes?.some((id: any) => id.toString() === sessionUserId.toString()) : false,
      commentsCount,
      createdAt: task.createdAt.toISOString(),
    };
  }));
    
  return JSON.parse(JSON.stringify(formattedTasks));
}

export async function getMemberStreaks(query: string = "") {
  await dbConnect();

  // Find users with role "member"
  const searchFilter: any = { role: "member" };
  if (query.trim()) {
    searchFilter.$or = [
      { name: { $regex: query, $options: "i" } },
      { username: { $regex: query, $options: "i" } }
    ];
  }

  const members = await User.find(searchFilter)
    .select("_id name username image")
    .lean();
    
  const memberIds = members.map(m => m._id);

  const tasks = await Task.find({
    $or: [
      { authorId: { $in: memberIds } },
      { collaborators: { $in: memberIds } }
    ]
  }).select("_id authorId collaborators createdAt").lean();

  const now = new Date().getTime();

  const streaks = members.map(member => {
    const memberIdStr = member._id.toString();
    
    const authoredTasks = tasks.filter(t => t.authorId?.toString() === memberIdStr);
    const collabTasks = tasks.filter(t => 
      t.collaborators?.some((c: any) => c.toString() === memberIdStr)
    );

    // Calculate Streak
    let streakTaskCount = 0;
    let weekIndex = 0;
    
    while (true) {
      const tasksInWeek = authoredTasks.filter(t => {
        const daysAgo = (now - new Date(t.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        return daysAgo >= weekIndex * 7 && daysAgo < (weekIndex + 1) * 7;
      });

      if (tasksInWeek.length > 0) {
        streakTaskCount += tasksInWeek.length;
        weekIndex++;
      } else {
        // Grace period for the current week (week 0)
        if (weekIndex === 0) {
          weekIndex++;
        } else {
          break; // Streak broken
        }
      }
    }

    return {
      id: memberIdStr,
      name: member.name,
      username: member.username,
      image: member.image || "https://i.pravatar.cc/150",
      totalTasks: authoredTasks.length,
      totalCollabs: collabTasks.length,
      streakCount: streakTaskCount
    };
  });

  // Sort by streakCount descending, then by totalTasks
  streaks.sort((a, b) => {
    if (b.streakCount !== a.streakCount) return b.streakCount - a.streakCount;
    return b.totalTasks - a.totalTasks;
  });

  return JSON.parse(JSON.stringify(streaks));
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
