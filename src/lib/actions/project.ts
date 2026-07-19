"use server";

import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import Task from "@/models/Task";

export async function getPublicProjects(statusFilter: string = "all") {
  try {
    await dbConnect();
    
    // Build query based on filter
    const query: any = {};
    if (statusFilter !== "all") {
      query.status = statusFilter;
    } else {
      // Typically, public page doesn't show archived projects unless specified
      query.status = { $ne: "archived" }; 
    }

    // Fetch projects with mentor details
    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .populate("mentorId", "name")
      .lean();

    // Fetch tasks for these projects
    const projectIds = projects.map(p => p._id);
    const tasks = await Task.find({ projectId: { $in: projectIds } })
      .populate("authorId", "name username")
      .lean();

    // Group tasks by projectId
    const tasksByProject = tasks.reduce((acc: any, task: any) => {
      const pid = task.projectId.toString();
      if (!acc[pid]) acc[pid] = [];
      acc[pid].push({
        id: task._id.toString(),
        mediaType: task.mediaType,
        status: task.status,
        authorName: task.authorId?.name || "Unknown",
        authorUsername: task.authorId?.username || "unknown"
      });
      return acc;
    }, {});

    // Format response
    return {
      success: true,
      data: projects.map((p: any) => ({
        id: p._id.toString(),
        title: p.title,
        description: p.description,
        status: p.status,
        mentorName: p.mentorId?.name || "Tanpa Mentor",
        createdAt: p.createdAt,
        participantsCount: p.participants?.length || 0, // Fallback to raw array length if any
        tasks: tasksByProject[p._id.toString()] || []
      }))
    };

  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getProjectById(projectId: string) {
  try {
    await dbConnect();
    
    const project = await Project.findById(projectId)
      .populate("mentorId", "name")
      .lean();
      
    if (!project) return { success: false, error: "Project not found" };

    const tasks = await Task.find({ projectId })
      .populate("authorId", "name username image")
      .populate("collaborators", "name username image")
      .populate("review.mentorId", "name")
      .sort({ createdAt: -1 })
      .lean();

    const serializedProject = {
      id: project._id.toString(),
      title: project.title,
      description: project.description,
      status: project.status,
      mentorName: project.mentorId?.name || "Tanpa Mentor",
      createdAt: project.createdAt,
      participantsCount: project.participants?.length || 0,
      tasks: JSON.parse(JSON.stringify(tasks))
    };

    return { success: true, data: serializedProject };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
