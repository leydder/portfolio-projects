import { useEffect, useState } from 'react';
import api from '../api/axios';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function parseFechaLocal(fechaStr) {
  if (!fechaStr) return null;
  const s = fechaStr.includes('T') ? fechaStr : fechaStr + 'T00:00:00';
  return new Date(s);
}

function calcGananciaSale(sale) {
  return sale.items.reduce((acc, i) => {
    if (!i.purchasePrice) return acc;
    return acc + (parseFloat(i.unitPrice) - parseFloat(i.purchasePrice)) * i.quantity;
  }, 0);
}

function agruparGanancias(sales, deletedCreditSales = []) {
  const mapa = {};
  const get = (key, year, month) => {
    if (!mapa[key]) mapa[key] = { key, year, month, ventas: [] };
    return mapa[key];
  };

  for (const sale of sales) {
    const ganancia = calcGananciaSale(sale);

    if (sale.paymentType === 'CONTADO') {
      const f = parseFechaLocal(sale.saleDate);
      const key = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}`;
      get(key, f.getFullYear(), f.getMonth()).ventas.push({ sale, ganancia });

    } else if (sale.paymentType === 'CREDITO' && parseFloat(sale.remainingBalance || 0) <= 0) {
      // Ganancia en el mes del último pago
      const pagosPagados = (sale.creditPayments || []).filter(p => p.paid && p.paidDate);
      let fecha;
      if (pagosPagados.length > 0) {
        const lastDate = pagosPagados.reduce((max, p) => p.paidDate > max ? p.paidDate : max, pagosPagados[0].paidDate);
        fecha = parseFechaLocal(lastDate);
      } else {
        fecha = parseFechaLocal(sale.saleDate);
      }
      const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      get(key, fecha.getFullYear(), fecha.getMonth()).ventas.push({ sale, ganancia });
    }
    // Crédito pendiente: no se incluye
  }

  // Créditos eliminados: el inicial cobrado es ganancia (stock fue restituido)
  for (const sale of deletedCreditSales) {
    const inicial = parseFloat(sale.initialPayment || 0);
    if (inicial <= 0 || !sale.deletedAt) continue;
    const f = parseFechaLocal(sale.deletedAt);
    const key = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}`;
    get(key, f.getFullYear(), f.getMonth()).ventas.push({ sale, ganancia: inicial, isCancelled: true });
  }

  return Object.values(mapa).sort((a, b) => b.key.localeCompare(a.key));
}

export default function GananciasPage() {
  const [sales, setSales] = useState([]);
  const [deletedCreditSales, setDeletedCreditSales] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadSales = () => {
    setLoading(true);
    Promise.all([
      api.get('/api/sales'),
      api.get('/api/sales/deleted'),
    ]).then(([res, deletedRes]) => {
      setSales(res.data);
      setDeletedCreditSales(deletedRes.data.filter(s => s.paymentType === 'CREDITO'));
      setLoading(false);
    });
  };

  useEffect(() => {
    loadSales();
    const onVisible = () => { if (document.visibilityState === 'visible') loadSales(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  const grupos = agruparGanancias(sales, deletedCreditSales);
  const selectedGrupo = grupos.find(g => g.key === selectedKey);

  const pendientes = sales.filter(s => s.paymentType === 'CREDITO' && parseFloat(s.remainingBalance || 0) > 0);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={styles.title}>Ganancias</h1>
          <button style={{ ...styles.btnRefresh, opacity: loading ? 0.6 : 1 }} onClick={loadSales} disabled={loading}>
            {loading ? 'Actualizando...' : '↻ Actualizar'}
          </button>
        </div>
        <p style={styles.sub}>Ganancia real por mes · Crédito: se registra al pago final</p>
      </div>

      {pendientes.length > 0 && (
        <div style={styles.pendientesBanner}>
          <span style={styles.pendientesIcon}>⏳</span>
          <span>{pendientes.length} venta{pendientes.length !== 1 ? 's' : ''} a crédito pendiente{pendientes.length !== 1 ? 's' : ''} de saldar — su ganancia se reflejará al completar el pago.</span>
        </div>
      )}

      <div style={styles.layout}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          {grupos.length === 0 && <p style={styles.empty}>Sin ganancias registradas</p>}
          {grupos.map(g => {
            const totalGanancia = g.ventas.reduce((acc, { ganancia }) => acc + ganancia, 0);
            const totalVentas = g.ventas.reduce((acc, { sale }) => acc + parseFloat(sale.totalAmount), 0);
            const margen = totalVentas > 0 ? (totalGanancia / totalVentas * 100) : 0;
            const active = selectedKey === g.key;
            return (
              <div key={g.key}
                style={{ ...styles.mesCard, ...(active ? styles.mesCardActive : {}) }}
                onClick={() => setSelectedKey(active ? null : g.key)}>
                <div style={styles.mesHeader}>
                  <span style={styles.mesNombre}>{MESES[g.month]} {g.year}</span>
                  <span style={styles.mesCant}>{g.ventas.length} venta{g.ventas.length !== 1 ? 's' : ''}</span>
                </div>
                <div style={styles.mesStats}>
                  <div>
                    <p style={styles.mesStatLabel}>Ganancia</p>
                    <p style={{ ...styles.mesStatVal, color: totalGanancia >= 0 ? '#27ae60' : '#e74c3c' }}>
                      ${Math.round(totalGanancia).toLocaleString('es-CO')}
                    </p>
                  </div>
                  <div>
                    <p style={styles.mesStatLabel}>Margen</p>
                    <p style={{ ...styles.mesStatVal, color: '#3d7de8' }}>{Math.round(margen)}%</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detalle */}
        <div style={styles.detail}>
          {!selectedGrupo ? (
            <div style={styles.emptyDetail}>
              <p style={{ fontSize: '40px' }}>💰</p>
              <p style={{ color: '#aaa', fontSize: '14px' }}>Selecciona un mes para ver el detalle</p>
            </div>
          ) : (
            <>
              <h2 style={styles.detailTitle}>{MESES[selectedGrupo.month]} {selectedGrupo.year}</h2>

              {(() => {
                const totalGanancia = selectedGrupo.ventas.reduce((acc, { ganancia }) => acc + ganancia, 0);
                const totalVentas = selectedGrupo.ventas.reduce((acc, { sale }) => acc + parseFloat(sale.totalAmount), 0);
                const totalCompra = selectedGrupo.ventas.reduce((acc, { sale }) =>
                  acc + sale.items.reduce((a, i) => a + (i.purchasePrice ? parseFloat(i.purchasePrice) * i.quantity : 0), 0), 0);
                const margen = totalVentas > 0 ? (totalGanancia / totalVentas * 100) : 0;
                return (
                  <div style={styles.resumenRow}>
                    <div style={styles.resumenCard}>
                      <p style={styles.resumenLabel}>Ventas</p>
                      <p style={styles.resumenVal}>{selectedGrupo.ventas.length}</p>
                    </div>
                    <div style={styles.resumenCard}>
                      <p style={styles.resumenLabel}>Total facturado</p>
                      <p style={{ ...styles.resumenVal, color: '#c9a96e' }}>${Math.round(totalVentas).toLocaleString('es-CO')}</p>
                    </div>
                    <div style={styles.resumenCard}>
                      <p style={styles.resumenLabel}>Costo compra</p>
                      <p style={{ ...styles.resumenVal, color: '#e67e22' }}>${Math.round(totalCompra).toLocaleString('es-CO')}</p>
                    </div>
                    <div style={styles.resumenCard}>
                      <p style={styles.resumenLabel}>Ganancia bruta</p>
                      <p style={{ ...styles.resumenVal, color: totalGanancia >= 0 ? '#27ae60' : '#e74c3c' }}>
                        ${Math.round(totalGanancia).toLocaleString('es-CO')}
                      </p>
                    </div>
                    <div style={styles.resumenCard}>
                      <p style={styles.resumenLabel}>Margen %</p>
                      <p style={{ ...styles.resumenVal, color: '#3d7de8' }}>{Math.round(margen)}%</p>
                    </div>
                  </div>
                );
              })()}

              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Venta #</th>
                      <th style={styles.th}>Tipo</th>
                      <th style={styles.th}>Acuerdo</th>
                      <th style={styles.th}>Vendedor</th>
                      <th style={styles.th}>Producto</th>
                      <th style={styles.th}>Cant.</th>
                      <th style={styles.th}>P. Compra</th>
                      <th style={styles.th}>P. Venta</th>
                      <th style={styles.th}>Ganancia ítem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedGrupo.ventas.flatMap(({ sale, ganancia, isCancelled }) => {
                      // Venta a crédito cancelada: fila especial (inicial cobrado)
                      if (isCancelled) {
                        return [(
                          <tr key={`cancelled-${sale.id}`} style={{ ...styles.tr, background: '#fff8e1' }}>
                            <td style={styles.td}><span style={styles.saleIdBadge}>#{sale.id}</span></td>
                            <td style={styles.td}>
                              <span style={{ ...styles.typeBadge, background: '#fde8e8', color: '#e74c3c' }}>
                                Crédito cancelado
                              </span>
                            </td>
                            <td style={styles.td}>
                              <span style={styles.acuerdoBadge}>Venta eliminada</span>
                            </td>
                            <td style={styles.td}>
                              <span style={styles.sellerBadge}>{sale.sellerName || '—'}</span>
                            </td>
                            <td style={{ ...styles.td, color: '#888', fontStyle: 'italic' }} colSpan={4}>
                              Inicial cobrado — {sale.buyerName || 'sin comprador'}
                              {sale.items.length > 0 && `: ${sale.items.map(i => i.productName).join(', ')}`}
                            </td>
                            <td style={{ ...styles.td, fontWeight: 700, color: '#27ae60' }}>
                              ${Math.round(ganancia).toLocaleString('es-CO')}
                            </td>
                          </tr>
                        )];
                      }

                      // Detectar si fue liquidada con descuento (acuerdo de gerencia)
                      const notaAcuerdo = (sale.creditPayments || [])
                        .filter(p => p.paid && p.notes && p.notes.includes('gerencia'))
                        .map(p => p.notes)[0] || null;

                      return sale.items.map((item, idx) => {
                        const gananciaItem = item.purchasePrice
                          ? (parseFloat(item.unitPrice) - parseFloat(item.purchasePrice)) * item.quantity
                          : null;
                        return (
                          <tr key={`${sale.id}-${item.id}`} style={styles.tr}>
                            {idx === 0 && (
                              <td style={styles.td} rowSpan={sale.items.length}>
                                <span style={styles.saleIdBadge}>#{sale.id}</span>
                              </td>
                            )}
                            {idx === 0 && (
                              <td style={styles.td} rowSpan={sale.items.length}>
                                <span style={{
                                  ...styles.typeBadge,
                                  background: sale.paymentType === 'CREDITO' ? '#fff3e0' : '#e8f5e9',
                                  color: sale.paymentType === 'CREDITO' ? '#e67e22' : '#2e7d32'
                                }}>
                                  {sale.paymentType === 'CREDITO' ? 'Crédito ✓' : 'Contado'}
                                </span>
                              </td>
                            )}
                            {idx === 0 && (
                              <td style={styles.td} rowSpan={sale.items.length}>
                                {notaAcuerdo
                                  ? <span style={styles.acuerdoBadge} title={notaAcuerdo}>⚠ Acuerdo gerencia</span>
                                  : <span style={{ color: '#ccc', fontSize: '12px' }}>—</span>}
                              </td>
                            )}
                            {idx === 0 && (
                              <td style={styles.td} rowSpan={sale.items.length}>
                                <span style={styles.sellerBadge}>{sale.sellerName || '—'}</span>
                              </td>
                            )}
                            <td style={styles.td}>
                              {item.referenceNumber && <span style={styles.refTag}>#{item.referenceNumber} </span>}
                              {item.productName}
                              {item.sizeName && <span style={styles.sizeTag}> · {item.sizeName}</span>}
                            </td>
                            <td style={{ ...styles.td, textAlign: 'center' }}>{item.quantity}</td>
                            <td style={{ ...styles.td, color: '#888' }}>
                              {item.purchasePrice ? `$${Math.round(parseFloat(item.purchasePrice)).toLocaleString('es-CO')}` : '—'}
                            </td>
                            <td style={styles.td}>${Math.round(parseFloat(item.unitPrice)).toLocaleString('es-CO')}</td>
                            <td style={{ ...styles.td, fontWeight: 700, color: gananciaItem !== null ? (gananciaItem >= 0 ? '#27ae60' : '#e74c3c') : '#ccc' }}>
                              {gananciaItem !== null ? `$${Math.round(gananciaItem).toLocaleString('es-CO')}` : '—'}
                            </td>
                          </tr>
                        );
                      });
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '32px 40px', background: '#fdf0ed', minHeight: 'calc(100vh - 64px)' },
  header: { marginBottom: '20px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#3d2027', margin: 0, fontFamily: 'Georgia, serif' },
  sub: { color: '#888', fontSize: '14px', margin: '4px 0 0' },
  pendientesBanner: { background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '10px', padding: '12px 18px', marginBottom: '20px', fontSize: '13px', color: '#7d6000', display: 'flex', alignItems: 'center', gap: '10px' },
  pendientesIcon: { fontSize: '18px' },
  layout: { display: 'flex', gap: '24px', alignItems: 'flex-start' },
  sidebar: { width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '10px' },
  mesCard: { background: '#fff', borderRadius: '12px', padding: '16px 20px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '2px solid transparent' },
  mesCardActive: { border: '2px solid #3d2027' },
  mesHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  mesNombre: { fontWeight: '700', color: '#3d2027', fontSize: '15px' },
  mesCant: { fontSize: '12px', color: '#888', background: '#f5f5f5', padding: '2px 8px', borderRadius: '10px' },
  mesStats: { display: 'flex', gap: '20px' },
  mesStatLabel: { fontSize: '10px', color: '#aaa', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  mesStatVal: { fontSize: '15px', fontWeight: '800', color: '#3d2027', margin: 0 },
  empty: { color: '#aaa', fontSize: '14px', textAlign: 'center', padding: '20px' },
  detail: { flex: 1, background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', minHeight: '300px' },
  emptyDetail: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '260px', gap: '10px' },
  detailTitle: { fontSize: '22px', fontWeight: '700', color: '#3d2027', margin: '0 0 20px', fontFamily: 'Georgia, serif' },
  resumenRow: { display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' },
  resumenCard: { background: '#fdf0ed', borderRadius: '10px', padding: '14px 18px', minWidth: '120px' },
  resumenLabel: { fontSize: '11px', color: '#888', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  resumenVal: { fontSize: '20px', fontWeight: '800', color: '#3d2027', margin: 0 },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 12px', background: '#fdf0ed', fontSize: '11px', fontWeight: '700', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #f5f5f5' },
  td: { padding: '10px 12px', fontSize: '13px', color: '#333', verticalAlign: 'middle' },
  saleIdBadge: { fontSize: '12px', fontWeight: '700', color: '#3d2027' },
  typeBadge: { fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '10px', whiteSpace: 'nowrap' },
  sellerBadge: { fontSize: '12px', fontWeight: '600', color: '#7d4255', background: '#fce4de', padding: '2px 8px', borderRadius: '10px' },
  refTag: { color: '#c9a96e', fontWeight: '700', fontSize: '11px' },
  sizeTag: { color: '#888', fontSize: '11px' },
  acuerdoBadge: { background: '#fff8e1', border: '1px solid #ffe082', color: '#7d6000', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '8px', cursor: 'help' },
  btnRefresh: { background: '#3d2027', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
};