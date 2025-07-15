document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('ordersTableBody');
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    let currentOrders = [];
    let filteredOrders = [];

    // Initialize event listeners
    searchInput.addEventListener('input', debounce(filterOrders, 300));
    statusFilter.addEventListener('change', filterOrders);

    function debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(null, args), delay);
        };
    }

    function filterOrders() {
        const searchTerm = searchInput.value.toLowerCase();
        const statusValue = statusFilter.value;

        filteredOrders = currentOrders.filter(order => {
            const matchesSearch = !searchTerm || 
                order.nama_pelanggan.toLowerCase().includes(searchTerm) ||
                order.order_id.toString().includes(searchTerm);
            
            const matchesStatus = !statusValue || 
                order.status_pesanan === statusValue;

            return matchesSearch && matchesStatus;
        });

        renderOrdersTable(filteredOrders);
    }

    function updateStatistics(orders) {
        const stats = {
            pending: orders.filter(o => o.status_pesanan === 'Diproses').length,
            shipped: orders.filter(o => o.status_pesanan === 'Dikirim').length,
            completed: orders.filter(o => o.status_pesanan === 'Selesai').length,
            revenue: orders.reduce((sum, o) => sum + (o.total_harga || 0), 0)
        };

        document.getElementById('pendingCount').textContent = stats.pending;
        document.getElementById('shippedCount').textContent = stats.shipped;
        document.getElementById('completedCount').textContent = stats.completed;
        document.getElementById('totalRevenue').textContent = 
            `Rp${stats.revenue.toLocaleString('id-ID')}`;
    }

    async function fetchAndRenderOrders() {
        // Show loading state
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding: 40px;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 12px; color: var(--admin-text-secondary);">
                        <i class="fas fa-spinner fa-spin"></i>
                        Memuat data pesanan...
                    </div>
                </td>
            </tr>`;
        
        try {
            const response = await fetch('http://localhost:3001/api/admin/orders');
            if (!response.ok) throw new Error('Gagal mengambil data pesanan.');

            currentOrders = await response.json();
            filteredOrders = [...currentOrders];
            updateStatistics(currentOrders);
            renderOrdersTable(filteredOrders);
        } catch (error) {
            console.error(error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center; padding: 40px; color: var(--admin-danger);">
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
                            <i class="fas fa-exclamation-triangle" style="font-size: 2rem;"></i>
                            ${error.message}
                        </div>
                    </td>
                </tr>`;
        }
    }

    function renderOrdersTable(orders) {
        tableBody.innerHTML = '';
        if (orders.length === 0) {
            const emptyMessage = currentOrders.length === 0 
                ? 'Belum ada pesanan yang masuk.' 
                : 'Tidak ada pesanan yang sesuai dengan filter.';
            
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center; padding: 40px; color: var(--admin-text-secondary);">
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
                            <i class="fas fa-inbox" style="font-size: 2rem;"></i>
                            ${emptyMessage}
                        </div>
                    </td>
                </tr>`;
            return;
        }

        orders.forEach((order, index) => {
            const row = document.createElement('tr');
            row.dataset.orderId = order.order_id;
            row.style.animationDelay = `${index * 50}ms`;
            row.classList.add('table-row-animate');
            
            const orderDate = new Date(order.tanggal_pesanan);
            const formattedDate = orderDate.toLocaleDateString('id-ID', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
            });

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
            // Refresh data and maintain current filter
            await fetchAndRenderOrders();
            filterOrders(); // Re-apply current filters
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