const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'test-creds.json',
  scopes: ["https://www.googleapis.com/auth/drive.file"],
});
const drive = google.drive({ version: "v3", auth });

async function test() {
  try {
    const res = await drive.files.list({ pageSize: 1 });
    console.log('SUCCESS API Call! Files found:', res.data.files?.length);
  } catch (err) {
    console.error('FAIL API Call:', err.message);
  }
}
test();
