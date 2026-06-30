import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email?: string;
  image?: string;
  role: "member" | "mentor";
  bio?: string;
  highlights?: string[];
  instagramId?: string;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    image: { type: String },
    role: { type: String, enum: ["member", "mentor"], default: "member" },
    bio: { type: String },
    highlights: [{ type: String }],
    instagramId: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
