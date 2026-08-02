import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductContext';
import { useOrders } from '../../context/OrderContext';
import { Search, Phone, MessageCircle, ShieldCheck, User, LogIn, UserPlus, LogOut, Menu, X, ShoppingBag } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { role, user, isLoggedIn, logout } = useAuth();
  const { searchQuery, setSearchQuery } = useProducts();
  const { orders } = useOrders();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING' || o.status === 'ACCEPTED').length;

  const isActive = (path: string) => location.pathname === path;

  // Don't render top public navbar on admin pages (since AdminLayout has its own sidebar)
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-gray-200 shadow-sm transition-all">
      
      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <BrandLogo size="navbar" onClick={() => navigate('/')} />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-[#111111]">
          <Link
            to="/"
            className={`transition-colors hover:text-[#F97316] ${isActive('/') ? 'text-[#F97316] font-extrabold' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/products"
            className={`transition-colors hover:text-[#F97316] ${isActive('/products') ? 'text-[#F97316] font-extrabold' : ''}`}
          >
            Products Catalog
          </Link>
          
          <Link
            to="/status"
            className={`transition-colors hover:text-[#F97316] ${isActive('/status') ? 'text-[#F97316] font-extrabold' : ''}`}
          >
            Stories
          </Link>

          {isLoggedIn && (
            <Link
              to="/my-orders"
              className={`relative transition-colors hover:text-[#F97316] ${isActive('/my-orders') ? 'text-[#F97316] font-extrabold' : ''}`}
            >
              My Orders
              {pendingOrdersCount > 0 && (
                <span className="ml-1 bg-[#F97316] text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                  {pendingOrdersCount}
                </span>
              )}
            </Link>
          )}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Call Shop */}
          <a
            href="tel:+919659286268"
            className="hidden sm:flex items-center gap-1.5 bg-[#111111] hover:bg-[#F97316] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm"
          >
            <Phone size={14} /> Call Shop
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/919659286268"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl transition-all shadow-sm shrink-0"
          >
            <MessageCircle size={14} /> WhatsApp
          </a>

          {!isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="bg-white hover:bg-gray-100 text-[#111111] text-xs font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-gray-300 transition-all shadow-sm flex items-center gap-1 shrink-0"
              >
                <LogIn size={14} className="text-[#F97316]" /> Sign In
              </Link>
              <Link
                to="/register"
                className="hidden sm:flex bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm items-center gap-1"
              >
                <UserPlus size={14} /> Register
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="bg-gray-100 hover:bg-gray-200 text-[#111111] text-xs font-bold px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-gray-200 flex items-center gap-1"
              >
                <User size={14} className="text-[#F97316]" /> {user?.name.split(' ')[0]}
              </Link>
              {role === 'admin' && (
                <Link
                  to="/admin"
                  className="bg-[#111111] text-white hover:bg-[#F97316] text-xs font-bold px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl transition-colors flex items-center gap-1"
                >
                  <ShieldCheck size={14} /> Admin
                </Link>
              )}
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#111111] hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

      </div>

      {/* Mobile Nav Bar - Horizontal Navigation List in Top Nav */}
      <div className="md:hidden border-t border-gray-200/80 bg-white/95 backdrop-blur-md px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        <Link
          to="/"
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            isActive('/') ? 'bg-[#111111] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Home
        </Link>
        <Link
          to="/products"
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            isActive('/products') ? 'bg-[#111111] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Products Catalog
        </Link>
        <Link
          to="/status"
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            isActive('/status') ? 'bg-[#111111] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Stories
        </Link>
        {isLoggedIn ? (
          <>
            <Link
              to="/my-orders"
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                isActive('/my-orders') ? 'bg-[#F97316] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              My Orders
              {pendingOrdersCount > 0 && (
                <span className="bg-white text-[#F97316] text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black">
                  {pendingOrdersCount}
                </span>
              )}
            </Link>
            <Link
              to="/profile"
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                isActive('/profile') ? 'bg-[#111111] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Profile
            </Link>
          </>
        ) : (
          <Link
            to="/login"
            className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#F97316] text-white"
          >
            Sign In
          </Link>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white p-4 space-y-3 shadow-xl animate-fade-in">
          <div className="flex flex-col gap-2 font-heading font-bold text-sm text-[#111111]">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-50 rounded-lg">Home</Link>
            <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-50 rounded-lg">Product Catalog</Link>
            <Link to="/status" onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-50 rounded-lg">Workshop Stories (24h)</Link>
            
            {isLoggedIn ? (
              <>
                <Link to="/my-orders" onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-50 rounded-lg flex items-center justify-between">
                  <span>My Orders & Payments</span>
                  {pendingOrdersCount > 0 && (
                    <span className="bg-[#F97316] text-white text-xs px-2 py-0.5 rounded-full font-mono">
                      {pendingOrdersCount}
                    </span>
                  )}
                </Link>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-50 rounded-lg">Customer Profile</Link>
              </>
            ) : null}

            {!isLoggedIn ? (
              <div className="pt-2 flex flex-col gap-2 border-t border-gray-100">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-[#111111] text-white text-center py-2.5 rounded-xl text-xs font-bold"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-[#F97316] text-white text-center py-2.5 rounded-xl text-xs font-bold"
                >
                  Create Account
                </Link>
              </div>
            ) : role === 'admin' ? (
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-[#F97316] pt-2 border-t border-gray-100 font-black">
                Admin Dashboard Portal
              </Link>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
};
