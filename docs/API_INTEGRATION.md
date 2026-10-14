# Lobster Water Quality Monitoring — API Integration Contract & Guide
**Sistem Pemantauan Kualitas Air Budidaya Lobster Laut (*Panulirus spp.*)**  
*Dokumentasi Kontrak Integrasi REST API & Model Data Frontend (Production-Ready)*

---

## 1. Ringkasan Eksekutif & Batasan Ruang Lingkup
Dokumen ini disusun oleh tim frontend sebagai **kontrak data acuan (*Proposed API Contract*)** untuk pengembang backend, teknisi firmware ESP32, dan insinyur model *fuzzy logic*.

### Prinsip Utama Integrasi:
1. **Frontend Independen & API-Ready**: Frontend dibangun dengan lapisan abstraksi berlapis (`services/api/` dan `adapters/`). Perubahan format internal backend dapat diadaptasi hanya melalui satu file adapter tanpa perlu merombak komponen visual antarmuka.
2. **Keabsahan Data Ilmiah**: Frontend **tidak pernah mengonversi nilai sensor kosong (*null/missing*) menjadi 0**. Jika sensor tidak membaca data atau terputus, data tetap bernilai `null` dan antarmuka akan menampilkan indikator "Tidak Ada Data" (*Unknown / Disconnected*).
3. **Fuzzy Logic Server-Side**: Klasifikasi mutu air (*Normal / Optimal*, *Waspada / Warning*, *Kritis / Bahaya*) dievaluasi sepenuhnya oleh mesin inferensi fuzzy di backend. Frontend tidak mengarang ambang batas (*threshold*) buatan.
4. **Isolasi Mode Demo & Produksi**: Pengujian antarmuka menggunakan mock provider deterministik terisolasi. Ketika beralih ke *Real API Mode*, kegagalan jaringan akan ditampilkan secara jujur sebagai *API Error / Offline*, bukan disamarkan dengan data palsu.

---

## 2. Konfigurasi Lingkungan (*Environment Variables*)
Frontend mengonsumsi variabel lingkungan berbasis Vite:

| Variabel | Tipe | Default | Deskripsi |
|---|---|---|---|
| `VITE_API_BASE_URL` | String | `http://localhost:8000/api` | Alamat basis REST API Gateway |
| `VITE_DATA_PROVIDER` | String (`demo` / `real`) | `demo` | Menentukan apakah frontend membaca mock lokal atau server nyata |
| `VITE_POLLING_INTERVAL_MS` | Number | `5000` | Interval auto-refresh polling dalam milidetik |
| `VITE_STALE_THRESHOLD_MS` | Number | `60000` | Batas waktu telemetri dianggap usang (*stale*) jika tidak ada pembaruan |

---

## 3. Spesifikasi Titik Akhir REST API (*Endpoint Specifications*)

### 3.1. `GET /api/monitoring/latest`
Mengembalikan pembacaan sensor perairan paling mutakhir beserta metadata perangkat ESP32 dan tangki pemeliharaan.

* **Metode**: `GET`
* **Query Parameters**:
  * `pondId` (opsional, string, contoh: `POOL-01`): Identifier bak pemeliharaan lobster.
* **Headers**: `Accept: application/json`

#### Contoh Respons Sukses (HTTP 200 OK):
> *Catatan: Nilai di bawah ini adalah data ilustratif acuan kontrak, bukan jaminan pembacaan sensor fisik.*
```json
{
  "success": true,
  "message": "Data telemetri terbaru berhasil diambil",
  "timestamp": "2026-10-12T00:15:00.000Z",
  "data": {
    "deviceId": "ESP32-LOBSTER-01",
    "pondId": "POOL-01",
    "timestamp": "2026-10-12T00:14:58.000Z",
    "data": {
      "temperature": 28.5,
      "ph": 7.95,
      "salinity": 32.2,
      "dissolvedOxygen": 5.65,
      "tds": null
    },
    "units": {
      "temperature": "°C",
      "ph": "pH",
      "salinity": "ppt",
      "dissolvedOxygen": "mg/L",
      "tds": "ppm"
    },
    "status": {
      "temperature": "normal",
      "ph": "normal",
      "salinity": "normal",
      "dissolvedOxygen": "normal"
    },
    "deviceStatus": {
      "esp32_connected": true,
      "sensor_bus_ok": true,
      "last_ping": "2026-10-12T00:14:58.000Z",
      "ipAddress": "192.168.1.142",
      "sensor_detail": "Bus 1-Wire & ADC 12-bit OK"
    }
  }
}
```

---

### 3.2. `GET /api/monitoring/history`
Mengembalikan riwayat data deret waktu (*time-series*) sensor per rentang waktu yang dipilih untuk kebutuhan grafik interaktif dan tabel historis.

* **Metode**: `GET`
* **Query Parameters**:
  * `pondId` (string, contoh: `POOL-01`)
  * `range` (`1h` | `24h` | `7d` | `custom`)
  * `startDate` (opsional, ISO 8601 string jika `range=custom`)
  * `endDate` (opsional, ISO 8601 string jika `range=custom`)
  * `parameter` (opsional: `temperature` | `ph` | `salinity` | `dissolvedOxygen`)

#### Contoh Respons Sukses (HTTP 200 OK):
```json
{
  "success": true,
  "timestamp": "2026-10-12T00:15:00.000Z",
  "data": {
    "temperature": [
      { "timestamp": "2026-10-11T23:00:00.000Z", "value": 28.3, "status": "normal" },
      { "timestamp": "2026-10-11T23:30:00.000Z", "value": 28.4, "status": "normal" },
      { "timestamp": "2026-10-12T00:00:00.000Z", "value": 28.5, "status": "normal" }
    ],
    "ph": [
      { "timestamp": "2026-10-11T23:00:00.000Z", "value": 7.92, "status": "normal" },
      { "timestamp": "2026-10-11T23:30:00.000Z", "value": 7.95, "status": "normal" },
      { "timestamp": "2026-10-12T00:00:00.000Z", "value": 7.96, "status": "normal" }
    ],
    "salinity": [
      { "timestamp": "2026-10-11T23:00:00.000Z", "value": 32.1, "status": "normal" },
      { "timestamp": "2026-10-11T23:30:00.000Z", "value": 32.2, "status": "normal" },
      { "timestamp": "2026-10-12T00:00:00.000Z", "value": 32.2, "status": "normal" }
    ],
    "dissolvedOxygen": [
      { "timestamp": "2026-10-11T23:00:00.000Z", "value": 5.70, "status": "normal" },
      { "timestamp": "2026-10-11T23:30:00.000Z", "value": 5.68, "status": "normal" },
      { "timestamp": "2026-10-12T00:00:00.000Z", "value": 5.65, "status": "normal" }
    ]
  }
}
```

---

### 3.3. `GET /api/monitoring/classification`
Mengembalikan hasil inferensi *fuzzy logic* server-side mengenai kondisi mutu air tangki pemeliharaan lobster.

* **Metode**: `GET`
* **Query Parameters**: `pondId=POOL-01`

#### Contoh Respons Sukses (HTTP 200 OK):
```json
{
  "success": true,
  "data": {
    "pondId": "POOL-01",
    "classification": "NORMAL",
    "evaluatedAt": "2026-10-12T00:14:58.000Z",
    "confidence": 0.94,
    "summary": "Kualitas air berada pada baku mutu optimal untuk genus Panulirus.",
    "triggering_factors": [
      {
        "parameter": "Dissolved Oxygen (DO)",
        "observed_value": 5.65,
        "unit": "mg/L",
        "influence": "low",
        "note": "Kandungan oksigen terlarut sangat stabil"
      },
      {
        "parameter": "pH",
        "observed_value": 7.95,
        "unit": "pH",
        "influence": "low",
        "note": "Alkalinitas air laut optimal"
      }
    ],
    "recommendation": "Pertahankan aerasi berkala dan debit sirkulasi air normal."
  }
}
```

#### Kondisi Evaluasi Belum Tersedia / Pending:
Jika mesin inferensi fuzzy belum melakukan evaluasi atau data belum cukup:
```json
{
  "success": true,
  "data": {
    "pondId": "POOL-01",
    "classification": "PENDING",
    "evaluatedAt": null,
    "summary": "Menunggu hasil klasifikasi dari backend fuzzy logic",
    "triggering_factors": []
  }
}
```
*Frontend akan otomatis menampilkan badge "Menunggu" tanpa mengarang hasil tiruan.*

---

### 3.4. `GET /api/monitoring/alerts`
Mengembalikan daftar peringatan kondisi air abnormal terkini beserta riwayatnya.

* **Metode**: `GET`
* **Query Parameters**: `pondId=POOL-01`

#### Contoh Respons Sukses (HTTP 200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "ALT-101",
      "severity": "warning",
      "title": "Oksigen Terlarut Mendekati Batas Kritis",
      "message": "Kadar DO terukur 4.15 mg/L. Berisiko stres hipoksia pada lobster juvenil.",
      "parameter": "dissolvedOxygen",
      "value": 4.15,
      "unit": "mg/L",
      "timestamp": "2026-10-12T00:08:00.000Z",
      "acknowledged": false,
      "can_acknowledge": true
    }
  ]
}
```

---

### 3.5. `POST /api/monitoring/alerts/:id/acknowledge` (Opsional)
Endpoint untuk mencatat konfirmasi/pengakuan dari operator akuakultur terhadap peringatan yang muncul.

* **Metode**: `POST`
* **Path Parameter**: `:id` (ID peringatan, contoh: `ALT-101`)
* **Headers**: `Content-Type: application/json`

#### Contoh Respons (HTTP 200 OK):
```json
{
  "success": true,
  "message": "Peringatan ALT-101 berhasil diakui oleh operator"
}
```

---

### 3.6. Usulan Operasi Kontrol Pemantauan (*Proposed Monitoring Operations*)
Dua endpoint berikut merupakan **proposal integrasi** yang dirancang frontend untuk membedakan antara menjeda auto-refresh browser dengan mengendalikan proses akuisisi data server:

#### `POST /api/monitoring/start`
* **Tujuan**: Menginstruksikan backend untuk mengaktifkan proses penerimaan telemetri sensor untuk tangki tertentu.
* **Payload**: `{ "pondId": "POOL-01" }`

#### `POST /api/monitoring/pause`
* **Tujuan**: Menginstruksikan backend untuk menjeda perekaman telemetri.
* **Payload**: `{ "pondId": "POOL-01" }`

*Catatan: Jika endpoint ini belum diimplementasikan di backend, frontend akan menangani kode HTTP 404/501 secara elegan dengan menampilkan keterangan bahwa operasi kontrol backend belum tersedia.*

---

## 4. Struktur Adapter Frontend (`src/adapters/`)
Untuk mengakomodasi fleksibilitas implementasi backend yang mungkin menggunakan variasi nama kolom (contoh: snake_case vs camelCase), frontend telah menyediakan fungsi pemetaan terpusat di:

* [`src/adapters/monitoringAdapter.ts`](file:///i:/kampus/LOBSTER/src/adapters/monitoringAdapter.ts)  
  * Mendukung alias: `dissolved_oxygen`, `do`, `temp_c`, `created_at`, dsb.
* [`src/adapters/classificationAdapter.ts`](file:///i:/kampus/LOBSTER/src/adapters/classificationAdapter.ts)  
  * Menormalkan status `NORMAL`, `WASPADA`, `BAHAYA` menjadi model internal frontend.
* [`src/adapters/alertAdapter.ts`](file:///i:/kampus/LOBSTER/src/adapters/alertAdapter.ts)  
  * Menormalkan daftar peringatan dan status konfirmasi.
* [`src/adapters/deviceAdapter.ts`](file:///i:/kampus/LOBSTER/src/adapters/deviceAdapter.ts)  
  * Menormalkan visualisasi status 6 tahap arsitektur telemetri.

---

## 5. Panduan Menghubungkan Backend Nyata (*Step-by-Step Backend Handover*)
1. Pastikan backend REST API telah berjalan dan mengizinkan CORS dari domain frontend (contoh: `http://localhost:5173`).
2. Buat atau perbarui file `.env` di direktori proyek:
   ```env
   VITE_API_BASE_URL=http://<IP_ATAU_DOMAIN_BACKEND>:8000/api
   VITE_DATA_PROVIDER=real
   ```
3. Jalankan aplikasi frontend:
   ```bash
   npm run dev
   ```
4. Jika backend memiliki nama parameter yang sedikit berbeda, cukup sesuaikan objek pemetaan di `src/adapters/monitoringAdapter.ts` tanpa perlu menyentuh komponen UI dashboard.
