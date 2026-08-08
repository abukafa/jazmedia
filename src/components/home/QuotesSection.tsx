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
    name: "elegant-matte",
    bg: "bg-[#f8fafc] border-slate-200/60 shadow-sm", // putih doff elegan (slate-50)
    quoteText: "text-slate-800",
    authorText: "text-slate-600",
    badgeBg: "bg-white text-slate-700 border border-slate-200/60 shadow-sm",
    progressBg: "bg-slate-300",
    accent: "text-slate-500",
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
  const [isHovered, setIsHovered] = useState(false);

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
          // Lanjutkan dari quote sebelumnya atau acak
          const savedIndex = localStorage.getItem("jaz_lastQuoteIndex");
          if (savedIndex !== null && parseInt(savedIndex) < parsed.length) {
            // Berlanjut ke quote berikutnya dari yang terakhir dilihat
            setQuoteIndex((parseInt(savedIndex) + 1) % parsed.length);
          } else {
            // Acak jika baru pertama kali
            setQuoteIndex(Math.floor(Math.random() * parsed.length));
          }
        }
      })
      .catch((err) => {
        console.warn("Using default quotes:", err);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("jaz_lastQuoteIndex", quoteIndex.toString());
  }, [quoteIndex]);

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

  // Auto-change every 15 seconds, pause if hovered
  useEffect(() => {
    if (isHovered) return; // Stop timer while holding/hovering

    const timer = setInterval(() => {
      changeQuote();
    }, 15000);

    return () => clearInterval(timer);
  }, [changeQuote, progressKey, isHovered]);

  const currentQuote = quotes[quoteIndex] || INITIAL_QUOTES[0];
  const currentTheme = COLOR_THEMES[themeIndex];

  return (
    <div className="px-5 my-3">
      <motion.div
        onClick={changeQuote}
        whileTap={{ scale: 0.98 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setProgressKey((p) => p + 1);
        }}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => {
          setIsHovered(false);
          setProgressKey((p) => p + 1);
        }}
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
            {isHovered ? "Paused" : "Auto-changes • Click card"}
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
                  <span className="text-xs px-2 py-0.5 text-slate-400 flex items-center gap-1">
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

        {/* 15-second progress bar animation at bottom of card */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 overflow-hidden">
          {!isHovered && (
            <motion.div
              key={progressKey}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 15, ease: "linear" }}
              className={`h-full ${currentTheme.progressBg} opacity-60`}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
