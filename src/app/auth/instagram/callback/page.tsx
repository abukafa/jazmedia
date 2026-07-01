"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { exchangeInstagramCode } from "@/lib/actions/auth";

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");
  const [status, setStatus] = useState("Menghubungkan Instagram...");

  useEffect(() => {
    if (!code) {
      setStatus("Kode otorisasi tidak ditemukan di URL. Gagal login.");
      return;
    }

    exchangeInstagramCode(code).then(async (res) => {
      if (res.error) {
        setStatus("Gagal: " + res.error);
      } else if (res.success) {
        setStatus("Otorisasi berhasil. Membuat sesi aplikasi...");
        const result = await signIn("instagram-custom", {
          redirect: false,
          instagramId: res.instagramId,
          name: res.name,
          image: res.image,
        });

        if (result?.error) {
          setStatus("Gagal masuk: " + result.error);
        } else {
          router.push("/profile");
        }
      }
    });
  }, [code, router]);

  return (
    <div className="min-h-[70vh] bg-white flex flex-col items-center justify-center p-8 text-center pt-32">
      <div className="w-20 h-20 bg-pink-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-pink-100">
        <Loader2 className="w-10 h-10 text-pink-600 animate-spin" />
      </div>
      <h1 className="text-xl font-black text-slate-900 mb-2">Sinkronisasi Akun</h1>
      <p className="text-sm font-medium text-slate-500 max-w-[280px]">{status}</p>
    </div>
  );
}

export default function InstagramCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] bg-white flex flex-col items-center justify-center p-8 text-center pt-32">
        <Loader2 className="w-10 h-10 text-pink-600 animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-500">Memuat rute callback...</p>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
