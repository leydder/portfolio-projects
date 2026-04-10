import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = {
  referenceNumber: '', name: '', purchasePrice: '', price: '', stock: '',
  description: '', imageUrl: '',
  specifications: { talla: '', color: '', material: '' },
  sizes: [],
};

export default function ProductosPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [imageMode, setImageMode] = useState('url');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [useSizes, setUseSizes] = useState(false);

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

  const addSize = () => setForm({ ...form, sizes: [...form.sizes, { sizeName: '', stock: 0 }] });
  const removeSize = (i) => setForm({ ...form, sizes: form.sizes.filter((_, idx) => idx !== i) });
  const updateSize = (i, field, value) => {
    const updated = [...form.sizes];
    updated[i] = { ...updated[i], [field]: field === 'sizeName' ? value.toUpperCase() : value };
    setForm({ ...form, sizes: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let imageUrl = form.imageUrl;
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
        purchasePrice: form.purchasePrice ? parseInt(form.purchasePrice) : undefined,
        price: parseInt(form.price),
        stock: useSizes ? undefined : parseInt(form.stock),
        sizes: useSizes ? form.sizes.map(s => ({ ...s, stock: parseInt(s.stock) })) : undefined,
      };

      if (editId) {
        await api.put(`/api/products/${editId}`, payload);
      } else {
        await api.post('/api/products', payload);
      }
      closeForm();
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    }
  };

  const handleEdit = (p) => {
    const hasSizes = p.sizes && p.sizes.length > 0;
    setForm({
      referenceNumber: p.referenceNumber || '',
      name: p.name, purchasePrice: p.purchasePrice || '', price: p.price, stock: p.stock,
      description: p.description || '',
      imageUrl: p.imageUrl || '',
      specifications: p.specifications || { talla: '', color: '', material: '' },
      sizes: p.sizes || [],
    });
    setUseSizes(hasSizes);
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

  const closeForm = () => {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setEditId(null);
    setImageFile(null);
    setImagePreview('');
    setImageMode('url');
    setUseSizes(false);
    setError('');
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
          <div style={styles.viewToggle}>
            <button style={{ ...styles.viewBtn, ...(viewMode === 'grid' ? styles.viewBtnActive : {}) }} onClick={() => setViewMode('grid')}>⊞ Grid</button>
            <button style={{ ...styles.viewBtn, ...(viewMode === 'table' ? styles.viewBtnActive : {}) }} onClick={() => setViewMode('table')}>☰ Tabla</button>
          </div>
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
                <label style={styles.label}>Precio de compra</label>
                <input style={styles.input} type="number" step="1" min="0" autoComplete="off" value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: e.target.value })} placeholder="Costo del proveedor" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Precio de venta *</label>
                <input style={styles.input} type="number" step="1" min="1" autoComplete="off" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
              </div>

              {/* Toggle tallas */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={useSizes} onChange={e => setUseSizes(e.target.checked)} />
                  Manejar stock por tallas
                </label>
              </div>

              {!useSizes && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Stock *</label>
                  <input style={styles.input} type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
                </div>
              )}

              {useSizes && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={styles.label}>Tallas y Stock</label>
                  {form.sizes.map((s, i) => (
                    <div key={i} style={styles.sizeRow}>
                      <input style={{ ...styles.input, flex: 1, textTransform: 'uppercase' }} placeholder="Ej: S, M, L, XL, 38..." value={s.sizeName}
                        onChange={e => updateSize(i, 'sizeName', e.target.value)} required />
                      <input style={{ ...styles.input, width: '80px' }} type="number" min="0" placeholder="Stock" value={s.stock}
                        onChange={e => updateSize(i, 'stock', e.target.value)} required />
                      <button type="button" style={styles.btnRemoveSize} onClick={() => removeSize(i)}>✕</button>
                    </div>
                  ))}
                  <button type="button" style={styles.btnAddSize} onClick={addSize}>+ Agregar talla</button>
                </div>
              )}

              <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                <label style={styles.label}>Imagen</label>
                <div style={styles.imageToggle}>
                  <button type="button" style={{ ...styles.toggleBtn, ...(imageMode === 'url' ? styles.toggleActive : {}) }} onClick={() => setImageMode('url')}>Desde URL</button>
                  <button type="button" style={{ ...styles.toggleBtn, ...(imageMode === 'file' ? styles.toggleActive : {}) }} onClick={() => setImageMode('file')}>Subir archivo</button>
                </div>
                {imageMode === 'url' ? (
                  <input style={styles.input} value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://ejemplo.com/imagen.jpg" />
                ) : (
                  <div style={styles.fileUploadArea}>
                    <input type="file" accept="image/*" onChange={handleFileChange} style={styles.fileInput} id="fileInput" />
                    <label htmlFor="fileInput" style={styles.fileLabel}>
                      {imagePreview ? <img src={imagePreview} alt="preview" style={styles.previewImg} /> : <span>📁 Haz clic para seleccionar imagen</span>}
                    </label>
                  </div>
                )}
              </div>
              <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                <label style={styles.label}>Descripción</label>
                <textarea style={{ ...styles.input, height: '70px', resize: 'vertical' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Color</label>
                <input style={styles.input} value={form.specifications.color} onChange={e => setForm({ ...form, specifications: { ...form.specifications, color: e.target.value } })} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Material</label>
                <input style={styles.input} value={form.specifications.material} onChange={e => setForm({ ...form, specifications: { ...form.specifications, material: e.target.value } })} />
              </div>
              {error && <p style={{ ...styles.error, gridColumn: '1 / -1' }}>{error}</p>}
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" style={styles.btnSecondary} onClick={closeForm}>Cancelar</button>
                <button type="submit" style={styles.btnPrimary}>{editId ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewMode === 'grid' ? (
        <div style={styles.grid}>
          {products.map(p => (
            <div key={p.id} style={styles.card}>
              {/* Imagen */}
              <div style={styles.imageContainer}>
                {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={styles.image} /> : <div style={styles.imagePlaceholder}>👗</div>}
                {p.stock === 0 && <span style={styles.soldOut}>Agotado</span>}
              </div>
              {/* Info del producto */}
              <div style={styles.cardBody}>
                {p.referenceNumber && <p style={styles.refNumber}>#{p.referenceNumber}</p>}
                <p style={styles.cardName}>{p.name}</p>
                {p.sizes && p.sizes.length > 0 ? (
                  <div style={styles.sizesList}>
                    {p.sizes.map(s => (
                      <span key={s.id} style={{ ...styles.sizeChip, opacity: s.stock === 0 ? 0.4 : 1 }}>
                        {s.sizeName}: {s.stock}
                      </span>
                    ))}
                  </div>
                ) : (
                  p.specifications?.color && <p style={styles.cardSpec}>Color: {p.specifications.color}</p>
                )}
                <div style={styles.cardFooter}>
                  <span style={styles.price}>${parseFloat(p.price).toLocaleString('es-CO')}</span>
                  <span style={p.stock === 0 ? styles.stockOut : styles.stock}>
                    {p.stock === 0 ? 'Sin stock' : `${p.stock} und`}
                  </span>
                </div>
              </div>
              {/* Botones de acción */}
              <div style={styles.cardActions}>
                <button
                  style={{ ...styles.btnSellFull, ...(p.stock === 0 ? styles.btnSellDisabled : {}) }}
                  onClick={() => p.stock > 0 && navigate('/ventas', { state: { product: p } })}
                  disabled={p.stock === 0}
                >
                  {p.stock === 0 ? 'Sin stock' : 'Vender'}
                </button>
                <div style={styles.cardSecondaryActions}>
                  <button style={styles.btnEdit} onClick={() => handleEdit(p)}>Editar</button>
                  {user?.role === 'ADMIN' && (
                    <button style={styles.btnDelete} onClick={() => handleDelete(p.id)}>Eliminar</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Ref.</th>
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>P. Compra</th>
                <th style={styles.th}>P. Venta</th>
                <th style={styles.th}>Stock Inicial</th>
                <th style={styles.th}>Stock Real</th>
                <th style={styles.th}>Tallas</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={styles.tr}>
                  <td style={styles.td}><span style={styles.refBadge}>{p.referenceNumber}</span></td>
                  <td style={styles.td}>
                    <div style={styles.productCell}>
                      {p.imageUrl && <img src={p.imageUrl} alt="" style={styles.thumbImg} />}
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={styles.td}>{p.purchasePrice ? `$${Math.round(parseFloat(p.purchasePrice)).toLocaleString('es-CO')}` : <span style={{ color: '#ccc' }}>—</span>}</td>
                  <td style={{ ...styles.td, color: '#c9a96e', fontWeight: 700 }}>${Math.round(parseFloat(p.price)).toLocaleString('es-CO')}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.stockBadge, background: '#fdf0ed', color: '#7d4255' }}>
                      {p.initialStock ?? '—'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.stockBadge, background: p.stock === 0 ? '#fde8e8' : '#e8f5e9', color: p.stock === 0 ? '#e74c3c' : '#2e7d32' }}>
                      {p.stock}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {p.sizes && p.sizes.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {p.sizes.map(s => (
                          <span key={s.id} style={{ ...styles.sizeChip, fontSize: '11px', opacity: s.stock === 0 ? 0.4 : 1 }}>
                            {s.sizeName}: {s.stock}
                          </span>
                        ))}
                      </div>
                    ) : <span style={{ color: '#aaa', fontSize: '12px' }}>—</span>}
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <button
                        style={{ ...styles.btnSellTable, ...(p.stock === 0 ? styles.btnSellDisabled : {}) }}
                        onClick={() => p.stock > 0 && navigate('/ventas', { state: { product: p } })}
                        disabled={p.stock === 0}
                        title={p.stock === 0 ? 'Sin stock' : 'Registrar venta'}
                      >
                        🛒 Vender
                      </button>
                      <button style={styles.btnIconTable} title="Editar" onClick={() => handleEdit(p)}>✎</button>
                      {user?.role === 'ADMIN' && (
                        <button style={{ ...styles.btnIconTable, ...styles.btnIconTableDanger }} title="Eliminar" onClick={() => handleDelete(p.id)}>🗑</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: '32px 40px', background: '#fdf0ed', minHeight: 'calc(100vh - 64px)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#3d2027', margin: 0, fontFamily: 'Georgia, serif' },
  count: { color: '#888', fontSize: '14px', margin: '4px 0 0' },
  headerActions: { display: 'flex', gap: '12px', alignItems: 'center' },
  search: { padding: '10px 16px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', width: '220px', outline: 'none', background: '#fff' },
  viewToggle: { display: 'flex', border: '1.5px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' },
  viewBtn: { padding: '8px 14px', background: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#888' },
  viewBtnActive: { background: '#3d2027', color: '#fff' },
  btnPrimary: { padding: '10px 20px', background: '#3d2027', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  btnSecondary: { padding: '10px 20px', background: '#fff', color: '#3d2027', border: '1.5px solid #3d2027', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  modal: { background: '#fff', borderRadius: '16px', padding: '36px', width: '620px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontSize: '22px', fontWeight: '700', color: '#3d2027', margin: '0 0 24px', fontFamily: 'Georgia, serif' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: '600', color: '#555', letterSpacing: '0.5px', textTransform: 'uppercase' },
  input: { padding: '10px 12px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none' },
  error: { color: '#e74c3c', fontSize: '13px', margin: 0 },
  sizeRow: { display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' },
  btnRemoveSize: { background: '#fde8e8', color: '#e74c3c', border: 'none', borderRadius: '6px', width: '32px', height: '32px', cursor: 'pointer', fontWeight: '700', flexShrink: 0 },
  btnAddSize: { background: 'none', border: '1.5px dashed #c9a96e', color: '#c9a96e', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', marginTop: '4px' },
  imageToggle: { display: 'flex', gap: '8px', marginBottom: '8px' },
  toggleBtn: { padding: '6px 16px', border: '1.5px solid #e0e0e0', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#888' },
  toggleActive: { border: '1.5px solid #3d2027', background: '#3d2027', color: '#fff' },
  fileUploadArea: { border: '2px dashed #e0e0e0', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' },
  fileInput: { display: 'none' },
  fileLabel: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '90px', cursor: 'pointer', color: '#888', fontSize: '14px' },
  previewImg: { width: '100%', maxHeight: '140px', objectFit: 'cover', display: 'block' },
  // Grid view
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' },
  card: { background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column' },
  imageContainer: { position: 'relative', height: '190px', background: '#f0ede8', overflow: 'hidden' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  imagePlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px' },
  soldOut: { position: 'absolute', top: '10px', left: '10px', background: 'rgba(61,32,39,0.82)', color: '#fff', fontSize: '10px', fontWeight: '700', padding: '3px 9px', borderRadius: '20px', letterSpacing: '0.5px' },
  cardBody: { padding: '12px 16px 8px', flex: 1 },
  cardName: { fontWeight: '700', fontSize: '14px', color: '#3d2027', margin: '0 0 6px', lineHeight: '1.3' },
  cardSpec: { fontSize: '12px', color: '#888', margin: '2px 0' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' },
  price: { fontWeight: '800', fontSize: '17px', color: '#c9a96e' },
  stock: { fontSize: '11px', color: '#2e7d32', background: '#e8f5e9', padding: '3px 8px', borderRadius: '10px', fontWeight: '600' },
  stockOut: { fontSize: '11px', color: '#e74c3c', background: '#fde8e8', padding: '3px 8px', borderRadius: '10px', fontWeight: '600' },
  refNumber: { fontSize: '11px', color: '#c9a96e', fontWeight: '700', letterSpacing: '1px', margin: '0 0 3px' },
  cardActions: { padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: '8px' },
  btnSellFull: { width: '100%', padding: '11px', background: '#1e8449', color: '#fff', border: 'none', borderRadius: '9px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', letterSpacing: '0.3px' },
  btnSellDisabled: { background: '#ebebeb', color: '#bbb', cursor: 'not-allowed' },
  cardSecondaryActions: { display: 'flex', gap: '8px' },
  btnEdit: { flex: 1, padding: '8px', background: '#f0ede8', color: '#3d2027', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' },
  btnDelete: { flex: 1, padding: '8px', background: '#fde8e8', color: '#e74c3c', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' },
  sizesList: { display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '6px 0' },
  sizeChip: { background: '#f0ede8', color: '#3d2027', fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '10px' },
  // Table view
  tableWrapper: { background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '14px 16px', background: '#fdf0ed', fontSize: '11px', fontWeight: '700', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #e0e0e0' },
  tr: { borderBottom: '1px solid #f5f5f5' },
  td: { padding: '12px 16px', fontSize: '14px', color: '#333', verticalAlign: 'middle' },
  refBadge: { fontSize: '11px', color: '#c9a96e', fontWeight: '700', letterSpacing: '1px' },
  productCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  thumbImg: { width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px' },
  stockBadge: { fontSize: '12px', fontWeight: '700', padding: '3px 10px', borderRadius: '10px' },
  btnSellTable: { padding: '7px 14px', background: '#1e8449', color: '#fff', border: 'none', borderRadius: '7px', cursor: 'pointer', fontWeight: '700', fontSize: '12px', whiteSpace: 'nowrap' },
  btnIconTable: { width: '32px', height: '32px', borderRadius: '7px', border: '1.5px solid #e0e0e0', background: '#fafafa', color: '#555', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  btnIconTableDanger: { border: '1.5px solid #fde8e8', background: '#fde8e8', color: '#e74c3c' },
};