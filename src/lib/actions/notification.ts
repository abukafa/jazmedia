"use server";

import { apiClient } from "@/lib/api-client";

export async function getPendingTaskNotifications() {
  try {
    const res = await apiClient.get("/media/notifications/pending-tasks");
    return {
      success: true,
      data: res.data || [],
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getReviewedTaskNotifications() {
  try {
    const res = await apiClient.get("/media/notifications/reviewed-tasks");
    return {
      success: true,
      data: res.data || [],
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getSystemReminders() {
  try {
    const res = await apiClient.get("/media/notifications/system-reminders");
    return {
      success: true,
      data: res.data || [],
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUnreadCount() {
  try {
    const res = await apiClient.get("/media/notifications/unread-count");
    return typeof res === "number" ? res : res?.count ?? 0;
  } catch (error) {
    return 0;
  }
}
