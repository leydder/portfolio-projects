import { useState, useEffect } from 'react';
import api from '../api/axios';

const REPORT_TYPES = [
  { key: 'projects', label: 'Proyectos', listUrl: '/api/projects', reportUrl: '/api/reports/projects' },
  { key: 'quotes', label: 'Presupuestos', listUrl: '/api/quotes', reportUrl: '/api/reports/quotes' },
];

const ALL_VALUE = 'ALL';

function optionLabel(type, item) {
  if (type === 'projects') return item.name;
  return `${item.quoteNumber} — ${item.project ? item.project.name : 'Sin proyecto'}`;
}

export default function ReportsPage() {
  const [activeType, setActiveType] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(ALL_VALUE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const activeConfig = REPORT_TYPES.find((t) => t.key === activeType);

  useEffect(() => {
    if (!activeConfig) return;
    setSelectedId(ALL_VALUE);
    setError('');
    api.get(activeConfig.listUrl).then((res) => setItems(res.data)).catch(() => setItems([]));
  }, [activeType]);

  const handleSelectType = (key) => {
    setActiveType(key === activeType ? null : key);
  };

  const handleDownload = async () => {
    setError('');
    setLoading(true);
    try {
      const isAll = selectedId === ALL_VALUE;
      const params = isAll ? {} : { id: selectedId };
      const res = await api.get(activeConfig.reportUrl, { params, responseType: 'blob' });
      const filenamePrefix = activeConfig.key === 'projects' ? 'proyecto' : 'presupuesto';
      const filename = isAll ? `${filenamePrefix}s.xlsx` : `${filenamePrefix}-${selectedId}.xlsx`;
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      setError('No se pudo generar el reporte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Reportes</h1>
      <p style={styles.subtitle}>Selecciona qué reporte en Excel deseas descargar.</p>

      <div style={styles.cards}>
        {REPORT_TYPES.map((type) => (
          <button
            key={type.key}
            style={{ ...styles.card, ...(activeType === type.key ? styles.cardActive : {}) }}
            onClick={() => handleSelectType(type.key)}
          >
            <span style={styles.cardTitle}>{type.label}</span>
          </button>
        ))}
      </div>

      {activeConfig && (
        <div style={styles.panel}>
          <div style={styles.field}>
            <label style={styles.label}>
              {activeConfig.key === 'projects' ? 'Proyecto' : 'Presupuesto'}
            </label>
            <select style={styles.input} value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
              <option value={ALL_VALUE}>Todos (un solo archivo)</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>{optionLabel(activeConfig.key, item)}</option>
              ))}
            </select>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button style={styles.button} onClick={handleDownload} disabled={loading}>
            {loading ? 'Generando...' : 'Descargar Excel'}
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  subtitle: {
    color: '#555',
    fontSize: '14px',
    marginTop: '4px',
  },
  error: {
    color: '#c81109',
    fontSize: '13px',
  },
  cards: {
    display: 'flex',
    gap: '20px',
    marginTop: '24px',
    flexWrap: 'wrap',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '24px',
    minWidth: '220px',
    background: '#fff',
    border: '1.5px solid #eaeaea',
    borderRadius: '12px',
    cursor: 'pointer',
    textAlign: 'left',
  },
  cardActive: {
    border: '1.5px solid #0071cf',
    background: '#eaf4ff',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#00032d',
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxWidth: '420px',
    marginTop: '24px',
    padding: '24px',
    background: '#fff',
    border: '1.5px solid #eaeaea',
    borderRadius: '12px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#202020',
  },
  input: {
    padding: '10px 14px',
    border: '1.5px solid #eaeaea',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: "'Work Sans', sans-serif",
  },
  button: {
    padding: '10px 20px',
    background: '#0071cf',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 700,
    cursor: 'pointer',
  },
};
