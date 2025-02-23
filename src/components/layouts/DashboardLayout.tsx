import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUserAuth } from '../../contexts/UserAuthContext';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { LoadingSpinner } from '../feedback/LoadingSpinner';
import clsx from 'clsx';

export default function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading: userLoading } = useUserAuth();
  const { admin, loading: adminLoading } = useAdminAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Memory leak prevention
  useEffect(() => {
    return () => {
      // Cleanup any subscriptions or timers if needed
    };
  }, []);

  // Show loading state while checking auth
  if (userLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" color="text-indigo-600" />
      </div>
    );
  }

  // Strict admin route protection
  if (isAdminRoute) {
    if (!admin) {
      // Store attempted path for redirect after login
      return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
    }
    // Verify admin role
    if (admin.role !== 'admin') {
      return <Navigate to="/unauthorized" replace />;
    }
  } else {
    // User route protection
    if (!user) {
      return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }
  }

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Fixed on desktop, sliding on mobile */}
      <div
        className={clsx(
          'md:sticky md:top-0 md:h-screen md:translate-x-0',
          'fixed inset-y-0 left-0 transform z-30',
          'transition duration-300 ease-in-out',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TopBar - Sticky */}
        <div className="sticky top-0 z-10">
          <TopBar onMobileMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        </div>

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}