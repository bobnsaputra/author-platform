import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Book } from '../types/book'

export default function LandingPage() {
  const navigate = useNavigate()
  const [books, setBooks] = useState<Book[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setBooks(data || []))
  }, [])

  const carouselBooks = books.filter(b => b.cover_image_url)

  const startAutoSlide = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (carouselBooks.length <= 1) return
    timerRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % carouselBooks.length)
    }, 4000)
  }, [carouselBooks.length])

  useEffect(() => {
    startAutoSlide()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [startAutoSlide])

  const goToSlide = (i: number) => {
    setCurrentSlide(i)
    startAutoSlide()
  }

  const bestSellers = books
    .filter(b => (b.sales_count ?? 0) > 0)
    .sort((a, b) => (b.sales_count ?? 0) - (a.sales_count ?? 0))
  const latestBooks = books.slice(0, 8)

  const suggestions = searchQuery.trim().length >= 2
    ? books.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 6)
    : []

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="landing">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-header-inner">
          <div className="landing-brand">
            <div className="landing-icon">PJ</div>
            <span className="landing-name">CV. Pionir Jaya</span>
          </div>
          <div className="landing-search" ref={searchRef}>
            <input
              type="text"
              placeholder="Cari buku..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true) }}
              onFocus={() => setShowSuggestions(true)}
              className="landing-search-input"
            />
            <span className="landing-search-icon">🔍</span>
            {showSuggestions && suggestions.length > 0 && (
              <ul className="landing-search-dropdown">
                {suggestions.map(b => (
                  <li key={b.id} onClick={() => { setShowSuggestions(false); setSearchQuery(''); navigate(`/book/${b.id}`) }}>
                    {b.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Link to="/login" className="landing-login-btn">Masuk</Link>
        </div>
      </header>

      {/* Hero fallback when no books */}
      {carouselBooks.length === 0 && (
        <section className="landing-hero">
          <div className="landing-hero-inner">
            <h1>Penerbitan &amp; Percetakan<br />Terpercaya</h1>
            <p className="landing-hero-sub">
              Menerbitkan karya-karya berkualitas untuk pembaca Indonesia.
              Dari naskah hingga buku jadi — kami siap menjadi mitra penerbitan Anda.
            </p>
            <div className="landing-hero-actions">
              <Link to="/login" className="landing-btn-primary">Masuk</Link>
              <Link to="/register" className="landing-btn-secondary">Buat Akun</Link>
            </div>
          </div>
        </section>
      )}

      {/* Slideshow */}
      {carouselBooks.length > 0 && (
        <section className="slideshow">
          <div className="slideshow-inner">
            {carouselBooks.length > 1 && (
              <button className="slideshow-arrow slideshow-prev" onClick={() => goToSlide((currentSlide - 1 + carouselBooks.length) % carouselBooks.length)} aria-label="Previous">‹</button>
            )}
            <div className="slideshow-stage">
              <div className="slideshow-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {carouselBooks.map(b => (
                  <div key={b.id} className="slideshow-slide" onClick={() => navigate(`/book/${b.id}`)}>
                    <div className="slideshow-cover">
                      <img src={b.cover_image_url!} alt={b.title} />
                    </div>
                    <div className="slideshow-info">
                      <h2>{b.title}</h2>
                      {b.subtitle && <p className="slideshow-subtitle">{b.subtitle}</p>}
                      <p className="slideshow-author">oleh {b.author_name}</p>
                      {b.genre && <span className="slideshow-genre">{b.genre}</span>}
                      {b.description && <p className="slideshow-desc">{b.description.length > 150 ? b.description.slice(0, 150) + '…' : b.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {carouselBooks.length > 1 && (
              <button className="slideshow-arrow slideshow-next" onClick={() => goToSlide((currentSlide + 1) % carouselBooks.length)} aria-label="Next">›</button>
            )}
          </div>
          {carouselBooks.length > 1 && (
            <div className="slideshow-dots">
              {carouselBooks.map((_, i) => (
                <button
                  key={i}
                  className={`slideshow-dot${i === currentSlide ? ' active' : ''}`}
                  onClick={() => goToSlide(i)}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Best Sellers */}
      <section className="landing-section">
        <div className="landing-section-inner">
          <h2 className="landing-section-title">🏆 Buku Terlaris</h2>
          {bestSellers.length === 0 ? (
            <p className="landing-section-empty">Belum ada buku terlaris.</p>
          ) : (
            <div className="landing-book-grid">
              {bestSellers.slice(0, 8).map(b => (
                <div key={b.id} className="landing-book-card">
                  {b.cover_image_url
                    ? <img src={b.cover_image_url} alt={b.title} className="landing-book-cover" />
                    : <div className="landing-book-cover-placeholder">📖</div>
                  }
                  <div className="landing-book-info">
                    <h4>{b.title}</h4>
                    <p>{b.author_name}</p>
                    {b.genre && <span className="landing-book-genre">{b.genre}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest Books */}
      <section className="landing-section landing-section-alt">
        <div className="landing-section-inner">
          <h2 className="landing-section-title">📚 Buku Terbaru</h2>
          {latestBooks.length === 0 ? (
            <p className="landing-section-empty">Belum ada buku terbaru.</p>
          ) : (
            <div className="landing-book-grid">
              {latestBooks.map(b => (
                <div key={b.id} className="landing-book-card">
                  {b.cover_image_url
                    ? <img src={b.cover_image_url} alt={b.title} className="landing-book-cover" />
                    : <div className="landing-book-cover-placeholder">📖</div>
                  }
                  <div className="landing-book-info">
                    <h4>{b.title}</h4>
                    <p>{b.author_name}</p>
                    {b.genre && <span className="landing-book-genre">{b.genre}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-col">
            <h4>CV. Pionir Jaya</h4>
            <p>Penerbitan dan Percetakan terpercaya untuk penulis Indonesia.</p>
          </div>
          <div className="landing-footer-col">
            <h4>Kontak</h4>
            <ul>
              <li>📞 <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer">0812-3456-7890</a></li>
              <li>📧 info@pionirjaya.com</li>
            </ul>
          </div>
          <div className="landing-footer-col">
            <h4>Toko Online</h4>
            <ul>
              <li>🟢 <a href="https://tokopedia.com" target="_blank" rel="noopener noreferrer">Tokopedia</a></li>
              <li>🟠 <a href="https://shopee.co.id" target="_blank" rel="noopener noreferrer">Shopee</a></li>
            </ul>
          </div>
        </div>
        <div className="landing-footer-bottom">
          <p>&copy; {new Date().getFullYear()} CV. Pionir Jaya — Penerbitan dan Percetakan</p>
        </div>
      </footer>
    </div>
  )
}
