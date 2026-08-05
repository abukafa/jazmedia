export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
  likes: number;
  rating: number;
  reviewsCount?: number;
  authorName?: string;
  authorAvatar?: string;
  likedBy?: any[];
}

export const DUMMY_BLOGS: BlogPost[] = [
  {
    id: "blog-1",
    title: "Seni Bercerita Melalui Media Visual",
    excerpt:
      "Bagaimana visual storytelling mampu menyampaikan pesan lebih kuat daripada kata-kata standar dalam produksi kreatif modern.",
    content:
      "Dalam dunia media digital yang serba cepat, perhatian audiens adalah aset paling berharga. Visual storytelling bukan sekadar tentang estetika gambar yang indah, melainkan bagaimana setiap frame, warna, dan komposisi mampu menggerakkan emosi. Tim kreator di Jazmedia menerapkan prinsip bahwa setiap karya harus memiliki nyawa dan pesan yang jelas bagi audiens.",
    image:
      "https://images.unsplash.com/photo-1542744094-3a3e220a83b2?w=1000&auto=format&fit=crop&q=80",
    category: "Creative",
    date: "4 Agustus 2026",
    readTime: "3 min read",
    likes: 124,
    rating: 4.9,
    reviewsCount: 38,
    authorName: "Tim Jazmedia",
  },
  {
    id: "blog-2",
    title: "Tips Produktivitas dan Manajemen Task Harian",
    excerpt:
      "Strategi menjaga streak konsistensi berproses tanpa mengalami burnout di tengah jadwal proyek yang padat.",
    content:
      "Konsistensi bukanlah tentang seberapa keras kita bekerja dalam satu hari, melainkan seberapa tangguh kita menjaga ritme setiap harinya. Dengan memecah tugas besar menjadi sub-task kecil dan melacak streak harian, kita tidak hanya menyelesaikan pekerjaan lebih efektif, tetapi juga merayakan setiap progres kecil sebagai langkah maju.",
    image:
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1000&auto=format&fit=crop&q=80",
    category: "Tips",
    date: "2 Agustus 2026",
    readTime: "2 min read",
    likes: 98,
    rating: 4.8,
    reviewsCount: 24,
    authorName: "Rizky Pratama",
  },
  {
    id: "blog-3",
    title: "Evolusi Desain UI/UX dalam Era AI Agentic",
    excerpt:
      "Mengenal bagaimana kecerdasan buatan membantu perancang antarmuka menciptakan pengalaman yang lebih adaptif dan intuitif.",
    content:
      "Kehadiran AI generatif dan agentic coding mengubah cara kita mendesain produk digital. Desainer kini tidak lagi hanya menggambar tata letak statis, melainkan merancang sistem interaktif yang merespons kebutuhan pengguna secara otomatis. Kolaborasi antara kreativitas manusia dan kecepatan AI membuka babak baru dalam pengembangan perangkat lunak.",
    image:
      "https://images.unsplash.com/photo-1558655146-d09347e92766?w=1000&auto=format&fit=crop&q=80",
    category: "Technology",
    date: "28 Juli 2026",
    readTime: "4 min read",
    likes: 156,
    rating: 5.0,
    reviewsCount: 42,
    authorName: "Nadia Syahra",
  },
  {
    id: "blog-4",
    title: "Membangun Kolaboratif Komunitas Kreatif Islami",
    excerpt:
      "Pentingnya jejaring pendukung bagi kreator muslim untuk terus berkarya dengan nilai-nilai positif dan inspiratif.",
    content:
      "Berkarya sendirian sering kali melelahkan. Melalui komunitas yang saling mendukung dan mengingatkan dalam kebaikan, setiap ide kreatif dapat berkembang menjadi dampak sosial yang nyata. Jazmedia hadir sebagai wadah pertumbuhan bersama bagi anak muda yang ingin berkontribusi di ranah media.",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&auto=format&fit=crop&q=80",
    category: "Community",
    date: "24 Juli 2026",
    readTime: "3 min read",
    likes: 210,
    rating: 4.9,
    reviewsCount: 65,
    authorName: "Tim Jazmedia",
  },
  {
    id: "blog-5",
    title: "Catatan Jurnalistik: Etika Komunikasi Digital",
    excerpt:
      "Mengapa kebenaran dan kesantunan berbahasa menjadi kunci kredibilitas sebuah platform media modern.",
    content:
      "Di era arus informasi yang melimpah, integritas pesan adalah mata uang yang paling berharga. Menulis bukan sekadar mengunggah opini, tetapi juga mempertanggungjawabkan dampak dari setiap kalimat yang dibaca audiens. Kredibilitas dibangun dari konsistensi menyajikan informasi yang akurat dan bermanfaat.",
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1000&auto=format&fit=crop&q=80",
    category: "Journal",
    date: "20 Juli 2026",
    readTime: "3 min read",
    likes: 89,
    rating: 4.7,
    reviewsCount: 19,
    authorName: "Ahmad Fauzi",
  },
];
