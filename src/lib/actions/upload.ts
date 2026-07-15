"use server";

import { getDriveClient } from "@/lib/drive";
import { Readable } from "stream";
import { getDirectMediaUrl } from "@/lib/utils/media";

async function getOrCreateSubfolder(drive: any, parentFolderId: string, folderName: string) {
  try {
    const response = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and '${parentFolderId}' in parents and trashed=false`,
      fields: "files(id, name)",
      spaces: "drive",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id;
    }

    const folder = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentFolderId],
      },
      fields: "id",
      supportsAllDrives: true,
    });
    
    return folder.data.id;
  } catch (error) {
    console.error(`Failed to get or create folder ${folderName}:`, error);
    return parentFolderId; // Fallback to root folder
  }
}

export async function uploadToGDrive(file: File, folderName?: string) {
  const drive = getDriveClient();
  const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  
  if (!process.env.GOOGLE_DRIVE_CLIENT_ID || !rootFolderId) {
    console.warn("Mock upload enabled because Google Drive credentials are not set.");
    return "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?auto=format&fit=crop&q=80&w=1000";
  }

  let targetFolderId = rootFolderId;
  if (folderName) {
    targetFolderId = await getOrCreateSubfolder(drive, rootFolderId, folderName);
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
        parents: [targetFolderId],
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
    
    const rawUrl = await uploadToGDrive(file, "profiles");
    const url = getDirectMediaUrl(rawUrl, "image");
    return { success: true, url };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
