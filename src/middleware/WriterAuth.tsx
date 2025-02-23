import { Navigate, useLocation } from 'react-router-dom';
import { useUserAuth } from '../contexts/UserAuthContext';
import { LoadingSpinner } from '../components/feedback/LoadingSpinner';
import { LayoutProps } from '../types';

export default function WriterAuth({ children }: LayoutProps) {
  const { user, loading } = useUserAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" color="text-violet-600" />
      </div>
    );
  }

  if (!user || user.role !== 'writer') {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}