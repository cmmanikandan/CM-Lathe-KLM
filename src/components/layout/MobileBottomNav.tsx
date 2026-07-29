import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrders, useCustomerOrders } from '../../context/OrderContext';
import { useStatus } from '../../context/StatusContext';
import { Home, Package, Flame, ShoppingBag, User, LogIn } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { isLoggedIn, user, role } = useAuth();
  const { orders: customerOrders } = useCustomerOrders(user?.phone || '');
  const { activeStories } = useStatus();

  const mainTabPaths = [
    '/',
    '/products',
    '/status',
    '/my-orders',
    '/customer/orders',
    '/profile',
    '/login'
  ];

  // Only render on main primary tab routes
  if (!mainTabPaths.includes(location.pathname)) {
    return null;
  }

  const pendingOrdersCount = customerOrders.filter((o) => o.status === 'PENDING' || o.status === 'ACCEPTED' || o.status === 'IN_PRODUCTION').length;
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#111111]/95 backdrop-blur-md text-white border-t border-gray-800 px-2 py-2 flex items-center justify-around shadow-2xl">
      
      {/* Home */}
      <Link
        to="/"
        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
          isActive('/') ? 'text-[#F97316] font-bold scale-105' : 'text-gray-400 hover:text-white'
        }`}
      >
        <Home size={18} />
        <span className="text-[10px] font-heading uppercase">Home</span>
      </Link>

      {/* Catalog */}
      <Link
        to="/products"
        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
          isActive('/products') ? 'text-[#F97316] font-bold scale-105' : 'text-gray-400 hover:text-white'
        }`}
      >
        <Package size={18} />
        <span className="text-[10px] font-heading uppercase">Products</span>
      </Link>

      {/* Workshop Stories (24h) */}
      <Link
        to="/status"
        className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
          isActive('/status') ? 'text-[#F97316] font-bold scale-105' : 'text-gray-400 hover:text-white'
        }`}
      >
        <Flame size={18} className={activeStories.length > 0 ? 'text-[#F97316] animate-pulse' : ''} />
        <span className="text-[10px] font-heading uppercase">Stories</span>
        {activeStories.length > 0 && (
          <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-[#F97316]" />
        )}
      </Link>

      {/* My Orders */}
      <Link
        to="/my-orders"
        className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
          isActive('/my-orders') ? 'text-[#F97316] font-bold scale-105' : 'text-gray-400 hover:text-white'
        }`}
      >
        <ShoppingBag size={18} />
        <span className="text-[10px] font-heading uppercase">Orders</span>
        {pendingOrdersCount > 0 && (
          <span className="absolute top-1 right-2 bg-[#F97316] text-white text-[9px] font-mono px-1 rounded-full font-bold">
            {pendingOrdersCount}
          </span>
        )}
      </Link>

      {/* Profile / Sign In */}
      <Link
        to={isLoggedIn ? '/profile' : '/login'}
        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
          isActive('/profile') || isActive('/login') ? 'text-[#F97316] font-bold scale-105' : 'text-gray-400 hover:text-white'
        }`}
      >
        {isLoggedIn ? <User size={18} /> : <LogIn size={18} />}
        <span className="text-[10px] font-heading uppercase">
          {isLoggedIn ? 'Account' : 'Sign In'}
        </span>
      </Link>

    </div>
  );
};
