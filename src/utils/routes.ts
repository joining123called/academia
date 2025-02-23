import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { AdminAuth, UserAuth, WriterAuth } from '../middleware';

// Lazy load components
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminOrders = lazy(() => import('../pages/admin/Orders'));
const AdminUsers = lazy(() => import('../pages/admin/Users'));
const AdminPayments = lazy(() => import('../pages/admin/Payments'));
const AdminReports = lazy(() => import('../pages/admin/Reports'));
const AdminDisputes = lazy(() => import('../pages/admin/Disputes'));
const AdminMessages = lazy(() => import('../pages/admin/Messages'));
const AdminSupport = lazy(() => import('../pages/admin/Support'));
const AdminSettings = lazy(() => import('../pages/admin/Settings'));

const ClientDashboard = lazy(() => import('../pages/client/Dashboard'));
const Orders = lazy(() => import('../pages/client/Orders'));
const Revisions = lazy(() => import('../pages/client/Revisions'));
const Disputes = lazy(() => import('../pages/client/Disputes'));
const Billing = lazy(() => import('../pages/client/Billing'));
const Messages = lazy(() => import('../pages/client/Messages'));
const Settings = lazy(() => import('../pages/client/Settings'));
const Support = lazy(() => import('../pages/client/Support'));

const WriterDashboard = lazy(() => import('../pages/writer/Dashboard'));
const AvailableOrders = lazy(() => import('../pages/writer/AvailableOrders'));
const Bids = lazy(() => import('../pages/writer/Bids'));
const WriterRevisions = lazy(() => import('../pages/writer/Revisions'));
const WriterDisputes = lazy(() => import('../pages/writer/Disputes'));
const Earnings = lazy(() => import('../pages/writer/Earnings'));
const WriterMessages = lazy(() => import('../pages/writer/Messages'));
const Statistics = lazy(() => import('../pages/writer/Statistics'));
const WriterSettings = lazy(() => import('../pages/writer/Settings'));

export const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    element: <AdminAuth><AdminDashboard /></AdminAuth>
  },
  {
    path: '/admin/orders',
    element: <AdminAuth><AdminOrders /></AdminAuth>
  },
  {
    path: '/admin/users',
    element: <AdminAuth><AdminUsers /></AdminAuth>
  },
  {
    path: '/admin/payments',
    element: <AdminAuth><AdminPayments /></AdminAuth>
  },
  {
    path: '/admin/reports',
    element: <AdminAuth><AdminReports /></AdminAuth>
  },
  {
    path: '/admin/disputes',
    element: <AdminAuth><AdminDisputes /></AdminAuth>
  },
  {
    path: '/admin/messages',
    element: <AdminAuth><AdminMessages /></AdminAuth>
  },
  {
    path: '/admin/support',
    element: <AdminAuth><AdminSupport /></AdminAuth>
  },
  {
    path: '/admin/settings/*',
    element: <AdminAuth><AdminSettings /></AdminAuth>
  }
];

export const clientRoutes: RouteObject[] = [
  {
    path: '/dashboard',
    element: <UserAuth><ClientDashboard /></UserAuth>
  },
  {
    path: '/dashboard/orders',
    element: <UserAuth><Orders /></UserAuth>
  },
  {
    path: '/dashboard/revisions',
    element: <UserAuth><Revisions /></UserAuth>
  },
  {
    path: '/dashboard/disputes',
    element: <UserAuth><Disputes /></UserAuth>
  },
  {
    path: '/dashboard/billing',
    element: <UserAuth><Billing /></UserAuth>
  },
  {
    path: '/dashboard/messages',
    element: <UserAuth><Messages /></UserAuth>
  },
  {
    path: '/dashboard/settings',
    element: <UserAuth><Settings /></UserAuth>
  },
  {
    path: '/dashboard/support',
    element: <UserAuth><Support /></UserAuth>
  }
];

export const writerRoutes: RouteObject[] = [
  {
    path: '/writer',
    element: <WriterAuth><WriterDashboard /></WriterAuth>
  },
  {
    path: '/writer/available-orders',
    element: <WriterAuth><AvailableOrders /></WriterAuth>
  },
  {
    path: '/writer/bids',
    element: <WriterAuth><Bids /></WriterAuth>
  },
  {
    path: '/writer/revisions',
    element: <WriterAuth><WriterRevisions /></WriterAuth>
  },
  {
    path: '/writer/disputes',
    element: <WriterAuth><WriterDisputes /></WriterAuth>
  },
  {
    path: '/writer/earnings',
    element: <WriterAuth><Earnings /></WriterAuth>
  },
  {
    path: '/writer/messages',
    element: <WriterAuth><WriterMessages /></WriterAuth>
  },
  {
    path: '/writer/statistics',
    element: <WriterAuth><Statistics /></WriterAuth>
  },
  {
    path: '/writer/settings',
    element: <WriterAuth><WriterSettings /></WriterAuth>
  }
];