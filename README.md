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

---

# 🎓 Sesi Simulasi Tanya Jawab (Ujian/Sertikom)

Berikut adalah kompilasi pertanyaan kritis yang sangat sering diajarkan oleh penguji beserta strategi jawaban teknis dan teoritis yang akan membuat Anda terlihat sangat matang dan profesional:

---

### **Kategori A: Arsitektur & Integrasi Sistem (Laravel & Expo)**

#### ❓ **Q1: Bagaimana cara aplikasi Expo Mobile mengetahui jika ada perubahan status cucian di Laravel Admin? Apakah menggunakan WebSocket atau polling?**
*   **Jawaban Anda**: "Pada implementasi LUSTRA saat ini, integrasi data dilakukan melalui metode **Restful API State Synchronization**. Ketika kasir melakukan pembaruan status di Web Admin, database akan menulis entitas notifikasi baru yang terasosiasi dengan ID User tersebut. Di sisi mobile, kami memanfaatkan hook Expo **`useFocusEffect`** yang dikombinasikan dengan **`useCallback`**. Begitu pengguna memfokuskan aplikasi atau membuka tab notifikasi, aplikasi mobile akan melakukan fetch HTTP GET `/api/notifications` secara asinkronus ke server. Kami juga menyediakan fitur **`RefreshControl` (Pull to Refresh)** sehingga pelanggan bisa memicu pembaruan data secara manual kapan saja dengan transisi yang sangat mulus."

#### ❓ **Q2: Mengapa Anda memilih Laravel Sanctum untuk sistem autentikasi di aplikasi mobile?**
*   **Jawaban Anda**: "Kami memilih **Laravel Sanctum** karena Sanctum menyediakan sistem autentikasi token berbasis API yang sangat ringan, aman, dan berkinerja tinggi untuk aplikasi Single Page Application (SPA) maupun Mobile App. Ketika pelanggan melakukan login dari perangkat mobile, Sanctum memvalidasi kredensial dan menerbitkan **Personal Access Token (PAT)** yang disimpan dengan aman di penyimpanan perangkat mobile. Token ini kemudian dilampirkan pada header HTTP permintaan berikutnya sebagai bearer token (`Authorization: Bearer <token>`), sehingga server Laravel dapat mengidentifikasi pengguna dengan aman tanpa overhead sesi yang berat."

---

### **Kategori B: Keamanan Sistem & Validasi**

#### ❓ **Q3: Saya melihat Anda menerapkan proteksi ganda pada otorisasi admin. Mengapa validasi di form login saja tidak cukup?**
*   **Jawaban Anda**: "Proteksi di form login saja tidak cukup karena ada risiko manipulasi di sisi client (Client-side bypass). Jika seseorang berhasil memintas form login atau memiliki token autentikasi yang tersimpan di memori, mereka bisa saja langsung mengetikkan URL rute admin seperti `/admin/dashboard`. Oleh karena itu, kami menerapkan **Bulletproof Dual-Layer Guard**:
    1.  **Lapisan Pertama**: Di form login, API response mengecek jika peran (`role`) bukan `'admin'`, akses ditolak seketika sebelum sesi dibuat.
    2.  **Lapisan Kedua (Master Layout Guard)**: Di dalam master template `layouts/app.blade.php`, kami menyisipkan script pemeriksaan global mandiri saat halaman dimuat. Jika script mendeteksi bahwa data user aktif di penyimpanan lokal bukan admin, sistem akan langsung menghancurkan local storage (clearing token) dan memicu pemaksaan rute keluar (*forced redirect*) kembali ke `/login`. Ini menjamin keamanan maksimal dari serangan eksploitasi URL."

#### ❓ **Q4: Bagaimana Anda menangani validasi alamat saat membuat pelanggan baru di sisi admin?**
*   **Jawaban Anda**: "Pada awalnya, terdapat ketidakcocokan di mana pengontrol backend (`StoreCustomerRequest`) mewajibkan bidang alamat (`address`), namun formulir modal admin belum memilikinya. Masalah ini kami selesaikan dengan menambahkan bidang input bertipe *textarea* yang tidak dapat diubah ukurannya (*non-resizable*) untuk kolom Alamat di dalam modal `customers.blade.php`. Bidang alamat ini divalidasi secara ketat baik di sisi frontend maupun di request class Laravel sebelum data berhasil disimpan ke dalam basis data."

---

### **Kategori C: Desain & Pengalaman Pengguna (UI/UX)**

#### ❓ **Q5: Apa alasan Anda membuat komponen Date Picker kustom sendiri dibanding memakai library siap pakai?**
*   **Jawaban Anda**: "Tujuan utama kami membuat Custom Date Picker berbasis CSS Grid & Alpine.js adalah untuk **kontrol penuh atas estetika desain (UI-Consistency) dan performa**. Library pihak ketiga seringkali membawa ukuran file css/js yang besar dan sulit disesuaikan dengan tema **Premium Soft Glassmorphism** yang kami bangun. Dengan menulisnya sendiri, kami bisa memastikan Date Picker terintegrasi secara mulus dengan tema warna, memiliki responsivitas tinggi, dan memiliki tombol 'Clear Filter' yang cepat serta fungsional tanpa menimbulkan beban dependensi tambahan pada aplikasi."

#### ❓ **Q6: Bagaimana cara Anda menangani masalah layout di mana Bottom Tab Bar yang melayang menutupi daftar transaksi paling bawah di aplikasi mobile?**
*   **Jawaban Anda**: "Karena kami mendesain Bottom Tab Bar dengan posisi absolut melayang (*Floating Menu*) agar terlihat estetis dan premium, bar tersebut secara alami berada di atas kontainer halaman utama. Untuk mencegah terpotongnya konten daftar transaksi terbawah, kami menerapkan **Anti-Overlap Padding Spacing**. Di seluruh kontainer scroll utama (seperti `FlatList` dan `ScrollView`), kami memberikan properti gaya `contentContainerStyle` dengan bantalan bawah (`paddingBottom: 100`). Bantalan ini memberikan ruang kosong setara tinggi menu melayang tersebut sehingga konten paling bawah tetap dapat di-scroll ke atas dengan sempurna tanpa terhalang menu navigasi."
w