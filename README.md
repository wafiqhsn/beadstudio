# Beads Studio

Website statis mandiri. Tidak perlu npm, build, API key, atau login ChatGPT.

## Upload ke GitHub Pages
1. Ekstrak ZIP ini terlebih dahulu.
2. Buat repository GitHub, lalu upload semua file hasil ekstrak ke root repository (bukan ZIP-nya).
3. Pastikan index.html, style.css, dan app.js ada pada folder yang sama.
4. Di Settings > Pages, pilih Deploy from a branch, branch main, folder / (root), lalu Save.
5. Buka alamat GitHub Pages yang ditampilkan setelah deploy selesai.

## Jalankan di komputer
Buka index.html di browser modern. Atau jalankan python3 -m http.server 8000 dari folder ini dan buka http://localhost:8000.

## Catatan
- Semua rendering, edit, dan export PNG berjalan di browser.
- Font Google memerlukan internet; tersedia font pengganti jika offline.
- Palette dan pilihan tema disimpan pada browser pengguna.
- Desain bracelet belum disimpan otomatis saat halaman di-refresh.
- Source ini adalah versi 30 dari Beads Studio, termasuk export poster dan color picker native.
