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
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const [statusText, setStatusText] = useState(
    "Memvalidasi sesi JazAcademy...",
  );
  const [hasError, setHasError] = useState(false);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const { status } = useSession();
  const { showAlert } = useAlert();
  const executed = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLocalhost(
        window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1",
      );
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (executed.current) return;

    // 1. If OAuth authorization code was received at /auth/sso, forward to NextAuth callback
    if (code) {
      executed.current = true;
      setStatusText(
        "Menerima kode otorisasi JazAcademy, menyelesaikan login...",
      );
      const callbackUrl = `/api/auth/callback/jazacademy?code=${encodeURIComponent(code)}${state ? `&state=${encodeURIComponent(state)}` : ""}`;
      window.location.href = callbackUrl;
      return;
    }

    // 2. If no ticket or code is found
    if (!ticket) {
      setStatusText(
        "Tiket otentikasi tidak ditemukan. Mengalihkan ke halaman login...",
      );
      setTimeout(() => router.push("/login"), 1500);
      return;
    }

    executed.current = true;

    // 3. Process SSO ticket exchange
    async function processSso() {
      try {
        setStatusText("Menghubungkan...");
        const result = await signIn("jazacademy-sso", {
          redirect: false,
          ticket,
        });

        if (result?.error) {
          setHasError(true);
          setStatusText("Gagal otentikasi SSO: " + result.error);
          showAlert({
            message: "Login SSO gagal: " + result.error,
            type: "error",
          });
        } else {
          setStatusText("Login berhasil! Mengalihkan ke beranda...");
          showAlert({
            message:
              "Selamat datang kembali! Anda berhasil masuk melalui SSO JazAcademy.",
            type: "success",
          });
          router.push("/");
          router.refresh();
        }
      } catch (err: any) {
        setHasError(true);
        setStatusText("Terjadi kesalahan: " + (err.message || "Unknown error"));
      }
    }

    processSso();
  }, [ticket, code, state, status, router, showAlert]);

  const handleOAuthLogin = () => {
    signIn("jazacademy", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="bg-card p-8 rounded-2xl shadow-lg border border-border/50 max-w-md w-full text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
          {hasError ? (
            <span className="text-xl">⚠️</span>
          ) : (
            <Loader2 className="w-6 h-6 animate-spin" />
          )}
        </div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Single Sign-On (SSO)
        </h2>
        <p className="text-sm text-muted-foreground">{statusText}</p>

        {isLocalhost && ticket && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-left text-xs text-amber-700 dark:text-amber-300 space-y-1">
            <p className="font-semibold">Beralih dari Vercel?</p>
            <p>
              Jika Anda sedang menguji coba di Vercel, Anda dapat membuka tautan
              ini di domain Vercel:
            </p>
            <a
              href={`https://jazmedia-02.vercel.app/auth/sso?ticket=${ticket}`}
              className="inline-block font-semibold text-primary underline break-all mt-1"
            >
              Buka di jazmedia-02.vercel.app
            </a>
          </div>
        )}

        {hasError && (
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleOAuthLogin}
              className="w-full h-11 bg-[#7367F0] hover:bg-[#6355ee] text-white font-semibold text-sm rounded-xl shadow transition-all cursor-pointer"
            >
              Masuk dengan Akun JazAcademy (OAuth)
            </button>
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full h-10 border border-border text-foreground hover:bg-muted font-medium text-xs rounded-xl transition-all cursor-pointer"
            >
              Kembali ke Halaman Login
            </button>
          </div>
        )}
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
