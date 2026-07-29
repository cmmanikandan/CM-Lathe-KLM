import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { ImageViewerModal } from '../../components/common/ImageViewerModal';
import { LoginRequiredModal } from '../../components/common/LoginRequiredModal';
import { createProductInquiryWhatsApp } from '../../services/whatsappService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Wrench,
  ChevronRight,
  Maximize2,
  Sparkles,
  ShoppingBag,
  MessageCircle,
  Lock,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  Check,
  Copy,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

export const PublicProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProductById, products } = useProducts();
  const { isLoggedIn, user } = useAuth();

  const product = getProductById(id || '');

  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'applications' | 'process' | 'maintenance'>('overview');

  // Variant choices
  const sizeOptions = [
    { label: '5 Feet (Standard)', priceMultiplier: 1.0, weight: '240 kg', deliveryTime: '2 - 3 Days' },
    { label: '6 Feet (Heavy Duty)', priceMultiplier: 1.2, weight: '290 kg', deliveryTime: '3 - 4 Days' },
    { label: '7 Feet (Extra Heavy)', priceMultiplier: 1.4, weight: '350 kg', deliveryTime: '3 - 5 Days', isRecommended: true },
    { label: '8 Feet (Jumbo Heavy)', priceMultiplier: 1.6, weight: '420 kg', deliveryTime: '4 - 6 Days' }
  ];

  const [selectedSizeOpt, setSelectedSizeOpt] = useState(sizeOptions[0]);

  // Wishlist state
  const wishlistStorageKey = `ml_wishlist_${user?.id || 'guest'}_products`;
  const [isWishlisted, setIsWishlisted] = useState<boolean>(() => {
    if (!product) return false;
    try {
      const saved = localStorage.getItem(wishlistStorageKey);
      if (saved) return JSON.parse(saved).includes(product.id);
    } catch {}
    return false;
  });

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Reviews
  const reviews = [
    {
      id: 'rev-1',
      name: 'Karthik Raja',
      location: 'Palani, Dindigul',
      rating: 5,
      date: '12 Jan 2026',
      comment: 'Top quality Tractor Kalappai. Lathe forged tines handled tough red soil easily without bending. Chellamuthu K delivered on time.',
      verified: true
    },
    {
      id: 'rev-2',
      name: 'Murugan S',
      location: 'Ottanchatram',
      rating: 5,
      date: '28 Dec 2025',
      comment: 'Custom SS 304 safety gate installed at my house. Precision laser cutting and heavy hinges. Highly recommended workshop!',
      verified: true
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) setShowStickyHeader(true);
      else setShowStickyHeader(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between">
        <div className="p-8 text-center bg-white rounded-[22px] shadow-xs border border-gray-200 my-12 max-w-lg mx-auto space-y-3 font-sans">
          <h2 className="font-heading font-black text-lg text-[#111111]">Product Showcase Not Found</h2>
          <button
            onClick={() => navigate('/products')}
            className="bg-[#111111] hover:bg-[#F97316] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors"
          >
            Back to Public Product Catalog
          </button>
        </div>
        <PublicFooter />
      </div>
    );
  }

  const basePrice = product.price || 0;
  const currentPrice = Math.round(basePrice * selectedSizeOpt.priceMultiplier);

  const handleToggleWishlist = () => {
    try {
      const saved = localStorage.getItem(wishlistStorageKey);
      const ids: string[] = saved ? JSON.parse(saved) : [];
      const exists = ids.includes(product.id);
      const updated = exists ? ids.filter((i) => i !== product.id) : [...ids, product.id];
      localStorage.setItem(wishlistStorageKey, JSON.stringify(updated));
      setIsWishlisted(!exists);
    } catch (e) {}
  };

  const handleOrderClick = () => {
    if (isLoggedIn) {
      navigate(`/customer/products/${product.id}`);
    } else {
      setLoginModalOpen(true);
    }
  };

  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111] font-sans antialiased flex flex-col selection:bg-[#F97316] selection:text-white">


      {/* Glassmorphism Sticky Header on Scroll */}
      <AnimatePresence>
        {showStickyHeader && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed top-0 left-0 right-0 z-40 bg-white/85 backdrop-blur-xl border-b border-gray-200/80 shadow-md py-2.5 px-4 sm:px-6 flex items-center justify-between max-w-[1440px] mx-auto"
          >
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-[#111111] transition-colors shrink-0"
              >
                <ArrowLeft size={16} />
              </button>
              <div className="min-w-0">
                <h3 className="font-heading font-black text-xs sm:text-sm text-[#111111] truncate max-w-[180px] sm:max-w-xs md:max-w-md">
                  {product.name}
                </h3>
                <span className="font-heading font-black text-xs text-[#F97316]">
                  ₹{currentPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleOrderClick}
                className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                <ShoppingBag size={14} /> Order Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 w-full">
        
        {/* Breadcrumb */}
        <div className="flex items-center justify-between text-xs border-b border-gray-200/80 pb-3">
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-1.5 font-heading font-extrabold text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft size={16} className="text-[#F97316]" /> Back to Public Product Catalog
          </button>
          <span className="font-mono text-gray-400 uppercase font-bold">{product.category}</span>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Images */}
          <div className="lg:col-span-6 space-y-4 sticky top-20">
            <div
              className="relative aspect-square rounded-[26px] overflow-hidden bg-white border border-gray-200/90 shadow-md cursor-pointer group flex items-center justify-center"
              onClick={() => setIsViewerOpen(true)}
            >
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md">
                <Maximize2 size={15} /> View Full Screen ({selectedImageIndex + 1}/{product.images.length})
              </div>
            </div>

            {product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-white flex items-center justify-center ${
                      selectedImageIndex === idx ? 'border-[#F97316] ring-2 ring-[#F97316]/30' : 'border-gray-200 opacity-70'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information & Pricing */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#F97316] font-mono text-xs font-bold uppercase tracking-widest">
                  {product.category} • Kallimandhayam Shop
                </span>

                {/* Stock Status Badge */}
                {product.stock > 0 && product.stock <= 5 ? (
                  <span className="bg-amber-100 text-amber-900 text-xs font-mono font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-amber-300 animate-pulse">
                    <AlertTriangle size={13} className="text-amber-600" /> Low Stock: Only {product.stock} left!
                  </span>
                ) : product.stock > 5 ? (
                  <span className="bg-green-100 text-green-800 text-xs font-mono font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-green-300">
                    <CheckCircle size={13} /> In Stock ({product.stock} units ready)
                  </span>
                ) : (
                  <span className="bg-orange-100 text-[#F97316] text-xs font-mono font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-orange-300">
                    <Clock size={13} /> Custom Made to Order
                  </span>
                )}
              </div>
              <h1 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-[#111111] leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Low Stock Warning Banner */}
            {product.stock > 0 && product.stock <= 5 && (
              <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl flex items-center gap-3 text-xs font-sans text-amber-900 font-bold shadow-xs">
                <AlertTriangle size={24} className="text-[#F97316] shrink-0" />
                <div>
                  <span className="text-xs font-black text-red-600 uppercase block tracking-wider">⚡ LOW STOCK ALERT</span>
                  <span>Hurry! Only <strong className="font-mono text-sm text-[#111111]">{product.stock}</strong> items left in workshop ready stock. Place your order before stock runs out!</span>
                </div>
              </div>
            )}

            <div className="bg-white p-5 rounded-[22px] border border-gray-200/90 shadow-xs space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-gray-400 font-mono uppercase font-bold block">Special Factory Price</span>
                  <span className="font-heading font-black text-3xl sm:text-4xl text-[#F97316]">
                    ₹{currentPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="bg-orange-50 border border-orange-200 p-2.5 rounded-2xl text-xs text-amber-500 flex items-center gap-1 font-bold">
                  ★ 4.9 (24 Reviews)
                </div>
              </div>
            </div>

            {/* Selectable Variants */}
            <div className="space-y-3">
              <label className="font-heading font-black text-xs text-[#111111] uppercase tracking-wider block">
                Select Dimensions & Size Variant
              </label>

              <div className="grid grid-cols-2 gap-3">
                {sizeOptions.map((opt) => {
                  const optPrice = Math.round(basePrice * opt.priceMultiplier);
                  const isSelected = selectedSizeOpt.label === opt.label;
                  return (
                    <div
                      key={opt.label}
                      onClick={() => setSelectedSizeOpt(opt)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected ? 'bg-orange-50/80 border-[#F97316]' : 'bg-white border-gray-200'
                      }`}
                    >
                      <span className="font-heading font-black text-xs text-[#111111] block">{opt.label}</span>
                      <span className="font-heading font-black text-sm text-[#F97316] block mt-1">₹{optPrice.toLocaleString('en-IN')}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleOrderClick}
                className="flex-1 bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-sm py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <ShoppingBag size={18} /> Order Now (₹{currentPrice.toLocaleString('en-IN')})
              </button>

              <a
                href={createProductInquiryWhatsApp(product.name, product.category)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-heading font-black text-sm px-5 py-4 rounded-2xl shadow-md flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} /> WhatsApp Inquiry
              </a>
            </div>

          </div>
        </div>

        {/* Simple Product Overview & Details */}
        <div className="bg-white rounded-[26px] border border-gray-200 p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="font-heading font-black text-lg text-[#111111] uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={18} className="text-[#F97316]" /> Product Overview & Description
          </h2>
          <div className="text-xs sm:text-sm text-gray-700 leading-relaxed font-sans space-y-3">
            <p className="leading-relaxed text-gray-800 font-medium">
              {product.description}
            </p>
            <div className="bg-orange-50/60 border border-orange-200 p-3.5 rounded-2xl flex items-center gap-2 text-xs font-mono text-orange-950">
              <CheckCircle2 size={16} className="text-[#F97316] shrink-0" />
              <span>Forged and custom fabricated at MANIKANDAN LATHE workshop in Kallimandhayam.</span>
            </div>
          </div>
        </div>

      </main>

      <PublicFooter />

      {/* Full screen Viewer & Login Modal */}
      <ImageViewerModal
        images={product.images}
        initialIndex={selectedImageIndex}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        title={product.name}
      />

      <LoginRequiredModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        productName={product.name}
      />
    </div>
  );
};
