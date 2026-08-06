import { useState, useEffect } from 'react';
import api from '../api/axios';

const DOCUMENT_TYPES = ['CC', 'NIT', 'CE'];

const EMPTY_FORM = {
  name: '',
  documentType: 'CC',
  documentNumber: '',
  email: '',
  phone: '',
  address: '',
};

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const loadClients = async () => {
    const res = await api.get('/api/clients');
    setClients(res.data);
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/api/clients/${editingId}`, form);
      } else {
        await api.post('/api/clients', form);
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      loadClients();
    } catch {
      setError('No se pudo guardar el cliente.');
    }
  };

  const handleEdit = (client) => {
    setForm({
      name: client.name || '',
      documentType: client.documentType || 'CC',
      documentNumber: client.documentNumber || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
    });
    setEditingId(client.id);
  };

  const handleCancelEdit = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este cliente?')) return;
    await api.delete(`/api/clients/${id}`);
    loadClients();
  };

  return (
    <div>
      <h1>Clientes</h1>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Documento</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Dirección</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.documentType} {c.documentNumber}</td>
              <td>{c.email}</td>
              <td>{c.phone}</td>
              <td>{c.address}</td>
              <td>
                <button style={styles.actionButton} onClick={() => handleEdit(c)}>Editar</button>
                <button style={styles.deleteButton} onClick={() => handleDelete(c.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>{editingId ? 'Editar cliente' : 'Crear cliente'}</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Nombre</label>
            <input style={styles.input} name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Tipo documento</label>
            <select style={styles.input} name="documentType" value={form.documentType} onChange={handleChange}>
              {DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Nro. documento</label>
            <input style={styles.input} name="documentNumber" value={form.documentNumber} onChange={handleChange} required />
          </div>
        </div>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" name="email" value={form.email} onChange={handleChange} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Teléfono</label>
            <input style={styles.input} name="phone" value={form.phone} onChange={handleChange} />
          </div>
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Dirección</label>
          <input style={styles.input} name="address" value={form.address} onChange={handleChange} />
        </div>
        {error && <p style={styles.error}>{error}</p>}
        <div style={styles.buttonRow}>
          <button style={styles.button} type="submit">{editingId ? 'Guardar cambios' : 'Crear'}</button>
          {editingId && <button type="button" style={styles.cancelButton} onClick={handleCancelEdit}>Cancelar</button>}
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
    maxWidth: '560px',
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
    minWidth: '150px',
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
  error: {
    color: '#c81109',
    fontSize: '13px',
  },
};
