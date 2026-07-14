"use server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getUserProfile() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  
  await dbConnect();
  const user = await User.findById((session.user as any).id).lean();
  if (!user) return null;
  
  return {
    id: user._id.toString(),
    name: user.name,
    username: user.username || "",
    image: user.image,
    bio: user.bio || "",
    skills: user.skills ? user.skills.map((s: any) => ({
      name: s.name,
      icon: s.icon,
      percentage: s.percentage,
    })) : [],
    role: user.role,
  };
}

export async function updateUserProfile(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { success: false, error: "Not logged in" };
  
  const bio = formData.get("bio") as string;
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;
  const username = formData.get("username") as string;
  const image = formData.get("image") as string;
  const skillsStr = formData.get("skills") as string;
  
  try {
    await dbConnect();
    
    let skills = [];
    if (skillsStr) {
      skills = JSON.parse(skillsStr);
    }
    
    await User.findByIdAndUpdate((session.user as any).id, {
      bio,
      name,
      role,
      username,
      image,
      skills,
    });
    
    revalidatePath("/profile");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
