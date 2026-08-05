"use server";

import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Blog, { IBlog } from "@/models/Blog";
import User from "@/models/User";
import { DUMMY_BLOGS } from "@/lib/data/blogs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import BlogComment from "@/models/BlogComment";

export async function seedBlogsIfEmpty() {
  await dbConnect();
  // Check if legacy travel blogs exist in DB
  const legacyCount = await Blog.countDocuments({
    $or: [
      { title: { $regex: "Pandawa|Cliff Front", $options: "i" } },
      { category: "Expedition" },
      { category: "Travelogue" },
    ],
  });

  if (legacyCount > 0) {
    await Blog.deleteMany({
      $or: [
        { title: { $regex: "Pandawa|Cliff Front", $options: "i" } },
        { category: "Expedition" },
        { category: "Travelogue" },
      ],
    });
  }

  const count = await Blog.countDocuments();
  if (count === 0) {
    const seedData = DUMMY_BLOGS.map((blog) => ({
      title: blog.title,
      slug:
        blog.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") +
        "-" +
        Math.random().toString(36).substring(2, 6),
      excerpt: blog.excerpt,
      content: blog.content,
      image: blog.image,
      category: blog.category,
      date: blog.date,
      readTime: blog.readTime,
      likes: blog.likes,
      rating: blog.rating,
      reviewsCount: blog.reviewsCount || 0,
      authorName: blog.authorName || "Tim Jazmedia",
      status: "PUBLISHED",
    }));

    await Blog.insertMany(seedData);
  }
}

function serializeBlog(doc: any) {
  if (!doc) return null;
  return {
    id: doc._id ? doc._id.toString() : doc.id,
    _id: doc._id ? doc._id.toString() : doc.id,
    title: doc.title || "",
    slug: doc.slug || "",
    excerpt: doc.excerpt || "",
    content: doc.content || "",
    image: doc.image || "",
    category: doc.category || "General",
    date: doc.date || "",
    readTime: doc.readTime || "3 min read",
    likes: doc.likes || 0,
    rating: doc.rating || 4.9,
    reviewsCount: doc.reviewsCount || 0,
    authorId: doc.authorId ? doc.authorId.toString() : null,
    authorName: doc.authorName || "Tim Jazmedia",
    authorAvatar: doc.authorAvatar || "",
    status: doc.status || "PUBLISHED",
    likedBy: (doc.likedBy || []).map((id: any) => id.toString()),
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
  };
}

export async function getBlogs(
  options: {
    category?: string;
    query?: string;
    limit?: number;
  } = {}
) {
  try {
    await seedBlogsIfEmpty();
    const { category, query, limit } = options;

    const filter: any = { status: "PUBLISHED" };
    if (category && category !== "All") {
      filter.category = category;
    }
    if (query && query.trim() !== "") {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { excerpt: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ];
    }

    let queryBuilder = Blog.find(filter).sort({ createdAt: -1 });
    if (limit) {
      queryBuilder = queryBuilder.limit(limit);
    }

    const blogs = await queryBuilder.lean();
    return {
      success: true,
      data: blogs.map(serializeBlog),
    };
  } catch (error: any) {
    console.error("Error fetching blogs:", error);
    return {
      success: true,
      data: DUMMY_BLOGS.map((b) => ({ ...b, _id: b.id, slug: b.id })),
    };
  }
}

export async function getBlogById(idOrSlug: string) {
  try {
    await seedBlogsIfEmpty();
    let blog = null;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      blog = await Blog.findById(idOrSlug).lean();
    }
    if (!blog) {
      blog = await Blog.findOne({
        $or: [{ slug: idOrSlug }, { title: idOrSlug }],
      }).lean();
    }

    if (!blog) {
      const dummy = DUMMY_BLOGS.find(
        (b) => b.id === idOrSlug || b.title === idOrSlug
      );
      if (dummy) {
        return {
          success: true,
          data: {
            ...dummy,
            _id: dummy.id,
            slug: dummy.id,
            authorName: dummy.authorName || "Tim Jazmedia",
          },
        };
      }
      return { success: false, error: "Artikel blog tidak ditemukan." };
    }

    return { success: true, data: serializeBlog(blog) };
  } catch (error: any) {
    console.error("Error fetching blog by ID:", error);
    const dummy = DUMMY_BLOGS.find(
      (b) => b.id === idOrSlug || b.title === idOrSlug
    );
    if (dummy) {
      return {
        success: true,
        data: {
          ...dummy,
          _id: dummy.id,
          slug: dummy.id,
          authorName: dummy.authorName || "Tim Jazmedia",
        },
      };
    }
    return { success: false, error: "Artikel blog tidak ditemukan." };
  }
}

export async function createBlog(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return {
        success: false,
        error: "Silakan login terlebih dahulu untuk menulis artikel.",
      };
    }

    await dbConnect();
    if (mongoose.models && mongoose.models.Blog) {
      delete mongoose.models.Blog;
    }
    let dbUser: any = null;
    const userId = (session.user as any).id;
    if (userId && typeof userId === "string" && userId.match(/^[0-9a-fA-F]{24}$/)) {
      dbUser = await User.findById(userId).lean();
    }
    if (!dbUser && session.user.email) {
      dbUser = await User.findOne({ email: session.user.email }).lean();
    }
    if (!dbUser && (session.user as any).username) {
      dbUser = await User.findOne({ username: (session.user as any).username }).lean();
    }

    if (dbUser && dbUser.role === "guest") {
      return {
        success: false,
        error: "Tamu (guest) tidak memiliki izin untuk membuat artikel blog.",
      };
    }

    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const rawExcerpt = formData.get("excerpt") as string;
    const content = formData.get("content") as string;
    const rawImage = formData.get("image") as string;
    const readTime = (formData.get("readTime") as string) || "3 min read";

    if (!title || !content) {
      return {
        success: false,
        error: "Mohon isi minimal Judul dan Konten artikel.",
      };
    }

    const cleanContent = content.replace(/<[^>]+>/g, "").trim();
    const excerpt = rawExcerpt || (cleanContent.substring(0, 120) + "...");
    const image = rawImage || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80";
    const finalCategory = category || "Creative";

    const baseSlug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "blog-post";
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    const dateFormatted = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const authorId = dbUser?._id || undefined;
    const authorName = dbUser?.name || session.user.name || "Tim Jazmedia";
    const authorAvatar = dbUser?.image || session.user.image || "";

    const newBlog = await Blog.create({
      title,
      slug: uniqueSlug,
      excerpt,
      content,
      image,
      category: finalCategory,
      date: dateFormatted,
      readTime,
      likes: 1,
      rating: 5.0,
      reviewsCount: 1,
      authorId,
      authorName,
      authorAvatar,
      status: "PUBLISHED",
    });

    revalidatePath("/blogs");
    revalidatePath("/");

    return {
      success: true,
      data: serializeBlog(newBlog),
    };
  } catch (error: any) {
    console.error("Error creating blog:", error);
    return {
      success: false,
      error: error.message || "Gagal membuat artikel blog.",
    };
  }
}

export async function likeBlog(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: "Silakan login untuk menyukai artikel." };
    }
    const userId = (session.user as any).id;
    if (!userId) {
      return { success: false, error: "Data pengguna tidak valid." };
    }

    await dbConnect();
    const blog = await Blog.findById(id);
    if (!blog) return { success: false, error: "Blog tidak ditemukan." };

    const likedByIndex = blog.likedBy.findIndex((uId: any) => uId.toString() === userId);
    
    if (likedByIndex > -1) {
      blog.likedBy.splice(likedByIndex, 1);
      blog.likes = Math.max(0, blog.likes - 1);
    } else {
      blog.likedBy.push(userId);
      blog.likes += 1;
    }

    await blog.save();
    revalidatePath("/blogs");
    revalidatePath(`/blogs/${blog.slug}`);
    
    return { 
      success: true, 
      likes: blog.likes,
      isLiked: likedByIndex === -1 
    };
  } catch (error) {
    return { success: false, error: "Gagal menyukai artikel." };
  }
}

export async function getBlogComments(blogId: string) {
  try {
    await dbConnect();
    const comments = await BlogComment.find({ blogId })
      .sort({ createdAt: -1 })
      .populate("authorId", "name image")
      .lean();
    
    return {
      success: true,
      data: comments.map(c => ({
        id: c._id.toString(),
        content: c.content,
        createdAt: c.createdAt,
        author: {
          name: (c.authorId as any)?.name || "Anonim",
          image: (c.authorId as any)?.image || ""
        }
      }))
    };
  } catch (error) {
    return { success: false, error: "Gagal mengambil komentar." };
  }
}

export async function addBlogComment(blogId: string, content: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: "Silakan login untuk menambahkan komentar." };
    }
    const userId = (session.user as any).id;

    if (!content || content.trim() === "") {
      return { success: false, error: "Komentar tidak boleh kosong." };
    }

    await dbConnect();
    const newComment = await BlogComment.create({
      blogId,
      authorId: userId,
      content: content.trim()
    });

    // Optionally increment reviewsCount in Blog
    await Blog.findByIdAndUpdate(blogId, { $inc: { reviewsCount: 1 } });

    revalidatePath(`/blogs`);
    
    return {
      success: true,
      data: {
        id: newComment._id.toString(),
        content: newComment.content,
        createdAt: newComment.createdAt,
        author: {
          name: session.user.name || "Anonim",
          image: session.user.image || ""
        }
      }
    };
  } catch (error) {
    return { success: false, error: "Gagal menambahkan komentar." };
  }
}

export async function getBlogCategories() {
  try {
    await dbConnect();
    const categories = await Blog.distinct("category", { status: "PUBLISHED" });
    return { success: true, data: categories };
  } catch (error) {
    return { success: false, data: [] };
  }
}

export async function deleteBlog(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: "Anda belum login." };
    }
    
    await dbConnect();
    const blog = await Blog.findById(id);
    if (!blog) {
      return { success: false, error: "Blog tidak ditemukan." };
    }
    
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
    
    if (blog.authorId && blog.authorId.toString() !== userId && userRole !== "admin") {
      return { success: false, error: "Hanya penulis atau admin yang dapat menghapus artikel ini." };
    }
    
    await Blog.findByIdAndDelete(id);
    revalidatePath("/blogs");
    revalidatePath("/");
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus artikel." };
  }
}

export async function updateBlog(id: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: "Anda belum login." };
    }
    
    await dbConnect();
    const blog = await Blog.findById(id);
    if (!blog) {
      return { success: false, error: "Blog tidak ditemukan." };
    }
    
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;
    
    if (blog.authorId && blog.authorId.toString() !== userId && userRole !== "admin") {
      return { success: false, error: "Hanya penulis atau admin yang dapat mengedit artikel ini." };
    }
    
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const rawExcerpt = formData.get("excerpt") as string;
    const content = formData.get("content") as string;
    const rawImage = formData.get("image") as string;
    const readTime = (formData.get("readTime") as string) || "3 min read";

    if (!title || !content) {
      return { success: false, error: "Mohon isi minimal Judul dan Konten artikel." };
    }

    const cleanContent = content.replace(/<[^>]+>/g, "").trim();
    const excerpt = rawExcerpt || (cleanContent.substring(0, 120) + "...");
    const image = rawImage || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80";
    const finalCategory = category || "Creative";

    blog.title = title;
    blog.category = finalCategory;
    blog.excerpt = excerpt;
    blog.content = content;
    blog.image = image;
    blog.readTime = readTime;
    
    await blog.save();
    
    revalidatePath("/blogs");
    revalidatePath(`/blogs/${blog.slug}`);
    revalidatePath("/");
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal memperbarui artikel." };
  }
}
