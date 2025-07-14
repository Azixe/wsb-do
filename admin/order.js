document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('ordersTableBody');
    let currentOrders = [];

    async function fetchAndRenderOrders() {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Memuat data pesanan...</td></tr>`;
        try {
            const response = await fetch('http://localhost:3001/api/admin/orders');
            if (!response.ok) throw new Error('Gagal mengambil data pesanan.');

            currentOrders = await response.json();
            renderOrdersTable(currentOrders);
        } catch (error) {
            console.error(error);
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: red;">${error.message}</td></tr>`;
        }
    }

    function renderOrdersTable(orders) {
        tableBody.innerHTML = '';
        if (orders.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Belum ada pesanan yang masuk.</td></tr>`;
            return;
        }

        orders.forEach(order => {
            const row = document.createElement('tr');
            row.dataset.orderId = order.order_id;
            const orderDate = new Date(order.tanggal_pesanan);
            const formattedDate = orderDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

            row.innerHTML = `
                <td>${order.order_id}</td>
                <td>${order.nama_pelanggan}</td>
                <td>${formattedDate}</td>
                <td>Rp${order.total_harga.toLocaleString('id-ID')}</td>
                <td><span class="status ${order.status_pesanan.toLowerCase()}">${order.status_pesanan}</span></td>
                <td><button class="details-btn" data-action="showDetail">Lihat Detail</button></td>
            `;
            tableBody.appendChild(row);
        });
    }

    async function showDetailModal(orderId) {
        try {
            const response = await fetch(`http://localhost:3001/api/admin/orders/${orderId}`);
            if (!response.ok) throw new Error('Gagal mengambil detail pesanan');
            const order = await response.json();

            let itemsHtml = '<ul>';
            order.items.forEach(item => {
                itemsHtml += `<li>${item.nama_produk} (x${item.kuantitas}) <span>Rp${(item.harga_satuan * item.kuantitas).toLocaleString('id-ID')}</span></li>`;
            });
            itemsHtml += '</ul>';

            const modalOverlay = document.createElement('div');
            modalOverlay.className = 'modal-overlay';
            document.body.appendChild(modalOverlay);

            modalOverlay.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Detail Pesanan #${order.order_id}</h3>
                        <button class="close-btn" data-action="close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <h4>Produk yang Dipesan:</h4>
                        ${itemsHtml}
                        <hr>
                        <h4>Detail Pengiriman:</h4>
                        <p><strong>Nama:</strong> ${order.nama_pelanggan}<br>
                           <strong>Telepon:</strong> ${order.telepon_pelanggan}<br>
                           <strong>Alamat:</strong> ${order.alamat_pengiriman}</p>
                        <div class="status-form">
                            <label for="statusSelect">Ubah Status:</label>
                            <select id="statusSelect">
                                <option value="Diproses" ${order.status_pesanan === 'Diproses' ? 'selected' : ''}>Diproses</option>
                                <option value="Dikirim" ${order.status_pesanan === 'Dikirim' ? 'selected' : ''}>Dikirim</option>
                                <option value="Selesai" ${order.status_pesanan === 'Selesai' ? 'selected' : ''}>Selesai</option>
                            </select>
                            <button data-action="updateStatus">Simpan Status</button>
                        </div>
                    </div>
                </div>`;

            // Tampilkan modal dengan transisi
            setTimeout(() => modalOverlay.classList.add('show'), 10);

            // Tambahkan event listener di dalam modal
            modalOverlay.addEventListener('click', e => {
                const action = e.target.dataset.action;
                if (action === 'close' || e.target === modalOverlay) {
                    modalOverlay.remove();
                } else if (action === 'updateStatus') {
                    const newStatus = modalOverlay.querySelector('#statusSelect').value;
                    updateOrderStatus(orderId, newStatus, modalOverlay);
                }
            });

        } catch (error) {
            console.error("Error:", error);
            alert(error.message);
        }
    }

    async function updateOrderStatus(orderId, newStatus, modalElement) {
        try {
            const response = await fetch(`http://localhost:3001/api/admin/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);

            alert(result.message);
            modalElement.remove();
            fetchAndRenderOrders(); // Refresh tabel untuk melihat status baru
        } catch (error) {
            console.error("Gagal update status:", error);
            alert(`Error: ${error.message}`);
        }
    }

    tableBody.addEventListener('click', (e) => {
        const targetButton = e.target.closest('button[data-action="showDetail"]');
        if (targetButton) {
            const orderId = e.target.closest('tr').dataset.orderId;
            showDetailModal(orderId);
        }
    });

    fetchAndRenderOrders();
});