document.addEventListener('DOMContentLoaded', () => {
    // === VALIDASI LOGIN ===
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userDisplayName = localStorage.getItem('username'); // Nama lengkap user untuk display
    const userPhoneNumber = localStorage.getItem('userPhone'); // Nomor HP yang digunakan login
    
    console.log('Checkout data:', { 
        displayName: userDisplayName, 
        phoneNumber: userPhoneNumber 
    }); // Debug log
    
    if (!isLoggedIn || isLoggedIn !== 'true' || !userDisplayName) {
        alert('Anda harus login terlebih dahulu.');
        window.location.href = '../index.html';
        return;
    }
    
    // === DOM ELEMENTS ===
    const summaryItemsList = document.getElementById('summaryItemsList');
    const summarySubtotalEl = document.getElementById('summarySubtotal');
    const summaryShippingEl = document.getElementById('summaryShipping');
    const summaryTotalEl = document.getElementById('summaryTotal');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const customerNameEl = document.getElementById('customerName');
    const customerPhoneEl = document.getElementById('customerPhone');
    const addressInput = document.getElementById('address');

    // === FILL USER DATA ===
    customerNameEl.textContent = userDisplayName || 'Nama tidak tersedia';
    customerPhoneEl.textContent = userPhoneNumber || 'Nomor HP tidak tersedia';

    // === DATA ===
    const cart = JSON.parse(localStorage.getItem('wsbCart')) || {};
    let finalTotal = 0;

    // === FUNCTIONS ===

    function renderOrderSummary() {
        if (Object.keys(cart).length === 0) {
            alert("Keranjang Anda kosong. Mengarahkan kembali ke dasbor.");
            window.location.href = 'dashboard.html';
            return;
        }

        summaryItemsList.innerHTML = '';
        let subtotal = 0;

        for (const productId in cart) {
            const item = cart[productId];
            if (item && item.price && item.quantity) {
                subtotal += item.price * item.quantity;
                const itemElement = document.createElement('div');
                itemElement.className = 'summary-item';
                itemElement.innerHTML = `
                    <span class="item-name">${item.name} (x${item.quantity})</span>
                    <span class="item-price">Rp${(item.price * item.quantity).toLocaleString('id-ID')}</span>
                `;
                summaryItemsList.appendChild(itemElement);
            }
        }

        const shippingCost = 10000;
        finalTotal = subtotal + shippingCost;
        summarySubtotalEl.textContent = `Rp${subtotal.toLocaleString('id-ID')}`;
        summaryShippingEl.textContent = `Rp${shippingCost.toLocaleString('id-ID')}`;
        summaryTotalEl.textContent = `Rp${finalTotal.toLocaleString('id-ID')}`;
    }

    function validateForm() {
        if (addressInput.value.trim() === '') {
            alert('Alamat Lengkap harus diisi.');
            addressInput.focus();
            return false;
        }
        return true;
    }

    // --- FUNGSI INI DIPERBAIKI UNTUK MENYIMPAN KE LOCALSTORAGE ---
    // Ganti fungsi handlePlaceOrder di checkout.js
    const kdPelanggan = localStorage.getItem('kd_pelanggan');

    async function handlePlaceOrder() {
        if (!validateForm()) return;

        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

        const orderData = {
            orderDetails: {
                orderId: 'WSB-' + Date.now(),
                totalAmount: finalTotal,
                shippingAddress: {
                    name: userDisplayName, // Nama user dari localStorage
                    phone: userPhoneNumber, // Nomor HP user dari localStorage
                    address: addressInput.value
                }
            },
            items: cart, // 'cart' sudah berisi semua detail produk
            paymentMethod: paymentMethod,
            kd_pelanggan: kdPelanggan
        };

        try {
            const response = await fetch('http://localhost:3001/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });
            const result = await response.json();
            if (response.ok) {
                alert('Terima kasih! Pesanan Anda telah berhasil dibuat.');
                localStorage.removeItem('wsbCart');
                window.location.href = 'history.html'; // atau riwayat.html
            } else {
                alert(`Gagal membuat pesanan: ${result.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Tidak bisa terhubung ke server untuk membuat pesanan.');
        }
    }

    // === INITIALIZATION & EVENT LISTENERS ===
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', handlePlaceOrder);
    }

    renderOrderSummary();
});