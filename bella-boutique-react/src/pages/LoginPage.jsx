import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/productos');
    } catch {
      setError('Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoText}>BELLA</span>
          <span style={styles.logoSub}>BOUTIQUE</span>
        </div>
        <p style={styles.subtitle}>Ingresa a tu cuenta</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Usuario</label>
            <input
              style={styles.input}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    textAlign: 'center',
  },
  logo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '8px',
  },
  logoText: {
    fontSize: '32px',
    fontWeight: '800',
    letterSpacing: '8px',
    color: '#1a1a2e',
    fontFamily: 'Georgia, serif',
  },
  logoSub: {
    fontSize: '12px',
    letterSpacing: '6px',
    color: '#c9a96e',
    fontWeight: '600',
  },
  subtitle: {
    color: '#888',
    fontSize: '14px',
    marginBottom: '32px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    textAlign: 'left',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#444',
    letterSpacing: '0.5px',
  },
  input: {
    padding: '12px 16px',
    border: '1.5px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border 0.2s',
  },
  error: {
    color: '#e74c3c',
    fontSize: '13px',
    margin: '0',
  },
  button: {
    padding: '14px',
    background: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'background 0.2s',
    marginTop: '8px',
  },
};