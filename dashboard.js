document.addEventListener('DOMContentLoaded', () => {
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
        <button>Tambah</button>
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

function logout() {
    alert('Logout berhasil!');
    window.location.href = 'index.html'; // atau arahkan ke halaman login kamu
}
