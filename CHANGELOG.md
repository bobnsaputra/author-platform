# Changelog

## [0.3.0] — 2026-04-16

### Changed
- **Bahasa Indonesia**: Seluruh teks UI dialihbahasakan ke Bahasa Indonesia (label, tombol, pesan, panel, konfirmasi hapus)
- **Form tersembunyi by default**: Halaman utama kini hanya menampilkan Daftar Buku; form muncul hanya saat klik "Tambah Buku" atau "Edit"
- **Tombol "+ Tambah Buku"**: Ditampilkan di header Daftar Buku; tersembunyi saat form sedang terbuka
- **Setelah simpan/batal**: Form otomatis tertutup dan kembali ke tampilan daftar

## [0.2.0] — 2026-04-16

### Changed
- **3-column dashboard layout**: Left panel = Catalogue, Center = form + book list, Right panel = Best Sellers / Upcoming / Contacts / Online Shop
- **Left panel — Catalogue**: Lists all books with cover thumbnail, author, and genre badge; clicking a book loads it into the edit form with active highlight
- **Right panel**: Contains Best Sellers, Soon to be Published, Contacts, and Online Shop Directory cards
- **Genre field**: Changed from free-text input to a `<select>` dropdown with 20 preset genre options
- **Theme color**: Switched from amber/brown to purple (`#7c3aed` / `#8b5cf6`) across buttons, tags, focus rings, and auth accents
- **Topbar**: Dark slate gradient background (`#1e293b → #334155`); gold-accented logo icon; simplified to brand icon + app name/tagline + Sign Out only
- **Topbar alignment**: Brand and Sign Out button now constrained to same `max-width` + padding container as the 3-column panels so they align on all screen sizes
- **Auth pages**: Card-logo branding (icon + app name) added to Login and Register pages
- **Google Fonts**: Inter (UI) + Playfair Display (headings) loaded via `index.html`

## [0.1.0] — 2026-04-16

### Added
- Vite + React + TypeScript project scaffold
- Supabase client setup via `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- Supabase Auth integration with `AuthContext` provider
- Login page (`/login`) with email/password
- Register page (`/register`) with password confirmation and link back to login
- Protected routes — redirects unauthenticated users to `/login`
- Book management page (`/`) with full CRUD (add, edit, delete)
- Book form layout: cover photo on left, fields on right (matches wireframe)
- Word counter on synopsis/description field (max 100 words, turns red if over)
- Sign out button in top bar

### Book Fields
- Judul Buku (title) — required
- Subtitle
- Pengarang (author name) — required
- Genre
- Ukuran Buku: lebar × tinggi (width × height in cm)
- Jumlah Halaman (page count)
- Deskripsi / Synopsis (max 100 words)
- ISBN
- Publisher
- Tanggal Terbit (publication date)
- Bahasa (language)
- Foto Cover (cover photo — uploaded to Supabase Storage `book-covers` bucket)
- Tokopedia link
- Shopee link
- WhatsApp number
- Link Penjualan (sales link)

### Database (`supabase/schema.sql`)
- `public.books` table with all fields above
- Row Level Security (RLS) — each user can only access their own books
- Supabase Storage bucket `book-covers` with public read / authenticated upload policies
- Schema is re-runnable (uses `drop table if exists` and `drop policy if exists`)

### Config
- Dev server runs on port `5174` (not default 5173)
- `.env` excluded from git
