const { google } = require('googleapis');
const http = require('http');
const url = require('url');
require('dotenv').config({ path: '.env.local' });

// KONFIGURASI
const PORT = 3001;
const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("❌ CLIENT_ID atau CLIENT_SECRET tidak ditemukan di .env.local!");
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly'
];

async function main() {
  const server = http.createServer(async (req, res) => {
    try {
      if (req.url.indexOf('/oauth2callback') > -1) {
        const qs = new url.URL(req.url, `http://localhost:${PORT}`).searchParams;
        res.end('Otentikasi berhasil! Silakan tutup tab ini dan kembali ke terminal.');
        server.close();
        
        const code = qs.get('code');
        console.log('\n✅ Mendapatkan kode otorisasi, menukarnya dengan token...\n');
        
        const { tokens } = await oauth2Client.getToken(code);
        
        console.log('🎉 REFRESH TOKEN ANDA BERHASIL DIDAPATKAN:');
        console.log('==================================================');
        console.log(tokens.refresh_token);
        console.log('==================================================\n');
        console.log('👉 Silakan copy token di atas dan masukkan sebagai GOOGLE_DRIVE_REFRESH_TOKEN di .env.local Anda.');
        process.exit(0);
      }
    } catch (e) {
      console.error('Error saat menukar kode otorisasi:', e.message);
      res.end('Terjadi error. Cek terminal.');
    }
  });

  server.listen(PORT, () => {
    const authorizeUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent' // Memaksa agar selalu keluar refresh_token
    });

    console.log('\n⚠️  PERHATIAN SEBELUM MELANJUTKAN ⚠️');
    console.log(`Pastikan Anda sudah menambahkan "${REDIRECT_URI}" ke dalam daftar "Authorized redirect URIs" (URI pengalihan resmi) di Google Cloud Console Anda!\n`);
    console.log('Jika sudah, klik link di bawah ini untuk Login dengan akun 2TB Anda:');
    console.log('\n' + authorizeUrl + '\n');
  });
}

main();
