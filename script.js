document.addEventListener('DOMContentLoaded', function () {

    // (Kode Anda yang lain tetap di sini...)

    // --- Tambahkan atau modifikasi kode di bawah ini ---

    // Ambil elemen-elemen baru dari DOM
    const loginContainer = document.getElementById('loginContainer');
    const forgotPasswordContainer = document.getElementById('forgotPasswordContainer');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const backToLoginLink = document.getElementById('backToLoginLink');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');

    // FUNGSI BARU untuk toggle password di form "Sandi Baru"
    window.toggleNewPassword = function () {
        const passwordInput = document.getElementById('newPassword');
        const passwordIcon = document.getElementById('newPasswordIcon');
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            passwordIcon.classList.remove('fa-eye');
            passwordIcon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            passwordIcon.classList.remove('fa-eye-slash');
            passwordIcon.classList.add('fa-eye');
        }
    };

    // (Fungsi togglePassword() untuk login tetap ada)
    window.togglePassword = function () {
        // ... kode fungsi toggle password lama tidak perlu diubah
    };

    // Event listener untuk link "Lupa Kata Sandi?"
    forgotPasswordLink.addEventListener('click', function (event) {
        event.preventDefault();
        loginContainer.classList.add('hidden');
        forgotPasswordContainer.classList.remove('hidden');
    });

    // Event listener untuk link "Kembali ke Login"
    backToLoginLink.addEventListener('click', function (event) {
        event.preventDefault();
        forgotPasswordContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
    });

    // Event listener untuk form lupa kata sandi (diperbarui)
    forgotPasswordForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const phoneNumber = document.getElementById('resetPhoneNumber').value;
        const newPassword = document.getElementById('newPassword').value;

        // Simulasi validasi dan penyimpanan
        alert(`Kata sandi untuk No. HP ${phoneNumber} telah berhasil diubah! (simulasi)`);

        // Setelah submit, kembali ke halaman login
        forgotPasswordContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
        this.reset(); // Mengosongkan form
    });
});