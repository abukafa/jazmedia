"use server";

import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Fungsi utilitas untuk mengambil session user
async function getUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.id;
}

export async function getNotifications(type?: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  await dbConnect();
  
  try {
    const query: any = { recipientId: userId };
    if (type && type !== "all") {
      query.type = type;
    }

    const notifications = await Notification.find(query)
      .populate("senderId", "name image")
      .sort({ createdAt: -1 })
      .lean();

    return { success: true, data: JSON.parse(JSON.stringify(notifications)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUnreadCount() {
  const userId = await getUserId();
  if (!userId) return 0;

  await dbConnect();
  
  try {
    const count = await Notification.countDocuments({
      recipientId: userId,
      isRead: false,
    });
    return count;
  } catch (error) {
    return 0;
  }
}

export async function markAsRead(notificationId: string) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  await dbConnect();
  
  try {
    await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { isRead: true }
    );
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markAllAsRead() {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Unauthorized" };

  await dbConnect();
  
  try {
    await Notification.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true }
    );
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Internal function to create notification (not exposed to client directly)
export async function createNotification({
  recipientId,
  senderId,
  type,
  title,
  message,
  link,
  relatedId,
}: {
  recipientId: string;
  senderId?: string;
  type: "task" | "review" | "system";
  title: string;
  message: string;
  link?: string;
  relatedId?: string;
}) {
  await dbConnect();
  try {
    await Notification.create({
      recipientId,
      senderId,
      type,
      title,
      message,
      link,
      relatedId,
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
