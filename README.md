# LOBSTER WATER QUALITY MONITORING DASHBOARD (AQM)
> **Sistem Telemetri & Pemantauan Mutu Air Budidaya Lobster Laut (*Panulirus spp.*)**  
> *Frontend Only — Production-Ready, Modular Architecture with Full Backend Integration Layer.*

---

## 🌊 Ringkasan Proyek
Aplikasi web frontend modern, presisi, dan responsif untuk pemantauan kualitas air budidaya lobster laut tropis (*Panulirus ornatus* / *Panulirus homarus*). Proyek ini berfokus secara eksklusif pada **Frontend Presentation, UX/UI Design, dan Centralized Integration Architecture**, yang siap dihubungkan langsung ke REST API backend, mikrokontroler ESP32, basis data telemetri, dan model inferensi *fuzzy logic*.

---

## 🎨 Visual Identity & Inspirasi Desain
Desain visual mengadopsi estetika dasbor SaaS modern bertema kelautan (*Dark Ocean Palette*):
- **Kanvas & Permukaan**: `#060b13` (Abyssal Dark Canvas) dan kartu kaca transparan (*Frosted Glassmorphism*) dengan blur 18px.
- **Warna Aksen**: Cyan bioluminescent (`#00f2fe`), Teal laut dalam (`#00d2ba`), dan Violet indigo (`#818cf8`).
- **Indikator Baku Mutu**:
  - 🟢 **Optimal / Normal**: Emerald Mint (`#10b981`)
  - 🟡 **Waspada / Warning**: Radiant Amber (`#f59e0b`)
  - 🔴 **Kritis / Critical**: Coral Rose (`#f43f5e`)
- **Visualisasi Khusus**:
  - **Circular Fuzzy Status Ring**: Terinspirasi dari *match score gauge ring* pada referensi desain.
  - **Mini Sparkline Gradient**: Kurva tren interaktif pada setiap kartu parameter.
  - **Interactive Area Chart**: Visualisasi riwayat deret waktu (*time-series*) dengan *hover crosshair* dan *floating glass tooltip*.
  - **Pipeline Alur Data 6 Node**: Menampilkan arsitektur telemetri (*Sensor Fisik → ESP32 → REST API → Database → Fuzzy Model → Web Dashboard*).

---

## 🏗️ Struktur Arsitektur Proyek
```
LOBSTER/
├── docs/
│   └── API_INTEGRATION.md             # Dokumen Kontrak Integrasi REST API untuk Pengembang Backend
├── src/
│   ├── types/                         # Definisi Tipe TypeScript Domain & API
│   │   ├── sensor.ts                  # Parameter, pembacaan, dan model deret waktu
│   │   ├── classification.ts          # Payload inferensi Fuzzy Logic server-side
│   │   ├── alert.ts                   # Model peringatan lingkungan & status pengakuan
│   │   ├── device.ts                  # Status ESP32 & 6-node connection pipeline
│   │   ├── monitoring.ts              # Snapshot telemetri & status dashboard
│   │   └── api.ts                     # Envelope API, error model, & raw backend payloads
│   ├── services/api/                  # Lapisan Layanan HTTP & Klien Terpusat
│   │   ├── apiConfig.ts               # Konfigurasi runtime, polling, & env
│   │   ├── apiClient.ts               # Fetch client dengan timeout & penanganan galat terstandar
│   │   ├── monitoringService.ts       # Layanan data sensor & riwayat
│   │   ├── classificationService.ts   # Layanan hasil evaluasi fuzzy backend
│   │   ├── alertService.ts            # Layanan peringatan lingkungan
│   │   └── deviceService.ts           # Layanan status IoT & kontrol backend
│   ├── adapters/                      # Lapisan Pemetaan Data Backend -> Model UI
│   │   ├── monitoringAdapter.ts       # Normalisasi nama field & proteksi null (bukan 0!)
│   │   ├── classificationAdapter.ts   # Normalisasi status fuzzy tanpa manipulasi frontend
│   │   ├── alertAdapter.ts            # Normalisasi daftar alarm & kapabilitas
│   │   └── deviceAdapter.ts           # Normalisasi pelaporan pipeline
│   ├── mocks/                         # Penyedia Mock Deterministic untuk Mode Demo
│   │   ├── mockScenarios.ts           # Definisi 7 skenario pengujian deterministik
│   │   ├── mockMonitoringData.ts      # Generator kurva telemetri akuakultur realistis
│   │   └── mockMonitoringService.ts   # Layanan tiruan yang cocok dengan API interface
│   ├── hooks/                         # Custom React Hooks
│   │   ├── useMonitoring.ts           # Hook telemetri live, polling, & auto-staleness
│   │   ├── useSensorHistory.ts        # Hook kueri riwayat (1h, 24h, 7d)
│   │   └── useAlerts.ts               # Hook pengelolaan alarm & tindakan pengakuan
│   ├── components/
│   │   ├── layout/                    # Navbar & Sidebar dengan indikator aktif
│   │   ├── ui/                        # Badge status, Button, Skeleton
│   │   ├── dashboard/                 # SystemStatusBar & DemoScenarioBanner
│   │   ├── monitoring/                # ParameterCard & ParameterGrid (4 parameter utama)
│   │   ├── charts/                    # TimeSeriesChart interaktif SVG dengan ekspor CSV
│   │   ├── fuzzy/                     # ClassificationCard dengan Circular Gauge Ring
│   │   ├── alerts/                    # AlertCenter dengan filter keparahan
│   │   ├── connections/               # DataFlowPanel (Visualisasi Arsitektur 6 Node)
│   │   └── controls/                  # MonitoringControls (Frontend Polling vs Backend Signal)
│   ├── pages/                         # Halaman Aplikasi
│   │   ├── DashboardPage.tsx          # Koordinator navigasi & state
│   │   ├── DashboardOverview.tsx      # Dasbor ringkasan utama
│   │   ├── WaterQualityPage.tsx       # Analisis parameter & baku mutu ilmiah
│   │   ├── HistoricalDataPage.tsx     # Tabel riwayat lengkap dengan filter & ekspor CSV
│   │   ├── AlertsPage.tsx             # Halaman penanganan darurat & SOP
│   │   ├── DeviceStatusPage.tsx       # Diagnostik modul ESP32 & bus sensor
│   │   └── SettingsPage.tsx           # Konfigurasi mode demo, runtime URL, & polling
│   ├── utils/                         # Utilitas Pembantu
│   │   ├── dateFormatter.ts           # Format waktu relatif ("12 detik lalu"), ISO 8601
│   │   ├── unitFormatter.ts           # Metadata parameter, label, & pemformat nilai
│   │   └── dataValidation.ts          # Validasi angka & perhitungan tren
│   ├── styles/                        # Sistem Desain CSS Murni
│   │   ├── variables.css              # Token warna, glassmorphism, glow, radii
│   │   ├── index.css                  # Reset & tipografi Plus Jakarta Sans
│   │   ├── dashboard.css              # Tata letak grid shell aplikasi
│   │   ├── components.css             # Kartu, gauge, pipeline, tombol, alerts
│   │   └── charts.css                 # Grafik interaktif, crosshair, tooltip
│   ├── App.tsx
│   └── main.tsx
├── .env.example                       # Contoh variabel lingkungan
├── package.json
└── tsconfig.json
```

---

## 🚀 Panduan Memulai (*Quickstart*)

### 1. Prasyarat
- **Node.js**: Versi `>= 18.0.0` (Direkomendasikan Node.js 20+ atau 24 LTS)
- **NPM**: Versi `>= 9.0.0`

### 2. Pemasangan Dependensi
```bash
npm install
```

### 3. Menjalankan Server Pengembangan Lokal
```bash
npm run dev
```
Aplikasi akan tersedia secara otomatis di `http://localhost:5173`.

### 4. Membangun Berkas Produksi (*Production Build*)
```bash
npm run build
```
Hasil kompilasi siap diterapkan (*deploy*) akan tersimpan di direktori `dist/`.

---

## 🧪 7 Skenario Pengujian Deterministic Demo Mode
Di dalam antarmuka aplikasi, pengguna dapat beralih skenario pengujian secara deterministik melalui *dropdown* di banner atas:
1. **Kondisi Optimal (Normal)**: Temp 28.4 °C, pH 7.95, Salinitas 32.2 ppt, DO 5.65 mg/L. Hasil Fuzzy: `NORMAL`.
2. **Waspada Hipoksia (DO Rendah)**: DO anjlok ke 4.15 mg/L, memicu peringatan risiko hipoksia. Hasil Fuzzy: `WARNING`.
3. **Kritis Asidifikasi & Suhu Ekstrem**: pH anjlok ke 6.82, suhu 31.5 °C, DO 3.25 mg/L. Memicu alarm darurat. Hasil Fuzzy: `CRITICAL`.
4. **Data Usang (*Stale Telemetry*)**: Menyimulasikan jeda transmisi >45 menit; memicu badge peringatan data usang.
5. **Perangkat Terputus (*ESP32 Offline*)**: Menyimulasikan modul mikrokontroler kehilangan daya/koneksi.
6. **Kolam Baru (*Menunggu Data Awal*)**: Menyimulasikan tangki yang baru didaftarkan sebelum data telemetri pertama masuk (*Waiting for reading*).
7. **Simulasi Kegagalan REST API (503)**: Menyimulasikan server backend mati, mendemonstrasikan penanganan galat transparan tanpa pemalsuan data.

---

## 🔌 Petunjuk Integrasi Backend
Lihat dokumen lengkap di [`docs/API_INTEGRATION.md`](file:///i:/kampus/LOBSTER/docs/API_INTEGRATION.md).  
Untuk menghubungkan backend nyata:
1. Buka file `.env`
2. Atur `VITE_DATA_PROVIDER=real`
3. Atur `VITE_API_BASE_URL=http://<alamat-server-backend>/api`
4. Muat ulang antarmuka di peramban.

---
*Dikembangkan untuk Tugas Akhir / Capstone & Implementasi Produksi Akuakultur Presisi.*
