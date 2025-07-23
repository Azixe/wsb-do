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
            // Data items sudah diproses di backend
            itemsInCart = order.items || {};
        } catch (e) {
            console.error("Gagal mem-parsing item pesanan:", e);
            itemsInCart = {};
        }

        let itemsHtml = '<div class="items-container">';
        let totalItems = 0;
        let subtotal = 0;

        if (Object.keys(itemsInCart).length > 0) {
            for (const productId in itemsInCart) {
                const item = itemsInCart[productId];
                const itemTotal = (item.price || 0) * (item.quantity || 0);
                subtotal += itemTotal;
                totalItems += item.quantity || 0;

                itemsHtml += `
                    <div class="item-detail">
                        <div class="item-info">
                            <span class="item-name">${item.name || 'Nama Produk tidak ada'}</span>
                            <span class="item-qty">Jumlah: ${item.quantity || 0}</span>
                            <span class="item-price">Harga: Rp${(item.price || 0).toLocaleString('id-ID')}</span>
                        </div>
                        <div class="item-total">
                            Rp${itemTotal.toLocaleString('id-ID')}
                        </div>
                    </div>`;
            }
        } else {
            itemsHtml += '<p class="no-items">Tidak ada detail produk tersedia</p>';
        }
        itemsHtml += '</div>';

        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay show';
        modalOverlay.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Detail Pesanan #${order.order_id}</h3>
                    <button class="close-btn" data-action="close">&times;</button>
                </div>
                <div class="modal-body">
                    <h4>Produk yang Dipesan (${totalItems} item)</h4>
                    ${itemsHtml}
                    <div class="order-summary">
                        <div class="summary-row">
                            <span>Subtotal:</span>
                            <span>Rp${subtotal.toLocaleString('id-ID')}</span>
                        </div>
                        <div class="summary-row">
                            <span>Biaya Pengiriman:</span>
                            <span>Rp${(10000).toLocaleString('id-ID')}</span>
                        </div>
                        <div class="summary-row total-row">
                            <span><strong>Total:</strong></span>
                            <span><strong>Rp${(order.total_harga || 0).toLocaleString('id-ID')}</strong></span>
                        </div>
                    </div>
                    <h4>Detail Pengiriman</h4>
                    <div class="shipping-details">
                        <p><strong>Nama:</strong> ${order.nama_pelanggan || '-'}</p>
                        <p><strong>Telepon:</strong> ${order.telepon_pelanggan || '-'}</p>
                        <p><strong>Alamat:</strong> ${order.alamat_pengiriman || '-'}</p>
                    </div>
                    <h4>Informasi Pesanan</h4>
                    <div class="order-info">
                        <p><strong>Metode Pembayaran:</strong> ${order.metode_pembayaran || '-'}</p>
                        <p><strong>Status:</strong> <span class="status ${(order.status_pesanan || 'diproses').toLowerCase()}">${order.status_pesanan || 'Diproses'}</span></p>
                        <p><strong>Tanggal Pesanan:</strong> ${new Date(order.tanggal_pesanan).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}</p>
                    </div>
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
        // Tidak perlu mengubah innerHTML karena sudah ada loading message di HTML

        // Ambil data user yang sedang login
        const userName = localStorage.getItem('username'); // Nama user
        const userPhone = localStorage.getItem('userPhone'); // Nomor HP user

        console.log('User data:', { userName, userPhone });

        if (!userName) {
            orderListContainer.innerHTML = '<div class="error-message"><p>Sesi berakhir. Silakan login kembali.</p></div>';
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

                // Tampilkan preview item yang dibeli
                let itemsPreview = '';
                if (order.items && Object.keys(order.items).length > 0) {
                    const itemsArray = Object.values(order.items);
                    const firstThreeItems = itemsArray.slice(0, 3);
                    itemsPreview = firstThreeItems.map(item =>
                        `${item.name || 'Produk'} (x${item.quantity || 0})`
                    ).join(', ');

                    if (itemsArray.length > 3) {
                        itemsPreview += ` dan ${itemsArray.length - 3} produk lainnya`;
                    }
                } else {
                    itemsPreview = 'Tidak ada detail produk';
                }

                orderCard.innerHTML = `
                    <div class="order-header">
                        <span class="order-id">Pesanan #${order.order_id}</span>
                        <span class="order-date">${formattedDate}</span>
                    </div>
                    <div class="order-body">
                        <div class="order-items-preview">
                            <span class="items-label">Produk:</span>
                            <span class="items-text">${itemsPreview}</span>
                        </div>
                        <div class="order-total">Total Pembayaran: <span>Rp${order.total_harga.toLocaleString('id-ID')}</span></div>
                        <div class="order-status">
                            <span class="status-label">Status:</span>
                            <span class="status ${(order.status_pesanan || 'diproses').toLowerCase()}">${order.status_pesanan || 'Diproses'}</span>
                        </div>
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