import { describe, it, expect } from 'vitest';

// ── Helpers extraídos de HistorialPage ────────────────────────────────────────
function parseFechaLocal(fechaStr) {
  if (!fechaStr) return null;
  const s = fechaStr.includes('T') ? fechaStr : fechaStr + 'T00:00:00';
  return new Date(s);
}

function agruparPorMes(sales) {
  const mapa = {};
  const obtenerOCrear = (key, year, month) => {
    if (!mapa[key]) mapa[key] = { key, year, month, sales: [], pagosCuotas: [] };
    return mapa[key];
  };
  for (const sale of sales) {
    const fecha = parseFechaLocal(sale.saleDate);
    const saleKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    obtenerOCrear(saleKey, fecha.getFullYear(), fecha.getMonth()).sales.push(sale);
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

// ─────────────────────────────────────────────────────────────────────────────

const ventaContado = {
  id: 1,
  saleDate: '2026-01-15T10:00:00',
  totalAmount: '50000',
  paymentType: 'CONTADO',
  remainingBalance: '0',
  sellerName: 'Ana Lopez',
  items: [{ id: 1, productName: 'Blusa', quantity: 2, unitPrice: '25000' }],
  creditPayments: [],
};

const ventaCredito = {
  id: 2,
  saleDate: '2026-01-20T14:00:00',
  totalAmount: '120000',
  paymentType: 'CREDITO',
  remainingBalance: '80000',
  buyerName: 'Maria Gomez',
  sellerName: 'Juan Perez',
  items: [{ id: 2, productName: 'Vestido', quantity: 1, unitPrice: '120000' }],
  creditPayments: [
    { id: 10, amount: '40000', dueDate: '2026-02-20', paid: true, paidDate: '2026-03-05', notes: '' },
    { id: 11, amount: '40000', dueDate: '2026-03-20', paid: false, paidDate: null, notes: '' },
  ],
};

describe('parseFechaLocal', () => {
  it('parsea fecha con hora correctamente', () => {
    const d = parseFechaLocal('2026-01-15T10:00:00');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(0); // enero
    expect(d.getDate()).toBe(15);
  });

  it('parsea fecha sin hora como local', () => {
    const d = parseFechaLocal('2026-03-05');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(2); // marzo
    expect(d.getDate()).toBe(5);
  });

  it('retorna null para valor nulo', () => {
    expect(parseFechaLocal(null)).toBeNull();
  });
});

describe('agruparPorMes - ventas', () => {
  it('agrupa venta contado en su mes', () => {
    const grupos = agruparPorMes([ventaContado]);
    expect(grupos).toHaveLength(1);
    expect(grupos[0].key).toBe('2026-01');
    expect(grupos[0].sales).toHaveLength(1);
  });

  it('agrupa dos ventas del mismo mes juntas', () => {
    // ventaCredito tiene una cuota pagada en marzo → crea grupo extra
    // verificamos que enero agrupe correctamente las 2 ventas
    const grupos = agruparPorMes([ventaContado, ventaCredito]);
    const enero = grupos.find(g => g.key === '2026-01');
    expect(enero).toBeDefined();
    expect(enero.sales).toHaveLength(2);
  });

  it('ordena grupos de más reciente a más antiguo', () => {
    const ventaFeb = { ...ventaContado, id: 3, saleDate: '2026-02-10T09:00:00', creditPayments: [] };
    const grupos = agruparPorMes([ventaContado, ventaFeb]);
    expect(grupos[0].key).toBe('2026-02');
    expect(grupos[1].key).toBe('2026-01');
  });
});

describe('agruparPorMes - pagos de cuotas', () => {
  it('ubica cuota pagada en el mes de paidDate (marzo), no en el de la venta (enero)', () => {
    const grupos = agruparPorMes([ventaCredito]);
    const enero = grupos.find(g => g.key === '2026-01');
    const marzo = grupos.find(g => g.key === '2026-03');
    expect(enero.pagosCuotas).toHaveLength(0);
    expect(marzo.pagosCuotas).toHaveLength(1);
    expect(marzo.pagosCuotas[0].pago.id).toBe(10);
  });

  it('no incluye cuotas no pagadas', () => {
    const grupos = agruparPorMes([ventaCredito]);
    const totalCuotas = grupos.reduce((acc, g) => acc + g.pagosCuotas.length, 0);
    expect(totalCuotas).toBe(1); // solo la pagada
  });

  it('crea el grupo del mes si no existe por venta directa', () => {
    const ventaSoloCredito = {
      ...ventaCredito,
      saleDate: '2025-12-01T09:00:00', // diciembre 2025
    };
    const grupos = agruparPorMes([ventaSoloCredito]);
    const dic = grupos.find(g => g.key === '2025-12');
    const mar = grupos.find(g => g.key === '2026-03');
    expect(dic).toBeDefined();
    expect(mar).toBeDefined();
    expect(mar.pagosCuotas).toHaveLength(1);
  });
});