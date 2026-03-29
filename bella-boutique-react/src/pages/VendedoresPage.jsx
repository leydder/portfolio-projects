import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function parseFechaLocal(fechaStr) {
  if (!fechaStr) return null;
  const s = fechaStr.includes('T') ? fechaStr : fechaStr + 'T00:00:00';
  return new Date(s);
}

function agruparVendedores(sales) {
  const mapa = {};
  for (const sale of sales) {
    const key = sale.sellerName || 'Sin asignar';
    if (!mapa[key]) mapa[key] = { username: key, sales: [], totalAmount: 0, totalVentas: 0 };
    mapa[key].sales.push(sale);
    mapa[key].totalAmount += parseFloat(sale.totalAmount);
    mapa[key].totalVentas += 1;
  }
  return Object.values(mapa).sort((a, b) => b.totalAmount - a.totalAmount);
}

function agruparPorMes(sales) {
  const mapa = {};
  for (const sale of sales) {
    const fecha = parseFechaLocal(sale.saleDate);
    const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    if (!mapa[key]) mapa[key] = { key, year: fecha.getFullYear(), month: fecha.getMonth(), sales: [] };
    mapa[key].sales.push(sale);
  }
  return Object.values(mapa).sort((a, b) => b.key.localeCompare(a.key));
}

const EMPTY_SELLER = { firstName: '', lastName: '' };

export default function VendedoresPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [sales, setSales] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [selectedVendedor, setSelectedVendedor] = useState(null);
  const [selectedMesKey, setSelectedMesKey] = useState('todos');

  // CRUD vendedores
  const [showSellerForm, setShowSellerForm] = useState(false);
  const [sellerForm, setSellerForm] = useState(EMPTY_SELLER);
  const [editSellerId, setEditSellerId] = useState(null);
  const [sellerError, setSellerError] = useState('');

  const loadData = async () => {
    const [salesRes, sellersRes] = await Promise.all([
      api.get('/api/sales'),
      api.get('/api/sellers'),
    ]);
    setSales(salesRes.data);
    setSellers(sellersRes.data);
  };

  useEffect(() => { loadData(); }, []);

  const vendedores = agruparVendedores(sales);

  const handleSelectVendedor = (v) => {
    setSelectedVendedor(v);
    setSelectedMesKey('todos');
  };

  const gruposMes = selectedVendedor ? agruparPorMes(selectedVendedor.sales) : [];
  const ventasFiltradas = selectedMesKey === 'todos'
    ? selectedVendedor?.sales ?? []
    : (gruposMes.find(g => g.key === selectedMesKey)?.sales ?? []);

  // ── CRUD vendedores ─────────────────────────────────────────────────────────
  const openNewSeller = () => {
    setSellerForm(EMPTY_SELLER);
    setEditSellerId(null);
    setSellerError('');
    setShowSellerForm(true);
  };

  const openEditSeller = (s) => {
    setSellerForm({ firstName: s.firstName, lastName: s.lastName });
    setEditSellerId(s.id);
    setSellerError('');
    setShowSellerForm(true);
  };

  const handleSellerSubmit = async (e) => {
    e.preventDefault();
    setSellerError('');
    try {
      if (editSellerId) {
        await api.put(`/api/sellers/${editSellerId}`, sellerForm);
      } else {
        await api.post('/api/sellers', sellerForm);
      }
      setShowSellerForm(false);
      loadData();
    } catch (err) {
      setSellerError(err.response?.data?.message || 'Error al guardar');
    }
  };

  const handleDeleteSeller = async (id) => {
    if (!confirm('¿Eliminar este vendedor del listado?')) return;
    try {
      await api.delete(`/api/sellers/${id}`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo eliminar');
    }
  };

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Vendedores</h1>
          <p style={styles.sub}>Rendimiento por vendedor</p>
        </div>
        {isAdmin && (
          <button style={styles.btnPrimary} onClick={openNewSeller}>+ Nuevo vendedor</button>
        )}
      </div>

      {/* Listado de vendedores registrados (admin) */}
      {isAdmin && sellers.length > 0 && (
        <div style={styles.sellerListCard}>
          <p style={styles.sellerListTitle}>Vendedores registrados</p>
          <div style={styles.sellerChips}>
            {sellers.map(s => (
              <div key={s.id} style={styles.sellerChip}>
                <span style={styles.chipName}>{s.firstName} {s.lastName}</span>
                <button style={styles.chipEdit} onClick={() => openEditSeller(s)}>Editar</button>
                <button style={styles.chipDelete} onClick={() => handleDeleteSeller(s.id)}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Layout principal */}
      <div style={styles.layout}>

        {/* Sidebar: vendedores con ventas */}
        <div style={styles.sidebar}>
          {vendedores.length === 0 && <p style={styles.empty}>Sin ventas registradas</p>}
          {vendedores.map(v => {
            const active = selectedVendedor?.username === v.username;
            return (
              <div key={v.username}
                style={{ ...styles.vendedorCard, ...(active ? styles.vendedorCardActive : {}) }}
                onClick={() => handleSelectVendedor(v)}>
                <div style={styles.avatarRow}>
                  <div style={styles.avatar}>{v.username.charAt(0).toUpperCase()}</div>
                  <div>
                    <p style={styles.vendedorNombre}>{v.username}</p>
                    <p style={styles.vendedorSub}>{v.totalVentas} venta{v.totalVentas !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <p style={styles.vendedorTotal}>${Math.round(v.totalAmount).toLocaleString('es-CO')}</p>
              </div>
            );
          })}
        </div>

        {/* Detalle */}
        <div style={styles.detail}>
          {!selectedVendedor ? (
            <div style={styles.emptyDetail}>
              <p style={{ fontSize: '40px' }}>👗</p>
              <p style={{ color: '#b08080', fontSize: '14px' }}>Selecciona un vendedor para ver su detalle</p>
            </div>
          ) : (
            <>
              <div style={styles.detailHeader}>
                <div style={styles.detailAvatarGrande}>{selectedVendedor.username.charAt(0).toUpperCase()}</div>
                <div>
                  <h2 style={styles.detailTitle}>{selectedVendedor.username}</h2>
                  <p style={styles.detailSub}>
                    {selectedVendedor.totalVentas} ventas · Total ${Math.round(selectedVendedor.totalAmount).toLocaleString('es-CO')}
                  </p>
                </div>
              </div>

              {/* Filtro mes */}
              <div style={styles.filtroMes}>
                <button style={{ ...styles.mesBtnFiltro, ...(selectedMesKey === 'todos' ? styles.mesBtnFiltroActive : {}) }}
                  onClick={() => setSelectedMesKey('todos')}>Todos</button>
                {gruposMes.map(g => (
                  <button key={g.key}
                    style={{ ...styles.mesBtnFiltro, ...(selectedMesKey === g.key ? styles.mesBtnFiltroActive : {}) }}
                    onClick={() => setSelectedMesKey(g.key)}>
                    {MESES[g.month]} {g.year}
                    <span style={styles.mesBtnCount}>{g.sales.length}</span>
                  </button>
                ))}
              </div>

              {/* Tabla ventas */}
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Fecha</th>
                      <th style={styles.th}>Venta #</th>
                      <th style={styles.th}>Producto</th>
                      <th style={styles.th}>Talla</th>
                      <th style={styles.th}>Cant.</th>
                      <th style={styles.th}>Precio unit.</th>
                      <th style={styles.th}>Subtotal</th>
                      <th style={styles.th}>Tipo pago</th>
                      <th style={styles.th}>Total venta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventasFiltradas.length === 0 && (
                      <tr><td colSpan={9} style={{ ...styles.td, textAlign: 'center', color: '#b08080' }}>Sin ventas en este período</td></tr>
                    )}
                    {ventasFiltradas.flatMap(sale =>
                      sale.items.map((item, idx) => (
                        <tr key={`${sale.id}-${item.id}`} style={styles.tr}>
                          {idx === 0 && (
                            <td style={styles.td} rowSpan={sale.items.length}>
                              {parseFechaLocal(sale.saleDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                          )}
                          {idx === 0 && (
                            <td style={styles.td} rowSpan={sale.items.length}>
                              <span style={styles.saleIdBadge}>#{sale.id}</span>
                            </td>
                          )}
                          <td style={styles.td}>
                            {item.referenceNumber && <span style={styles.refTag}>#{item.referenceNumber} </span>}
                            {item.productName}
                          </td>
                          <td style={styles.td}>{item.sizeName || '—'}</td>
                          <td style={{ ...styles.td, textAlign: 'center' }}>{item.quantity}</td>
                          <td style={styles.td}>${Math.round(parseFloat(item.unitPrice)).toLocaleString('es-CO')}</td>
                          <td style={{ ...styles.td, fontWeight: 700 }}>
                            ${Math.round(item.quantity * parseFloat(item.unitPrice)).toLocaleString('es-CO')}
                          </td>
                          {idx === 0 && (
                            <td style={styles.td} rowSpan={sale.items.length}>
                              <span style={{ ...styles.typeBadge, background: sale.paymentType === 'CREDITO' ? '#fff3e0' : '#e8f5e9', color: sale.paymentType === 'CREDITO' ? '#e67e22' : '#2e7d32' }}>
                                {sale.paymentType === 'CREDITO' ? 'Crédito' : 'Contado'}
                              </span>
                            </td>
                          )}
                          {idx === 0 && (
                            <td style={{ ...styles.td, fontWeight: 700, color: '#c9a96e' }} rowSpan={sale.items.length}>
                              ${Math.round(parseFloat(sale.totalAmount)).toLocaleString('es-CO')}
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {ventasFiltradas.length > 0 && (
                <div style={styles.resumenRow}>
                  <div style={styles.resumenCard}>
                    <p style={styles.resumenLabel}>Ventas</p>
                    <p style={styles.resumenVal}>{ventasFiltradas.length}</p>
                  </div>
                  <div style={styles.resumenCard}>
                    <p style={styles.resumenLabel}>Unidades</p>
                    <p style={styles.resumenVal}>{ventasFiltradas.reduce((acc, s) => acc + s.items.reduce((a, i) => a + i.quantity, 0), 0)}</p>
                  </div>
                  <div style={styles.resumenCard}>
                    <p style={styles.resumenLabel}>Total facturado</p>
                    <p style={{ ...styles.resumenVal, color: '#c9a96e' }}>
                      ${Math.round(ventasFiltradas.reduce((acc, s) => acc + parseFloat(s.totalAmount), 0)).toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal: agregar/editar vendedor */}
      {showSellerForm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>{editSellerId ? 'Editar vendedor' : 'Nuevo vendedor'}</h2>
            <form onSubmit={handleSellerSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nombre *</label>
                <input style={styles.input} value={sellerForm.firstName}
                  onChange={e => setSellerForm({ ...sellerForm, firstName: e.target.value })}
                  placeholder="Nombre" required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Apellido *</label>
                <input style={styles.input} value={sellerForm.lastName}
                  onChange={e => setSellerForm({ ...sellerForm, lastName: e.target.value })}
                  placeholder="Apellido" required />
              </div>
              {sellerError && <p style={styles.error}>{sellerError}</p>}
              <div style={styles.modalActions}>
                <button type="button" style={styles.btnSecondary} onClick={() => setShowSellerForm(false)}>Cancelar</button>
                <button type="submit" style={styles.btnPrimary}>{editSellerId ? 'Actualizar' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  page: { padding: '32px 40px', background: '#fdf0ed', minHeight: 'calc(100vh - 68px)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#3d2027', margin: 0, fontFamily: 'Georgia, serif' },
  sub: { color: '#b08080', fontSize: '14px', margin: '4px 0 0' },
  btnPrimary: { padding: '9px 18px', background: '#3d2027', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  btnSecondary: { padding: '9px 18px', background: '#fff', color: '#3d2027', border: '1.5px solid #3d2027', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  sellerListCard: { background: '#fff', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(61,32,39,0.06)' },
  sellerListTitle: { fontSize: '12px', fontWeight: '700', color: '#7d4255', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px' },
  sellerChips: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  sellerChip: { display: 'flex', alignItems: 'center', gap: '6px', background: '#fdf0ed', border: '1.5px solid #f5ddd8', borderRadius: '20px', padding: '5px 10px 5px 14px' },
  chipName: { fontSize: '13px', fontWeight: '600', color: '#3d2027' },
  chipEdit: { background: 'none', border: 'none', color: '#7d4255', cursor: 'pointer', fontSize: '12px', fontWeight: '600', padding: '0 4px' },
  chipDelete: { background: 'none', border: 'none', color: '#c0394a', cursor: 'pointer', fontSize: '13px', fontWeight: '700', padding: '0 2px', lineHeight: '1' },
  layout: { display: 'flex', gap: '24px', alignItems: 'flex-start' },
  sidebar: { width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '10px' },
  vendedorCard: { background: '#fff', borderRadius: '12px', padding: '14px 18px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(61,32,39,0.06)', border: '2px solid transparent', transition: 'border 0.15s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  vendedorCardActive: { border: '2px solid #3d2027' },
  avatarRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', background: '#fce4de', color: '#3d2027', fontWeight: '800', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  vendedorNombre: { fontWeight: '700', color: '#3d2027', fontSize: '14px', margin: 0 },
  vendedorSub: { fontSize: '11px', color: '#b08080', margin: '2px 0 0' },
  vendedorTotal: { fontWeight: '800', color: '#c9a96e', fontSize: '14px', margin: 0 },
  empty: { color: '#b08080', fontSize: '14px', textAlign: 'center', padding: '20px' },
  detail: { flex: 1, background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 12px rgba(61,32,39,0.06)', minHeight: '300px' },
  emptyDetail: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '260px', gap: '10px' },
  detailHeader: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' },
  detailAvatarGrande: { width: '52px', height: '52px', borderRadius: '50%', background: '#fce4de', color: '#3d2027', fontWeight: '800', fontSize: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  detailTitle: { fontSize: '22px', fontWeight: '700', color: '#3d2027', margin: 0, fontFamily: 'Georgia, serif' },
  detailSub: { color: '#b08080', fontSize: '13px', margin: '4px 0 0' },
  filtroMes: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' },
  mesBtnFiltro: { background: '#fdf0ed', border: '1.5px solid #f5ddd8', color: '#7d4255', borderRadius: '20px', padding: '5px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  mesBtnFiltroActive: { background: '#3d2027', color: '#fff', border: '1.5px solid #3d2027' },
  mesBtnCount: { background: 'rgba(255,255,255,0.25)', borderRadius: '10px', padding: '1px 6px', fontSize: '11px', fontWeight: '700' },
  tableWrapper: { overflowX: 'auto', marginBottom: '20px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 12px', background: '#fdf0ed', fontSize: '11px', fontWeight: '700', color: '#7d4255', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #f5eded' },
  td: { padding: '10px 12px', fontSize: '13px', color: '#3d2027', verticalAlign: 'middle' },
  saleIdBadge: { fontSize: '12px', fontWeight: '700', color: '#3d2027' },
  refTag: { color: '#c9a96e', fontWeight: '700', fontSize: '11px' },
  typeBadge: { fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '10px', whiteSpace: 'nowrap' },
  resumenRow: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  resumenCard: { background: '#fdf0ed', borderRadius: '10px', padding: '14px 20px', minWidth: '130px' },
  resumenLabel: { fontSize: '11px', color: '#b08080', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  resumenVal: { fontSize: '22px', fontWeight: '800', color: '#3d2027', margin: 0 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  modal: { background: '#fff', borderRadius: '16px', padding: '36px', width: '440px', maxWidth: '92vw' },
  modalTitle: { fontSize: '20px', fontWeight: '700', color: '#3d2027', margin: '0 0 20px', fontFamily: 'Georgia, serif' },
  formGroup: { marginBottom: '14px' },
  label: { fontSize: '12px', fontWeight: '600', color: '#7d4255', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: '6px' },
  input: { padding: '10px 12px', border: '1.5px solid #f0d0ca', borderRadius: '8px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box', color: '#3d2027' },
  error: { color: '#c0394a', fontSize: '13px', margin: '8px 0' },
  modalActions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' },
};