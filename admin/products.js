document.addEventListener('DOMContentLoaded', () => {
    const productSelect = document.getElementById('productSelect');
    const imageFile = document.getElementById('imageFile');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const uploadPlaceholder = fileUploadArea.querySelector('.upload-placeholder');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const uploadForm = document.getElementById('uploadForm');
    const uploadBtn = document.getElementById('uploadBtn');
    const deleteCurrentBtn = document.getElementById('deleteCurrentBtn');

    // Initialize
    loadProductsForSelect();

    // Event Listeners
    imageFile.addEventListener('change', handleFileSelect);
    uploadForm.addEventListener('submit', handleUpload);
    deleteCurrentBtn.addEventListener('click', handleDeleteCurrent);
    productSelect.addEventListener('change', handleProductSelection);

    // Drag and drop
    fileUploadArea.addEventListener('dragover', handleDragOver);
    fileUploadArea.addEventListener('dragleave', handleDragLeave);
    fileUploadArea.addEventListener('drop', handleDrop);

    async function loadProductsForSelect() {
        try {
            const response = await fetch('http://localhost:3001/api/admin/products/all');
            if (!response.ok) throw new Error('Gagal mengambil data produk');
            
            const products = await response.json();
            productSelect.innerHTML = '<option value="">-- Pilih Produk --</option>';
            
            products.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = `${product.nama_produk} - Rp${product.harga.toLocaleString('id-ID')}`;
                productSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading products:', error);
            alert('Gagal memuat daftar produk');
        }
    }

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            validateAndPreviewFile(file);
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        fileUploadArea.classList.add('dragover');
    }

    function handleDragLeave(e) {
        e.preventDefault();
        fileUploadArea.classList.remove('dragover');
    }

    function handleDrop(e) {
        e.preventDefault();
        fileUploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            imageFile.files = files;
            validateAndPreviewFile(file);
        }
    }

    function validateAndPreviewFile(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Harap pilih file gambar yang valid (JPG, PNG, GIF)');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran file terlalu besar. Maksimal 5MB');
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            uploadPlaceholder.classList.add('hidden');
            imagePreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }

    async function handleUpload(e) {
        e.preventDefault();

        const productId = productSelect.value;
        const file = imageFile.files[0];

        if (!productId || !file) {
            alert('Harap pilih produk dan gambar');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);
        formData.append('productId', productId);

        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

        try {
            const response = await fetch('http://localhost:3001/api/products/upload-image', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Gagal upload gambar');
            }

            const result = await response.json();
            alert('Gambar berhasil diupload!');
            
            // Reset form
            uploadForm.reset();
            uploadPlaceholder.classList.remove('hidden');
            imagePreview.classList.add('hidden');
            previewImg.src = '';
            
        } catch (error) {
            console.error('Upload error:', error);
            alert('Error: ' + error.message);
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Gambar';
        }
    }

    async function handleProductSelection() {
        const selectedProductId = productSelect.value;
        
        if (!selectedProductId) {
            deleteCurrentBtn.classList.add('hidden');
            return;
        }

        try {
            // Check if the selected product has an image
            const response = await fetch(`http://localhost:3001/api/admin/products/all`);
            if (!response.ok) throw new Error('Gagal mengambil data produk');
            
            const products = await response.json();
            const selectedProduct = products.find(p => p.id === selectedProductId);
            
            // Show delete button only if product has an image
            if (selectedProduct && await checkProductHasImage(selectedProductId)) {
                deleteCurrentBtn.classList.remove('hidden');
            } else {
                deleteCurrentBtn.classList.add('hidden');
            }
        } catch (error) {
            console.error('Error checking product image:', error);
            deleteCurrentBtn.classList.add('hidden');
        }
    }

    async function checkProductHasImage(productId) {
        try {
            const response = await fetch(`http://localhost:3001/api/products/${productId}/image`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async function handleDeleteCurrent() {
        const selectedProductId = productSelect.value;
        
        if (!selectedProductId) {
            alert('Harap pilih produk terlebih dahulu');
            return;
        }

        if (!confirm('Apakah Anda yakin ingin menghapus gambar produk ini?')) {
            return;
        }

        deleteCurrentBtn.disabled = true;
        deleteCurrentBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menghapus...';

        try {
            const response = await fetch(`http://localhost:3001/api/products/${selectedProductId}/image`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Gagal menghapus gambar');
            }

            alert('Gambar berhasil dihapus!');
            deleteCurrentBtn.classList.add('hidden');
            
        } catch (error) {
            console.error('Delete error:', error);
            alert('Error: ' + error.message);
        } finally {
            deleteCurrentBtn.disabled = false;
            deleteCurrentBtn.innerHTML = '<i class="fas fa-trash"></i> Hapus Gambar Saat Ini';
        }
    }
});
