import mongoose, { Schema, Document } from "mongoose";

export interface ISkill {
  name: string;
  icon: string;
  percentage: number;
}

export interface IUser extends Document {
  name: string;
  username?: string;
  email?: string;
  image?: string;
  role: "admin" | "mentor" | "member" | "guest";
  bio?: string;
  skills?: ISkill[];
  instagramId?: string;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    username: { type: String },
    email: { type: String, unique: true, sparse: true },
    image: { type: String },
    role: { type: String, enum: ["admin", "mentor", "member", "guest"], default: "member" },
    bio: { type: String },
    skills: [
      {
        name: { type: String },
        icon: { type: String },
        percentage: { type: Number, min: 0, max: 100 },
      }
    ],
    instagramId: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

// Delete existing model in development to ensure schema updates take effect
if (mongoose.models.User) {
  delete mongoose.models.User;
}
export default mongoose.model<IUser>("User", UserSchema);
