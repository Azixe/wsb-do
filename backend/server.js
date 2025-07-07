// 1. Import library yang dibutuhkan
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

// 2. Inisialisasi aplikasi express
const app = express();
const PORT = 3001;

// 3. Buat koneksi ke database MySQL
// !!! GANTI `nama_database_anda` DENGAN NAMA DATABASE ANDA YANG BENAR ('data_ku') !!!
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'data_ku' // Ganti dengan nama database Anda
});

// Coba hubungkan ke database
db.connect((err) => {
    if (err) {
        console.error('Error menghubungkan ke database:', err);
        return;
    }
    console.log('Berhasil terhubung ke database MySQL!');
});

// 4. Gunakan middleware
app.use(cors());
app.use(express.json());

// 5. Buat API Endpoint untuk Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // ----- PENYESUAIAN QUERY SQL -----
    // Menggunakan nama tabel `pelanggan` dan kolom `telp_satu`
    const sql = "SELECT * FROM pelanggan WHERE telp_satu = ?";

    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error('Error saat query login:', err);
            return res.status(500).json({ success: false, message: 'Terjadi error di server' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'No HP tidak terdaftar' });
        }

        const user = results[0];

        // 🚨 PERINGATAN: Password di database Anda belum di-hash. 
        // Ini tidak aman untuk produksi nyata.
        if (password === user.password) {
            // Jika password cocok
            res.json({
                success: true, message: 'Login berhasil!', user: {
                    nama: user.nama_pelanggan,
                    kd_pelanggan: user.kd_pelanggan
                }
            });
        } else {
            // Jika password salah
            res.status(401).json({ success: false, message: 'Kata sandi salah' });
        }
    });
});

// 6. Jalankan server
app.listen(PORT, () => {
    console.log(`Server berhasil berjalan di http://localhost:${PORT}`);
});