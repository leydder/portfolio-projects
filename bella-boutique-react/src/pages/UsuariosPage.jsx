import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function UsuariosPage() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', role: 'USER' });
  const [error, setError] = useState('');

  const loadUsers = async () => {
    const res = await api.get('/api/users');
    setUsers(res.data);
  };

  useEffect(() => { loadUsers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/api/users?role=${form.role}`, { username: form.username, password: form.password });
      setShowForm(false);
      setForm({ username: '', password: '', role: 'USER' });
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear usuario');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    await api.delete(`/api/users/${id}`);
    loadUsers();
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Usuarios</h1>
          <p style={styles.count}>{users.length} usuarios registrados</p>
        </div>
        <button style={styles.btnPrimary} onClick={() => setShowForm(true)}>
          + Nuevo Usuario
        </button>
      </div>

      {showForm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Nuevo Usuario</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Usuario</label>
                <input style={styles.input} value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Contraseña</label>
                <input style={styles.input} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Rol</label>
                <select style={styles.input} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              {error && <p style={styles.error}>{error}</p>}
              <div style={styles.modalActions}>
                <button type="button" style={styles.btnSecondary} onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" style={styles.btnPrimary}>Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={styles.list}>
        {users.map(u => (
          <div key={u.id} style={styles.userCard}>
            <div style={styles.avatar}>
              {u.username.charAt(0).toUpperCase()}
            </div>
            <div style={styles.userInfo}>
              <span style={styles.username}>{u.username}</span>
              <span style={{ ...styles.badge, background: u.role === 'ADMIN' ? '#1a1a2e' : '#c9a96e' }}>
                {u.role}
              </span>
            </div>
            <button style={styles.btnDelete} onClick={() => handleDelete(u.id)}>Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '32px 40px', background: '#f8f7f4', minHeight: 'calc(100vh - 64px)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#1a1a2e', margin: 0, fontFamily: 'Georgia, serif' },
  count: { color: '#888', fontSize: '14px', margin: '4px 0 0' },
  btnPrimary: { padding: '10px 20px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  btnSecondary: { padding: '10px 20px', background: '#fff', color: '#1a1a2e', border: '1.5px solid #1a1a2e', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  modal: { background: '#fff', borderRadius: '16px', padding: '36px', width: '420px', maxWidth: '90vw' },
  modalTitle: { fontSize: '22px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 24px', fontFamily: 'Georgia, serif' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: '600', color: '#555', letterSpacing: '0.5px', textTransform: 'uppercase' },
  input: { padding: '10px 12px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', outline: 'none' },
  error: { color: '#e74c3c', fontSize: '13px', margin: 0 },
  modalActions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  userCard: { background: '#fff', borderRadius: '12px', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  avatar: { width: '44px', height: '44px', background: '#1a1a2e', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px', flexShrink: 0 },
  userInfo: { flex: 1, display: 'flex', alignItems: 'center', gap: '12px' },
  username: { fontWeight: '700', color: '#1a1a2e', fontSize: '15px' },
  badge: { color: '#fff', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '12px', letterSpacing: '1px' },
  btnDelete: { background: '#fde8e8', color: '#e74c3c', border: 'none', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' },
};