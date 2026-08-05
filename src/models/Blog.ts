import mongoose, { Schema, Document } from "mongoose";

export interface IBlog extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
  likes: number;
  likedBy: mongoose.Types.ObjectId[];
  rating: number;
  reviewsCount: number;
  authorId?: mongoose.Types.ObjectId;
  authorName?: string;
  authorAvatar?: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true, index: true },
    date: { type: String, required: true },
    readTime: { type: String, required: true },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    rating: { type: Number, default: 4.9 },
    reviewsCount: { type: Number, default: 0 },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: false },
    authorName: { type: String, default: "Tim Jazmedia" },
    authorAvatar: { type: String, default: "" },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
      default: "PUBLISHED",
    },
  },
  { timestamps: true }
);

if (mongoose.models && mongoose.models.Blog) {
  delete mongoose.models.Blog;
}

export default mongoose.model<IBlog>("Blog", BlogSchema);
