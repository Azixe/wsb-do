document.addEventListener('DOMContentLoaded', () => {
    const changePasswordForm = document.getElementById('changePasswordForm');

    changePasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const oldPassword = document.getElementById('oldPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validasi Sederhana
        if (!oldPassword || !newPassword || !confirmPassword) {
            alert('Semua kolom harus diisi.');
            return;
        }

        if (newPassword.length < 6) {
            alert('Kata sandi baru minimal 6 karakter.');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('Konfirmasi kata sandi baru tidak cocok.');
            return;
        }

        if (oldPassword === newPassword) {
            alert('Kata sandi baru tidak boleh sama dengan kata sandi lama.');
            return;
        }

        // --- Simulasi Validasi Backend ---
        // Di aplikasi nyata, Anda akan mengirim `oldPassword` ke server untuk divalidasi.
        // Untuk sekarang, kita anggap password lama yang benar adalah 'admin123'.
        if (oldPassword !== 'admin123') {
            alert('Kata sandi lama salah!');
            return;
        }

        // Jika semua validasi lolos
        alert('Kata sandi berhasil diubah! (Ini adalah simulasi, password login Anda tetap admin123)');
        changePasswordForm.reset(); // Mengosongkan form
    });
});