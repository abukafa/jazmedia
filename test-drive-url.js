require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const https = require('https');

async function checkURL(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({
        statusCode: res.statusCode,
        headers: res.headers,
        location: res.headers.location
      });
    }).on('error', (e) => {
      resolve({ error: e.message });
    });
  });
}

async function main() {
  const uri = process.env.MONGODB_URI;
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const tasks = await db.collection('tasks').find().sort({createdAt: -1}).limit(1).toArray();
    
    if (tasks.length === 0) {
      console.log('No tasks found');
      return;
    }
    
    const task = tasks[0];
    console.log('Latest Task Media URLs:', task.mediaUrls);
    
    if (!task.mediaUrls || task.mediaUrls.length === 0) return;
    
    const rawUrl = task.mediaUrls[0];
    console.log('\nRaw URL:', rawUrl);
    
    // Parse ID
    let id = '';
    const matchD = rawUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (matchD && matchD[1]) id = matchD[1];
    else {
      const matchId = rawUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (matchId && matchId[1]) id = matchId[1];
    }
    
    console.log('Extracted ID:', id);
    
    if (!id) {
      console.log('Could not extract ID!');
      return;
    }

    // Try uc format
    const ucUrl = `https://drive.google.com/uc?export=view&id=${id}`;
    console.log(`\nTesting uc format: ${ucUrl}`);
    const ucRes = await checkURL(ucUrl);
    console.log('Result:', ucRes.statusCode, ucRes.headers['content-type'], ucRes.location);
    
    // Try lh3 format (thumbnail/image API)
    const lh3Url = `https://lh3.googleusercontent.com/d/${id}`;
    console.log(`\nTesting lh3 format: ${lh3Url}`);
    const lh3Res = await checkURL(lh3Url);
    console.log('Result:', lh3Res.statusCode, lh3Res.headers['content-type'], lh3Res.location);

    // Try thumbnail format
    const thumbUrl = `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
    console.log(`\nTesting thumbnail format: ${thumbUrl}`);
    const thumbRes = await checkURL(thumbUrl);
    console.log('Result:', thumbRes.statusCode, thumbRes.headers['content-type'], thumbRes.location);

  } finally {
    await mongoose.disconnect();
  }
}

main().catch(console.error);
