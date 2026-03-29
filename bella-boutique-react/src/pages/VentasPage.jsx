import { useEffect, useState, useMemo } from 'react';
import api from '../api/axios';

const EMPTY_CREDIT_PAYMENT = { amount: '', dueDate: '', notes: '' };

export default function VentasPage() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState([{ productId: '', productSizeId: '', quantity: 1, unitPrice: '' }]);
  const [paymentType, setPaymentType] = useState('CONTADO');
  const [buyerName, setBuyerName] = useState('');
  const [initialPayment, setInitialPayment] = useState('');
  const [creditPayments, setCreditPayments] = useState([{ ...EMPTY_CREDIT_PAYMENT }]);
  const [sellerMode, setSellerMode] = useState('list'); // 'list' | 'manual'
  const [selectedSellerId, setSelectedSellerId] = useState('');
  const [manualSellerName, setManualSellerName] = useState('');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('todos'); // 'todos' | 'contado' | 'credito'

  const loadData = async () => {
    const [salesRes, productsRes, sellersRes] = await Promise.all([
      api.get('/api/sales'),
      api.get('/api/products'),
      api.get('/api/sellers'),
    ]);
    setSales(salesRes.data);
    setProducts(productsRes.data);
    setSellers(sellersRes.data);
  };

  useEffect(() => { loadData(); }, []);

  // ── Items del formulario ──────────────────────────────────────────────────
  const addItem = () => setItems([...items, { productId: '', productSizeId: '', quantity: 1, unitPrice: '' }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    if (field === 'productId') { updated[i].productSizeId = ''; updated[i].unitPrice = ''; }
    setItems(updated);
  };
  const getSizesForItem = (item) => products.find(p => p.id === parseInt(item.productId))?.sizes || [];

  // ── Cuotas ────────────────────────────────────────────────────────────────
  const addCreditPayment = () => setCreditPayments([...creditPayments, { ...EMPTY_CREDIT_PAYMENT }]);
  const removeCreditPayment = (i) => setCreditPayments(creditPayments.filter((_, idx) => idx !== i));
  const updateCreditPayment = (i, field, value) => {
    const updated = [...creditPayments];
    updated[i] = { ...updated[i], [field]: value };
    setCreditPayments(updated);
  };

  // ── Nombre del vendedor para enviar ──────────────────────────────────────
  const getSellerName = () => {
    if (sellerMode === 'list' && selectedSellerId) {
      const s = sellers.find(s => s.id === parseInt(selectedSellerId));
      return s ? `${s.firstName} ${s.lastName}` : '';
    }
    return manualSellerName.trim();
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        paymentType,
        sellerName: getSellerName() || undefined,
        buyerName: paymentType === 'CREDITO' ? buyerName : undefined,
        initialPayment: paymentType === 'CREDITO' && initialPayment ? parseInt(initialPayment) : undefined,
        creditPayments: paymentType === 'CREDITO' ? creditPayments.map(cp => ({
          amount: parseInt(cp.amount),
          dueDate: cp.dueDate || undefined,
          notes: cp.notes || undefined,
        })) : undefined,
        items: items.map(it => ({
          productId: parseInt(it.productId),
          productSizeId: it.productSizeId ? parseInt(it.productSizeId) : undefined,
          quantity: parseInt(it.quantity),
          unitPrice: it.unitPrice ? parseInt(it.unitPrice) : undefined,
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
    setItems([{ productId: '', productSizeId: '', quantity: 1, unitPrice: '' }]);
    setPaymentType('CONTADO');
    setBuyerName('');
    setInitialPayment('');
    setCreditPayments([{ ...EMPTY_CREDIT_PAYMENT }]);
    setSellerMode('list');
    setSelectedSellerId('');
    setManualSellerName('');
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

  // ── Filtrado ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return sales.filter(s => {
      const byTab = activeTab === 'todos' || s.paymentType === activeTab.toUpperCase();
      if (!byTab) return false;
      if (!q) return true;
      const fecha = new Date(s.saleDate).toLocaleDateString('es-CO');
      const productos = s.items.map(i => i.productName.toLowerCase()).join(' ');
      const vendedor = (s.sellerName || '').toLowerCase();
      return fecha.includes(q) || productos.includes(q) || vendedor.includes(q)
        || (s.buyerName || '').toLowerCase().includes(q);
    });
  }, [sales, search, activeTab]);

  const contadoList = filtered.filter(s => s.paymentType === 'CONTADO');
  const creditoList = filtered.filter(s => s.paymentType === 'CREDITO');

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalVentas = sales.reduce((acc, s) => acc + parseFloat(s.totalAmount), 0);
  const saldoPendiente = sales.filter(s => s.paymentType === 'CREDITO')
    .reduce((acc, s) => acc + parseFloat(s.remainingBalance || 0), 0);
  const gananciaTotal = sales.reduce((acc, s) =>
    acc + s.items.reduce((a, i) => {
      if (!i.purchasePrice) return a;
      return a + (parseFloat(i.unitPrice) - parseFloat(i.purchasePrice)) * i.quantity;
    }, 0), 0);

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Ventas</h1>
          <p style={styles.count}>{sales.length} ventas registradas</p>
        </div>
        <button style={styles.btnPrimary} onClick={() => setShowForm(true)}>+ Nueva Venta</button>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        {[
          { label: 'Total ventas', val: sales.length, color: '#3d2027' },
          { label: 'Ingresos totales', val: `$${Math.round(totalVentas).toLocaleString('es-CO')}`, color: '#c9a96e' },
          { label: 'Contado', val: sales.filter(s => s.paymentType === 'CONTADO').length, color: '#27ae60' },
          { label: 'Crédito', val: sales.filter(s => s.paymentType === 'CREDITO').length, color: '#e67e22' },
          { label: 'Saldo por cobrar', val: `$${Math.round(saldoPendiente).toLocaleString('es-CO')}`, color: '#e74c3c' },
          { label: 'Ganancia bruta', val: `$${Math.round(gananciaTotal).toLocaleString('es-CO')}`, color: '#27ae60' },
        ].map(({ label, val, color }) => (
          <div key={label} style={styles.statCard}>
            <p style={styles.statLabel}>{label}</p>
            <p style={{ ...styles.statValue, color }}>{val}</p>
          </div>
        ))}
      </div>

      {/* Buscador + tabs */}
      <div style={styles.toolBar}>
        <input
          style={styles.searchInput}
          placeholder="Buscar por fecha, producto, vendedor o comprador..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={styles.tabs}>
          {[['todos', 'Todos'], ['contado', 'Contado'], ['credito', 'Crédito']].map(([k, l]) => (
            <button
              key={k}
              style={{ ...styles.tab, ...(activeTab === k ? styles.tabActive : {}) }}
              onClick={() => setActiveTab(k)}
            >
              {l}
              <span style={styles.tabCount}>
                {k === 'todos' ? filtered.length : filtered.filter(s => s.paymentType === k.toUpperCase()).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Columnas Contado / Crédito */}
      {activeTab === 'todos' ? (
        <div style={styles.columns}>
          <SalesColumn title="Contado" color="#27ae60" sales={contadoList} onSelect={setSelected} />
          <SalesColumn title="Crédito" color="#e67e22" sales={creditoList} onSelect={setSelected} />
        </div>
      ) : (
        <div style={styles.singleColumn}>
          {filtered.map(sale => <SaleCard key={sale.id} sale={sale} onSelect={setSelected} />)}
          {filtered.length === 0 && <p style={styles.empty}>Sin ventas que coincidan</p>}
        </div>
      )}

      {/* Modal: Nueva Venta */}
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
                    style={{ ...styles.payBtn, ...(paymentType === 'CONTADO' ? styles.payBtnContado : {}) }}
                    onClick={() => setPaymentType('CONTADO')}>Contado
                  </button>
                  <button type="button"
                    style={{ ...styles.payBtn, ...(paymentType === 'CREDITO' ? styles.payBtnCredito : {}) }}
                    onClick={() => setPaymentType('CREDITO')}>Crédito
                  </button>
                </div>
              </div>

              {/* Vendedor */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Vendedor</label>
                <div style={styles.sellerModeToggle}>
                  <button type="button"
                    style={{ ...styles.sellerModeBtn, ...(sellerMode === 'list' ? styles.sellerModeBtnActive : {}) }}
                    onClick={() => { setSellerMode('list'); setManualSellerName(''); }}>
                    Del listado
                  </button>
                  <button type="button"
                    style={{ ...styles.sellerModeBtn, ...(sellerMode === 'manual' ? styles.sellerModeBtnActive : {}) }}
                    onClick={() => { setSellerMode('manual'); setSelectedSellerId(''); }}>
                    Otro
                  </button>
                </div>
                {sellerMode === 'list' ? (
                  <select style={styles.select} value={selectedSellerId} onChange={e => setSelectedSellerId(e.target.value)}>
                    <option value="">— Sin asignar —</option>
                    {sellers.map(s => (
                      <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                    ))}
                  </select>
                ) : (
                  <input style={styles.input} placeholder="Nombre completo del vendedor"
                    value={manualSellerName} onChange={e => setManualSellerName(e.target.value)} />
                )}
              </div>

              {/* Datos crédito */}
              {paymentType === 'CREDITO' && (
                <div style={styles.creditSection}>
                  <div style={styles.creditRow}>
                    <div style={{ flex: 1 }}>
                      <label style={styles.label}>Nombre del Comprador *</label>
                      <input style={styles.input} value={buyerName} onChange={e => setBuyerName(e.target.value)} required placeholder="Nombre completo" />
                    </div>
                    <div style={{ width: '160px' }}>
                      <label style={styles.label}>Inicial ($)</label>
                      <input style={styles.input} type="number" step="1" min="0" value={initialPayment}
                        onChange={e => setInitialPayment(e.target.value)} placeholder="0" />
                    </div>
                  </div>
                  <label style={{ ...styles.label, marginTop: '12px', display: 'block' }}>Cuotas / Fechas de pago</label>
                  {creditPayments.map((cp, i) => (
                    <div key={i} style={styles.cpRow}>
                      <input style={{ ...styles.input, width: '120px' }} type="number" step="1" min="0"
                        placeholder="Monto" value={cp.amount}
                        onChange={e => updateCreditPayment(i, 'amount', e.target.value)} required />
                      <input style={{ ...styles.input, flex: 1 }} type="date" value={cp.dueDate}
                        onChange={e => updateCreditPayment(i, 'dueDate', e.target.value)} />
                      <input style={{ ...styles.input, flex: 1 }} placeholder="Nota" value={cp.notes}
                        onChange={e => updateCreditPayment(i, 'notes', e.target.value)} />
                      {creditPayments.length > 1 && (
                        <button type="button" style={styles.btnRemoveItem} onClick={() => removeCreditPayment(i)}>✕</button>
                      )}
                    </div>
                  ))}
                  <button type="button" style={styles.btnAdd} onClick={addCreditPayment}>+ Agregar cuota</button>
                </div>
              )}

              {/* Productos */}
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
                              {p.referenceNumber ? `[${p.referenceNumber}] ` : ''}{p.name} — Stock: {p.stock} — ${Math.round(parseFloat(p.price)).toLocaleString('es-CO')}
                            </option>
                          ))}
                        </select>
                        <input style={{ ...styles.input, width: '80px' }} type="number" min="1" step="1"
                          value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} required />
                        {items.length > 1 && (
                          <button type="button" style={styles.btnRemoveItem} onClick={() => removeItem(i)}>✕</button>
                        )}
                      </div>
                      {item.productId && (
                        <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <label style={{ ...styles.label, margin: 0, whiteSpace: 'nowrap' }}>Precio venta ($)</label>
                          <input style={{ ...styles.input, width: '140px' }} type="number" min="0" step="1"
                            placeholder={(() => { const p = products.find(p => p.id === parseInt(item.productId)); return p ? Math.round(parseFloat(p.price)).toString() : ''; })()}
                            value={item.unitPrice}
                            onChange={e => updateItem(i, 'unitPrice', e.target.value)} />
                          <span style={{ fontSize: '11px', color: '#b08080' }}>vacío = precio del producto</span>
                        </div>
                      )}
                      {sizes.length > 0 && (
                        <select style={{ ...styles.select, marginTop: '6px', width: '100%' }}
                          value={item.productSizeId} onChange={e => updateItem(i, 'productSizeId', e.target.value)} required>
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

      {/* Modal: Detalle venta */}
      {selected && (
        <div style={styles.overlay} onClick={() => setSelected(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.detailHeader}>
              <h2 style={styles.modalTitle}>Venta #{selected.id}</h2>
              <span style={{ ...styles.payTypeBadge, background: selected.paymentType === 'CREDITO' ? '#fff3e0' : '#e8f5e9', color: selected.paymentType === 'CREDITO' ? '#e67e22' : '#2e7d32' }}>
                {selected.paymentType === 'CREDITO' ? 'Crédito' : 'Contado'}
              </span>
            </div>
            <p style={styles.detailMeta}>
              {new Date(selected.saleDate).toLocaleString('es-CO')}
              {selected.sellerName && <> · Vendedor: <strong>{selected.sellerName}</strong></>}
            </p>

            {selected.paymentType === 'CREDITO' && (
              <div style={styles.creditInfo}>
                <p style={styles.creditInfoItem}><strong>Comprador:</strong> {selected.buyerName}</p>
                <p style={styles.creditInfoItem}><strong>Inicial:</strong> ${Math.round(parseFloat(selected.initialPayment || 0)).toLocaleString('es-CO')}</p>
                <p style={{ ...styles.creditInfoItem, color: parseFloat(selected.remainingBalance) > 0 ? '#e74c3c' : '#2e7d32' }}>
                  <strong>Saldo restante:</strong> ${Math.round(parseFloat(selected.remainingBalance || 0)).toLocaleString('es-CO')}
                </p>
              </div>
            )}

            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Producto</th>
                  <th style={styles.th}>Talla</th>
                  <th style={styles.th}>Cant.</th>
                  <th style={styles.th}>Precio</th>
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
                    <td style={styles.td}>${Math.round(parseFloat(item.unitPrice)).toLocaleString('es-CO')}</td>
                    <td style={styles.td}>${Math.round(item.quantity * parseFloat(item.unitPrice)).toLocaleString('es-CO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Total:</span>
              <span style={styles.totalValue}>${Math.round(parseFloat(selected.totalAmount)).toLocaleString('es-CO')}</span>
            </div>

            {selected.paymentType === 'CREDITO' && selected.creditPayments?.length > 0 && (
              <div style={styles.paymentsSection}>
                <h3 style={styles.paymentsTitle}>Cuotas</h3>
                {selected.creditPayments.map(cp => (
                  <div key={cp.id} style={{ ...styles.paymentRow, opacity: cp.paid ? 0.6 : 1 }}>
                    <div>
                      <span style={styles.paymentAmount}>${Math.round(parseFloat(cp.amount)).toLocaleString('es-CO')}</span>
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
    </div>
  );
}

// ── Componentes auxiliares ────────────────────────────────────────────────────
function SalesColumn({ title, color, sales, onSelect }) {
  return (
    <div style={colStyles.col}>
      <div style={{ ...colStyles.colHeader, borderColor: color }}>
        <span style={{ ...colStyles.colTitle, color }}>{title}</span>
        <span style={colStyles.colCount}>{sales.length}</span>
      </div>
      <div style={colStyles.colBody}>
        {sales.length === 0 && <p style={colStyles.empty}>Sin ventas</p>}
        {sales.map(sale => <SaleCard key={sale.id} sale={sale} onSelect={onSelect} compact />)}
      </div>
    </div>
  );
}

function SaleCard({ sale, onSelect, compact }) {
  const fecha = new Date(sale.saleDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  const total = Math.round(parseFloat(sale.totalAmount));
  const saldo = Math.round(parseFloat(sale.remainingBalance || 0));
  const inicial = Math.round(parseFloat(sale.initialPayment || 0));
  return (
    <div style={{ ...colStyles.card, ...(compact ? colStyles.cardCompact : {}) }} onClick={() => onSelect(sale)}>
      <div style={colStyles.cardTop}>
        <span style={colStyles.cardId}>Venta #{sale.id}</span>
        <span style={{ ...colStyles.typeBadge, background: sale.paymentType === 'CREDITO' ? '#fff3e0' : '#e8f5e9', color: sale.paymentType === 'CREDITO' ? '#e67e22' : '#27ae60' }}>
          {sale.paymentType === 'CREDITO' ? 'Crédito' : 'Contado'}
        </span>
      </div>
      <p style={colStyles.cardDate}>{fecha}</p>
      {sale.sellerName && <p style={colStyles.cardSeller}>Vendedor: {sale.sellerName}</p>}
      {sale.buyerName && <p style={colStyles.cardBuyer}>Comprador: {sale.buyerName}</p>}
      <div style={colStyles.cardBottom}>
        <span style={colStyles.cardTotal}>${total.toLocaleString('es-CO')}</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
          {sale.paymentType === 'CREDITO' && inicial > 0 && (
            <span style={colStyles.inicialBadge}>Inicial: ${inicial.toLocaleString('es-CO')}</span>
          )}
          {sale.paymentType === 'CREDITO' && saldo > 0 && (
            <span style={colStyles.pendingBadge}>Saldo: ${saldo.toLocaleString('es-CO')}</span>
          )}
          {sale.paymentType === 'CREDITO' && saldo === 0 && (
            <span style={colStyles.paidBadge}>✓ Saldado</span>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '32px 40px', background: '#fdf0ed', minHeight: 'calc(100vh - 68px)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#3d2027', margin: 0, fontFamily: 'Georgia, serif' },
  count: { color: '#b08080', fontSize: '14px', margin: '4px 0 0' },
  btnPrimary: { padding: '10px 20px', background: '#3d2027', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  btnSecondary: { padding: '10px 20px', background: '#fff', color: '#3d2027', border: '1.5px solid #3d2027', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  statsRow: { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' },
  statCard: { background: '#fff', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 2px 8px rgba(61,32,39,0.06)', minWidth: '140px' },
  statLabel: { fontSize: '11px', color: '#b08080', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '1px' },
  statValue: { fontSize: '22px', fontWeight: '800', color: '#3d2027', margin: 0 },
  toolBar: { display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' },
  searchInput: { flex: 1, minWidth: '240px', padding: '10px 16px', border: '1.5px solid #f0d0ca', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#fff', color: '#3d2027' },
  tabs: { display: 'flex', gap: '6px' },
  tab: { padding: '8px 16px', border: '1.5px solid #f0d0ca', borderRadius: '20px', background: '#fff', color: '#9e7070', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  tabActive: { background: '#3d2027', color: '#fff', border: '1.5px solid #3d2027' },
  tabCount: { background: 'rgba(255,255,255,0.2)', borderRadius: '10px', padding: '1px 6px', fontSize: '11px' },
  columns: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  singleColumn: { display: 'flex', flexDirection: 'column', gap: '10px' },
  empty: { color: '#b08080', textAlign: 'center', padding: '24px', fontSize: '14px' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  modal: { background: '#fff', borderRadius: '16px', padding: '36px', width: '600px', maxWidth: '93vw', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontSize: '22px', fontWeight: '700', color: '#3d2027', margin: '0 0 4px', fontFamily: 'Georgia, serif' },
  detailHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' },
  detailMeta: { color: '#b08080', fontSize: '13px', marginBottom: '16px' },
  formGroup: { marginBottom: '14px' },
  label: { fontSize: '12px', fontWeight: '600', color: '#7d4255', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' },
  input: { padding: '10px 12px', border: '1.5px solid #f0d0ca', borderRadius: '8px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box', color: '#3d2027' },
  select: { padding: '10px 12px', border: '1.5px solid #f0d0ca', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#fff', width: '100%', color: '#3d2027' },
  paymentToggle: { display: 'flex', gap: '10px' },
  payBtn: { flex: 1, padding: '10px', border: '1.5px solid #f0d0ca', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px', color: '#b08080' },
  payBtnContado: { border: '1.5px solid #27ae60', background: '#27ae60', color: '#fff' },
  payBtnCredito: { border: '1.5px solid #e67e22', background: '#e67e22', color: '#fff' },
  sellerModeToggle: { display: 'flex', gap: '8px', marginBottom: '8px' },
  sellerModeBtn: { padding: '6px 14px', border: '1.5px solid #f0d0ca', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#9e7070' },
  sellerModeBtnActive: { background: '#3d2027', color: '#fff', border: '1.5px solid #3d2027' },
  creditSection: { background: '#fff8f0', borderRadius: '10px', padding: '16px', marginTop: '4px', border: '1px solid #fdd9b5' },
  creditRow: { display: 'flex', gap: '12px', alignItems: 'flex-end' },
  cpRow: { display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' },
  itemBlock: { marginBottom: '10px' },
  itemRow: { display: 'flex', gap: '10px', alignItems: 'center' },
  btnRemoveItem: { background: '#fde8e8', color: '#e74c3c', border: 'none', borderRadius: '6px', width: '34px', height: '34px', cursor: 'pointer', fontWeight: '700', flexShrink: 0 },
  btnAdd: { background: 'none', border: '1.5px dashed #c9a96e', color: '#c9a96e', borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', width: '100%', marginTop: '4px' },
  error: { color: '#c0394a', fontSize: '13px', margin: '8px 0' },
  modalActions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' },
  payTypeBadge: { fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '12px' },
  creditInfo: { background: '#fff8f0', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', border: '1px solid #fdd9b5' },
  creditInfoItem: { margin: '4px 0', fontSize: '14px', color: '#5a3540' },
  table: { width: '100%', borderCollapse: 'collapse', marginBottom: '12px' },
  th: { textAlign: 'left', padding: '10px 12px', background: '#fdf0ed', fontSize: '11px', fontWeight: '700', color: '#7d4255', textTransform: 'uppercase', letterSpacing: '0.5px' },
  td: { padding: '10px 12px', fontSize: '13px', color: '#3d2027', borderBottom: '1px solid #f5eded' },
  totalRow: { display: 'flex', justifyContent: 'flex-end', gap: '16px', alignItems: 'center', paddingTop: '12px', borderTop: '2px solid #f5eded' },
  totalLabel: { fontWeight: '700', color: '#7d4255', fontSize: '15px' },
  totalValue: { fontWeight: '800', color: '#c9a96e', fontSize: '22px' },
  paymentsSection: { marginTop: '16px', borderTop: '1px solid #f0e0e0', paddingTop: '14px' },
  paymentsTitle: { fontSize: '14px', fontWeight: '700', color: '#3d2027', margin: '0 0 10px' },
  paymentRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fdf0ed', borderRadius: '8px', padding: '10px 14px', marginBottom: '8px' },
  paymentAmount: { fontWeight: '700', color: '#3d2027', fontSize: '14px' },
  paymentDate: { color: '#b08080', fontSize: '12px' },
  paymentNote: { color: '#b08080', fontSize: '12px', fontStyle: 'italic' },
  btnMarkPaid: { padding: '6px 14px', background: '#3d2027', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' },
  paidBadge: { background: '#e8f5e9', color: '#2e7d32', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '10px' },
};

const colStyles = {
  col: { background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(61,32,39,0.06)', display: 'flex', flexDirection: 'column' },
  colHeader: { padding: '14px 20px', borderBottom: '3px solid', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  colTitle: { fontWeight: '800', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '1px' },
  colCount: { background: '#fdf0ed', color: '#7d4255', borderRadius: '12px', padding: '2px 10px', fontSize: '12px', fontWeight: '700' },
  colBody: { padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '65vh', overflowY: 'auto' },
  empty: { color: '#b08080', textAlign: 'center', padding: '24px', fontSize: '13px' },
  card: { background: '#fdf0ed', borderRadius: '10px', padding: '14px 16px', cursor: 'pointer', border: '1.5px solid transparent', transition: 'border 0.15s' },
  cardCompact: { padding: '12px 14px' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
  cardId: { fontWeight: '700', color: '#3d2027', fontSize: '14px' },
  typeBadge: { fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' },
  cardDate: { fontSize: '12px', color: '#b08080', margin: '2px 0' },
  cardSeller: { fontSize: '12px', color: '#7d4255', margin: '1px 0', fontWeight: '600' },
  cardBuyer: { fontSize: '12px', color: '#9e7070', margin: '1px 0' },
  cardBottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' },
  cardTotal: { fontWeight: '800', color: '#c9a96e', fontSize: '16px' },
  inicialBadge: { background: '#e8f0fe', color: '#3d7de8', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' },
  pendingBadge: { background: '#fde8e8', color: '#e74c3c', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' },
  paidBadge: { background: '#e8f5e9', color: '#2e7d32', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' },
};