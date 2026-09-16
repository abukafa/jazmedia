"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { signIn } from "next-auth/react";

declare global {
  interface Window {
    JazId?: {
      initialize: (config: any) => void;
      signIn: (options?: any) => void;
      renderButton: (container: HTMLElement | null, options?: any) => void;
      autoRender: () => void;
    };
  }
}

const JazLogoIcon = ({ className }: { className?: string }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 34 34"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="m 16.972301,-0.09806267 0.0064,10.99222467 11.838068,4.110085 c 0.06078,0.0211 0.100507,0.07867 0.100142,0.142756 l -0.0085,1.627841 c 0,0.02824 0.0229,0.05114 0.05114,0.05114 l 4.951705,-0.0043 c 0.04099,0 0.06179,-0.0208 0.06179,-0.06179 L 33.934656,4.0546354 c -0.04625,-1.922745 -1.044575,-3.60467307 -3.402699,-4.08877807 0,0 -10.365717,-0.04848 -13.559659,-0.06392 z M 20.835227,16.7301 c -0.0091,0 -0.01704,0.0058 -0.01704,0.01491 v 4.442472 c 0,0.0091 0.0079,0.01705 0.01704,0.01705 h 3.042614 c 0.0091,0 0.01704,-0.0079 0.01704,-0.01705 V 16.74501 c 0,-0.0091 -0.0079,-0.01491 -0.01704,-0.01491 z m 8.03054,5.18821 c -0.03775,-8.1e-4 -0.05582,0.01806 -0.0554,0.0554 l 0.0064,1.791903 c 4.1e-4,0.02029 -0.0086,0.03398 -0.0277,0.04048 -3.87393,1.36937 -7.74762,2.740816 -11.620739,4.112216 l -0.234375,0.03196 -0.02131,0.02131 0.02131,0.03622 0.02344,0.01279 0.01705,0.02983 -0.0085,4.964489 -0.02131,0.666903 0.0021,0.276989 12.758523,0.0277 c 3.678752,4.8e-4 4.360907,-3.036361 4.335937,-4.747159 l 0.0277,-7.178268 -0.03622,-0.03835 z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M 16.972301,-0.08740967 4.2265625,0.04256233 C 1.3248445,0.07216233 0.0107163,2.0628874 0.00994314,3.9821914 L 0.00142041,29.002827 C -0.00734128,32.869936 1.4389811,34.048395 4.9509943,34.01419 L 16.96804,33.96092 16.97869,33.7095 16.96591,33.014898 c 0.03101,-1.652863 -0.0024,-3.310408 0.0085,-4.964489 -2e-5,-0.01242 -0.0062,-0.02383 -0.01705,-0.02983 l -0.02344,-0.01279 c -0.0146,-0.0077 -0.01998,-0.01958 -0.01918,-0.03622 8.1e-4,-0.01621 0.007,-0.02331 0.01918,-0.02131 L 5.2045454,23.810355 c -0.019892,-0.0073 -0.028125,-0.01978 -0.027699,-0.04048 0.012171,-0.443605 0.018366,-0.888477 0.019176,-1.331676 0.00487,-2.40553 0.00862,-4.815452 0.010653,-7.231534 0,-0.07143 0.032769,-0.118816 0.1001421,-0.142756 L 16.978693,10.894162 Z m -6.779829,16.83029367 -0.01918,0.01918 -0.0064,4.427557 3.09375,-0.01065 c 0.01006,0 0.01918,-0.007 0.01918,-0.01705 l 0.01918,-4.399858 c 0,-0.01006 -0.0091,-0.01918 -0.01918,-0.01918 z"
      fill="currentColor"
    />
  </svg>
);

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
  const [hasLinkedInstagram, setHasLinkedInstagram] = useState(false);

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    try {
      const isLinked =
        localStorage.getItem("jazmedia_linked_instagram") === "true";
      setHasLinkedInstagram(isLinked);
    } catch (e) {}
  }, []);

  const handleSsoClick = async () => {
    setIsLoggingIn(true);
    try {
      await signIn("jazacademy", { callbackUrl: "/" });
    } catch (error) {
      console.error("SSO OAuth Login error:", error);
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 pb-20">
      <Script src="/sdk/jaz-sso.js" strategy="afterInteractive" />

      <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
        <h1 className="text-2xl font-black text-slate-900 mb-2">
          Masuk ke Jazmedia
        </h1>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          Gunakan akun resmi <strong>JazAcademy</strong> Anda untuk mengakses
          karya, portofolio, dan kolaborasi.
        </p>

        {/* SSO Button */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleSsoClick}
            disabled={isLoggingIn}
            className="jaz-btn-base jaz-btn-lg jaz-theme-filled jaz-shape-rounded w-full flex items-center justify-center gap-2.5 h-12 text-sm font-semibold !rounded-xl !shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "#7367F0",
              color: "#ffffff",
              boxShadow: "0 3px 12px rgba(115, 103, 240, 0.35)",
            }}
          >
            <JazLogoIcon className={`w-5 h-5 flex-shrink-0 transition-transform ${isLoggingIn ? "animate-spin" : "group-hover:scale-105"}`} />
            <span>{isLoggingIn ? "Menghubungkan ke JazAcademy..." : "Login jazacademy.id"}</span>
          </button>

          {/* Instagram Button - Only displayed if account is already linked */}
          {hasLinkedInstagram && (
            <div className="pt-2 border-t border-slate-100">
              <a
                href="/api/auth/instagram-login"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold h-12 rounded-xl shadow-sm flex items-center justify-center gap-2.5 transition-all text-sm"
              >
                <InstagramIcon className="w-5 h-5" />
                Masuk via Instagram
              </a>
              <p className="text-[11px] text-slate-400 mt-2 font-medium">
                Akun Instagram Anda telah ditautkan ke profil
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-400">
          Akun dikelola terpusat oleh JazAcademy Identity Provider
        </div>
      </div>
    </div>
  );
}
