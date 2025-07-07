document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const orderListContainer = document.getElementById('orderList');

    // Data
    const orders = JSON.parse(localStorage.getItem('wsbOrders')) || [];
    const allProducts = [
        { id: 'prod001', name: 'Beras Raja Platinum 5kg', price: 74500 },
        { id: 'prod002', name: 'Le Minerale Galon 15L', price: 16000 },
        { id: 'prod003', name: 'Minyak Tropical 2L', price: 33300 },
        { id: 'prod004', name: 'Indomie Goreng 84g', price: 3300 },
        { id: 'prod005', name: 'You C1000 Orange 140ml', price: 6399 },
        { id: 'prod006', name: 'Sabun Lifebuoy 85g', price: 2900 }
    ];

    // =========================================================================
    // FUNGSI INI DIUBAH MENJADI SANGAT SEDERHANA UNTUK TES
    // =========================================================================
    function showDetailModal(orderId) {
        const order = orders.find(o => o.orderId === orderId);
        if (!order) {
            console.error('Order not found!');
            return;
        }

        // Membuat daftar item produk untuk ditampilkan di modal
        let itemsHtml = '<ul>';
        for (const productId in order.items) {
            const product = allProducts.find(p => p.id === productId);
            const quantity = order.items[productId];
            if (product) {
                itemsHtml += `<li>${product.name} (x${quantity})</li>`;
            }
        }
        itemsHtml += '</ul>';

        // Membuat elemen modal dengan data yang benar
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Detail Pesanan #${order.orderId}</h3>
                <button class="close-btn" data-action="close">&times;</button>
            </div>
            <div class="modal-body">
                <h4>Produk yang Dipesan</h4>
                ${itemsHtml}
                
                <h4>Detail Pengiriman</h4>
                <p>
                    <strong>Nama:</strong> ${order.shippingAddress.name}<br>
                    <strong>Telepon:</strong> ${order.shippingAddress.phone}<br>
                    <strong>Alamat:</strong> ${order.shippingAddress.address}
                </p>

                <h4>Rincian Pembayaran</h4>
                <p class="payment-details">
                    <span>Subtotal:</span> <span>Rp${(order.totalAmount - 10000).toLocaleString('id-ID')}</span><br>
                    <span>Pengiriman:</span> <span>Rp10.000</span><br>
                    <strong><span>Total:</span> <span>Rp${order.totalAmount.toLocaleString('id-ID')}</span></strong>
                </p>
            </div>
        </div>
    `;

        document.body.appendChild(modalOverlay);

        // Menambahkan event listener untuk menutup modal
        modalOverlay.addEventListener('click', (e) => {
            const closeButton = e.target.closest('[data-action="close"]');
            if (closeButton || e.target === modalOverlay) {
                modalOverlay.remove();
            }
        });
    }

    function renderOrders() {
        orderListContainer.innerHTML = '';
        if (orders.length === 0) {
            orderListContainer.innerHTML = `<div class="no-history-message"><p>Anda belum memiliki riwayat pesanan.</p><a href="dashboard.html" class="back-to-shop-btn">Mulai Belanja</a></div>`;
            return;
        }
        const sortedOrders = [...orders].reverse();
        sortedOrders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'order-card';
            orderCard.dataset.orderId = order.orderId;
            const orderDate = new Date(order.date);
            const formattedDate = orderDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

            orderCard.innerHTML = `
                <div class="order-header"><span class="order-id">Pesanan #${order.orderId}</span><span class="order-date">${formattedDate}</span></div>
                <div class="order-body"><div class="order-total">Total Pembayaran: <span>Rp${order.totalAmount.toLocaleString('id-ID')}</span></div></div>
                <div class="order-footer"><button class="details-btn" data-action="showDetail">Lihat Detail</button></div>
            `;
            orderListContainer.appendChild(orderCard);
        });
    }

    orderListContainer.addEventListener('click', (e) => {
        const targetButton = e.target.closest('[data-action="showDetail"]');
        if (targetButton) {
            const orderId = e.target.closest('.order-card').dataset.orderId;
            // Panggil fungsi modal yang sudah disederhanakan
            showDetailModal(orderId);
        }
    });

    // Inisialisasi render
    renderOrders();
});