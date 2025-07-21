# Sistem Manajemen Delivery Order WSB

Sistem manajemen delivery order yang komprehensif dengan antarmuka web modern, panel admin, dan integrasi API backend.

## Fitur

- ✅ **Dashboard Pelanggan**: Antarmuka modern untuk melihat produk dan melakukan pemesanan
- ✅ **Panel Admin**: Sistem manajemen pesanan lengkap dan upload gambar produk
- ✅ **Sistem Autentikasi**: Login aman dengan manajemen sesi
- ✅ **Integrasi Database**: Backend MySQL dengan manajemen data yang komprehensif
- ✅ **Desain Responsif**: Dioptimalkan untuk mobile dan desktop
- ✅ **Update Real-time**: Status pesanan dinamis dan informasi produk
- ✅ **Riwayat Pesanan**: Pelacakan pesanan lengkap dan manajemen riwayat

## Prerequisites

Sebelum menjalankan aplikasi ini, pastikan Anda telah menginstal:

- **Node.js** (versi 16 atau lebih tinggi)
- **npm** (Node Package Manager)
- **MySQL Server** (versi 8.0 atau lebih tinggi)
- **Git** (untuk version control)

## Instalasi & Setup

### 1. Clone Repository

```bash
git clone https://github.com/Azixe/wsb-do.git
cd wsb-do
```

### 2. Setup Database

1. Jalankan MySQL server Anda
2. Buat database dengan nama `data_ku`
3. Setup tabel yang diperlukan (lihat dokumentasi skema database)
4. Update pengaturan koneksi database di `backend/server.js` jika diperlukan:

```javascript
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Update dengan password MySQL Anda
    database: 'data_ku'
});
```

### 3. Setup Backend

```bash
# Navigasi ke direktori backend
cd backend

# Install dependensi backend
npm install

# Jalankan server backend
node server.js
```

Backend akan berjalan di `http://localhost:3001`

### 4. Setup Frontend

```bash
# Dari direktori root
# Install dependensi frontend (jika ada)
npm install

# Jalankan frontend (Anda bisa menggunakan static file server apa saja)
# Misalnya, menggunakan Live Server extension di VS Code
# atau Python built-in server:
python -m http.server 3000
```

Frontend akan tersedia di `http://localhost:3000`

## Menjalankan Aplikasi

### Server Backend
```bash
cd backend
node server.js
```

### Frontend
Buka `index.html` di browser Anda atau gunakan local development server.

## Struktur File

```
wsb-do/
├── admin/
│   ├── order.html          # Manajemen pesanan admin
│   ├── products.html       # Manajemen gambar produk admin
│   ├── order.css          # Styling admin
│   ├── products.css       # Styling manajemen produk
│   └── products.js        # Fungsionalitas manajemen produk
├── assets/
│   ├── css/               # Stylesheet
│   ├── js/                # File JavaScript
│   └── imgs/              # Gambar dan aset
├── backend/
│   ├── server.js          # Server backend Express.js
│   ├── package.json       # Dependensi backend
│   └── node_modules/      # Paket backend
├── pages/
│   ├── dashboard.html     # Dashboard pelanggan
│   ├── checkout.html      # Halaman checkout pesanan
│   └── history.html       # Halaman riwayat pesanan
├── index.html             # Halaman login
├── package.json           # Konfigurasi proyek
└── README.md              # File ini
```

## API Endpoints

### Autentikasi
- `POST /api/login` - Login pengguna
- `POST /api/logout` - Logout pengguna

### Pesanan
- `GET /api/orders` - Dapatkan semua pesanan
- `POST /api/orders` - Buat pesanan baru
- `PUT /api/orders/:id` - Update status pesanan
- `DELETE /api/orders/:id` - Hapus pesanan

### Produk
- `GET /api/products` - Dapatkan semua produk
- `GET /api/products/:id/image` - Dapatkan gambar produk
- `POST /api/products/:id/image` - Upload gambar produk
- `DELETE /api/products/:id/image` - Hapus gambar produk

### Admin
- `GET /api/admin/products/all` - Dapatkan semua produk untuk admin

## Teknologi yang Digunakan

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Ikon Font Awesome
- Desain responsif dengan Flexbox/Grid

### Backend
- Node.js dengan Express.js
- MySQL2 untuk konektivitas database
- Multer untuk upload file
- bcrypt untuk hashing password
- CORS untuk cross-origin requests

### Database
- MySQL 8.0+
- Penyimpanan BLOB untuk gambar
- Struktur data relasional

## Kontributor
<a href="https://github.com/Azixe/wsb-do/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Azixe/wsb-do"  alt="wsb-do Contributors"/>
</a>
