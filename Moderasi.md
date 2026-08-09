# Prompt untuk AI Coding Agent — Implementasi Fitur "Moderasi Ulasan Publik"

## Konteks Proyek
Kamu bekerja pada aplikasi web bertipe informational/e-commerce (Next.js + Prisma + PostgreSQL). Aplikasi ini menjual produk berbasis rubber/karet ke segmen B2B maupun B2C. Sekarang kita akan menambahkan modul **Retur, Komplain & Review**, dan tugas spesifik pada prompt ini hanya mencakup satu PBI di dalam epic tersebut.

## Referensi Backlog (PBI)
- **Epic**: Retur, Komplain & Review
- **Nama PBI**: Moderasi Ulasan Publik
- **User Story**: Sebagai Admin, saya ingin memoderasi ulasan sebelum tampil di halaman publik, sehingga konten ulasan yang tayang terjaga kualitas dan relevansinya.
- **Actor**: Admin
- **Priority**: Low

## Tujuan Akhir
Bangun sistem moderasi ulasan yang **end-to-end**: mulai dari Customer mengirim ulasan, ulasan masuk ke antrean moderasi, Admin meninjau dan memutuskan (approve/reject), hingga hanya ulasan yang disetujui yang tampil di halaman publik. Implementasikan secara profesional: aman, teruji, konsisten dengan konvensi kode yang sudah ada di proyek (Next.js App Router, Prisma schema, pola API route yang sudah dipakai), dan siap produksi.

---

## 1. Analisis & Persiapan (lakukan sebelum menulis kode)
1. Pelajari struktur proyek yang ada: model Prisma untuk Customer, Product/Order (jika ada), pola autentikasi & middleware Admin, konvensi penamaan API route, serta pola komponen UI Admin dashboard yang sudah ada agar fitur baru konsisten (bukan membangun ulang dari nol/gaya berbeda).
2. Identifikasi apakah model `Review` sudah ada di schema. Jika belum, buat baru. Jika sudah ada, tambahkan field yang dibutuhkan tanpa merusak data yang ada (migrasi additive, bukan destructive).
3. Konfirmasikan asumsi berikut sebagai default jika tidak ada instruksi lain dari tim: ulasan hanya bisa dibuat oleh Customer yang sudah melakukan transaksi/pembelian terhadap produk terkait (verified purchase); satu customer hanya bisa mengulas satu produk sekali per transaksi.

## 2. Data Model (Prisma)
Rancang/perluas model `Review` minimal dengan field berikut:
- `id`, `productId`, `customerId`, `rating` (1–5), `comment` (text), `images` (opsional, array URL)
- `status`: enum `PENDING | APPROVED | REJECTED` — default `PENDING`
- `moderatedById` (FK ke Admin, nullable), `moderatedAt` (nullable)
- `rejectionReason` (nullable, text) — wajib diisi ketika status `REJECTED`
- `createdAt`, `updatedAt`
- Tambahkan index pada `status` dan `productId` untuk performa query listing.

Aturan bisnis penting untuk disematkan di level service/logic:
- Ulasan baru **selalu** masuk dengan status `PENDING`, tidak pernah langsung tampil publik.
- Jika Customer mengedit ulasan yang sudah `APPROVED`, status otomatis kembali ke `PENDING` (perlu moderasi ulang).
- Ulasan yang `REJECTED` tetap tersimpan (bukan dihapus) untuk audit trail, tapi tidak pernah muncul di publik maupun bisa diedit ulang oleh customer kecuali fitur revisi memang diinginkan (nyatakan sebagai open question ke tim jika belum ada kejelasan). / My Answer: yes, we agreed

## 3. Backend / API Endpoints
Implementasikan endpoint berikut (sesuaikan prefix dengan konvensi proyek, mis. `/api/admin/reviews`):

**Untuk Admin (protected, wajib role Admin via middleware yang sudah ada):**
- `GET /api/admin/reviews` — list ulasan dengan filter `status` (default tampilkan `PENDING` lebih dulu), filter produk, filter rating, pencarian teks komentar, dan pagination.
- `GET /api/admin/reviews/:id` — detail satu ulasan (termasuk data customer & produk terkait) untuk ditinjau.
- `PATCH /api/admin/reviews/:id/approve` — set status `APPROVED`, catat `moderatedById` & `moderatedAt`.
- `PATCH /api/admin/reviews/:id/reject` — set status `REJECTED`, wajib menyertakan `rejectionReason`, catat `moderatedById` & `moderatedAt`.
- `PATCH /api/admin/reviews/bulk-moderate` — aksi massal approve/reject untuk beberapa ID sekaligus (untuk efisiensi kerja Admin).

**Untuk Customer (existing/extend jika perlu):**
- `POST /api/reviews` — submit ulasan baru (validasi: sudah pernah membeli produk terkait, rating 1–5 wajib, comment tidak boleh kosong/spam-check dasar).

**Untuk Publik:**
- `GET /api/products/:id/reviews` — **hanya** mengembalikan ulasan dengan status `APPROVED`. Pastikan query ini secara eksplisit memfilter status, jangan mengandalkan default aplikasi.

Validasi & keamanan:
- Semua endpoint Admin wajib melalui middleware autentikasi & otorisasi role Admin yang sudah dipakai di modul lain — jangan buat mekanisme auth baru.
- Validasi input dengan schema validator yang sudah dipakai di proyek (mis. Zod), termasuk validasi `rejectionReason` wajib saat reject.
- Terapkan rate limiting/basic protection pada `POST /api/reviews` untuk mencegah spam ulasan.

## 4. Frontend — Admin Dashboard
Buat halaman **"Moderasi Ulasan"** di Admin dashboard, konsisten secara visual dan struktur dengan halaman Admin lain yang sudah ada (gunakan komponen/layout yang sama, jangan reinvent style baru):
- Tabel/list ulasan dengan kolom: produk, customer, rating, cuplikan komentar, tanggal submit, status (badge berwarna).
- Tab atau filter cepat: "Menunggu Moderasi" (default aktif), "Disetujui", "Ditolak".
- Aksi per baris: tombol **Setujui** dan **Tolak** (tolak membuka modal kecil untuk input alasan penolakan, wajib diisi).
- Checkbox untuk memilih banyak baris + aksi massal (approve/reject bulk).
- Detail view (modal atau halaman detail) menampilkan komentar lengkap, foto ulasan (jika ada), riwayat pembelian terkait, dan histori moderasi (siapa & kapan memoderasi).
- Pagination dan pencarian/filter (per produk, per rating, per tanggal).
- Empty state yang jelas ketika antrean moderasi kosong.
- Pastikan responsif di layar kecil, mengikuti pola responsive menu/table yang sudah diterapkan di bagian Admin App lainnya.

## 5. Frontend — Halaman Publik
- Pastikan komponen/section ulasan di halaman produk publik memanggil endpoint publik yang sudah difilter `APPROVED`, dan tidak melakukan filtering status di sisi client (harus difilter di server/query, bukan disembunyikan lewat CSS/JS).
- Tampilkan rating rata-rata & jumlah ulasan berdasarkan ulasan yang `APPROVED` saja.

## 6. Notifikasi (nice-to-have, implementasikan jika pola notifikasi sudah ada di proyek)
- Saat ulasan disetujui/ditolak, kirim notifikasi ke Customer (in-app notification, atau email jika sistem email sudah tersedia) berisi status dan alasan (jika ditolak).

## 7. Testing
- Unit test untuk logic moderasi (approve/reject, validasi rejectionReason wajib, transisi status saat edit ulasan APPROVED → PENDING).
- Integration test untuk seluruh endpoint API (termasuk kasus unauthorized/non-Admin mencoba mengakses endpoint moderasi → harus ditolak).
- Test bahwa endpoint publik **tidak pernah** mengembalikan data dengan status `PENDING`/`REJECTED`, termasuk uji edge case (mis. race condition antara edit dan approve).
- Test UI dasar untuk komponen moderasi (render list, aksi approve/reject, bulk action) sesuai testing framework yang sudah dipakai di proyek.

## 8. Audit & Observability
- Simpan histori moderasi minimal via field `moderatedById`/`moderatedAt`/`rejectionReason`; jika proyek sudah punya sistem audit log terpusat, integrasikan ke sana juga.
- Tambahkan logging pada aksi approve/reject untuk keperluan investigasi jika ada komplain terkait moderasi.

## 9. Deliverables yang Diharapkan
1. Migrasi Prisma untuk model/field `Review` di atas.
2. Implementasi seluruh API endpoint beserta validasi & otorisasi.
3. Halaman Admin "Moderasi Ulasan" yang lengkap dan responsif.
4. Update pada komponen publik ulasan produk agar hanya menampilkan `APPROVED`.
5. Test suite (unit + integration) untuk seluruh alur di atas.
6. Ringkasan singkat perubahan (file yang ditambah/diubah) di akhir pengerjaan.

## 10. Batasan & Prinsip Kerja
- Jangan menghapus atau mengubah fitur/actor lain (Admin, Customer, Business, Super Admin) yang sudah berjalan.
- Ikuti konvensi kode, penamaan, dan struktur folder yang sudah ada di proyek — jangan memperkenalkan library/pattern baru kecuali benar-benar diperlukan dan tidak ada alternatif dari stack yang sudah dipakai (Next.js, Prisma, PostgreSQL).
- Jika menemukan ambiguitas kebutuhan bisnis (misalnya: apakah customer boleh mengedit ulasan setelah disetujui, apakah ada limit jumlah ulasan per produk per customer), catat sebagai asumsi eksplisit di ringkasan akhir, jangan diam-diam mengambil keputusan tanpa dicatat.
