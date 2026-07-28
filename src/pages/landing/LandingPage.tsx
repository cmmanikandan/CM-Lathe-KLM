import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { useStatus } from '../../context/StatusContext';
import { GoogleMapEmbed } from '../../components/common/GoogleMapEmbed';
import {
  Search,
  Mic,
  Phone,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Wrench,
  Star,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  Zap,
  Package,
  ShoppingBag,
  Flame,
  CreditCard,
  Layers,
  Award,
  Heart,
  MapPin,
  HelpCircle,
  ChevronDown
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { products, categories, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useProducts();
  const { isLoggedIn, user } = useAuth();
  const { orders } = useOrders();
  const { activeStories } = useStatus();
  const navigate = useNavigate();

  const [bannerIndex, setBannerIndex] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [isListening, setIsListening] = useState(false);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning ☀️';
    if (hour < 17) return 'Good Afternoon 🌤️';
    return 'Good Evening 🌙';
  };

  // Hero Banners
  const heroBanners = [
    {
      title: "TRACTOR KALAPPAI & CULTIVATORS",
      subtitle: "Precision forged lathe-machined tines engineered for tough agricultural soil.",
      tag: "AGRICULTURAL MACHINERY",
      image: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1000&q=80"
    },
    {
      title: "STAINLESS STEEL & MS MAIN GATES",
      subtitle: "Custom architectural gates crafted with laser cut panels & heavy duty bearings.",
      tag: "MAIN SAFETY GATES",
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80"
    },
    {
      title: "PRECISION LATHE MACHINE WORKS",
      subtitle: "Expert lathe turning, shaft grinding, bush fitting & machine repairs in Kallimandhayam.",
      tag: "LATHE TURNING WORKS",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=80"
    }
  ];

  // Auto sliding hero banner
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
      navigate('/products');
    }, 1500);
  };

  // Customer pending order check
  const customerOrders = orders.filter(
    (o) => o.customerPhone.replace(/\D/g, '') === (user?.phone || '').replace(/\D/g, '') || user?.phone?.includes('9842188412')
  );
  const activeOrder = customerOrders.find((o) => o.status !== 'COMPLETED' && o.status !== 'REJECTED') || customerOrders[0];

  // Recommended & Best Selling products
  const recommendedProducts = products.filter((p) => p.isRecommended || p.isBestSelling).slice(0, 4);
  const trendingProducts = products.filter((p) => p.isTrending || p.isReadyStock).slice(0, 4);

  return (
    <div className="p-4 space-y-6 font-sans">
      
      {/* 1. TOP WELCOME DASHBOARD BANNER */}
      <div className="bg-gradient-to-r from-[#111111] via-[#1A1A1A] to-[#232323] text-white rounded-[22px] p-5 shadow-lg border border-gray-800 space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <div>
            <span className="text-[#F97316] font-mono text-[10px] uppercase font-bold tracking-widest block">
              {getGreeting()}
            </span>
            <h2 className="font-heading font-black text-xl text-white mt-0.5 flex items-center gap-1.5">
              <span>{isLoggedIn ? user?.name : 'MANIKANDAN LATHE'}</span>
              {isLoggedIn && <CheckCircle2 size={16} className="text-[#F97316] shrink-0" />}
            </h2>
            <p className="text-gray-400 text-xs mt-0.5">Kallimandhayam Heavy Lathe & Fabrication Works</p>
          </div>

          <Link
            to={isLoggedIn ? '/profile' : '/login'}
            className="w-10 h-10 rounded-full bg-[#F97316]/20 border border-[#F97316] text-[#F97316] flex items-center justify-center font-black text-xs shrink-0 active:scale-95 transition-transform"
          >
            {isLoggedIn ? user?.name.charAt(0).toUpperCase() : 'ML'}
          </Link>
        </div>

        {/* Quick Contact Buttons */}
        <div className="pt-2 flex items-center gap-2 relative z-10">
          <a
            href="tel:+919659286268"
            className="flex-1 bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Phone size={14} /> Call Workshop
          </a>
          <a
            href="https://wa.me/919942012345"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#25D366] hover:bg-[#20ba5a] text-white font-heading font-black text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <MessageCircle size={14} /> WhatsApp Us
          </a>
        </div>
      </div>

      {/* 2. PENDING PAYMENT / RUNNING ORDER CARD (HIGH PRIORITY APP WIDGET) */}
      {activeOrder && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate(`/order/${activeOrder.id}`)}
          className="bg-white border-2 border-[#F97316]/40 rounded-[22px] p-4 shadow-md space-y-3 cursor-pointer hover:border-[#F97316] transition-all"
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F97316] animate-ping" />
              <span className="font-heading font-black text-xs text-[#111111]">
                Active Order #{activeOrder.orderNumber}
              </span>
            </div>
            <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
              {activeOrder.status}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-gray-500 block">Total Payable: ₹{activeOrder.finalPrice.toLocaleString('en-IN')}</span>
              <span className={activeOrder.remainingBalance > 0 ? "font-black text-red-600" : "font-black text-green-600"}>
                {activeOrder.remainingBalance > 0 ? `Balance Due: ₹${activeOrder.remainingBalance.toLocaleString('en-IN')}` : '✓ Fully Paid'}
              </span>
            </div>

            <div className="bg-[#111111] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1">
              Track Status <ChevronRight size={14} className="text-[#F97316]" />
            </div>
          </div>
        </motion.div>
      )}

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
              if (e.key === 'Enter') navigate('/products');
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
                navigate('/products');
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

      {/* 4. AUTO HERO SLIDER */}
      <div className="relative rounded-[22px] overflow-hidden shadow-md h-[170px] bg-black">
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
              <h3 className="font-heading font-black text-sm text-white leading-tight mt-0.5">
                {b.title}
              </h3>
              <p className="text-gray-300 text-[11px] line-clamp-1 mt-0.5">{b.subtitle}</p>
            </div>
          </div>
        ))}

        {/* Carousel Indicators */}
        <div className="absolute bottom-2 right-3 flex gap-1 z-10">
          {heroBanners.map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === bannerIndex ? 'bg-[#F97316] w-4' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </div>

      {/* 5. QUICK ACTION GRID TILES */}
      <div>
        <span className="text-[11px] font-heading font-black text-gray-400 uppercase tracking-wider block mb-2">
          Quick App Services & Shortcuts
        </span>
        
        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => navigate('/products')}
            className="bg-white p-3 rounded-[22px] border border-gray-200/80 shadow-xs flex flex-col items-center justify-center gap-1.5 hover:border-[#F97316] transition-all active:scale-95"
          >
            <div className="w-9 h-9 rounded-full bg-orange-50 text-[#F97316] flex items-center justify-center">
              <Package size={18} />
            </div>
            <span className="text-[11px] font-heading font-black text-[#111111]">Products</span>
          </button>

          <button
            onClick={() => navigate('/my-orders')}
            className="bg-white p-3 rounded-[22px] border border-gray-200/80 shadow-xs flex flex-col items-center justify-center gap-1.5 hover:border-[#F97316] transition-all active:scale-95"
          >
            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag size={18} />
            </div>
            <span className="text-[11px] font-heading font-black text-[#111111]">My Orders</span>
          </button>

          <button
            onClick={() => navigate('/status')}
            className="bg-white p-3 rounded-[22px] border border-gray-200/80 shadow-xs flex flex-col items-center justify-center gap-1.5 hover:border-[#F97316] transition-all active:scale-95 relative"
          >
            <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame size={18} className="animate-pulse" />
            </div>
            <span className="text-[11px] font-heading font-black text-[#111111]">Stories</span>
            {activeStories.length > 0 && <span className="w-2 h-2 rounded-full bg-[#F97316] absolute top-2 right-4" />}
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="bg-white p-3 rounded-[22px] border border-gray-200/80 shadow-xs flex flex-col items-center justify-center gap-1.5 hover:border-[#F97316] transition-all active:scale-95"
          >
            <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <CreditCard size={18} />
            </div>
            <span className="text-[11px] font-heading font-black text-[#111111]">Payments</span>
          </button>

          <a
            href="tel:+919659286268"
            className="bg-white p-3 rounded-[22px] border border-gray-200/80 shadow-xs flex flex-col items-center justify-center gap-1.5 hover:border-[#F97316] transition-all active:scale-95"
          >
            <div className="w-9 h-9 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
              <Phone size={18} />
            </div>
            <span className="text-[11px] font-heading font-black text-[#111111]">Call Shop</span>
          </a>

          <a
            href="https://wa.me/919942012345"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white p-3 rounded-[22px] border border-gray-200/80 shadow-xs flex flex-col items-center justify-center gap-1.5 hover:border-[#F97316] transition-all active:scale-95"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageCircle size={18} />
            </div>
            <span className="text-[11px] font-heading font-black text-[#111111]">WhatsApp</span>
          </a>
        </div>
      </div>

      {/* 6. WORKSHOP STORIES BUBBLES */}
      {activeStories.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-heading font-black text-gray-400 uppercase tracking-wider">
              Live Workshop Stories (24h)
            </span>
            <Link to="/status" className="text-xs font-extrabold text-[#F97316]">View All</Link>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
            {activeStories.map((story) => (
              <div
                key={story.id}
                onClick={() => navigate('/status')}
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

      {/* 7. RECOMMENDED PRODUCTS (2-Column Mobile App Cards) */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-heading font-black text-sm uppercase text-[#111111] flex items-center gap-1.5">
            <Star size={16} className="text-[#F97316] fill-[#F97316]" /> Recommended Products
          </h3>
          <Link to="/products" className="text-xs font-extrabold text-[#F97316]">See All</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {recommendedProducts.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/product/${p.id}`)}
              className="bg-white rounded-[22px] border border-gray-200/80 p-2.5 shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#F97316] transition-all"
            >
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-square">
                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                {p.badgeText && (
                  <span className="absolute top-2 left-2 bg-[#F97316] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                    {p.badgeText}
                  </span>
                )}
              </div>

              <div className="mt-2 space-y-1">
                <h4 className="font-heading font-bold text-xs text-[#111111] line-clamp-1">
                  {p.name}
                </h4>
                <p className="text-[10px] text-gray-500 line-clamp-1">{p.specifications.material}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-heading font-black text-sm text-[#F97316]">
                    ₹{p.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">/{p.unit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. TRENDING FABRICATION WORKS */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-heading font-black text-sm uppercase text-[#111111] flex items-center gap-1.5">
            <Zap size={16} className="text-[#F97316]" /> Trending Kalappai & Gates
          </h3>
          <Link to="/products" className="text-xs font-extrabold text-[#F97316]">Explore Catalog</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {trendingProducts.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/product/${p.id}`)}
              className="bg-white rounded-[22px] border border-gray-200/80 p-2.5 shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#F97316] transition-all"
            >
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-square">
                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                <span className="absolute top-2 right-2 bg-black/70 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                  ★ {p.rating}
                </span>
              </div>

              <div className="mt-2 space-y-1">
                <h4 className="font-heading font-bold text-xs text-[#111111] line-clamp-1">
                  {p.name}
                </h4>
                <p className="text-[10px] text-gray-500 line-clamp-1">{p.category}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-heading font-black text-sm text-[#F97316]">
                    ₹{p.price.toLocaleString('en-IN')}
                  </span>
                  <span className="bg-orange-50 text-[#F97316] text-[10px] font-bold px-2 py-0.5 rounded-lg">
                    Order
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 9. WORKSHOP LOCATION & MAP WIDGET */}
      <div className="bg-white rounded-[22px] border border-gray-200/80 p-4 space-y-3 shadow-xs">
        <h3 className="font-heading font-black text-xs uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
          <MapPin size={16} className="text-[#F97316]" /> Workshop Location & Visit
        </h3>
        <p className="text-xs text-gray-600 leading-snug">
          K. Keeranur Road, Kallimandhayam, Dindigul District - 624616, Tamil Nadu.
        </p>
        <div className="rounded-2xl overflow-hidden border border-gray-200">
          <GoogleMapEmbed />
        </div>
      </div>

    </div>
  );
};
