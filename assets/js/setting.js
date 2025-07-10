document.addEventListener('DOMContentLoaded', () => {
    const changePasswordForm = document.getElementById('changePasswordForm');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    // Add password strength indicator
    addPasswordStrengthIndicator();
    
    // Add real-time validation
    addRealTimeValidation();

    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const oldPassword = document.getElementById('oldPassword').value;
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Enhanced validation
        if (!oldPassword || !newPassword || !confirmPassword) {
            showAlert('Semua kolom harus diisi.', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showAlert('Kata sandi baru minimal 6 karakter.', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showAlert('Konfirmasi kata sandi baru tidak cocok.', 'error');
            return;
        }

        if (oldPassword === newPassword) {
            showAlert('Kata sandi baru tidak boleh sama dengan kata sandi lama.', 'error');
            return;
        }

        // Show loading state
        showLoadingState(true);

        const kdPelanggan = localStorage.getItem('kd_pelanggan');
        if (!kdPelanggan) {
            showAlert('Anda belum login.', 'error');
            showLoadingState(false);
            return;
        }

        try {
            const res = await fetch('http://localhost:3001/api/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    kd_pelanggan: kdPelanggan,
                    oldPassword,
                    newPassword
                })
            });

            const data = await res.json();
            showLoadingState(false);
            
            if (data.success) {
                showAlert('Password berhasil diubah!', 'success');
                changePasswordForm.reset();
                // Remove password strength indicator
                const strengthIndicator = document.querySelector('.password-strength');
                if (strengthIndicator) {
                    strengthIndicator.classList.remove('visible');
                }
            } else {
                showAlert(data.message, 'error');
            }
        } catch (error) {
            showLoadingState(false);
            showAlert('Gagal mengubah password. Periksa koneksi internet Anda.', 'error');
        }
    });
    
    function addPasswordStrengthIndicator() {
        const passwordGroup = newPasswordInput.parentElement;
        const strengthIndicator = document.createElement('div');
        strengthIndicator.className = 'password-strength';
        strengthIndicator.innerHTML = '<div class="password-strength-bar"></div>';
        passwordGroup.appendChild(strengthIndicator);
        
        newPasswordInput.addEventListener('input', (e) => {
            const password = e.target.value;
            const strength = calculatePasswordStrength(password);
            const bar = strengthIndicator.querySelector('.password-strength-bar');
            
            if (password.length > 0) {
                strengthIndicator.classList.add('visible');
                bar.style.width = `${strength}%`;
            } else {
                strengthIndicator.classList.remove('visible');
            }
        });
    }
    
    function addRealTimeValidation() {
        confirmPasswordInput.addEventListener('input', (e) => {
            const confirmPassword = e.target.value;
            const newPassword = newPasswordInput.value;
            
            if (confirmPassword.length > 0) {
                if (confirmPassword === newPassword) {
                    e.target.style.borderColor = '#10b981';
                } else {
                    e.target.style.borderColor = '#ef4444';
                }
            } else {
                e.target.style.borderColor = '#e5e7eb';
            }
        });
    }
    
    function calculatePasswordStrength(password) {
        let strength = 0;
        if (password.length >= 6) strength += 25;
        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        return strength;
    }
    
    function showAlert(message, type = 'info') {
        // Remove existing alerts
        const existingAlert = document.querySelector('.custom-alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        const alert = document.createElement('div');
        alert.className = `custom-alert alert-${type}`;
        alert.innerHTML = `
            <div class="alert-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
                <button class="alert-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(alert);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alert.parentElement) {
                alert.remove();
            }
        }, 5000);
        
        // Close button
        alert.querySelector('.alert-close').addEventListener('click', () => {
            alert.remove();
        });
        
        // Show animation
        setTimeout(() => alert.classList.add('show'), 10);
    }
    
    function showLoadingState(isLoading) {
        const submitBtn = document.querySelector('.save-btn');
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '⏳ Menyimpan...';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '💾 Simpan Perubahan';
        }
    }
});