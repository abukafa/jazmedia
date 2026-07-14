"use server";

import { getDriveClient } from "@/lib/drive";
import { Readable } from "stream";
import { getDirectMediaUrl } from "@/lib/utils/media";

export async function uploadToGDrive(file: File) {
  const drive = getDriveClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  
  if (!process.env.GOOGLE_DRIVE_CLIENT_ID || !folderId) {
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
      supportsAllDrives: true,
    });

    const fileId = response.data.id;
    if (fileId) {
      // Make it public so it can be viewed by anyone
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
        supportsAllDrives: true,
      });
      return response.data.webContentLink || response.data.webViewLink || "";
    }
    throw new Error("Failed to upload to Google Drive");
  } catch (error) {
    console.error("GDrive upload error:", error);
    throw error;
  }
}

export async function uploadProfilePicture(formData: FormData) {
  try {
    const file = formData.get("image") as File;
    if (!file) {
      return { success: false, error: "No image provided" };
    }
    
    // File verification
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "Image size must be less than 5MB" };
    }
    
    const rawUrl = await uploadToGDrive(file);
    const url = getDirectMediaUrl(rawUrl, "image");
    return { success: true, url };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
