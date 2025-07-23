// 1. Import library yang dibutuhkan
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');
const bcrypt = require('bcrypt');
const multer = require('multer');

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

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// 4. Gunakan middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// 5. API Endpoint untuk Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.promise().query('SELECT * FROM pelanggan WHERE telp_satu = ?', [username]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
        }

        const user = rows[0];

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Password salah' });
        }

        return res.json({
            message: 'Login berhasil',
            user: {
                nama: user.nama_pelanggan,
                kd_pelanggan: user.kd_pelanggan,
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
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
        const dataSql = `SELECT barcode, nama_produk, harga_jual_umum, kategori, gbr FROM pecah_stok WHERE ${whereSql} ORDER BY nama_produk ASC LIMIT ? OFFSET ?`;

        db.query(dataSql, [...params, limit, offset], (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Server error saat get data' });
            const products = results.map(p => {
                const productId = p.barcode ? p.barcode.trim() : null;
                let imageUrl = '../assets/imgs/placeholder.png';

                // If product has image data, use the API endpoint to serve it
                if (p.gbr && p.gbr.length > 0) {
                    imageUrl = `http://localhost:3001/api/products/${productId}/image`;
                }

                return {
                    id: productId,
                    name: p.nama_produk || 'Produk Tanpa Nama',
                    price: p.harga_jual_umum || 0,
                    category: p.kategori || 'lain-lain',
                    image: imageUrl
                };
            }).filter(p => p.id);
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

// API ENDPOINT UNTUK MENGAMBIL PESANAN BERDASARKAN USER
app.get('/api/orders', (req, res) => {
    const { user } = req.query;
    const authHeader = req.headers.authorization;
    const userIdHeader = req.headers['x-user-id'];

    // Untuk debugging, tambahkan endpoint tanpa autentikasi dulu
    if (req.query.debug === 'true') {
        const debugSql = "SELECT order_id, nama_pelanggan, telepon_pelanggan, tanggal_pesanan FROM orders ORDER BY tanggal_pesanan DESC LIMIT 10";
        db.query(debugSql, (err, results) => {
            if (err) {
                return res.status(500).json({ success: false, message: "Debug query error" });
            }
            return res.json({
                debug: true,
                message: "Debug mode - showing all recent orders",
                orders: results,
                searchingFor: user
            });
        });
        return;
    }

    // Validasi autentikasi - pastikan ada parameter user dan headers
    if (!user || !authHeader || !userIdHeader) {
        return res.status(401).json({
            success: false,
            message: "Akses tidak sah. Silakan login kembali."
        });
    }

    // Validasi konsistensi user ID di parameter dan headers
    if (user !== userIdHeader || !authHeader.includes(user)) {
        return res.status(403).json({
            success: false,
            message: "Akses ditolak. Data user tidak konsisten."
        });
    }

    // Filter pesanan berdasarkan nomor telepon ATAU nama pelanggan dengan JOIN untuk mengambil item
    const sql = `
        SELECT 
            o.*,
            GROUP_CONCAT(
                JSON_OBJECT(
                    'id', oi.kd_produk,
                    'name', oi.nama_produk,
                    'quantity', oi.kuantitas,
                    'price', oi.harga_satuan
                )
            ) as items_json
        FROM orders o
        LEFT JOIN order_items oi ON o.order_id = oi.order_id
        WHERE o.telepon_pelanggan = ? OR o.nama_pelanggan = ?
        GROUP BY o.order_id
        ORDER BY o.tanggal_pesanan DESC
    `;

    db.query(sql, [user, user], (err, results) => {
        if (err) {
            console.error("Error mengambil data pesanan:", err);
            return res.status(500).json({ success: false, message: "Server error" });
        }

        // Parse items_json untuk setiap pesanan
        const processedResults = results.map(order => {
            let items = {};
            if (order.items_json) {
                try {
                    // items_json berisi string JSON yang di-concat dengan koma
                    const itemsArray = `[${order.items_json}]`;
                    const parsedItems = JSON.parse(itemsArray);
                    parsedItems.forEach((item, index) => {
                        items[item.id || index] = item;
                    });
                } catch (e) {
                    console.error("Error parsing items:", e);
                    items = {};
                }
            }

            return {
                ...order,
                items: items,
                items_json: undefined // Hapus field ini dari response
            };
        });

        console.log(`User ${user} searching for orders...`);
        console.log(`Found ${processedResults.length} pesanan`);
        console.log('Sample order with items:', processedResults[0] || 'No orders found');
        res.json(processedResults);
    });
});

app.post('/api/change-password', async (req, res) => {
    const { kd_pelanggan, oldPassword, newPassword } = req.body;

    try {
        const [rows] = await db.promise().query('SELECT password FROM pelanggan WHERE kd_pelanggan = ?', [kd_pelanggan]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }

        const isMatch = await bcrypt.compare(oldPassword, rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Password lama salah' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await db.promise().query('UPDATE pelanggan SET password = ? WHERE kd_pelanggan = ?', [hashedNewPassword, kd_pelanggan]);

        res.json({ success: true, message: 'Password berhasil diubah' });

    } catch (error) {
        console.error('Gagal mengubah password:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
    }
});

app.get('/api/admin/orders', (req, res) => {
    // Query ini mengambil semua pesanan, diurutkan dari yang paling baru
    const sql = "SELECT * FROM orders ORDER BY tanggal_pesanan DESC";

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error mengambil semua data pesanan:", err);
            return res.status(500).json({ success: false, message: "Server error" });
        }
        res.json(results); // Kirim semua data pesanan sebagai respons
    });
});

app.get('/api/admin/orders/:orderId', (req, res) => {
    const { orderId } = req.params;

    // Ambil data utama dari tabel 'orders'
    const orderSql = "SELECT * FROM orders WHERE order_id = ?";
    db.query(orderSql, [orderId], (err, orderResult) => {
        if (err) return res.status(500).json({ message: "Server error" });
        if (orderResult.length === 0) return res.status(404).json({ message: "Pesanan tidak ditemukan" });

        // Ambil data item dari tabel 'order_items'
        const itemsSql = "SELECT * FROM order_items WHERE order_id = ?";
        db.query(itemsSql, [orderId], (err, itemsResult) => {
            if (err) return res.status(500).json({ message: "Server error" });

            // Gabungkan hasilnya
            const orderDetails = {
                ...orderResult[0],
                items: itemsResult
            };
            res.json(orderDetails);
        });
    });
});

// API BARU: Memperbarui status pesanan
app.patch('/api/admin/orders/:orderId/status', (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ message: "Status baru harus disediakan" });
    }

    const sql = "UPDATE orders SET status_pesanan = ? WHERE order_id = ?";
    db.query(sql, [status, orderId], (err, result) => {
        if (err) {
            console.error("Error memperbarui status:", err);
            return res.status(500).json({ message: "Gagal memperbarui status pesanan" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Pesanan tidak ditemukan" });
        }
        res.json({ success: true, message: `Status pesanan #${orderId} berhasil diubah menjadi ${status}` });
    });
});

app.get('/api/admin/orders/:orderId', (req, res) => {
    const { orderId } = req.params;
    let orderDetails;

    // 1. Ambil data utama dari tabel 'orders'
    const orderSql = "SELECT * FROM orders WHERE order_id = ?";
    db.query(orderSql, [orderId], (err, orderResult) => {
        if (err) return res.status(500).json({ message: "Server error saat mengambil pesanan" });
        if (orderResult.length === 0) return res.status(404).json({ message: "Pesanan tidak ditemukan" });

        orderDetails = orderResult[0];

        // 2. Ambil data item dari tabel 'order_items'
        const itemsSql = "SELECT * FROM order_items WHERE order_id = ?";
        db.query(itemsSql, [orderId], (err, itemsResult) => {
            if (err) return res.status(500).json({ message: "Server error saat mengambil item" });

            // 3. Gabungkan hasilnya dan kirim sebagai respons
            orderDetails.items = itemsResult;
            res.json(orderDetails);
        });
    });
});

// API BARU: Memperbarui status pesanan
app.patch('/api/admin/orders/:orderId/status', (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ message: "Status baru harus disediakan" });
    }

    const sql = "UPDATE orders SET status_pesanan = ? WHERE order_id = ?";
    db.query(sql, [status, orderId], (err, result) => {
        if (err) {
            console.error("Error memperbarui status:", err);
            return res.status(500).json({ message: "Gagal memperbarui status pesanan" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Pesanan tidak ditemukan" });
        }
        res.json({ success: true, message: `Status pesanan berhasil diubah menjadi ${status}` });
    });
});

// ===== PRODUCT IMAGE MANAGEMENT API ENDPOINTS =====

// Get all products with images for admin panel
app.get('/api/admin/products', (req, res) => {
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    // First get total count
    const countSql = "SELECT COUNT(*) as total FROM pecah_stok";

    db.query(countSql, (err, countResult) => {
        if (err) {
            console.error("Error counting products:", err);
            return res.status(500).json({ message: "Server error saat menghitung produk" });
        }

        const totalProducts = countResult[0].total;
        const totalPages = Math.ceil(totalProducts / limit);

        // Then get paginated products
        const sql = "SELECT barcode as id, nama_produk, harga_jual_umum as harga, kategori, gbr FROM pecah_stok ORDER BY nama_produk ASC LIMIT ? OFFSET ?";

        db.query(sql, [parseInt(limit), parseInt(offset)], (err, results) => {
            if (err) {
                console.error("Error fetching products:", err);
                return res.status(500).json({ message: "Server error saat mengambil produk" });
            }

            const products = results.map(product => ({
                id: product.id,
                nama_produk: product.nama_produk,
                harga: product.harga,
                kategori: product.kategori,
                gbr: product.gbr
            }));

            res.json({
                products,
                totalPages,
                currentPage: parseInt(page),
                totalProducts,
                hasMore: page < totalPages
            });
        });
    });
});

// Get all products for dropdown (no pagination)
app.get('/api/admin/products/all', (req, res) => {
    const sql = "SELECT barcode as id, nama_produk, harga_jual_umum as harga FROM pecah_stok ORDER BY nama_produk ASC";

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching all products:", err);
            return res.status(500).json({ message: "Server error saat mengambil semua produk" });
        }

        const products = results.map(product => ({
            id: product.id,
            nama_produk: product.nama_produk,
            harga: product.harga
        }));

        res.json(products);
    });
});

// Upload image for a specific product
app.post('/api/products/upload-image', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "Tidak ada file yang diupload" });
    }

    const { productId } = req.body;
    if (!productId) {
        return res.status(400).json({ message: "Product ID diperlukan" });
    }

    const imageBuffer = req.file.buffer;
    const sql = "UPDATE pecah_stok SET gbr = ? WHERE barcode = ?";

    db.query(sql, [imageBuffer, productId], (err, result) => {
        if (err) {
            console.error("Error uploading image:", err);
            return res.status(500).json({ message: "Gagal mengupload gambar" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Produk tidak ditemukan" });
        }

        res.json({
            success: true,
            message: "Gambar berhasil diupload",
            productId: productId
        });
    });
});

// Delete image for a specific product
app.delete('/api/products/:productId/image', (req, res) => {
    const { productId } = req.params;

    const sql = "UPDATE pecah_stok SET gbr = NULL WHERE barcode = ?";

    db.query(sql, [productId], (err, result) => {
        if (err) {
            console.error("Error deleting image:", err);
            return res.status(500).json({ message: "Gagal menghapus gambar" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Produk tidak ditemukan" });
        }

        res.json({
            success: true,
            message: "Gambar berhasil dihapus",
            productId: productId
        });
    });
});

// Get image for a specific product
app.get('/api/products/:productId/image', (req, res) => {
    const { productId } = req.params;

    const sql = "SELECT gbr FROM pecah_stok WHERE barcode = ?";

    db.query(sql, [productId], (err, results) => {
        if (err) {
            console.error("Error fetching image:", err);
            return res.status(500).json({ message: "Server error saat mengambil gambar" });
        }

        if (results.length === 0 || !results[0].gbr) {
            return res.status(404).json({ message: "Gambar tidak ditemukan" });
        }

        const imageBuffer = results[0].gbr;
        res.set('Content-Type', 'image/jpeg');
        res.send(imageBuffer);
    });
});

// 8. Jalankan server
app.listen(PORT, () => {
    console.log(`Server berhasil berjalan di http://localhost:${PORT}`);
});