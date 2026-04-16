import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Book } from '../types/book'

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setBook(data)
        setLoading(false)
      })
  }, [id])

  if (loading) return <div className="page-center"><p>Memuat...</p></div>
  if (!book) return <div className="page-center"><p>Buku tidak ditemukan.</p><Link to="/">← Kembali</Link></div>

  return (
    <div className="book-detail">
      <header className="landing-header">
        <div className="landing-header-inner">
          <div className="landing-brand">
            <Link to="/" className="landing-icon" style={{ textDecoration: 'none' }}>PJ</Link>
            <Link to="/" className="landing-name" style={{ textDecoration: 'none', color: 'inherit' }}>CV. Pionir Jaya</Link>
          </div>
          <Link to="/login" className="landing-login-btn">Masuk</Link>
        </div>
      </header>

      <div className="detail-content">
        <Link to="/" className="detail-back">← Kembali</Link>

        <div className="detail-layout">
          <div className="detail-cover">
            {book.cover_image_url
              ? <img src={book.cover_image_url} alt={book.title} />
              : <div className="detail-cover-placeholder">📖</div>
            }
          </div>

          <div className="detail-info">
            <h1>{book.title}</h1>
            {book.subtitle && <p className="detail-subtitle">{book.subtitle}</p>}
            <p className="detail-author">oleh <strong>{book.author_name}</strong></p>

            <div className="detail-meta-grid">
              {book.isbn && (
                <div className="detail-meta-item">
                  <span className="detail-meta-label">ISBN</span>
                  <span>{book.isbn}</span>
                </div>
              )}
              {book.publisher && (
                <div className="detail-meta-item">
                  <span className="detail-meta-label">Penerbit</span>
                  <span>{book.publisher}</span>
                </div>
              )}
              {book.publication_date && (
                <div className="detail-meta-item">
                  <span className="detail-meta-label">Tanggal Terbit</span>
                  <span>{book.publication_date}</span>
                </div>
              )}
              {book.page_count && (
                <div className="detail-meta-item">
                  <span className="detail-meta-label">Halaman</span>
                  <span>{book.page_count}</span>
                </div>
              )}
              {book.language && (
                <div className="detail-meta-item">
                  <span className="detail-meta-label">Bahasa</span>
                  <span>{book.language}</span>
                </div>
              )}
              {book.genre && (
                <div className="detail-meta-item">
                  <span className="detail-meta-label">Genre</span>
                  <span>{book.genre}</span>
                </div>
              )}
              {(book.book_width_cm || book.book_height_cm) && (
                <div className="detail-meta-item">
                  <span className="detail-meta-label">Ukuran</span>
                  <span>{book.book_width_cm} × {book.book_height_cm} cm</span>
                </div>
              )}
            </div>

            {book.description && (
              <div className="detail-description">
                <h3>Deskripsi</h3>
                <p>{book.description}</p>
              </div>
            )}

            {(book.tokopedia_link || book.shopee_link || book.whatsapp_link || book.sales_link) && (
              <div className="detail-shop">
                <h3>Beli Buku</h3>
                <div className="detail-shop-links">
                  {book.tokopedia_link && (
                    <a href={book.tokopedia_link} target="_blank" rel="noopener noreferrer" className="detail-shop-btn shop-tokopedia">🟢 Tokopedia</a>
                  )}
                  {book.shopee_link && (
                    <a href={book.shopee_link} target="_blank" rel="noopener noreferrer" className="detail-shop-btn shop-shopee">🟠 Shopee</a>
                  )}
                  {book.whatsapp_link && (
                    <a href={`https://wa.me/${book.whatsapp_link.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="detail-shop-btn shop-wa">💬 WhatsApp</a>
                  )}
                  {book.sales_link && (
                    <a href={book.sales_link} target="_blank" rel="noopener noreferrer" className="detail-shop-btn shop-sales">🔗 Beli</a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
