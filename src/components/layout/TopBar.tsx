import Link from "next/link";
import NotificationBell from "./NotificationBell";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/70 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-4">
        <Link
          href="/"
          className="font-bold text-xl tracking-tight text-slate-900"
        >
          Jazmedia<span className="text-blue-600"> 2.0</span>
        </Link>
        <NotificationBell />
      </div>
    </header>
  );
}
