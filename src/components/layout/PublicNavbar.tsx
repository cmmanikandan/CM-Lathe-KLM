import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandLogo } from '../common/BrandLogo';
import {
  Search,
  Phone,
  MessageCircle,
  Menu,
  X,
  LogIn,
  UserPlus,
  Home,
  Package,
  Wrench,
  ImageIcon,
  Info,
  Mail
} from 'lucide-react';

export const PublicNavbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll listener for floating header animation
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Services', path: '/services', icon: Wrench },
    { name: 'Gallery', path: '/gallery', icon: ImageIcon },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Contact', path: '/contact', icon: Mail }
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* FLOATING GLASSMORPHISM STICKY CONTAINER */}
      <header
        className={`sticky top-2 sm:top-4 z-40 max-w-7xl mx-auto px-3 sm:px-6 transition-all duration-350 ease-out`}
      >
        <nav
          className={`w-full rounded-[22px] transition-all duration-350 ease-out flex items-center justify-between border select-none ${
            isScrolled
              ? 'bg-white/80 backdrop-blur-xl border-white/50 shadow-xl py-2 px-4 sm:px-6 h-[60px]'
              : 'bg-white/90 backdrop-blur-lg border-white/60 shadow-md py-3 px-4 sm:px-6 h-[72px]'
          }`}
        >
          {/* Left: Brand Logo & Title */}
          <Link to="/" className="flex items-center gap-2 group">
            <BrandLogo size={isScrolled ? 'mobile' : 'navbar'} />
          </Link>

          {/* Center: Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 bg-gray-100/60 p-1.5 rounded-full border border-gray-200/50 backdrop-blur-md">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative px-4 py-1.5 rounded-full text-xs font-heading font-extrabold transition-all duration-200 ${
                    active ? 'text-[#F97316]' : 'text-gray-700 hover:text-black hover:bg-white/50'
                  }`}
                >
                  {link.name}
                  {active && (
                    <motion.div
                      layoutId="activePublicTab"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#F97316] rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right: Quick Action Phone, WhatsApp & Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <a
              href="tel:+919659286268"
              className="p-2 rounded-xl text-gray-700 hover:text-[#F97316] hover:bg-orange-50 transition-colors"
              title="Call Workshop (+91 96592 86268)"
            >
              <Phone size={18} />
            </a>

            <a
              href="https://wa.me/919659286268"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-gray-700 hover:text-[#25D366] hover:bg-green-50 transition-colors"
              title="WhatsApp Inquiry"
            >
              <MessageCircle size={18} />
            </a>

            <div className="h-4 w-px bg-gray-300 mx-1" />

            <Link
              to="/login"
              className="text-xs font-heading font-black text-[#111111] hover:text-[#F97316] px-3.5 py-2 rounded-xl hover:bg-gray-100 transition-all flex items-center gap-1"
            >
              <LogIn size={14} /> Sign In
            </Link>

            <Link
              to="/register"
              className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-1 active:scale-95 transition-all"
            >
              <UserPlus size={14} /> Register
            </Link>
          </div>

          {/* Mobile Right: Search & Hamburger Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => navigate('/products')}
              className="p-2 rounded-xl text-gray-700 hover:bg-gray-100"
              title="Search Catalog"
            >
              <Search size={18} />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#111111] bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </nav>
      </header>

      {/* MOBILE GLASS DRAWER MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-3 top-20 z-50 lg:hidden bg-white/95 backdrop-blur-2xl rounded-[28px] border border-white/50 shadow-2xl p-5 space-y-4"
          >
            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-2xl text-sm font-heading font-extrabold transition-all ${
                      active
                        ? 'bg-[#111111] text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={18} className={active ? 'text-[#F97316]' : 'text-gray-400'} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-gray-200 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="tel:+919659286268"
                  className="bg-gray-100 text-[#111111] text-xs font-heading font-black py-3 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Phone size={14} className="text-[#F97316]" /> Call Factory
                </a>

                <a
                  href="https://wa.me/919659286268"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] text-white text-xs font-heading font-black py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <MessageCircle size={14} /> WhatsApp
                </a>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-gray-100 text-[#111111] text-xs font-heading font-black py-3 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <LogIn size={14} /> Sign In
                </Link>

                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-[#F97316] text-white text-xs font-heading font-black py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md"
                >
                  <UserPlus size={14} /> Register
                </Link>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
