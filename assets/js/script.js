// --- FUNGSI UTAMA ---

document.addEventListener('DOMContentLoaded', function () {
    // Cek jika kita berada di halaman login untuk menginisialisasi skripnya
    if (document.querySelector('.login-page')) {
        initLoginPage();
    }

    // Tambahkan efek fokus pada semua input form
    const inputs = document.querySelectorAll('.form-group input');
    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            this.parentElement.classList.add('focused');
            if (this.closest('.password-wrapper')) {
                this.closest('.form-group').classList.add('focused');
            }
        });

        input.addEventListener('blur', function () {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
                if (this.closest('.password-wrapper')) {
                    this.closest('.form-group').classList.remove('focused');
                }
            }
        });
    });

    // Tambahkan efek ripple pada semua tombol .login-btn
    const loginBtns = document.querySelectorAll('.login-btn');
    loginBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            createRipple(e, this);
        });
    });
});


/**
 * Inisialisasi semua event listener dan fungsionalitas untuk halaman login.
 */
function initLoginPage() {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Logika untuk Lupa Kata Sandi dihapus dari sini

    const loginCard = document.querySelector('.login-card');
    if (loginCard) {
        loginCard.classList.add('fade-in');
    }
}

// --- FUNGSI EVENT HANDLER ---

/**
 * Menangani proses submit form login.
 * @param {Event} e - Event object dari form submission.
 */
// Ganti fungsi handleLogin yang lama dengan yang ini
async function handleLogin(e) {
    e.preventDefault();

    if (!validateForm()) {
        shakeCard();
        return;
    }

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.querySelector('#loginForm .login-btn');

    hideMessage('loginError');
    setLoadingState(loginBtn, true);

    // Kirim data ke backend menggunakan fetch()
    try {
        const response = await fetch('http://localhost:3001/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }), // Kirim username dan password sebagai JSON
        });

        const data = await response.json(); // Baca respons dari server

        if (response.ok) { // Jika server merespons dengan status sukses (2xx)
            // Login berhasil
            localStorage.setItem('isLoggedIn', 'true');
            // Simpan nama dan nomor HP user
            localStorage.setItem('username', data.user.nama);
            localStorage.setItem('userPhone', username); // Simpan nomor HP yang digunakan login
            window.location.href = 'pages/dashboard.html';
        } else {
            // Jika server merespons dengan error (4xx atau 5xx)
            showMessage('loginError', data.message);
            setLoadingState(loginBtn, false);
            shakeCard();
        }

    } catch (error) {
        // Jika terjadi error jaringan (misal: server backend tidak jalan)
        console.error('Fetch error:', error);
        showMessage('loginError', 'Tidak bisa terhubung ke server. Coba lagi nanti.');
        setLoadingState(loginBtn, false);
        shakeCard();
    }
}

// --- FUNGSI handleForgotPassword, toggleOldPassword, dan toggleNewPassword telah dihapus ---


// --- FUNGSI TOGGLE & UI ---

function togglePassword() {
    togglePasswordVisibility('password', 'passwordIcon');
}

/**
 * Fungsi umum untuk mengubah visibilitas password.
 */
function togglePasswordVisibility(inputId, iconId) {
    const passwordInput = document.getElementById(inputId);
    const passwordIcon = document.getElementById(iconId);
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        passwordIcon.className = 'fas fa-eye';
    }
}

/**
 * Menampilkan pesan pada elemen tertentu.
 */
function showMessage(elementId, message) {
    const messageElement = document.getElementById(elementId);
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.classList.add('show');
    }
}

/**
 * Menyembunyikan elemen pesan.
 */
function hideMessage(elementId) {
    const messageElement = document.getElementById(elementId);
    if (messageElement) {
        messageElement.classList.remove('show');
    }
}

/**
 * Mengguncang kartu login untuk memberikan feedback error.
 */
function shakeCard() {
    const loginCard = document.querySelector('.login-card:not(.hidden)');
    if (loginCard) {
        loginCard.parentElement.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            loginCard.parentElement.style.animation = '';
        }, 500);
    }
}

/**
 * Mengatur status loading pada tombol.
 */
function setLoadingState(button, isLoading, text = "Masuk") {
    if (isLoading) {
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
        button.disabled = true;
    } else {
        button.innerHTML = `<i class="fas fa-sign-in-alt"></i> ${text}`;
        button.disabled = false;
    }
}

/**
 * Membuat efek ripple pada elemen yang diklik.
 */
function createRipple(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.position = 'absolute';
    ripple.style.background = 'rgba(255, 255, 255, 0.3)';
    ripple.style.borderRadius = '50%';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s linear';
    ripple.style.pointerEvents = 'none';

    element.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}


// --- FUNGSI VALIDASI ---
function validateForm() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username) {
        showMessage('loginError', 'No HP harus diisi!');
        document.getElementById('username').focus();
        return false;
    }
    if (!password) {
        showMessage('loginError', 'Kata sandi harus diisi!');
        document.getElementById('password').focus();
        return false;
    }
    if (password.length < 6) {
        showMessage('loginError', 'Kata sandi minimal 6 karakter!');
        document.getElementById('password').focus();
        return false;
    }
    return true;
}