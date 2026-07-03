import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive.readonly"];

const parsePrivateKey = (rawKey: string) => {
  if (!rawKey) return "";
  
  let key = rawKey;

  // 1. If user pasted the whole JSON file content by mistake
  try {
    const parsed = JSON.parse(key);
    if (parsed.private_key) {
      key = parsed.private_key;
    }
  } catch (e) {
    // Not a JSON object, continue
  }

  // 2. Remove surrounding quotes if they exist
  key = key.replace(/^"|"$/g, "");
  key = key.replace(/^'|'$/g, "");

  // 3. Replace literal escaped newlines with actual newlines
  key = key.replace(/\\n/g, "\n");

  // 4. Ensure PEM headers exist
  if (!key.includes("BEGIN PRIVATE KEY")) {
    key = `-----BEGIN PRIVATE KEY-----\n${key}\n-----END PRIVATE KEY-----\n`;
  }
  
  return key;
};

export const getDriveClient = () => {
  if (!process.env.GOOGLE_DRIVE_CLIENT_EMAIL || !process.env.GOOGLE_DRIVE_PRIVATE_KEY) {
    console.warn("Google Drive credentials not found. Upload functionality will not work in production.");
  }

  const formattedKey = parsePrivateKey(process.env.GOOGLE_DRIVE_PRIVATE_KEY || "");

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: formattedKey,
    },
    scopes: SCOPES,
  });

  return google.drive({ version: "v3", auth });
};
