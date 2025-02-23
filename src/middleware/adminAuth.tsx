import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { LoadingSpinner } from '../components/feedback/LoadingSpinner';

interface AdminAuthProps {
  children: React.ReactNode;
}

export default function AdminAuth({ children }: AdminAuthProps) {
  const { admin, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" color="text-violet-600" />
      </div>
    );
  }

  if (!admin) {
    // Store attempted path for redirect after login
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  // Verify admin role
  if (admin.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}