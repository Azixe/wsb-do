// Cart Management
let cartItems = [];
let cartCount = 0;

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
    const existingItem = cartItems.find(item => item.name === product.name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartItems.push({
            ...product,
            quantity: 1
        });
    }
    
    cartCount++;
    updateCartBadge();
    
    // Show success feedback
    showCartNotification(`${product.name} ditambahkan ke keranjang!`);
}

function showCartNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        font-size: 14px;
        font-weight: 500;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function goToCheckout() {
    if (cartCount === 0) {
        alert('Keranjang Anda masih kosong!');
        return;
    }
    
    // For now, show cart summary
    let cartSummary = 'Keranjang Belanja:\n\n';
    let total = 0;
    
    cartItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        cartSummary += `${item.name}\n`;
        cartSummary += `${item.quantity}x - Rp${itemTotal.toLocaleString()}\n\n`;
        total += itemTotal;
    });
    
    cartSummary += `Total: Rp${total.toLocaleString()}`;
    
    if (confirm(cartSummary + '\n\nLanjut ke checkout?')) {
        // Implement checkout logic here
        alert('Fitur checkout akan segera hadir!');
    }
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
            card.innerHTML = `
                ${p.discount ? `<div class="discount">${p.discount}%</div>` : ''}
                <img src="${p.image}" alt="${p.name}">
                <h3>${p.name}</h3>
                ${p.originalPrice ? `<p class="old-price">Rp${p.originalPrice.toLocaleString()}</p>` : ''}
                <p class="price">Rp${p.price.toLocaleString()}</p>
                <button onclick="addToCart({name: '${p.name}', price: ${p.price}, image: '${p.image}'})">Tambah</button>
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
