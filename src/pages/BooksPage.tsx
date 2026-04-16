import { useState, useEffect, useRef, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Book } from '../types/book'

const emptyBook: Omit<Book, 'id' | 'created_at'> = {
  title: '',
  subtitle: '',
  author_name: '',
  isbn: '',
  publisher: '',
  publication_date: '',
  page_count: undefined,
  language: 'Indonesia',
  genre: '',
  description: '',
  book_width_cm: undefined,
  book_height_cm: undefined,
  cover_image_url: '',
  tokopedia_link: '',
  shopee_link: '',
  whatsapp_link: '',
  sales_link: '',
}

export default function BooksPage() {
  const { signOut } = useAuth()
  const [books, setBooks] = useState<Book[]>([])
  const [form, setForm] = useState(emptyBook)
  const [editing, setEditing] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setBooks(data || [])
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    let coverUrl = form.cover_image_url || null

    if (coverFile) {
      setUploading(true)
      const fileExt = coverFile.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('book-covers')
        .upload(fileName, coverFile)

      if (uploadError) {
        setError(uploadError.message)
        setUploading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('book-covers')
        .getPublicUrl(fileName)

      coverUrl = urlData.publicUrl
      setUploading(false)
    }

    const bookData = {
      ...form,
      page_count: form.page_count ? Number(form.page_count) : null,
      subtitle: form.subtitle || null,
      publisher: form.publisher || null,
      publication_date: form.publication_date || null,
      genre: form.genre || null,
      description: form.description || null,
      book_width_cm: form.book_width_cm ? Number(form.book_width_cm) : null,
      book_height_cm: form.book_height_cm ? Number(form.book_height_cm) : null,
      cover_image_url: coverUrl,
      tokopedia_link: form.tokopedia_link || null,
      shopee_link: form.shopee_link || null,
      whatsapp_link: form.whatsapp_link || null,
      sales_link: form.sales_link || null,
    }

    if (editing) {
      const { error } = await supabase
        .from('books')
        .update(bookData)
        .eq('id', editing)

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Buku berhasil diperbarui!')
        setEditing(null)
        setShowForm(false)
        setForm(emptyBook)
        setCoverFile(null)
        setCoverPreview(null)
        fetchBooks()
      }
    } else {
      const { error } = await supabase
        .from('books')
        .insert([bookData])

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Buku berhasil ditambahkan!')
        setShowForm(false)
        setForm(emptyBook)
        setCoverFile(null)
        setCoverPreview(null)
        fetchBooks()
      }
    }
  }

  const handleEdit = (book: Book) => {
    setEditing(book.id!)
    setForm({
      title: book.title,
      subtitle: book.subtitle || '',
      author_name: book.author_name,
      isbn: book.isbn,
      publisher: book.publisher || '',
      publication_date: book.publication_date || '',
      page_count: book.page_count,
      language: book.language || 'English',
      genre: book.genre || '',
      description: book.description || '',
      book_width_cm: book.book_width_cm,
      book_height_cm: book.book_height_cm,
      cover_image_url: book.cover_image_url || '',
      tokopedia_link: book.tokopedia_link || '',
      shopee_link: book.shopee_link || '',
      whatsapp_link: book.whatsapp_link || '',
      sales_link: book.sales_link || '',
    })
    setCoverFile(null)
    setCoverPreview(book.cover_image_url || null)
    setError('')
    setSuccess('')
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus buku ini?')) return

    const { error } = await supabase.from('books').delete().eq('id', id)
    if (error) {
      setError(error.message)
    } else {
      fetchBooks()
    }
  }

  const handleCancel = () => {
    setEditing(null)
    setShowForm(false)
    setForm(emptyBook)
    setCoverFile(null)
    setCoverPreview(null)
    setError('')
    setSuccess('')
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const wordCount = (form.description || '').trim().split(/\s+/).filter(Boolean).length

  const today = new Date().toISOString().split('T')[0]
  const bestSellers = books.filter(b => !b.publication_date || b.publication_date <= today)
  const upcoming = books.filter(b => b.publication_date && b.publication_date > today)
  const withContact = books.filter(b => b.whatsapp_link)
  const withShop = books.filter(b => b.tokopedia_link || b.shopee_link || b.sales_link)

  return (
    <div className="dashboard">
      {/* ===== TOPBAR ===== */}
      <header className="topbar">
        <div className="topbar-inner">
          <div className="topbar-brand">
            <div className="topbar-icon">PJ</div>
            <div>
              <h1>CV. Pionir Jaya</h1>
              <p className="topbar-tagline">Penerbitan dan Percetakan</p>
            </div>
          </div>
          <button className="btn-signout" onClick={signOut}>Keluar</button>
        </div>
      </header>

      {/* ===== 3-COLUMN LAYOUT ===== */}
      <div className="layout-3col">

        {/* LEFT PANEL — CATALOGUE */}
        <aside className="side-panel panel-left">
          <div className="panel-card">
            <div className="panel-card-header">
              <span>📚</span><h3>Katalog</h3>
              <span className="books-count">{books.length}</span>
            </div>
            {books.length === 0 ? (
              <p className="panel-empty">Belum ada buku di katalog</p>
            ) : (
              <ul className="panel-list">
                {books.map(b => (
                  <li key={b.id} className={editing === b.id ? 'catalogue-active' : ''} onClick={() => handleEdit(b)} style={{ cursor: 'pointer' }}>
                    {b.cover_image_url
                      ? <img src={b.cover_image_url} alt="" className="panel-thumb" />
                      : <div className="panel-thumb-placeholder">📖</div>
                    }
                    <div>
                      <strong>{b.title}</strong>
                      <span>{b.author_name}</span>
                      {b.genre && <span className="catalogue-genre">{b.genre}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* CENTER — FORM + BOOK LIST */}
        <div className="main-center">
          {showForm && (
          <section className="form-section">
            <div className="section-header">
              <span className="section-header-icon">📖</span>
              <h2>{editing ? 'Edit Buku' : 'Tambah Buku Baru'}</h2>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-layout">
                <div className="form-left">
                  <div className="field">
                    <label htmlFor="cover_image">Foto Cover</label>
                    <div className="cover-upload-box" onClick={() => fileInputRef.current?.click()}>
                      {coverPreview
                        ? <img src={coverPreview} alt="Cover preview" className="cover-preview" />
                        : (
                          <div className="cover-upload-placeholder">
                            <span>📷</span>
                            <p>Unggah<br/>Cover</p>
                          </div>
                        )
                      }
                    </div>
                    <input
                      id="cover_image"
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleCoverChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>

                <div className="form-right">
                  <div className="field">
                    <label htmlFor="title">Judul Buku *</label>
                    <input
                      id="title"
                      value={form.title}
                      onChange={(e) => updateField('title', e.target.value)}
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="subtitle">Subtitle</label>
                    <input
                      id="subtitle"
                      value={form.subtitle}
                      onChange={(e) => updateField('subtitle', e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="author_name">Pengarang *</label>
                    <input
                      id="author_name"
                      value={form.author_name}
                      onChange={(e) => updateField('author_name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="genre">Genre</label>
                    <select
                      id="genre"
                      value={form.genre}
                      onChange={(e) => updateField('genre', e.target.value)}
                    >
                      <option value="">— Pilih Genre —</option>
                      <option value="Fiction">Fiction</option>
                      <option value="Non-Fiction">Non-Fiction</option>
                      <option value="Novel">Novel</option>
                      <option value="Romance">Romance</option>
                      <option value="Thriller">Thriller</option>
                      <option value="Mystery">Mystery</option>
                      <option value="Science Fiction">Science Fiction</option>
                      <option value="Fantasy">Fantasy</option>
                      <option value="Horror">Horror</option>
                      <option value="Biography">Biography</option>
                      <option value="Self-Help">Self-Help</option>
                      <option value="Business">Business</option>
                      <option value="Education">Education</option>
                      <option value="History">History</option>
                      <option value="Poetry">Poetry</option>
                      <option value="Religion">Religion</option>
                      <option value="Children">Children</option>
                      <option value="Comics">Comics</option>
                      <option value="Cookbook">Cookbook</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="row">
                    <div className="field">
                      <label htmlFor="book_width_cm">Lebar (cm)</label>
                      <input
                        id="book_width_cm"
                        type="number"
                        step="0.1"
                        min="0"
                        value={form.book_width_cm ?? ''}
                        onChange={(e) => updateField('book_width_cm', e.target.value ? parseFloat(e.target.value) : '')}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="book_height_cm">Tinggi (cm)</label>
                      <input
                        id="book_height_cm"
                        type="number"
                        step="0.1"
                        min="0"
                        value={form.book_height_cm ?? ''}
                        onChange={(e) => updateField('book_height_cm', e.target.value ? parseFloat(e.target.value) : '')}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="page_count">Jumlah Halaman</label>
                    <input
                      id="page_count"
                      type="number"
                      min="1"
                      value={form.page_count ?? ''}
                      onChange={(e) => updateField('page_count', e.target.value ? parseInt(e.target.value) : '')}
                    />
                  </div>
                </div>
              </div>

              <div className="field">
                <label htmlFor="description">Deskripsi Buku / Synopsis</label>
                <textarea
                  id="description"
                  rows={4}
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Max 100 kata"
                />
                <span className={`word-count${wordCount > 100 ? ' over-limit' : ''}`}>
                  {wordCount}/100 kata
                </span>
              </div>

              <div className="field">
                <label htmlFor="isbn">ISBN</label>
                <input
                  id="isbn"
                  value={form.isbn}
                  onChange={(e) => updateField('isbn', e.target.value)}
                  placeholder="978-0-000-00000-0"
                />
              </div>

              <div className="row">
                <div className="field">
                  <label htmlFor="publisher">Publisher</label>
                  <input
                    id="publisher"
                    value={form.publisher}
                    onChange={(e) => updateField('publisher', e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="publication_date">Tanggal Terbit</label>
                  <input
                    id="publication_date"
                    type="date"
                    value={form.publication_date}
                    onChange={(e) => updateField('publication_date', e.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="language">Bahasa</label>
                <input
                  id="language"
                  value={form.language}
                  onChange={(e) => updateField('language', e.target.value)}
                />
              </div>

              <h3 className="section-title">Online Shop</h3>

              <div className="row">
                <div className="field">
                  <label htmlFor="tokopedia_link">Tokopedia</label>
                  <input
                    id="tokopedia_link"
                    type="url"
                    value={form.tokopedia_link}
                    onChange={(e) => updateField('tokopedia_link', e.target.value)}
                    placeholder="https://tokopedia.link/..."
                  />
                </div>
                <div className="field">
                  <label htmlFor="shopee_link">Shopee</label>
                  <input
                    id="shopee_link"
                    type="url"
                    value={form.shopee_link}
                    onChange={(e) => updateField('shopee_link', e.target.value)}
                    placeholder="https://shopee.co.id/..."
                  />
                </div>
              </div>

              <div className="row">
                <div className="field">
                  <label htmlFor="whatsapp_link">WhatsApp</label>
                  <input
                    id="whatsapp_link"
                    value={form.whatsapp_link}
                    onChange={(e) => updateField('whatsapp_link', e.target.value)}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div className="field">
                  <label htmlFor="sales_link">Link Penjualan</label>
                  <input
                    id="sales_link"
                    type="url"
                    value={form.sales_link}
                    onChange={(e) => updateField('sales_link', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              {error && <p className="error">{error}</p>}
              {success && <p className="success">{success}</p>}

              <div className="form-actions">
                <button type="submit" disabled={uploading}>
                  {uploading ? 'Mengunggah...' : editing ? 'Simpan Perubahan' : 'Tambah Buku'}
                </button>
                <button type="button" className="btn-secondary" onClick={handleCancel}>
                  Batal
                </button>
              </div>
            </form>
          </section>
          )}

          <section className="books-section">
            <div className="section-header">
              <span className="section-header-icon">📚</span>
              <h2>Daftar Buku</h2>
              <span className="books-count">{books.length}</span>
              {!showForm && (
                <button className="btn-small" onClick={() => { setEditing(null); setForm(emptyBook); setCoverPreview(null); setShowForm(true) }}>+ Tambah Buku</button>
              )}
            </div>

            {books.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">📚</div>
                <p>Belum ada buku ditambahkan.</p>
              </div>
            ) : (
              <div className="book-list">
                {books.map((book) => (
                  <div key={book.id} className={`book-card${editing === book.id ? ' is-editing' : ''}`}>
                    {book.cover_image_url
                      ? <img src={book.cover_image_url} alt={book.title} className="book-cover-thumb" />
                      : <div className="book-cover-placeholder">📖</div>
                    }
                    <div className="book-info">
                      <h3>{book.title}</h3>
                      {book.subtitle && <p className="book-subtitle">{book.subtitle}</p>}
                      <p className="book-meta">oleh {book.author_name}</p>
                      {book.isbn && <p className="book-meta">ISBN: {book.isbn}</p>}
                      {(book.book_width_cm || book.book_height_cm) && (
                        <p className="book-meta">📐 {book.book_width_cm} × {book.book_height_cm} cm</p>
                      )}
                      <div className="book-tags">
                        {book.genre && <span className="book-tag">{book.genre}</span>}
                        {book.language && <span className="book-tag">{book.language}</span>}
                        {book.page_count && <span className="book-tag">{book.page_count} hal.</span>}
                      </div>
                    </div>
                    <div className="book-actions">
                      <button className="btn-small" onClick={() => handleEdit(book)}>Edit</button>
                      <button className="btn-small btn-danger" onClick={() => handleDelete(book.id!)}>
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT PANEL — INFO CARDS */}
        <aside className="side-panel panel-right">
          <div className="panel-card">
            <div className="panel-card-header">
              <span>🏆</span><h3>Terlaris</h3>
            </div>
            {bestSellers.length === 0 ? (
              <p className="panel-empty">Belum ada buku terbit</p>
            ) : (
              <ul className="panel-list">
                {bestSellers.slice(0, 5).map(b => (
                  <li key={b.id}>
                    {b.cover_image_url && <img src={b.cover_image_url} alt="" className="panel-thumb" />}
                    <div>
                      <strong>{b.title}</strong>
                      <span>{b.author_name}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="panel-card">
            <div className="panel-card-header">
              <span>📅</span><h3>Segera Terbit</h3>
            </div>
            {upcoming.length === 0 ? (
              <p className="panel-empty">Tidak ada buku mendatang</p>
            ) : (
              <ul className="panel-list">
                {upcoming.slice(0, 5).map(b => (
                  <li key={b.id}>
                    {b.cover_image_url && <img src={b.cover_image_url} alt="" className="panel-thumb" />}
                    <div>
                      <strong>{b.title}</strong>
                      <span>📅 {b.publication_date}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="panel-card">
            <div className="panel-card-header">
              <span>📞</span><h3>Kontak</h3>
            </div>
            {withContact.length === 0 ? (
              <p className="panel-empty">Belum ada kontak</p>
            ) : (
              <ul className="panel-list">
                {withContact.map(b => (
                  <li key={b.id}>
                    <div>
                      <strong>{b.title}</strong>
                      <a href={`https://wa.me/${b.whatsapp_link?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="panel-link">
                        💬 {b.whatsapp_link}
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="panel-card">
            <div className="panel-card-header">
              <span>🛒</span><h3>Toko Online</h3>
            </div>
            {withShop.length === 0 ? (
              <p className="panel-empty">Belum ada link toko</p>
            ) : (
              <div className="shop-list">
                {withShop.map(b => (
                  <div key={b.id} className="shop-item">
                    <h4>{b.title}</h4>
                    <div className="shop-links">
                      {b.tokopedia_link && (
                        <a href={b.tokopedia_link} target="_blank" rel="noopener noreferrer" className="shop-link shop-tokopedia">🟢 Tokopedia</a>
                      )}
                      {b.shopee_link && (
                        <a href={b.shopee_link} target="_blank" rel="noopener noreferrer" className="shop-link shop-shopee">🟠 Shopee</a>
                      )}
                      {b.sales_link && (
                        <a href={b.sales_link} target="_blank" rel="noopener noreferrer" className="shop-link shop-sales">🔗 Sales</a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
