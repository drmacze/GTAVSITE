# GTAV / iOS

Website komunitas GTA V Port dengan tema gelap dan aksen hijau limau. Dibangun dengan HTML, CSS, dan JavaScript tanpa dependensi build.

## Menjalankan

Jalankan `python3 -m http.server 8080 --directory dist`, lalu buka `http://localhost:8080`.

## Fitur

- Layout responsif untuk desktop, tablet, dan iPhone.
- Galeri launcher dengan empat tab, navigasi keyboard, dan dialog gambar layar penuh.
- Checklist persiapan instalasi dan FAQ.
- Screenshot lokal yang diberikan pengguna.
- Tautan sumber proyek Five Star Port, tanpa menghosting IPA atau berkas game.

## Struktur

- `dist/index.html`: halaman dan konten.
- `dist/styles.css`: gaya responsif dan aksesibilitas.
- `dist/app.js`: interaksi galeri, menu, dialog, dan checklist.
- `dist/assets/`: screenshot pengguna.
- `.openai/hosting.json`: konfigurasi deployment Sites.

## Catatan

Website ini tidak menjalankan GTA V di browser dan tidak mendeteksi perangkat atau berkas game. Label FPS dan informasi perangkat pada screenshot bukan hasil benchmark website. Proyek tidak berafiliasi dengan Rockstar Games atau Take-Two Interactive.

Panduan eksternal: https://fivestarport.site/
