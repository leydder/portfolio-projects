import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ProductosPage from './pages/ProductosPage';
import VentasPage from './pages/VentasPage';
import UsuariosPage from './pages/UsuariosPage';
import HistorialPage from './pages/HistorialPage';
import DeudoresPage from './pages/DeudoresPage';
import VendedoresPage from './pages/VendedoresPage';
import Navbar from './components/Navbar';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/productos" />;
  return children;
}

function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/productos" /> : <LoginPage />} />
      <Route path="/productos" element={
        <ProtectedRoute>
          <Layout><ProductosPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/ventas" element={
        <ProtectedRoute>
          <Layout><VentasPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/usuarios" element={
        <ProtectedRoute adminOnly>
          <Layout><UsuariosPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/historial" element={
        <ProtectedRoute>
          <Layout><HistorialPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/deudores" element={
        <ProtectedRoute>
          <Layout><DeudoresPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/vendedores" element={
        <ProtectedRoute adminOnly>
          <Layout><VendedoresPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to={user ? '/productos' : '/login'} />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}