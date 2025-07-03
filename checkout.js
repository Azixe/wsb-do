document.addEventListener('DOMContentLoaded', () => {
    // DATA (Sama seperti halaman sebelumnya)
    const allProducts = [
        { id: 'prod001', name: 'Beras Raja Platinum 5kg', price: 74500, image: 'imgs/beras.jpg' },
        { id: 'prod002', name: 'Le Minerale Galon 15L', price: 16000, image: 'imgs/air.jpg' },
        { id: 'prod003', name: 'Minyak Tropical 2L', price: 33300, image: 'imgs/minyak.jpg' },
        { id: 'prod004', name: 'Indomie Goreng 84g', price: 3300, image: 'imgs/indomie.jpg' },
        { id: 'prod005', name: 'You C1000 Orange 140ml', price: 6399, image: 'imgs/c1000.jpg' },
        { id: 'prod006', name: 'Sabun Lifebuoy 85g', price: 2900, image: 'imgs/sabun.jpg' }
    ];

    // Ambil data keranjang dari localStorage
    const cart = JSON.parse(localStorage.getItem('wsbCart')) || {};

    // DOM Elements
    const summaryItemsList = document.getElementById('summaryItemsList');
    const summarySubtotalEl = document.getElementById('summarySubtotal');
    const summaryShippingEl = document.getElementById('summaryShipping');
    const summaryTotalEl = document.getElementById('summaryTotal');
    const placeOrderBtn = document.getElementById('placeOrderBtn');

    // Form Inputs
    const fullNameInput = document.getElementById('fullName');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');

    /**
     * Merender ringkasan produk dan menghitung total
     */
    function renderOrderSummary() {
        // Jika keranjang kosong, arahkan kembali ke halaman keranjang
        if (Object.keys(cart).length === 0) {
            alert("Keranjang Anda kosong. Silakan kembali berbelanja.");
            window.location.href = 'dashboard.html';
            return;
        }

        summaryItemsList.innerHTML = '';
        let subtotal = 0;

        for (const productId in cart) {
            const quantity = cart[productId];
            const product = allProducts.find(p => p.id === productId);

            if (product) {
                subtotal += product.price * quantity;
                const itemElement = document.createElement('div');
                itemElement.className = 'summary-item';
                itemElement.innerHTML = `
                    <span class="item-name">${product.name} (x${quantity})</span>
                    <span class="item-price">Rp${(product.price * quantity).toLocaleString('id-ID')}</span>
                `;
                summaryItemsList.appendChild(itemElement);
            }
        }

        const shippingCost = 10000;
        const total = subtotal + shippingCost;

        summarySubtotalEl.textContent = `Rp${subtotal.toLocaleString('id-ID')}`;
        summaryShippingEl.textContent = `Rp${shippingCost.toLocaleString('id-ID')}`;
        summaryTotalEl.textContent = `Rp${total.toLocaleString('id-ID')}`;
    }

    /**
     * Memvalidasi form pengiriman
     */
    function validateForm() {
        if (fullNameInput.value.trim() === '') {
            alert('Nama Lengkap harus diisi.');
            fullNameInput.focus();
            return false;
        }
        if (phoneInput.value.trim() === '') {
            alert('No. Handphone harus diisi.');
            phoneInput.focus();
            return false;
        }
        if (addressInput.value.trim() === '') {
            alert('Alamat Lengkap harus diisi.');
            addressInput.focus();
            return false;
        }
        return true;
    }

    // Event Listener untuk tombol "Selesaikan Pesanan"
    placeOrderBtn.addEventListener('click', () => {
        // 1. Validasi form
        if (!validateForm()) {
            return; // Hentikan jika form tidak valid
        }

        // 2. Konfirmasi pesanan (simulasi)
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        const confirmation = confirm(`Anda akan menyelesaikan pesanan dengan metode pembayaran ${paymentMethod.toUpperCase()}. Lanjutkan?`);

        if (confirmation) {
            // 3. Proses pesanan (simulasi)
            alert('Terima kasih! Pesanan Anda telah berhasil dibuat.');

            // 4. Kosongkan keranjang di localStorage
            localStorage.removeItem('wsbCart');

            // 5. Arahkan pengguna kembali ke dashboard
            window.location.href = 'dashboard.html';
        }
    });

    // Panggil fungsi render saat halaman dimuat
    renderOrderSummary();
});