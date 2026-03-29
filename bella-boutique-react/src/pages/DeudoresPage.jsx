import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function DeudoresPage() {
  const [sales, setSales] = useState([]);
  const [selected, setSelected] = useState(null);

  const loadData = async () => {
    const res = await api.get('/api/sales');
    setSales(res.data);
  };

  useEffect(() => { loadData(); }, []);

  const handleMarkPaid = async (saleId, paymentId) => {
    try {
      const res = await api.put(`/api/sales/${saleId}/payments`, { id: paymentId });
      setSelected(res.data);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al registrar pago');
    }
  };

  const deudores = sales.filter(s => s.paymentType === 'CREDITO' && parseFloat(s.remainingBalance || 0) > 0);
  const saldoTotal = deudores.reduce((acc, s) => acc + parseFloat(s.remainingBalance), 0);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Deudores</h1>
          <p style={styles.sub}>Clientes con saldo pendiente</p>
        </div>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Clientes con deuda</p>
          <p style={{ ...styles.statVal, color: '#e74c3c' }}>{deudores.length}</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.statLabel}>Saldo total por cobrar</p>
          <p style={{ ...styles.statVal, color: '#e74c3c' }}>${saldoTotal.toLocaleString('es-CO')}</p>
        </div>
      </div>

      {deudores.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={{ fontSize: '48px', margin: 0 }}>✓</p>
          <p style={{ color: '#888', fontSize: '15px' }}>No hay saldos pendientes</p>
        </div>
      ) : (
        <div style={styles.list}>
          {deudores.map(sale => {
            const cuotasPendientes = sale.creditPayments?.filter(cp => !cp.paid) || [];
            const cuotasPagadas = sale.creditPayments?.filter(cp => cp.paid) || [];
            return (
              <div key={sale.id} style={styles.card}>
                <div style={styles.cardTop}>
                  <div style={styles.avatarWrap}>
                    <div style={styles.avatar}>{sale.buyerName?.charAt(0).toUpperCase()}</div>
                    <div>
                      <p style={styles.buyerName}>{sale.buyerName}</p>
                      <p style={styles.buyerSub}>
                        Venta #{sale.id} · {new Date(sale.saleDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div style={styles.saldoWrap}>
                    <p style={styles.saldoLabel}>Saldo pendiente</p>
                    <p style={styles.saldoVal}>${parseFloat(sale.remainingBalance).toLocaleString('es-CO')}</p>
                  </div>
                </div>

                <div style={styles.compraInfo}>
                  <span style={styles.infoChip}>Total compra: <strong>${parseFloat(sale.totalAmount).toLocaleString('es-CO')}</strong></span>
                  <span style={styles.infoChip}>Inicial pagado: <strong>${parseFloat(sale.initialPayment || 0).toLocaleString('es-CO')}</strong></span>
                  <span style={styles.infoChip}>{sale.items.length} prenda{sale.items.length !== 1 ? 's' : ''}</span>
                </div>

                <div style={styles.itemsSection}>
                  <p style={styles.secLabel}>Prendas compradas</p>
                  <div style={styles.itemsList}>
                    {sale.items.map(item => (
                      <span key={item.id} style={styles.itemChip}>
                        {item.productName}{item.sizeName ? ` (${item.sizeName})` : ''} ×{item.quantity}
                      </span>
                    ))}
                  </div>
                </div>

                {cuotasPendientes.length > 0 && (
                  <div style={styles.cuotasSection}>
                    <p style={styles.secLabel}>Cuotas pendientes</p>
                    {cuotasPendientes.map(cp => (
                      <div key={cp.id} style={styles.cuotaRow}>
                        <div>
                          <span style={styles.cuotaAmount}>${parseFloat(cp.amount).toLocaleString('es-CO')}</span>
                          {cp.dueDate && (
                            <span style={{ ...styles.cuotaDate, color: new Date(cp.dueDate) < new Date() ? '#e74c3c' : '#888' }}>
                              {' · Vence: '}{cp.dueDate}
                              {new Date(cp.dueDate) < new Date() && ' ⚠️'}
                            </span>
                          )}
                          {cp.notes && <span style={styles.cuotaNota}>{' · '}{cp.notes}</span>}
                        </div>
                        <button style={styles.btnPagar} onClick={() => handleMarkPaid(sale.id, cp.id)}>
                          Registrar pago
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {cuotasPagadas.length > 0 && (
                  <div style={styles.cuotasSection}>
                    <p style={{ ...styles.secLabel, color: '#2e7d32' }}>Cuotas pagadas ({cuotasPagadas.length})</p>
                    {cuotasPagadas.map(cp => (
                      <div key={cp.id} style={{ ...styles.cuotaRow, opacity: 0.6 }}>
                        <div>
                          <span style={styles.cuotaAmount}>${parseFloat(cp.amount).toLocaleString('es-CO')}</span>
                          {cp.paidDate && <span style={styles.cuotaDate}>{' · Pagado: '}{cp.paidDate}</span>}
                        </div>
                        <span style={styles.paidBadge}>✓ Pagado</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: '32px 40px', background: '#fdf0ed', minHeight: 'calc(100vh - 64px)' },
  header: { marginBottom: '24px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#3d2027', margin: 0, fontFamily: 'Georgia, serif' },
  sub: { color: '#888', fontSize: '14px', margin: '4px 0 0' },
  statsRow: { display: 'flex', gap: '16px', marginBottom: '28px' },
  statCard: { background: '#fff', borderRadius: '12px', padding: '18px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', minWidth: '200px' },
  statLabel: { fontSize: '11px', color: '#888', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '1px' },
  statVal: { fontSize: '26px', fontWeight: '800', color: '#3d2027', margin: 0 },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '80px', color: '#2e7d32' },
  list: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: { background: '#fff', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  avatarWrap: { display: 'flex', alignItems: 'center', gap: '14px' },
  avatar: { width: '48px', height: '48px', background: '#3d2027', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '20px', flexShrink: 0 },
  buyerName: { fontWeight: '700', color: '#3d2027', fontSize: '16px', margin: '0 0 3px' },
  buyerSub: { fontSize: '12px', color: '#888', margin: 0 },
  saldoWrap: { textAlign: 'right' },
  saldoLabel: { fontSize: '11px', color: '#888', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  saldoVal: { fontSize: '22px', fontWeight: '800', color: '#e74c3c', margin: 0 },
  compraInfo: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid #f0f0f0' },
  infoChip: { background: '#fdf0ed', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', color: '#555' },
  itemsSection: { marginBottom: '14px' },
  secLabel: { fontSize: '11px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px' },
  itemsList: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  itemChip: { background: '#f0ede8', color: '#3d2027', fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '10px' },
  cuotasSection: { marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #f0f0f0' },
  cuotaRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fef9f0', borderRadius: '8px', padding: '10px 14px', marginBottom: '8px', border: '1px solid #fdd9b5' },
  cuotaAmount: { fontWeight: '700', color: '#3d2027', fontSize: '14px' },
  cuotaDate: { fontSize: '12px', color: '#888' },
  cuotaNota: { fontSize: '12px', color: '#aaa', fontStyle: 'italic' },
  btnPagar: { padding: '7px 16px', background: '#3d2027', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', flexShrink: 0 },
  paidBadge: { background: '#e8f5e9', color: '#2e7d32', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '10px' },
};