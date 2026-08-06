import { useState, useEffect } from 'react';
import api from '../api/axios';

const STATUSES = ['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const STATUS_LABELS = {
  PLANNING: 'Planeación',
  IN_PROGRESS: 'En obra',
  COMPLETED: 'Terminado',
  CANCELLED: 'Cancelado',
};

const EMPTY_FORM = {
  name: '',
  description: '',
  clientId: '',
  status: 'PLANNING',
  startDate: '',
  endDate: '',
  location: '',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const loadProjects = async () => {
    const res = await api.get('/api/projects');
    setProjects(res.data);
  };

  const loadClients = async () => {
    const res = await api.get('/api/clients');
    setClients(res.data);
  };

  useEffect(() => {
    loadProjects();
    loadClients();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      name: form.name,
      description: form.description,
      client: { id: Number(form.clientId) },
      status: form.status,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      location: form.location,
    };
    try {
      if (editingId) {
        await api.put(`/api/projects/${editingId}`, payload);
      } else {
        await api.post('/api/projects', payload);
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      loadProjects();
    } catch {
      setError('No se pudo guardar el proyecto.');
    }
  };

  const handleEdit = (project) => {
    setForm({
      name: project.name || '',
      description: project.description || '',
      clientId: project.client ? String(project.client.id) : '',
      status: project.status || 'PLANNING',
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      location: project.location || '',
    });
    setEditingId(project.id);
  };

  const handleCancelEdit = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este proyecto?')) return;
    await api.delete(`/api/projects/${id}`);
    loadProjects();
  };

  return (
    <div>
      <h1>Proyectos</h1>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Cliente</th>
            <th>Estado</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Ubicación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.client ? p.client.name : '—'}</td>
              <td>{STATUS_LABELS[p.status] || p.status}</td>
              <td>{p.startDate}</td>
              <td>{p.endDate}</td>
              <td>{p.location}</td>
              <td>
                <button style={styles.actionButton} onClick={() => handleEdit(p)}>Editar</button>
                <button style={styles.deleteButton} onClick={() => handleDelete(p.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>{editingId ? 'Editar proyecto' : 'Crear proyecto'}</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Nombre</label>
            <input style={styles.input} name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Cliente</label>
            <select style={styles.input} name="clientId" value={form.clientId} onChange={handleChange} required>
              <option value="" disabled>Selecciona un cliente</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Descripción</label>
          <input style={styles.input} name="description" value={form.description} onChange={handleChange} />
        </div>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Estado</label>
            <select style={styles.input} name="status" value={form.status} onChange={handleChange}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Fecha inicio</label>
            <input style={styles.input} type="date" name="startDate" value={form.startDate} onChange={handleChange} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Fecha fin</label>
            <input style={styles.input} type="date" name="endDate" value={form.endDate} onChange={handleChange} />
          </div>
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Ubicación</label>
          <input style={styles.input} name="location" value={form.location} onChange={handleChange} />
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
    maxWidth: '620px',
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
