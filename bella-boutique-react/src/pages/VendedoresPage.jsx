import { useEffect, useState } from 'react';
import api from '../api/axios';

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
    if (!mapa[key]) {
      mapa[key] = { username: key, sales: [], totalAmount: 0, totalVentas: 0 };
    }
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
    if (!mapa[key]) {
      mapa[key] = { key, year: fecha.getFullYear(), month: fecha.getMonth(), sales: [] };
    }
    mapa[key].sales.push(sale);
  }
  return Object.values(mapa).sort((a, b) => b.key.localeCompare(a.key));
}

export default function VendedoresPage() {
  const [sales, setSales] = useState([]);
  const [selectedVendedor, setSelectedVendedor] = useState(null);
  const [selectedMesKey, setSelectedMesKey] = useState('todos');

  useEffect(() => {
    api.get('/api/sales').then(res => setSales(res.data));
  }, []);

  const vendedores = agruparVendedores(sales);

  const handleSelectVendedor = (v) => {
    setSelectedVendedor(v);
    setSelectedMesKey('todos');
  };

  const gruposMes = selectedVendedor ? agruparPorMes(selectedVendedor.sales) : [];

  const ventasFiltradas = selectedMesKey === 'todos'
    ? selectedVendedor?.sales ?? []
    : (gruposMes.find(g => g.key === selectedMesKey)?.sales ?? []);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Vendedores</h1>
        <p style={styles.sub}>Rendimiento por vendedor</p>
      </div>

      <div style={styles.layout}>
        {/* Lista de vendedores */}
        <div style={styles.sidebar}>
          {vendedores.length === 0 && (
            <p style={styles.empty}>Sin ventas registradas</p>
          )}
          {vendedores.map(v => {
            const active = selectedVendedor?.username === v.username;
            return (
              <div
                key={v.username}
                style={{ ...styles.vendedorCard, ...(active ? styles.vendedorCardActive : {}) }}
                onClick={() => handleSelectVendedor(v)}
              >
                <div style={styles.avatarRow}>
                  <div style={styles.avatar}>
                    {v.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={styles.vendedorNombre}>{v.username}</p>
                    <p style={styles.vendedorSub}>{v.totalVentas} venta{v.totalVentas !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <p style={styles.vendedorTotal}>${v.totalAmount.toLocaleString('es-CO')}</p>
              </div>
            );
          })}
        </div>

        {/* Detalle del vendedor */}
        <div style={styles.detail}>
          {!selectedVendedor ? (
            <div style={styles.emptyDetail}>
              <p style={{ fontSize: '40px' }}>👗</p>
              <p style={{ color: '#b08080', fontSize: '14px' }}>Selecciona un vendedor para ver su detalle</p>
            </div>
          ) : (
            <>
              {/* Encabezado vendedor */}
              <div style={styles.detailHeader}>
                <div style={styles.detailAvatarGrande}>
                  {selectedVendedor.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={styles.detailTitle}>{selectedVendedor.username}</h2>
                  <p style={styles.detailSub}>
                    {selectedVendedor.totalVentas} ventas · Total ${selectedVendedor.totalAmount.toLocaleString('es-CO')}
                  </p>
                </div>
              </div>

              {/* Filtro por mes */}
              <div style={styles.filtroMes}>
                <button
                  style={{ ...styles.mesBtnFiltro, ...(selectedMesKey === 'todos' ? styles.mesBtnFiltroActive : {}) }}
                  onClick={() => setSelectedMesKey('todos')}
                >
                  Todos
                </button>
                {gruposMes.map(g => (
                  <button
                    key={g.key}
                    style={{ ...styles.mesBtnFiltro, ...(selectedMesKey === g.key ? styles.mesBtnFiltroActive : {}) }}
                    onClick={() => setSelectedMesKey(g.key)}
                  >
                    {MESES[g.month]} {g.year}
                    <span style={styles.mesBtnCount}>{g.sales.length}</span>
                  </button>
                ))}
              </div>

              {/* Tabla de ventas */}
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
                      <tr>
                        <td colSpan={9} style={{ ...styles.td, textAlign: 'center', color: '#b08080' }}>
                          Sin ventas en este período
                        </td>
                      </tr>
                    )}
                    {ventasFiltradas.flatMap(sale =>
                      sale.items.map((item, idx) => (
                        <tr key={`${sale.id}-${item.id}`} style={styles.tr}>
                          {idx === 0 && (
                            <td style={styles.td} rowSpan={sale.items.length}>
                              {parseFechaLocal(sale.saleDate).toLocaleDateString('es-CO', {
                                day: '2-digit', month: 'short', year: 'numeric'
                              })}
                            </td>
                          )}
                          {idx === 0 && (
                            <td style={styles.td} rowSpan={sale.items.length}>
                              <span style={styles.saleIdBadge}>#{sale.id}</span>
                            </td>
                          )}
                          <td style={styles.td}>
                            {item.referenceNumber && (
                              <span style={styles.refTag}>#{item.referenceNumber} </span>
                            )}
                            {item.productName}
                          </td>
                          <td style={styles.td}>{item.sizeName || '—'}</td>
                          <td style={{ ...styles.td, textAlign: 'center' }}>{item.quantity}</td>
                          <td style={styles.td}>
                            ${parseFloat(item.unitPrice).toLocaleString('es-CO')}
                          </td>
                          <td style={{ ...styles.td, fontWeight: 700 }}>
                            ${(item.quantity * parseFloat(item.unitPrice)).toLocaleString('es-CO')}
                          </td>
                          {idx === 0 && (
                            <td style={styles.td} rowSpan={sale.items.length}>
                              <span style={{
                                ...styles.typeBadge,
                                background: sale.paymentType === 'CREDITO' ? '#fff3e0' : '#e8f5e9',
                                color: sale.paymentType === 'CREDITO' ? '#e67e22' : '#2e7d32'
                              }}>
                                {sale.paymentType === 'CREDITO' ? 'Crédito' : 'Contado'}
                              </span>
                            </td>
                          )}
                          {idx === 0 && (
                            <td style={{ ...styles.td, fontWeight: 700, color: '#c9a96e' }} rowSpan={sale.items.length}>
                              ${parseFloat(sale.totalAmount).toLocaleString('es-CO')}
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Resumen del período */}
              {ventasFiltradas.length > 0 && (
                <div style={styles.resumenRow}>
                  <div style={styles.resumenCard}>
                    <p style={styles.resumenLabel}>Ventas</p>
                    <p style={styles.resumenVal}>{ventasFiltradas.length}</p>
                  </div>
                  <div style={styles.resumenCard}>
                    <p style={styles.resumenLabel}>Unidades</p>
                    <p style={styles.resumenVal}>
                      {ventasFiltradas.reduce((acc, s) => acc + s.items.reduce((a, i) => a + i.quantity, 0), 0)}
                    </p>
                  </div>
                  <div style={styles.resumenCard}>
                    <p style={styles.resumenLabel}>Total facturado</p>
                    <p style={{ ...styles.resumenVal, color: '#c9a96e' }}>
                      ${ventasFiltradas.reduce((acc, s) => acc + parseFloat(s.totalAmount), 0).toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '32px 40px', background: '#fdf0ed', minHeight: 'calc(100vh - 68px)' },
  header: { marginBottom: '28px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#3d2027', margin: 0, fontFamily: 'Georgia, serif' },
  sub: { color: '#b08080', fontSize: '14px', margin: '4px 0 0' },
  layout: { display: 'flex', gap: '24px', alignItems: 'flex-start' },
  sidebar: { width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '10px' },
  vendedorCard: {
    background: '#fff', borderRadius: '12px', padding: '14px 18px', cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(61,32,39,0.06)', border: '2px solid transparent',
    transition: 'border 0.15s', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  vendedorCardActive: { border: '2px solid #3d2027' },
  avatarRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: {
    width: '36px', height: '36px', borderRadius: '50%', background: '#fce4de',
    color: '#3d2027', fontWeight: '800', fontSize: '16px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  vendedorNombre: { fontWeight: '700', color: '#3d2027', fontSize: '14px', margin: 0 },
  vendedorSub: { fontSize: '11px', color: '#b08080', margin: '2px 0 0' },
  vendedorTotal: { fontWeight: '800', color: '#c9a96e', fontSize: '14px', margin: 0 },
  empty: { color: '#b08080', fontSize: '14px', textAlign: 'center', padding: '20px' },
  detail: {
    flex: 1, background: '#fff', borderRadius: '16px', padding: '28px',
    boxShadow: '0 2px 12px rgba(61,32,39,0.06)', minHeight: '300px',
  },
  emptyDetail: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: '260px', gap: '10px',
  },
  detailHeader: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' },
  detailAvatarGrande: {
    width: '52px', height: '52px', borderRadius: '50%', background: '#fce4de',
    color: '#3d2027', fontWeight: '800', fontSize: '22px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  detailTitle: { fontSize: '22px', fontWeight: '700', color: '#3d2027', margin: 0, fontFamily: 'Georgia, serif' },
  detailSub: { color: '#b08080', fontSize: '13px', margin: '4px 0 0' },
  filtroMes: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' },
  mesBtnFiltro: {
    background: '#fdf0ed', border: '1.5px solid #f5ddd8', color: '#7d4255',
    borderRadius: '20px', padding: '5px 14px', fontSize: '12px', fontWeight: '600',
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
  },
  mesBtnFiltroActive: { background: '#3d2027', color: '#fff', border: '1.5px solid #3d2027' },
  mesBtnCount: {
    background: 'rgba(255,255,255,0.25)', borderRadius: '10px',
    padding: '1px 6px', fontSize: '11px', fontWeight: '700',
  },
  tableWrapper: { overflowX: 'auto', marginBottom: '20px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left', padding: '10px 12px', background: '#fdf0ed',
    fontSize: '11px', fontWeight: '700', color: '#7d4255',
    textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap',
  },
  tr: { borderBottom: '1px solid #f5eded' },
  td: { padding: '10px 12px', fontSize: '13px', color: '#3d2027', verticalAlign: 'middle' },
  saleIdBadge: { fontSize: '12px', fontWeight: '700', color: '#3d2027' },
  refTag: { color: '#c9a96e', fontWeight: '700', fontSize: '11px' },
  typeBadge: { fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '10px', whiteSpace: 'nowrap' },
  resumenRow: { display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '4px' },
  resumenCard: { background: '#fdf0ed', borderRadius: '10px', padding: '14px 20px', minWidth: '130px' },
  resumenLabel: { fontSize: '11px', color: '#b08080', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  resumenVal: { fontSize: '22px', fontWeight: '800', color: '#3d2027', margin: 0 },
};