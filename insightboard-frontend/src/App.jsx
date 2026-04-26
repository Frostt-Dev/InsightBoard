import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DatasetsPage from './pages/DatasetsPage';
import DashboardBuilderPage from './pages/DashboardBuilderPage';
import DashboardViewerPage from './pages/DashboardViewerPage';
import DashboardsListPage from './pages/DashboardsListPage';
import ProfilePage from './pages/ProfilePage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div></div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/datasets" /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/datasets" element={<ProtectedRoute><DatasetsPage /></ProtectedRoute>} />
      <Route path="/dashboards" element={<ProtectedRoute><DashboardsListPage /></ProtectedRoute>} />
      <Route path="/dashboard/:id" element={<ProtectedRoute><DashboardBuilderPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/view/:shareId" element={<DashboardViewerPage />} />
      <Route path="/" element={<Navigate to="/datasets" />} />
      <Route path="*" element={<Navigate to="/datasets" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
