import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  mediaUrl: string;
  mediaUrls: string[];
  mediaType: "image" | "video" | "document";
  caption: string;
  projectId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  collaborators: mongoose.Types.ObjectId[];
  likes: mongoose.Types.ObjectId[];
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
    mediaUrl: { type: String },
    mediaUrls: [{ type: String }],
    mediaType: { type: String, enum: ["image", "video", "document"], default: "image" },
    caption: { type: String },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    collaborators: [{ type: Schema.Types.ObjectId, ref: "User" }],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
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
