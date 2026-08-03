import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import { useCustomerOrders } from '../../context/OrderContext';
import { useStatus } from '../../context/StatusContext';
import { SkeletonList } from '../../components/common/SkeletonLoader';
import {
  Search,
  Mic,
  Phone,
  MessageCircle,
  Star,
  CheckCircle2,
  Clock,
  ChevronRight,
  Zap,
  Package,
  ShoppingBag,
  Flame,
  CreditCard,
  Heart,
  Sparkles
} from 'lucide-react';

export const CustomerHomePage: React.FC = () => {
  const { products, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useProducts();
  const { user } = useAuth();
  const { orders: customerOrders, loading: ordersLoading } = useCustomerOrders(user?.phone || '');
  const { activeStories, banners } = useStatus();
  const navigate = useNavigate();

  const [bannerIndex, setBannerIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning ☀️';
    if (hour < 17) return 'Good Afternoon 🌤️';
    return 'Good Evening 🌙';
  };

  const heroBanners = banners || [];

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % heroBanners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const voiceSearchHandler = () => {
    setIsListening(true);
    setTimeout(() => {
      setSearchQuery('Kalappai');
      setIsListening(false);
      navigate('/customer/products');
    }, 1500);
  };

  // Only show genuinely active orders — not completed/rejected
  const activeOrder = customerOrders.find(
    (o) => o.status !== 'COMPLETED' && o.status !== 'REJECTED'
  );

  const recommendedProducts = (() => {
    const rec = products.filter((p) => p.isRecommended || p.isBestSelling);
    if (rec.length >= 2) return rec.slice(0, 4);
    return products.filter((p) => p.status === 'Published' || !p.status).slice(0, 4);
  })();
  const trendingProducts = (() => {
    const tr = products.filter((p) => p.isTrending || p.isReadyStock);
    if (tr.length >= 2) return tr.slice(0, 4);
    return products.filter((p) => p.status === 'Published' || !p.status).slice(4, 8);
  })();

  // Check for active PENDING payment request across customer's orders
  const activePaymentRequest = customerOrders
    .flatMap((o) => (o.paymentRequests || []).map((r) => ({ ...r, orderNumber: o.orderNumber })))
    .find((r) => r.status === 'PENDING');

  return (
    <div className="p-4 sm:p-6 space-y-6 font-sans max-w-7xl mx-auto">
      
      {/* 0. TOP PRIORITY STICKY PAYMENT REQUEST CARD */}
      {activePaymentRequest && (
        <div className="bg-[#111111] text-white p-5 rounded-[22px] shadow-2xl border-2 border-[#F97316] space-y-3 animate-in slide-in-from-top duration-300 font-sans relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F97316] animate-ping" />
              <span className="text-[10px] font-mono text-[#F97316] font-bold uppercase tracking-widest">
                ⚡ PRIORITY ACTION REQUIRED • PAYMENT REQUEST
              </span>
            </div>
            <span className="bg-amber-900/80 text-amber-300 border border-amber-700 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">
              PENDING
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-gray-400 font-mono">Order #{activePaymentRequest.orderNumber}</span>
              <h3 className="font-heading font-black text-2xl text-white mt-0.5">
                Requested Amount: ₹{activePaymentRequest.amount.toLocaleString('en-IN')}
              </h3>
              <p className="text-xs text-gray-300 font-medium mt-0.5">
                Reason: <strong>{activePaymentRequest.reason}</strong>
                {activePaymentRequest.dueDate && (
                  <span> • Due Date: <strong className="text-[#F97316]">{activePaymentRequest.dueDate}</strong></span>
                )}
              </p>
              {activePaymentRequest.message && (
                <p className="text-[11px] text-gray-400 font-mono italic mt-1 bg-white/5 p-2 rounded-lg">
                  "{activePaymentRequest.message}"
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate(`/customer/orders/${activePaymentRequest.orderId}`)}
                className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-5 py-3 rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
              >
                <CreditCard size={16} /> Pay Now (₹{activePaymentRequest.amount.toLocaleString('en-IN')})
              </button>

              <button
                onClick={() => navigate(`/customer/orders/${activePaymentRequest.orderId}`)}
                className="bg-white/10 hover:bg-white/20 text-white font-heading font-bold text-xs px-3.5 py-3 rounded-xl cursor-pointer"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. TOP WELCOME DASHBOARD BANNER */}
      <div className="bg-gradient-to-r from-[#111111] via-[#1A1A1A] to-[#232323] text-white rounded-[22px] p-5 shadow-lg border border-gray-800 space-y-3 relative overflow-hidden">

        <div className="flex items-center justify-between relative z-10">
          <div>
            <span className="text-[#F97316] font-mono text-[10px] uppercase font-bold tracking-widest block">
              {getGreeting()}
            </span>
            <h2 className="font-heading font-black text-xl text-white mt-0.5 flex items-center gap-1.5">
              <span>{user?.name || 'Valued Customer'}</span>
              <CheckCircle2 size={16} className="text-[#F97316] shrink-0" />
            </h2>
            <p className="text-gray-400 text-xs mt-0.5">Kallimandhayam Customer App Dashboard</p>
          </div>

          <Link
            to="/customer/profile"
            className="w-10 h-10 rounded-full bg-[#F97316]/20 border border-[#F97316] text-[#F97316] flex items-center justify-center font-black text-xs shrink-0 active:scale-95 transition-transform"
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'ML'}
          </Link>
        </div>

        {/* Quick Action Buttons */}
        <div className="pt-2 flex items-center gap-2 relative z-10">
          <a
            href="tel:+919659286268"
            className="flex-1 bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Phone size={14} /> Call Workshop
          </a>
          <a
            href="https://wa.me/919659286268"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#25D366] hover:bg-[#20ba5a] text-white font-heading font-black text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <MessageCircle size={14} /> WhatsApp Us
          </a>
        </div>
      </div>

      {/* 2. ACTIVE ORDER CARD — Only shows if a real non-completed order exists */}
      {ordersLoading ? (
        <div className="animate-pulse bg-orange-50 border border-orange-100 rounded-[22px] p-4 h-20" />
      ) : activeOrder ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate(`/customer/orders/${activeOrder.id}`)}
          className="bg-gradient-to-r from-orange-50/90 via-amber-50/80 to-orange-100/70 border-2 border-[#F97316]/50 rounded-[22px] p-4.5 shadow-md space-y-3 cursor-pointer hover:border-[#F97316] hover:shadow-lg transition-all"
        >
          <div className="flex items-center justify-between border-b border-orange-200/60 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F97316] animate-ping" />
              <span className="font-heading font-black text-sm text-[#111111]">
                Active Order #{activeOrder.orderNumber}
              </span>
            </div>
            <span className="bg-[#F97316] text-white text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
              {activeOrder.status.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-gray-600 font-mono block">Total Payable: ₹{activeOrder.finalPrice.toLocaleString('en-IN')}</span>
              <span className={activeOrder.remainingBalance > 0 ? "font-black text-red-600 font-mono text-sm" : "font-black text-green-700 font-mono text-sm"}>
                {activeOrder.remainingBalance > 0 ? `Balance Due: ₹${activeOrder.remainingBalance.toLocaleString('en-IN')}` : '✓ Fully Paid'}
              </span>
            </div>

            <div className="bg-[#111111] hover:bg-[#F97316] text-white text-[11px] font-heading font-black px-3.5 py-2 rounded-xl flex items-center gap-1 shadow-sm transition-colors">
              Track Status <ChevronRight size={14} className="text-[#F97316] group-hover:text-white" />
            </div>
          </div>
        </motion.div>
      ) : null}

      {/* 3. STICKY APP SEARCH & QUICK CATEGORY CHIPS */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F97316]" />
          <input
            type="text"
            placeholder="Search Gates, Kalappai, Windows Grill, Lathe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate('/customer/products');
            }}
            className="w-full bg-white text-xs text-[#111111] pl-10 pr-10 py-3 rounded-2xl border border-gray-200 focus:border-[#F97316] outline-none shadow-sm font-medium"
          />
          <button
            onClick={voiceSearchHandler}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-[#F97316]'}`}
            title="Voice Search"
          >
            <Mic size={16} />
          </button>
        </div>

        {/* Horizontal Scroll Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {['All Products', 'Tractor Kalappai', 'Main Gates', 'Windows Grill', 'Steel Doors', 'Lathe Turning', 'Steel Furniture'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                if (cat === 'All Products') setSelectedCategory('All');
                else setSelectedCategory(cat);
                navigate('/customer/products');
              }}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-heading font-extrabold transition-all border ${
                selectedCategory === cat || (cat === 'All Products' && selectedCategory === 'All')
                  ? 'bg-[#111111] text-white border-[#111111]'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. HERO SLIDER */}
      {heroBanners.length > 0 && (
        <div className="relative rounded-[22px] overflow-hidden shadow-md h-[170px] sm:h-[200px] bg-black">
          {heroBanners.map((b, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-700 ${idx === bannerIndex ? 'opacity-100' : 'opacity-0'}`}
            >
              <img src={b.image} alt={b.title} className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-4 flex flex-col justify-end">
                <span className="text-[#F97316] font-mono text-[9px] uppercase font-black tracking-widest">
                  {b.tag}
                </span>
                <h3 className="font-heading font-black text-sm sm:text-base text-white leading-tight mt-0.5">
                  {b.title}
                </h3>
                <p className="text-gray-300 text-[11px] line-clamp-1 mt-0.5">{b.subtitle}</p>
              </div>
            </div>
          ))}

          <div className="absolute bottom-2 right-3 flex gap-1 z-10">
            {heroBanners.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === bannerIndex ? 'bg-[#F97316] w-4' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      )}



      {/* 6. WORKSHOP STORIES BUBBLES */}
      {activeStories.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-heading font-black text-gray-400 uppercase tracking-wider">
              Live Workshop Stories (24h)
            </span>
            <Link to="/customer/status" className="text-xs font-extrabold text-[#F97316]">View All</Link>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
            {activeStories.map((story) => (
              <div
                key={story.id}
                onClick={() => navigate('/customer/status')}
                className="flex flex-col items-center gap-1 cursor-pointer shrink-0"
              >
                <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#F97316] via-amber-500 to-[#111111] shadow-sm">
                  <img src={story.mediaUrl} alt={story.title} className="w-full h-full object-cover rounded-full border-2 border-white" />
                </div>
                <span className="text-[10px] font-heading font-bold text-[#111111] max-w-[60px] truncate text-center">
                  {story.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. RECOMMENDED PRODUCTS */}
      {recommendedProducts.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-black text-sm uppercase text-[#111111] flex items-center gap-1.5">
              <Star size={16} className="text-[#F97316] fill-[#F97316]" /> Recommended For You
            </h3>
            <Link to="/customer/products" className="text-xs font-extrabold text-[#F97316]">See All</Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {recommendedProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/customer/products/${p.id}`)}
                className="bg-white rounded-[22px] border border-gray-200/90 p-3 shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#F97316] transition-all group relative"
              >
                <div>
                  <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-square max-h-48">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    {p.badgeText && (
                      <span className="absolute top-2 left-2 bg-[#F97316] text-white text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                        {p.badgeText}
                      </span>
                    )}
                    <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      ★ {p.rating}
                    </span>
                  </div>

                  <div className="mt-2.5 space-y-1">
                    <h4 className="font-heading font-extrabold text-xs sm:text-sm text-[#111111] line-clamp-1 group-hover:text-[#F97316] transition-colors">
                      {p.name}
                    </h4>
                    <p className="text-[10px] text-gray-500 font-mono line-clamp-1">{p.specifications.material}</p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-gray-100 mt-2">
                  <span className="font-heading font-black text-xs sm:text-sm text-[#F97316]">
                    ₹{p.price.toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/customer/products/${p.id}`); }}
                    className="px-2.5 py-1 bg-[#111111] hover:bg-[#F97316] text-white text-[10px] sm:text-xs font-heading font-black rounded-xl shadow-xs transition-colors"
                  >
                    Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. TRENDING / READY STOCK PRODUCTS */}
      {trendingProducts.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-black text-sm uppercase text-[#111111] flex items-center gap-1.5">
              <Flame size={16} className="text-[#F97316]" /> Trending & Ready Stock
            </h3>
            <Link to="/customer/products" className="text-xs font-extrabold text-[#F97316]">See All</Link>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {trendingProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/customer/products/${p.id}`)}
                className="shrink-0 w-36 sm:w-44 bg-white rounded-[18px] border border-gray-200/90 p-2.5 shadow-xs cursor-pointer hover:border-[#F97316] transition-all group"
              >
                <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-square mb-2">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {p.isReadyStock && (
                    <span className="absolute top-1.5 left-1.5 bg-green-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">
                      Ready
                    </span>
                  )}
                </div>
                <h4 className="font-heading font-bold text-[11px] text-[#111111] line-clamp-2 leading-tight group-hover:text-[#F97316] transition-colors">{p.name}</h4>
                <span className="font-heading font-black text-xs text-[#F97316] mt-1 block">₹{p.price.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. QUICK CONTACT FOOTER */}
      <div className="bg-[#111111] rounded-[22px] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div>
          <p className="font-heading font-black text-sm text-white">Need Custom Fabrication?</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Call or WhatsApp Chellamuthu K for a free workshop quote.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <a href="tel:+919659286268" className="bg-[#F97316] text-white text-xs font-heading font-black px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm">
            <Phone size={13} /> Call Now
          </a>
          <a href="https://wa.me/919659286268" target="_blank" rel="noopener noreferrer"
            className="bg-[#25D366] text-white text-xs font-heading font-black px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm">
            <MessageCircle size={13} /> WhatsApp
          </a>
        </div>
      </div>

    </div>
  );
};
