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
        {/* Logo */}
        <div style={styles.logo}>
          <span style={styles.logoScript}>Bella</span>
          <div style={styles.logoSubRow}>
            <span style={styles.logoLine} />
            <span style={styles.logoHeart}>♥</span>
            <span style={styles.logoSub}>BOUTIQUE</span>
            <span style={styles.logoHeart}>♥</span>
            <span style={styles.logoLine} />
          </div>
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
    background: 'linear-gradient(160deg, #fce4de 0%, #f9d5cc 50%, #f5c8bc 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    background: '#fff',
    borderRadius: '20px',
    padding: '52px 44px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 20px 60px rgba(61,32,39,0.12)',
    textAlign: 'center',
    border: '1px solid #f5ddd8',
  },
  logo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '6px',
    gap: '4px',
  },
  logoScript: {
    fontFamily: "'Dancing Script', cursive",
    fontSize: '42px',
    fontWeight: '700',
    color: '#3d2027',
    lineHeight: '1',
  },
  logoSubRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  logoLine: {
    display: 'inline-block',
    width: '26px',
    height: '1px',
    background: '#3d2027',
  },
  logoHeart: {
    color: '#3d2027',
    fontSize: '10px',
    lineHeight: '1',
  },
  logoSub: {
    fontSize: '10px',
    letterSpacing: '4px',
    fontWeight: '700',
    color: '#3d2027',
  },
  subtitle: {
    color: '#b08080',
    fontSize: '14px',
    marginBottom: '32px',
    marginTop: '16px',
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
    color: '#5a3540',
    letterSpacing: '0.5px',
  },
  input: {
    padding: '12px 16px',
    border: '1.5px solid #f0d0ca',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border 0.2s',
    color: '#3d2027',
    background: '#fffaf9',
  },
  error: {
    color: '#c0394a',
    fontSize: '13px',
    margin: '0',
  },
  button: {
    padding: '14px',
    background: '#3d2027',
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