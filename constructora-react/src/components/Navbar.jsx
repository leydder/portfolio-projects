import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>CONSTRUCTORA</div>
      <div style={styles.links}>
        <Link to="/users" style={styles.link}>Usuarios</Link>
        <Link to="/clients" style={styles.link}>Clientes</Link>
        <Link to="/projects" style={styles.link}>Proyectos</Link>
        <Link to="/quotes" style={styles.link}>Presupuestos</Link>
        <Link to="/attachments" style={styles.link}>Adjuntos</Link>
      </div>
      <div style={styles.userSection}>
        <span style={styles.username}>{user?.username}</span>
        <button style={styles.logoutButton} onClick={handleLogout}>Salir</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 32px',
    background: '#00032d',
    color: '#fff',
    flexWrap: 'wrap',
    gap: '12px',
  },
  brand: {
    fontWeight: 800,
    fontSize: '16px',
    letterSpacing: '1px',
    color: '#fff',
  },
  links: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  link: {
    color: '#d5ecff',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  username: {
    fontSize: '14px',
    color: '#d5ecff',
  },
  logoutButton: {
    background: '#0071cf',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
