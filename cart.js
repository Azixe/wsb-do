document.addEventListener('DOMContentLoaded', () => {
    // =================================================================================
    // DATA (Sama seperti di dashboard.js)
    // =================================================================================

    // 🚨 Di aplikasi nyata, data ini akan diambil dari satu sumber, bukan diduplikasi.
    const allProducts = [
        { id: 'prod001', name: 'Beras Raja Platinum 5kg', price: 74500, category: 'sembako', image: 'imgs/beras.jpg' },
        { id: 'prod002', name: 'Le Minerale Galon 15L', price: 16000, originalPrice: 21500, discount: 26, category: 'minuman', image: 'imgs/air.jpg' },
        { id: 'prod003', name: 'Minyak Tropical 2L', price: 33300, originalPrice: 41300, discount: 19, category: 'sembako', image: 'imgs/minyak.jpg' },
        { id: 'prod004', name: 'Indomie Goreng 84g', price: 3300, category: 'makanan', image: 'imgs/indomie.jpg' },
        { id: 'prod005', name: 'You C1000 Orange 140ml', price: 6399, originalPrice: 7900, discount: 19, category: 'minuman', image: 'imgs/c1000.jpg' },
        { id: 'prod006', name: 'Sabun Lifebuoy 85g', price: 2900, category: 'kebersihan', image: 'imgs/sabun.jpg' }
    ];

    // Ambil data keranjang dari localStorage
    let cart = JSON.parse(localStorage.getItem('wsbCart')) || {};

    // =================================================================================
    // DOM ELEMENTS
    // =================================================================================

    const cartItemsList = document.getElementById('cartItemsList');
    const subtotalPriceEl = document.getElementById('subtotalPrice');
    const totalPriceEl = document.getElementById('totalPrice');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const cartLayout = document.querySelector('.cart-layout');


    // =================================================================================
    // FUNCTIONS
    // =================================================================================

    /**
     * Menyimpan state keranjang saat ini ke localStorage.
     */
    function saveCartToStorage() {
        localStorage.setItem('wsbCart', JSON.stringify(cart));
    }

    /**
     * Merender semua item di keranjang ke halaman.
     */
    function renderCartItems() {
        // Kosongkan daftar sebelum merender
        cartItemsList.innerHTML = '';

        // Cek jika keranjang kosong
        if (Object.keys(cart).length === 0) {
            cartLayout.innerHTML = `
                <div class="empty-cart-message">
                    <p>Keranjang belanja Anda masih kosong.</p>
                </div>`;
            return;
        }

        // Loop melalui setiap item di keranjang dan buat HTML-nya
        for (const productId in cart) {
            const quantity = cart[productId];
            const product = allProducts.find(p => p.id === productId);

            if (product) {
                const itemTotalPrice = product.price * quantity;

                const itemCard = document.createElement('div');
                itemCard.className = 'cart-item-card';
                itemCard.innerHTML = `
                    <img src="${product.image}" alt="${product.name}" class="cart-item-image">
                    <div class="cart-item-info">
                        <h3>${product.name}</h3>
                        <p class="price">Rp${product.price.toLocaleString('id-ID')}</p>
                        <div class="quantity-counter" data-product-id="${product.id}">
                            <button class="quantity-btn" data-action="decrease">-</button>
                            <span class="quantity-display">${quantity}</span>
                            <button class="quantity-btn" data-action="increase">+</button>
                        </div>
                    </div>
                    <div class="cart-item-actions">
                        <span class="item-total-price">Rp${itemTotalPrice.toLocaleString('id-ID')}</span>
                        <button class="remove-item-btn" data-action="remove">Hapus</button>
                    </div>
                `;
                cartItemsList.appendChild(itemCard);
            }
        }
    }

    /**
     * Menghitung dan memperbarui ringkasan pesanan.
     */
    function updateOrderSummary() {
        let subtotal = 0;
        for (const productId in cart) {
            const quantity = cart[productId];
            const product = allProducts.find(p => p.id === productId);
            if (product) {
                subtotal += product.price * quantity;
            }
        }

        // Contoh biaya pengiriman statis
        const shippingCost = 10000;
        const total = subtotal + shippingCost;

        subtotalPriceEl.textContent = `Rp${subtotal.toLocaleString('id-ID')}`;
        totalPriceEl.textContent = `Rp${total.toLocaleString('id-ID')}`;
    }

    /**
     * Fungsi utama untuk memperbarui seluruh halaman keranjang.
     */
    function updateCartPage() {
        renderCartItems();
        updateOrderSummary();
        saveCartToStorage();
    }

    // =================================================================================
    // EVENT LISTENERS
    // =================================================================================

    cartItemsList.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (!action) return;

        const productCard = e.target.closest('.cart-item-card, .quantity-counter');
        const productId = productCard.dataset.productId;

        if (!productId) return;

        switch (action) {
            case 'increase':
                cart[productId]++;
                break;
            case 'decrease':
                cart[productId]--;
                if (cart[productId] === 0) {
                    delete cart[productId];
                }
                break;
            case 'remove':
                delete cart[productId];
                break;
        }

        updateCartPage();
    });

    checkoutBtn.addEventListener('click', () => {
        // Arahkan ke halaman checkout
        window.location.href = 'checkout.html';
    });

    // =================================================================================
    // INITIALIZATION
    // =================================================================================

    // Panggil fungsi utama saat halaman pertama kali dimuat
    updateCartPage();
});