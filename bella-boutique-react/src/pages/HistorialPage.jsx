import { useEffect, useState } from 'react';
import api from '../api/axios';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function agruparPorMes(sales) {
  const mapa = {};
  for (const sale of sales) {
    const fecha = new Date(sale.saleDate);
    const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    if (!mapa[key]) {
      mapa[key] = { key, year: fecha.getFullYear(), month: fecha.getMonth(), sales: [] };
    }
    mapa[key].sales.push(sale);
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
    const total = g.sales.reduce((acc, s) => acc + parseFloat(s.totalAmount), 0);
    const pendiente = g.sales.reduce((acc, s) => acc + parseFloat(s.remainingBalance || 0), 0);
    const unidades = g.sales.reduce((acc, s) => acc + s.items.reduce((a, i) => a + i.quantity, 0), 0);
    return { total, pendiente, unidades };
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
            const { total, pendiente, unidades } = statsGrupo(g);
            const active = selectedKey === g.key;
            return (
              <div key={g.key} style={{ ...styles.mesCard, ...(active ? styles.mesCardActive : {}) }}
                onClick={() => setSelectedKey(active ? null : g.key)}>
                <div style={styles.mesHeader}>
                  <span style={styles.mesNombre}>{MESES[g.month]} {g.year}</span>
                  <span style={styles.mesCant}>{g.sales.length} venta{g.sales.length !== 1 ? 's' : ''}</span>
                </div>
                <div style={styles.mesStats}>
                  <div>
                    <p style={styles.mesStatLabel}>Ingresos</p>
                    <p style={{ ...styles.mesStatVal, color: '#c9a96e' }}>${total.toLocaleString('es-CO')}</p>
                  </div>
                  <div>
                    <p style={styles.mesStatLabel}>Unidades</p>
                    <p style={styles.mesStatVal}>{unidades}</p>
                  </div>
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
                const { total, pendiente, unidades } = statsGrupo(selectedGrupo);
                return (
                  <div style={styles.resumenRow}>
                    <div style={styles.resumenCard}>
                      <p style={styles.resumenLabel}>Total ventas</p>
                      <p style={styles.resumenVal}>{selectedGrupo.sales.length}</p>
                    </div>
                    <div style={styles.resumenCard}>
                      <p style={styles.resumenLabel}>Unidades vendidas</p>
                      <p style={styles.resumenVal}>{unidades}</p>
                    </div>
                    <div style={styles.resumenCard}>
                      <p style={styles.resumenLabel}>Ingresos</p>
                      <p style={{ ...styles.resumenVal, color: '#c9a96e' }}>${total.toLocaleString('es-CO')}</p>
                    </div>
                    {pendiente > 0 && (
                      <div style={styles.resumenCard}>
                        <p style={styles.resumenLabel}>Saldo pendiente</p>
                        <p style={{ ...styles.resumenVal, color: '#e74c3c' }}>${pendiente.toLocaleString('es-CO')}</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              <h3 style={styles.sectionTitle}>Prendas vendidas</h3>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Fecha</th>
                      <th style={styles.th}>Venta #</th>
                      <th style={styles.th}>Producto</th>
                      <th style={styles.th}>Talla</th>
                      <th style={styles.th}>Cant.</th>
                      <th style={styles.th}>Precio Unit.</th>
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
                              {new Date(sale.saleDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
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
                          <td style={styles.td}>${parseFloat(item.unitPrice).toLocaleString('es-CO')}</td>
                          <td style={{ ...styles.td, fontWeight: 700 }}>
                            ${(item.quantity * parseFloat(item.unitPrice)).toLocaleString('es-CO')}
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
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '32px 40px', background: '#f8f7f4', minHeight: 'calc(100vh - 64px)' },
  header: { marginBottom: '28px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#1a1a2e', margin: 0, fontFamily: 'Georgia, serif' },
  sub: { color: '#888', fontSize: '14px', margin: '4px 0 0' },
  layout: { display: 'flex', gap: '24px', alignItems: 'flex-start' },
  sidebar: { width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '10px' },
  mesCard: { background: '#fff', borderRadius: '12px', padding: '16px 20px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '2px solid transparent', transition: 'border 0.15s' },
  mesCardActive: { border: '2px solid #1a1a2e' },
  mesHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  mesNombre: { fontWeight: '700', color: '#1a1a2e', fontSize: '15px' },
  mesCant: { fontSize: '12px', color: '#888', background: '#f5f5f5', padding: '2px 8px', borderRadius: '10px' },
  mesStats: { display: 'flex', gap: '16px' },
  mesStatLabel: { fontSize: '10px', color: '#aaa', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  mesStatVal: { fontSize: '14px', fontWeight: '700', color: '#1a1a2e', margin: 0 },
  empty: { color: '#aaa', fontSize: '14px', textAlign: 'center', padding: '20px' },
  detail: { flex: 1, background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', minHeight: '300px' },
  emptyDetail: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '260px', gap: '10px' },
  detailTitle: { fontSize: '22px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 20px', fontFamily: 'Georgia, serif' },
  resumenRow: { display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' },
  resumenCard: { background: '#f8f7f4', borderRadius: '10px', padding: '14px 20px', minWidth: '130px' },
  resumenLabel: { fontSize: '11px', color: '#888', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  resumenVal: { fontSize: '22px', fontWeight: '800', color: '#1a1a2e', margin: 0 },
  sectionTitle: { fontSize: '14px', fontWeight: '700', color: '#555', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 12px', background: '#f8f7f4', fontSize: '11px', fontWeight: '700', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #f5f5f5' },
  td: { padding: '10px 12px', fontSize: '13px', color: '#333', verticalAlign: 'middle' },
  saleIdBadge: { fontSize: '12px', fontWeight: '700', color: '#1a1a2e' },
  refTag: { color: '#c9a96e', fontWeight: '700', fontSize: '11px' },
  typeBadge: { fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '10px', whiteSpace: 'nowrap' },
  pendingBadge: { background: '#fde8e8', color: '#e74c3c', fontSize: '12px', fontWeight: '700', padding: '3px 8px', borderRadius: '10px' },
  paidBadge: { background: '#e8f5e9', color: '#2e7d32', fontSize: '12px', fontWeight: '700', padding: '3px 8px', borderRadius: '10px' },
};