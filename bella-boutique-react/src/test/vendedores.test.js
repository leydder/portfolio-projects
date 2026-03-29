import { describe, it, expect } from 'vitest';

// ── Helpers extraídos de VendedoresPage ───────────────────────────────────────
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
// ─────────────────────────────────────────────────────────────────────────────

const mkSale = (id, seller, amount, date = '2026-01-10T10:00:00', type = 'CONTADO') => ({
  id,
  sellerName: seller,
  totalAmount: String(amount),
  saleDate: date,
  paymentType: type,
  remainingBalance: '0',
  items: [],
  creditPayments: [],
});

describe('agruparVendedores', () => {
  it('agrupa ventas por vendedor', () => {
    const sales = [mkSale(1, 'Ana Lopez', 50000), mkSale(2, 'Ana Lopez', 30000), mkSale(3, 'Juan Perez', 80000)];
    const result = agruparVendedores(sales);
    expect(result).toHaveLength(2);
    const ana = result.find(v => v.username === 'Ana Lopez');
    expect(ana.totalVentas).toBe(2);
    expect(ana.totalAmount).toBe(80000);
  });

  it('ordena por totalAmount descendente', () => {
    const sales = [mkSale(1, 'Ana', 40000), mkSale(2, 'Juan', 90000)];
    const result = agruparVendedores(sales);
    expect(result[0].username).toBe('Juan');
  });

  it('ventas sin vendedor van a Sin asignar', () => {
    const sales = [mkSale(1, null, 20000), mkSale(2, '', 30000)];
    const result = agruparVendedores(sales);
    expect(result[0].username).toBe('Sin asignar');
    expect(result[0].totalVentas).toBe(2);
  });

  it('retorna arreglo vacío si no hay ventas', () => {
    expect(agruparVendedores([])).toHaveLength(0);
  });
});

describe('agruparPorMes (vendedores)', () => {
  it('agrupa ventas del mismo mes', () => {
    const sales = [mkSale(1, 'Ana', 50000, '2026-01-05T10:00:00'), mkSale(2, 'Ana', 30000, '2026-01-20T10:00:00')];
    const grupos = agruparPorMes(sales);
    expect(grupos).toHaveLength(1);
    expect(grupos[0].sales).toHaveLength(2);
  });

  it('separa meses distintos', () => {
    const sales = [mkSale(1, 'Ana', 50000, '2026-01-05T10:00:00'), mkSale(2, 'Ana', 30000, '2026-02-10T10:00:00')];
    const grupos = agruparPorMes(sales);
    expect(grupos).toHaveLength(2);
    expect(grupos[0].key).toBe('2026-02'); // más reciente primero
  });

  it('retorna arreglo vacío si no hay ventas', () => {
    expect(agruparPorMes([])).toHaveLength(0);
  });
});