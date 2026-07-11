require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function main() {
  const uri = process.env.MONGODB_URI;
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const tasks = await db.collection('tasks').find({ mediaType: 'video' }).sort({createdAt: -1}).limit(1).toArray();
    
    if (tasks.length === 0) {
      console.log('No video tasks found');
      return;
    }
    
    const task = tasks[0];
    console.log('Latest Video Task ID:', task._id);
    console.log('Media URLs:', task.mediaUrls);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch(console.error);
