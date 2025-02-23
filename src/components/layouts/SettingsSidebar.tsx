import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Settings, Globe, Mail, RefreshCw, Building, Wallet, FileText, CreditCard, Users, CheckSquare, MessageSquare, Target, Shield, Bell, Database, Zap, Server, Calendar, QrCode, Cog, ChevronDown, FileIcon as GoogleIcon, Puzzle, FileSignature, Tags, MessageCircle } from 'lucide-react';
import clsx from 'clsx';

interface SettingsCategory {
  title: string;
  items: {
    icon: React.ElementType;
    label: string;
    to: string;
  }[];
}

const settingsCategories: SettingsCategory[] = [
  {
    title: 'General',
    items: [
      { icon: Settings, label: 'General Settings', to: '/admin/settings/general' },
      { icon: Building, label: 'Company Information', to: '/admin/settings/company' },
      { icon: Globe, label: 'Localization', to: '/admin/settings/localization' },
      { icon: Mail, label: 'Email Settings', to: '/admin/settings/email' },
      { icon: RefreshCw, label: 'System Update', to: '/admin/settings/update' },
      { icon: Server, label: 'System/Server Info', to: '/admin/settings/system' },
    ]
  },
  {
    title: 'Finance',
    items: [
      { icon: Wallet, label: 'Payment Settings', to: '/admin/settings/payment' },
      { icon: FileText, label: 'Invoices', to: '/admin/settings/invoices' },
      { icon: CreditCard, label: 'Payment Gateways', to: '/admin/settings/gateways' },
    ]
  },
  {
    title: 'Features',
    items: [
      { icon: Users, label: 'Customers', to: '/admin/settings/customers' },
      { icon: CheckSquare, label: 'Tasks', to: '/admin/settings/tasks' },
      { icon: MessageSquare, label: 'Support', to: '/admin/settings/support' },
      { icon: Target, label: 'Leads', to: '/admin/settings/leads' },
    ]
  },
  {
    title: 'Integrations',
    items: [
      { icon: GoogleIcon, label: 'Google', to: '/admin/settings/google' },
      { icon: MessageCircle, label: 'Pusher.com', to: '/admin/settings/pusher' },
      { icon: Puzzle, label: 'Other', to: '/admin/settings/integrations' },
    ]
  },
  {
    title: 'Tools',
    items: [
      { icon: Calendar, label: 'Calendar', to: '/admin/settings/calendar' },
      { icon: FileText, label: 'PDF', to: '/admin/settings/pdf' },
      { icon: FileSignature, label: 'E-Sign', to: '/admin/settings/e-sign' },
      { icon: Tags, label: 'Tags', to: '/admin/settings/tags' },
      { icon: MessageCircle, label: 'SMS', to: '/admin/settings/sms' },
      { icon: QrCode, label: 'QR Code', to: '/admin/settings/qr-code' },
    ]
  },
  {
    title: 'System',
    items: [
      { icon: Cog, label: 'Cron Job', to: '/admin/settings/cron' },
      { icon: Cog, label: 'Misc', to: '/admin/settings/misc' },
    ]
  }
];

interface SettingsSidebarProps {
  isOpen: boolean;
}

export default function SettingsSidebar({ isOpen }: SettingsSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['General']);
  const location = useLocation();

  const toggleCategory = (title: string) => {
    setExpandedCategories(prev => 
      prev.includes(title)
        ? prev.filter(cat => cat !== title)
        : [...prev, title]
    );
  };

  return (
    <aside className={clsx(
      "w-56 bg-white border-r border-gray-200 h-screen overflow-y-auto", // Reduced from w-64 to w-56
      "transition-all duration-300 ease-in-out",
      "fixed md:relative",
      "z-30",
      isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
    )}>
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="h-14 flex items-center px-3"> {/* Reduced height and padding */}
          <h2 className="text-base font-semibold text-gray-900">System Settings</h2> {/* Reduced text size */}
        </div>
      </div>

      <nav className="p-2"> {/* Reduced padding */}
        {settingsCategories.map((category) => (
          <div key={category.title} className="mb-2"> {/* Reduced margin */}
            <button
              onClick={() => toggleCategory(category.title)}
              className={clsx(
                "w-full flex items-center justify-between px-2 py-1.5 text-sm font-medium", // Reduced padding
                "rounded-lg transition-colors duration-200",
                "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2",
                expandedCategories.includes(category.title) && "bg-gray-50"
              )}
            >
              <span className="text-gray-900">{category.title}</span>
              <ChevronDown
                className={clsx(
                  'h-4 w-4 text-gray-500 transition-transform duration-200',
                  expandedCategories.includes(category.title) ? 'transform rotate-180' : ''
                )}
              />
            </button>
            
            <div className={clsx(
              'mt-1 space-y-0.5 overflow-hidden transition-all duration-200', // Reduced spacing
              expandedCategories.includes(category.title) ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            )}>
              {category.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center px-2 py-1.5 text-sm font-medium rounded-lg ml-2', // Reduced padding
                      'transition-colors duration-150 ease-in-out',
                      isActive
                        ? 'bg-violet-50 text-violet-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    )
                  }
                >
                  <item.icon className="h-3.5 w-3.5 mr-2" /> {/* Reduced icon size */}
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}