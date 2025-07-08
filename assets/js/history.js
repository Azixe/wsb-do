document.addEventListener('DOMContentLoaded', () => {
    const orderListContainer = document.getElementById('orderList');

    // Fungsi untuk menampilkan modal (tidak berubah)
    function showDetailModal(orderDataString) {
        const order = JSON.parse(orderDataString);

        // Data 'items' dari database adalah JSON string, jadi perlu di-parse lagi
        const itemsInCart = JSON.parse(order.items);
        let itemsHtml = '<ul>';
        for (const productId in itemsInCart) {
            const item = itemsInCart[productId];
            itemsHtml += `<li>${item.name} (x${item.quantity})</li>`;
        }
        itemsHtml += '</ul>';

        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
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
                        <strong>Nama:</strong> ${order.nama_pelanggan}<br>
                        <strong>Telepon:</strong> ${order.telepon_pelanggan}<br>
                        <strong>Alamat:</strong> ${order.alamat_pengiriman}
                    </p>
                    <h4>Rincian Pembayaran</h4>
                    <p>Total: <strong>Rp${order.total_harga.toLocaleString('id-ID')}</strong></p>
                </div>
            </div>`;
        document.body.appendChild(modalOverlay);
        modalOverlay.addEventListener('click', e => {
            if (e.target.closest('[data-action="close"]') || e.target === modalOverlay) {
                modalOverlay.remove();
            }
        });
    }

    // Fungsi utama untuk mengambil dan menampilkan pesanan dari backend
    async function fetchAndRenderOrders() {
        orderListContainer.innerHTML = '<p>Memuat riwayat pesanan...</p>';
        try {
            const response = await fetch('http://localhost:3001/api/orders');
            if (!response.ok) throw new Error('Gagal mengambil riwayat pesanan');

            const orders = await response.json();

            orderListContainer.innerHTML = '';
            if (orders.length === 0) {
                orderListContainer.innerHTML = `<div class="no-history-message"><p>Anda belum memiliki riwayat pesanan.</p><a href="dashboard.html" class="back-to-shop-btn">Mulai Belanja</a></div>`;
                return;
            }

            orders.forEach(order => {
                const orderCard = document.createElement('div');
                orderCard.className = 'order-card';
                orderCard.dataset.orderData = JSON.stringify(order); // Simpan data lengkap untuk modal

                const orderDate = new Date(order.tanggal_pesanan);
                const formattedDate = orderDate.toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric'
                });

                orderCard.innerHTML = `
                    <div class="order-header">
                        <span class="order-id">Pesanan #${order.order_id}</span>
                        <span class="order-date">${formattedDate}</span>
                    </div>
                    <div class="order-body">
                        <div class="order-total">
                            Total Pembayaran: <span>Rp${order.total_harga.toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                    <div class="order-footer">
                        <button class="details-btn" data-action="showDetail">Lihat Detail</button>
                    </div>`;
                orderListContainer.appendChild(orderCard);
            });

        } catch (error) {
            console.error("Error:", error);
            orderListContainer.innerHTML = '<p>Gagal memuat riwayat pesanan. Coba lagi nanti.</p>';
        }
    }

    // Event listener untuk tombol "Lihat Detail"
    orderListContainer.addEventListener('click', (e) => {
        const targetButton = e.target.closest('[data-action="showDetail"]');
        if (targetButton) {
            const orderCard = e.target.closest('.order-card');
            showDetailModal(orderCard.dataset.orderData);
        }
    });

    // Panggil fungsi utama saat halaman dimuat
    fetchAndRenderOrders();
});