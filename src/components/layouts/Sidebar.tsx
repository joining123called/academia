import React, { useState } from 'react';
import { 
  LayoutDashboard, ShoppingBag, MessageSquare, 
  CreditCard, HelpCircle, Settings, ChevronRight, 
  LogOut, Boxes, FileCheck, AlertOctagon, Users,
  BarChart4, DollarSign, AlertTriangle, Gavel
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useUserAuth } from '../../contexts/UserAuthContext';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import clsx from 'clsx';

interface NavItem {
  icon: React.ElementType;
  label: string;
  to: string;
}

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, signOut: userSignOut } = useUserAuth();
  const { admin, signOut: adminSignOut } = useAdminAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const handleSignOut = () => {
    if (isAdminRoute) {
      adminSignOut();
    } else {
      userSignOut();
    }
  };

  const adminNavItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/admin' },
    { icon: ShoppingBag, label: 'Orders', to: '/admin/orders' },
    { icon: Users, label: 'Users', to: '/admin/users' },
    { icon: DollarSign, label: 'Payments', to: '/admin/payments' },
    { icon: BarChart4, label: 'Reports', to: '/admin/reports' },
    { icon: AlertTriangle, label: 'Disputes', to: '/admin/disputes' },
    { icon: MessageSquare, label: 'Messages', to: '/admin/messages' },
    { icon: HelpCircle, label: 'Support', to: '/admin/support' },
    { icon: Settings, label: 'Settings', to: '/admin/settings' }
  ];

  const clientNavItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
    { icon: ShoppingBag, label: 'Orders', to: '/dashboard/orders' },
    { icon: FileCheck, label: 'Revisions', to: '/dashboard/revisions' },
    { icon: AlertOctagon, label: 'Disputes', to: '/dashboard/disputes' },
    { icon: CreditCard, label: 'Billing', to: '/dashboard/billing' },
    { icon: MessageSquare, label: 'Messages', to: '/dashboard/messages' },
    { icon: Settings, label: 'Settings', to: '/dashboard/settings' },
    { icon: HelpCircle, label: 'Support', to: '/dashboard/support' }
  ];

  const writerNavItems: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/writer' },
    { icon: ShoppingBag, label: 'Available Orders', to: '/writer/available-orders' },
    { icon: Gavel, label: 'My Bids', to: '/writer/bids' },
    { icon: FileCheck, label: 'Revisions', to: '/writer/revisions' },
    { icon: AlertOctagon, label: 'Disputes', to: '/writer/disputes' },
    { icon: DollarSign, label: 'Earnings', to: '/writer/earnings' },
    { icon: MessageSquare, label: 'Messages', to: '/writer/messages' },
    { icon: BarChart4, label: 'Statistics', to: '/writer/statistics' },
    { icon: Settings, label: 'Settings', to: '/writer/settings' },
    { icon: HelpCircle, label: 'Support', to: '/writer/support' }
  ];

  const navItems = isAdminRoute ? adminNavItems : 
                  user?.role === 'writer' ? writerNavItems : 
                  clientNavItems;

  return (
    <aside
      className={clsx(
        'h-screen transition-all duration-300 ease-in-out',
        'fixed left-0 top-0 z-30 flex flex-col',
        'bg-white border-r border-gray-100',
        isCollapsed ? 'w-20' : 'w-64',
        'md:relative'
      )}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 relative border-b border-gray-100">
        <div className={clsx(
          "flex items-center transition-all duration-300",
          isCollapsed ? "opacity-0 w-0" : "opacity-100 w-full"
        )}>
          <Boxes className="h-8 w-8 text-violet-600 flex-shrink-0" strokeWidth={1.5} />
          <span className="text-xl font-bold text-gray-900 ml-3 whitespace-nowrap">
            AcademiX
          </span>
        </div>

        {/* Modern Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={clsx(
            "absolute -right-4 top-1/2 -translate-y-1/2",
            "w-8 h-8 rounded-full",
            "flex items-center justify-center",
            "bg-gradient-to-r from-violet-500 to-violet-600",
            "shadow-lg shadow-violet-200",
            "hover:from-violet-600 hover:to-violet-700",
            "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2",
            "transition-all duration-300 ease-in-out transform",
            "group z-50",
            isCollapsed && "rotate-180"
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronRight 
            className={clsx(
              "h-5 w-5 text-white transition-transform duration-300",
              "group-hover:scale-110 group-active:scale-95",
              "group-hover:animate-pulse"
            )}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'group relative flex items-center rounded-xl px-3 py-2.5',
                  'transition-transform duration-300 ease-in-out',
                  isCollapsed ? 'justify-center' : 'justify-start',
                  isActive
                    ? 'bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-md shadow-violet-100'
                    : 'text-gray-700 hover:bg-violet-50 hover:text-violet-600',
                  'hover:scale-[1.02]'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon 
                    className={clsx(
                      'h-6 w-6',
                      'transition-transform duration-300',
                      'group-hover:scale-110 group-active:scale-95',
                      'stroke-[1.5px]',
                      isActive && 'drop-shadow-md'
                    )}
                  />
                  <span
                    className={clsx(
                      'ml-3 text-[15px] font-medium whitespace-nowrap',
                      'transition-transform duration-300',
                      isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
                    )}
                  >
                    {item.label}
                  </span>
                  {isCollapsed && (
                    <div className={clsx(
                      "absolute left-full ml-3 px-3 py-1",
                      "rounded-lg bg-gray-900/90 text-white",
                      "text-sm font-medium whitespace-nowrap",
                      "opacity-0 -translate-x-3 pointer-events-none",
                      "transition-all duration-300",
                      "group-hover:opacity-100 group-hover:translate-x-0",
                      "backdrop-blur-sm shadow-xl"
                    )}>
                      {item.label}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-100 p-4">
        <button
          onClick={handleSignOut}
          className={clsx(
            'flex w-full items-center rounded-xl px-3 py-2.5',
            'text-red-600 transition-transform duration-300',
            'hover:bg-red-50 hover:shadow-md hover:scale-[1.02]',
            isCollapsed ? 'justify-center' : 'justify-start',
            'group relative'
          )}
        >
          <LogOut className="h-6 w-6 transition-transform duration-300 group-hover:scale-110 group-active:scale-95 stroke-[1.5px]" />
          <span className={clsx(
            'ml-3 text-[15px] font-medium whitespace-nowrap',
            'transition-transform duration-300',
            isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
          )}>
            Sign Out
          </span>
          {isCollapsed && (
            <div className={clsx(
              "absolute left-full ml-3 px-3 py-1",
              "rounded-lg bg-gray-900/90 text-white",
              "text-sm font-medium whitespace-nowrap",
              "opacity-0 -translate-x-3 pointer-events-none",
              "transition-all duration-300",
              "group-hover:opacity-100 group-hover:translate-x-0",
              "backdrop-blur-sm shadow-xl"
            )}>
              Sign Out
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}