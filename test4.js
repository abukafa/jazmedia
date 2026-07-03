require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

const parsePrivateKey = (rawKey) => {
  if (!rawKey) return "";
  let key = rawKey;
  try { const parsed = JSON.parse(key); if (parsed.private_key) key = parsed.private_key; } catch (e) {}
  key = key.replace(/^"|"$/g, "");
  key = key.replace(/^'|'$/g, "");
  key = key.replace(/\\n/g, "\n");
  if (!key.includes("BEGIN PRIVATE KEY")) {
    key = `-----BEGIN PRIVATE KEY-----\n${key}\n-----END PRIVATE KEY-----\n`;
  }
  return key;
};

const getDriveClient = () => {
  const formattedKey = parsePrivateKey(process.env.GOOGLE_DRIVE_PRIVATE_KEY || "");
  const b64 = formattedKey.replace('-----BEGIN PRIVATE KEY-----\n', '').replace('\n-----END PRIVATE KEY-----\n', '').replace(/\n/g, '');
  console.log('Base64 Length:', b64.length);
  console.log('Valid Modulo 4?:', b64.length % 4 === 0);
  console.log('Missing chars:', (4 - (b64.length % 4)) % 4);

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      private_key: formattedKey,
    },
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });
  return google.drive({ version: "v3", auth });
};

async function test() {
  try {
    const drive = getDriveClient();
    console.log('Client initialized');
    const res = await drive.about.get({ fields: 'storageQuota, user' });
    console.log('Service Account Email:', res.data.user.emailAddress);
    console.log('Storage Quota Info:', res.data.storageQuota);
  } catch (err) {
    console.error('FAIL API Call:', err.message);
    if (err.response) {
      console.error('Response details:', err.response.data);
    }
  }
}

test();
