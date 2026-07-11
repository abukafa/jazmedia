import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowLeft,
  Heart,
  Database,
  Trash2,
  Lock,
} from "lucide-react";

export const metadata = {
  title: "Privacy Policy | JazMedia",
  description: "Kebijakan Privasi JazMedia",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200">
      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-4">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sm:p-12">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mb-8 mx-auto shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 text-center mb-4">
            Privacy Policy
          </h1>
          <p className="text-center text-slate-500 font-medium mb-12">
            Last Updated: July 2026
          </p>

          <div className="prose prose-slate max-w-none space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5 text-pink-500" /> Welcome to JazMedia
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Hello and welcome! At JazMedia, we deeply value your privacy and
                trust. JazMedia is an educational platform and a collaborative
                project dashboard specifically designed to help content
                creators, mentors, and students manage their creative portfolios
                efficiently. We use integrations like Instagram OAuth strictly
                to verify creator identities and facilitate seamless portfolio
                showcasing for educational and professional development
                purposes.
              </p>
            </section>

            {/* What We Collect */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-blue-500" /> What Information
                We Collect
              </h2>
              <p className="text-slate-600 leading-relaxed mb-3">
                When you connect your Instagram account or use our platform, we
                only request the absolute minimum data required to make the
                dashboard work for you:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>
                  <strong>Basic Profile Information:</strong> Your username,
                  display name, and profile picture to identify you within your
                  project teams.
                </li>
                <li>
                  <strong>Media Data:</strong> Public posts or media that you
                  specifically choose to link or display as part of your project
                  portfolio.
                </li>
              </ul>
              <p className="text-slate-600 leading-relaxed mt-3">
                <em>
                  Note: We do not have access to your private messages,
                  passwords, or personal feeds. We only see what you explicitly
                  share for your educational dashboard.
                </em>
              </p>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500" /> How We Use
                Your Data
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Your data is exclusively used to enhance your educational
                experience. We use it to:
              </p>
              <ul className="list-disc pl-5 mt-3 space-y-2 text-slate-600">
                <li>
                  Authenticate your identity as a creator or student safely.
                </li>
                <li>
                  Display your creative tasks and projects beautifully on your
                  personal dashboard.
                </li>
                <li>
                  Allow mentors and collaborators to recognize you when
                  reviewing your projects.
                </li>
              </ul>
              <p className="text-slate-600 leading-relaxed mt-3 font-medium">
                We never sell your data to third parties, nor do we use it for
                targeted advertising. Your portfolio is your own.
              </p>
            </section>

            {/* Data Deletion */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-3">
                <Trash2 className="w-5 h-5 text-red-500" /> Your Rights & Data
                Deletion
              </h2>
              <p className="text-slate-600 leading-relaxed">
                You have complete control over your data. If you ever wish to
                disconnect your Instagram account or delete your JazMedia
                profile, you can do so instantly through your Account Settings.
              </p>
              <p className="text-slate-600 leading-relaxed mt-3">
                Alternatively, you can request full data deletion by contacting
                our support team. Upon request, all your connected media,
                profile data, and project links will be permanently erased from
                our servers within 7 business days.
              </p>
            </section>

            {/* Security */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-3">
                <Lock className="w-5 h-5 text-slate-700" /> Keeping Your Data
                Safe
              </h2>
              <p className="text-slate-600 leading-relaxed">
                We implement modern security measures to protect your
                information. Communication between our servers and Meta's API is
                fully encrypted. We are committed to maintaining a safe,
                positive, and secure environment for all creators and students.
              </p>
            </section>

            {/* Contact */}
            <section className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                Got Questions?
              </h2>
              <p className="text-slate-600">
                If you have any concerns about your privacy or how we handle
                data, please feel free to reach out to us at{" "}
                <strong>admin@jazacademy.id</strong>.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 text-sm">
        &copy; {new Date().getFullYear()} JazMedia Platform. Built for Creator
        Education.
      </footer>
    </div>
  );
}
