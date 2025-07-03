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
            // Jika di dalam .password-wrapper, tambahkan 'focused' ke parent .form-group juga
            if (this.closest('.password-wrapper')) {
                this.closest('.form-group').classList.add('focused');
            }
        });

        input.addEventListener('blur', function () {
            // Hapus 'focused' jika input kosong
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
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const loginContainer = document.getElementById('loginContainer');
    const forgotPasswordContainer = document.getElementById('forgotPasswordContainer');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const backToLoginLink = document.getElementById('backToLoginLink');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function (event) {
            event.preventDefault();
            loginContainer.classList.add('hidden');
            forgotPasswordContainer.classList.remove('hidden');
        });
    }

    if (backToLoginLink) {
        backToLoginLink.addEventListener('click', function (event) {
            event.preventDefault();
            forgotPasswordContainer.classList.add('hidden');
            loginContainer.classList.remove('hidden');
        });
    }

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
function handleLogin(e) {
    e.preventDefault();

    // 1. Validasi input dari sisi klien terlebih dahulu
    if (!validateForm()) {
        shakeCard();
        return; // Hentikan proses jika form tidak valid
    }

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.querySelector('#loginForm .login-btn');

    hideMessage('loginError');
    setLoadingState(loginBtn, true);

    // 🚨 PERINGATAN KEAMANAN: Bagian ini hanya untuk demonstrasi!
    // Di aplikasi nyata, Anda HARUS mengirim data ini ke server (backend)
    // menggunakan fetch() dan memvalidasinya di sana.
    // JANGAN PERNAH menyimpan kredensial di kode frontend.
    setTimeout(() => {
        if (username === 'admin' && password === 'admin123') {
            // 🚨 PERINGATAN KEAMANAN: localStorage tidak aman untuk token sesi
            // karena rentan terhadap serangan XSS. Di aplikasi nyata,
            // gunakan HttpOnly cookie yang diatur oleh server.
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', username);

            // Arahkan ke dashboard setelah berhasil
            window.location.href = 'dashboard.html';
        } else {
            showMessage('loginError', 'No HP atau Kata Sandi salah!');
            setLoadingState(loginBtn, false); // Kembalikan tombol ke keadaan semula
            shakeCard(); // Beri efek gemetar untuk menandakan error
        }
    }, 1500); // Simulasi waktu tunggu respons server
}

/**
 * Menangani proses submit form lupa kata sandi.
 * @param {Event} e - Event object dari form submission.
 */
function handleForgotPassword(e) {
    e.preventDefault();

    const phoneNumber = document.getElementById('resetPhoneNumber').value;
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const submitBtn = document.querySelector('#forgotPasswordForm .login-btn');

    hideMessage('forgotPasswordError');
    hideMessage('forgotPasswordSuccess');

    if (oldPassword === newPassword) {
        showMessage('forgotPasswordError', 'Password baru harus berbeda dari password lama!');
        return;
    }
    if (newPassword.length < 6) {
        showMessage('forgotPasswordError', 'Password baru minimal 6 karakter!');
        return;
    }

    setLoadingState(submitBtn, true, "Menyimpan...");

    // Simulasi proses reset password di server
    setTimeout(() => {
        showMessage('forgotPasswordSuccess', `Kata sandi untuk No. HP ${phoneNumber} telah berhasil diubah!`);
        setLoadingState(submitBtn, false, "Simpan Kata Sandi Baru");

        // Kembali ke halaman login setelah beberapa saat
        setTimeout(() => {
            document.getElementById('backToLoginLink').click();
            e.target.reset(); // Kosongkan form setelah berhasil
            hideMessage('forgotPasswordError');
            hideMessage('forgotPasswordSuccess');
        }, 2000);

    }, 1500);
}


// --- FUNGSI TOGGLE & UI ---

function togglePassword() {
    togglePasswordVisibility('password', 'passwordIcon');
}

function toggleOldPassword() {
    togglePasswordVisibility('oldPassword', 'oldPasswordIcon');
}

function toggleNewPassword() {
    togglePasswordVisibility('newPassword', 'newPasswordIcon');
}

/**
 * Fungsi umum untuk mengubah visibilitas password.
 * @param {string} inputId - ID dari elemen input password.
 * @param {string} iconId - ID dari elemen ikon mata.
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
 * @param {string} elementId - ID dari elemen pesan.
 * @param {string} message - Teks pesan yang akan ditampilkan.
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
 * @param {string} elementId - ID dari elemen pesan.
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
 * @param {HTMLElement} button - Elemen tombol.
 * @param {boolean} isLoading - Apakah status loading aktif.
 * @param {string} [text="Masuk"] - Teks default tombol.
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
 * @param {Event} event - Event object.
 * @param {HTMLElement} element - Elemen yang akan diberi efek.
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

/**
 * Memvalidasi form login utama.
 * @returns {boolean} - True jika valid, false jika tidak.
 */
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