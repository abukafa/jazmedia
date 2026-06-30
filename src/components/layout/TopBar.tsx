import { Bell } from "lucide-react";
import Link from "next/link";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/70 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/" className="font-bold text-xl tracking-tight text-slate-900">
          Jazmedia<span className="text-blue-600">.</span>
        </Link>
        <button className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-red-500 border border-white"></span>
        </button>
      </div>
    </header>
  );
}
