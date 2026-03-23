import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = {
  referenceNumber: '', name: '', price: '', stock: '', rating: '', description: '', imageUrl: '',
  specifications: { talla: '', color: '', material: '' },
};

export default function ProductosPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [imageMode, setImageMode] = useState('url'); // 'url' | 'file'
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const loadProducts = async (q = '') => {
    const url = q ? `/api/products?search=${encodeURIComponent(q)}` : '/api/products';
    const res = await api.get(url);
    setProducts(res.data);
  };

  useEffect(() => { loadProducts(); }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    loadProducts(val);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let imageUrl = form.imageUrl;

      // Si eligió subir archivo, primero lo sube y obtiene la URL
      if (imageMode === 'file' && imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        const uploadRes = await api.post('/api/files/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrl = 'http://localhost:8080' + uploadRes.data.url;
      }

      const payload = {
        ...form,
        imageUrl,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        rating: parseFloat(form.rating) || 0,
      };
      if (editId) {
        await api.put(`/api/products/${editId}`, payload);
      } else {
        await api.post('/api/products', payload);
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditId(null);
      setImageFile(null);
      setImagePreview('');
      setImageMode('url');
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    }
  };

  const handleEdit = (p) => {
    setForm({
      referenceNumber: p.referenceNumber || '',
      name: p.name, price: p.price, stock: p.stock,
      rating: p.rating || '', description: p.description || '',
      imageUrl: p.imageUrl || '',
      specifications: p.specifications || { talla: '', color: '', material: '' },
    });
    setEditId(p.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      loadProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'No se puede eliminar');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Productos</h1>
          <p style={styles.count}>{products.length} artículos</p>
        </div>
        <div style={styles.headerActions}>
          <input
            style={styles.search}
            placeholder="Buscar por referencia o nombre..."
            value={search}
            onChange={handleSearch}
          />
          <button style={styles.btnPrimary} onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }}>
            + Nuevo Producto
          </button>
        </div>
      </div>

      {showForm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>{editId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <form onSubmit={handleSubmit} style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>N° Referencia *</label>
                <input style={styles.input} value={form.referenceNumber} onChange={e => setForm({ ...form, referenceNumber: e.target.value })} placeholder="Ej: REF-001" required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre *</label>
                <input style={styles.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Precio *</label>
                <input style={styles.input} type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Stock *</label>
                <input style={styles.input} type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Rating (0-5)</label>
                <input style={styles.input} type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} />
              </div>
              <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                <label style={styles.label}>Imagen</label>
                <div style={styles.imageToggle}>
                  <button type="button"
                    style={{ ...styles.toggleBtn, ...(imageMode === 'url' ? styles.toggleActive : {}) }}
                    onClick={() => setImageMode('url')}>
                    Desde URL
                  </button>
                  <button type="button"
                    style={{ ...styles.toggleBtn, ...(imageMode === 'file' ? styles.toggleActive : {}) }}
                    onClick={() => setImageMode('file')}>
                    Subir archivo
                  </button>
                </div>
                {imageMode === 'url' ? (
                  <input style={styles.input} value={form.imageUrl}
                    onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://ejemplo.com/imagen.jpg" />
                ) : (
                  <div style={styles.fileUploadArea}>
                    <input type="file" accept="image/*" onChange={handleFileChange} style={styles.fileInput} id="fileInput" />
                    <label htmlFor="fileInput" style={styles.fileLabel}>
                      {imagePreview
                        ? <img src={imagePreview} alt="preview" style={styles.previewImg} />
                        : <span>📁 Haz clic para seleccionar imagen</span>
                      }
                    </label>
                  </div>
                )}
              </div>
              <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                <label style={styles.label}>Descripción</label>
                <textarea style={{ ...styles.input, height: '80px', resize: 'vertical' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Talla</label>
                <input style={styles.input} value={form.specifications.talla} onChange={e => setForm({ ...form, specifications: { ...form.specifications, talla: e.target.value } })} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Color</label>
                <input style={styles.input} value={form.specifications.color} onChange={e => setForm({ ...form, specifications: { ...form.specifications, color: e.target.value } })} />
              </div>
              {error && <p style={{ ...styles.error, gridColumn: '1 / -1' }}>{error}</p>}
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" style={styles.btnSecondary} onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" style={styles.btnPrimary}>{editId ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={styles.grid}>
        {products.map(p => (
          <div key={p.id} style={styles.card}>
            <div style={styles.imageContainer}>
              {p.imageUrl
                ? <img src={p.imageUrl} alt={p.name} style={styles.image} />
                : <div style={styles.imagePlaceholder}>👗</div>
              }
              {p.stock === 0 && <span style={styles.soldOut}>Agotado</span>}
            </div>
            <div style={styles.cardBody}>
              {p.referenceNumber && <p style={styles.refNumber}>#{p.referenceNumber}</p>}
              <p style={styles.cardName}>{p.name}</p>
              {p.specifications?.talla && <p style={styles.cardSpec}>Talla: {p.specifications.talla}</p>}
              {p.specifications?.color && <p style={styles.cardSpec}>Color: {p.specifications.color}</p>}
              <div style={styles.cardFooter}>
                <span style={styles.price}>${parseFloat(p.price).toLocaleString('es-CO')}</span>
                <span style={styles.stock}>Stock: {p.stock}</span>
              </div>
              {p.rating > 0 && (
                <div style={styles.rating}>
                  {'★'.repeat(Math.round(p.rating))}{'☆'.repeat(5 - Math.round(p.rating))}
                  <span style={styles.ratingNum}> {p.rating}</span>
                </div>
              )}
              <div style={styles.cardActions}>
                <button style={styles.btnEdit} onClick={() => handleEdit(p)}>Editar</button>
                {user?.role === 'ADMIN' && (
                  <button style={styles.btnDelete} onClick={() => handleDelete(p.id)}>Eliminar</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '32px 40px', background: '#f8f7f4', minHeight: 'calc(100vh - 64px)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#1a1a2e', margin: 0, fontFamily: 'Georgia, serif' },
  count: { color: '#888', fontSize: '14px', margin: '4px 0 0' },
  headerActions: { display: 'flex', gap: '12px', alignItems: 'center' },
  search: { padding: '10px 16px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', width: '220px', outline: 'none', background: '#fff' },
  btnPrimary: { padding: '10px 20px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', letterSpacing: '0.5px' },
  btnSecondary: { padding: '10px 20px', background: '#fff', color: '#1a1a2e', border: '1.5px solid #1a1a2e', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  modal: { background: '#fff', borderRadius: '16px', padding: '36px', width: '600px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontSize: '22px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 24px', fontFamily: 'Georgia, serif' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: '600', color: '#555', letterSpacing: '0.5px', textTransform: 'uppercase' },
  input: { padding: '10px 12px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none' },
  error: { color: '#e74c3c', fontSize: '13px', margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' },
  card: { background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'transform 0.2s, box-shadow 0.2s' },
  imageContainer: { position: 'relative', height: '240px', background: '#f0ede8', overflow: 'hidden' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  imagePlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px' },
  soldOut: { position: 'absolute', top: '12px', right: '12px', background: '#1a1a2e', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '12px', letterSpacing: '1px' },
  cardBody: { padding: '16px' },
  cardName: { fontWeight: '700', fontSize: '15px', color: '#1a1a2e', margin: '0 0 6px' },
  cardSpec: { fontSize: '12px', color: '#888', margin: '2px 0' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '10px 0 6px' },
  price: { fontWeight: '800', fontSize: '17px', color: '#c9a96e' },
  stock: { fontSize: '12px', color: '#888', background: '#f5f5f5', padding: '3px 8px', borderRadius: '12px' },
  rating: { color: '#c9a96e', fontSize: '13px', marginBottom: '10px' },
  ratingNum: { color: '#888', fontSize: '12px' },
  cardActions: { display: 'flex', gap: '8px' },
  refNumber: { fontSize: '11px', color: '#c9a96e', fontWeight: '700', letterSpacing: '1px', margin: '0 0 4px' },
  btnEdit: { flex: 1, padding: '8px', background: '#f0ede8', color: '#1a1a2e', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' },
  btnDelete: { flex: 1, padding: '8px', background: '#fde8e8', color: '#e74c3c', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' },
  imageToggle: { display: 'flex', gap: '8px', marginBottom: '8px' },
  toggleBtn: { padding: '6px 16px', border: '1.5px solid #e0e0e0', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#888' },
  toggleActive: { border: '1.5px solid #1a1a2e', background: '#1a1a2e', color: '#fff' },
  fileUploadArea: { border: '2px dashed #e0e0e0', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' },
  fileInput: { display: 'none' },
  fileLabel: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100px', cursor: 'pointer', color: '#888', fontSize: '14px' },
  previewImg: { width: '100%', maxHeight: '160px', objectFit: 'cover', display: 'block' },
};