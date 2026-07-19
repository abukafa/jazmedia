"use server";

import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function registerUser(formData: FormData) {
  try {
    await dbConnect();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !username || !password) {
      return { success: false, error: "Semua field wajib diisi" };
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return { success: false, error: "Email atau Username sudah digunakan" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      username,
      password: hashedPassword,
      role: "member",
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function linkInstagramAccount(instagramId: string, name: string, username: string, image: string, bio: string) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return { success: false, error: "Anda belum login" };
    }

    const userId = (session.user as any).id;
    
    const existingIg = await User.findOne({ instagramId });
    if (existingIg && existingIg._id.toString() !== userId) {
      return { success: false, error: "Akun Instagram ini sudah tertaut dengan pengguna lain" };
    }

    await User.findByIdAndUpdate(userId, {
      instagramId,
      // Jangan timpa nama/username kecuali kosong
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function unlinkInstagramAccount() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return { success: false, error: "Anda belum login" };
    }

    const userId = (session.user as any).id;
    await User.findByIdAndUpdate(userId, { $unset: { instagramId: 1 } });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
