document.addEventListener('DOMContentLoaded', () => {
    // === DOM ELEMENTS ===
    const summaryItemsList = document.getElementById('summaryItemsList');
    const summarySubtotalEl = document.getElementById('summarySubtotal');
    const summaryShippingEl = document.getElementById('summaryShipping');
    const summaryTotalEl = document.getElementById('summaryTotal');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const fullNameInput = document.getElementById('fullName');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');

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

    // --- FUNGSI INI DIPERBAIKI UNTUK MENYIMPAN KE LOCALSTORAGE ---
    // Ganti fungsi handlePlaceOrder di checkout.js
    async function handlePlaceOrder() {
        if (!validateForm()) return;

        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

        const orderData = {
            orderDetails: {
                orderId: 'WSB-' + Date.now(),
                totalAmount: finalTotal,
                shippingAddress: {
                    name: fullNameInput.value,
                    phone: phoneInput.value,
                    address: addressInput.value
                }
            },
            items: cart, // 'cart' sudah berisi semua detail produk
            paymentMethod: paymentMethod
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