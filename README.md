# 👕 LUSTRA — Premium Laundry POS & Customer Tracking System

> **Tugas Ujian Sertifikasi Kompetensi (Sertikom)**
> Aplikasi POS Kasir Laundry berbasis Web Admin (Laravel 11) terintegrasi mulus dengan Aplikasi Pelacakan Pelanggan berbasis Mobile App (React Native Expo).

---

## 🌟 Gambaran Umum Project
**LUSTRA** adalah platform digital laundry modern yang dirancang untuk menjembatani operasional kasir/admin laundry dengan kenyamanan pelanggan dalam memantau pakaian mereka. Platform ini terdiri dari dua ekosistem utama:
1.  **Backend & Admin Web Portal (Laravel 11)**: Digunakan oleh Administrator/Kasir untuk mengelola transaksi secara kasir, mengelola paket layanan, memantau pendapatan, mendaftarkan pelanggan, serta  melakukan verifikasi pembayaran transfer secara instan dengan desain **Premium Soft Glassmorphism UI**.
2.  **Customer Mobile App (React Native Expo)**: Aplikasi mobile pelanggan yang responsif dengan tipografi modern **Poppins** dan navigasi melengkung melayang (*Floating Bottom Navigation Bar*). Pelanggan dapat melihat riwayat laundry secara realtime, mengunggah bukti transfer, dan mendapatkan notifikasi langsung ketika pakaian sedang dicuci atau disetrika.

---

## 🛠️ Tech Stack yang Digunakan

### **Admin Portal (Web)**
*   **Framework**: Laravel 11 (PHP 8.2+)
*   **Frontend Engine**: Blade Templating Engine
*   **Desain & Styling**: Vanilla CSS Modern dengan kustomisasi **Soft Glassmorphism UI**, bayangan kartu premium, dan palet warna HSL Navy-Teal pilihan.
*   **State Management & Reactivity**: Alpine.js & Vanilla JavaScript AJAX (Fetch API)
*   **Database**: MySQL / MariaDB
*   **Autentikasi**: Laravel Session-Based Guard & Sanctum Tokenizer API

### **Customer App (Mobile)**
*   **Core Engine**: React Native (Expo Router v3)
*   **Styling**: React Native StyleSheet dengan sistem tokenisasi warna (Navy, Teal, Minty Soft)
*   **Font System**: Google Fonts (Poppins Family: Light, Regular, Medium, SemiBold, Bold, ExtraBold)
*   **Networking Client**: Axios Interceptors (terkoneksi aman ke Laravel Sanctum)
*   **Platform Support**: iOS, Android, Web App

---

## ✨ Fitur-Fitur Unik & Inovasi Baru

### 1. 📅 Custom Date Picker Glassmorphism (Tanpa Dependency)
*   **Inovasi**: Alih-alih menggunakan library berat seperti Bootstrap Datepicker atau Flatpickr, Admin Portal LUSTRA menggunakan komponen **Custom Date Picker Calendar** yang ditulis manual menggunakan CSS Grid & Alpine.js.
*   **Keunggulan**: Tampilan menyatu sempurna dengan desain Soft UI, transisi pergantian bulan sangat instan, serta mendukung fitur pembersihan filter tanggal dalam satu klik.
*   **Fungsi**: Membantu admin menyaring grafik dan tabel transaksi per tanggal spesifik secara instan.

### 2. ⚡ Premium Soft-Loader Spinner & Animasi Perpindahan Halaman
*   **Inovasi**: Untuk menghindari kejutan visual berupa layar kosong atau tulisan kaku "Memuat..." saat berpindah tab menu atau menunggu respon API, LUSTRA mengintegrasikan **Premium Spinner** dengan kurva putaran `cubic-bezier` dan efek **Fade-In Transition**.
*   **Fungsi**: Menghadirkan transisi berpindah halaman yang terasa sangat responsif, hidup, dan dinamis, memberikan sentuhan standar produk komersial premium.

### 3. 🔔 Realtime In-App Notifications (Pelacakan Status Cucian)
*   **Inovasi**: Integrasi basis data hibrida antara Laravel Backend dan Expo Mobile untuk menghadirkan notifikasi pembaruan status laundry secara langsung.
*   **Skenario Pemicu Otomatis**:
    *   **Transaksi Baru**: Pelanggan mendapatkan notifikasi begitu pesanan dibuat oleh kasir.
    *   **Pembaruan Status**: Pelanggan langsung menerima pesan saat pakaian diubah statusnya (misal: *"Cucian Anda (INV-001) kini sedang: DISETRIKA"*).
    *   **Persetujuan Pembayaran**: Pelanggan dikabari seketika ketika kasir menyetujui unggahan bukti transfer mereka.
*   **Fitur di Mobile**: Notifikasi belum dibaca memiliki indikator garis batas *Teal* menyala dan *Unread Dot Badge*. Begitu layar dibuka, sistem akan menandai seluruh notifikasi tersebut sebagai "Telah Dibaca" di backend menggunakan metode Axios PUT.

### 4. 🎛️ Floating Bottom Tab Navigation (Mobile)
*   **Inovasi**: Navigasi bawah standar yang kaku diganti menjadi navigasi melayang (*Floating Pill Menu*) dengan sudut melengkung sempurna (`borderRadius: 24`), margin mengambang, serta sebaran bayangan lembut yang sangat premium (`shadowRadius: 20`, `shadowOpacity: 0.12`).
*   **Anti-Overlap Padding**: Dilengkapi kalkulasi tinggi dinamis dengan `paddingBottom: 100` pada seluruh scroll view agar konten daftar transaksi tidak tertutup oleh navigasi melayang tersebut.

### 5. 🛡️ Bulletproof Dual-Layer Authentication Guard
*   **Inovasi**: Mencegah celah keamanan serius di mana akun bertipe pelanggan (*customer*) mencoba menyusup ke dalam portal kasir admin (`/admin/*`).
*   **Lapisan Pengamanan**:
    *   **Form Gate**: Handler login mengecek tipe akun secara langsung sebelum masuk ke dashboard. Jika bukan admin, sesi ditolak mentah-mentah.
    *   **Layout Self-Exec Guard**: Pada level master layout Laravel, terdapat *script guard* yang mendeteksi peran pengguna dari penyimpanan lokal. Jika terdeteksi bukan admin, penyimpanan lokal langsung dihancurkan dan paksa kembali ke `/login`.

---

## 📂 Struktur Penting Proyek

### **Web Admin & Backend**
*   [TransactionController.php](file:///c:/Users/bimag/Documents/SEKOLAH/LaundrySertikom/app/Http/Controllers/Api/TransactionController.php) — Mengatur status laundry, verifikasi pembayaran, serta memicu notifikasi otomatis.
*   [NotificationController.php](file:///c:/Users/bimag/Documents/SEKOLAH/LaundrySertikom/app/Http/Controllers/Api/NotificationController.php) — Mengurus penarikan data notifikasi dan penandaan "Telah Dibaca" oleh customer.
*   [reports.blade.php](file:///c:/Users/bimag/Documents/SEKOLAH/LaundrySertikom/resources/views/admin/reports.blade.php) — Halaman laporan statistik dengan grafik Chart.js, custom date picker, dan grid verifikasi pembayaran.
*   [customers.blade.php](file:///c:/Users/bimag/Documents/SEKOLAH/LaundrySertikom/resources/views/admin/customers.blade.php) — Mengelola data pelanggan lengkap dengan penambahan field Alamat baru yang tervalidasi.

### **Expo Mobile App**
*   [_layout.tsx](file:///c:/Users/bimag/Documents/SEKOLAH/LaundryApp/app/%28tabs%29/_layout.tsx) — Konfigurasi navigasi Floating Tab Bar premium.
*   [notifications.tsx](file:///c:/Users/bimag/Documents/SEKOLAH/LaundryApp/app/%28tabs%29/notifications.tsx) — Antarmuka utama notifikasi realtime pelanggan dengan Poppins Bold.
*   [index.tsx](file:///c:/Users/bimag/Documents/SEKOLAH/LaundryApp/app/%28tabs%29/index.tsx) — Dashboard pelacakan transaksi cucian aktif milik pelanggan.

---

## 🚀 Panduan Instalasi & Menjalankan Project

### 1. Menjalankan Backend Laravel
```bash
# Pindah ke direktori Laravel
cd LaundrySertikom

# Install dependensi PHP
composer install

# Salin konfigurasi environment & buat key baru
cp .env.example .env
php artisan key:generate

# Lakukan migrasi database (Tabel transaksi & notifikasi baru)
php artisan migrate --seed

# Jalankan server lokal (berjalan di http://127.0.0.1:8000)
php artisan serve
```

### 2. Menjalankan Aplikasi Mobile Expo
```bash
# Pindah ke direktori Expo
cd LaundryApp

# Install dependensi JS
npm install

# Jalankan Expo server
npm start
```
*Tekan `w` di terminal Expo untuk membukanya langsung di browser (React Native Web).*
