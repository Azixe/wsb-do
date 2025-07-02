// Cart Management
let cartItems = [];
let cartCount = 0;
let productQuantities = {}; // Track quantities for each product

function updateCartBadge() {
    const cartBadge = document.getElementById('cartBadge');
    if (cartCount > 0) {
        cartBadge.textContent = cartCount;
        cartBadge.classList.remove('hidden');
    } else {
        cartBadge.classList.add('hidden');
    }
}

function addToCart(product) {
    const productName = product.name;
    
    // Update product quantities
    if (!productQuantities[productName]) {
        productQuantities[productName] = 0;
    }
    productQuantities[productName]++;
    
    // Update cart items
    const existingItem = cartItems.find(item => item.name === productName);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cartItems.push({
            ...product,
            quantity: 1
        });
    }
    
    cartCount++;
    updateCartBadge();
    updateProductButton(productName);
    
    // Show success feedback
    showCartNotification(`${product.name} ditambahkan ke keranjang!`);
}

function removeFromCart(productName) {
    if (!productQuantities[productName] || productQuantities[productName] <= 0) {
        return;
    }
    
    productQuantities[productName]--;
    cartCount--;
    
    // Update cart items
    const existingItem = cartItems.find(item => item.name === productName);
    if (existingItem) {
        if (existingItem.quantity > 1) {
            existingItem.quantity--;
        } else {
            // Remove item from cart
            const index = cartItems.findIndex(item => item.name === productName);
            cartItems.splice(index, 1);
        }
    }
    
    // If quantity reaches 0, remove from productQuantities
    if (productQuantities[productName] === 0) {
        delete productQuantities[productName];
    }
    
    updateCartBadge();
    updateProductButton(productName);
}

function updateProductButton(productName) {
    // Find the product card
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const productTitle = card.querySelector('h3').textContent;
        if (productTitle === productName) {
            const buttonContainer = card.querySelector('.product-content');
            const quantity = productQuantities[productName] || 0;
            
            // Remove existing button/counter
            const existingButton = buttonContainer.querySelector('button');
            const existingCounter = buttonContainer.querySelector('.quantity-counter');
            
            if (existingButton) existingButton.remove();
            if (existingCounter) existingCounter.remove();
            
            if (quantity > 0) {
                // Show quantity counter
                const counter = document.createElement('div');
                counter.className = 'quantity-counter';
                counter.innerHTML = `
                    <button class="quantity-btn" onclick="removeFromCart('${productName}')">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-display">${quantity}</span>
                    <button class="quantity-btn" onclick="addToCartFromCounter('${productName}')">
                        <i class="fas fa-plus"></i>
                    </button>
                `;
                buttonContainer.appendChild(counter);
            } else {
                // Show add button
                const button = document.createElement('button');
                button.onclick = () => addToCart({
                    name: productName,
                    price: getProductPrice(productName),
                    image: getProductImage(productName)
                });
                button.textContent = 'Tambah';
                buttonContainer.appendChild(button);
            }
        }
    });
}

function addToCartFromCounter(productName) {
    const product = {
        name: productName,
        price: getProductPrice(productName),
        image: getProductImage(productName)
    };
    addToCart(product);
}

function getProductPrice(productName) {
    const products = [
        { name: 'Beras Raja Platinum 5kg', price: 74500 },
        { name: 'Le Minerale Galon 15L', price: 16000 },
        { name: 'Minyak Tropical 2L', price: 33300 },
        { name: 'Indomie Goreng 84g', price: 3300 },
        { name: 'You C1000 Orange 140ml', price: 6399 },
        { name: 'Sabun Lifebuoy 85g', price: 2900 }
    ];
    
    const product = products.find(p => p.name === productName);
    return product ? product.price : 0;
}

function getProductImage(productName) {
    const products = [
        { name: 'Beras Raja Platinum 5kg', image: 'imgs/beras.jpg' },
        { name: 'Le Minerale Galon 15L', image: 'imgs/air.jpg' },
        { name: 'Minyak Tropical 2L', image: 'imgs/minyak.jpg' },
        { name: 'Indomie Goreng 84g', image: 'imgs/indomie.jpg' },
        { name: 'You C1000 Orange 140ml', image: 'imgs/c1000.jpg' },
        { name: 'Sabun Lifebuoy 85g', image: 'imgs/sabun.jpg' }
    ];
    
    const product = products.find(p => p.name === productName);
    return product ? product.image : '';
}

function showCartNotification(message) {
    // Remove existing notifications
    const existingNotification = document.querySelector('.cart-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 24px;
        background: white;
        color: #059669;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #10b981;
        z-index: 1000;
        font-size: 14px;
        font-weight: 500;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        gap: 8px;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Show notification with animation
    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    });
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

function goToCheckout() {
    if (cartCount === 0) {
        showEmptyCartModal();
        return;
    }
    
    showCheckoutModal();
}

function showEmptyCartModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-icon empty-cart">
                <i class="fas fa-shopping-cart"></i>
            </div>
            <h3>Keranjang Kosong</h3>
            <p>Belum ada produk di keranjang Anda. Silakan pilih produk terlebih dahulu.</p>
            <button class="modal-btn primary" onclick="closeModal()">Mengerti</button>
        </div>
    `;
    
    addModalStyles();
    document.body.appendChild(modal);
    
    // Show modal with animation
    requestAnimationFrame(() => {
        modal.style.opacity = '1';
        modal.querySelector('.modal-content').style.transform = 'scale(1)';
    });
}

function showCheckoutModal() {
    let cartSummary = '';
    let total = 0;
    
    cartItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        cartSummary += `
            <div class="cart-item">
                <span class="item-name">${item.name}</span>
                <span class="item-quantity">${item.quantity}x</span>
                <span class="item-price">Rp${itemTotal.toLocaleString()}</span>
            </div>
        `;
        total += itemTotal;
    });
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content checkout-modal">
            <div class="modal-header">
                <h3>Keranjang Belanja</h3>
                <button class="close-btn" onclick="closeModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="cart-items">
                ${cartSummary}
            </div>
            <div class="cart-total">
                <strong>Total: Rp${total.toLocaleString()}</strong>
            </div>
            <div class="modal-actions">
                <button class="modal-btn secondary" onclick="closeModal()">Batal</button>
                <button class="modal-btn primary" onclick="proceedCheckout()">Lanjut Checkout</button>
            </div>
        </div>
    `;
    
    addModalStyles();
    document.body.appendChild(modal);
    
    // Show modal with animation
    requestAnimationFrame(() => {
        modal.style.opacity = '1';
        modal.querySelector('.modal-content').style.transform = 'scale(1)';
    });
}

function addModalStyles() {
    if (document.getElementById('modal-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'modal-styles';
    styles.textContent = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
            padding: 20px;
        }
        
        .modal-content {
            background: white;
            border-radius: 16px;
            padding: 24px;
            max-width: 400px;
            width: 100%;
            text-align: center;
            transform: scale(0.9);
            transition: transform 0.3s ease;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .modal-header h3 {
            margin: 0;
            color: #111827;
            font-weight: 600;
        }
        
        .close-btn {
            background: none;
            border: none;
            font-size: 18px;
            color: #6b7280;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: background-color 0.2s ease;
        }
        
        .close-btn:hover {
            background-color: #f3f4f6;
        }
        
        .modal-icon {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
            font-size: 24px;
        }
        
        .modal-icon.empty-cart {
            background: #fee2e2;
            color: #dc2626;
        }
        
        .modal-content h3 {
            margin: 0 0 8px 0;
            color: #111827;
            font-weight: 600;
        }
        
        .modal-content p {
            color: #6b7280;
            margin: 0 0 20px 0;
            line-height: 1.5;
        }
        
        .cart-items {
            text-align: left;
            margin-bottom: 16px;
        }
        
        .cart-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #f3f4f6;
        }
        
        .cart-item:last-child {
            border-bottom: none;
        }
        
        .item-name {
            flex: 1;
            font-weight: 500;
            color: #374151;
        }
        
        .item-quantity {
            color: #6b7280;
            margin: 0 12px;
        }
        
        .item-price {
            font-weight: 600;
            color: #111827;
        }
        
        .cart-total {
            text-align: center;
            padding: 16px 0;
            border-top: 2px solid #e5e7eb;
            margin-bottom: 20px;
            font-size: 18px;
            color: #111827;
        }
        
        .modal-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
        }
        
        .modal-btn {
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            border: none;
            font-size: 14px;
        }
        
        .modal-btn.primary {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
        }
        
        .modal-btn.primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        
        .modal-btn.secondary {
            background: #f3f4f6;
            color: #374151;
        }
        
        .modal-btn.secondary:hover {
            background: #e5e7eb;
        }
    `;
    document.head.appendChild(styles);
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.style.opacity = '0';
        modal.querySelector('.modal-content').style.transform = 'scale(0.9)';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

function proceedCheckout() {
    closeModal();
    setTimeout(() => {
        showCartNotification('Fitur checkout akan segera hadir!');
    }, 300);
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize cart badge
    updateCartBadge();
    
    // Initialize user profile dropdown
    initUserProfile();
    
    const products = [
        {
            name: 'Beras Raja Platinum 5kg',
            price: 74500,
            category: 'sembako',
            image: 'imgs/beras.jpg',
        },
        {
            name: 'Le Minerale Galon 15L',
            price: 16000,
            originalPrice: 21500,
            discount: 26,
            category: 'minuman',
            image: 'imgs/air.jpg',
        },
        {
            name: 'Minyak Tropical 2L',
            price: 33300,
            originalPrice: 41300,
            discount: 19,
            category: 'sembako',
            image: 'imgs/minyak.jpg',
        },
        {
            name: 'Indomie Goreng 84g',
            price: 3300,
            category: 'makanan',
            image: 'imgs/indomie.jpg',
        },
        {
            name: 'You C1000 Orange 140ml',
            price: 6399,
            originalPrice: 7900,
            discount: 19,
            category: 'minuman',
            image: 'imgs/c1000.jpg',
        },
        {
            name: 'Sabun Lifebuoy 85g',
            price: 2900,
            category: 'kebersihan',
            image: 'imgs/sabun.jpg',
        }
    ];

    const productGrid = document.getElementById('productGrid');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const searchInput = document.getElementById('searchInput');

    function renderProducts(productList) {
        productGrid.innerHTML = '';
        productList.forEach(p => {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            const quantity = productQuantities[p.name] || 0;
            let buttonHtml;
            
            if (quantity > 0) {
                buttonHtml = `
                    <div class="quantity-counter">
                        <button class="quantity-btn" onclick="removeFromCart('${p.name}')">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity-display">${quantity}</span>
                        <button class="quantity-btn" onclick="addToCartFromCounter('${p.name}')">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                `;
            } else {
                buttonHtml = `<button onclick="addToCart({name: '${p.name}', price: ${p.price}, image: '${p.image}'})">Tambah</button>`;
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
                            ${p.originalPrice ? `<p class="old-price">Rp${p.originalPrice.toLocaleString()}</p>` : ''}
                            <p class="price">Rp${p.price.toLocaleString()}</p>
                        </div>
                    </div>
                    ${buttonHtml}
                </div>
            `;
            productGrid.appendChild(card);
        });
    }

    // Render awal
    renderProducts(products);

    // Kategori filter
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const selected = btn.dataset.category;
            const filtered = selected === 'semua'
                ? products
                : products.filter(p => p.category === selected);
            renderProducts(filtered);
        });
    });

    // Pencarian produk
    searchInput.addEventListener('input', () => {
        const keyword = searchInput.value.toLowerCase();
        const filtered = products.filter(p => p.name.toLowerCase().includes(keyword));
        renderProducts(filtered);
    });
});

// User Profile Functions
function initUserProfile() {
    const userProfile = document.getElementById('userProfile');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const userName = document.getElementById('userName');
    
    // Set username from localStorage if available
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
        userName.textContent = storedUsername;
    }
    
    // Toggle dropdown on profile click
    userProfile.addEventListener('click', function(e) {
        e.stopPropagation();
        userProfile.classList.toggle('active');
        dropdownMenu.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!userProfile.contains(e.target)) {
            userProfile.classList.remove('active');
            dropdownMenu.classList.remove('show');
        }
    });
    
    // Prevent dropdown close when clicking inside dropdown
    dropdownMenu.addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

function showProfile() {
    alert('Fitur Profil Saya akan segera hadir!');
    // Close dropdown after action
    document.getElementById('userProfile').classList.remove('active');
    document.getElementById('dropdownMenu').classList.remove('show');
}

function showSettings() {
    alert('Fitur Pengaturan akan segera hadir!');
    // Close dropdown after action
    document.getElementById('userProfile').classList.remove('active');
    document.getElementById('dropdownMenu').classList.remove('show');
}

function logout() {
    // Close dropdown first
    document.getElementById('userProfile').classList.remove('active');
    document.getElementById('dropdownMenu').classList.remove('show');
    
    // Confirm logout
    if (confirm('Apakah Anda yakin ingin keluar?')) {
        // Clear localStorage
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        
        // Redirect to login page
        window.location.href = 'index.html';
    }
}
