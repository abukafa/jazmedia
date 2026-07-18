"use server";

import dbConnect from "@/lib/db";
import User from "@/models/User";
import Project from "@/models/Project";
import Task from "@/models/Task";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { deleteFromGDrive } from "@/lib/actions/upload";
import { extractDriveId } from "@/lib/utils/media";

// Utility function to get auth user
async function getAuthUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  
  await dbConnect();
  return await User.findById((session.user as any).id).lean();
}

async function checkAdmin() {
  const user = await getAuthUser();
  return user?.role === "admin";
}

// ---------------------------
// USERS MASTER DATA
// ---------------------------
export async function getAllUsers() {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };
  
  try {
    await dbConnect();
    const users = await User.find({}).sort({ createdAt: -1 }).lean();
    return { 
      success: true, 
      data: users.map(user => ({
        id: user._id.toString(),
        name: user.name,
        username: user.username || "",
        email: user.email || "",
        role: user.role,
        image: user.image,
      }))
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateUserRole(userId: string, newRole: string) {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };
  
  try {
    await dbConnect();
    await User.findByIdAndUpdate(userId, { role: newRole });
    revalidatePath("/profile");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteUser(userId: string) {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };
  
  try {
    await dbConnect();
    await User.findByIdAndDelete(userId);
    // Option: also delete user's tasks, projects, etc.
    revalidatePath("/profile");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ---------------------------
// MENTORS DATA (For Select)
// ---------------------------
export async function getAllMentors() {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Unauthorized" };
  
  try {
    await dbConnect();
    const mentors = await User.find({ role: "mentor" }).select("name _id").lean();
    return {
      success: true,
      data: mentors.map(m => ({ id: m._id.toString(), name: m.name }))
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ---------------------------
// PROJECTS MASTER DATA
// ---------------------------
export async function getAllProjects(page = 1, limit = 5) {
  const user = await getAuthUser();
  if (!user) return { success: false, error: "Unauthorized" };
  
  try {
    await dbConnect();
    const skip = (page - 1) * limit;
    
    // Aggregation for task counts
    const taskCounts = await Task.aggregate([
      { $group: { _id: "$projectId", count: { $sum: 1 } } }
    ]);
    const taskCountMap = new Map(taskCounts.map(tc => [tc._id.toString(), tc.count]));

    // Aggregation for current user's task counts
    const myTaskCounts = await Task.aggregate([
      { 
        $match: { 
          $or: [
            { authorId: user._id },
            { collaborators: user._id }
          ]
        }
      },
      { $group: { _id: "$projectId", count: { $sum: 1 } } }
    ]);
    const myTaskCountMap = new Map(myTaskCounts.map(tc => [tc._id.toString(), tc.count]));

    const totalProjects = await Project.countDocuments();
    const projects = await Project.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("mentorId", "name")
      .lean();

    return { 
      success: true, 
      data: projects.map((p: any) => ({
        id: p._id.toString(),
        title: p.title,
        description: p.description,
        status: p.status,
        mentorId: p.mentorId?._id?.toString() || "",
        mentorName: p.mentorId?.name || "Belum ada mentor",
        creatorId: p.creatorId?.toString() || "",
        participantsCount: p.participants?.length || 0,
        taskCount: taskCountMap.get(p._id.toString()) || 0,
        myTaskCount: myTaskCountMap.get(p._id.toString()) || 0,
        createdAt: p.createdAt,
      })),
      pagination: {
        total: totalProjects,
        page,
        limit,
        totalPages: Math.ceil(totalProjects / limit)
      }
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createProject(formData: FormData) {
  const user = await getAuthUser();
  if (!user || (user.role !== "admin" && user.role !== "mentor")) {
    return { success: false, error: "Unauthorized" };
  }
  
  try {
    await dbConnect();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const status = formData.get("status") as string || "active";
    const mentorId = formData.get("mentorId") as string;
    
    const payload: any = { 
      title, 
      description, 
      status,
      creatorId: user._id
    };
    if (mentorId) payload.mentorId = mentorId;
    
    await Project.create(payload);
    revalidatePath("/profile");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateProject(projectId: string, formData: FormData) {
  const user = await getAuthUser();
  if (!user || (user.role !== "admin" && user.role !== "mentor")) {
    return { success: false, error: "Unauthorized" };
  }
  
  try {
    await dbConnect();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const status = formData.get("status") as string;
    const mentorId = formData.get("mentorId") as string;
    
    const payload: any = { title, description, status };
    if (mentorId) payload.mentorId = mentorId;
    else payload.$unset = { mentorId: 1 };
    
    await Project.findByIdAndUpdate(projectId, payload);
    revalidatePath("/profile");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteProject(projectId: string) {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };
  
  try {
    await dbConnect();
    await Project.findByIdAndDelete(projectId);
    revalidatePath("/profile");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ---------------------------
// TASKS MASTER DATA
// ---------------------------
export async function getAllTasks() {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };
  
  try {
    await dbConnect();
    const tasks = await Task.find({})
      .sort({ createdAt: -1 })
      .populate("authorId", "name username")
      .populate("projectId", "title")
      .lean();
      
    return { 
      success: true, 
      data: tasks.map((t: any) => ({
        id: t._id.toString(),
        mediaType: t.mediaType,
        caption: t.caption,
        status: t.status,
        authorName: t.authorId?.name || "Unknown",
        projectTitle: t.projectId?.title || "Unknown",
        createdAt: t.createdAt,
      }))
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteTask(taskId: string) {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };
  
  try {
    await dbConnect();
    
    // Temukan task untuk mendapatkan media url
    const task = await Task.findById(taskId);
    if (task) {
      const urlsToDelete = task.mediaUrls || (task.mediaUrl ? [task.mediaUrl] : []);
      for (const url of urlsToDelete) {
        const fileId = extractDriveId(url);
        if (fileId) {
          // Fire and forget (atau ditunggu jika ingin memastikan)
          await deleteFromGDrive(fileId).catch(e => console.error("Gagal menghapus file gdrive:", e));
        }
      }
    }

    await Task.findByIdAndDelete(taskId);
    revalidatePath("/profile");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
