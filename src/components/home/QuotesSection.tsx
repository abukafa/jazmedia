"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BookOpen } from "lucide-react";

interface QuoteItem {
  id: string;
  quote: string;
  author: string;
  book: string;
  date?: string;
}

interface ColorTheme {
  name: string;
  bg: string;
  quoteText: string;
  authorText: string;
  badgeBg: string;
  progressBg: string;
  accent: string;
}

// Initial fallback quotes from /f15-jurnal.md
const INITIAL_QUOTES: QuoteItem[] = [
  {
    id: "q-1",
    quote:
      "Setiap keputusan seperti baris kode—kecil, tapi menentukan output dari seluruh program.",
    author: "Bill Gates",
    book: "Source Code",
    date: "4 Agustus 2026",
  },
  {
    id: "q-2",
    quote:
      "Kehidupan yang baik bukan tentang tidak memiliki masalah. Ini tentang memiliki masalah yang tepat—masalah yang kamu pilih untuk perjuangkan.",
    author: "Mark Manson",
    book: "The Subtle Art of Not Giving a F*ck",
    date: "2 Agustus 2026",
  },
  {
    id: "q-3",
    quote:
      "The future belongs to those who can think and act like humans, not like machines.",
    author: "Marty Neumeier",
    book: "Metaskills",
    date: "31 Juli 2026",
  },
  {
    id: "q-4",
    quote:
      "Rasa sakit tidak bisa dihindari. Penderitaan adalah pilihan. Ketika Anda mematahkan kaki, Anda merasakan rasa sakit... Tapi penderitaan—drama mental tentang betapa tidak adilnya ini—itu adalah sesuatu yang Anda tambahkan sendiri.",
    author: "Joseph Nguyen",
    book: "Don't Believe Everything You Think",
    date: "30 Juli 2026",
  },
  {
    id: "q-5",
    quote:
      "Makna tidak datang dari menghindari kekacauan. Makna datang dari bagaimana Anda bertindak di tengah kekacauan.",
    author: "Mark Manson",
    book: "Everything Is F*cked",
    date: "29 Juli 2026",
  },
];

const AUTHOR_MAP: Record<string, string> = {
  "Source Code": "Bill Gates",
  "The Subtle Art of Not Giving a F*ck": "Mark Manson",
  "Everything Is F*cked": "Mark Manson",
  Metaskills: "Marty Neumeier",
  "Don't Believe Everything You Think": "Joseph Nguyen",
};

const COLOR_THEMES: ColorTheme[] = [
  {
    name: "sky-indigo",
    bg: "bg-gradient-to-br from-blue-100 via-sky-50 to-indigo-100 border-blue-200/80 shadow-blue-500/10",
    quoteText: "text-blue-950",
    authorText: "text-blue-700",
    badgeBg: "bg-blue-600/10 text-blue-700",
    progressBg: "bg-blue-500",
    accent: "text-blue-500",
  },
  {
    name: "amber-peach",
    bg: "bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 border-amber-200/80 shadow-amber-500/10",
    quoteText: "text-amber-950",
    authorText: "text-amber-700",
    badgeBg: "bg-amber-600/10 text-amber-700",
    progressBg: "bg-amber-500",
    accent: "text-amber-500",
  },
  {
    name: "emerald-teal",
    bg: "bg-gradient-to-br from-emerald-100 via-teal-50 to-green-100 border-emerald-200/80 shadow-emerald-500/10",
    quoteText: "text-emerald-950",
    authorText: "text-emerald-700",
    badgeBg: "bg-emerald-600/10 text-emerald-700",
    progressBg: "bg-emerald-500",
    accent: "text-emerald-500",
  },
  {
    name: "purple-rose",
    bg: "bg-gradient-to-br from-purple-100 via-indigo-50 to-pink-100 border-purple-200/80 shadow-purple-500/10",
    quoteText: "text-purple-950",
    authorText: "text-purple-700",
    badgeBg: "bg-purple-600/10 text-purple-700",
    progressBg: "bg-purple-500",
    accent: "text-purple-500",
  },
  {
    name: "rose-coral",
    bg: "bg-gradient-to-br from-rose-100 via-pink-50 to-red-100 border-rose-200/80 shadow-rose-500/10",
    quoteText: "text-rose-950",
    authorText: "text-rose-700",
    badgeBg: "bg-rose-600/10 text-rose-700",
    progressBg: "bg-rose-500",
    accent: "text-rose-500",
  },
  {
    name: "cyan-sky",
    bg: "bg-gradient-to-br from-cyan-100 via-sky-50 to-blue-100 border-cyan-200/80 shadow-cyan-500/10",
    quoteText: "text-cyan-950",
    authorText: "text-cyan-700",
    badgeBg: "bg-cyan-600/10 text-cyan-700",
    progressBg: "bg-cyan-500",
    accent: "text-cyan-500",
  },
  {
    name: "violet-indigo",
    bg: "bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100 border-violet-200/80 shadow-violet-500/10",
    quoteText: "text-violet-950",
    authorText: "text-violet-700",
    badgeBg: "bg-violet-600/10 text-violet-700",
    progressBg: "bg-violet-500",
    accent: "text-violet-500",
  },
  {
    name: "teal-cyan",
    bg: "bg-gradient-to-br from-teal-100 via-emerald-50 to-cyan-100 border-teal-200/80 shadow-teal-500/10",
    quoteText: "text-teal-950",
    authorText: "text-teal-700",
    badgeBg: "bg-teal-600/10 text-teal-700",
    progressBg: "bg-teal-500",
    accent: "text-teal-500",
  },
];

function parseJurnalMarkdown(mdText: string): QuoteItem[] {
  const sections = mdText.split(/---+/);
  const result: QuoteItem[] = [];

  sections.forEach((section, idx) => {
    const lines = section.split("\n").map((l) => l.trim());
    const quoteLines: string[] = [];
    let book = "";
    let date = "";

    lines.forEach((line) => {
      if (line.startsWith(">")) {
        quoteLines.push(line.replace(/^>\s*/, "").trim());
      } else if (
        line.startsWith("—") ||
        line.startsWith("--") ||
        line.startsWith("–")
      ) {
        const match = line.match(/\*(.*?)\*(?:,\s*(.*))?/);
        if (match) {
          book = match[1].trim();
          if (match[2]) date = match[2].trim();
        } else {
          const clean = line.replace(/^[—–-]\s*/, "");
          book = clean;
        }
      }
    });

    if (quoteLines.length > 0 && book) {
      const author = AUTHOR_MAP[book] || book;
      result.push({
        id: `jurnal-${idx}`,
        quote: quoteLines.join(" "),
        author,
        book,
        date,
      });
    }
  });

  return result;
}

export default function QuotesSection() {
  const [quotes, setQuotes] = useState<QuoteItem[]>(INITIAL_QUOTES);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [themeIndex, setThemeIndex] = useState(0);
  const [progressKey, setProgressKey] = useState(0);

  // Fetch and parse /f15-jurnal.md on client mount
  useEffect(() => {
    fetch("/f15-jurnal.md")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load jurnal");
        return res.text();
      })
      .then((text) => {
        const parsed = parseJurnalMarkdown(text);
        if (parsed.length > 0) {
          setQuotes(parsed);
        }
      })
      .catch((err) => {
        console.warn("Using default quotes:", err);
      });
  }, []);

  const changeQuote = useCallback(() => {
    setQuoteIndex((prevQuote) => {
      let nextQuote;
      do {
        nextQuote = Math.floor(Math.random() * quotes.length);
      } while (nextQuote === prevQuote && quotes.length > 1);
      return nextQuote;
    });

    setThemeIndex((prevTheme) => {
      let nextTheme;
      do {
        nextTheme = Math.floor(Math.random() * COLOR_THEMES.length);
      } while (nextTheme === prevTheme && COLOR_THEMES.length > 1);
      return nextTheme;
    });

    setProgressKey((prev) => prev + 1);
  }, [quotes.length]);

  // Auto-change every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      changeQuote();
    }, 15000);

    return () => clearInterval(timer);
  }, [changeQuote, progressKey]);

  const currentQuote = quotes[quoteIndex] || INITIAL_QUOTES[0];
  const currentTheme = COLOR_THEMES[themeIndex];

  return (
    <div className="px-5 my-3">
      <motion.div
        onClick={changeQuote}
        whileTap={{ scale: 0.98 }}
        className={`w-full rounded-3xl p-6 border shadow-lg cursor-pointer transition-colors duration-700 relative overflow-hidden select-none ${currentTheme.bg}`}
      >
        {/* Background Decorative Quote Mark */}
        <div className="absolute -right-2 -top-4 text-[120px] font-serif leading-none select-none opacity-[0.07] pointer-events-none">
          &ldquo;
        </div>

        <div className="flex items-center justify-between mb-4">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${currentTheme.badgeBg}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Jurnal Baca</span>
          </div>
          <span className="text-[11px] font-medium text-slate-400">
            Auto-changes &bull; Click card
          </span>
        </div>

        <div className="min-h-[96px] flex flex-col justify-between relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuote.id + "-" + currentTheme.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-3"
            >
              <p
                className={`text-md sm:text-lg font-serif italic leading-relaxed ${currentTheme.quoteText}`}
              >
                &ldquo;{currentQuote.quote}&rdquo;
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-black/5">
                <div className="flex items-center gap-2 mt-3">
                  <div
                    className={`h-0.5 w-6 rounded-full ${currentTheme.progressBg}`}
                  />
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white/60 text-slate-700 flex items-center gap-1 shadow-sm">
                    <BookOpen className="w-3 h-3" />
                    {currentQuote.book}
                  </span>
                </div>

                {currentQuote.date && (
                  <span className="text-[11px] text-slate-500 font-medium">
                    {currentQuote.date}
                  </span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 10-second progress bar animation at bottom of card */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 overflow-hidden">
          <motion.div
            key={progressKey}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 15, ease: "linear" }}
            className={`h-full ${currentTheme.progressBg} opacity-60`}
          />
        </div>
      </motion.div>
    </div>
  );
}
