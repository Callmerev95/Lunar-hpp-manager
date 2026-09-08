# DESIGN.md — HPP Manager

Direction ini disusun dari jawaban pemilik produk. Aplikasi: kalkulator HPP (harga pokok produksi) bahan makanan dan kue, untuk penjual rumahan.

## Identity

- **Produk**: HPP Manager
- **Kepribadian**: jutek dapur rumahan: hangat, handmade, dekat dengan dapur dan resep keluarga. Bukan korporat, bukan "tech".
- **Audience**: satu pemakai, penjual kue rumahan yang ingin tahu berapa sebenarnya biaya membuat satu porsi.

## Personality

- Hangat dan ramah, tapi tidak lucu-lucuan: ini tool hitung angka, bukan kartun.
- Berkarakter artisanal namun tetap fokus fungsi. Angka harus terbaca jelas, bukan didandani.

## Palette

- Warna dasar: krem hangat (warna adonan/karamel/roti panggang) sebagai kanvas.
- Aksen: coklat tua untuk teks penting dan elemen utama.
- Netral: krem muda untuk permukaan kartu, krem lebih gelap untuk garis dan bayangan tipis.
- Angka dan nilai uang memakai satu aksen tegas (mis. coklat tua/kaki) supaya lompat ke mata.
- Tanpa neon, tanpa purple gradient, tanpa glow. Maksimal 2-3 core colors + 1 accent (R-29).

## Typography

- Judul: serif hangat (kelas Fraunces/Playfair: karakter adonan yang organik). Dipakai untuk nama resep, nama bahan, angka besar HPP.
- Body: sans bersih untuk tabel, form, dan angka rutin. Keterbacaan pertama.
- Angka uang: tabular (lining) numerals supaya kolom angka rata.
- Alasan: serif judul memberi identitas artisanal, sans body menjaga tabel angka tetap terbaca.

## Mood

- Tenang dan bersih. Ruang kosong sebagai struktur (R-05 RHYTHM guard).
- Tidak ramai: satu fokus utama per layar. Di halaman resep fokusnya panel hasil HPP, bukan daftar input.

## Dials

- **ENERGY 2** (tegas, profesional tapi hangat; bukan teriakan)
- **RHYTHM 2** (konsisten dengan beberapa jeda)
- **MOTION 1** (hanya hover state dan transisi halus, tanpa scroll-reveal atau parallax)

## Design Read

> Reading this as: personal finance tool for a home baker, warm-kitchen visual language, dial ENERGY 2 / RHYTHM 2 / MOTION 1.

## Identity motif

- Satu motif berulang: satuan dapur sebagai token visual yang konsisten. Contoh: setiap bahan ditampilkan dengan satuan aslinya (g, ml, butir, box) yang tersusun rapi di kolom, dan angka HPP besar dalam serif sebagai "penanda dapur". Motif diperkuat oleh palet krem-karamel di seluruh halaman.

## Notes (batasan)

- Draft ini berdasar jawaban pemilik; bukan ditulis AI, bukan template.
- Logo: belum ditentukan. Pakai placeholder teks nama produk sampai pemilik memutuskan (R-23).