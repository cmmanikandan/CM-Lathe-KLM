import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useOrders, useCustomerOrders } from '../../context/OrderContext';
import { useStatus } from '../../context/StatusContext';
import { useEnquiries } from '../../context/EnquiryContext';
import {
  Home,
  Package,
  ShoppingBag,
  Flame,
  User,
  Bell,
  LogIn,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

import { useLanguage } from '../../context/LanguageContext';

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  const { isLoggedIn, user, role, loginAsAdmin } = useAuth();
  const { orders: customerOrders } = useCustomerOrders(user?.phone || '');
  const { getCustomerEnquiries } = useEnquiries();
  const { activeStories } = useStatus();
  const { language, toggleLanguage, t } = useLanguage();

  const userPhone = user?.phone || '';
  const customerEnquiries = getCustomerEnquiries(userPhone);
  const activeEnquiriesCount = customerEnquiries.length;

  const ADMIN_UID = 'qiiShV5WlAY2Zwok3vNxhedl3N12';
  const isAdminAccount = role === 'admin' || user?.googleUID === ADMIN_UID || user?.id === ADMIN_UID;
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  // Hide bottom nav on detail pages (e.g. /customer/products/:id or /customer/orders/:id)
  const isDetailPage = 
    location.pathname.startsWith('/customer/products/') || 
    location.pathname.startsWith('/customer/orders/') ||
    location.pathname.startsWith('/customer/enquiry/') ||
    location.pathname.startsWith('/customer/search');

  const bottomNavPaths = [
    '/customer/home',
    '/customer/products',
    '/customer/enquiries',
    '/customer/orders',
    '/customer/status',
    '/customer/profile',
    '/customer/notifications',
    '/customer/wishlist',
    '/login'
  ];
  const shouldShowBottomNav = !isDetailPage && (
    location.pathname.startsWith('/customer') || location.pathname === '/login'
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const checkModalState = () => {
      const modalElements = document.querySelectorAll('[role="dialog"], .modal-overlay, [data-modal="true"]');
      setIsModalOpen(modalElements.length > 0);
    };

    checkModalState();
    const observer = new MutationObserver(checkModalState);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(0);

  useEffect(() => {
    const calculateUnread = () => {
      const lastSeenStr = localStorage.getItem('ml_notifications_last_seen');
      const lastSeenTime = lastSeenStr ? new Date(lastSeenStr).getTime() : 0;
      
      const unread = customerOrders.filter((o) => {
        const orderTime = new Date(o.createdAt).getTime();
        return orderTime > lastSeenTime && o.status !== 'COMPLETED' && o.status !== 'REJECTED';
      }).length;

      setUnreadNotifCount(unread);
    };

    calculateUnread();
    window.addEventListener('ml_notifications_seen', calculateUnread);
    window.addEventListener('storage', calculateUnread);
    return () => {
      window.removeEventListener('ml_notifications_seen', calculateUnread);
      window.removeEventListener('storage', calculateUnread);
    };
  }, [customerOrders, location.pathname]);

  const pendingCount = customerOrders.filter(
    (o) => o.status === 'PENDING' || o.status === 'ACCEPTED' || o.status === 'IN_PRODUCTION'
  ).length;

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#111111] font-sans antialiased flex flex-col selection:bg-[#F97316] selection:text-white">
      
      {/* Responsive Container */}
      <div className="w-full max-w-[1440px] mx-auto min-h-screen bg-[#F8F9FA] relative shadow-md flex flex-col">
        
        {/* 1. ALWAYS STICKY TOP APP BAR (Hidden on Detail Pages) */}
        {!isDetailPage && (
          <header className="sticky top-0 z-50 h-[64px] bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 transition-all duration-300">
            
            <BrandLogo 
              size="mobile" 
              theme="light"
              onClick={() => navigate('/customer/home')} 
            />

            <div className="flex items-center gap-2 sm:gap-3">

              <button
                onClick={() => navigate('/customer/notifications')}
                className="relative p-2 rounded-full text-gray-700 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
                aria-label="View notifications"
              >
                <Bell size={20} />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#F97316] text-white text-[9px] font-mono font-black rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {isLoggedIn ? (
                <button
                  onClick={() => navigate('/customer/profile')}
                  className="flex items-center gap-2 p-1 pl-2.5 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200/80 transition-all cursor-pointer"
                >
                  <span className="text-xs font-bold text-[#111111] hidden sm:inline">
                    {user?.name?.split(' ')[0]}
                  </span>
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name || 'User Avatar'}
                      className="w-7 h-7 rounded-full object-cover border border-[#F97316]"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#F97316] text-white flex items-center justify-center text-xs font-extrabold shadow-xs">
                      {getInitials(user?.name || '')}
                    </div>
                  )}
                </button>
              ) : (
                <Link
                  to="/login"
                  className="bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-heading font-extrabold px-4 py-2 rounded-full shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <LogIn size={14} /> Login
                </Link>
              )}

            </div>

          </header>
        )}

        {/* 2. SCROLLABLE PAGE CONTENT CONTAINER */}
        <main className={`flex-1 ${shouldShowBottomNav ? 'pb-28 min-h-[calc(100vh-148px)]' : 'pb-6 min-h-[calc(100vh-64px)]'}`}>
          {children}
        </main>

        {/* 3. PROFESSIONAL FULL-WIDTH BOTTOM NAVIGATION BAR */}
        {shouldShowBottomNav && (
          <nav
            className="fixed bottom-0 left-0 right-0 max-w-[1440px] mx-auto z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] py-2 px-3 flex items-center justify-around transition-all duration-300 translate-y-0 opacity-100"
          >
            
            {/* Home */}
            <Link
              to="/customer/home"
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all relative active:scale-90 ${
                isActive('/customer/home') ? 'text-[#F97316] font-bold' : 'text-gray-500 hover:text-[#111111]'
              }`}
            >
              <Home size={21} />
              <span className="text-[10px] font-heading font-extrabold uppercase tracking-tight">Home</span>
              {isActive('/customer/home') && (
                <motion.span 
                  layoutId="activeTabDot"
                  className="w-1.5 h-1.5 rounded-full bg-[#F97316] absolute -bottom-1"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>

            {/* Products */}
            <Link
              to="/customer/products"
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all relative active:scale-90 ${
                isActive('/customer/products') ? 'text-[#F97316] font-bold' : 'text-gray-500 hover:text-[#111111]'
              }`}
            >
              <Package size={21} />
              <span className="text-[10px] font-heading font-extrabold uppercase tracking-tight">Products</span>
              {isActive('/customer/products') && (
                <motion.span 
                  layoutId="activeTabDot"
                  className="w-1.5 h-1.5 rounded-full bg-[#F97316] absolute -bottom-1"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>

            {/* Orders */}
            <Link
              to="/customer/orders"
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all relative active:scale-90 ${
                isActive('/customer/orders') ? 'text-[#F97316] font-bold' : 'text-gray-500 hover:text-[#111111]'
              }`}
            >
              <div className="relative">
                <ShoppingBag size={21} />
                {pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#F97316] text-white text-[9px] font-mono px-1.5 rounded-full font-bold shadow-xs">
                    {pendingCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-heading font-extrabold uppercase tracking-tight">Orders</span>
              {isActive('/customer/orders') && (
                <motion.span 
                  layoutId="activeTabDot"
                  className="w-1.5 h-1.5 rounded-full bg-[#F97316] absolute -bottom-1"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>

            {/* Stories */}
            <Link
              to="/customer/status"
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all relative active:scale-90 ${
                isActive('/customer/status') ? 'text-[#F97316] font-bold' : 'text-gray-500 hover:text-[#111111]'
              }`}
            >
              <div className="relative">
                <Flame size={21} className={activeStories.length > 0 ? 'text-[#F97316] animate-pulse' : ''} />
                {activeStories.length > 0 && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[#F97316] animate-ping" />
                )}
              </div>
              <span className="text-[10px] font-heading font-extrabold uppercase tracking-tight">Stories</span>
              {isActive('/customer/status') && (
                <motion.span 
                  layoutId="activeTabDot"
                  className="w-1.5 h-1.5 rounded-full bg-[#F97316] absolute -bottom-1"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>

            {/* Account */}
            <Link
              to={isLoggedIn ? '/customer/profile' : '/login'}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all relative active:scale-90 ${
                isActive('/customer/profile') || isActive('/login') ? 'text-[#F97316] font-bold' : 'text-gray-500 hover:text-[#111111]'
              }`}
            >
              <User size={21} />
              <span className="text-[10px] font-heading font-extrabold uppercase tracking-tight">
                {isLoggedIn ? 'Account' : 'Login'}
              </span>
              {(isActive('/customer/profile') || isActive('/login')) && (
                <motion.span 
                  layoutId="activeTabDot"
                  className="w-1.5 h-1.5 rounded-full bg-[#F97316] absolute -bottom-1"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>

          </nav>
        )}

      </div>

    </div>
  );
};
