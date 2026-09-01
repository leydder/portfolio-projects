import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import UsersPage from './pages/UsersPage';
import ClientsPage from './pages/ClientsPage';
import ProjectsPage from './pages/ProjectsPage';
import QuotesPage from './pages/QuotesPage';
import AttachmentsPage from './pages/AttachmentsPage';
import ReportsPage from './pages/ReportsPage';
import Navbar from './components/Navbar';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
}

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ padding: '32px' }}>{children}</main>
    </>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/users" /> : <LoginPage />} />
      <Route path="/users" element={<ProtectedRoute><Layout><UsersPage /></Layout></ProtectedRoute>} />
      <Route path="/clients" element={<ProtectedRoute><Layout><ClientsPage /></Layout></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><Layout><ProjectsPage /></Layout></ProtectedRoute>} />
      <Route path="/quotes" element={<ProtectedRoute><Layout><QuotesPage /></Layout></ProtectedRoute>} />
      <Route path="/attachments" element={<ProtectedRoute><Layout><AttachmentsPage /></Layout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Layout><ReportsPage /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={user ? '/users' : '/login'} />} />
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
