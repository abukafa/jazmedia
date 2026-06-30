"use client";

import { TaskCard } from "@/components/feed/TaskCard";

// Mock data for MVP UI testing
const MOCK_TASKS = [
  {
    id: "1",
    author: {
      name: "Budi Santoso",
      image: "https://i.pravatar.cc/150?u=budi",
    },
    projectTitle: "UI/UX Design Masterclass",
    mediaUrl: "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?auto=format&fit=crop&q=80&w=1000",
    mediaType: "image" as const,
    caption: "Akhirnya selesai mendesain landing page untuk tugas akhir. Sangat menantang tapi seru! 🚀 #uiux #design",
    review: {
      grade: 95,
      comment: "Desainnya sangat bersih dan rapi. Hierarki visualnya sudah tepat sasaran. Pertahankan gaya minimalism-nya!",
      mentorName: "Kak Rio",
    },
    timeAgo: "2 jam yang lalu",
  },
  {
    id: "2",
    author: {
      name: "Siti Aminah",
      image: "https://i.pravatar.cc/150?u=siti",
    },
    projectTitle: "Frontend Web Development",
    mediaUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1000",
    mediaType: "image" as const,
    caption: "Implementasi React Hooks untuk form dinamis. Kode jadi jauh lebih rapi dibanding menggunakan class component. #reactjs",
    timeAgo: "5 jam yang lalu",
  },
  {
    id: "3",
    author: {
      name: "Reza Rahadian",
      image: "https://i.pravatar.cc/150?u=reza",
    },
    projectTitle: "Photography 101",
    mediaUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000",
    mediaType: "image" as const,
    caption: "Eksperimen dengan komposisi rule of thirds saat golden hour di pantai. Cahayanya luar biasa! 📸✨",
    review: {
      grade: 88,
      comment: "Penempatan objek sudah cukup baik, pencahayaannya juga dramatis. Sedikit koreksi warna bisa membuatnya lebih pop-up.",
      mentorName: "Mba Dinda",
    },
    timeAgo: "1 hari yang lalu",
  }
];

export default function Home() {
  return (
    <div className="pt-4 pb-8">
      <div className="px-4">
        {MOCK_TASKS.map((task) => (
          <TaskCard key={task.id} {...task} />
        ))}
      </div>
      
      {/* Loading Indicator for Infinite Scroll (Mock) */}
      <div className="py-8 flex justify-center items-center gap-2 text-slate-400">
        <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="text-xs font-medium">Memuat postingan lama...</span>
      </div>
    </div>
  );
}
