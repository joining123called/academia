import React, { useState } from 'react';
import { 
  Search, Menu, MessageSquare, Bell, HelpCircle, 
  ChevronDown, Settings, LogOut
} from 'lucide-react';
import { useUserAuth } from '../../contexts/UserAuthContext';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useLocation } from 'react-router-dom';
import { UserAvatar } from '../ui/UserAvatar';
import { useSearch } from '../../hooks/useSearch';
import { cn } from '../../lib/utils';

interface TopBarProps {
  onMobileMenuClick: () => void;
}

export default function TopBar({ onMobileMenuClick }: TopBarProps) {
  const { user } = useUserAuth();
  const { admin } = useAdminAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const currentUser = isAdminRoute ? admin : user;
  
  const userRole = isAdminRoute ? 'admin' : user?.role || 'client';
  const { 
    searchQuery, 
    setSearchQuery, 
    isSearchFocused, 
    setIsSearchFocused,
    searchConfig 
  } = useSearch(userRole);

  // Track unread counts
  const [unreadNotifications] = useState(3);
  const [unreadMessages] = useState(2);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Common styles for icons
  const iconButtonStyles = cn(
    "relative p-2 rounded-full",
    "transition-all duration-200",
    "hover:bg-violet-50 hover:text-violet-600",
    "active:scale-95",
    "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2",
    "text-gray-500"
  );

  // Badge styles
  const badgeStyles = cn(
    "absolute -top-1 -right-1",
    "min-w-[18px] h-[18px] px-1",
    "flex items-center justify-center",
    "text-xs font-medium text-white",
    "rounded-full",
    "ring-2 ring-white",
    "animate-[bounce_1s_ease-in-out]"
  );

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-violet-500"
            onClick={onMobileMenuClick}
          >
            <span className="sr-only">Open menu</span>
            <Menu className="h-6 w-6" />
          </button>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-auto px-4">
            <div className="relative">
              <Search className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-150",
                isSearchFocused ? "text-violet-500" : "text-gray-400"
              )} />
              <input
                type="text"
                className={cn(
                  "w-full pl-10 pr-4 py-2 rounded-full border",
                  "transition-all duration-150",
                  "focus:ring-2 focus:ring-violet-500 focus:border-violet-500",
                  isSearchFocused ? "border-violet-500 bg-violet-50/30" : "border-gray-300"
                )}
                placeholder={searchConfig.placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />

              {/* Search Categories Dropdown */}
              {isSearchFocused && (
                <div className="absolute mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {searchConfig.categories.map((category, index) => (
                    <button
                      key={index}
                      className="w-full px-4 py-2 flex items-center hover:bg-violet-50 transition-colors duration-150"
                    >
                      <category.icon className={cn("h-5 w-5 mr-3", category.color)} />
                      <span className="text-sm text-gray-700">{category.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Help Icon */}
            <button className={iconButtonStyles}>
              <span className="sr-only">Help Center</span>
              <HelpCircle className="h-5 w-5" />
            </button>

            {/* Chat Icon */}
            <button className={iconButtonStyles}>
              <span className="sr-only">Live Chat</span>
              <MessageSquare className="h-5 w-5" />
              {unreadMessages > 0 && (
                <span className={cn(badgeStyles, "bg-violet-600")}>
                  {unreadMessages}
                </span>
              )}
            </button>

            {/* Notifications Icon */}
            <button className={iconButtonStyles}>
              <span className="sr-only">View notifications</span>
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className={cn(badgeStyles, "bg-red-600")}>
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-violet-50 transition-colors duration-200"
              >
                <UserAvatar 
                  user={currentUser!} 
                  size="sm"
                  showStatus={true}
                />
                <ChevronDown className={cn(
                  "h-4 w-4 text-gray-500 transition-transform duration-200",
                  showUserMenu && "transform rotate-180"
                )} />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{currentUser?.full_name}</p>
                    <p className="text-xs text-gray-500">{currentUser?.email}</p>
                  </div>
                  <div className="py-1">
                    <button className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-violet-50 flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </button>
                    <button className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}