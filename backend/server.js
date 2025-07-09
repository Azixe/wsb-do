// 1. Import library yang dibutuhkan
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');

// 2. Inisialisasi aplikasi express
const app = express();
const PORT = 3001;

// 3. Buat koneksi ke database MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'data_ku'
});

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
app.use(express.static(path.join(__dirname, '..')));

// 5. API Endpoint untuk Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM pelanggan WHERE telp_satu = ?";
    db.query(sql, [username], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Server error' });
        if (results.length === 0) return res.status(404).json({ success: false, message: 'No HP tidak terdaftar' });
        const user = results[0];
        if (password === user.password) {
            res.json({ 
            success: true, 
            message: 'Login berhasil!', 
            user: { 
                nama: user.nama_pelanggan, 
                kd_pelanggan: user.kd_pelanggan 
                } 
            });

        } else {
            res.status(401).json({ success: false, message: 'Kata sandi salah' });
        }
    });
});

// 6. API Endpoint untuk Produk (dengan Pencarian & Pagination)
app.get('/api/products', (req, res) => {
    const { search = '', category = 'semua', page = 1 } = req.query;
    const limit = 20;
    const offset = (page - 1) * limit;

    let whereClauses = ["nama_produk LIKE ?"];
    let params = [`%${search}%`];

    if (category !== 'semua') {
        whereClauses.push("kategori = ?");
        params.push(category);
    }
    const whereSql = whereClauses.join(" AND ");

    const countSql = `SELECT COUNT(*) as total FROM pecah_stok WHERE ${whereSql}`;
    db.query(countSql, params, (err, countResult) => {
        if (err) return res.status(500).json({ success: false, message: 'Server error saat count' });

        const totalProducts = countResult[0].total;
        const totalPages = Math.ceil(totalProducts / limit);
        const dataSql = `SELECT barcode, nama_produk, harga_jual_umum, kategori FROM pecah_stok WHERE ${whereSql} ORDER BY nama_produk ASC LIMIT ? OFFSET ?`;

        db.query(dataSql, [...params, limit, offset], (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Server error saat get data' });
            const products = results.map(p => ({
                id: p.barcode ? p.barcode.trim() : null,
                name: p.nama_produk || 'Produk Tanpa Nama',
                price: p.harga_jual_umum || 0,
                category: p.kategori || 'lain-lain',
                image: `../assets/imgs/placeholder.png`
            })).filter(p => p.id);
            res.json({ products, totalPages, currentPage: parseInt(page) });
        });
    });
});

// 7. API Endpoint untuk Kategori
app.get('/api/categories', (req, res) => {
    const sql = "SELECT DISTINCT kategori FROM pecah_stok WHERE kategori IS NOT NULL AND kategori != '' ORDER BY kategori ASC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Server error' });
        res.json(results.map(row => row.kategori));
    });
});

// ... (kode API login, products, dan categories yang sudah ada) ...

// 8. API ENDPOINT BARU UNTUK MENYIMPAN PESANAN
app.post('/api/orders', (req, res) => {
    const { orderDetails, items, paymentMethod } = req.body;

    // Mulai transaksi database untuk memastikan semua data berhasil dimasukkan
    db.beginTransaction(err => {
        if (err) {
            console.error("Error memulai transaksi:", err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }

        // 1. Masukkan data ke tabel 'orders'
        const orderSql = "INSERT INTO orders (order_id, nama_pelanggan, alamat_pengiriman, telepon_pelanggan, total_harga, metode_pembayaran, kd_pelanggan) VALUES (?, ?, ?, ?, ?, ?, ?)";
        const orderValues = [
            orderDetails.orderId,
            orderDetails.shippingAddress.name,
            orderDetails.shippingAddress.address,
            orderDetails.shippingAddress.phone,
            orderDetails.totalAmount,
            paymentMethod,
            'CUST-001' // Placeholder, nanti diganti dengan kd_pelanggan user yang login
        ];

        db.query(orderSql, orderValues, (err, result) => {
            if (err) {
                console.error("Error memasukkan ke tabel orders:", err);
                return db.rollback(() => {
                    res.status(500).json({ success: false, message: 'Gagal menyimpan pesanan' });
                });
            }

            // 2. Masukkan setiap item ke tabel 'order_items'
            const itemsSql = "INSERT INTO order_items (order_id, kd_produk, nama_produk, kuantitas, harga_satuan) VALUES ?";
            const itemValues = Object.values(items).map(item => [
                orderDetails.orderId,
                item.id,
                item.name,
                item.quantity,
                item.price
            ]);

            db.query(itemsSql, [itemValues], (err, result) => {
                if (err) {
                    console.error("Error memasukkan ke tabel order_items:", err);
                    return db.rollback(() => {
                        res.status(500).json({ success: false, message: 'Gagal menyimpan item pesanan' });
                    });
                }

                // 3. Jika semua berhasil, konfirmasi transaksi
                db.commit(err => {
                    if (err) {
                        return db.rollback(() => {
                            res.status(500).json({ success: false, message: 'Gagal konfirmasi transaksi' });
                        });
                    }
                    console.log('Pesanan berhasil disimpan dengan ID:', orderDetails.orderId);
                    res.json({ success: true, message: 'Pesanan berhasil dibuat!', orderId: orderDetails.orderId });
                });
            });
        });
    });
});

// API ENDPOINT UNTUK MENGAMBIL SEMUA PESANAN
app.get('/api/orders', (req, res) => {
    // Di aplikasi nyata, kita akan filter berdasarkan kd_pelanggan yang login.
    // Untuk sekarang, kita ambil semua pesanan.
    const sql = "SELECT * FROM orders ORDER BY tanggal_pesanan DESC";

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error mengambil data pesanan:", err);
            return res.status(500).json({ success: false, message: "Server error" });
        }
        res.json(results);
    });
});

app.post('/api/change-password', (req, res) => {
    const { kd_pelanggan, oldPassword, newPassword } = req.body;

    const getUserSql = "SELECT password FROM pelanggan WHERE kd_pelanggan = ?";
    db.query(getUserSql, [kd_pelanggan], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Server error' });
        if (results.length === 0) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

        const currentPassword = results[0].password;

        if (oldPassword !== currentPassword) {
            return res.status(401).json({ success: false, message: 'Password lama salah' });
        }

        const updateSql = "UPDATE pelanggan SET password = ? WHERE kd_pelanggan = ?";
        db.query(updateSql, [newPassword, kd_pelanggan], (err, result) => {
            if (err) return res.status(500).json({ success: false, message: 'Gagal mengubah password' });
            res.json({ success: true, message: 'Password berhasil diperbarui' });
        });
    });
});

// 8. Jalankan server
app.listen(PORT, () => {
    console.log(`Server berhasil berjalan di http://localhost:${PORT}`);
});