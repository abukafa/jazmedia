# 🌟 JazMedia

![JazMedia Preview](https://img.shields.io/badge/Live_Preview-media.jazacademy.id-blue?style=for-the-badge&logo=vercel)

Selamat datang di repositori **JazMedia**! Platform interaktif untuk anggota (member) mengunggah dan memamerkan karya (tugas/media) mereka. Karya yang diunggah akan dinilai oleh mentor, dan sesama anggota dapat saling memberikan _likes_ serta komentar.

🌍 **Live Preview:** [media.jazacademy.id](https://media.jazacademy.id)

---

## 📖 Deskripsi Aplikasi

**JazMedia** adalah sistem manajemen tugas dan portofolio internal berbasis web yang dirancang untuk mendukung interaksi edukatif antara _member_ dan _mentor_.

- **Member** dapat mengunggah berbagai format tugas berupa gambar, video, hingga dokumen.
- **Mentor** dapat melihat, mengevaluasi, dan memberikan nilai (grade) serta komentar (review) pada tugas tersebut.
- Fitur **Sosial:** Seluruh pengguna yang terautentikasi dapat melihat karya satu sama lain, memberikan apresiasi (_likes_), dan berdiskusi melalui kolom komentar.
- **Integrasi Google Drive:** Pengelolaan aset media (terutama video) terintegrasi langsung dengan Google Drive API untuk menghemat beban penyimpanan server lokal, didukung dengan mekanisme proxy _streaming_.

---

## 🛠️ Tech Stack

Aplikasi ini dibangun dengan mengandalkan teknologi modern web development:

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **Animation:** [Framer Motion](https://www.framer.com/motion/) & TW-Animate-CSS
- **Storage/Media:** Google Drive API (`googleapis`) & React PDF
- **Rich Text Editor:** [Tiptap](https://tiptap.dev/)

---

## 🌐 Public API Endpoints

JazMedia menyediakan beberapa endpoint API publik (tanpa perlu autentikasi/login) yang bisa dikonsumsi oleh aplikasi pihak ketiga atau _front-end_ eksternal. Semua API publik berada di bawah _prefix_ `/api/public`.

| Endpoint                        | Method | Deskripsi                                                                                                                                                                             |
| :------------------------------ | :----: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/api/public/members`           | `GET`  | Mengambil seluruh daftar pengguna dengan _role_ `member`. Mengembalikan id, nama, email, bio, dsb. (Password dienkripsi/disembunyikan secara otomatis).                               |
| `/api/public/members/[id]`      | `GET`  | Mengambil detail profil satu spesifik member berdasarkan ID.                                                                                                                          |
| `/api/public/tasks/member/[id]` | `GET`  | Mengambil seluruh daftar tugas (task) milik member tertentu. Data ini sudah termasuk jumlah _likes_, daftar akun yang menyukai, serta semua komentar di dalamnya.                     |
| `/api/public/tasks/best`        | `GET`  | Mengambil **10 tugas terbaik** berdasarkan nilai (grade) ulasan mentor tertinggi yang diunggah dalam rentang waktu **1 pekan terakhir**. Data _likes_ dan _comments_ juga disertakan. |
| `/api/public/media/stream/[id]` | `GET`  | Endpoint proxy untuk melakukan _streaming_ video dari Google Drive. Anda dapat menggunakan URL ini langsung ke dalam tag `<video src="...">` HTML.                                    |
| `/api/public/media/proxy-pdf`   | `GET`  | Endpoint proxy untuk mem-bypass CORS saat merender PDF eksternal. Digunakan dengan mengirimkan parameter query url: `?url=<URL_PDF>`.                                                 |

---

> Dibuat dengan 💻 dan ❤️ untuk Komunitas dan Rumah Belajar JazAcademy.
