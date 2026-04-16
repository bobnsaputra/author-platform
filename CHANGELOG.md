# Changelog

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
