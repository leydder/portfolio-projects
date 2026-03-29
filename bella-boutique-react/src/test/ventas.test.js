import { describe, it, expect } from 'vitest';

// ── Helpers de VentasPage ─────────────────────────────────────────────────────
function filtrarVentas(sales, search, activeTab) {
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
}

function getSellerName(sellerMode, selectedSellerId, sellers, manualSellerName) {
  if (sellerMode === 'list' && selectedSellerId) {
    const s = sellers.find(s => s.id === parseInt(selectedSellerId));
    return s ? `${s.firstName} ${s.lastName}` : '';
  }
  return manualSellerName.trim();
}
// ─────────────────────────────────────────────────────────────────────────────

const sellers = [
  { id: 1, firstName: 'Ana', lastName: 'Lopez' },
  { id: 2, firstName: 'Juan', lastName: 'Perez' },
];

const sales = [
  {
    id: 1, paymentType: 'CONTADO', saleDate: '2026-01-10T10:00:00',
    sellerName: 'Ana Lopez', buyerName: null,
    items: [{ productName: 'Blusa roja' }],
  },
  {
    id: 2, paymentType: 'CREDITO', saleDate: '2026-02-05T10:00:00',
    sellerName: 'Juan Perez', buyerName: 'Maria Torres',
    items: [{ productName: 'Vestido negro' }],
  },
  {
    id: 3, paymentType: 'CONTADO', saleDate: '2026-02-20T10:00:00',
    sellerName: null, buyerName: null,
    items: [{ productName: 'Pantalón azul' }],
  },
];

describe('filtrarVentas - por tab', () => {
  it('tab todos devuelve todas', () => {
    expect(filtrarVentas(sales, '', 'todos')).toHaveLength(3);
  });

  it('tab contado filtra solo contado', () => {
    const result = filtrarVentas(sales, '', 'contado');
    expect(result).toHaveLength(2);
    expect(result.every(s => s.paymentType === 'CONTADO')).toBe(true);
  });

  it('tab credito filtra solo credito', () => {
    const result = filtrarVentas(sales, '', 'credito');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });
});

describe('filtrarVentas - búsqueda', () => {
  it('busca por nombre de producto', () => {
    const result = filtrarVentas(sales, 'vestido', 'todos');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('busca por nombre de vendedor', () => {
    const result = filtrarVentas(sales, 'ana', 'todos');
    expect(result).toHaveLength(1);
    expect(result[0].sellerName).toBe('Ana Lopez');
  });

  it('busca por comprador', () => {
    const result = filtrarVentas(sales, 'torres', 'todos');
    expect(result).toHaveLength(1);
    expect(result[0].buyerName).toBe('Maria Torres');
  });

  it('búsqueda sin coincidencias devuelve vacío', () => {
    expect(filtrarVentas(sales, 'xyz123', 'todos')).toHaveLength(0);
  });

  it('combina tab y búsqueda', () => {
    const result = filtrarVentas(sales, 'pantalon', 'credito');
    expect(result).toHaveLength(0); // pantalón es contado
  });
});

describe('getSellerName', () => {
  it('retorna nombre completo del vendedor del listado', () => {
    expect(getSellerName('list', '1', sellers, '')).toBe('Ana Lopez');
  });

  it('retorna nombre manual cuando modo es manual', () => {
    expect(getSellerName('manual', '', sellers, '  Carlos Ruiz  ')).toBe('Carlos Ruiz');
  });

  it('retorna cadena vacía si listado sin selección', () => {
    expect(getSellerName('list', '', sellers, '')).toBe('');
  });

  it('retorna cadena vacía si vendedor no existe en listado', () => {
    expect(getSellerName('list', '99', sellers, '')).toBe('');
  });
});