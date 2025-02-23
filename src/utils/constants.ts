import { SearchConfig } from '../types';
import { FileText, Users, DollarSign, BookOpen, Bell } from 'lucide-react';

export const SEARCH_CONFIGS: Record<string, SearchConfig> = {
  admin: {
    placeholder: 'Search orders, users, or payments...',
    categories: [
      { icon: FileText, label: 'Orders', color: 'text-blue-500' },
      { icon: Users, label: 'Users', color: 'text-green-500' },
      { icon: DollarSign, label: 'Payments', color: 'text-violet-500' }
    ]
  },
  writer: {
    placeholder: 'Search available orders, your bids, or earnings...',
    categories: [
      { icon: FileText, label: 'Available Orders', color: 'text-blue-500' },
      { icon: BookOpen, label: 'My Bids', color: 'text-green-500' },
      { icon: DollarSign, label: 'Earnings', color: 'text-violet-500' }
    ]
  },
  client: {
    placeholder: 'Search your orders, revisions, or messages...',
    categories: [
      { icon: FileText, label: 'Orders', color: 'text-blue-500' },
      { icon: FileText, label: 'Revisions', color: 'text-green-500' },
      { icon: Bell, label: 'Messages', color: 'text-violet-500' }
    ]
  }
};

export const AUTH_STORAGE_KEYS = {
  ADMIN: 'academic_writing_admin_auth',
  USER: 'academic_writing_user_auth'
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ADMIN: {
    LOGIN: '/admin/login',
    REGISTER: '/admin/register',
    DASHBOARD: '/admin'
  },
  CLIENT: {
    DASHBOARD: '/dashboard'
  },
  WRITER: {
    DASHBOARD: '/writer'
  }
};