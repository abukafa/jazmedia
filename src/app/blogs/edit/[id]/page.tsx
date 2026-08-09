"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Loader2,
  Tag,
  Clock,
  BookOpen,
  ChevronDown,
  Check,
  Plus,
} from "lucide-react";
import BlogEditor from "@/components/blogs/BlogEditor";
import CoverUploader from "@/components/blogs/CoverUploader";
import { getBlogById, updateBlog } from "@/lib/actions/blog";

const INITIAL_CATEGORIES = [
  "Creative",
  "Tips",
  "Technology",
  "Community",
  "Journal",
  "Design",
];

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [readTime, setReadTime] = useState("3 menit baca");
  const [excerpt, setExcerpt] = useState("");
  const [image, setImage] = useState("");
  const [content, setContent] = useState("");

  // Option List (Select / Type / Add New) states
  const [categoriesList, setCategoriesList] = useState<string[]>(INITIAL_CATEGORIES);
  const [category, setCategory] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function fetchDetail() {
      if (!id) return;
      setIsLoading(true);
      const res = await getBlogById(id);
      if (res && res.data) {
        setTitle(res.data.title || "");
        setReadTime(res.data.readTime || "3 menit baca");
        setExcerpt(res.data.excerpt || "");
        setImage(res.data.image || "");
        setContent(res.data.content || "");
        
        const cat = res.data.category || "Creative";
        setCategory(cat);
        setCategoryInput(cat);
        setCategoriesList((prev) => {
          if (!prev.includes(cat)) {
            return [cat, ...prev];
          }
          return prev;
        });
      } else {
        setErrorMsg("Artikel tidak ditemukan atau gagal dimuat.");
      }
      setIsLoading(false);
    }

    fetchDetail();
  }, [id]);

  // Close category dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsCategoryOpen(false);
        // Ensure input matches selected category on blur
        if (!categoryInput.trim()) {
          setCategoryInput(category);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [category, categoryInput]);

  // Filtered categories based on typing
  const filteredCategories = categoriesList.filter((cat) =>
    cat.toLowerCase().includes(categoryInput.toLowerCase()),
  );

  const exactMatch = categoriesList.some(
    (cat) => cat.toLowerCase() === categoryInput.trim().toLowerCase(),
  );

  const handleSelectCategory = (cat: string) => {
    setCategory(cat);
    setCategoryInput(cat);
    setIsCategoryOpen(false);
  };

  const handleAddNewCategory = () => {
    const newCat = categoryInput.trim();
    if (!newCat) return;
    if (!categoriesList.includes(newCat)) {
      setCategoriesList((prev) => [newCat, ...prev]);
    }
    setCategory(newCat);
    setCategoryInput(newCat);
    setIsCategoryOpen(false);
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setErrorMsg("");

    const finalCat = categoryInput.trim() || category || "Creative";

    if (!title.trim() || !content.trim()) {
      setErrorMsg(
        "Mohon isi minimal Judul dan Konten artikel terlebih dahulu."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setIsSubmitting(true);
      const cleanContent = content.replace(/<[^>]+>/g, "").trim();
      const finalExcerpt =
        excerpt.trim() || cleanContent.substring(0, 120) + "...";
      const finalImage =
        image.trim() ||
        "/no-photo.png";

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("category", finalCat);
      formData.append("readTime", readTime || "3 min read");
      formData.append("excerpt", finalExcerpt);
      formData.append("image", finalImage);
      formData.append("content", content);

      const result = await updateBlog(id as string, formData);

      if (!result || !result.success) {
        setErrorMsg(result?.error || "Gagal memperbarui artikel.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      router.push("/blogs");
      router.refresh();
    } catch (err: any) {
      setErrorMsg("Terjadi kesalahan sistem saat memperbarui artikel.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/70 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-semibold">Memuat artikel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-24">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/blogs"
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200/80 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
              title="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              Edit Artikel
              <span className="text-[10px] uppercase font-extrabold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                Studio
              </span>
            </h1>
          </div>

          <button
            type="button"
            onClick={(e) => handleSubmit(e)}
            disabled={isSubmitting}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Simpan
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Form */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        {errorMsg ? (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-semibold flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              onClick={() => setErrorMsg("")}
              className="text-xs font-bold underline ml-2 cursor-pointer"
            >
              Tutup
            </button>
          </div>
        ) : null}

        <div className="space-y-6">
          {/* Title & Category Box */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Judul Artikel
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Judul pendek yang menarik..."
                required
                className="w-full text-xl sm:text-2xl font-extrabold text-slate-900 placeholder-slate-300 bg-transparent border-0 border-b border-slate-200 focus:border-blue-600 focus:outline-none pb-2 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Option List: Select / Type / Add New Category Combobox */}
              <div className="relative" ref={dropdownRef}>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  Kategori
                </label>

                <div className="relative">
                  <input
                    type="text"
                    value={categoryInput}
                    onFocus={() => setIsCategoryOpen(true)}
                    onChange={(e) => {
                      setCategoryInput(e.target.value);
                      setIsCategoryOpen(true);
                      setCategory(e.target.value);
                    }}
                    placeholder="Pilih atau ketik kategori baru..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-9 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Option List Dropdown Menu */}
                {isCategoryOpen ? (
                  <div className="absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1.5">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((cat) => {
                        const isSelected =
                          category.toLowerCase() === cat.toLowerCase();
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => handleSelectCategory(cat)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-blue-50 text-blue-600"
                                : "text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <span>{cat}</span>
                            {isSelected ? (
                              <Check className="w-3.5 h-3.5 text-blue-600" />
                            ) : null}
                          </button>
                        );
                      })
                    ) : (
                      <p className="px-3 py-2 text-xs text-slate-400 font-medium">
                        Kategori tidak ada dalam daftar
                      </p>
                    )}

                    {/* Add New Category Action */}
                    {!exactMatch && categoryInput.trim() ? (
                      <button
                        type="button"
                        onClick={handleAddNewCategory}
                        className="w-full text-left px-3 py-2 mt-1 border-t border-slate-100 text-xs sm:text-sm font-bold text-blue-600 hover:bg-blue-50/80 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>
                          Tambah kategori baru:{" "}
                          <span className="underline">
                            "{categoryInput.trim()}"
                          </span>
                        </span>
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Waktu Baca
                </label>
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  placeholder="3 min read"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Cover Uploader */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm">
            <CoverUploader value={image} onChange={setImage} />
          </div>

          {/* Excerpt / Short Summary */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Ringkasan Singkat
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              placeholder="Tulis 1-2 kalimat ringkasan artikel..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>

          {/* Tiptap Rich Text Editor */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                Konten Artikel
              </label>
              <span className="text-[11px] text-slate-400">
                Format Teks &amp; Sisipkan Gambar
              </span>
            </div>

            <BlogEditor
              value={content}
              onChange={setContent}
              placeholder="Mulai menulis cerita pendek, wawasan, atau tips di sini..."
            />
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/blogs"
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Batal
            </Link>
            <button
              type="button"
              onClick={(e) => handleSubmit(e)}
              disabled={isSubmitting}
              className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Simpan
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
