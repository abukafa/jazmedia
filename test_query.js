const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
const uri = process.env.MONGODB_URI;

mongoose.connect(uri).then(async () => {
  try {
    const db = mongoose.connection.db;
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const tasks = await db.collection('tasks').find({
      'review.grade': { $exists: true, $ne: null },
      createdAt: { $gte: oneWeekAgo }
    }).sort({ 'review.grade': -1 }).limit(10).toArray();
    
    console.log('Query result length:', tasks.length);
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
    mongoose.connection.close();
  }
});
