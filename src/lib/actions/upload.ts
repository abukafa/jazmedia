"use server";

import { getDriveClient, getDriveAuth } from "@/lib/drive";
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

export async function deleteFromGDrive(fileId: string) {
  try {
    const drive = getDriveClient();
    if (!process.env.GOOGLE_DRIVE_CLIENT_ID) {
      console.warn("Mock delete enabled because Google Drive credentials are not set.");
      return { success: true };
    }
    await drive.files.delete({
      fileId: fileId,
      supportsAllDrives: true,
    });
    return { success: true };
  } catch (error) {
    console.error("GDrive delete error:", error);
    return { success: false, error };
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

export async function createDriveUploadSession(fileName: string, mimeType: string, fileSize: number, folderName?: string) {
  try {
    const auth = getDriveAuth();
    const token = await auth.getAccessToken();
    if (!token.token) {
      throw new Error("Gagal mendapatkan akses token Google Drive");
    }

    const drive = getDriveClient();
    const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    let targetFolderId = rootFolderId;

    if (folderName && rootFolderId) {
      targetFolderId = await getOrCreateSubfolder(drive, rootFolderId, folderName);
    }

    const metadata = {
      name: fileName,
      parents: targetFolderId ? [targetFolderId] : [],
    };

    const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.token}`,
        "Content-Type": "application/json",
        "X-Upload-Content-Type": mimeType,
        "X-Upload-Content-Length": fileSize.toString(),
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gagal membuat upload session:", errText);
      throw new Error("Gagal membuat session upload");
    }

    const uploadUrl = response.headers.get("Location");
    if (!uploadUrl) {
      throw new Error("Tidak menerima URL upload dari Google Drive");
    }

    return { success: true, uploadUrl };
  } catch (error: any) {
    console.error("Session creation error:", error);
    return { success: false, error: error.message };
  }
}

export async function finalizeDriveUpload(fileId: string) {
  try {
    const drive = getDriveClient();
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
      supportsAllDrives: true,
    });
    
    // Get full URL
    const file = await drive.files.get({
      fileId: fileId,
      fields: "id, webViewLink, webContentLink",
      supportsAllDrives: true,
    });

    return { 
      success: true, 
      url: file.data.webContentLink || file.data.webViewLink || "" 
    };
  } catch (error: any) {
    console.error("Finalize upload error:", error);
    return { success: false, error: error.message };
  }
}
