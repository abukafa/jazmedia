import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import AlertProvider from "@/components/providers/AlertProvider";

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
            <AlertProvider>
              <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto bg-white shadow-2xl relative overflow-hidden sm:border-x sm:border-slate-200">
                <TopBar />
                <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide relative bg-white">
                  {children}
                </main>
                <BottomNav />
              </div>
            </AlertProvider>
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
