import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      {/* Logo */}
      <div style={styles.brand}>
        <span style={styles.brandScript}>Bella</span>
        <div style={styles.brandSubRow}>
          <span style={styles.brandLine} />
          <span style={styles.brandHeart}>♥</span>
          <span style={styles.brandSub}>BOUTIQUE</span>
          <span style={styles.brandHeart}>♥</span>
          <span style={styles.brandLine} />
        </div>
      </div>

      {/* Links */}
      <div style={styles.links}>
        {[
          { to: '/productos', label: 'Productos' },
          { to: '/ventas', label: 'Ventas' },
          { to: '/historial', label: 'Historial' },
          { to: '/deudores', label: 'Deudores' },
          ...(user?.role === 'ADMIN' ? [
            { to: '/vendedores', label: 'Vendedores' },
            { to: '/ganancias', label: 'Ganancias' },
            { to: '/usuarios', label: 'Usuarios' },
          ] : []),
        ].map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            style={{ ...styles.link, ...(isActive(to) ? styles.linkActive : {}) }}
          >
            {label}
            {isActive(to) && <span style={styles.linkDot} />}
          </Link>
        ))}
      </div>

      {/* Usuario */}
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
    background: '#fff',
    padding: '0 40px',
    height: '68px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 16px rgba(61,32,39,0.08)',
    borderBottom: '1.5px solid #f5ddd8',
  },
  brand: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    lineHeight: '1',
    gap: '2px',
  },
  brandScript: {
    fontFamily: "'Dancing Script', cursive",
    fontSize: '26px',
    fontWeight: '700',
    color: '#3d2027',
    lineHeight: '1',
  },
  brandSubRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  brandLine: {
    display: 'inline-block',
    width: '18px',
    height: '1px',
    background: '#3d2027',
  },
  brandHeart: {
    color: '#3d2027',
    fontSize: '8px',
    lineHeight: '1',
  },
  brandSub: {
    fontSize: '8px',
    letterSpacing: '3.5px',
    fontWeight: '700',
    color: '#3d2027',
    textTransform: 'uppercase',
  },
  links: {
    display: 'flex',
    gap: '28px',
  },
  link: {
    color: '#9e7070',
    textDecoration: 'none',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    transition: 'color 0.2s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
  },
  linkActive: {
    color: '#3d2027',
  },
  linkDot: {
    display: 'inline-block',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    background: '#c97a8a',
  },
  user: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  badge: {
    background: '#fce4de',
    color: '#3d2027',
    fontSize: '10px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '12px',
    letterSpacing: '1px',
    border: '1px solid #f5c0b8',
  },
  username: {
    color: '#9e7070',
    fontSize: '13px',
  },
  logout: {
    background: 'transparent',
    color: '#c0394a',
    border: '1.5px solid #f0b8c0',
    borderRadius: '6px',
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'background 0.2s',
  },
};