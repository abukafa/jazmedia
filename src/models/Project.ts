import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
  title: string;
  description: string;
  status: "active" | "completed" | "archived";
  participants: mongoose.Types.ObjectId[];
  mentorId?: mongoose.Types.ObjectId;
  creatorId?: mongoose.Types.ObjectId;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ["active", "completed", "archived"], default: "active" },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    mentorId: { type: Schema.Types.ObjectId, ref: "User" },
    creatorId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);
