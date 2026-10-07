import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import AlertProvider from "@/components/providers/AlertProvider";
import PwaInit from "@/components/PwaInit";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jazmedia",
  description: "Jazmedia Platform MVP",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Jazmedia",
  },
};

export const viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
      <body
        className="min-h-screen bg-slate-100 text-slate-900 flex flex-col"
        suppressHydrationWarning
      >
        <AuthProvider>
          <ReactQueryProvider>
            <AlertProvider>
              <PwaInit />
              <TopBar />
              <main className="flex-1 w-full mx-auto pb-16 md:pb-6 relative">
                {children}
              </main>
              <div className="md:hidden">
                <BottomNav />
              </div>
            </AlertProvider>
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
