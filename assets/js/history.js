document.addEventListener('DOMContentLoaded', () => {
    const orderListContainer = document.getElementById('orderList');
    
    // Validasi login status
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUser = localStorage.getItem('username');
    
    if (!isLoggedIn || isLoggedIn !== 'true' || !currentUser) {
        alert('Anda harus login terlebih dahulu.');
        window.location.href = '../index.html';
        return;
    }

    function showDetailModal(order) {
        // Hapus modal lama jika ada, untuk mencegah tumpukan
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) {
            existingModal.remove();
        }

        // Pastikan order.items adalah objek, bukan string
        let itemsInCart = {};
        try {
            // Data items dari database bisa jadi adalah string, kita perlu parse
            itemsInCart = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        } catch (e) {
            console.error("Gagal mem-parsing item pesanan:", e);
            itemsInCart = {};
        }

        let itemsHtml = '<ul>';
        for (const productId in itemsInCart) {
            const item = itemsInCart[productId];
            itemsHtml += `<li>${item.name || 'Nama Produk tidak ada'} (x${item.quantity || 0})</li>`;
        }
        itemsHtml += '</ul>';

        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay show';
        modalOverlay.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Detail Pesanan #${order.order_id}</h3>
                    <button class="close-btn" data-action="close">&times;</button>
                </div>
                <div class="modal-body">
                    <h4>Produk yang Dipesan</h4>
                    ${itemsHtml}
                    <h4>Detail Pengiriman</h4>
                    <p>
                        <strong>Nama:</strong> ${order.nama_pelanggan || '-'}<br>
                        <strong>Telepon:</strong> ${order.telepon_pelanggan || '-'}<br>
                        <strong>Alamat:</strong> ${order.alamat_pengiriman || '-'}
                    </p>
                    <h4>Rincian Pembayaran</h4>
                    <p>Total: <strong>Rp${(order.total_harga || 0).toLocaleString('id-ID')}</strong></p>
                </div>
            </div>`;
        document.body.appendChild(modalOverlay);

        // Listener untuk menutup modal
        modalOverlay.addEventListener('click', e => {
            if (e.target.closest('[data-action="close"]') || e.target === modalOverlay) {
                modalOverlay.remove();
            }
        });
    }

    async function fetchAndRenderOrders() {
        orderListContainer.innerHTML = '<p>Memuat riwayat pesanan...</p>';
        
        // Ambil data user yang sedang login
        const userName = localStorage.getItem('username'); // Nama user
        const userPhone = localStorage.getItem('userPhone'); // Nomor HP user
        
        console.log('User data:', { userName, userPhone });
        
        if (!userName) {
            orderListContainer.innerHTML = '<p>Sesi berakhir. Silakan login kembali.</p>';
            setTimeout(() => window.location.href = '../index.html', 2000);
            return;
        }
        
        // Gunakan nomor HP untuk filter (karena itu yang disimpan di telepon_pelanggan)
        const searchUser = userPhone || userName;
        
        try {
            // Debug mode - cek data di database dulu
            console.log('Checking database first...');
            const debugResponse = await fetch(`http://localhost:3001/api/orders?debug=true&user=${encodeURIComponent(searchUser)}`);
            const debugData = await debugResponse.json();
            console.log('Debug data:', debugData);
            
            // Kirim parameter user untuk filter pesanan
            console.log('Fetching orders for user:', searchUser);
            
            // Tambahkan timeout untuk fetch
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 detik timeout
            
            const response = await fetch(`http://localhost:3001/api/orders?user=${encodeURIComponent(searchUser)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${searchUser}`,
                    'X-User-ID': searchUser
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
            
            if (!response.ok) {
                console.error('Response not OK:', response.status, response.statusText);
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('username');
                    alert('Sesi telah berakhir. Silakan login kembali.');
                    window.location.href = '../index.html';
                    return;
                }
                throw new Error(`Gagal mengambil riwayat pesanan: ${response.status} ${response.statusText}`);
            }

            const orders = await response.json();
            console.log('Orders received:', orders);
            console.log('Number of orders:', orders.length);

            orderListContainer.innerHTML = '';
            if (orders.length === 0) {
                orderListContainer.innerHTML = `<div class="no-history-message"><p>Anda belum memiliki riwayat pesanan.</p><a href="dashboard.html" class="back-to-shop-btn">Mulai Belanja</a></div>`;
                return;
            }

            orders.forEach(order => {
                const orderCard = document.createElement('div');
                orderCard.className = 'order-card';

                const orderDate = new Date(order.tanggal_pesanan);
                const formattedDate = orderDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

                orderCard.innerHTML = `
                    <div class="order-header">
                        <span class="order-id">Pesanan #${order.order_id}</span>
                        <span class="order-date">${formattedDate}</span>
                    </div>
                    <div class="order-body">
                        <div class="order-total">Total Pembayaran: <span>Rp${order.total_harga.toLocaleString('id-ID')}</span></div>
                    </div>
                    <div class="order-footer">
                        <button class="details-btn">Lihat Detail</button>
                    </div>`;

                // Pasang event listener langsung ke tombol di setiap kartu
                orderCard.querySelector('.details-btn').addEventListener('click', () => {
                    showDetailModal(order);
                });

                orderListContainer.appendChild(orderCard);
            });

        } catch (error) {
            console.error("Error fetching orders:", error);
            console.error("Error details:", error.message);
            
            // Fallback: coba tanpa autentikasi untuk debugging
            try {
                console.log("Trying fallback without authentication...");
                const fallbackResponse = await fetch('http://localhost:3001/api/products?page=1');
                if (fallbackResponse.ok) {
                    console.log("Backend is accessible, issue might be with orders endpoint");
                    orderListContainer.innerHTML = `<p>Backend dapat diakses, tapi ada masalah dengan endpoint orders. Error: ${error.message}</p>`;
                } else {
                    orderListContainer.innerHTML = `<p>Backend tidak dapat diakses. Pastikan server berjalan di localhost:3001</p>`;
                }
            } catch (fallbackError) {
                console.error("Fallback also failed:", fallbackError);
                orderListContainer.innerHTML = `<p>Tidak dapat terhubung ke server backend. Pastikan server berjalan di localhost:3001</p>`;
            }
        }
    }

    fetchAndRenderOrders();
});