"use client";

import { Home, FolderOpen, Plus, Search, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname === '/post' || pathname === '/profile/edit') return null;

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Projects", href: "/projects", icon: FolderOpen },
    { name: "Post", href: "/post", icon: Plus, isAction: true },
    { name: "Explore", href: "/explore", icon: Search },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md bg-white/90 backdrop-blur-lg border-t border-slate-100 pb-safe pt-2 px-2 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          if (item.isAction) {
            return (
              <Link key={item.name} href={item.href} className="relative -top-5">
                <motion.div 
                  whileTap={{ scale: 0.9 }}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/40 border-4 border-slate-50"
                >
                  <item.icon className="h-6 w-6" strokeWidth={2.5} />
                </motion.div>
              </Link>
            );
          }

          return (
            <Link key={item.name} href={item.href} className="relative flex flex-col items-center justify-center w-16 h-full">
              <item.icon
                className={`h-6 w-6 transition-colors duration-200 ${
                  isActive ? "text-blue-600" : "text-slate-400"
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute bottom-1 h-1 w-1 rounded-full bg-blue-600"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
