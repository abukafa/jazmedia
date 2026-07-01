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
        image: { type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.instagramId) return null;
        
        await dbConnect();
        
        let dbUser = await User.findOne({ instagramId: credentials.instagramId });
        if (!dbUser) {
           dbUser = await User.create({
             instagramId: credentials.instagramId,
             name: credentials.name || "Instagram User",
             image: credentials.image,
             role: "member",
           });
        }
        return { id: dbUser._id.toString(), name: dbUser.name, image: dbUser.image, role: dbUser.role };
      }
    }),
    // Dummy provider for easy MVP testing without IG keys
    CredentialsProvider({
      name: "Dummy Login",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "member / mentor" },
      },
      async authorize(credentials) {
        await dbConnect();
        
        let name = "Member User";
        let email = "member@dummy.com";
        let role: "admin" | "mentor" | "member" | "guest" = "member";
        let image = "https://i.pravatar.cc/150?u=member";

        if (credentials?.username === "mentor") {
          name = "Mentor User";
          email = "mentor@dummy.com";
          role = "mentor";
          image = "https://i.pravatar.cc/150?u=mentor";
        } else if (credentials?.username === "admin") {
          name = "Admin User";
          email = "admin@dummy.com";
          role = "admin";
          image = "https://i.pravatar.cc/150?u=admin";
        } else if (credentials?.username === "guest") {
          name = "Guest User";
          email = "guest@dummy.com";
          role = "guest";
          image = "https://i.pravatar.cc/150?u=guest";
        }

        let dbUser = await User.findOne({ email });
        if (!dbUser) {
           dbUser = await User.create({
             name,
             email,
             image,
             role,
           });
        }
        return { id: dbUser._id.toString(), name, image, role };
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
    async jwt({ token, user, account }) {
      await dbConnect();
      // Bila login dari Instagram, timpa token.sub dengan ObjectId dari MongoDB
      if (account?.provider === "instagram") {
        const dbUser = await User.findOne({ instagramId: account.providerAccountId });
        if (dbUser) {
          token.sub = dbUser._id.toString();
          token.role = dbUser.role;
        }
      } else if (user) {
        // Untuk credentials, user.id sudah valid ObjectId dari fungsi authorize
        token.sub = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role || "member";
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
