import { useEffect, useState } from 'react';
import api from '../api/axios';

const EMPTY_MODAL = { open: false, saleId: null, paymentId: null, cuotaAmount: 0, remainingBalance: 0, amount: '' };
const EMPTY_SETTLE = { open: false, saleId: null, remainingBalance: 0, amount: '', notes: '' };

export default function DeudoresPage() {
  const [sales, setSales] = useState([]);
  const [pagoModal, setPagoModal] = useState(EMPTY_MODAL);
  const [pagoError, setPagoError] = useState('');
  const [settleModal, setSettleModal] = useState(EMPTY_SETTLE);
  const [settleError, setSettleError] = useState('');

  const loadData = async () => {
    const res = await api.get('/api/sales');
    setSales(res.data);
  };

  useEffect(() => { loadData(); }, []);

  const abrirModal = (saleId, paymentId, cuotaAmount, remainingBalance) => {
    setPagoModal({ open: true, saleId, paymentId, cuotaAmount, remainingBalance, amount: String(Math.round(cuotaAmount)) });
    setPagoError('');
  };
  const cerrarModal = () => { setPagoModal(EMPTY_MODAL); setPagoError(''); };

  const handleConfirmarPago = async () => {
    const monto = parseInt(pagoModal.amount);
    if (!monto || monto <= 0) { setPagoError('El monto debe ser mayor a 0'); return; }
    try {
      await api.put(`/api/sales/${pagoModal.saleId}/payments`, { id: pagoModal.paymentId, amount: monto });
      cerrarModal();
      loadData();
    } catch (err) {
      setPagoError(err.response?.data?.message || 'Error al registrar pago');
    }
  };

  const abrirSettle = (saleId, remainingBalance) => {
    setSettleModal({ open: true, saleId, remainingBalance, amount: String(Math.round(remainingBalance)), notes: '' });
    setSettleError('');
  };
  const cerrarSettle = () => { setSettleModal(EMPTY_SETTLE); setSettleError(''); };

  const handleConfirmarSettle = async () => {
    const monto = parseInt(settleModal.amount);
    if (!monto || monto <= 0) { setSettleError('El monto debe ser mayor a 0'); return; }
    try {
      await api.put(`/api/sales/${settleModal.saleId}/settle`, {
        amount: monto,
        notes: settleModal.notes || undefined,
      });
      cerrarSettle();
      loadData();
    } catch (err) {
      setSettleError(err.response?.data?.message || 'Error al liquidar deuda');
    }
  };

  const deudores = sales.filter(s => s.paymentType === 'CREDITO' && parseFloat(s.remainingBalance || 0) > 0);
  const saldoTotal = deudores.reduce((acc, s) => acc + parseFloat(s.remainingBalance), 0);

  const montoIngresado = parseInt(pagoModal.amount) || 0;
  const saldaDeuda = montoIngresado >= pagoModal.remainingBalance;

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
          <p style={{ ...styles.statVal, color: '#e74c3c' }}>${Math.round(saldoTotal).toLocaleString('es-CO')}</p>
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
            const saldo = parseFloat(sale.remainingBalance);
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
                    <p style={styles.saldoVal}>${Math.round(saldo).toLocaleString('es-CO')}</p>
                    <button style={styles.btnSaldar} onClick={() => abrirSettle(sale.id, saldo)}>
                      💰 Saldar deuda completa
                    </button>
                  </div>
                </div>

                <div style={styles.compraInfo}>
                  <span style={styles.infoChip}>Total compra: <strong>${Math.round(parseFloat(sale.totalAmount)).toLocaleString('es-CO')}</strong></span>
                  <span style={styles.infoChip}>Inicial pagado: <strong>${Math.round(parseFloat(sale.initialPayment || 0)).toLocaleString('es-CO')}</strong></span>
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
                          <span style={styles.cuotaAmount}>${Math.round(parseFloat(cp.amount)).toLocaleString('es-CO')}</span>
                          {cp.dueDate && (() => {
                            const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
                            const vence = new Date(cp.dueDate + 'T00:00:00');
                            const vencida = vence < hoy;
                            return (
                              <span style={{ ...styles.cuotaDate, color: vencida ? '#e74c3c' : '#888' }}>
                                {' · Vence: '}{cp.dueDate}
                                {vencida && ' ⚠️'}
                              </span>
                            );
                          })()}
                          {cp.notes && <span style={styles.cuotaNota}>{' · '}{cp.notes}</span>}
                        </div>
                        <button style={styles.btnPagar}
                          onClick={() => abrirModal(sale.id, cp.id, parseFloat(cp.amount), saldo)}>
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
                          <span style={styles.cuotaAmount}>${Math.round(parseFloat(cp.amount)).toLocaleString('es-CO')}</span>
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

      {/* Modal: Saldar deuda completa */}
      {settleModal.open && (
        <div style={styles.overlay} onClick={cerrarSettle}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>💰 Saldar deuda completa</h3>
            <div style={styles.modalInfo}>
              <div style={styles.modalInfoRow}>
                <span style={styles.modalInfoLabel}>Deuda total pendiente</span>
                <span style={styles.modalInfoVal}>${Math.round(settleModal.remainingBalance).toLocaleString('es-CO')}</span>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#7d4255', marginBottom: '16px' }}>
              El monto ingresado cancelará la deuda completa sin importar el valor. Si es menor al saldo, quedará registrado como acuerdo de gerencia.
            </p>
            <div style={{ marginBottom: '14px' }}>
              <label style={styles.label}>Monto a cobrar ($)</label>
              <input style={styles.input} type="number" step="1" min="1" autoFocus autoComplete="off"
                value={settleModal.amount}
                onChange={e => { setSettleModal({ ...settleModal, amount: e.target.value }); setSettleError(''); }} />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={styles.label}>Nota (opcional)</label>
              <input style={{ ...styles.input, fontSize: '14px', fontWeight: '400' }}
                placeholder="Ej: Acuerdo con el cliente..."
                value={settleModal.notes}
                onChange={e => setSettleModal({ ...settleModal, notes: e.target.value })} />
            </div>
            {(() => {
              const monto = parseInt(settleModal.amount) || 0;
              if (monto > 0 && monto < settleModal.remainingBalance) return (
                <div style={styles.descuentoAlert}>
                  ⚠ El monto es menor a la deuda. Se registrará como cancelación por decisión de gerencia y quedará visible en Ganancias.
                </div>
              );
              if (monto >= settleModal.remainingBalance && monto > 0) return (
                <div style={styles.saldaAlert}>
                  ✓ Cancela la deuda completa.
                </div>
              );
              return null;
            })()}
            {settleError && <p style={styles.error}>{settleError}</p>}
            <div style={styles.modalActions}>
              <button style={styles.btnSecondary} onClick={cerrarSettle}>Cancelar</button>
              <button style={{ ...styles.btnPrimary, background: '#27ae60' }} onClick={handleConfirmarSettle}>Confirmar liquidación</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de pago */}
      {pagoModal.open && (
        <div style={styles.overlay} onClick={cerrarModal}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Registrar pago</h3>

            <div style={styles.modalInfo}>
              <div style={styles.modalInfoRow}>
                <span style={styles.modalInfoLabel}>Deuda restante</span>
                <span style={styles.modalInfoVal}>${Math.round(pagoModal.remainingBalance).toLocaleString('es-CO')}</span>
              </div>
              <div style={styles.modalInfoRow}>
                <span style={styles.modalInfoLabel}>Valor original cuota</span>
                <span style={{ ...styles.modalInfoVal, color: '#888', fontSize: '14px' }}>${Math.round(pagoModal.cuotaAmount).toLocaleString('es-CO')}</span>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={styles.label}>Monto a pagar ($)</label>
              <input
                style={styles.input}
                type="number"
                step="1"
                min="1"
                autoFocus
                autoComplete="off"
                value={pagoModal.amount}
                onChange={e => { setPagoModal({ ...pagoModal, amount: e.target.value }); setPagoError(''); }}
              />
            </div>

            {saldaDeuda && montoIngresado > 0 && (
              <div style={styles.saldaAlert}>
                ✓ Este pago salda la deuda completa. Las cuotas restantes se cancelarán automáticamente.
              </div>
            )}

            {pagoError && <p style={styles.error}>{pagoError}</p>}

            <div style={styles.modalActions}>
              <button style={styles.btnSecondary} onClick={cerrarModal}>Cancelar</button>
              <button style={styles.btnPrimary} onClick={handleConfirmarPago}>Confirmar pago</button>
            </div>
          </div>
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
  btnSaldar: { marginTop: '6px', padding: '6px 14px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', width: '100%' },
  paidBadge: { background: '#e8f5e9', color: '#2e7d32', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '10px' },
  // Modal
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  modal: { background: '#fff', borderRadius: '16px', padding: '32px', width: '400px', maxWidth: '92vw' },
  modalTitle: { fontSize: '18px', fontWeight: '700', color: '#3d2027', margin: '0 0 20px', fontFamily: 'Georgia, serif' },
  modalInfo: { background: '#fdf0ed', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px' },
  modalInfoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  modalInfoLabel: { fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' },
  modalInfoVal: { fontSize: '18px', fontWeight: '800', color: '#e74c3c' },
  label: { fontSize: '12px', fontWeight: '600', color: '#7d4255', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' },
  input: { padding: '10px 12px', border: '1.5px solid #f0d0ca', borderRadius: '8px', fontSize: '16px', fontWeight: '700', outline: 'none', width: '100%', boxSizing: 'border-box', color: '#3d2027' },
  saldaAlert: { background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#2e7d32', fontWeight: '600', marginBottom: '14px' },
  descuentoAlert: { background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#7d6000', fontWeight: '600', marginBottom: '14px' },
  error: { color: '#c0394a', fontSize: '13px', margin: '0 0 12px' },
  modalActions: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' },
  btnPrimary: { padding: '10px 22px', background: '#3d2027', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  btnSecondary: { padding: '10px 22px', background: '#fff', color: '#3d2027', border: '1.5px solid #3d2027', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
};