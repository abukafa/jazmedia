"use server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Task from "@/models/Task";
import Project from "@/models/Project";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getUserProfile() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  
  await dbConnect();
  const user = await User.findById((session.user as any).id).lean();
  if (!user) return null;
  
  return {
    id: user._id.toString(),
    name: user.name,
    username: user.username || "",
    image: user.image,
    bio: user.bio || "",
    skills: user.skills ? user.skills.map((s: any) => ({
      name: s.name,
      icon: s.icon,
      percentage: s.percentage,
    })) : [],
    role: user.role,
  };
}

export async function updateUserProfile(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "Not logged in" };
  
  const bio = formData.get("bio") as string;
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;
  const username = formData.get("username") as string;
  const image = formData.get("image") as string;
  const skillsStr = formData.get("skills") as string;
  
  try {
    await dbConnect();
    
    let skills = [];
    if (skillsStr) {
      skills = JSON.parse(skillsStr);
    }
    
    await User.findByIdAndUpdate((session.user as any).id, {
      bio,
      name,
      role,
      username,
      image,
      skills,
    });
    
    revalidatePath("/profile");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getPublicProfile(userId: string) {
  try {
    await dbConnect();
    const user = await User.findById(userId).lean();
    if (!user) return { success: false, error: "User tidak ditemukan" };

    // Fetch tasks where user is author or collaborator
    const tasks = await Task.find({
      $or: [{ authorId: userId }, { collaborators: userId }],
    })
      .populate({ path: "authorId", select: "name image username", model: User })
      .populate({ path: "projectId", select: "title", model: Project })
      .sort({ createdAt: -1 })
      .lean();

    const serializedUser = {
      id: user._id.toString(),
      name: user.name,
      username: user.username || "",
      image: user.image,
      bio: user.bio || "",
      skills: user.skills ? user.skills.map((s: any) => ({
        name: s.name,
        icon: s.icon,
        percentage: s.percentage,
      })) : [],
      role: user.role,
    };

    const serializedTasks = tasks.map((task: any) => ({
      _id: task._id.toString(),
      caption: task.caption,
      mediaUrl: task.mediaUrl,
      mediaUrls: task.mediaUrls || [task.mediaUrl],
      mediaType: task.mediaType || "image",
      likesCount: task.likes ? task.likes.length : 0,
      createdAt: task.createdAt?.toISOString(),
      author: task.authorId ? {
        id: task.authorId._id.toString(),
        name: task.authorId.name,
        image: task.authorId.image,
        username: task.authorId.username,
      } : null,
      project: task.projectId ? {
        id: task.projectId._id.toString(),
        title: task.projectId.title,
      } : null,
    }));

    return { success: true, data: { user: serializedUser, tasks: serializedTasks } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
