document.addEventListener('DOMContentLoaded', () => {
    const allProducts = [
        { id: 'prod001', name: 'Beras Raja Platinum 5kg', price: 74500, image: 'imgs/beras.jpg' },
        { id: 'prod002', name: 'Le Minerale Galon 15L', price: 16000, image: 'imgs/air.jpg' },
        { id: 'prod003', name: 'Minyak Tropical 2L', price: 33300, image: 'imgs/minyak.jpg' },
        { id: 'prod004', name: 'Indomie Goreng 84g', price: 3300, image: 'imgs/indomie.jpg' },
        { id: 'prod005', name: 'You C1000 Orange 140ml', price: 6399, image: 'imgs/c1000.jpg' },
        { id: 'prod006', name: 'Sabun Lifebuoy 85g', price: 2900, image: 'imgs/sabun.jpg' }
    ];
    const cart = JSON.parse(localStorage.getItem('wsbCart')) || {};
    const summaryItemsList = document.getElementById('summaryItemsList');
    const summarySubtotalEl = document.getElementById('summarySubtotal');
    const summaryShippingEl = document.getElementById('summaryShipping');
    const summaryTotalEl = document.getElementById('summaryTotal');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const fullNameInput = document.getElementById('fullName');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');
    let finalTotal = 0;

    function renderOrderSummary() {
        if (Object.keys(cart).length === 0) {
            alert("Keranjang Anda kosong.");
            window.location.href = 'dashboard.html';
            return;
        }
        summaryItemsList.innerHTML = '';
        let subtotal = 0;
        for (const productId in cart) {
            const product = allProducts.find(p => p.id === productId);
            if (product) {
                const quantity = cart[productId];
                subtotal += product.price * quantity;
                const itemElement = document.createElement('div');
                itemElement.className = 'summary-item';
                itemElement.innerHTML = `<span class="item-name">${product.name} (x${quantity})</span><span class="item-price">Rp${(product.price * quantity).toLocaleString('id-ID')}</span>`;
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
        if (fullNameInput.value.trim() === '' || phoneInput.value.trim() === '' || addressInput.value.trim() === '') {
            alert('Semua detail pengiriman harus diisi.');
            return false;
        }
        return true;
    }

    placeOrderBtn.addEventListener('click', () => {
        if (!validateForm()) return;
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        if (confirm(`Anda akan menyelesaikan pesanan dengan metode pembayaran ${paymentMethod.toUpperCase()}. Lanjutkan?`)) {
            const orders = JSON.parse(localStorage.getItem('wsbOrders')) || [];
            const newOrder = {
                orderId: 'WSB-' + Date.now(),
                date: new Date().toISOString(),
                items: cart,
                totalAmount: finalTotal,
                shippingAddress: { name: fullNameInput.value, phone: phoneInput.value, address: addressInput.value }
            };
            orders.push(newOrder);
            localStorage.setItem('wsbOrders', JSON.stringify(orders));
            localStorage.removeItem('wsbCart');
            alert('Terima kasih! Pesanan Anda telah berhasil dibuat.');
            window.location.href = 'history.html';
        }
    });
    renderOrderSummary();
});