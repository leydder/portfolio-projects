import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', password: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    const res = await api.get('/api/users');
    setUsers(res.data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/api/users/${editingId}`, form);
      } else {
        await api.post('/api/users', form);
      }
      setForm({ username: '', password: '' });
      setEditingId(null);
      loadUsers();
    } catch {
      setError('No se pudo guardar el usuario.');
    }
  };

  const handleEdit = (user) => {
    setForm({ username: user.username, password: '' });
    setEditingId(user.id);
  };

  const handleCancelEdit = () => {
    setForm({ username: '', password: '' });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    await api.delete(`/api/users/${id}`);
    loadUsers();
  };

  return (
    <div>
      <h1>Usuarios</h1>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>
                <button style={styles.actionButton} onClick={() => handleEdit(u)}>Editar</button>
                <button style={styles.deleteButton} onClick={() => handleDelete(u.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>{editingId ? 'Editar usuario' : 'Crear usuario'}</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>Usuario</label>
          <input style={styles.input} name="username" value={form.username} onChange={handleChange} required />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Contraseña</label>
          <input style={styles.input} type="password" name="password" value={form.password} onChange={handleChange} required />
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
    maxWidth: '360px',
    marginTop: '16px',
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
