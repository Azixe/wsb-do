document.addEventListener('DOMContentLoaded', () => {
    // =================================================================================
    // STATE & DATA (SINGLE SOURCE OF TRUTH)
    // =================================================================================

    // 🚨 Di aplikasi nyata, data ini akan diambil dari server menggunakan `fetch()`
    const allProducts = [
        { id: 'prod001', name: 'Beras Raja Platinum 5kg', price: 74500, category: 'sembako', image: 'imgs/beras.jpg' },
        { id: 'prod002', name: 'Le Minerale Galon 15L', price: 16000, originalPrice: 21500, discount: 26, category: 'minuman', image: 'imgs/air.jpg' },
        { id: 'prod003', name: 'Minyak Tropical 2L', price: 33300, originalPrice: 41300, discount: 19, category: 'sembako', image: 'imgs/minyak.jpg' },
        { id: 'prod004', name: 'Indomie Goreng 84g', price: 3300, category: 'makanan', image: 'imgs/indomie.jpg' },
        { id: 'prod005', name: 'You C1000 Orange 140ml', price: 6399, originalPrice: 7900, discount: 19, category: 'minuman', image: 'imgs/c1000.jpg' },
        { id: 'prod006', name: 'Sabun Lifebuoy 85g', price: 2900, category: 'kebersihan', image: 'imgs/sabun.jpg' }
    ];

    // Coba ambil data keranjang dari localStorage, atau mulai dengan objek kosong
    let cart = JSON.parse(localStorage.getItem('wsbCart')) || {};

    // =================================================================================
    // DOM ELEMENTS
    // =================================================================================

    const productGrid = document.getElementById('productGrid');
    const categoryList = document.getElementById('categoryList');
    const searchInput = document.getElementById('searchInput');
    const cartBadge = document.getElementById('cartBadge');
    const userNameEl = document.getElementById('userName');
    const userProfile = document.getElementById('userProfile');
    const dropdownMenu = document.getElementById('dropdownMenu');

    // =================================================================================
    // RENDER FUNCTIONS
    // =================================================================================

    /**
     * Merender daftar produk ke dalam grid.
     * @param {Array} productsToRender - Array produk yang akan ditampilkan.
     */
    function renderProducts(productsToRender) {
        productGrid.innerHTML = '';
        if (productsToRender.length === 0) {
            productGrid.innerHTML = '<p>Produk tidak ditemukan.</p>';
            return;
        }

        productsToRender.forEach(p => {
            const card = document.createElement('div');
            card.className = 'product-card';
            const quantity = cart[p.id] || 0;

            let buttonHtml;
            if (quantity > 0) {
                buttonHtml = `
                    <div class="quantity-counter" data-product-id="${p.id}">
                        <button class="quantity-btn" data-action="decrease">-</button>
                        <span class="quantity-display">${quantity}</span>
                        <button class="quantity-btn" data-action="increase">+</button>
                    </div>`;
            } else {
                buttonHtml = `<button class="add-to-cart-btn" data-action="add" data-product-id="${p.id}">Tambah</button>`;
            }

            card.innerHTML = `
                ${p.discount ? `<div class="discount">${p.discount}%</div>` : ''}
                <div class="product-image-container">
                    <img src="${p.image}" alt="${p.name}">
                </div>
                <div class="product-content">
                    <div class="product-info">
                        <h3>${p.name}</h3>
                        <div class="price-container">
                            ${p.originalPrice ? `<p class="old-price">Rp${p.originalPrice.toLocaleString('id-ID')}</p>` : ''}
                            <p class="price">Rp${p.price.toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                    ${buttonHtml}
                </div>`;
            productGrid.appendChild(card);
        });
    }

    /**
     * Memperbarui tampilan badge keranjang.
     */
    function updateCartBadge() {
        const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
        if (totalItems > 0) {
            cartBadge.textContent = totalItems;
            cartBadge.classList.remove('hidden');
        } else {
            cartBadge.classList.add('hidden');
        }
    }

    // =================================================================================
    // CART LOGIC
    // =================================================================================

    /**
     * Menyimpan state keranjang saat ini ke localStorage.
     */
    function saveCartToStorage() {
        localStorage.setItem('wsbCart', JSON.stringify(cart));
    }

    function addToCart(productId) {
        cart[productId] = (cart[productId] || 0) + 1;
        const product = allProducts.find(p => p.id === productId);
        showCartNotification(`${product.name} ditambahkan!`);
        updateUI();
    }

    function removeFromCart(productId) {
        if (cart[productId]) {
            cart[productId]--;
            if (cart[productId] === 0) {
                delete cart[productId];
            }
            updateUI();
        }
    }

    /**
     * Memperbarui seluruh UI yang bergantung pada state dan menyimpan ke storage.
     */
    function updateUI() {
        const currentCategory = categoryList.querySelector('.active').dataset.category;
        const currentSearchTerm = searchInput.value;
        filterAndRenderProducts(currentCategory, currentSearchTerm);
        updateCartBadge();
        saveCartToStorage(); // <-- Perubahan penting: simpan setiap ada update
    }

    // =================================================================================
    // FILTER & SEARCH LOGIC
    // =================================================================================

    function filterAndRenderProducts(category, searchTerm) {
        let filteredProducts = allProducts;

        // Filter by category
        if (category !== 'semua') {
            filteredProducts = filteredProducts.filter(p => p.category === category);
        }

        // Filter by search term
        if (searchTerm) {
            filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        renderProducts(filteredProducts);
    }

    // =================================================================================
    // EVENT LISTENERS (Centralized)
    // =================================================================================

    /**
     * Event Delegation untuk semua aksi di dalam product grid.
     */
    productGrid.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (!action) return;

        let productId;
        if (e.target.dataset.productId) {
            productId = e.target.dataset.productId;
        } else if (e.target.closest('.quantity-counter')) {
            productId = e.target.closest('.quantity-counter').dataset.productId;
        }

        if (!productId) return;

        switch (action) {
            case 'add':
            case 'increase':
                addToCart(productId);
                break;
            case 'decrease':
                removeFromCart(productId);
                break;
        }
    });

    categoryList.addEventListener('click', (e) => {
        if (e.target.matches('.category-btn')) {
            categoryList.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            const selectedCategory = e.target.dataset.category;
            filterAndRenderProducts(selectedCategory, searchInput.value);
        }
    });

    searchInput.addEventListener('input', () => {
        const activeCategory = categoryList.querySelector('.active').dataset.category;
        filterAndRenderProducts(activeCategory, searchInput.value);
    });

    // <-- Perubahan penting: Aksi klik ikon keranjang
    document.getElementById('cartIcon').addEventListener('click', () => {
        // Tidak lagi membuka modal, tapi pindah ke halaman keranjang
        window.location.href = 'cart.html';
    });

    userProfile.addEventListener('click', (e) => {
        e.stopPropagation();
        userProfile.classList.toggle('active');
        dropdownMenu.classList.toggle('show');
    });

    dropdownMenu.addEventListener('click', (e) => {
        const action = e.target.closest('.dropdown-item')?.dataset.action;
        if (!action) return;

        switch (action) {
            case 'showProfile':
                alert('Fitur Profil Saya akan segera hadir!');
                break;
            case 'showSettings':
                alert('Fitur Pengaturan akan segera hadir!');
                break;
            case 'logout':
                if (confirm('Apakah Anda yakin ingin keluar?')) {
                    localStorage.clear();
                    window.location.href = 'index.html';
                }
                break;
        }
        userProfile.classList.remove('active');
        dropdownMenu.classList.remove('show');
    });

    document.addEventListener('click', () => {
        if (userProfile.classList.contains('active')) {
            userProfile.classList.remove('active');
            dropdownMenu.classList.remove('show');
        }
    });

    // =================================================================================
    // UI COMPONENTS (Notifications)
    // =================================================================================

    function showCartNotification(message) {
        const existingNotification = document.querySelector('.cart-notification');
        if (existingNotification) existingNotification.remove();

        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `<i class="fas fa-check-circle"></i> <span>${message}</span>`;
        document.body.appendChild(notification);

        requestAnimationFrame(() => notification.classList.add('show'));

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // =================================================================================
    // INITIALIZATION
    // =================================================================================

    function initializeDashboard() {
        if (!localStorage.getItem('isLoggedIn')) {
            window.location.href = 'index.html';
            return;
        }

        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            userNameEl.textContent = storedUsername;
        }

        // Render awal dari state yang ada (termasuk dari localStorage)
        updateUI();
    }

    initializeDashboard();
});