import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useOrders } from '../../context/OrderContext';
import { Product, PaymentTransaction, Order } from '../../types';
import { AdminPOSReceiptModal } from '../../components/common/AdminPOSReceiptModal';
import { generateRazorpayQRData, createRazorpayPaymentLink } from '../../services/razorpayService';
import {
  Zap,
  User,
  Search,
  Plus,
  Minus,
  Trash2,
  Banknote,
  QrCode,
  CreditCard,
  MessageCircle,
  CheckCircle2,
  Printer,
  Sparkles,
  ShoppingBag,
  RefreshCw,
  Barcode,
  Layers,
  ArrowRight,
} from 'lucide-react';


export const AdminQuickOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { products } = useProducts();
  const { createOfflineOrder } = useOrders();

  // Customer search & entry (optional)
  const [customerPhone, setCustomerPhone] = useState('9876543210');
  const [customerName, setCustomerName] = useState('Walk-in Counter Customer');
  const [customerAddress, setCustomerAddress] = useState('Kallimandhayam Counter');

  // Product Catalog Search & Category Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Cart State
  const [cart, setCart] = useState<
    Array<{
      product: Product;
      quantity: number;
      variantSize: string;
      unitPrice: number;
    }>
  >([]);

  // Instant Discount
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Payment Selection: Cash, Dynamic QR, Manual UPI
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Razorpay'>('Cash');
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [utrNumber, setUtrNumber] = useState<string>('');

  // POS Submission & Receipt Modal
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Categories list
  const categories = [
    'ALL',
    'Lathe Machine',
    'Cultivator',
    'Plough',
    'Tractor Parts',
    'Fittings',
    'Hardware',
    'Ready Stock',
  ];

  // Filter Products Grid
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.id && p.id.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Cart operations
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          variantSize: product.variants?.[0]?.name || 'Standard',

          unitPrice: product.variants?.[0]?.price || product.price,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as typeof cart
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const grandTotal = Math.max(0, subtotal - discountAmount);

  // Cash Return Calculator
  const actualCashReceived = cashReceived > 0 ? cashReceived : grandTotal;
  const balanceReturn = Math.max(0, actualCashReceived - grandTotal);

  // QR Code payload matching POS Grand Total
  const qrData = generateRazorpayQRData(
    grandTotal,
    `POS-${Date.now().toString().slice(-4)}`,
    customerName
  );

  // Handle Instant POS Checkout
  const handleGeneratePOSBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Please add at least 1 product to the cart before generating POS bill.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems = cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        image: (item.product.images && item.product.images[0]) || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80',

        variant: {
          size: item.variantSize,
          price: item.unitPrice,
        },
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.unitPrice * item.quantity,
      }));

      // Instant 100% full payment for POS Ready-made sale
      const newOrder = await createOfflineOrder(
        customerName || 'Walk-in Counter Customer',
        customerPhone || '9876543210',
        customerAddress || 'Kallimandhayam Counter',
        orderItems,
        subtotal,
        discountAmount,
        grandTotal, // Full 100% advance paid for POS sale
        paymentMode as PaymentTransaction['mode'],
        'Counter Billing Staff',
        new Date().toISOString().split('T')[0],
        {
          notes: `POS Counter Bill | Cash Recd: ₹${actualCashReceived} | Change: ₹${balanceReturn}`,
        }
      );

      setCreatedOrder(newOrder);
      setShowReceiptModal(true);
    } catch (err) {
      console.error('POS Bill generation error:', err);
      alert('Failed generating POS bill.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] font-sans">
      
      {/* POS Top Header */}
      <div className="bg-[#111111] text-white p-4 shadow-lg border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#F97316] rounded-xl text-white font-black shadow-md">
              <Zap size={20} />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#F97316] font-bold uppercase tracking-widest block">
                INSTANT COUNTER BILLING (30-60 SECONDS)
              </span>
              <h1 className="font-heading font-black text-xl text-white mt-0.5">
                QUICK ORDER (POS) SOFTWARE
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin/offline-orders/today')}
              className="bg-white/10 hover:bg-white/20 text-white font-heading font-bold text-xs px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-1.5 cursor-pointer"
            >
              Today's POS Sales

            </button>
          </div>
        </div>
      </div>

      {/* 2-PANEL POS SOFTWARE MAIN INTERFACE */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT PANEL (COL-SPAN-7): PRODUCT CATALOG GRID */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Search & Barcode Bar */}
            <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <div className="relative">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Product Name, Category, SKU or scan Barcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 hover:bg-white focus:bg-white text-xs p-3 pl-10 rounded-xl border border-gray-300 font-medium text-gray-900 outline-none focus:border-[#F97316] transition-colors"
                />
                <Barcode size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#F97316]" />
              </div>

              {/* Category Pills Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-heading">
                {categories.map((cat) => {
                  const active = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all cursor-pointer ${
                        active
                          ? 'bg-[#111111] text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredProducts.map((product) => {
                const inCart = cart.find((i) => i.product.id === product.id);
                return (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className={`bg-white rounded-2xl border p-3.5 space-y-2 font-sans transition-all cursor-pointer group flex flex-col justify-between relative ${
                      inCart
                        ? 'border-[#F97316] bg-orange-50/20 shadow-md ring-2 ring-[#F97316]/20'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-xs'
                    }`}
                  >
                    {inCart && (
                      <span className="absolute top-2 right-2 bg-[#F97316] text-white text-[10px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                        {inCart.quantity}
                      </span>
                    )}

                    <img
                      src={(product.images && product.images[0]) || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80'}
                      alt={product.name}
                      className="w-full h-28 rounded-xl object-cover border border-gray-100 group-hover:scale-102 transition-transform"
                    />


                    <div>
                      <span className="text-[9px] font-mono text-gray-400 font-bold uppercase block">
                        {product.category}
                      </span>
                      <h4 className="font-heading font-bold text-xs text-[#111111] line-clamp-1 mt-0.5">
                        {product.name}
                      </h4>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold block mt-0.5">
                        In Stock: 15 pcs
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                      <strong className="font-mono text-sm text-[#111111]">
                        ₹{product.price.toLocaleString('en-IN')}
                      </strong>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className="bg-[#111111] group-hover:bg-[#F97316] text-white p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Add to POS Cart"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* RIGHT PANEL (COL-SPAN-5): POS COUNTER CHECKOUT */}
          <div className="lg:col-span-5 space-y-4">
            
            <form onSubmit={handleGeneratePOSBill} className="bg-white p-5 rounded-[24px] border border-gray-200 shadow-xl space-y-4 font-sans">
              
              {/* Customer Lookup Header */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-gray-500 font-bold uppercase flex items-center gap-1">
                    <User size={13} className="text-[#F97316]" /> Walk-in Customer Info
                  </span>
                  <span className="text-[9px] font-mono text-emerald-700 font-bold">Counter Sale</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="bg-white p-2 rounded-lg border border-gray-300 font-medium text-xs outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="bg-white p-2 rounded-lg border border-gray-300 font-mono text-xs outline-none"
                  />
                </div>
              </div>

              {/* POS Cart Items List */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-heading font-black text-xs text-[#111111] uppercase tracking-wider">
                    CART ITEMS ({cart.length})
                  </h3>
                  {cart.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCart([])}
                      className="text-[10px] text-red-600 hover:underline font-bold"
                    >
                      Clear Cart
                    </button>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-gray-400 space-y-1">
                    <ShoppingBag size={28} className="mx-auto text-gray-300" />
                    <p className="text-xs font-bold">POS Cart is Empty</p>
                    <p className="text-[10px]">Click products on the left to add items.</p>
                  </div>
                ) : (
                  <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 pr-1 border rounded-xl">
                    {cart.map((item) => (
                      <div key={item.product.id} className="p-2.5 flex items-center justify-between gap-2 text-xs">
                        <div className="truncate flex-1">
                          <strong className="font-heading font-bold text-gray-900 block truncate">
                            {item.product.name}
                          </strong>
                          <span className="text-[10px] font-mono text-gray-500">₹{item.unitPrice} each</span>
                        </div>

                        {/* Qty Controls */}
                        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-lg">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="w-5 h-5 bg-white text-gray-700 rounded flex items-center justify-center font-bold"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="font-mono font-bold text-xs px-1">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="w-5 h-5 bg-white text-gray-700 rounded flex items-center justify-center font-bold"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <strong className="font-mono text-xs text-[#111111] min-w-[60px] text-right">
                          ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                        </strong>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Instant Discount Input */}
              <div className="flex items-center justify-between gap-2 text-xs font-mono">
                <label className="font-bold text-gray-700">Instant Discount (₹):</label>
                <input
                  type="number"
                  min="0"
                  max={subtotal}
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(parseInt(e.target.value) || 0)}
                  className="w-28 bg-gray-50 p-2 rounded-lg border border-gray-300 font-bold text-right outline-none focus:border-[#F97316]"
                />
              </div>

              {/* Grand Total Display */}
              <div className="p-4 bg-[#111111] text-white rounded-2xl shadow-md flex items-center justify-between font-mono">
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase">POS GRAND TOTAL</span>
                  <strong className="text-gray-400 text-xs line-through">
                    {discountAmount > 0 ? `₹${subtotal.toLocaleString('en-IN')}` : ''}
                  </strong>
                </div>
                <h2 className="font-heading font-black text-2xl text-[#F97316]">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </h2>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="font-bold text-xs text-gray-700 block">Choose Payment Method *</label>
                <div className="grid grid-cols-3 gap-2 text-xs font-heading">
                  {[
                    { id: 'Cash', title: '1. Cash', icon: Banknote },
                    { id: 'Razorpay', title: '2. Dynamic QR', icon: QrCode },
                    { id: 'LINK', title: '3. Pay Link (WA)', icon: MessageCircle },
                  ].map((m) => {
                    const Icon = m.icon;
                    const active = paymentMode === (m.id as any);
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setPaymentMode(m.id as any)}
                        className={`p-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                          active
                            ? 'bg-[#F97316] text-white border-[#F97316] shadow-sm'
                            : 'bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        <Icon size={14} />
                        <span>{m.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CASH PAYMENT RETURN CALCULATOR */}
              {paymentMode === 'Cash' && (
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-amber-900">Cash Received (₹):</label>
                    <input
                      type="number"
                      min={grandTotal}
                      value={cashReceived || grandTotal}
                      onChange={(e) => setCashReceived(parseInt(e.target.value) || 0)}
                      className="w-32 bg-white p-2 rounded-lg border border-amber-300 font-bold text-right text-black outline-none"
                    />
                  </div>

                  <div className="flex justify-between items-center text-sm font-black pt-1 border-t border-amber-200">
                    <span className="text-amber-900">Balance Return to Customer:</span>
                    <span className="text-emerald-700 font-heading">₹{balanceReturn.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              {/* DYNAMIC QR CODE DISPLAY */}
              {paymentMode === 'Razorpay' && (
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center gap-3 text-xs font-sans">
                  <img src={qrData.qrCodeUrl} alt="POS QR" className="w-20 h-20 rounded-lg border border-gray-300 shrink-0" />
                  <div>
                    <strong className="text-gray-900 font-heading block">Scan QR to pay ₹{grandTotal.toLocaleString('en-IN')}</strong>
                    <p className="text-[10px] text-gray-500">Supports GPay, PhonePe, Paytm, BHIM.</p>
                  </div>
                </div>
              )}

              {/* PAYMENT LINK (WHATSAPP) DISPLAY */}
              {(paymentMode as any) === 'LINK' && (() => {
                const linkPayload = createRazorpayPaymentLink(
                  `POS-${Date.now().toString().slice(-4)}`,
                  grandTotal,
                  customerName,
                  customerPhone
                );
                return (
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2 text-xs font-sans">
                    <div className="flex justify-between items-center border-b border-emerald-200 pb-2">
                      <span className="font-bold text-emerald-900 flex items-center gap-1">
                        <MessageCircle size={14} className="text-[#25D366]" /> Razorpay WhatsApp Link
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700">₹{grandTotal.toLocaleString('en-IN')}</span>
                    </div>

                    <p className="text-[11px] font-mono text-gray-600 truncate">{linkPayload.paymentLinkUrl}</p>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <a
                        href={linkPayload.whatsAppShareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <MessageCircle size={14} /> Send WhatsApp
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(linkPayload.paymentLinkUrl);
                          alert('Payment link copied!');
                        }}
                        className="py-2 bg-gray-800 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                );
              })()}


              {/* GENERATE POS BILL BUTTON */}
              <button
                type="submit"
                disabled={isSubmitting || cart.length === 0}
                className="w-full py-4 bg-[#111111] hover:bg-black disabled:opacity-50 text-white font-heading font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer"
              >
                <Zap size={18} className="text-[#F97316]" /> GENERATE POS BILL & PRINT RECEIPT (₹{grandTotal.toLocaleString('en-IN')})
              </button>

            </form>

          </div>

        </div>
      </div>

      {/* POS RECEIPT MODAL */}
      <AdminPOSReceiptModal
        order={createdOrder}
        cashReceived={actualCashReceived}
        balanceReturn={balanceReturn}
        isOpen={showReceiptModal}
        onClose={() => {
          setShowReceiptModal(false);
          setCart([]);
          setDiscountAmount(0);
          setCashReceived(0);
        }}
      />

    </div>
  );
};

export default AdminQuickOrderPage;
