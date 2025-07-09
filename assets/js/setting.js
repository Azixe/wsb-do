document.addEventListener('DOMContentLoaded', () => {
    const changePasswordForm = document.getElementById('changePasswordForm');

    changePasswordForm.addEventListener('submit', async (e) => {
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

       const kdPelanggan = localStorage.getItem('kd_pelanggan');
        if (!kdPelanggan) {
            alert('Anda belum login.');
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
            if (data.success) {
                alert('Password berhasil diubah!');
                changePasswordForm.reset();
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('Gagal mengubah password.');
        }
    });
});