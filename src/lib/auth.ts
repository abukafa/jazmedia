import { NextAuthOptions } from "next-auth";
import InstagramProvider from "next-auth/providers/instagram";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    InstagramProvider({
      clientId: process.env.INSTAGRAM_CLIENT_ID!,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: "instagram-custom",
      name: "Instagram Custom",
      credentials: {
        instagramId: { type: "text" },
        name: { type: "text" },
        username: { type: "text" },
        image: { type: "text" },
        bio: { type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.instagramId) return null;
        
        await dbConnect();
        
        let dbUser = await User.findOne({ instagramId: credentials.instagramId });
        if (!dbUser) {
           dbUser = await User.create({
             instagramId: credentials.instagramId,
             name: credentials.name || "Instagram User",
             username: credentials.username || "",
             image: credentials.image,
             bio: credentials.bio,
             role: "member",
           });
        } else {
           // Selalu sinkronkan foto profil dan bio terbaru dari Instagram jika berubah
           dbUser.image = credentials.image || dbUser.image;
           dbUser.bio = credentials.bio || dbUser.bio;
           dbUser.name = credentials.name || dbUser.name;
           dbUser.username = credentials.username || dbUser.username;
           await dbUser.save();
        }
        return { id: dbUser._id.toString(), name: dbUser.name, username: dbUser.username, image: dbUser.image, role: dbUser.role };
      }
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Email/Username",
      credentials: {
        username: { label: "Email atau Username", type: "text" },
        password: { label: "Kata Sandi", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        
        await dbConnect();
        
        const dbUser = await User.findOne({
          $or: [
            { email: credentials.username },
            { username: credentials.username }
          ]
        });
        
        if (!dbUser || !dbUser.password) {
           throw new Error("Kredensial tidak valid");
        }

        const bcrypt = require('bcryptjs');
        const isValid = await bcrypt.compare(credentials.password, dbUser.password);
        
        if (!isValid) throw new Error("Kredensial tidak valid");

        return { id: dbUser._id.toString(), name: dbUser.name, username: dbUser.username, image: dbUser.image, role: dbUser.role };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      await dbConnect();
      if (account?.provider === "instagram") {
        let dbUser = await User.findOne({ instagramId: account.providerAccountId });
        if (!dbUser) {
          await User.create({
            instagramId: account.providerAccountId,
            name: user.name || "Instagram User",
            image: user.image || undefined,
            role: "member",
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      await dbConnect();
      
      // Handle session update
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.role) token.role = session.role;
        if (session.username) token.username = session.username;
        if (session.image) token.picture = session.image; // NextAuth uses token.picture for image
      }

      // Bila login dari Instagram, timpa token.sub dengan ObjectId dari MongoDB
      if (account?.provider === "instagram") {
        const dbUser = await User.findOne({ instagramId: account.providerAccountId });
        if (dbUser) {
          token.sub = dbUser._id.toString();
          token.role = dbUser.role;
          token.username = dbUser.username;
          if (dbUser.image) token.picture = dbUser.image;
        }
      } else if (user) {
        // Untuk credentials, user.id sudah valid ObjectId dari fungsi authorize
        token.sub = user.id;
        token.role = (user as any).role;
        token.username = (user as any).username;
        if (user.image) token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role || "member";
        (session.user as any).username = token.username;
        if (token.picture) session.user.image = token.picture;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
