"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { exchangeInstagramCode } from "@/lib/actions/auth";
import { linkInstagramAccount } from "@/lib/actions/auth-custom";
import { useAlert } from "@/components/providers/AlertProvider";

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");
  const [statusText, setStatusText] = useState("Menghubungkan Instagram...");
  const { status, data: session } = useSession();
  const { showAlert } = useAlert();
  const executed = useRef(false);

  useEffect(() => {
    if (status === "loading") return;
    if (executed.current) return;

    if (!code) {
      setStatusText("Kode otorisasi tidak ditemukan di URL. Gagal login.");
      return;
    }

    executed.current = true;

    exchangeInstagramCode(code).then(async (res) => {
      if (res.error) {
        setStatusText("Gagal: " + res.error);
      } else if (res.success) {
        if (status === "authenticated") {
          setStatusText("Menautkan akun Instagram ke profil Anda...");
          const linkRes = await linkInstagramAccount(res.instagramId, res.name, res.username, res.image, res.bio);
          if (linkRes.success) {
            showAlert({ message: "Instagram berhasil ditautkan!", type: "success" });
            router.push("/profile/edit");
          } else {
            showAlert({ message: "Gagal menautkan Instagram: " + linkRes.error, type: "error" });
            router.push("/profile/edit");
          }
        } else {
          setStatusText("Otorisasi berhasil. Membuat sesi aplikasi...");
          const result = await signIn("instagram-custom", {
            redirect: false,
            instagramId: res.instagramId,
            name: res.name,
            username: res.username,
            image: res.image,
            bio: res.bio,
          });

          if (result?.error) {
            setStatusText("Gagal masuk: " + result.error);
          } else {
            router.push("/profile");
          }
        }
      }
    });
  }, [code, router, status, showAlert]);

  return (
    <div className="min-h-[70vh] bg-white flex flex-col items-center justify-center p-8 text-center pt-32">
      <div className="bg-slate-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mb-8 border border-slate-100">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
      <p className="text-slate-600 font-medium text-lg">{statusText}</p>
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
