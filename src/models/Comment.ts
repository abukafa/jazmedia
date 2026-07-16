import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  taskId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);
