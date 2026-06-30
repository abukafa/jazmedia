import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  mediaUrl: string;
  mediaType: "image" | "video";
  caption: string;
  projectId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  status: "pending" | "reviewed" | "approved";
  review?: {
    mentorId: mongoose.Types.ObjectId;
    grade: number;
    comment: string;
    reviewedAt: Date;
  };
}

const TaskSchema = new Schema<ITask>(
  {
    mediaUrl: { type: String, required: true },
    mediaType: { type: String, enum: ["image", "video"], default: "image" },
    caption: { type: String },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "reviewed", "approved"], default: "pending" },
    review: {
      mentorId: { type: Schema.Types.ObjectId, ref: "User" },
      grade: { type: Number },
      comment: { type: String },
      reviewedAt: { type: Date },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
