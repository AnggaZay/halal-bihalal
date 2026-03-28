# Panduan Pengembangan Dashboard Panitia Halal Bihalal

Dokumen ini digunakan sebagai acuan struktur, visual, dan komponen untuk halaman Dashboard (/dashboard).

## 1. Konsep Visual & Palet Warna
Dashboard harus mengutamakan keterbacaan data (clean & modern) sambil tetap mempertahankan identitas acara.

- **Background Aplikasi (Body)**: `#F3F4F6` (Gray-100) - Memberikan kontras yang nyaman untuk membaca data.
- **Background Kartu/Tabel**: `#FFFFFF` (Putih) - Memisahkan area konten dari background aplikasi.
- **Teks Utama**: `#101111` (Gelap/Hitam) - Untuk judul, teks tabel, dan navigasi.
- **Aksen Emas (Primary Action)**: `#A6824A` - Untuk tombol simpan, border aktif, ringkasan angka, dan ikon.
- **Aksen Marun (Secondary/Warning)**: `#5D1E21` - Untuk tombol kembali, notifikasi penting, atau badge khusus.
- **Teks Sekunder/Muted**: `#6B7280` (Gray-500) - Untuk deskripsi kecil atau placeholder.

## 2. Tipografi (Font)
- **Data & Konten Utama**: Gunakan font *Sans-Serif* bawaan Tailwind (Inter/System) agar angka dan tabel padat mudah dibaca.
- **Judul Besar/Header**: Bisa menggunakan *Playfair Display* untuk sentuhan elegan yang senada dengan undangan.

## 3. Struktur Layout Utama
- **Sidebar Navigasi (Kiri)**: Fixed posisinya di desktop. Berisi menu-menu divisi (Overview, Kesekretariatan, Garda Boga, Garda Area, Eksekutif). Di mobile, ini menjadi menu *hamburger* (Drawer).
- **Top Header (Atas)**: Berisi judul halaman saat ini, indikator status koneksi (Realtime), dan profil panitia.
- **Main Content (Kanan/Tengah)**: Area responsif tempat tabel dan kartu ringkasan berada.

## 4. Modul / Halaman yang Direncanakan
Akses dashboard akan dibagi berdasarkan kebutuhan divisi (Garda):
1. **`/dashboard` (Overview)**: Ringkasan total kehadiran, sisa kursi, statistik makanan/kendaraan secara umum.
2. **`/dashboard/sekretariat`**: Master data tamu (Tabel RSVP). Fitur pencarian nama, status hadir, dan cetak laporan.
3. **`/dashboard/garda-boga`**: Khusus mengurus konsumsi. Menampilkan rekap jumlah porsi makanan tertentu, dan minuman (Manis/Tawar) per area meja.
4. **`/dashboard/garda-area`**: Khusus mengurus perlengkapan & parkir. Menampilkan data jumlah motor vs mobil, dan panduan alokasi parkir (UMPP vs Warmindo).
5. **`/dashboard/eksekutif`**: Fitur broadcast/pengumuman internal panitia dan ringkasan level tinggi.

## 5. Komponen UI Reusable (Yang perlu disiapkan)
- `<Sidebar />`: Menu navigasi statis.
- `<StatCard />`: Kartu kotak putih berisi Ikon, Judul (misal: "Total Hadir"), dan Angka Besar.
- `<DataTable />`: Komponen tabel dengan *sticky header*, background belang-belang (zebra-striping), dan scroll horizontal untuk HP.
- `<Badge />`: Label kecil berwarna untuk status (Hadir = Hijau, Pending = Kuning/Emas).

## 6. Aturan Pengambilan Data (Supabase)
- **Realtime First**: Karena acara live, gunakan fitur subscription dari Supabase jika memungkinkan, atau tombol "Refresh Data" manual yang jelas terlihat.
- **Optimistic UI**: Jika panitia merubah status (misal menekan tombol "Check-in" tamu), UI harus langsung berubah seketika, baru di belakang layar menembak API Supabase.

---
*Catatan: Panduan ini bersifat dinamis dan dapat diperbarui seiring berjalannya proses development.*