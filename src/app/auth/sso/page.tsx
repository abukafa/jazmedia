"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useAlert } from "@/components/providers/AlertProvider";

function SsoCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ticket = searchParams.get("ticket");
  const [statusText, setStatusText] = useState("Memvalidasi sesi JazAcademy SSO...");
  const { status } = useSession();
  const { showAlert } = useAlert();
  const executed = useRef(false);

  useEffect(() => {
    if (status === "loading") return;
    if (executed.current) return;

    if (!ticket) {
      setStatusText("Tiket SSO tidak ditemukan. Mengalihkan ke halaman login...");
      setTimeout(() => router.push("/login"), 1500);
      return;
    }

    executed.current = true;

    async function processSso() {
      try {
        setStatusText("Menghubungkan akun JazAcademy...");
        const result = await signIn("jazacademy-sso", {
          redirect: false,
          ticket,
        });

        if (result?.error) {
          setStatusText("Gagal otentikasi SSO: " + result.error);
          showAlert({
            message: "Login SSO gagal: " + result.error,
            type: "error",
          });
          setTimeout(() => router.push("/login"), 2000);
        } else {
          setStatusText("Login berhasil! Mengalihkan ke beranda...");
          showAlert({
            message: "Selamat datang kembali! Anda berhasil masuk melalui SSO JazAcademy.",
            type: "success",
          });
          router.push("/");
          router.refresh();
        }
      } catch (err: any) {
        setStatusText("Terjadi kesalahan: " + (err.message || "Unknown error"));
        setTimeout(() => router.push("/login"), 2000);
      }
    }

    processSso();
  }, [ticket, status, router, showAlert]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="bg-card p-8 rounded-2xl shadow-lg border border-border/50 max-w-md w-full text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Single Sign-On (SSO)
        </h2>
        <p className="text-sm text-muted-foreground">{statusText}</p>
      </div>
    </div>
  );
}

export default function SsoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <SsoCallbackContent />
    </Suspense>
  );
}
