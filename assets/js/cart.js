document.addEventListener('DOMContentLoaded', () => {
    let cart = JSON.parse(localStorage.getItem('wsbCart')) || {};

    const cartItemsList = document.getElementById('cartItemsList');
    const subtotalPriceEl = document.getElementById('subtotalPrice');
    const totalPriceEl = document.getElementById('totalPrice');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const cartLayout = document.querySelector('.cart-layout');

    function saveCartToStorage() {
        localStorage.setItem('wsbCart', JSON.stringify(cart));
    }

    function renderCartItems() {
        cartItemsList.innerHTML = '';
        if (Object.keys(cart).length === 0) {
            cartLayout.innerHTML = `<div class="empty-cart-message"><p>Keranjang belanja Anda masih kosong.</p><a href="dashboard.html" class="back-to-shop-btn">Kembali Berbelanja</a></div>`;
            return;
        }

        for (const productId in cart) {
            const product = cart[productId];
            const itemTotalPrice = product.price * product.quantity;
            const itemCard = document.createElement('div');
            itemCard.className = 'cart-item-card';
            itemCard.dataset.productId = productId;
            itemCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <h3>${product.name}</h3>
                    <p class="price">Rp${product.price.toLocaleString('id-ID')}</p>
                    <div class="quantity-counter" data-product-id="${productId}">
                        <button class="quantity-btn" data-action="decrease">-</button>
                        <span class="quantity-display">${product.quantity}</span>
                        <button class="quantity-btn" data-action="increase">+</button>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <span class="item-total-price">Rp${itemTotalPrice.toLocaleString('id-ID')}</span>
                    <button class="remove-item-btn" data-action="remove">Hapus</button>
                </div>`;
            cartItemsList.appendChild(itemCard);
        }
    }

    function updateOrderSummary() {
        let subtotal = 0;
        for (const productId in cart) {
            const item = cart[productId];
            subtotal += item.price * item.quantity;
        }
        const shippingCost = 10000;
        const total = subtotal + shippingCost;
        subtotalPriceEl.textContent = `Rp${subtotal.toLocaleString('id-ID')}`;
        totalPriceEl.textContent = `Rp${total.toLocaleString('id-ID')}`;
    }

    function updateCartPage() {
        renderCartItems();
        updateOrderSummary();
        saveCartToStorage();
    }

    cartItemsList.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-action]');
        if (!button) return;
        const action = button.dataset.action;
        const productCard = e.target.closest('.cart-item-card');
        const productId = productCard.dataset.productId;
        if (!productId) return;

        switch (action) {
            case 'increase': cart[productId].quantity++; break;
            case 'decrease': cart[productId].quantity--; if (cart[productId].quantity === 0) delete cart[productId]; break;
            case 'remove': delete cart[productId]; break;
        }
        updateCartPage();
    });

    checkoutBtn.addEventListener('click', () => { window.location.href = 'checkout.html'; });

    updateCartPage();
});