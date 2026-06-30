import { NextAuthOptions } from "next-auth";
import InstagramProvider from "next-auth/providers/instagram";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    InstagramProvider({
      clientId: process.env.INSTAGRAM_CLIENT_ID!,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
    }),
    // Dummy provider for easy MVP testing without IG keys
    CredentialsProvider({
      name: "Dummy Login",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "member / mentor" },
      },
      async authorize(credentials) {
        if (credentials?.username === "member") {
          return { id: "1", name: "Member User", image: "https://i.pravatar.cc/150?u=member", role: "member" };
        }
        if (credentials?.username === "mentor") {
          return { id: "2", name: "Mentor User", image: "https://i.pravatar.cc/150?u=mentor", role: "mentor" };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role || "member";
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    }
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
