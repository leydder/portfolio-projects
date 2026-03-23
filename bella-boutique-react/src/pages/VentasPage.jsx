import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function VentasPage() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState([{ productId: '', quantity: 1 }]);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const loadData = async () => {
    const [salesRes, productsRes] = await Promise.all([
      api.get('/api/sales'),
      api.get('/api/products'),
    ]);
    setSales(salesRes.data);
    setProducts(productsRes.data);
  };

  useEffect(() => { loadData(); }, []);

  const addItem = () => setItems([...items, { productId: '', quantity: 1 }]);

  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  const updateItem = (i, field, value) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/sales', {
        items: items.map(it => ({
          productId: parseInt(it.productId),
          quantity: parseInt(it.quantity),
        })),
      });
      setShowForm(false);
      setItems([{ productId: '', quantity: 1 }]);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar venta');
    }
  };

  const totalVentas = sales.reduce((acc, s) => acc + parseFloat(s.totalAmount), 0);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Ventas</h1>
          <p style={styles.count}>{sales.length} ventas registradas</p>
        </div>
        <button style={styles.btnPrimary} onClick={() => setShowForm(true)}>
          + Nueva Venta
        </button>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Total Ventas</p>
          <p style={styles.statValue}>{sales.length}</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Ingresos Totales</p>
          <p style={{ ...styles.statValue, color: '#c9a96e' }}>
            ${totalVentas.toLocaleString('es-CO')}
          </p>
        </div>
      </div>

      {showForm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Registrar Venta</h2>
            <form onSubmit={handleSubmit}>
              {items.map((item, i) => (
                <div key={i} style={styles.itemRow}>
                  <select
                    style={styles.select}
                    value={item.productId}
                    onChange={e => updateItem(i, 'productId', e.target.value)}
                    required
                  >
                    <option value="">Selecciona producto</option>
                    {products.filter(p => p.stock > 0).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} — Stock: {p.stock} — ${parseFloat(p.price).toLocaleString('es-CO')}
                      </option>
                    ))}
                  </select>
                  <input
                    style={styles.qtyInput}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e => updateItem(i, 'quantity', e.target.value)}
                    required
                  />
                  {items.length > 1 && (
                    <button type="button" style={styles.btnRemove} onClick={() => removeItem(i)}>✕</button>
                  )}
                </div>
              ))}
              <button type="button" style={styles.btnAdd} onClick={addItem}>+ Agregar item</button>
              {error && <p style={styles.error}>{error}</p>}
              <div style={styles.modalActions}>
                <button type="button" style={styles.btnSecondary} onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" style={styles.btnPrimary}>Registrar Venta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selected && (
        <div style={styles.overlay} onClick={() => setSelected(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Detalle Venta #{selected.id}</h2>
            <p style={{ color: '#888', fontSize: '13px', marginBottom: '20px' }}>
              {new Date(selected.saleDate).toLocaleString('es-CO')}
            </p>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Producto</th>
                  <th style={styles.th}>Cantidad</th>
                  <th style={styles.th}>Precio Unit.</th>
                  <th style={styles.th}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selected.items.map(item => (
                  <tr key={item.id}>
                    <td style={styles.td}>{item.productName}</td>
                    <td style={styles.td}>{item.quantity}</td>
                    <td style={styles.td}>${parseFloat(item.unitPrice).toLocaleString('es-CO')}</td>
                    <td style={styles.td}>${(item.quantity * parseFloat(item.unitPrice)).toLocaleString('es-CO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Total:</span>
              <span style={styles.totalValue}>${parseFloat(selected.totalAmount).toLocaleString('es-CO')}</span>
            </div>
            <button style={{ ...styles.btnSecondary, marginTop: '20px' }} onClick={() => setSelected(null)}>Cerrar</button>
          </div>
        </div>
      )}

      <div style={styles.list}>
        {sales.map(sale => (
          <div key={sale.id} style={styles.saleCard} onClick={() => setSelected(sale)}>
            <div style={styles.saleLeft}>
              <span style={styles.saleId}>Venta #{sale.id}</span>
              <span style={styles.saleDate}>
                {new Date(sale.saleDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div style={styles.saleRight}>
              <span style={styles.saleItems}>{sale.items.length} item(s)</span>
              <span style={styles.saleTotal}>${parseFloat(sale.totalAmount).toLocaleString('es-CO')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '32px 40px', background: '#f8f7f4', minHeight: 'calc(100vh - 64px)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#1a1a2e', margin: 0, fontFamily: 'Georgia, serif' },
  count: { color: '#888', fontSize: '14px', margin: '4px 0 0' },
  btnPrimary: { padding: '10px 20px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  btnSecondary: { padding: '10px 20px', background: '#fff', color: '#1a1a2e', border: '1.5px solid #1a1a2e', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  statsRow: { display: 'flex', gap: '20px', marginBottom: '28px' },
  statCard: { background: '#fff', borderRadius: '12px', padding: '20px 28px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', minWidth: '180px' },
  statLabel: { fontSize: '12px', color: '#888', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '1px' },
  statValue: { fontSize: '28px', fontWeight: '800', color: '#1a1a2e', margin: 0 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  modal: { background: '#fff', borderRadius: '16px', padding: '36px', width: '560px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontSize: '22px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 24px', fontFamily: 'Georgia, serif' },
  itemRow: { display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' },
  select: { flex: 1, padding: '10px 12px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none' },
  qtyInput: { width: '80px', padding: '10px 12px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none' },
  btnRemove: { background: '#fde8e8', color: '#e74c3c', border: 'none', borderRadius: '6px', width: '36px', height: '36px', cursor: 'pointer', fontWeight: '700' },
  btnAdd: { background: 'none', border: '1.5px dashed #c9a96e', color: '#c9a96e', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', width: '100%', marginBottom: '16px' },
  error: { color: '#e74c3c', fontSize: '13px', margin: '0 0 12px' },
  modalActions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' },
  table: { width: '100%', borderCollapse: 'collapse', marginBottom: '16px' },
  th: { textAlign: 'left', padding: '10px 12px', background: '#f8f7f4', fontSize: '12px', fontWeight: '700', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' },
  td: { padding: '10px 12px', fontSize: '14px', color: '#333', borderBottom: '1px solid #f0f0f0' },
  totalRow: { display: 'flex', justifyContent: 'flex-end', gap: '16px', alignItems: 'center', paddingTop: '12px', borderTop: '2px solid #f0f0f0' },
  totalLabel: { fontWeight: '700', color: '#555', fontSize: '15px' },
  totalValue: { fontWeight: '800', color: '#c9a96e', fontSize: '22px' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  saleCard: { background: '#fff', borderRadius: '12px', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', transition: 'transform 0.1s' },
  saleLeft: { display: 'flex', flexDirection: 'column', gap: '4px' },
  saleId: { fontWeight: '700', color: '#1a1a2e', fontSize: '15px' },
  saleDate: { fontSize: '13px', color: '#888' },
  saleRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' },
  saleItems: { fontSize: '12px', color: '#888' },
  saleTotal: { fontWeight: '800', color: '#c9a96e', fontSize: '18px' },
};