import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useOrders } from '../../context/OrderContext';
import { Product, PaymentTransaction, Order } from '../../types';
import { AdminPOSReceiptModal } from '../../components/common/AdminPOSReceiptModal';
import { generateRazorpayQRData, createRazorpayPaymentLink } from '../../services/razorpayService';
import { fetchAllCustomerProfiles } from '../../services/supabaseService';
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
  Check,
  Printer,
  Sparkles,
  ShoppingBag,
  RefreshCw,
  Barcode,
  Layers,
  ArrowRight,
  UserPlus,
  Wrench,
  AlertTriangle,
  Send
} from 'lucide-react';

export const AdminQuickOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { products } = useProducts();
  const { createOfflineOrder } = useOrders();

  // Customer List for Lookup
  const [existingCustomers, setExistingCustomers] = useState<Array<{ name: string; phone: string; address?: string }>>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);

  // Selected Customer Details
  const [customerPhone, setCustomerPhone] = useState('9876543210');
  const [customerName, setCustomerName] = useState('Walk-in Counter Customer');
  const [customerAddress, setCustomerAddress] = useState('Kallimandhayam Counter');

  // New Customer Modal State
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  // Custom Work / Alteration Item Modal State
  const [showCustomWorkModal, setShowCustomWorkModal] = useState(false);
  const [customWorkName, setCustomWorkName] = useState('');
  const [customWorkPrice, setCustomWorkPrice] = useState<number>(500);

  // Unsaved Changes Navigation Guard Modal
  const [showUnsavedGuardModal, setShowUnsavedGuardModal] = useState(false);
  const [pendingNavigationPath, setPendingNavigationPath] = useState<string | null>(null);

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
      isCustomWork?: boolean;
    }>
  >([]);

  // Instant Discount
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Payment Selection: 3 Methods (Cash, UPI QR, Split Pay)
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Split'>('Cash');
  const [cashReceived, setCashReceived] = useState<number | ''>('');
  const [upiPaidAmount, setUpiPaidAmount] = useState<number | ''>('');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [isUpiSplitPaid, setIsUpiSplitPaid] = useState<boolean>(false);

  // POS Submission & Receipt Modal
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Fetch Existing Customers
  useEffect(() => {
    fetchAllCustomerProfiles().then((custs) => {
      if (custs && custs.length > 0) {
        setExistingCustomers(custs.map(c => ({ name: c.name, phone: c.phone, address: c.address })));
      }
    });
  }, []);

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

  // Filter Customers
  const filteredCustomers = existingCustomers.filter((c) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch)
  );

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

  const addCustomWorkToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customWorkName.trim()) {
      alert('Please enter a custom work name.');
      return;
    }
    const customProduct: Product = {
      id: `custom-${Date.now()}`,
      name: customWorkName.trim(),
      category: 'Custom Fabrication',
      price: customWorkPrice,
      unit: 'Job',
      stock: 999,
      isReadyStock: true,
      isMadeToOrder: false,
      rating: 5,
      reviewCount: 1,
      views: 1,
      images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80'],
      description: 'Custom lathe / alteration work',
      specifications: { material: 'Custom Work', warranty: 'Standard Workshop Guarantee', color: 'Steel', size: 'Custom' },
    };

    setCart((prev) => [
      ...prev,
      {
        product: customProduct,
        quantity: 1,
        variantSize: 'Custom Job',
        unitPrice: customWorkPrice,
        isCustomWork: true,
      },
    ]);

    setCustomWorkName('');
    setCustomWorkPrice(500);
    setShowCustomWorkModal(false);
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

  // Payment Breakdown Calculations
  const numCash = cashReceived === '' ? 0 : Number(cashReceived);
  const numUpi = upiPaidAmount === '' ? 0 : Number(upiPaidAmount);

  let advancePaid = grandTotal;
  let cashAmount = grandTotal;
  let upiAmount = 0;

  if (paymentMode === 'Cash') {
    const enteredCash = cashReceived === '' ? grandTotal : numCash;
    advancePaid = Math.min(grandTotal, Math.max(0, enteredCash));
    cashAmount = advancePaid;
  } else if (paymentMode === 'UPI') {
    const enteredUpi = upiPaidAmount === '' ? grandTotal : numUpi;
    advancePaid = Math.min(grandTotal, Math.max(0, enteredUpi));
    upiAmount = advancePaid;
  } else if (paymentMode === 'Split') {
    cashAmount = numCash;
    upiAmount = numUpi;
    advancePaid = Math.min(grandTotal, cashAmount + upiAmount);
  }

  const balanceDue = Math.max(0, grandTotal - advancePaid);
  const actualCashReceived = paymentMode === 'Cash' ? (cashReceived === '' ? grandTotal : numCash) : grandTotal;
  const balanceReturn = paymentMode === 'Cash' ? Math.max(0, actualCashReceived - grandTotal) : 0;

  const qrData = generateRazorpayQRData(
    paymentMode === 'Split' ? (numUpi || grandTotal) : grandTotal,
    `POS-${Date.now().toString().slice(-4)}`,
    customerName
  );

  const handleProtectedNavigate = (targetPath: string) => {
    if (cart.length > 0) {
      setPendingNavigationPath(targetPath);
      setShowUnsavedGuardModal(true);
    } else {
      navigate(targetPath);
    }
  };

  // Save POS Bill
  const handleGeneratePOSBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Please add at least 1 product or custom work item before generating POS bill.');
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
        isPosItem: true,
      }));

      const payModeString = paymentMode === 'Split' ? 'Split (Cash+UPI)' : paymentMode;

      const newOrder = await createOfflineOrder(
        customerName || 'Walk-in Counter Customer',
        customerPhone || '9876543210',
        customerAddress || 'Kallimandhayam Counter',
        orderItems,
        subtotal,
        discountAmount,
        advancePaid,
        payModeString as any,
        'Counter Billing Staff',
        new Date().toISOString().split('T')[0],
        {
          notes: `POS Counter Bill | Payment Mode: ${payModeString} | Recd: ₹${advancePaid} | Balance: ₹${balanceDue}`,
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
      
      {/* POS Top Header Banner */}
      <div className="bg-[#111111] text-white py-6 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F97316] text-white flex items-center justify-center font-bold shadow-md">
              <Zap size={22} />
            </div>
            <div>
              <span className="text-[#F97316] font-mono text-[10px] font-bold uppercase tracking-widest block">
                INSTANT COUNTER BILLING (30-60 SECONDS)
              </span>
              <h1 className="font-heading font-black text-xl text-white mt-0.5">
                QUICK ORDER (POS) SOFTWARE
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCustomWorkModal(true)}
              className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Wrench size={15} /> + Custom Work / Alteration
            </button>

            <button
              onClick={() => handleProtectedNavigate('/admin/offline-orders/today')}
              className="bg-white/10 hover:bg-white/20 text-white font-heading font-bold text-xs px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-1.5 cursor-pointer"
            >
              Today's Offline Orders
            </button>
          </div>
        </div>
      </div>

      {/* 2-PANEL POS SOFTWARE MAIN INTERFACE */}
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT PANEL: PRODUCT CATALOG GRID */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Search & Barcode Bar */}
            <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
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

                <button
                  onClick={() => setShowCustomWorkModal(true)}
                  className="bg-gray-900 hover:bg-black text-white font-heading font-black text-xs px-3.5 py-3 rounded-xl flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Wrench size={14} className="text-[#F97316]" /> + Custom Work
                </button>
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
                      {product.stock > 0 && product.stock <= 5 ? (
                        <span className="text-[10px] font-mono text-red-600 font-bold block mt-0.5 animate-pulse">
                          ⚠️ Low Stock: Only {product.stock} left!
                        </span>
                      ) : product.stock > 5 ? (
                        <span className="text-[10px] font-mono text-emerald-700 font-bold block mt-0.5">
                          Stock: {product.stock} units ready ✓
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-orange-600 font-bold block mt-0.5">
                          Custom Made to Order
                        </span>
                      )}
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

          {/* RIGHT PANEL: POS COUNTER CHECKOUT */}
          <div className="lg:col-span-5 space-y-4">
            
            <form onSubmit={handleGeneratePOSBill} className="bg-white p-5 rounded-[24px] border border-gray-200 shadow-xl space-y-4 font-sans">
              
              {/* Customer Directory Search & Select */}
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2.5 text-xs relative">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-gray-500 font-bold uppercase flex items-center gap-1">
                    <User size={13} className="text-[#F97316]" /> Customer Details
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowNewCustomerModal(true)}
                    className="text-[10px] font-heading font-bold text-[#F97316] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus size={12} /> + Add New Customer
                  </button>
                </div>

                {/* Customer Directory Search Bar */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search existing customer by Name or Phone..."
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => setShowCustomerDropdown(true)}
                    className="w-full bg-white p-2 pl-9 rounded-xl border border-gray-300 font-medium text-xs outline-none"
                  />

                  {/* Dropdown list */}
                  {showCustomerDropdown && filteredCustomers.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-20 max-h-40 overflow-y-auto divide-y divide-gray-100">
                      {filteredCustomers.map((c, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            setCustomerName(c.name);
                            setCustomerPhone(c.phone);
                            setCustomerAddress(c.address || 'Kallimandhayam Counter');
                            setShowCustomerDropdown(false);
                            setCustomerSearch('');
                          }}
                          className="p-2 hover:bg-orange-50 cursor-pointer text-xs flex justify-between items-center"
                        >
                          <span className="font-bold text-gray-900">{c.name}</span>
                          <span className="font-mono text-gray-500 text-[11px]">{c.phone}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Auto-filled Selected Customer Inputs */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Customer Name *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="bg-white p-2 rounded-xl border border-gray-300 font-medium text-xs outline-none focus:border-[#F97316]"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Mobile Number *"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="bg-white p-2 rounded-xl border border-gray-300 font-mono text-xs outline-none focus:border-[#F97316]"
                    required
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
                    <p className="text-[10px]">Click products on the left or + Custom Work to add items.</p>
                  </div>
                ) : (
                  <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 pr-1 border rounded-xl">
                    {cart.map((item) => (
                      <div key={item.product.id} className="p-2.5 flex items-center justify-between gap-2 text-xs">
                        <div className="truncate flex-1">
                          <strong className="font-heading font-bold text-gray-900 block truncate flex items-center gap-1">
                            {item.isCustomWork && <Wrench size={12} className="text-[#F97316] shrink-0" />}
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

              {/* Payment Method Selector (3 Methods) */}
              <div className="space-y-2">
                <label className="font-bold text-xs text-gray-700 block">Choose Payment Method *</label>
                <div className="grid grid-cols-3 gap-2 text-xs font-heading">
                  {[
                    { id: 'Cash', title: 'Cash', icon: Banknote },
                    { id: 'UPI', title: 'UPI QR', icon: QrCode },
                    { id: 'Split', title: 'Split Pay', icon: Layers },
                  ].map((m) => {
                    const Icon = m.icon;
                    const active = paymentMode === (m.id as any);
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setPaymentMode(m.id as any)}
                        className={`p-2.5 rounded-xl font-bold flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer text-xs ${
                          active
                            ? 'bg-[#F97316] text-white border-[#F97316] shadow-sm'
                            : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        <Icon size={16} />
                        <span>{m.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CASH PAYMENT CALCULATOR & PARTIAL BALANCE */}
              {paymentMode === 'Cash' && (
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-amber-900">Cash Received / Paid Amount (₹):</label>
                    <input
                      type="number"
                      min="0"
                      placeholder={grandTotal.toString()}
                      value={cashReceived}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setCashReceived('');
                        } else {
                          const num = parseFloat(val);
                          setCashReceived(isNaN(num) ? '' : num);
                        }
                      }}
                      className="w-36 bg-white p-2 rounded-xl border border-amber-300 font-bold text-right text-black outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-amber-400 transition-all"
                    />
                  </div>

                  {balanceDue > 0 ? (
                    <div className="flex justify-between items-center text-xs font-black pt-1 border-t border-amber-200">
                      <span className="text-amber-900">Remaining Balance Due:</span>
                      <span className="text-red-600 font-heading">₹{balanceDue.toLocaleString('en-IN')} (Payable Later)</span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-xs font-black pt-1 border-t border-amber-200">
                      <span className="text-amber-900">Change Return to Customer:</span>
                      <span className="text-emerald-700 font-heading">₹{balanceReturn.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
              )}

              {/* UPI DYNAMIC QR CODE & PARTIAL BALANCE */}
              {paymentMode === 'UPI' && (
                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3.5 text-xs font-sans">
                  <div className="flex items-center gap-3">
                    <img src={qrData.qrCodeUrl} alt="POS QR" className="w-20 h-20 rounded-lg border border-gray-300 shrink-0" />
                    <div>
                      <strong className="text-gray-900 font-heading block">Scan QR to pay ₹{grandTotal.toLocaleString('en-IN')}</strong>
                      <p className="text-[10px] text-gray-500">Supports GPay, PhonePe, Paytm, BHIM.</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center font-mono">
                    <label className="font-bold text-gray-800">UPI Amount Paid (₹):</label>
                    <input
                      type="number"
                      min="0"
                      placeholder={grandTotal.toString()}
                      value={upiPaidAmount}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setUpiPaidAmount('');
                        } else {
                          const num = parseFloat(val);
                          setUpiPaidAmount(isNaN(num) ? '' : num);
                        }
                      }}
                      className="w-36 bg-white p-2 rounded-xl border border-gray-300 font-bold text-right text-black outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:ring-2 focus:ring-gray-400 transition-all"
                    />
                  </div>

                  {balanceDue > 0 && (
                    <div className="flex justify-between items-center text-xs font-mono font-black pt-2 border-t border-gray-200">
                      <span className="text-gray-700">Remaining Balance Due:</span>
                      <span className="text-red-600 font-heading">₹{balanceDue.toLocaleString('en-IN')} (Payable Later)</span>
                    </div>
                  )}

                  <input
                    type="text"
                    placeholder="Enter UTR / Transaction Ref No (Optional)"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className="w-full bg-white p-2 rounded-xl border border-gray-300 font-mono text-xs"
                  />
                </div>
              )}

              {/* SPLIT PAYMENT (CASH + UPI) WITH DYNAMIC QR SCANNER & MARK AS PAID */}
              {paymentMode === 'Split' && (
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50/80 rounded-2xl border border-blue-200 space-y-3 font-sans text-xs shadow-xs">
                  <div className="flex items-center justify-between border-b border-blue-200/80 pb-2">
                    <span className="font-heading font-black text-xs text-blue-950 flex items-center gap-1.5">
                      <Layers size={15} className="text-[#F97316]" /> SPLIT PAYMENT (CASH + UPI)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const remaining = Math.max(0, grandTotal - numCash);
                        setUpiPaidAmount(remaining);
                        setIsUpiSplitPaid(false);
                      }}
                      className="text-[10px] font-mono font-bold bg-white text-blue-800 hover:bg-blue-100 border border-blue-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                      ⚡ Auto-Fill Remaining UPI: ₹{Math.max(0, grandTotal - numCash).toLocaleString('en-IN')}
                    </button>
                  </div>

                  {/* Cash & UPI Input Row */}
                  <div className="grid grid-cols-2 gap-3 font-mono">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-800 text-[11px] block">1. Cash Amount (₹):</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={cashReceived}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            setCashReceived('');
                          } else {
                            const num = parseFloat(val);
                            setCashReceived(isNaN(num) ? '' : num);
                          }
                        }}
                        className="w-full bg-white p-2.5 rounded-xl border border-blue-300 font-bold text-right text-gray-900 outline-none focus:border-[#F97316] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-blue-900 text-[11px] block">2. UPI Amount (₹):</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={upiPaidAmount}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const val = e.target.value;
                          setIsUpiSplitPaid(false);
                          if (val === '') {
                            setUpiPaidAmount('');
                          } else {
                            const num = parseFloat(val);
                            setUpiPaidAmount(isNaN(num) ? '' : num);
                          }
                        }}
                        className="w-full bg-white p-2.5 rounded-xl border border-blue-300 font-bold text-right text-blue-900 outline-none focus:border-blue-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>

                  {/* UPI QR SCANNER FOR SPLIT AMOUNT */}
                  {numUpi > 0 && (
                    <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-xs space-y-3 mt-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={qrData.qrCodeUrl}
                          alt="Split UPI QR"
                          className="w-24 h-24 rounded-xl border-2 border-blue-300 shrink-0 p-1 bg-white shadow-xs"
                        />
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-blue-700 uppercase tracking-wide">
                              SCAN TO PAY UPI PORTION
                            </span>
                            <span className="bg-blue-100 text-blue-900 text-[10px] font-mono font-black px-2 py-0.5 rounded-full">
                              ₹{numUpi.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <h4 className="font-heading font-black text-xs text-[#111111] truncate">
                            Scan with GPay / PhonePe / Paytm
                          </h4>
                          <p className="text-[10px] text-gray-500 font-mono">
                            UPI ID: <span className="font-bold text-gray-800">9659286268@okbizaxis</span>
                          </p>

                          {/* Click as Paid Button */}
                          <button
                            type="button"
                            onClick={() => setIsUpiSplitPaid(!isUpiSplitPaid)}
                            className={`w-full py-2 px-3 rounded-xl font-heading font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                              isUpiSplitPaid
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-[#111111] hover:bg-gray-800 text-white'
                            }`}
                          >
                            {isUpiSplitPaid ? (
                              <>
                                <CheckCircle2 size={14} className="text-white" /> UPI ₹{numUpi.toLocaleString('en-IN')} Verified & Paid ✓
                              </>
                            ) : (
                              <>
                                <Check size={14} className="text-emerald-400" /> Click as Paid (Confirm UPI Payment)
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Optional UTR / Ref No field */}
                      <input
                        type="text"
                        placeholder="Enter UTR / UPI Transaction Ref No (Optional)"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        className="w-full bg-gray-50 p-2 rounded-lg border border-gray-300 font-mono text-xs outline-none focus:border-blue-600"
                      />
                    </div>
                  )}

                  {/* Summary Footer */}
                  <div className="flex justify-between items-center text-xs font-mono font-bold pt-2 border-t border-blue-200">
                    <span className="text-gray-700">Total Collected: ₹{(numCash + numUpi).toLocaleString('en-IN')}</span>
                    <span className={balanceDue > 0 ? 'text-red-600 font-black' : 'text-emerald-700 font-black'}>
                      {balanceDue > 0 ? `Remaining Due: ₹${balanceDue.toLocaleString('en-IN')}` : '✓ Fully Paid'}
                    </span>
                  </div>
                </div>
              )}

              {/* GENERATE POS BILL BUTTON */}
              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full py-4 bg-[#111111] hover:bg-black disabled:opacity-50 text-white font-heading font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer"
                >
                  <Zap size={18} className="text-[#F97316]" /> GENERATE POS BILL & PRINT RECEIPT (₹{grandTotal.toLocaleString('en-IN')})
                </button>

                {createdOrder && (
                  <button
                    type="button"
                    onClick={() => {
                      const cleanPhone = createdOrder.customerPhone.replace(/\D/g, '').slice(-10);
                      const baseUrl = window.location.origin;
                      const msg = `🧾 *MANIKANDAN LATHE*\n\nHello ${createdOrder.customerName},\nThank you for choosing MANIKANDAN LATHE.\n\n*Order No:* #${createdOrder.orderNumber}\n*Amount Paid:* ₹${createdOrder.finalPrice.toLocaleString('en-IN')}\n\n📄 *Tax Invoice:* ${baseUrl}/invoice/${createdOrder.id}\n🧾 *Thermal Receipt:* ${baseUrl}/r/${createdOrder.id}\n\n📞 +91 96592 86268`;
                      window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="w-full py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-heading font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <MessageCircle size={16} /> 📲 Send Invoice & Receipt on WhatsApp (+91 {createdOrder.customerPhone})
                  </button>
                )}
              </div>

            </form>

          </div>

        </div>
      </div>

      {/* NEW CUSTOMER MODAL */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 font-sans shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-heading font-black text-base text-[#111111] flex items-center gap-2">
                <UserPlus size={18} className="text-[#F97316]" /> Add New Customer
              </h3>
              <button onClick={() => setShowNewCustomerModal(false)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Manikandan P"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  placeholder="e.g. 9842188412"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Full Address / Location</label>
                <textarea
                  placeholder="e.g. Kallimandhayam Main Road"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 font-medium h-20"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowNewCustomerModal(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newCustName || !newCustPhone) {
                    alert('Please enter both name and mobile number.');
                    return;
                  }
                  setCustomerName(newCustName);
                  setCustomerPhone(newCustPhone);
                  setCustomerAddress(newCustAddress || 'Kallimandhayam Counter');
                  setShowNewCustomerModal(false);
                  setNewCustName('');
                  setNewCustPhone('');
                  setNewCustAddress('');
                }}
                className="flex-1 py-2.5 bg-[#F97316] text-white font-bold text-xs rounded-xl shadow-md"
              >
                Save & Select Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM WORK / ALTERATION MODAL */}
      {showCustomWorkModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={addCustomWorkToCart} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 font-sans shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-heading font-black text-base text-[#111111] flex items-center gap-2">
                <Wrench size={18} className="text-[#F97316]" /> Add Custom Work / Alteration Item
              </h3>
              <button type="button" onClick={() => setShowCustomWorkModal(false)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Work / Job Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Lathe Shaft Repair / Welding Work / Fitting Charge"
                  value={customWorkName}
                  onChange={(e) => setCustomWorkName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Price / Work Charge (₹) *</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 500"
                  value={customWorkPrice}
                  onChange={(e) => setCustomWorkPrice(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 font-mono font-bold text-sm"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCustomWorkModal(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#F97316] text-white font-bold text-xs rounded-xl shadow-md"
              >
                Add to Cart
              </button>
            </div>
          </form>
        </div>
      )}

      {/* UNSAVED CHANGES GUARD MODAL */}
      {showUnsavedGuardModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 font-sans shadow-2xl text-center">
            <AlertTriangle size={40} className="mx-auto text-amber-500" />
            <div className="space-y-1">
              <h3 className="font-heading font-black text-lg text-[#111111]">Unsaved POS Bill</h3>
              <p className="text-xs text-gray-600">
                You have active items in your POS cart. Leaving will discard the current unsaved counter bill.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => setShowUnsavedGuardModal(false)}
                className="py-2.5 bg-[#F97316] text-white font-heading font-black text-xs rounded-xl shadow-md"
              >
                Continue Editing Current Bill
              </button>
              <button
                onClick={() => {
                  setCart([]);
                  setShowUnsavedGuardModal(false);
                  if (pendingNavigationPath) navigate(pendingNavigationPath);
                }}
                className="py-2.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 font-bold text-xs rounded-xl"
              >
                Discard & Leave Page
              </button>
            </div>
          </div>
        </div>
      )}

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

