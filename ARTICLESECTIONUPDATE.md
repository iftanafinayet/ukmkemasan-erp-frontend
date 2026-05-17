# 📋 Rencana Implementasi: Navigasi & Detail Artikel Terkini

Rencana kerja terstruktur dengan checklist untuk membuat section **Artikel Terkini** dapat diklik dan bernavigasi ke halaman detail artikel.

---

### ⚙️ 1. Pengembangan Data Artikel (Backend & Frontend Schema)
- [ ] **Definisikan Field Baru `content`**: Menambahkan field `content` untuk menyimpan teks lengkap artikel.
  - **Input yang digunakan**: Menggunakan **`TextAreaField`** dengan label **`"Konten Lengkap"`** dan ukuran **`rows={8}`**. Ini dirancang agar Admin memiliki ruang yang cukup luas dan nyaman untuk menulis isi artikel secara utuh.
- [ ] **Update Utilitas `landingContent.js`**:
  - [ ] Tambahkan `content: ''` di dalam model default `createEmptyArticle`.
  - [ ] Petakan `content` dalam fungsi `buildLandingContentPayload` saat menyimpan data ke server.
  - [ ] Pastikan normalisasi di `normalizeLandingContent` meng-handle field `content`.
- [ ] **Integrasi Input Admin**:
  - [ ] Tambahkan komponen `TextAreaField` di bawah input ringkasan artikel pada file `LandingContentSettingsSection.jsx` agar Admin bisa mengisi data ini.

### 📄 2. Pembuatan Halaman Detail Artikel (`CustomerPortalArticleDetail.jsx`)
- [ ] **Buat Komponen Baru**: Membuat `src/app/components/customer-portal/CustomerPortalArticleDetail.jsx`.
- [ ] **Desain Tampilan Premium & Responsif**:
  - [ ] **Header**: Banner gambar artikel yang estetik dengan overlay judul, kategori, dan tanggal publikasi.
  - [ ] **Konten**: Memformat tulisan artikel secara vertikal dengan tipografi premium (Inter/Roboto), spacing yang proporsional, serta dukungan format *multi-line* (`whitespace-pre-line` agar baris baru/paragraf terjaga).
  - [ ] **Navigasi Balik**: Tombol "Kembali ke Home" yang didesain modern dan interaktif.
  - [ ] **Desain Ramah Mobile**: Menyesuaikan font size dan layout padding untuk layar smartphone.

### 🛣️ 3. Konfigurasi Routing (`src/App.jsx`)
- [ ] **Daftarkan Rute Baru**:
  - [ ] Rute: `/portal/articles/:id`
  - [ ] Render komponen: `CustomerPortalArticleDetail` (atau diintegrasikan ke sub-sistem portal yang bersih).
  - [ ] Gunakan `lazy` import untuk performa loading yang optimal.

### 🖱️ 4. Navigasi Interaktif di Homepage (Desktop & Mobile)
- [ ] **Homepage Desktop (`CustomerPortalHomePage.jsx`)**:
  - [ ] Ubah card artikel menjadi pembungkus interaktif (cursor pointer, hover scale-up, shadow-effect).
  - [ ] Tambahkan `onClick={() => navigate(\`/portal/articles/\${article._id || article.clientId}\`)}` menggunakan `useNavigate`.
- [ ] **Homepage Mobile (`MobileHomePage.jsx`)**:
  - [ ] Buat item daftar artikel pilihan menjadi clickable.
  - [ ] Tambahkan navigasi serupa menggunakan `useNavigate` untuk menjaga paritas fitur di layar Mobile.

### 🧪 5. Verifikasi & Pengujian
- [ ] **Uji Simpan Admin**: Pastikan Admin bisa mendapat artikel baru, mengisi "Konten Lengkap", mengunggah gambar, dan menyimpannya tanpa error.
- [ ] **Uji Navigasi Desktop**: Klik artikel di Homepage Desktop membawa user ke halaman detail yang benar.
- [ ] **Uji Navigasi Mobile**: Klik artikel di Homepage Mobile membawa user ke halaman detail yang benar.
- [ ] **Uji Tombol Kembali**: Tombol "Kembali ke Home" sukses mengarahkan kembali ke dashboard utama portal.