require('dotenv').config({ path: '.env.local' });
const { google } = require('googleapis');

const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: refreshToken,
});

const drive = google.drive({ version: "v3", auth: oauth2Client });

async function test() {
  try {
    console.log('Client initialized');
    const res = await drive.about.get({ fields: 'storageQuota, user' });
    console.log('User Email:', res.data.user.emailAddress);
    console.log('Storage Quota Info:', res.data.storageQuota);
  } catch (err) {
    console.error('FAIL API Call:', err.message);
    if (err.response) {
      console.error(err.response.data);
    }
  }
}
test();
