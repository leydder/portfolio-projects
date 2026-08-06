import { useState, useEffect, Fragment } from 'react';
import api from '../api/axios';

const QUOTE_STATUSES = ['DRAFT', 'SENT', 'APPROVED', 'REJECTED'];
const QUOTE_STATUS_LABELS = {
  DRAFT: 'Borrador',
  SENT: 'Enviado',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
};

const EMPTY_QUOTE_FORM = {
  projectId: '',
  quoteNumber: '',
  date: '',
  administrationPercent: '',
  unforeseenPercent: '',
  utilityPercent: '',
  status: 'DRAFT',
};

const EMPTY_ITEM_FORM = { description: '', unit: '', quantity: '', unitPrice: '' };

export default function QuotesPage() {
  const [quotes, setQuotes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [quoteForm, setQuoteForm] = useState(EMPTY_QUOTE_FORM);
  const [editingQuoteId, setEditingQuoteId] = useState(null);
  const [error, setError] = useState('');

  const [expandedQuoteId, setExpandedQuoteId] = useState(null);
  const [itemForm, setItemForm] = useState(EMPTY_ITEM_FORM);
  const [editingItemId, setEditingItemId] = useState(null);

  const loadQuotes = async () => {
    const res = await api.get('/api/quotes');
    setQuotes(res.data);
  };

  const loadProjects = async () => {
    const res = await api.get('/api/projects');
    setProjects(res.data);
  };

  useEffect(() => {
    loadQuotes();
    loadProjects();
  }, []);

  const handleQuoteChange = (e) => {
    setQuoteForm({ ...quoteForm, [e.target.name]: e.target.value });
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      project: { id: Number(quoteForm.projectId) },
      quoteNumber: quoteForm.quoteNumber,
      date: quoteForm.date || null,
      administrationPercent: Number(quoteForm.administrationPercent),
      unforeseenPercent: Number(quoteForm.unforeseenPercent),
      utilityPercent: Number(quoteForm.utilityPercent),
      status: quoteForm.status,
    };
    try {
      if (editingQuoteId) {
        await api.put(`/api/quotes/${editingQuoteId}`, payload);
      } else {
        await api.post('/api/quotes', payload);
      }
      setQuoteForm(EMPTY_QUOTE_FORM);
      setEditingQuoteId(null);
      loadQuotes();
    } catch {
      setError('No se pudo guardar el presupuesto.');
    }
  };

  const handleQuoteEdit = (quote) => {
    setQuoteForm({
      projectId: quote.project ? String(quote.project.id) : '',
      quoteNumber: quote.quoteNumber || '',
      date: quote.date || '',
      administrationPercent: quote.administrationPercent ?? '',
      unforeseenPercent: quote.unforeseenPercent ?? '',
      utilityPercent: quote.utilityPercent ?? '',
      status: quote.status || 'DRAFT',
    });
    setEditingQuoteId(quote.id);
  };

  const handleQuoteCancelEdit = () => {
    setQuoteForm(EMPTY_QUOTE_FORM);
    setEditingQuoteId(null);
  };

  const handleQuoteDelete = async (id) => {
    if (!window.confirm('¿Eliminar este presupuesto y todos sus items?')) return;
    await api.delete(`/api/quotes/${id}`);
    if (expandedQuoteId === id) setExpandedQuoteId(null);
    loadQuotes();
  };

  const toggleExpand = (quoteId) => {
    setItemForm(EMPTY_ITEM_FORM);
    setEditingItemId(null);
    setExpandedQuoteId(expandedQuoteId === quoteId ? null : quoteId);
  };

  const handleItemChange = (e) => {
    setItemForm({ ...itemForm, [e.target.name]: e.target.value });
  };

  const handleItemSubmit = async (e, quoteId) => {
    e.preventDefault();
    setError('');
    const payload = {
      quote: { id: quoteId },
      description: itemForm.description,
      unit: itemForm.unit,
      quantity: Number(itemForm.quantity),
      unitPrice: Number(itemForm.unitPrice),
    };
    try {
      if (editingItemId) {
        await api.put(`/api/quote-items/${editingItemId}`, payload);
      } else {
        await api.post('/api/quote-items', payload);
      }
      setItemForm(EMPTY_ITEM_FORM);
      setEditingItemId(null);
      loadQuotes();
    } catch {
      setError('No se pudo guardar el item.');
    }
  };

  const handleItemEdit = (item) => {
    setItemForm({
      description: item.description || '',
      unit: item.unit || '',
      quantity: item.quantity ?? '',
      unitPrice: item.unitPrice ?? '',
    });
    setEditingItemId(item.id);
  };

  const handleItemCancelEdit = () => {
    setItemForm(EMPTY_ITEM_FORM);
    setEditingItemId(null);
  };

  const handleItemDelete = async (itemId) => {
    if (!window.confirm('¿Eliminar este item?')) return;
    await api.delete(`/api/quote-items/${itemId}`);
    loadQuotes();
  };

  return (
    <div>
      <h1>Presupuestos</h1>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Proyecto</th>
            <th>Nro.</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Subtotal</th>
            <th>AIU</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((q) => (
            <Fragment key={q.id}>
              <tr>
                <td>{q.id}</td>
                <td>{q.project ? q.project.name : '—'}</td>
                <td>{q.quoteNumber}</td>
                <td>{q.date}</td>
                <td>{QUOTE_STATUS_LABELS[q.status] || q.status}</td>
                <td>{q.subtotal}</td>
                <td>{q.aiuAmount}</td>
                <td>{q.total}</td>
                <td>
                  <button style={styles.actionButton} onClick={() => toggleExpand(q.id)}>
                    {expandedQuoteId === q.id ? 'Ocultar items' : 'Ver items'}
                  </button>
                  <button style={styles.actionButton} onClick={() => handleQuoteEdit(q)}>Editar</button>
                  <button style={styles.deleteButton} onClick={() => handleQuoteDelete(q.id)}>Eliminar</button>
                </td>
              </tr>
              {expandedQuoteId === q.id && (
                <tr>
                  <td colSpan={9} style={styles.itemsCell}>
                    <div style={styles.itemsPanel}>
                      <table>
                        <thead>
                          <tr>
                            <th>Descripción</th>
                            <th>Unidad</th>
                            <th>Cantidad</th>
                            <th>Precio unit.</th>
                            <th>Subtotal</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(q.items || []).map((item) => (
                            <tr key={item.id}>
                              <td>{item.description}</td>
                              <td>{item.unit}</td>
                              <td>{item.quantity}</td>
                              <td>{item.unitPrice}</td>
                              <td>{item.subtotal}</td>
                              <td>
                                <button style={styles.actionButton} onClick={() => handleItemEdit(item)}>Editar</button>
                                <button style={styles.deleteButton} onClick={() => handleItemDelete(item.id)}>Eliminar</button>
                              </td>
                            </tr>
                          ))}
                          {(q.items || []).length === 0 && (
                            <tr><td colSpan={6}>Sin items todavía.</td></tr>
                          )}
                        </tbody>
                      </table>

                      <form onSubmit={(e) => handleItemSubmit(e, q.id)} style={styles.itemForm}>
                        <div style={styles.row}>
                          <div style={styles.field}>
                            <label style={styles.label}>Descripción</label>
                            <input style={styles.input} name="description" value={itemForm.description} onChange={handleItemChange} required />
                          </div>
                          <div style={styles.field}>
                            <label style={styles.label}>Unidad</label>
                            <input style={styles.input} name="unit" value={itemForm.unit} onChange={handleItemChange} required />
                          </div>
                          <div style={styles.field}>
                            <label style={styles.label}>Cantidad</label>
                            <input style={styles.input} type="number" step="0.01" name="quantity" value={itemForm.quantity} onChange={handleItemChange} required />
                          </div>
                          <div style={styles.field}>
                            <label style={styles.label}>Precio unitario</label>
                            <input style={styles.input} type="number" step="0.01" name="unitPrice" value={itemForm.unitPrice} onChange={handleItemChange} required />
                          </div>
                        </div>
                        <div style={styles.buttonRow}>
                          <button style={styles.button} type="submit">{editingItemId ? 'Guardar item' : 'Agregar item'}</button>
                          {editingItemId && <button type="button" style={styles.cancelButton} onClick={handleItemCancelEdit}>Cancelar</button>}
                        </div>
                      </form>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>

      <h2>{editingQuoteId ? 'Editar presupuesto' : 'Crear presupuesto'}</h2>
      <form onSubmit={handleQuoteSubmit} style={styles.form}>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Proyecto</label>
            <select style={styles.input} name="projectId" value={quoteForm.projectId} onChange={handleQuoteChange} required>
              <option value="" disabled>Selecciona un proyecto</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Nro. presupuesto</label>
            <input style={styles.input} name="quoteNumber" value={quoteForm.quoteNumber} onChange={handleQuoteChange} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Fecha</label>
            <input style={styles.input} type="date" name="date" value={quoteForm.date} onChange={handleQuoteChange} required />
          </div>
        </div>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Administración %</label>
            <input style={styles.input} type="number" step="0.01" name="administrationPercent" value={quoteForm.administrationPercent} onChange={handleQuoteChange} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Imprevistos %</label>
            <input style={styles.input} type="number" step="0.01" name="unforeseenPercent" value={quoteForm.unforeseenPercent} onChange={handleQuoteChange} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Utilidad %</label>
            <input style={styles.input} type="number" step="0.01" name="utilityPercent" value={quoteForm.utilityPercent} onChange={handleQuoteChange} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Estado</label>
            <select style={styles.input} name="status" value={quoteForm.status} onChange={handleQuoteChange}>
              {QUOTE_STATUSES.map((s) => (
                <option key={s} value={s}>{QUOTE_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
        </div>
        {error && <p style={styles.error}>{error}</p>}
        <div style={styles.buttonRow}>
          <button style={styles.button} type="submit">{editingQuoteId ? 'Guardar cambios' : 'Crear'}</button>
          {editingQuoteId && <button type="button" style={styles.cancelButton} onClick={handleQuoteCancelEdit}>Cancelar</button>}
        </div>
      </form>
    </div>
  );
}

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxWidth: '700px',
    marginTop: '16px',
  },
  itemForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '16px',
  },
  row: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: '1',
    minWidth: '140px',
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
  buttonRow: {
    display: 'flex',
    gap: '12px',
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
  cancelButton: {
    padding: '10px 20px',
    background: '#eaeaea',
    color: '#202020',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  actionButton: {
    padding: '6px 12px',
    marginRight: '8px',
    background: '#0071cf',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '6px 12px',
    background: '#c81109',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  itemsCell: {
    background: '#f7f7f7',
    padding: '16px',
  },
  itemsPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  error: {
    color: '#c81109',
    fontSize: '13px',
  },
};
