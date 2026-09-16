import { NextAuthOptions } from "next-auth";
import InstagramProvider from "next-auth/providers/instagram";
import CredentialsProvider from "next-auth/providers/credentials";
import { apiClient, getApiBaseUrl, getIdpBaseUrl } from "@/lib/api-client";

export const authOptions: NextAuthOptions = {
  providers: [
    // Official JazAcademy OAuth 2.0 Provider (RFC 6749)
    {
      id: "jazacademy",
      name: "JazAcademy",
      type: "oauth",
      authorization: {
        url: `${getIdpBaseUrl()}/oauth/authorize`,
        params: { scope: "profile email" },
      },
      token: `${getIdpBaseUrl()}/oauth/token`,
      userinfo: `${getApiBaseUrl()}/oauth/user`,
      clientId: process.env.JAZACADEMY_CLIENT_ID || "5",
      clientSecret: process.env.JAZACADEMY_CLIENT_SECRET || "",
      checks: ["state"],
      profile(profile: any, tokens: any) {
        const role =
          typeof profile.role === "number"
            ? profile.role > 0
              ? "admin"
              : "member"
            : profile.role_name?.toLowerCase() || "member";

        return {
          id: String(profile.id || profile.sub),
          name: profile.name || profile.username || "User",
          username:
            profile.username ||
            (profile.email ? profile.email.split("@")[0] : `user_${profile.id}`),
          email: profile.email,
          image: profile.avatar || profile.image,
          role: role,
          accessToken: tokens.access_token,
        };
      },
    },
    InstagramProvider({
      clientId: process.env.INSTAGRAM_CLIENT_ID || "",
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || "",
    }),
    // SSO Provider for one-click login from JazAcademy (Ticket-based fallback)
    CredentialsProvider({
      id: "jazacademy-sso",
      name: "JazAcademy SSO",
      credentials: {
        ticket: { label: "SSO Ticket", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.ticket) return null;

        try {
          const res = await apiClient.post("/media/auth/sso-exchange", {
            ticket: credentials.ticket,
          });

          if (!res.success || !res.user) {
            throw new Error(res.error || "Gagal melakukan otentikasi SSO");
          }

          return {
            id: (res.user.id || res.user._id).toString(),
            name: res.user.name,
            username: res.user.username,
            image: res.user.image,
            role: res.user.role,
            accessToken: res.token,
          };
        } catch (error: any) {
          console.error("SSO authorize error:", error.message);
          throw new Error(error.message || "Gagal melakukan otentikasi SSO");
        }
      },
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
        userId: { type: "text" },
        accessToken: { type: "text" },
        role: { type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.instagramId) return null;

        if (credentials.userId && credentials.accessToken) {
          return {
            id: credentials.userId,
            name: credentials.name || "Instagram User",
            username: credentials.username || "",
            image: credentials.image || "",
            role: credentials.role || "member",
            accessToken: credentials.accessToken,
          };
        }

        return null;
      },
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

        try {
          const res = await apiClient.post("/media/auth/login", {
            username: credentials.username,
            password: credentials.password,
          });

          if (!res.success || !res.user) {
            throw new Error(res.error || "Kredensial tidak valid");
          }

          return {
            id: (res.user.id || res.user._id).toString(),
            name: res.user.name,
            username: res.user.username,
            image: res.user.image,
            role: res.user.role,
            accessToken: res.token,
          };
        } catch (error: any) {
          console.error("Credentials login error:", error.message);
          throw new Error(error.message || "Kredensial tidak valid");
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      // Handle session update
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.role) token.role = session.role;
        if (session.username) token.username = session.username;
        if (session.image) token.picture = session.image;
      }

      if (user) {
        token.sub = user.id;
        token.role = (user as any).role;
        token.username = (user as any).username;
        token.accessToken = (user as any).accessToken || account?.access_token;
        if (user.image) token.picture = user.image;
      }

      if (account?.access_token) {
        token.accessToken = account.access_token;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role || "member";
        (session.user as any).username = token.username;
        (session as any).accessToken = token.accessToken;

        if (token.picture) {
          if (
            token.picture.includes("pravatar") ||
            token.picture.includes("dicebear") ||
            token.picture.includes("unsplash")
          ) {
            session.user.image = "/no-photo.png";
          } else {
            session.user.image = token.picture;
          }
        }
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
