import { useEffect, useState } from 'react';
import api from '../api/axios';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function parseFechaLocal(fechaStr) {
  // Evita el problema de UTC: "2026-03-28" -> new Date local
  if (!fechaStr) return null;
  const s = fechaStr.includes('T') ? fechaStr : fechaStr + 'T00:00:00';
  return new Date(s);
}

function agruparPorMes(sales) {
  const mapa = {};

  const obtenerOCrear = (key, year, month) => {
    if (!mapa[key]) {
      mapa[key] = { key, year, month, sales: [], pagosCuotas: [] };
    }
    return mapa[key];
  };

  for (const sale of sales) {
    // La venta va al mes de saleDate
    const fecha = parseFechaLocal(sale.saleDate);
    const saleKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    obtenerOCrear(saleKey, fecha.getFullYear(), fecha.getMonth()).sales.push(sale);

    // Cada cuota pagada va al mes en que fue REALMENTE pagada (paidDate)
    if (sale.creditPayments) {
      for (const pago of sale.creditPayments) {
        if (pago.paid && pago.paidDate) {
          const pagoFecha = parseFechaLocal(pago.paidDate);
          const pagoKey = `${pagoFecha.getFullYear()}-${String(pagoFecha.getMonth() + 1).padStart(2, '0')}`;
          obtenerOCrear(pagoKey, pagoFecha.getFullYear(), pagoFecha.getMonth())
            .pagosCuotas.push({ sale, pago, pagoFecha });
        }
      }
    }
  }

  return Object.values(mapa).sort((a, b) => b.key.localeCompare(a.key));
}

export default function HistorialPage() {
  const [sales, setSales] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);

  useEffect(() => {
    api.get('/api/sales').then(res => setSales(res.data));
  }, []);

  const grupos = agruparPorMes(sales);
  const selectedGrupo = grupos.find(g => g.key === selectedKey);

  const statsGrupo = (g) => {
    const totalVentas = g.sales.reduce((acc, s) => acc + parseFloat(s.totalAmount), 0);
    const totalCuotas = g.pagosCuotas.reduce((acc, { pago }) => acc + parseFloat(pago.amount), 0);
    const pendiente = g.sales.reduce((acc, s) => acc + parseFloat(s.remainingBalance || 0), 0);
    const unidades = g.sales.reduce((acc, s) => acc + s.items.reduce((a, i) => a + i.quantity, 0), 0);
    const ganancia = g.sales.reduce((acc, s) => {
      // Crédito: solo cuenta si está completamente saldado
      if (s.paymentType === 'CREDITO' && parseFloat(s.remainingBalance || 0) > 0) return acc;
      return acc + s.items.reduce((a, i) => {
        if (!i.purchasePrice) return a;
        return a + (parseFloat(i.unitPrice) - parseFloat(i.purchasePrice)) * i.quantity;
      }, 0);
    }, 0);
    const margen = totalVentas > 0 ? (ganancia / totalVentas * 100) : 0;
    return { totalVentas, totalCuotas, pendiente, unidades, ganancia, margen };
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Historial de Ventas</h1>
        <p style={styles.sub}>Consolidado mes a mes</p>
      </div>

      <div style={styles.layout}>
        <div style={styles.sidebar}>
          {grupos.length === 0 && <p style={styles.empty}>Sin ventas registradas</p>}
          {grupos.map(g => {
            const { totalVentas, totalCuotas, pendiente, unidades } = statsGrupo(g);
            const active = selectedKey === g.key;
            return (
              <div key={g.key} style={{ ...styles.mesCard, ...(active ? styles.mesCardActive : {}) }}
                onClick={() => setSelectedKey(active ? null : g.key)}>
                <div style={styles.mesHeader}>
                  <span style={styles.mesNombre}>{MESES[g.month]} {g.year}</span>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {g.sales.length > 0 && (
                      <span style={styles.mesCant}>{g.sales.length} venta{g.sales.length !== 1 ? 's' : ''}</span>
                    )}
                    {g.pagosCuotas.length > 0 && (
                      <span style={{ ...styles.mesCant, background: '#fff3e0', color: '#e67e22' }}>
                        {g.pagosCuotas.length} cuota{g.pagosCuotas.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div style={styles.mesStats}>
                  {totalVentas > 0 && (
                    <div>
                      <p style={styles.mesStatLabel}>Ventas</p>
                      <p style={{ ...styles.mesStatVal, color: '#c9a96e' }}>${totalVentas.toLocaleString('es-CO')}</p>
                    </div>
                  )}
                  {totalCuotas > 0 && (
                    <div>
                      <p style={styles.mesStatLabel}>Cuotas</p>
                      <p style={{ ...styles.mesStatVal, color: '#27ae60' }}>${totalCuotas.toLocaleString('es-CO')}</p>
                    </div>
                  )}
                  {unidades > 0 && (
                    <div>
                      <p style={styles.mesStatLabel}>Unidades</p>
                      <p style={styles.mesStatVal}>{unidades}</p>
                    </div>
                  )}
                  {pendiente > 0 && (
                    <div>
                      <p style={styles.mesStatLabel}>Pendiente</p>
                      <p style={{ ...styles.mesStatVal, color: '#e74c3c' }}>${pendiente.toLocaleString('es-CO')}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={styles.detail}>
          {!selectedGrupo ? (
            <div style={styles.emptyDetail}>
              <p style={{ fontSize: '40px' }}>📅</p>
              <p style={{ color: '#aaa', fontSize: '14px' }}>Selecciona un mes para ver el detalle</p>
            </div>
          ) : (
            <>
              <h2 style={styles.detailTitle}>{MESES[selectedGrupo.month]} {selectedGrupo.year}</h2>

              {(() => {
                const { totalVentas, totalCuotas, pendiente, unidades, ganancia, margen } = statsGrupo(selectedGrupo);
                return (
                  <div style={styles.resumenRow}>
                    {selectedGrupo.sales.length > 0 && (
                      <div style={styles.resumenCard}>
                        <p style={styles.resumenLabel}>Ventas</p>
                        <p style={styles.resumenVal}>{selectedGrupo.sales.length}</p>
                      </div>
                    )}
                    {unidades > 0 && (
                      <div style={styles.resumenCard}>
                        <p style={styles.resumenLabel}>Unidades vendidas</p>
                        <p style={styles.resumenVal}>{unidades}</p>
                      </div>
                    )}
                    {totalVentas > 0 && (
                      <div style={styles.resumenCard}>
                        <p style={styles.resumenLabel}>Ingresos ventas</p>
                        <p style={{ ...styles.resumenVal, color: '#c9a96e' }}>${totalVentas.toLocaleString('es-CO')}</p>
                      </div>
                    )}
                    {totalCuotas > 0 && (
                      <div style={styles.resumenCard}>
                        <p style={styles.resumenLabel}>Cuotas cobradas</p>
                        <p style={{ ...styles.resumenVal, color: '#27ae60' }}>${totalCuotas.toLocaleString('es-CO')}</p>
                      </div>
                    )}
                    {pendiente > 0 && (
                      <div style={styles.resumenCard}>
                        <p style={styles.resumenLabel}>Saldo pendiente</p>
                        <p style={{ ...styles.resumenVal, color: '#e74c3c' }}>${pendiente.toLocaleString('es-CO')}</p>
                      </div>
                    )}
                    {ganancia !== 0 && (
                      <div style={styles.resumenCard}>
                        <p style={styles.resumenLabel}>Ganancia bruta</p>
                        <p style={{ ...styles.resumenVal, color: ganancia >= 0 ? '#27ae60' : '#e74c3c' }}>${Math.round(ganancia).toLocaleString('es-CO')}</p>
                      </div>
                    )}
                    {ganancia !== 0 && totalVentas > 0 && (
                      <div style={styles.resumenCard}>
                        <p style={styles.resumenLabel}>Margen %</p>
                        <p style={{ ...styles.resumenVal, color: margen >= 0 ? '#27ae60' : '#e74c3c' }}>{Math.round(margen)}%</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Tabla de ventas del mes */}
              {selectedGrupo.sales.length > 0 && (
                <>
                  <h3 style={styles.sectionTitle}>Prendas vendidas</h3>
                  <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Fecha</th>
                          <th style={styles.th}>Venta #</th>
                          <th style={styles.th}>Vendedor</th>
                          <th style={styles.th}>Producto</th>
                          <th style={styles.th}>Talla</th>
                          <th style={styles.th}>Cant.</th>
                          <th style={styles.th}>P. Compra</th>
                          <th style={styles.th}>P. Venta</th>
                          <th style={styles.th}>Ganancia</th>
                          <th style={styles.th}>Subtotal</th>
                          <th style={styles.th}>Tipo pago</th>
                          <th style={styles.th}>Saldo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedGrupo.sales.flatMap(sale =>
                          sale.items.map((item, idx) => (
                            <tr key={`${sale.id}-${item.id}`} style={styles.tr}>
                              {idx === 0 && (
                                <td style={styles.td} rowSpan={sale.items.length}>
                                  {parseFechaLocal(sale.saleDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                                </td>
                              )}
                              {idx === 0 && (
                                <td style={styles.td} rowSpan={sale.items.length}>
                                  <span style={styles.saleIdBadge}>#{sale.id}</span>
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
                              </td>
                              <td style={styles.td}>{item.sizeName || '—'}</td>
                              <td style={{ ...styles.td, textAlign: 'center' }}>{item.quantity}</td>
                              <td style={{ ...styles.td, color: '#888' }}>
                                {item.purchasePrice ? `$${Math.round(parseFloat(item.purchasePrice)).toLocaleString('es-CO')}` : '—'}
                              </td>
                              <td style={styles.td}>${Math.round(parseFloat(item.unitPrice)).toLocaleString('es-CO')}</td>
                              <td style={{ ...styles.td, color: item.purchasePrice ? '#27ae60' : '#ccc', fontWeight: 600 }}>
                                {item.purchasePrice
                                  ? `$${Math.round((parseFloat(item.unitPrice) - parseFloat(item.purchasePrice)) * item.quantity).toLocaleString('es-CO')}`
                                  : '—'}
                              </td>
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
                                <td style={styles.td} rowSpan={sale.items.length}>
                                  {parseFloat(sale.remainingBalance || 0) > 0
                                    ? <span style={styles.pendingBadge}>${parseFloat(sale.remainingBalance).toLocaleString('es-CO')}</span>
                                    : <span style={styles.paidBadge}>✓</span>
                                  }
                                </td>
                              )}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Tabla de pagos de cuotas del mes */}
              {selectedGrupo.pagosCuotas.length > 0 && (
                <>
                  <h3 style={{ ...styles.sectionTitle, marginTop: '28px' }}>Pagos de cuotas recibidos</h3>
                  <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Fecha pago</th>
                          <th style={styles.th}>Venta #</th>
                          <th style={styles.th}>Cliente</th>
                          <th style={styles.th}>Fecha propuesta</th>
                          <th style={styles.th}>Monto cuota</th>
                          <th style={styles.th}>Notas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedGrupo.pagosCuotas.map(({ sale, pago, pagoFecha }, idx) => (
                          <tr key={`cuota-${sale.id}-${pago.id ?? idx}`} style={styles.tr}>
                            <td style={styles.td}>
                              {pagoFecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td style={styles.td}>
                              <span style={styles.saleIdBadge}>#{sale.id}</span>
                            </td>
                            <td style={styles.td}>{sale.buyerName || '—'}</td>
                            <td style={styles.td}>
                              {pago.dueDate
                                ? parseFechaLocal(pago.dueDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
                                : '—'}
                            </td>
                            <td style={{ ...styles.td, fontWeight: 700 }}>
                              <span style={styles.cuotaBadge}>${parseFloat(pago.amount).toLocaleString('es-CO')}</span>
                            </td>
                            <td style={{ ...styles.td, color: '#888' }}>{pago.notes || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '32px 40px', background: '#fdf0ed', minHeight: 'calc(100vh - 64px)' },
  header: { marginBottom: '28px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#3d2027', margin: 0, fontFamily: 'Georgia, serif' },
  sub: { color: '#888', fontSize: '14px', margin: '4px 0 0' },
  layout: { display: 'flex', gap: '24px', alignItems: 'flex-start' },
  sidebar: { width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '10px' },
  mesCard: { background: '#fff', borderRadius: '12px', padding: '16px 20px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '2px solid transparent', transition: 'border 0.15s' },
  mesCardActive: { border: '2px solid #3d2027' },
  mesHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  mesNombre: { fontWeight: '700', color: '#3d2027', fontSize: '15px' },
  mesCant: { fontSize: '12px', color: '#888', background: '#f5f5f5', padding: '2px 8px', borderRadius: '10px' },
  mesStats: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  mesStatLabel: { fontSize: '10px', color: '#aaa', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  mesStatVal: { fontSize: '14px', fontWeight: '700', color: '#3d2027', margin: 0 },
  empty: { color: '#aaa', fontSize: '14px', textAlign: 'center', padding: '20px' },
  detail: { flex: 1, background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', minHeight: '300px' },
  emptyDetail: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '260px', gap: '10px' },
  detailTitle: { fontSize: '22px', fontWeight: '700', color: '#3d2027', margin: '0 0 20px', fontFamily: 'Georgia, serif' },
  resumenRow: { display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' },
  resumenCard: { background: '#fdf0ed', borderRadius: '10px', padding: '14px 20px', minWidth: '130px' },
  resumenLabel: { fontSize: '11px', color: '#888', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  resumenVal: { fontSize: '22px', fontWeight: '800', color: '#3d2027', margin: 0 },
  sectionTitle: { fontSize: '14px', fontWeight: '700', color: '#555', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 12px', background: '#fdf0ed', fontSize: '11px', fontWeight: '700', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #f5f5f5' },
  td: { padding: '10px 12px', fontSize: '13px', color: '#333', verticalAlign: 'middle' },
  saleIdBadge: { fontSize: '12px', fontWeight: '700', color: '#3d2027' },
  refTag: { color: '#c9a96e', fontWeight: '700', fontSize: '11px' },
  typeBadge: { fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '10px', whiteSpace: 'nowrap' },
  pendingBadge: { background: '#fde8e8', color: '#e74c3c', fontSize: '12px', fontWeight: '700', padding: '3px 8px', borderRadius: '10px' },
  paidBadge: { background: '#e8f5e9', color: '#2e7d32', fontSize: '12px', fontWeight: '700', padding: '3px 8px', borderRadius: '10px' },
  cuotaBadge: { background: '#e8f5e9', color: '#27ae60', fontSize: '12px', fontWeight: '700', padding: '3px 8px', borderRadius: '10px' },
  sellerBadge: { fontSize: '12px', fontWeight: '600', color: '#7d4255', background: '#fce4de', padding: '2px 8px', borderRadius: '10px' },
};