import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useOrders } from '../../context/OrderContext';
import { useEnquiries } from '../../context/EnquiryContext';
import { useAuth } from '../../context/AuthContext';
import { ImageViewerModal } from '../../components/common/ImageViewerModal';
import { createProductInquiryWhatsApp } from '../../services/whatsappService';
import { openRazorpayCheckout } from '../../services/razorpayService';
import { uploadToCloudinary } from '../../services/cloudinaryService';
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
  AlertCircle,
  Loader2,
  ShoppingBag,
  MessageCircle,
  Phone,
  Lock,
  Layers,
  Info,
  ChevronDown,
  ChevronUp,
  Award,
  Clock,
  RotateCcw,
  Copy,
  Check,
  CheckCircle,
  Upload,
  CreditCard,
  FileText,
  Edit3,
  Trash2,
  AlertTriangle
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProductById, products } = useProducts();
  const { submitEnquiry } = useEnquiries();
  const { user } = useAuth();

  const product = getProductById(id || '');

  // Sticky header visibility on scroll > 150px
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'applications' | 'process' | 'maintenance'>('overview');

  // Variant choices with dynamic prices
  const sizeOptions = [
    { label: '5 Feet (Standard)', priceMultiplier: 1.0, weight: '240 kg', deliveryTime: '2 - 3 Days' },
    { label: '6 Feet (Heavy Duty)', priceMultiplier: 1.2, weight: '290 kg', deliveryTime: '3 - 4 Days' },
    { label: '7 Feet (Extra Heavy)', priceMultiplier: 1.4, weight: '350 kg', deliveryTime: '3 - 5 Days', isRecommended: true },
    { label: '8 Feet (Jumbo Heavy)', priceMultiplier: 1.6, weight: '420 kg', deliveryTime: '4 - 6 Days' }
  ];

  const [selectedSizeOpt, setSelectedSizeOpt] = useState(sizeOptions[0]);

  // Wishlist state synced with localStorage
  const wishlistStorageKey = `ml_wishlist_${user?.id || 'guest'}_products`;
  const [isWishlisted, setIsWishlisted] = useState<boolean>(() => {
    if (!product) return false;
    try {
      const saved = localStorage.getItem(wishlistStorageKey);
      if (saved) {
        const ids: string[] = JSON.parse(saved);
        return ids.includes(product.id);
      }
    } catch {}
    return false;
  });

  // Share modal state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Review state & reviews
  const [reviews, setReviews] = useState([
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
    },
    {
      id: 'rev-3',
      name: 'Senthil Kumar P',
      location: 'Kallimandhayam',
      rating: 5,
      date: '15 Dec 2025',
      comment: 'Extremely durable steel door. Powder coating quality is outstanding. Factory team installed it in 2 hours.',
      verified: true
    }
  ]);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editComment, setEditComment] = useState('');
  const [editRating, setEditRating] = useState(5);

  // Online Enquiry Workflow Modal state
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [enquiryStep, setEnquiryStep] = useState<1 | 2 | 3>(1);
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerAddress, setCustomerAddress] = useState(user?.address || '');
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [customMeasurements, setCustomMeasurements] = useState('');
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [deliveryType, setDeliveryType] = useState<'Pickup' | 'Home Delivery' | 'Installation'>('Home Delivery');
  const [paymentChoice, setPaymentChoice] = useState<'Pay Later' | 'Pay Advance Online'>('Pay Later');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [createdEnquiryNumber, setCreatedEnquiryNumber] = useState('');

  // Scroll listener for glassmorphism sticky header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setShowStickyHeader(true);
      } else {
        setShowStickyHeader(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update wishlist status when product or user changes
  useEffect(() => {
    if (!product) return;
    try {
      const saved = localStorage.getItem(wishlistStorageKey);
      if (saved) {
        const ids: string[] = JSON.parse(saved);
        setIsWishlisted(ids.includes(product.id));
      }
    } catch {}
  }, [product, wishlistStorageKey]);

  if (!product) {
    return (
      <div className="p-8 text-center bg-white rounded-[22px] shadow-xs border border-gray-200 my-12 max-w-lg mx-auto space-y-3 font-sans">
        <h2 className="font-heading font-black text-lg text-[#111111]">Product Showcase Not Found</h2>
        <p className="text-xs text-gray-500">The product you are looking for does not exist or was removed.</p>
        <button
          onClick={() => navigate('/customer/products')}
          className="bg-[#111111] hover:bg-[#F97316] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors"
        >
          Back to Product Catalog
        </button>
      </div>
    );
  }

  // Dynamic price calculation
  const basePrice = product.price || 0;
  const currentPrice = Math.round(basePrice * selectedSizeOpt.priceMultiplier);

  // Wishlist toggle handler
  const handleToggleWishlist = () => {
    try {
      const saved = localStorage.getItem(wishlistStorageKey);
      const ids: string[] = saved ? JSON.parse(saved) : [];
      const exists = ids.includes(product.id);
      const updated = exists ? ids.filter((i) => i !== product.id) : [...ids, product.id];
      localStorage.setItem(wishlistStorageKey, JSON.stringify(updated));
      setIsWishlisted(!exists);
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Wishlist toggle error:', e);
    }
  };

  // Share handler
  const handleShareClick = () => {
    if (navigator.share) {
      navigator.share({
        title: `${product.name} - MANIKANDAN LATHE`,
        text: `Check out ${product.name} at MANIKANDAN LATHE Workshop Kallimandhayam`,
        url: window.location.href
      });
    } else {
      setShareModalOpen(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Submit Review Handler
  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;

    const newEntry = {
      id: 'rev-' + Date.now(),
      name: user?.name || 'Verified Customer',
      location: user?.district ? `${user.district}, Tamil Nadu` : 'Kallimandhayam',
      rating: newReviewRating,
      date: 'Just Now',
      comment: newReviewComment,
      verified: true
    };

    setReviews([newEntry, ...reviews]);
    setNewReviewComment('');
    setReviewSuccessMsg('Thank you! Your verified review has been published.');
    setTimeout(() => setReviewSuccessMsg(''), 3000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setIsUploadingImages(true);
      const file = files[0];
      const url = await uploadToCloudinary(file);
      setReferenceImages((prev) => [...prev, url]);
    } catch (err) {
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleSubmitEnquiryWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress) {
      alert('Please fill in your name, mobile number, and address.');
      return;
    }

    const totalEstPrice = currentPrice * orderQuantity;
    setIsSubmitting(true);

    if (paymentChoice === 'Pay Advance Online') {
      const advanceAmount = Math.round(totalEstPrice * 0.25); // 25% advance
      openRazorpayCheckout({
        amount: advanceAmount,
        orderNumber: `ENQ-ADV-${Date.now().toString().slice(-6)}`,
        customerName,
        customerPhone,
        customerEmail,
        description: `25% Advance Payment for ${product.name} Enquiry`,
        onSuccess: async (payload) => {
          const newEnq = await submitEnquiry({
            customerName,
            customerPhone,
            customerEmail,
            customerAddress,
            productId: product.id,
            productName: product.name,
            productImage: product.images[selectedImageIndex] || product.images[0],
            variantName: selectedSizeOpt.label,
            measurements: customMeasurements,
            referenceImages,
            notes: orderNotes,
            quantity: orderQuantity,
            estimatedPrice: totalEstPrice,
            paymentOption: 'Pay Advance Online',
            advancePaid: advanceAmount,
            advancePaymentDetails: {
              id: `pay-${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
              amount: advanceAmount,
              mode: 'Razorpay',
              paymentType: 'Advance',
              paymentStatus: 'SUCCESS',
              collectedBy: 'Razorpay Online Gateway',
              remainingBalanceAfter: totalEstPrice - advanceAmount,
              receiptNumber: `RCP-${Date.now().toString().slice(-6)}`,
              razorpayPaymentId: payload.razorpayPaymentId,
              razorpayOrderId: payload.razorpayOrderId,
              razorpaySignature: payload.razorpaySignature,
            },
            deliveryType,
          });
          setIsSubmitting(false);
          setCreatedEnquiryNumber(newEnq.enquiryNumber);
          setEnquirySuccess(true);
        },
        onFailure: (error) => {
          setIsSubmitting(false);
          alert('Advance payment was cancelled or failed. You can switch to "Pay Later" to submit enquiry.');
        },
      });
    } else {
      // Pay Later flow
      const newEnq = await submitEnquiry({
        customerName,
        customerPhone,
        customerEmail,
        customerAddress,
        productId: product.id,
        productName: product.name,
        productImage: product.images[selectedImageIndex] || product.images[0],
        variantName: selectedSizeOpt.label,
        measurements: customMeasurements,
        referenceImages,
        notes: orderNotes,
        quantity: orderQuantity,
        estimatedPrice: totalEstPrice,
        paymentOption: 'Pay Later',
        advancePaid: 0,
        deliveryType,
      });
      setIsSubmitting(false);
      setCreatedEnquiryNumber(newEnq.enquiryNumber);
      setEnquirySuccess(true);
    }
  };


  // Related products
  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.category === product.category || p.specifications.material === product.specifications.material))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111] font-sans antialiased pb-28 relative">
      
      {/* 1. GLASSMORPHISM STICKY HEADER (Appears after 150px scroll) */}
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
                onClick={handleToggleWishlist}
                className={`p-2 rounded-full border transition-all active:scale-95 ${
                  isWishlisted ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}
                title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart size={18} className={isWishlisted ? 'fill-red-600 text-red-600' : ''} />
              </button>

              <button
                onClick={handleShareClick}
                className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                title="Share Product"
              >
                <Share2 size={18} />
              </button>

              <button
                onClick={() => {
                  setEnquiryStep(1);
                  setEnquirySuccess(false);
                  setIsEnquiryModalOpen(true);
                }}
                className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag size={14} /> Submit Order Enquiry
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Page Layout Container */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center justify-between text-xs border-b border-gray-200/80 pb-3">
          <button
            onClick={() => navigate('/customer/products')}
            className="inline-flex items-center gap-1.5 font-heading font-extrabold text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft size={16} className="text-[#F97316]" /> Back to Products Catalog
          </button>
          <div className="flex items-center gap-2 font-mono text-[11px] text-gray-500">
            <Link to="/customer/home" className="hover:underline">Home</Link>
            <span>/</span>
            <Link to="/customer/products" className="hover:underline">{product.category}</Link>
            <span>/</span>
            <span className="text-[#111111] font-bold truncate max-w-[120px]">{product.name}</span>
          </div>
        </div>

        {/* 2-COLUMN RESPONSIVE LAYOUT SYSTEM (Desktop Left Gallery 6 cols / Right Specs & Buy 6 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── LEFT COLUMN: Image Gallery & Zoom Viewer (6 Columns) ── */}
          <div className="lg:col-span-6 space-y-4 sticky top-20">
            {/* Main Interactive Product Preview Image */}
            <div
              className="relative aspect-square rounded-[26px] overflow-hidden bg-white border border-gray-200/90 shadow-md cursor-pointer group flex items-center justify-center"
              onClick={() => setIsViewerOpen(true)}
            >
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
              />

              {/* Product Badge Tag */}
              {product.badgeText && (
                <span className="absolute top-4 left-4 bg-[#F97316] text-white text-[10px] font-heading font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  {product.badgeText}
                </span>
              )}

              {/* Wishlist Floating Button on Image */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleWishlist();
                }}
                className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all active:scale-95 shadow-md ${
                  isWishlisted ? 'bg-white text-red-600' : 'bg-black/40 text-white hover:bg-black/60'
                }`}
              >
                <Heart size={20} className={isWishlisted ? 'fill-red-600 text-red-600' : ''} />
              </button>

              {/* Fullscreen Trigger Overlay Pill */}
              <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md group-hover:bg-[#F97316] transition-colors">
                <Maximize2 size={15} /> View Full Screen ({selectedImageIndex + 1}/{product.images.length})
              </div>
            </div>

            {/* Thumbnail Selection Carousel */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 bg-white flex items-center justify-center ${
                      selectedImageIndex === idx
                        ? 'border-[#F97316] ring-2 ring-[#F97316]/30 scale-95 shadow-md'
                        : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}

            </div>

          {/* ── RIGHT COLUMN: Title, Pricing, Variants & Purchase Actions (6 Columns) ── */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Category Tag & Product Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#F97316] font-mono text-xs font-bold uppercase tracking-widest">
                  {product.category} • Kallimandhayam Factory
                </span>

                {/* Stock Status Badge */}
                {product.stock > 0 && product.stock <= 5 ? (
                  <span className="bg-amber-100 text-amber-900 text-xs font-mono font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-amber-300 animate-pulse">
                    <AlertTriangle size={13} className="text-amber-600" /> Low Stock: Only {product.stock} left!
                  </span>
                ) : product.stock > 5 ? (
                  <span className="bg-green-100 text-green-800 text-xs font-mono font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-green-300">
                    <CheckCircle size={13} /> In Ready Stock ({product.stock} units)
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
                  <span>Hurry! Only <strong className="font-mono text-sm text-[#111111]">{product.stock}</strong> items left in workshop ready stock. Place your order enquiry before stock runs out!</span>
                </div>
              </div>
            )}

            {/* Price & Rating Summary Row */}
            <div className="bg-white p-5 rounded-[22px] border border-gray-200/90 shadow-xs space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <span className="text-xs text-gray-400 font-mono uppercase font-bold block">Special Factory Price</span>
                  <div className="flex items-baseline gap-3">
                    <span className="font-heading font-black text-3xl sm:text-4xl text-[#F97316]">
                      ₹{currentPrice.toLocaleString('en-IN')}
                    </span>
                    {product.discountPrice && (
                      <span className="text-base text-gray-400 line-through font-mono">
                        ₹{Math.round(product.discountPrice * selectedSizeOpt.priceMultiplier).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-500 font-mono block mt-0.5">
                    GST Invoice included • Free delivery in Kallimandhayam radius
                  </span>
                </div>

                {/* Rating Badge */}
                <div className="bg-orange-50 border border-orange-200 p-2.5 rounded-2xl flex items-center gap-2">
                  <div className="flex text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <div className="text-xs">
                    <span className="font-heading font-black text-[#111111] block">4.9 / 5.0</span>
                    <span className="text-[10px] text-gray-500 font-mono">(24 Customer Reviews)</span>
                  </div>
                </div>
              </div>

              {/* Feature Chips */}
              <div className="pt-3 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-heading font-bold text-gray-700">
                <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-[#F97316]" /> Heavy Duty Steel</span>
                <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-[#F97316]" /> CNC Lathe Finished</span>
                <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-[#F97316]" /> Rust Resistant</span>
                <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-[#F97316]" /> On-Site Fitting</span>
              </div>
            </div>

            {/* 5. SELECTABLE PRODUCT VARIANTS */}
            <div className="space-y-3">
              <label className="font-heading font-black text-xs text-[#111111] uppercase tracking-wider flex items-center justify-between">
                <span>Select Dimensions & Size Variant</span>
                <span className="text-gray-400 font-mono font-normal">Weight: {selectedSizeOpt.weight}</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                {sizeOptions.map((opt) => {
                  const optPrice = Math.round(basePrice * opt.priceMultiplier);
                  const isSelected = selectedSizeOpt.label === opt.label;
                  return (
                    <div
                      key={opt.label}
                      onClick={() => setSelectedSizeOpt(opt)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-1 relative ${
                        isSelected
                          ? 'bg-orange-50/80 border-[#F97316] shadow-sm'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {opt.isRecommended && (
                        <span className="absolute -top-2.5 right-3 bg-[#111111] text-white text-[9px] font-heading font-black px-2 py-0.5 rounded-full uppercase shadow-xs">
                          ⭐ Recommended
                        </span>
                      )}
                      <div>
                        <span className="font-heading font-black text-xs text-[#111111] block">{opt.label}</span>
                        <span className="text-[10px] text-gray-500 font-mono block">Weight ~ {opt.weight}</span>
                      </div>
                      <span className="font-heading font-black text-sm text-[#F97316] pt-1 border-t border-gray-100">
                        ₹{optPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons: Order Now & WhatsApp */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setEnquiryStep(1);
                  setEnquirySuccess(false);
                  setIsEnquiryModalOpen(true);
                }}
                className="flex-1 bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-sm py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
              >
                <ShoppingBag size={18} /> Submit Order Enquiry (₹{currentPrice.toLocaleString('en-IN')})
              </button>

              <a
                href={createProductInquiryWhatsApp(product.name, product.category)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-heading font-black text-sm px-5 py-4 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
                title="WhatsApp Inquiry"
              >
                <MessageCircle size={18} /> Inquiry
              </a>
            </div>
          </div>
        </div>

        {/* ── SIMPLE PRODUCT OVERVIEW & DESCRIPTION ── */}
        <div className="bg-white rounded-[26px] border border-gray-200 p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="font-heading font-black text-lg text-[#111111] uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={18} className="text-[#F97316]" /> Product Details & Overview
          </h2>
          <div className="text-xs sm:text-sm text-gray-700 leading-relaxed font-sans space-y-3">
            <p className="leading-relaxed text-gray-800 font-medium">
              {product.description}
            </p>
            <div className="bg-orange-50/60 border border-orange-200 p-3.5 rounded-2xl flex items-center gap-2 text-xs font-mono text-orange-950">
              <CheckCircle2 size={16} className="text-[#F97316] shrink-0" />
              <span>Engineered & forged at MANIKANDAN LATHE workshop in Kallimandhayam with precision lathe alignment.</span>
            </div>
          </div>
        </div>

        {/* ── 7. CUSTOMER REVIEWS & RATING BREAKDOWN ── */}
        <div className="bg-white rounded-[26px] border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-4 gap-4">
            <div>
              <h2 className="font-heading font-black text-xl text-[#111111] flex items-center gap-2">
                <Star size={20} className="text-[#F97316] fill-[#F97316]" /> Customer Reviews & Ratings
              </h2>
              <p className="text-xs text-gray-500">Verified feedback from factory buyers & agricultural customers</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-heading font-black text-3xl text-[#111111]">4.9</span>
              <div className="text-xs">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-gray-500 font-mono">{reviews.length} Verified Reviews</span>
              </div>
            </div>
          </div>

          {/* Rating Bars Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <div className="md:col-span-4 text-center md:border-r md:border-gray-200 pr-4">
              <span className="font-heading font-black text-4xl text-[#F97316]">98%</span>
              <span className="text-xs font-bold text-gray-700 block mt-1">Recommended by Buyers</span>
              <span className="text-[10px] text-gray-500 font-mono">Based on 24 completed orders</span>
            </div>

            <div className="md:col-span-8 space-y-1.5 text-xs font-mono">
              {[
                { stars: '5 Star', pct: '88%' },
                { stars: '4 Star', pct: '10%' },
                { stars: '3 Star', pct: '2%' },
                { stars: '2 Star', pct: '0%' },
                { stars: '1 Star', pct: '0%' }
              ].map((row) => (
                <div key={row.stars} className="flex items-center gap-3">
                  <span className="w-12 text-gray-600 font-bold">{row.stars}</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#F97316] rounded-full" style={{ width: row.pct }} />
                  </div>
                  <span className="w-10 text-right text-gray-500">{row.pct}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl border border-gray-200/90 space-y-3 bg-white hover:border-[#F97316] transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading font-black text-xs text-[#111111]">{rev.name}</h4>
                      {rev.verified && (
                        <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-green-200">
                          <CheckCircle size={11} /> Verified Buyer
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">{rev.location} • {rev.date}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex text-amber-400">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    {/* Customer Action Buttons: Edit & Delete (Admin has full control, customer can only edit/delete THEIR OWN review) */}
                    {(() => {
                      const isAdmin = user?.googleUID === 'qiiShV5WlAY2Zwok3vNxhedl3N12' || user?.id === 'qiiShV5WlAY2Zwok3vNxhedl3N12' || user?.role === 'admin';
                      const uName = (user?.name || '').trim().toLowerCase();
                      const rName = (rev.name || '').trim().toLowerCase();
                      const isOwner = user && (
                        (uName && rName && (uName.includes(rName) || rName.includes(uName))) ||
                        ((rev as any).userId && (rev as any).userId === user.id) ||
                        ((rev as any).phone && user.phone && (rev as any).phone === user.phone)
                      );
                      const canModify = isAdmin || isOwner;
                      if (!canModify) return null;

                      return (
                        <div className="flex items-center gap-1.5 border-l border-gray-200 pl-2">
                          <button
                            onClick={() => {
                              setEditingReviewId(rev.id);
                              setEditComment(rev.comment);
                              setEditRating(rev.rating);
                            }}
                            className="p-1 rounded-lg text-gray-500 hover:text-[#F97316] hover:bg-orange-50 transition-colors"
                            title="Edit Feedback"
                          >
                            <Edit3 size={14} />
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this review?')) {
                                setReviews((prev) => prev.filter((r) => r.id !== rev.id));
                              }
                            }}
                            className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Feedback"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {editingReviewId === rev.id ? (
                  <div className="bg-orange-50/60 p-3 rounded-xl border border-orange-200 space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-gray-700">Update Rating:</span>
                      <div className="flex text-amber-400 cursor-pointer">
                        {[1, 2, 3, 4, 5].map((st) => (
                          <Star
                            key={st}
                            size={16}
                            onClick={() => setEditRating(st)}
                            className={st <= editRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      className="w-full bg-white p-2.5 rounded-lg border border-gray-300 text-xs outline-none focus:border-[#F97316]"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setReviews((prev) =>
                            prev.map((r) => (r.id === rev.id ? { ...r, comment: editComment, rating: editRating } : r))
                          );
                          setEditingReviewId(null);
                        }}
                        className="bg-[#F97316] text-white text-[11px] font-heading font-black px-3 py-1.5 rounded-lg"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingReviewId(null)}
                        className="bg-gray-200 text-gray-700 text-[11px] font-bold px-3 py-1.5 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-700 leading-relaxed font-medium">{rev.comment}</p>
                )}
              </div>
            ))}
          </div>

          {/* Write a Review Form */}
          <form onSubmit={handleAddReview} className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-3 text-xs">
            <h4 className="font-heading font-black text-xs text-[#111111] uppercase tracking-wider">Leave a Customer Review</h4>
            {reviewSuccessMsg && (
              <div className="bg-green-100 text-green-800 p-2.5 rounded-xl font-bold border border-green-300">
                {reviewSuccessMsg}
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-700">Rating:</span>
              <div className="flex text-amber-400 cursor-pointer">
                {[1, 2, 3, 4, 5].map((st) => (
                  <Star
                    key={st}
                    size={18}
                    onClick={() => setNewReviewRating(st)}
                    className={st <= newReviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                  />
                ))}
              </div>
            </div>
            <textarea
              rows={2}
              required
              value={newReviewComment}
              onChange={(e) => setNewReviewComment(e.target.value)}
              placeholder="Share your feedback about heavy lathe quality, fitting, or delivery..."
              className="w-full bg-white p-3 rounded-xl border border-gray-300 text-xs outline-none focus:border-[#F97316]"
            />
            <button
              type="submit"
              className="bg-[#111111] hover:bg-[#F97316] text-white font-heading font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              Post Review
            </button>
          </form>
        </div>

        {/* ── 8. RELATED PRODUCTS ("YOU MAY ALSO LIKE") ── */}
        {relatedProducts.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-heading font-black text-lg text-[#111111] uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={18} className="text-[#F97316]" /> You May Also Like
              </h2>
              <Link to="/customer/products" className="text-xs font-heading font-extrabold text-[#F97316] hover:underline">
                View Catalog →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/customer/products/${p.id}`)}
                  className="bg-white rounded-[22px] border border-gray-200/90 p-3 shadow-xs hover:border-[#F97316] transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <span className="absolute top-2 left-2 bg-[#111111] text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                        {p.category}
                      </span>
                    </div>

                    <h4 className="font-heading font-extrabold text-xs text-[#111111] line-clamp-1 group-hover:text-[#F97316] transition-colors">
                      {p.name}
                    </h4>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-gray-100 mt-2">
                    <span className="font-heading font-black text-xs sm:text-sm text-[#F97316]">
                      ₹{p.price.toLocaleString('en-IN')}
                    </span>
                    <button className="px-2.5 py-1 bg-[#111111] group-hover:bg-[#F97316] text-white text-[10px] font-heading font-black rounded-xl transition-colors">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── 10. STICKY BOTTOM ACTION BAR (Mobile & Tablet) ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 shadow-[0_-4px_25px_rgba(0,0,0,0.1)] flex items-center justify-between gap-2 max-w-[1440px] mx-auto">
        <button
          onClick={handleToggleWishlist}
          className={`p-3 rounded-2xl border transition-all active:scale-95 flex flex-col items-center justify-center shrink-0 ${
            isWishlisted ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-100 text-gray-700 border-gray-200'
          }`}
          title="Wishlist"
        >
          <Heart size={20} className={isWishlisted ? 'fill-red-600 text-red-600' : ''} />
        </button>

        <a
          href={createProductInquiryWhatsApp(product.name, product.category)}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-heading font-black text-xs py-3 px-4 rounded-2xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 shrink-0"
        >
          <MessageCircle size={16} /> WhatsApp
        </a>

        <button
          onClick={() => {
            setEnquiryStep(1);
            setEnquirySuccess(false);
            setIsEnquiryModalOpen(true);
          }}
          className="flex-1 bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs sm:text-sm py-3.5 px-4 rounded-2xl shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
        >
          <ShoppingBag size={16} /> Submit Order Enquiry (₹{currentPrice.toLocaleString('en-IN')})
        </button>
      </div>

      {/* FULL SCREEN IMAGE VIEWER MODAL */}
      <ImageViewerModal
        images={product.images}
        initialIndex={selectedImageIndex}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        title={product.name}
      />

      {/* SHARE MODAL */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] max-w-sm w-full p-5 space-y-4 shadow-2xl border border-gray-200 font-sans">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="font-heading font-black text-sm text-[#111111]">Share Product</h3>
              <button onClick={() => setShareModalOpen(false)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <p className="text-xs text-gray-500 line-clamp-1">{product.name}</p>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${product.name} - MANIKANDAN LATHE: ${window.location.href}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] text-white p-3 rounded-xl flex items-center justify-center gap-1.5"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>

              <button
                onClick={handleCopyLink}
                className="bg-gray-100 hover:bg-gray-200 text-[#111111] p-3 rounded-xl flex items-center justify-center gap-1.5"
              >
                {copiedLink ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REAL FABRICATION ENQUIRY WORKFLOW MODAL ── */}
      {isEnquiryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans">
          <div className="bg-white rounded-t-[28px] sm:rounded-[26px] max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="bg-[#111111] text-white p-4 flex items-center justify-between border-b border-gray-800 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#F97316]" />
                <div>
                  <h3 className="font-heading font-black text-sm uppercase text-white">Fabrication Order Enquiry</h3>
                  <p className="text-[10px] text-gray-400 font-mono">Step {enquiryStep} of 3 · Workshop Approval Workflow</p>
                </div>
              </div>
              <button onClick={() => setIsEnquiryModalOpen(false)} className="text-gray-400 hover:text-white p-1">✕</button>
            </div>

            {enquirySuccess ? (
              <div className="p-8 text-center space-y-4 font-sans flex-1 overflow-y-auto">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto text-green-600">
                  <CheckCircle2 size={36} />
                </div>
                <div className="space-y-1">
                  <span className="bg-green-100 text-green-800 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase">
                    Status: ENQUIRY_RECEIVED
                  </span>
                  <h3 className="font-heading font-black text-xl text-[#111111] pt-1">Enquiry Submitted!</h3>
                  <p className="text-xs text-gray-500 font-mono">Enquiry No: <strong className="text-[#F97316]">{createdEnquiryNumber}</strong></p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-left text-xs space-y-2">
                  <p className="text-gray-700 font-medium">
                    Thank you, <strong>{customerName}</strong>! Our master technician (Chellamuthu K) will review your measurements and estimated price.
                  </p>
                  <p className="text-gray-500 text-[11px]">
                    Once approved, an official order will be generated and you will receive instant updates via WhatsApp.
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setIsEnquiryModalOpen(false);
                      navigate('/customer/enquiries');
                    }}
                    className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs py-3 rounded-xl shadow-md"
                  >
                    View My Enquiries & Tracking →
                  </button>
                  <button
                    onClick={() => setIsEnquiryModalOpen(false)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-2.5 rounded-xl"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitEnquiryWorkflow} className="flex-1 overflow-y-auto p-5 space-y-5">
                
                {/* STEP 1: VARIANT & MEASUREMENTS */}
                {enquiryStep === 1 && (
                  <div className="space-y-4">
                    <div className="bg-orange-50 p-3 rounded-2xl border border-orange-200 flex items-center gap-3">
                      <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded-xl object-cover border border-orange-300" />
                      <div>
                        <h4 className="font-heading font-black text-xs text-[#111111] line-clamp-1">{product.name}</h4>
                        <span className="font-heading font-bold text-xs text-[#F97316]">Est. ₹{(currentPrice * orderQuantity).toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-xs text-gray-700 block mb-1.5">1. Select Standard Variant</label>
                      <div className="grid grid-cols-2 gap-2">
                        {sizeOptions.map((opt) => (
                          <button
                            type="button"
                            key={opt.label}
                            onClick={() => setSelectedSizeOpt(opt)}
                            className={`p-2.5 rounded-xl text-left border transition-all ${
                              selectedSizeOpt.label === opt.label
                                ? 'bg-[#111111] text-white border-[#111111]'
                                : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200'
                            }`}
                          >
                            <div className="font-heading font-bold text-[11px] truncate">{opt.label}</div>
                            <div className="text-[10px] opacity-75 font-mono">₹{Math.round(basePrice * opt.priceMultiplier).toLocaleString('en-IN')}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-xs text-gray-700 block mb-1">2. Custom Measurements / Dimensions (If Required)</label>
                      <input
                        type="text"
                        placeholder="e.g. Height: 6.5 ft, Width: 4.2 ft, Steel Thickness: 12mm"
                        value={customMeasurements}
                        onChange={(e) => setCustomMeasurements(e.target.value)}
                        className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-300 text-xs font-mono outline-none focus:border-[#F97316]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-xs text-gray-700 block mb-1">3. Quantity Required</label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                          className="w-9 h-9 rounded-xl bg-gray-100 text-gray-800 font-bold hover:bg-gray-200"
                        >
                          -
                        </button>
                        <span className="font-mono font-black text-sm w-8 text-center">{orderQuantity}</span>
                        <button
                          type="button"
                          onClick={() => setOrderQuantity(orderQuantity + 1)}
                          className="w-9 h-9 rounded-xl bg-gray-100 text-gray-800 font-bold hover:bg-gray-200"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setEnquiryStep(2)}
                      className="w-full bg-[#111111] hover:bg-[#F97316] text-white font-heading font-black text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-1.5 mt-2"
                    >
                      Next Step: Images & Delivery →
                    </button>
                  </div>
                )}

                {/* STEP 2: REFERENCE IMAGES, NOTES & DELIVERY */}
                {enquiryStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="font-bold text-xs text-gray-700 block mb-1">Upload Reference Site Photos / CAD Drawings (Optional)</label>
                      <div className="flex items-center gap-3">
                        <label className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-2 border border-gray-300">
                          <Upload size={15} className="text-[#F97316]" /> {isUploadingImages ? 'Uploading...' : 'Choose File'}
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUploadingImages} />
                        </label>
                        <span className="text-[11px] text-gray-500 font-mono">{referenceImages.length} uploaded</span>
                      </div>
                      {referenceImages.length > 0 && (
                        <div className="flex gap-2 mt-2 overflow-x-auto">
                          {referenceImages.map((img, idx) => (
                            <img key={idx} src={img} alt="ref" className="w-12 h-12 rounded-lg object-cover border border-gray-300" />
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="font-bold text-xs text-gray-700 block mb-1">Special Fabrication Notes / Instructions</label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Paint color preferences, specific hinge orientation, site installation conditions..."
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-300 text-xs outline-none focus:border-[#F97316]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-xs text-gray-700 block mb-1.5">Choose Delivery Preference</label>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {[
                          { type: 'Pickup', label: 'Factory Pickup', desc: 'Pick up at Kallimandhayam' },
                          { type: 'Home Delivery', label: 'Home Delivery', desc: 'Transport to site' },
                          { type: 'Installation', label: 'Complete Assembly', desc: 'Delivery + Mechanic Fitting' },
                        ].map((d) => (
                          <button
                            type="button"
                            key={d.type}
                            onClick={() => setDeliveryType(d.type as any)}
                            className={`p-2.5 rounded-xl text-left border transition-all ${
                              deliveryType === d.type
                                ? 'bg-[#F97316] text-white border-[#F97316]'
                                : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200'
                            }`}
                          >
                            <div className="font-heading font-black text-[11px]">{d.label}</div>
                            <div className="text-[9px] opacity-80 mt-0.5">{d.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEnquiryStep(1)}
                        className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-3 rounded-xl"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setEnquiryStep(3)}
                        className="w-2/3 bg-[#111111] hover:bg-[#F97316] text-white font-heading font-black text-xs py-3 rounded-xl shadow-md"
                      >
                        Next Step: Payment & Submit →
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: CUSTOMER DETAILS & PAYMENT CHOICE */}
                {enquiryStep === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div>
                        <label className="font-bold text-xs text-gray-700 block mb-1">Customer Full Name *</label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-300 text-xs outline-none focus:border-[#F97316]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-xs text-gray-700 block mb-1">Mobile / WhatsApp Number *</label>
                        <input
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-300 text-xs font-mono outline-none focus:border-[#F97316]"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-xs text-gray-700 block mb-1">Site Delivery Address *</label>
                        <textarea
                          rows={2}
                          required
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-300 text-xs outline-none focus:border-[#F97316]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-xs text-gray-700 block mb-1.5">Choose Payment Option</label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setPaymentChoice('Pay Later')}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            paymentChoice === 'Pay Later'
                              ? 'bg-[#111111] text-white border-[#111111]'
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200'
                          }`}
                        >
                          <div className="font-heading font-black text-xs flex items-center gap-1.5">
                            <FileText size={14} className="text-[#F97316]" /> Option 1: Pay Later
                          </div>
                          <p className="text-[10px] opacity-80 mt-1">Submit enquiry first. Pay after admin approves quote.</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentChoice('Pay Advance Online')}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            paymentChoice === 'Pay Advance Online'
                              ? 'bg-[#111111] text-white border-[#111111]'
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200'
                          }`}
                        >
                          <div className="font-heading font-black text-xs flex items-center gap-1.5">
                            <CreditCard size={14} className="text-green-500" /> Option 2: Pay Advance Online
                          </div>
                          <p className="text-[10px] opacity-80 mt-1">
                            Pay 25% Advance (₹{Math.round((currentPrice * orderQuantity) * 0.25).toLocaleString('en-IN')}) via Razorpay.
                          </p>
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-100 p-3 rounded-2xl flex items-center justify-between text-xs font-mono">
                      <span>Total Estimated Price:</span>
                      <strong className="text-base text-[#F97316] font-black">₹{(currentPrice * orderQuantity).toLocaleString('en-IN')}</strong>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEnquiryStep(2)}
                        className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-3 rounded-xl"
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-2/3 bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                        ) : paymentChoice === 'Pay Advance Online' ? (
                          <>Pay 25% Advance & Submit Enquiry →</>
                        ) : (
                          <>Submit Fabrication Enquiry →</>
                        )}
                      </button>
                    </div>
                  </div>
                )}

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

