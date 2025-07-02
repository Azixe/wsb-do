// Global variables
let sidebarOpen = false;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on login page
    if (document.querySelector('.login-page')) {
        initLoginPage();
    }
});

// Login Page Functions
function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const loginContainer = document.getElementById('loginContainer');
    const forgotPasswordContainer = document.getElementById('forgotPasswordContainer');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const backToLoginLink = document.getElementById('backToLoginLink');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            handleLogin(e);
            return false;
        });
    }
    
    // Handle forgot password form
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', function(event) {
            event.preventDefault();
            event.stopPropagation();
            
            const phoneNumber = document.getElementById('resetPhoneNumber').value;
            const oldPassword = document.getElementById('oldPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            
            // Clear previous messages
            hideMessage('forgotPasswordError');
            hideMessage('forgotPasswordSuccess');

            // Validasi password baru tidak sama dengan password lama
            if (oldPassword === newPassword) {
                showMessage('forgotPasswordError', 'Password baru harus berbeda dengan password lama!');
                return false;
            }

            // Validasi panjang password baru
            if (newPassword.length < 6) {
                showMessage('forgotPasswordError', 'Password baru minimal 6 karakter!');
                return false;
            }

            // Simulasi validasi dan penyimpanan
            showMessage('forgotPasswordSuccess', `Kata sandi untuk No. HP ${phoneNumber} telah berhasil diubah!`);

            // Setelah submit, kembali ke halaman login
            setTimeout(() => {
                forgotPasswordContainer.classList.add('hidden');
                loginContainer.classList.remove('hidden');
                this.reset(); // Mengosongkan form
                hideMessage('forgotPasswordError');
                hideMessage('forgotPasswordSuccess');
            }, 2000);
            
            return false;
        });
    }

    // Handle forgot password link click
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(event) {
            event.preventDefault();
            loginContainer.classList.add('hidden');
            forgotPasswordContainer.classList.remove('hidden');
        });
    }

    // Handle back to login link click
    if (backToLoginLink) {
        backToLoginLink.addEventListener('click', function(event) {
            event.preventDefault();
            forgotPasswordContainer.classList.add('hidden');
            loginContainer.classList.remove('hidden');
        });
    }
    
    // Add animation to login card
    const loginCard = document.querySelector('.login-card');
    if (loginCard) {
        loginCard.classList.add('fade-in');
    }
}

function handleLogin(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.querySelector('.login-btn');
    
    // Clear previous error messages
    hideMessage('loginError');
    
    // Simple validation (in real app, this would be server-side)
    if (username === 'admin' && password === 'admin123') {
        // Show loading state
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
        loginBtn.disabled = true;
        
        // Simulate login delay
        setTimeout(() => {
            // Store login state (in real app, use proper session management)
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', username);
            
            // Redirect to dashboard (you can change this URL as needed)
            window.location.href = 'dashboard.html';
        }, 1500);
    } else {
        // Reset button state if error
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Masuk';
        loginBtn.disabled = false;
        
        showMessage('loginError', 'Username atau password salah!');
        
        // Shake animation for error
        const loginCard = document.querySelector('.login-card');
        loginCard.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            loginCard.style.animation = '';
        }, 500);
    }
    
    return false;
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const passwordIcon = document.getElementById('passwordIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        passwordIcon.className = 'fas fa-eye';
    }
}

function toggleOldPassword() {
    const oldPasswordInput = document.getElementById('oldPassword');
    const oldPasswordIcon = document.getElementById('oldPasswordIcon');
    
    if (oldPasswordInput.type === 'password') {
        oldPasswordInput.type = 'text';
        oldPasswordIcon.className = 'fas fa-eye-slash';
    } else {
        oldPasswordInput.type = 'password';
        oldPasswordIcon.className = 'fas fa-eye';
    }
}

function toggleNewPassword() {
    const newPasswordInput = document.getElementById('newPassword');
    const newPasswordIcon = document.getElementById('newPasswordIcon');
    
    if (newPasswordInput.type === 'password') {
        newPasswordInput.type = 'text';
        newPasswordIcon.className = 'fas fa-eye-slash';
    } else {
        newPasswordInput.type = 'password';
        newPasswordIcon.className = 'fas fa-eye';
    }
}

// Utility Functions
function showMessage(elementId, message) {
    const messageElement = document.getElementById(elementId);
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.classList.add('show');
    }
}

function hideMessage(elementId) {
    const messageElement = document.getElementById(elementId);
    if (messageElement) {
        messageElement.classList.remove('show');
    }
}

// Form validation
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

// Add enter key support for login (improved)
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && document.querySelector('.login-page')) {
        e.preventDefault();
        e.stopPropagation();
        
        const loginForm = document.getElementById('loginForm');
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');
        
        // Check which form is visible
        if (loginForm && !loginForm.closest('.login-container').classList.contains('hidden')) {
            handleLogin(e);
        } else if (forgotPasswordForm && !forgotPasswordForm.closest('.login-container').classList.contains('hidden')) {
            forgotPasswordForm.dispatchEvent(new Event('submit'));
        }
        
        return false;
    }
});

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Add focus effects to form inputs
    const inputs = document.querySelectorAll('.form-group input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
    });
    
    // Add ripple effect to login button
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    }
});

// Add CSS for ripple animation and hidden class
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .form-group.focused label {
        color: #667eea;
    }
    
    .hidden {
        display: none !important;
    }
    
    .password-wrapper {
        position: relative;
    }
    
    .password-wrapper .password-toggle {
        position: absolute;
        right: 15px;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;
        color: #666;
        transition: color 0.3s ease;
    }
    
    .password-wrapper .password-toggle:hover {
        color: #667eea;
    }
`;
document.head.appendChild(style);