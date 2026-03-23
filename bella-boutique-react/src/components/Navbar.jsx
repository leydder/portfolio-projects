import { useNavigate, Link } from 'react-router-dom';
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
      <div style={styles.brand}>
        <span style={styles.brandMain}>BELLA</span>
        <span style={styles.brandSub}>BOUTIQUE</span>
      </div>
      <div style={styles.links}>
        <Link to="/productos" style={styles.link}>Productos</Link>
        <Link to="/ventas" style={styles.link}>Ventas</Link>
        {user?.role === 'ADMIN' && (
          <Link to="/usuarios" style={styles.link}>Usuarios</Link>
        )}
      </div>
      <div style={styles.user}>
        <span style={styles.badge}>{user?.role}</span>
        <span style={styles.username}>{user?.username}</span>
        <button style={styles.logout} onClick={handleLogout}>Salir</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: '#1a1a2e',
    padding: '0 40px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
  },
  brand: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: '1',
  },
  brandMain: {
    color: '#fff',
    fontFamily: 'Georgia, serif',
    fontSize: '18px',
    fontWeight: '800',
    letterSpacing: '5px',
  },
  brandSub: {
    color: '#c9a96e',
    fontSize: '9px',
    letterSpacing: '4px',
    fontWeight: '600',
  },
  links: {
    display: 'flex',
    gap: '32px',
  },
  link: {
    color: '#ccc',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '500',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    transition: 'color 0.2s',
  },
  user: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  badge: {
    background: '#c9a96e',
    color: '#1a1a2e',
    fontSize: '10px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '12px',
    letterSpacing: '1px',
  },
  username: {
    color: '#ccc',
    fontSize: '13px',
  },
  logout: {
    background: 'transparent',
    color: '#e74c3c',
    border: '1px solid #e74c3c',
    borderRadius: '6px',
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
  },
};