document.addEventListener('DOMContentLoaded', () => {
    // === STATE APLI    // Enhanced category rendering with auto-scroll (moved above)
    // function renderCategories is now defined above with auto-scroll feature  let currentPage = 1;
    let totalPages = 1;
    let currentSearchTerm = '';
    let currentCategory = 'semua';
    let isLoading = false;
    let cart = JSON.parse(localStorage.getItem('wsbCart')) || {};
    let productsOnPage = []; // Menyimpan data produk yang sedang tampil

    // === DOM ELEMENTS ===
    const productGrid = document.getElementById('productGrid');
    const categoryList = document.getElementById('categoryList');
    const searchInput = document.getElementById('searchInput');
    const userNameEl = document.getElementById('userName');
    const userProfile = document.getElementById('userProfile');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const cartBadge = document.getElementById('cartBadge');

    // === FUNGSI-FUNGSI ===

    // 1. Fungsi Render (Menampilkan ke layar)
    function renderProducts(products, append = false) {
        if (!append) {
            productGrid.innerHTML = '';
            productsOnPage = [];
        }
        if (!products || products.length === 0) {
            if (!append) productGrid.innerHTML = '<p>Produk tidak ditemukan.</p>';
            return;
        }

        products.forEach(p => {
            if (!document.querySelector(`.product-card[data-product-id="${p.id}"]`)) {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.dataset.productId = p.id;
                productGrid.appendChild(card);
                productsOnPage.push(p); // Tambahkan ke data produk di halaman ini
                updateCardUI(card, p);
            }
        });
    }

    function updateCardUI(cardElement, productData) {
        const quantity = cart[productData.id]?.quantity || 0;
        let buttonHtml = quantity > 0
            ? `<div class="quantity-counter" data-product-id="${productData.id}"><button class="quantity-btn" data-action="decrease">-</button><span class="quantity-display">${quantity}</span><button class="quantity-btn" data-action="increase">+</button></div>`
            : `<button class="add-to-cart-btn" data-action="add" data-product-id="${productData.id}">Tambah</button>`;

        cardElement.innerHTML = `<div class="product-image-container"><img src="${productData.image || '../assets/imgs/placeholder.png'}" alt="${productData.name}"></div><div class="product-content"><div class="product-info"><h3>${productData.name}</h3><div class="price-container"><p class="price">Rp${(productData.price || 0).toLocaleString('id-ID')}</p></div></div><div class="action-container">${buttonHtml}</div></div>`;
    }



    // Enhanced category rendering
    function renderCategories(categories) {
        categoryList.querySelectorAll('.category-btn:not([data-category="semua"])').forEach(btn => btn.remove());
        categories.forEach(category => {
            if (category) {
                const button = document.createElement('button');
                button.className = 'category-btn';
                button.dataset.category = category.toLowerCase();
                button.textContent = category;
                categoryList.appendChild(button);
            }
        });
        
        // Update fade effects after rendering
        setTimeout(() => {
            updateCategoryFadeEffects();
        }, 100);
    }

    // 2. Fungsi Fetch Data (Komunikasi dengan Backend)
    async function fetchProducts(isNewQuery = false) {
        if (isLoading || (!isNewQuery && currentPage > totalPages)) return;

        isLoading = true;
        if (isNewQuery) {
            currentPage = 1;
            totalPages = 1;
            productGrid.innerHTML = '<p>Memuat produk...</p>';
        }

        const url = `http://localhost:3001/api/products?search=${currentSearchTerm}&category=${currentCategory}&page=${currentPage}&limit=20`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            renderProducts(data.products, !isNewQuery);
            totalPages = data.totalPages;
            currentPage++;
        } catch (error) {
            console.error('Gagal mengambil produk:', error);
            productGrid.innerHTML = '<p>Gagal memuat produk. Coba lagi.</p>';
        } finally {
            isLoading = false;
        }
    }

    async function fetchInitialData() {
        try {
            const [_, productsData] = await Promise.all([
                fetch('http://localhost:3001/api/categories').then(res => res.json()).then(renderCategories),
                fetch(`http://localhost:3001/api/products?page=1&limit=20`).then(res => res.json())
            ]);

            renderProducts(productsData.products);
            totalPages = productsData.totalPages;
            currentPage = 2;
        } catch (error) {
            console.error('Error memuat data awal:', error);
            productGrid.innerHTML = '<p>Gagal memuat data.</p>';
        }
    }

    // 3. Fungsi Keranjang (Cart Logic)
    function saveCartToStorage() { localStorage.setItem('wsbCart', JSON.stringify(cart)); }
    function updateCartBadge() { const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0); cartBadge.textContent = totalItems; cartBadge.classList.toggle('hidden', totalItems === 0); }

    function addToCart(productId) {
        const product = productsOnPage.find(p => p.id === productId);
        if (!product) return;
        if (cart[productId]) {
            cart[productId].quantity++;
        } else {
            cart[productId] = { quantity: 1, name: product.name, price: product.price, image: product.image, id: product.id };
        }
        updateAfterCartChange(productId);
    }

    function removeFromCart(productId) {
        if (cart[productId]) {
            cart[productId].quantity--;
            if (cart[productId].quantity === 0) delete cart[productId];
            updateAfterCartChange(productId);
        }
    }

    function updateAfterCartChange(productId) {
        updateCartBadge();
        saveCartToStorage();
        const cardToUpdate = document.querySelector(`.product-card[data-product-id="${productId}"]`);
        if (cardToUpdate) {
            const productData = productsOnPage.find(p => p.id === productId) || { id: productId };
            updateCardUI(cardToUpdate, productData);
        }
    }

    // Function to update fade effects and scroll indicators based on scroll position
    function updateCategoryFadeEffects() {
        const container = document.getElementById('categoryListContainer');
        const list = categoryList;
        const leftIndicator = document.getElementById('scrollIndicatorLeft');
        const rightIndicator = document.getElementById('scrollIndicatorRight');
        
        if (!container || !list) return;
        
        const scrollLeft = list.scrollLeft;
        const maxScrollLeft = list.scrollWidth - list.clientWidth;
        
        // Remove/add fade classes based on scroll position
        if (scrollLeft <= 5) {
            container.classList.add('no-left-fade');
            if (leftIndicator) leftIndicator.classList.remove('show');
        } else {
            container.classList.remove('no-left-fade');
            if (leftIndicator) leftIndicator.classList.add('show');
        }
        
        if (scrollLeft >= maxScrollLeft - 5) {
            container.classList.add('no-right-fade');
            if (rightIndicator) rightIndicator.classList.remove('show');
        } else {
            container.classList.remove('no-right-fade');
            if (rightIndicator) rightIndicator.classList.add('show');
        }
        
        // Hide indicators if there's no overflow
        if (maxScrollLeft <= 0) {
            if (leftIndicator) leftIndicator.classList.remove('show');
            if (rightIndicator) rightIndicator.classList.remove('show');
        }
    }

    // Add scroll event listener to category list
    function initializeCategoryScrollEffects() {
        categoryList.addEventListener('scroll', updateCategoryFadeEffects);
        
        // Initialize scroll indicators
        initializeScrollIndicators();
        
        // Initial check
        setTimeout(updateCategoryFadeEffects, 100);
        
        // Check on window resize
        window.addEventListener('resize', () => {
            setTimeout(updateCategoryFadeEffects, 100);
        });
    }

    // Add click handlers for scroll indicators
    function initializeScrollIndicators() {
        const leftIndicator = document.getElementById('scrollIndicatorLeft');
        const rightIndicator = document.getElementById('scrollIndicatorRight');
        
        if (leftIndicator) {
            leftIndicator.addEventListener('click', () => {
                categoryList.scrollBy({
                    left: -150,
                    behavior: 'smooth'
                });
            });
            leftIndicator.style.pointerEvents = 'auto';
            leftIndicator.style.cursor = 'pointer';
        }
        
        if (rightIndicator) {
            rightIndicator.addEventListener('click', () => {
                categoryList.scrollBy({
                    left: 150,
                    behavior: 'smooth'
                });
            });
            rightIndicator.style.pointerEvents = 'auto';
            rightIndicator.style.cursor = 'pointer';
        }
    }

    // === EVENT LISTENERS ===

    searchInput.addEventListener('input', () => {
        currentSearchTerm = searchInput.value;
        fetchProducts(true);
    });

    categoryList.addEventListener('click', async (e) => {
        if (e.target.matches('.category-btn')) {
            // Prevent double-clicking
            if (e.target.disabled) return;
            
            // Update UI state immediately
            const previousActive = categoryList.querySelector('.active');
            if (previousActive) previousActive.classList.remove('active');
            e.target.classList.add('active');
            
            // Disable all buttons temporarily to prevent race conditions
            const allButtons = categoryList.querySelectorAll('.category-btn');
            allButtons.forEach(btn => btn.disabled = true);
            
            // Update current category
            const newCategory = e.target.dataset.category;
            currentCategory = newCategory;
            
            // Show loading state
            productGrid.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><p>Memuat produk...</p></div>';
            
            try {
                // Fetch products for selected category
                await fetchProducts(true);
            } catch (error) {
                console.error('Error filtering kategori:', error);
                productGrid.innerHTML = '<p class="error-message">Gagal memuat produk. Silakan coba lagi.</p>';
            } finally {
                // Re-enable all buttons
                allButtons.forEach(btn => btn.disabled = false);
            }
        }
    });

    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
            fetchProducts();
        }
    });

    productGrid.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-action]');
        if (!button) return;
        const action = button.dataset.action;
        const container = button.closest('[data-product-id]');
        const productId = container.dataset.productId;
        if (!productId) return;
        if (action === 'add' || action === 'increase') addToCart(productId);
        else if (action === 'decrease') removeFromCart(productId);
    });

    document.getElementById('cartIcon').addEventListener('click', () => { window.location.href = 'cart.html'; });

    userProfile.addEventListener('click', (e) => {
        e.stopPropagation();
        userProfile.classList.toggle('active');
        dropdownMenu.classList.toggle('show');
    });

    document.addEventListener('click', () => {
        if (userProfile.classList.contains('active')) {
            userProfile.classList.remove('active');
            dropdownMenu.classList.remove('show');
        }
    });

    dropdownMenu.addEventListener('click', (e) => {
        const target = e.target.closest('.dropdown-item');
        if (!target) return;

        const href = target.href;
        if (href && href.includes('.html')) {
            return; // Biarkan link biasa berfungsi
        }

        const action = target.dataset.action;
        if (!action) return;

        switch (action) {
            case 'showProfile': alert('Fitur Profil akan segera hadir!'); break;
            case 'showSettings': window.location.href = 'setting.html'; break;
            case 'logout': if (confirm('Yakin ingin keluar?')) { localStorage.clear(); window.location.href = '../index.html'; } break;
        }

        userProfile.classList.remove('active');
        dropdownMenu.classList.remove('show');
    });

    // === INITIALIZATION ===
    function initializeDashboard() {
        if (!localStorage.getItem('isLoggedIn')) { window.location.href = '../index.html'; return; }
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) userNameEl.textContent = storedUsername;
        fetchInitialData();
        updateCartBadge();
        initializeCategoryScrollEffects();
        initializeScrollIndicators();
    }

    initializeDashboard();
});