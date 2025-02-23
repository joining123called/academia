import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import ErrorBoundary from './pages/error/ErrorBoundary';
import NotFound from './pages/error/NotFound';
import Unauthorized from './pages/error/Unauthorized';
import { LoadingSpinner } from './components/feedback/LoadingSpinner';

// Auth Components
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import AdminLogin from './pages/auth/AdminLogin';
import AdminRegister from './pages/auth/AdminRegister';
import AdminForgotPassword from './pages/auth/AdminForgotPassword';

// Layouts
import DashboardLayout from './components/layouts/DashboardLayout';

// Auth Providers
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { UserAuthProvider } from './contexts/UserAuthContext';

// Admin Pages
import {
  AdminDashboard,
  AdminOrders,
  AdminUsers,
  AdminPayments,
  AdminReports,
  AdminDisputes,
  AdminMessages,
  AdminSupport,
  AdminSettings
} from './pages/admin';

// Client Pages
import {
  ClientDashboard,
  Orders,
  Revisions,
  Disputes,
  Billing,
  Messages,
  Settings,
  Support
} from './pages/client';

// Writer Pages
import {
  WriterDashboard,
  AvailableOrders,
  Bids,
  WriterRevisions,
  WriterDisputes,
  Earnings,
  WriterMessages,
  Statistics,
  WriterSettings,
  WriterSupport
} from './pages/writer';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AdminAuthProvider>
            <UserAuthProvider>
              <div className="min-h-screen bg-gray-50">
                <Suspense 
                  fallback={
                    <div className="min-h-screen flex items-center justify-center">
                      <LoadingSpinner size="large" color="text-violet-600" />
                    </div>
                  }
                >
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    
                    {/* Client/Writer Auth Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    
                    {/* Admin Auth Routes */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/register" element={<AdminRegister />} />
                    <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />

                    {/* Admin Dashboard Routes */}
                    <Route path="/admin" element={<DashboardLayout />}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="payments" element={<AdminPayments />} />
                      <Route path="reports" element={<AdminReports />} />
                      <Route path="disputes" element={<AdminDisputes />} />
                      <Route path="messages" element={<AdminMessages />} />
                      <Route path="support" element={<AdminSupport />} />
                      <Route path="settings/*" element={<AdminSettings />} />
                    </Route>

                    {/* Client Dashboard Routes */}
                    <Route path="/dashboard" element={<DashboardLayout />}>
                      <Route index element={<ClientDashboard />} />
                      <Route path="orders" element={<Orders />} />
                      <Route path="revisions" element={<Revisions />} />
                      <Route path="disputes" element={<Disputes />} />
                      <Route path="billing" element={<Billing />} />
                      <Route path="messages" element={<Messages />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="support" element={<Support />} />
                    </Route>

                    {/* Writer Dashboard Routes */}
                    <Route path="/writer" element={<DashboardLayout />}>
                      <Route index element={<WriterDashboard />} />
                      <Route path="available-orders" element={<AvailableOrders />} />
                      <Route path="bids" element={<Bids />} />
                      <Route path="revisions" element={<WriterRevisions />} />
                      <Route path="disputes" element={<WriterDisputes />} />
                      <Route path="earnings" element={<Earnings />} />
                      <Route path="messages" element={<WriterMessages />} />
                      <Route path="statistics" element={<Statistics />} />
                      <Route path="settings" element={<WriterSettings />} />
                      <Route path="support" element={<WriterSupport />} />
                    </Route>

                    {/* Error Routes */}
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 5000,
                    style: {
                      background: '#fff',
                      color: '#363636',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      borderRadius: '0.75rem',
                      padding: '1rem',
                    },
                  }}
                />
              </div>
            </UserAuthProvider>
          </AdminAuthProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;