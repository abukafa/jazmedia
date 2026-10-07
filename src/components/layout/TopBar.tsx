"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Play, Search, User, MessageSquare } from "lucide-react";
import NotificationBell from "./NotificationBell";

export default function TopBar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Explore", href: "/explore", icon: Search },
    { name: "Tasks", href: "/tasks", icon: Play },
  ];

  const isProfileActive = pathname === "/profile";
  const isNotifActive = pathname.startsWith("/notifications");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-8">
        
        {/* LEFT: Logo & Search */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-bold text-xl tracking-tight text-slate-900"
          >
            Jazmedia<span className="text-blue-600"> 2.0</span>
          </Link>
          <div className="hidden md:flex items-center bg-slate-100 rounded-md px-3 py-1.5 focus-within:ring-2 ring-blue-600 transition-all">
            <Search className="h-4 w-4 text-slate-500 mr-2" />
            <input 
              type="text" 
              placeholder="Search" 
              className="bg-transparent border-none outline-none text-sm w-48 lg:w-64"
            />
          </div>
        </div>

        {/* CENTER / RIGHT: Navigation */}
        <div className="flex items-center gap-1 sm:gap-4 lg:gap-6">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center h-full gap-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex flex-col items-center justify-center h-14 min-w-[60px] border-b-2 transition-colors ${
                    isActive 
                      ? "border-slate-900 text-slate-900" 
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <item.icon className="h-5 w-5 mb-1" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] hidden lg:block font-medium">{item.name}</span>
                </Link>
              );
            })}
            
            {/* Desktop Notification */}
            <NotificationBell desktop={true} isActive={isNotifActive} />
            
            {/* Desktop Profile */}
            <Link 
              href="/profile"
              className={`flex flex-col items-center justify-center h-14 min-w-[60px] border-b-2 transition-colors ${
                isProfileActive
                  ? "border-slate-900 text-slate-900" 
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <User className="h-5 w-5 mb-1" strokeWidth={isProfileActive ? 2.5 : 2} />
              <span className="text-[10px] hidden lg:block font-medium flex items-center">Me <span className="ml-1 text-[8px]">▼</span></span>
            </Link>
          </nav>

          {/* Mobile Right Icons */}
          <div className="flex items-center gap-2 md:hidden">
            <Search className="h-6 w-6 text-slate-500 mx-2" />
            <NotificationBell />
          </div>
        </div>
        
      </div>
    </header>
  );
}
