import dbConnect from "./src/lib/db";
import Task from "./src/models/Task";
import User from "./src/models/User";

async function testToggleLike() {
  await dbConnect();
  
  const user = await User.findOne();
  if (!user) {
    console.log("NO_USER");
    return;
  }
  
  const task = await Task.findOne();
  if (!task) {
    console.log("NO_TASK");
    return;
  }

  const userId = user._id.toString();
  const taskId = task._id.toString();
  
  console.log("Testing with User:", userId, "Task:", taskId);
  
  const isLiked = task.likes?.some((id: any) => id.toString() === userId.toString());
  console.log("Initially isLiked:", isLiked);
  
  if (isLiked) {
    await Task.findByIdAndUpdate(taskId, { $pull: { likes: userId } });
    console.log("Executed $pull");
  } else {
    await Task.findByIdAndUpdate(taskId, { $addToSet: { likes: userId } });
    console.log("Executed $addToSet");
  }
  
  const updatedTask = await Task.findById(taskId);
  console.log("Updated likes count:", updatedTask.likes.length);
  const isLikedNow = updatedTask.likes?.some((id: any) => id.toString() === userId.toString());
  console.log("Now isLiked:", isLikedNow);
}

testToggleLike()
  .then(() => process.exit(0))
  .catch(e => { console.error(e); process.exit(1); });
