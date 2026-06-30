import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jazmedia",
  description: "Jazmedia Platform MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} font-sans h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-slate-100 text-slate-900" suppressHydrationWarning>
        <AuthProvider>
          <ReactQueryProvider>
            <div className="flex flex-col min-h-screen max-w-md mx-auto bg-white shadow-2xl relative overflow-hidden">
              <TopBar />
              <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
                {children}
              </main>
              <BottomNav />
            </div>
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
