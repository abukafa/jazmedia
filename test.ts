import dbConnect from "./src/lib/db";
import Task from "./src/models/Task";
import User from "./src/models/User";

async function main() {
  await dbConnect();
  const task = await Task.findOne();
  if (!task) {
    console.log("No task found");
    return;
  }
  console.log("Task ID:", task._id.toString());
  console.log("Likes array:", task.likes);
  
  const user = await User.findOne();
  if (!user) {
    console.log("No user found");
    return;
  }
  
  const userId = user._id.toString();
  console.log("User ID:", userId);
  
  // mimic toggleLike
  if (!task.likes) task.likes = [];
  const index = task.likes.findIndex((id: any) => id.toString() === userId.toString());
  console.log("Index:", index);
  if (index > -1) {
    task.likes.splice(index, 1);
  } else {
    task.likes.push(userId);
  }
  
  await task.save();
  
  const updatedTask = await Task.findById(task._id);
  console.log("Updated Likes array:", updatedTask.likes);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
