import { useState, useEffect } from 'react';
import api from '../api/axios';

const FILE_TYPES = ['PLANO', 'FOTO', 'PDF', 'OTRO'];
const FILE_TYPE_LABELS = { PLANO: 'Plano', FOTO: 'Foto', PDF: 'PDF', OTRO: 'Otro' };

const EMPTY_FORM = { projectId: '', fileName: '', fileType: 'PLANO', filePath: '' };

export default function AttachmentsPage() {
  const [attachments, setAttachments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const loadAttachments = async () => {
    const res = await api.get('/api/attachments');
    setAttachments(res.data);
  };

  const loadProjects = async () => {
    const res = await api.get('/api/projects');
    setProjects(res.data);
  };

  useEffect(() => {
    loadAttachments();
    loadProjects();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      project: { id: Number(form.projectId) },
      fileName: form.fileName,
      fileType: form.fileType,
      filePath: form.filePath,
    };
    try {
      if (editingId) {
        await api.put(`/api/attachments/${editingId}`, payload);
      } else {
        await api.post('/api/attachments', payload);
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      loadAttachments();
    } catch {
      setError('No se pudo guardar el adjunto.');
    }
  };

  const handleEdit = (attachment) => {
    setForm({
      projectId: attachment.project ? String(attachment.project.id) : '',
      fileName: attachment.fileName || '',
      fileType: attachment.fileType || 'PLANO',
      filePath: attachment.filePath || '',
    });
    setEditingId(attachment.id);
  };

  const handleCancelEdit = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este adjunto?')) return;
    await api.delete(`/api/attachments/${id}`);
    loadAttachments();
  };

  const groups = [];
  const groupIndexByProjectId = new Map();
  for (const a of attachments) {
    const projectId = a.project ? a.project.id : 'sin-proyecto';
    const projectName = a.project ? a.project.name : 'Sin proyecto';
    if (!groupIndexByProjectId.has(projectId)) {
      groupIndexByProjectId.set(projectId, groups.length);
      groups.push({ projectId, projectName, items: [] });
    }
    groups[groupIndexByProjectId.get(projectId)].items.push(a);
  }

  return (
    <div>
      <h1>Adjuntos</h1>

      {groups.length === 0 && <p>Todavía no hay adjuntos registrados.</p>}

      {groups.map((group) => (
        <div key={group.projectId} style={styles.projectGroup}>
          <h2 style={styles.projectHeading}>{group.projectName}</h2>
          <table>
            <thead>
              <tr>
                <th>Archivo</th>
                <th>Tipo</th>
                <th>Ruta</th>
                <th>Subido</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {group.items.map((a) => (
                <tr key={a.id}>
                  <td>{a.fileName}</td>
                  <td>{FILE_TYPE_LABELS[a.fileType] || a.fileType}</td>
                  <td>{a.filePath}</td>
                  <td>{a.uploadedAt}</td>
                  <td>
                    <button style={styles.actionButton} onClick={() => handleEdit(a)}>Editar</button>
                    <button style={styles.deleteButton} onClick={() => handleDelete(a.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <h2>{editingId ? 'Editar adjunto' : 'Registrar adjunto'}</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Proyecto</label>
            <select style={styles.input} name="projectId" value={form.projectId} onChange={handleChange} required>
              <option value="" disabled>Selecciona un proyecto</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Tipo</label>
            <select style={styles.input} name="fileType" value={form.fileType} onChange={handleChange}>
              {FILE_TYPES.map((t) => (
                <option key={t} value={t}>{FILE_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Nombre del archivo</label>
          <input style={styles.input} name="fileName" value={form.fileName} onChange={handleChange} required />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Ruta del archivo</label>
          <input style={styles.input} name="filePath" value={form.filePath} onChange={handleChange} required />
        </div>
        {error && <p style={styles.error}>{error}</p>}
        <div style={styles.buttonRow}>
          <button style={styles.button} type="submit">{editingId ? 'Guardar cambios' : 'Registrar'}</button>
          {editingId && <button type="button" style={styles.cancelButton} onClick={handleCancelEdit}>Cancelar</button>}
        </div>
      </form>
    </div>
  );
}

const styles = {
  projectGroup: {
    marginBottom: '28px',
  },
  projectHeading: {
    fontSize: '16px',
    color: '#0071cf',
    marginBottom: '8px',
  },
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
