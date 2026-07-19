"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useAlert } from "@/components/providers/AlertProvider";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { showAlert } = useAlert();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        username,
        password,
      });

      if (res?.error) {
        showAlert({
          message:
            "Login gagal. Periksa kembali email/username dan sandi Anda.",
          type: "error",
        });
      } else {
        router.push("/profile");
      }
    } catch (err) {
      showAlert({ message: "Terjadi kesalahan sistem.", type: "error" });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 pb-20">
      <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h1 className="text-2xl font-black text-slate-900 mb-2 text-center">
          Masuk ke Jazmedia
        </h1>
        <p className="text-sm text-slate-500 mb-8 text-center">
          Silakan masuk menggunakan akun Anda.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
              Email atau Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Masukkan email/username"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
              Kata Sandi
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Masukkan kata sandi"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl flex items-center justify-center transition-colors mt-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Masuk"}
          </button>

          <p className="text-center text-sm font-medium text-slate-600">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="text-blue-600 font-bold hover:underline"
            >
              Daftar sekarang
            </Link>
          </p>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-slate-400 font-medium">
              atau masuk dengan
            </span>
          </div>
        </div>

        <a
          href="/api/auth/instagram-login"
          className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold h-12 rounded-xl shadow-sm flex items-center justify-center gap-3 transition-all"
        >
          <InstagramIcon className="w-5 h-5" />
          Instagram
        </a>
      </div>
    </div>
  );
}
