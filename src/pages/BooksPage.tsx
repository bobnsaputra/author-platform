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
  sales_count: undefined,
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
  const [search, setSearch] = useState('')
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
      sales_count: form.sales_count ? Number(form.sales_count) : null,
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
      sales_count: book.sales_count,
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

  const filteredBooks = books.filter(b => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      b.title.toLowerCase().includes(q) ||
      b.author_name.toLowerCase().includes(q) ||
      (b.genre || '').toLowerCase().includes(q) ||
      (b.isbn || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="manage">
      {/* Topbar */}
      <header className="topbar">
        <div className="topbar-inner">
          <div className="topbar-brand">
            <div className="topbar-icon">PJ</div>
            <div>
              <h1>Kelola Buku</h1>
            </div>
          </div>
          <div className="topbar-search">
            <input
              type="text"
              placeholder="Cari buku..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="btn-signout" onClick={signOut}>Keluar</button>
        </div>
      </header>

      {/* Compact Content */}
      <div className="manage-content">
        <div className="manage-toolbar">
          <span className="manage-count">{filteredBooks.length} buku</span>
          {!showForm && (
            <button className="btn-small" onClick={() => { setEditing(null); setForm(emptyBook); setCoverPreview(null); setShowForm(true) }}>+ Tambah Buku</button>
          )}
        </div>

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
                    <input id="title" value={form.title} onChange={(e) => updateField('title', e.target.value)} required />
                  </div>
                  <div className="field">
                    <label htmlFor="subtitle">Subtitle</label>
                    <input id="subtitle" value={form.subtitle} onChange={(e) => updateField('subtitle', e.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="author_name">Pengarang *</label>
                    <input id="author_name" value={form.author_name} onChange={(e) => updateField('author_name', e.target.value)} required />
                  </div>
                  <div className="field">
                    <label htmlFor="genre">Genre</label>
                    <select id="genre" value={form.genre} onChange={(e) => updateField('genre', e.target.value)}>
                      <option value="">Pilih genre</option>
                      <option>Fiksi</option><option>Non-Fiksi</option><option>Fantasi</option>
                      <option>Misteri</option><option>Romansa</option><option>Sains</option>
                      <option>Sejarah</option><option>Biografi</option><option>Self-Help</option>
                      <option>Bisnis</option><option>Teknologi</option><option>Pendidikan</option>
                      <option>Anak-Anak</option><option>Remaja</option><option>Puisi</option>
                      <option>Komik</option><option>Agama</option><option>Filsafat</option>
                      <option>Masakan</option><option>Lainnya</option>
                    </select>
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label htmlFor="isbn">ISBN</label>
                      <input id="isbn" value={form.isbn} onChange={(e) => updateField('isbn', e.target.value)} />
                    </div>
                    <div className="field">
                      <label htmlFor="publisher">Penerbit</label>
                      <input id="publisher" value={form.publisher} onChange={(e) => updateField('publisher', e.target.value)} />
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label htmlFor="publication_date">Tanggal Terbit</label>
                      <input id="publication_date" type="date" value={form.publication_date} onChange={(e) => updateField('publication_date', e.target.value)} />
                    </div>
                    <div className="field">
                      <label htmlFor="page_count">Jumlah Halaman</label>
                      <input id="page_count" type="number" value={form.page_count ?? ''} onChange={(e) => updateField('page_count', e.target.value)} />
                    </div>
                    <div className="field">
                      <label htmlFor="language">Bahasa</label>
                      <input id="language" value={form.language} onChange={(e) => updateField('language', e.target.value)} />
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label htmlFor="book_width_cm">Lebar (cm)</label>
                      <input id="book_width_cm" type="number" step="0.1" value={form.book_width_cm ?? ''} onChange={(e) => updateField('book_width_cm', e.target.value)} />
                    </div>
                    <div className="field">
                      <label htmlFor="book_height_cm">Tinggi (cm)</label>
                      <input id="book_height_cm" type="number" step="0.1" value={form.book_height_cm ?? ''} onChange={(e) => updateField('book_height_cm', e.target.value)} />
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="description">Deskripsi <span className="word-counter">({wordCount}/100 kata)</span></label>
                    <textarea id="description" rows={3} value={form.description} onChange={(e) => updateField('description', e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="form-layout" style={{ marginTop: '12px' }}>
                <div className="field">
                  <label htmlFor="tokopedia_link">Link Tokopedia</label>
                  <input id="tokopedia_link" type="url" value={form.tokopedia_link} onChange={(e) => updateField('tokopedia_link', e.target.value)} placeholder="https://..." />
                </div>
                <div className="field">
                  <label htmlFor="shopee_link">Link Shopee</label>
                  <input id="shopee_link" type="url" value={form.shopee_link} onChange={(e) => updateField('shopee_link', e.target.value)} placeholder="https://..." />
                </div>
                <div className="field">
                  <label htmlFor="whatsapp_link">No. WhatsApp</label>
                  <input id="whatsapp_link" value={form.whatsapp_link} onChange={(e) => updateField('whatsapp_link', e.target.value)} placeholder="08xxx" />
                </div>
                <div className="field">
                  <label htmlFor="sales_link">Link Penjualan</label>
                  <input id="sales_link" type="url" value={form.sales_link} onChange={(e) => updateField('sales_link', e.target.value)} placeholder="https://..." />
                </div>
                <div className="field">
                  <label htmlFor="sales_count">Jumlah Terjual</label>
                  <input id="sales_count" type="number" min="0" value={form.sales_count ?? ''} onChange={(e) => updateField('sales_count', e.target.value)} placeholder="0" />
                </div>
              </div>

              {error && <p className="error">{error}</p>}
              {success && <p className="success">{success}</p>}

              <div className="form-actions">
                <button type="submit" disabled={uploading}>{uploading ? 'Mengunggah...' : editing ? 'Simpan Perubahan' : 'Tambah Buku'}</button>
                <button type="button" className="btn-cancel" onClick={handleCancel}>Batal</button>
              </div>
            </form>
          </section>
        )}

        {/* Book List — compact */}
        {filteredBooks.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📚</div>
            <p>{search ? 'Tidak ada buku ditemukan.' : 'Belum ada buku ditambahkan.'}</p>
          </div>
        ) : (
          <div className="book-list">
            {filteredBooks.map((book) => (
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
                  <div className="book-tags">
                    {book.genre && <span className="book-tag">{book.genre}</span>}
                    {book.language && <span className="book-tag">{book.language}</span>}
                    {book.page_count && <span className="book-tag">{book.page_count} hal.</span>}
                  </div>
                </div>
                <div className="book-actions">
                  <button className="btn-small" onClick={() => handleEdit(book)}>Edit</button>
                  <button className="btn-small btn-danger" onClick={() => handleDelete(book.id!)}>Hapus</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
