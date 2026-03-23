import { useEffect, useState } from 'react';
import api from '../api/axios';

const EMPTY_CREDIT_PAYMENT = { amount: '', dueDate: '', notes: '' };

export default function VentasPage() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState([{ productId: '', productSizeId: '', quantity: 1 }]);
  const [paymentType, setPaymentType] = useState('CONTADO');
  const [buyerName, setBuyerName] = useState('');
  const [initialPayment, setInitialPayment] = useState('');
  const [creditPayments, setCreditPayments] = useState([{ ...EMPTY_CREDIT_PAYMENT }]);
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

  // Items
  const addItem = () => setItems([...items, { productId: '', productSizeId: '', quantity: 1 }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    if (field === 'productId') updated[i].productSizeId = '';
    setItems(updated);
  };

  const getSizesForItem = (item) => {
    const product = products.find(p => p.id === parseInt(item.productId));
    return product?.sizes || [];
  };

  // Credit payments
  const addCreditPayment = () => setCreditPayments([...creditPayments, { ...EMPTY_CREDIT_PAYMENT }]);
  const removeCreditPayment = (i) => setCreditPayments(creditPayments.filter((_, idx) => idx !== i));
  const updateCreditPayment = (i, field, value) => {
    const updated = [...creditPayments];
    updated[i] = { ...updated[i], [field]: value };
    setCreditPayments(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        paymentType,
        buyerName: paymentType === 'CREDITO' ? buyerName : undefined,
        initialPayment: paymentType === 'CREDITO' && initialPayment ? parseFloat(initialPayment) : undefined,
        creditPayments: paymentType === 'CREDITO' ? creditPayments.map(cp => ({
          amount: parseFloat(cp.amount),
          dueDate: cp.dueDate || undefined,
          notes: cp.notes || undefined,
        })) : undefined,
        items: items.map(it => ({
          productId: parseInt(it.productId),
          productSizeId: it.productSizeId ? parseInt(it.productSizeId) : undefined,
          quantity: parseInt(it.quantity),
        })),
      };
      await api.post('/api/sales', payload);
      closeForm();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar venta');
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setItems([{ productId: '', productSizeId: '', quantity: 1 }]);
    setPaymentType('CONTADO');
    setBuyerName('');
    setInitialPayment('');
    setCreditPayments([{ ...EMPTY_CREDIT_PAYMENT }]);
    setError('');
  };

  const handleMarkPaid = async (saleId, paymentId) => {
    try {
      const res = await api.put(`/api/sales/${saleId}/payments`, { id: paymentId });
      setSelected(res.data);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al registrar pago');
    }
  };

  const totalVentas = sales.reduce((acc, s) => acc + parseFloat(s.totalAmount), 0);
  const ventasCredito = sales.filter(s => s.paymentType === 'CREDITO').length;
  const saldoPendiente = sales
    .filter(s => s.paymentType === 'CREDITO')
    .reduce((acc, s) => acc + parseFloat(s.remainingBalance || 0), 0);

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
          <p style={{ ...styles.statValue, color: '#c9a96e' }}>${totalVentas.toLocaleString('es-CO')}</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Ventas a Crédito</p>
          <p style={{ ...styles.statValue, color: '#e67e22' }}>{ventasCredito}</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Saldo por Cobrar</p>
          <p style={{ ...styles.statValue, color: '#e74c3c' }}>${saldoPendiente.toLocaleString('es-CO')}</p>
        </div>
      </div>

      {showForm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Registrar Venta</h2>
            <form onSubmit={handleSubmit}>

              {/* Tipo de pago */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Tipo de Pago *</label>
                <div style={styles.paymentToggle}>
                  <button type="button"
                    style={{ ...styles.payBtn, ...(paymentType === 'CONTADO' ? styles.payBtnActive : {}) }}
                    onClick={() => setPaymentType('CONTADO')}>
                    💵 Contado
                  </button>
                  <button type="button"
                    style={{ ...styles.payBtn, ...(paymentType === 'CREDITO' ? styles.payBtnActiveCredito : {}) }}
                    onClick={() => setPaymentType('CREDITO')}>
                    📋 Crédito
                  </button>
                </div>
              </div>

              {/* Datos de crédito */}
              {paymentType === 'CREDITO' && (
                <div style={styles.creditSection}>
                  <div style={styles.creditRow}>
                    <div style={{ flex: 1 }}>
                      <label style={styles.label}>Nombre del Comprador *</label>
                      <input style={styles.input} value={buyerName} onChange={e => setBuyerName(e.target.value)} required placeholder="Nombre completo" />
                    </div>
                    <div style={{ width: '160px' }}>
                      <label style={styles.label}>Inicial ($)</label>
                      <input style={styles.input} type="number" step="0.01" min="0" value={initialPayment} onChange={e => setInitialPayment(e.target.value)} placeholder="0" />
                    </div>
                  </div>

                  <label style={{ ...styles.label, marginTop: '12px', display: 'block' }}>Cuotas / Fechas de Pago</label>
                  {creditPayments.map((cp, i) => (
                    <div key={i} style={styles.cpRow}>
                      <input style={{ ...styles.input, width: '110px' }} type="number" step="0.01" min="0" placeholder="Monto" value={cp.amount}
                        onChange={e => updateCreditPayment(i, 'amount', e.target.value)} required />
                      <input style={{ ...styles.input, flex: 1 }} type="date" value={cp.dueDate}
                        onChange={e => updateCreditPayment(i, 'dueDate', e.target.value)} />
                      <input style={{ ...styles.input, flex: 1 }} placeholder="Nota (opcional)" value={cp.notes}
                        onChange={e => updateCreditPayment(i, 'notes', e.target.value)} />
                      {creditPayments.length > 1 && (
                        <button type="button" style={styles.btnRemoveItem} onClick={() => removeCreditPayment(i)}>✕</button>
                      )}
                    </div>
                  ))}
                  <button type="button" style={styles.btnAdd} onClick={addCreditPayment}>+ Agregar cuota</button>
                </div>
              )}

              {/* Items */}
              <div style={{ marginTop: '16px' }}>
                <label style={styles.label}>Productos *</label>
                {items.map((item, i) => {
                  const sizes = getSizesForItem(item);
                  return (
                    <div key={i} style={styles.itemBlock}>
                      <div style={styles.itemRow}>
                        <select style={{ ...styles.select, flex: 1 }} value={item.productId}
                          onChange={e => updateItem(i, 'productId', e.target.value)} required>
                          <option value="">Selecciona producto</option>
                          {products.filter(p => p.stock > 0).map(p => (
                            <option key={p.id} value={p.id}>
                              {p.referenceNumber ? `[${p.referenceNumber}] ` : ''}{p.name} — Stock: {p.stock} — ${parseFloat(p.price).toLocaleString('es-CO')}
                            </option>
                          ))}
                        </select>
                        <input style={{ ...styles.input, width: '80px' }} type="number" min="1" value={item.quantity}
                          onChange={e => updateItem(i, 'quantity', e.target.value)} required />
                        {items.length > 1 && (
                          <button type="button" style={styles.btnRemoveItem} onClick={() => removeItem(i)}>✕</button>
                        )}
                      </div>
                      {sizes.length > 0 && (
                        <select style={{ ...styles.select, marginTop: '6px', width: '100%' }}
                          value={item.productSizeId}
                          onChange={e => updateItem(i, 'productSizeId', e.target.value)}
                          required>
                          <option value="">Selecciona talla *</option>
                          {sizes.map(s => (
                            <option key={s.id} value={s.id} disabled={s.stock === 0}>
                              Talla {s.sizeName} — Stock: {s.stock}{s.stock === 0 ? ' (Agotado)' : ''}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  );
                })}
                <button type="button" style={styles.btnAdd} onClick={addItem}>+ Agregar producto</button>
              </div>

              {error && <p style={styles.error}>{error}</p>}
              <div style={styles.modalActions}>
                <button type="button" style={styles.btnSecondary} onClick={closeForm}>Cancelar</button>
                <button type="submit" style={styles.btnPrimary}>Registrar Venta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detalle de venta */}
      {selected && (
        <div style={styles.overlay} onClick={() => setSelected(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.detailHeader}>
              <h2 style={styles.modalTitle}>Venta #{selected.id}</h2>
              <span style={{ ...styles.payTypeBadge, background: selected.paymentType === 'CREDITO' ? '#fff3e0' : '#e8f5e9', color: selected.paymentType === 'CREDITO' ? '#e67e22' : '#2e7d32' }}>
                {selected.paymentType === 'CREDITO' ? '📋 Crédito' : '💵 Contado'}
              </span>
            </div>
            <p style={{ color: '#888', fontSize: '13px', marginBottom: '16px' }}>
              {new Date(selected.saleDate).toLocaleString('es-CO')}
            </p>

            {selected.paymentType === 'CREDITO' && (
              <div style={styles.creditInfo}>
                <p style={styles.creditInfoItem}><strong>Comprador:</strong> {selected.buyerName}</p>
                <p style={styles.creditInfoItem}><strong>Inicial:</strong> ${parseFloat(selected.initialPayment || 0).toLocaleString('es-CO')}</p>
                <p style={{ ...styles.creditInfoItem, color: parseFloat(selected.remainingBalance) > 0 ? '#e74c3c' : '#2e7d32' }}>
                  <strong>Saldo restante:</strong> ${parseFloat(selected.remainingBalance || 0).toLocaleString('es-CO')}
                </p>
              </div>
            )}

            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Producto</th>
                  <th style={styles.th}>Talla</th>
                  <th style={styles.th}>Cant.</th>
                  <th style={styles.th}>Precio Unit.</th>
                  <th style={styles.th}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selected.items.map(item => (
                  <tr key={item.id}>
                    <td style={styles.td}>
                      {item.referenceNumber && <span style={{ color: '#c9a96e', fontSize: '11px', marginRight: '6px' }}>#{item.referenceNumber}</span>}
                      {item.productName}
                    </td>
                    <td style={styles.td}>{item.sizeName || '—'}</td>
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

            {/* Pagos a crédito */}
            {selected.paymentType === 'CREDITO' && selected.creditPayments?.length > 0 && (
              <div style={styles.paymentsSection}>
                <h3 style={styles.paymentsTitle}>Cuotas</h3>
                {selected.creditPayments.map(cp => (
                  <div key={cp.id} style={{ ...styles.paymentRow, opacity: cp.paid ? 0.6 : 1 }}>
                    <div>
                      <span style={styles.paymentAmount}>${parseFloat(cp.amount).toLocaleString('es-CO')}</span>
                      {cp.dueDate && <span style={styles.paymentDate}> · Vence: {cp.dueDate}</span>}
                      {cp.notes && <span style={styles.paymentNote}> · {cp.notes}</span>}
                      {cp.paid && cp.paidDate && <span style={{ color: '#2e7d32', fontSize: '12px' }}> ✓ Pagado el {cp.paidDate}</span>}
                    </div>
                    {!cp.paid && (
                      <button style={styles.btnMarkPaid} onClick={() => handleMarkPaid(selected.id, cp.id)}>
                        Marcar pagado
                      </button>
                    )}
                    {cp.paid && <span style={styles.paidBadge}>✓ Pagado</span>}
                  </div>
                ))}
              </div>
            )}

            <button style={{ ...styles.btnSecondary, marginTop: '20px' }} onClick={() => setSelected(null)}>Cerrar</button>
          </div>
        </div>
      )}

      <div style={styles.list}>
        {sales.map(sale => (
          <div key={sale.id} style={styles.saleCard} onClick={() => setSelected(sale)}>
            <div style={styles.saleLeft}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={styles.saleId}>Venta #{sale.id}</span>
                <span style={{ ...styles.payTypeBadge, fontSize: '11px', background: sale.paymentType === 'CREDITO' ? '#fff3e0' : '#e8f5e9', color: sale.paymentType === 'CREDITO' ? '#e67e22' : '#2e7d32' }}>
                  {sale.paymentType === 'CREDITO' ? 'Crédito' : 'Contado'}
                </span>
              </div>
              <span style={styles.saleDate}>
                {new Date(sale.saleDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
              {sale.buyerName && <span style={{ fontSize: '12px', color: '#888' }}>{sale.buyerName}</span>}
            </div>
            <div style={styles.saleRight}>
              <span style={styles.saleItems}>{sale.items.length} item(s)</span>
              <span style={styles.saleTotal}>${parseFloat(sale.totalAmount).toLocaleString('es-CO')}</span>
              {sale.paymentType === 'CREDITO' && parseFloat(sale.remainingBalance) > 0 && (
                <span style={styles.pendingBadge}>Saldo: ${parseFloat(sale.remainingBalance).toLocaleString('es-CO')}</span>
              )}
              {sale.paymentType === 'CREDITO' && parseFloat(sale.remainingBalance) === 0 && (
                <span style={styles.paidBadge}>✓ Saldado</span>
              )}
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
  statsRow: { display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' },
  statCard: { background: '#fff', borderRadius: '12px', padding: '18px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', minWidth: '160px' },
  statLabel: { fontSize: '11px', color: '#888', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '1px' },
  statValue: { fontSize: '26px', fontWeight: '800', color: '#1a1a2e', margin: 0 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  modal: { background: '#fff', borderRadius: '16px', padding: '36px', width: '580px', maxWidth: '92vw', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontSize: '22px', fontWeight: '700', color: '#1a1a2e', margin: '0', fontFamily: 'Georgia, serif' },
  formGroup: { marginBottom: '14px' },
  label: { fontSize: '12px', fontWeight: '600', color: '#555', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' },
  input: { padding: '10px 12px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' },
  select: { padding: '10px 12px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#fff' },
  paymentToggle: { display: 'flex', gap: '10px' },
  payBtn: { flex: 1, padding: '10px', border: '1.5px solid #e0e0e0', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px', color: '#888' },
  payBtnActive: { border: '1.5px solid #1a1a2e', background: '#1a1a2e', color: '#fff' },
  payBtnActiveCredito: { border: '1.5px solid #e67e22', background: '#e67e22', color: '#fff' },
  creditSection: { background: '#fff8f0', borderRadius: '10px', padding: '16px', marginTop: '12px', border: '1px solid #fdd9b5' },
  creditRow: { display: 'flex', gap: '12px', alignItems: 'flex-end' },
  cpRow: { display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' },
  itemBlock: { marginBottom: '10px' },
  itemRow: { display: 'flex', gap: '10px', alignItems: 'center' },
  btnRemoveItem: { background: '#fde8e8', color: '#e74c3c', border: 'none', borderRadius: '6px', width: '34px', height: '34px', cursor: 'pointer', fontWeight: '700', flexShrink: 0 },
  btnAdd: { background: 'none', border: '1.5px dashed #c9a96e', color: '#c9a96e', borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', width: '100%', marginTop: '4px' },
  error: { color: '#e74c3c', fontSize: '13px', margin: '8px 0' },
  modalActions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' },
  detailHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' },
  payTypeBadge: { fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '12px' },
  creditInfo: { background: '#fff8f0', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', border: '1px solid #fdd9b5' },
  creditInfoItem: { margin: '4px 0', fontSize: '14px', color: '#555' },
  table: { width: '100%', borderCollapse: 'collapse', marginBottom: '12px' },
  th: { textAlign: 'left', padding: '10px 12px', background: '#f8f7f4', fontSize: '11px', fontWeight: '700', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' },
  td: { padding: '10px 12px', fontSize: '13px', color: '#333', borderBottom: '1px solid #f0f0f0' },
  totalRow: { display: 'flex', justifyContent: 'flex-end', gap: '16px', alignItems: 'center', paddingTop: '12px', borderTop: '2px solid #f0f0f0' },
  totalLabel: { fontWeight: '700', color: '#555', fontSize: '15px' },
  totalValue: { fontWeight: '800', color: '#c9a96e', fontSize: '22px' },
  paymentsSection: { marginTop: '16px', borderTop: '1px solid #e0e0e0', paddingTop: '14px' },
  paymentsTitle: { fontSize: '14px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 10px' },
  paymentRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f7f4', borderRadius: '8px', padding: '10px 14px', marginBottom: '8px' },
  paymentAmount: { fontWeight: '700', color: '#1a1a2e', fontSize: '14px' },
  paymentDate: { color: '#888', fontSize: '12px' },
  paymentNote: { color: '#aaa', fontSize: '12px', fontStyle: 'italic' },
  btnMarkPaid: { padding: '6px 14px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' },
  paidBadge: { background: '#e8f5e9', color: '#2e7d32', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '10px' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  saleCard: { background: '#fff', borderRadius: '12px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer' },
  saleLeft: { display: 'flex', flexDirection: 'column', gap: '3px' },
  saleId: { fontWeight: '700', color: '#1a1a2e', fontSize: '15px' },
  saleDate: { fontSize: '12px', color: '#888' },
  saleRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' },
  saleItems: { fontSize: '12px', color: '#888' },
  saleTotal: { fontWeight: '800', color: '#c9a96e', fontSize: '18px' },
  pendingBadge: { background: '#fde8e8', color: '#e74c3c', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '10px' },
};