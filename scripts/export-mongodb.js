const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = "mongodb+srv://hikamabukafa:Pg3Fpf6DgcKRg9Fs@cluster0.yawygwh.mongodb.net/jazmedia?retryWrites=true&w=majority";
const outputDir = path.resolve("D:/Libraries/Apps/jazacademy.id/database/mongodb_dump");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function exportData() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB successfully.");

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log("Collections found:", collections.map(c => c.name));

  for (const col of collections) {
    const colName = col.name;
    console.log(`Exporting collection: ${colName}...`);
    const docs = await db.collection(colName).find({}).toArray();
    const filePath = path.join(outputDir, `${colName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(docs, null, 2), 'utf-8');
    console.log(`Saved ${docs.length} documents to ${filePath}`);
  }

  await mongoose.disconnect();
  console.log("Export completed successfully!");
}

exportData().catch(err => {
  console.error("Export error:", err);
  process.exit(1);
});
