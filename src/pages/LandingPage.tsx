import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-header-inner">
          <div className="landing-brand">
            <div className="landing-icon">PJ</div>
            <span className="landing-name">CV. Pionir Jaya</span>
          </div>
          <Link to="/login" className="landing-login-btn">Masuk</Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-inner">
          <h1>Penerbitan &amp; Percetakan<br />Terpercaya</h1>
          <p className="landing-hero-sub">
            Menerbitkan karya-karya berkualitas untuk pembaca Indonesia.
            Dari naskah hingga buku jadi — kami siap menjadi mitra penerbitan Anda.
          </p>
          <div className="landing-hero-actions">
            <Link to="/login" className="landing-btn-primary">Masuk ke Dashboard</Link>
            <Link to="/register" className="landing-btn-secondary">Buat Akun</Link>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <div className="landing-features-inner">
          <div className="landing-feature">
            <span className="landing-feature-icon">📚</span>
            <h3>Kelola Katalog</h3>
            <p>Atur semua data buku dalam satu platform — judul, penulis, ISBN, cover, dan lainnya.</p>
          </div>
          <div className="landing-feature">
            <span className="landing-feature-icon">🛒</span>
            <h3>Toko Online</h3>
            <p>Hubungkan buku dengan link Tokopedia, Shopee, dan WhatsApp untuk penjualan langsung.</p>
          </div>
          <div className="landing-feature">
            <span className="landing-feature-icon">📊</span>
            <h3>Pantau Penerbitan</h3>
            <p>Lihat buku terlaris, segera terbit, dan kontak penulis dalam satu tampilan dashboard.</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} CV. Pionir Jaya — Penerbitan dan Percetakan</p>
      </footer>
    </div>
  )
}
