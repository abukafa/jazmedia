import mongoose, { Schema, Document } from "mongoose";

export interface IBlogComment extends Document {
  blogId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const BlogCommentSchema = new Schema<IBlogComment>(
  {
    blogId: { type: Schema.Types.ObjectId, ref: "Blog", required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

if (mongoose.models && mongoose.models.BlogComment) {
  delete mongoose.models.BlogComment;
}

export default mongoose.models.BlogComment || mongoose.model<IBlogComment>("BlogComment", BlogCommentSchema);
