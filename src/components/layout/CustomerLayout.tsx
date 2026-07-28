import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useOrders, useCustomerOrders } from '../../context/OrderContext';
import { useStatus } from '../../context/StatusContext';
import {
  Home,
  Package,
  ShoppingBag,
  Flame,
  User,
  Bell,
  LogIn,
  ShieldCheck
} from 'lucide-react';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  const { isLoggedIn, user, role, loginAsAdmin } = useAuth();
  const { orders: customerOrders } = useCustomerOrders(user?.phone || '');
  const { activeStories } = useStatus();

  const ADMIN_UID = 'qiiShV5WlAY2Zwok3vNxhedl3N12';
  const isAdminAccount = role === 'admin' || user?.googleUID === ADMIN_UID || user?.id === ADMIN_UID;
  const location = useLocation();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if any modal or bottom sheet overlay is currently visible in DOM
  useEffect(() => {
    const checkModalState = () => {
      const modalElements = document.querySelectorAll('.fixed.inset-0.z-50, .no-print-modal');
      setIsModalOpen(modalElements.length > 0);
    };

    checkModalState();
    const observer = new MutationObserver(checkModalState);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [location.pathname]);

  const pendingOrders = customerOrders.filter((o) => o.status === 'PENDING' || o.status === 'ACCEPTED' || o.status === 'IN_PRODUCTION');
  const pendingCount = pendingOrders.length;

  const isActive = (path: string) => {
    if (location.pathname === path) return true;
    if (path !== '/customer' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const getInitials = (name?: string) => {
    if (!name) return 'ML';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#111111] font-sans antialiased flex flex-col selection:bg-[#F97316] selection:text-white">
      
      {/* Responsive Container */}
      <div className="w-full max-w-[1440px] mx-auto min-h-screen bg-[#F8F9FA] relative shadow-md flex flex-col overflow-x-hidden">
        
        {/* 1. FLOATING GLASSMORPHISM TOP APP BAR */}
        <header className="sticky top-0 z-40 h-[64px] bg-white/80 backdrop-blur-xl border-b border-white/50 shadow-xs px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 transition-all duration-300">
          
          <BrandLogo 
            size="mobile" 
            onClick={() => navigate('/customer/home')} 
          />

          <div className="flex items-center gap-3">

            <button
              onClick={() => navigate('/pwa-demo')}
              className="hidden sm:flex items-center gap-1 bg-[#F97316]/10 hover:bg-[#F97316] text-[#F97316] hover:text-white border border-[#F97316]/30 text-[11px] font-heading font-black px-3 py-1.5 rounded-full transition-all active:scale-95"
              title="PWA Demo & App Install"
            >
              📱 PWA App
            </button>
            
            <button
              onClick={() => navigate('/customer/notifications')}
              className="relative p-2 rounded-full text-gray-700 hover:bg-gray-100 active:scale-95 transition-all"
              aria-label="View notifications"
            >
              <Bell size={20} />
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#F97316] text-white text-[9px] font-mono font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>

            {isLoggedIn ? (
              <button
                onClick={() => navigate('/customer/profile')}
                className="relative w-10 h-10 rounded-full border-2 border-[#F97316] overflow-hidden bg-[#111111] text-white flex items-center justify-center font-heading font-black text-xs shadow-sm active:scale-95 transition-all shrink-0"
                title={user?.name}
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{getInitials(user?.name)}</span>
                )}
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-[#111111] hover:bg-[#F97316] text-white text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1 transition-colors shadow-sm shrink-0"
              >
                <LogIn size={14} className="text-[#F97316]" /> Login
              </Link>
            )}

          </div>

        </header>

        {/* 2. SCROLLABLE PAGE CONTENT CONTAINER */}
        <main className="flex-1 pb-24 min-h-[calc(100vh-148px)]">
          {children}
        </main>

        {/* 3. STICKY BOTTOM NAVIGATION (AUTOMATICALLY HIDES WHEN ANY MODAL IS OPEN) */}
        <nav
          className={`fixed bottom-0 left-0 right-0 max-w-[1440px] mx-auto z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/80 rounded-t-[22px] shadow-[0_-4px_25px_rgba(0,0,0,0.08)] py-2 px-4 flex items-center justify-around sm:justify-center sm:gap-12 transition-all duration-300 ${
            isModalOpen ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
          }`}
        >
          
          {/* Home */}
          <Link
            to="/customer/home"
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all relative active:scale-95 ${
              isActive('/customer/home') || isActive('/customer') ? 'text-[#F97316] font-bold' : 'text-gray-400 hover:text-gray-800'
            }`}
          >
            <Home size={22} />
            <span className="text-[10px] font-heading font-extrabold uppercase tracking-tight">Home</span>
            {(isActive('/customer/home') || isActive('/customer')) && (
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
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all relative active:scale-95 ${
              isActive('/customer/products') ? 'text-[#F97316] font-bold' : 'text-gray-400 hover:text-gray-800'
            }`}
          >
            <Package size={22} />
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
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all relative active:scale-95 ${
              isActive('/customer/orders') ? 'text-[#F97316] font-bold' : 'text-gray-400 hover:text-gray-800'
            }`}
          >
            <div className="relative">
              <ShoppingBag size={22} />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#F97316] text-white text-[9px] font-mono px-1 rounded-full font-bold">
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
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all relative active:scale-95 ${
              isActive('/customer/status') ? 'text-[#F97316] font-bold' : 'text-gray-400 hover:text-gray-800'
            }`}
          >
            <div className="relative">
              <Flame size={22} className={activeStories.length > 0 ? 'text-[#F97316] animate-pulse' : ''} />
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
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all relative active:scale-95 ${
              isActive('/customer/profile') || isActive('/login') ? 'text-[#F97316] font-bold' : 'text-gray-400 hover:text-gray-800'
            }`}
          >
            <User size={22} />
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

      </div>

    </div>
  );
};
