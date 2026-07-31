import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { useProducts } from '../../context/ProductContext';
import { PDFInvoiceModal } from '../../components/common/PDFInvoiceModal';
import { Order, OrderItem, CustomerUser, DeliveryDetails, PaymentTransaction } from '../../types';
import { fetchAllCustomerProfiles, upsertCustomerProfile } from '../../services/supabaseService';
import { createDeliveryWhatsAppMessage } from '../../services/whatsappService';
import {
  UserCheck,
  Search,
  PlusCircle,
  Phone,
  Mail,
  MapPin,
  Package,
  Ruler,
  IndianRupee,
  CreditCard,
  Truck,
  CheckCircle2,
  Printer,
  ChevronRight,
  ChevronLeft,
  X,
  FileText,
  Shield,
  MessageCircle,
  AlertCircle,
  Plus,
  Minus,
  Upload,
  Calendar,
  Clock,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

interface SelectedProductCartItem {
  productId: string;
  productName: string;
  image: string;
  unitPrice: number;
  quantity: number;
  stock: number;
  sku: string;
  category: string;

  // Customization
  material: string;
  color: string;
  size: string;
  finish: string;
  thickness: string;
  length: string;
  width: string;
  height: string;
  customMeasurements: string;
  drawingUrl: string;
  referenceNotes: string;
}

export const AdminOfflineOrderPage: React.FC = () => {
  const { createOfflineOrder, orders } = useOrders();
  const { products } = useProducts();
  const navigate = useNavigate();

  // Wizard Step Control (1: Customer -> 2: Products -> 3: Customization -> 4: Price -> 5: Payment -> 6: Delivery -> 7: Confirm)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // STEP 1: CUSTOMER SELECTION / CREATION
  const [dbCustomers, setDbCustomers] = useState<CustomerUser[]>([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerUser | null>(null);
  const [isCreatingNewCustomer, setIsCreatingNewCustomer] = useState(false);

  // New Customer Form State
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAltPhone, setCustAltPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custVillage, setCustVillage] = useState('Kallimandhayam');
  const [custCity, setCustCity] = useState('Oddanchatram');
  const [custDistrict, setCustDistrict] = useState('Dindigul');
  const [custState, setCustState] = useState('Tamil Nadu');
  const [custPincode, setCustPincode] = useState('624616');
  const [custType, setCustType] = useState<'Online' | 'Offline Walk-in' | 'VIP'>('Offline Walk-in');

  // STEP 2: PRODUCT SELECTION & CART
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [cartItems, setCartItems] = useState<SelectedProductCartItem[]>([]);

  // STEP 4: PRICE BREAKDOWN & CALCULATIONS
  const [labourCharge, setLabourCharge] = useState<number>(0);
  const [fabricationCharge, setFabricationCharge] = useState<number>(0);
  const [installationCharge, setInstallationCharge] = useState<number>(0);
  const [transportCharge, setTransportCharge] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [gstPercentage, setGstPercentage] = useState<number>(0); // 0 or 18%

  // STEP 5: PAYMENT DETAILS
  const [paymentMode, setPaymentMode] = useState<PaymentTransaction['mode']>('Cash');
  const [advancePaidAmount, setAdvancePaidAmount] = useState<number>(1000);
  const [collectedBy, setCollectedBy] = useState<string>('Chellamuthu K (Admin)');
  const [paymentRefId, setPaymentRefId] = useState<string>('');

  // STEP 6: DELIVERY & WORKER ASSIGNMENT
  const [deliveryType, setDeliveryType] = useState<'Pickup' | 'Home Delivery' | 'Installation'>('Home Delivery');
  const [expectedDate, setExpectedDate] = useState<string>(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [assignedWorker, setAssignedWorker] = useState<string>('Chellamuthu K (Master Machinist)');
  const [vehicleNumber, setVehicleNumber] = useState<string>('TN-57-AB-1234');
  const [deliveryNotes, setDeliveryNotes] = useState<string>('Handle with care. Heavy lathe forged item.');

  // GENERATED ORDER & INVOICE MODAL
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Load Customer Directory
  useEffect(() => {
    const loadData = async () => {
      try {
        const fetched = await fetchAllCustomerProfiles();
        setDbCustomers(fetched);
      } catch (err) {
        console.error('Failed loading customer profiles:', err);
      }
    };
    loadData();
  }, []);

  // Filtered customer list for Step 1
  const filteredCustomers = dbCustomers.filter((c) =>
    c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    c.phone.includes(customerSearchTerm) ||
    (c.district && c.district.toLowerCase().includes(customerSearchTerm.toLowerCase()))
  );

  // Filtered product list for Step 2
  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Cart operations
  const handleAddToCart = (prod: typeof products[0]) => {
    const exists = cartItems.find((item) => item.productId === prod.id);
    if (exists) {
      setCartItems(
        cartItems.map((item) =>
          item.productId === prod.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          productId: prod.id,
          productName: prod.name,
          image: prod.images[0] || '',
          unitPrice: prod.discountPrice || prod.price,
          quantity: 1,
          stock: prod.stock,
          sku: prod.sku || `SKU-${prod.id}`,
          category: prod.category,
          material: prod.specifications?.material || 'High Tensile Steel',
          color: prod.specifications?.color || 'Safety Orange / Black',
          size: prod.specifications?.size || 'Standard Fit',
          finish: prod.specifications?.finish || 'Powder Coated',
          thickness: prod.specifications?.thickness || '12mm Solid Bar',
          length: '7 ft',
          width: '4 ft',
          height: '4 ft',
          customMeasurements: 'Standard Factory Specifications',
          drawingUrl: '',
          referenceNotes: '',
        },
      ]);
    }
  };

  const handleUpdateItemQuantity = (productId: string, delta: number) => {
    setCartItems(
      cartItems
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as SelectedProductCartItem[]
    );
  };

  const handleUpdateItemCustomization = (
    productId: string,
    field: keyof SelectedProductCartItem,
    val: string | number
  ) => {
    setCartItems(
      cartItems.map((item) => (item.productId === productId ? { ...item, [field]: val } : item))
    );
  };

  // Live Price Calculation
  const productsSubtotal = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const extraChargesSubtotal = labourCharge + fabricationCharge + installationCharge + transportCharge;
  const taxableAmount = Math.max(0, productsSubtotal + extraChargesSubtotal - discountAmount);
  const gstAmount = Math.round((taxableAmount * gstPercentage) / 100);
  const grandTotal = taxableAmount + gstAmount;
  const remainingBalanceDue = Math.max(0, grandTotal - advancePaidAmount);

  // Handle Select Customer
  const handleSelectCustomer = (cust: CustomerUser) => {
    setSelectedCustomer(cust);
    setCustName(cust.name);
    setCustPhone(cust.phone);
    setCustAddress(cust.address);
    setCustDistrict(cust.district || 'Dindigul');
    setIsCreatingNewCustomer(false);
  };

  // Handle Generate Order
  const handleGenerateOfflineOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalCustName = custName;
    let finalCustPhone = custPhone;
    let finalCustAddress = custAddress;

    if (!finalCustName || !finalCustPhone) {
      alert('Please select or provide customer name and mobile number.');
      setCurrentStep(1);
      return;
    }

    if (cartItems.length === 0) {
      alert('Please add at least one product to the order cart.');
      setCurrentStep(2);
      return;
    }

    // Combine village/city/pincode into full address if creating new
    if (isCreatingNewCustomer) {
      finalCustAddress = `${custAddress}, ${custVillage}, ${custCity}, ${custDistrict} - ${custPincode}, ${custState}`;
      
      // Auto-upsert new customer profile into Supabase
      try {
        await upsertCustomerProfile({
          name: finalCustName,
          phone: finalCustPhone,
          address: finalCustAddress,
          district: custDistrict,
          pincode: custPincode,
          customerType: custType,
          role: 'customer',
        });
      } catch (err) {
        console.error('Customer profile upsert error:', err);
      }
    }

    // Map order items
    const mappedItems: OrderItem[] = cartItems.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      image: item.image,
      variant: {
        material: item.material,
        color: item.color,
        size: item.size,
        finish: item.finish,
        thickness: item.thickness,
        length: item.length,
        width: item.width,
        height: item.height,
      },
      customMeasurements: item.customMeasurements,
      drawingUrl: item.drawingUrl,
      referenceNotes: item.referenceNotes,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.unitPrice * item.quantity,
    }));

    // Map delivery details
    const deliveryObj: DeliveryDetails = {
      personName: assignedWorker,
      mobileNumber: '+91 96592 86268',
      deliveryCharge: transportCharge,
      expectedDate: expectedDate,
      expectedTime: '04:00 PM',
      status: 'Assigned',
      vehicleNumber: vehicleNumber,
      deliveryType: deliveryType,
      specialNotes: deliveryNotes,
    };

    // Create Order in Supabase & Context
    const newOrder = await createOfflineOrder(
      finalCustName,
      finalCustPhone,
      finalCustAddress,
      mappedItems,
      productsSubtotal,
      discountAmount,
      advancePaidAmount,
      paymentMode,
      collectedBy,
      expectedDate,
      {
        labourCharge,
        fabricationCharge,
        installationCharge,
        transportCharge,
        gstAmount,
        finalPrice: grandTotal,
        deliveryDetails: deliveryObj,
        notes: deliveryNotes,
      }
    );

    setCreatedOrder(newOrder);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] pb-24 font-sans">
      
      {/* Admin ERP Top Header */}
      <div className="bg-[#111111] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[#F97316] font-heading font-extrabold text-xs uppercase tracking-widest flex items-center gap-1.5">
              <Shield size={16} /> SHOP COUNTER ERP • OFFLINE ORDER CREATION
            </span>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-white mt-1">
              OFFLINE WALK-IN ORDER WIZARD
            </h1>
            <p className="text-gray-400 text-xs mt-1">
              Direct walk-in shop billing with instant custom measurements, pricing breakdown, cash/UPI receipt & production queuing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-emerald-900/80 text-emerald-200 text-xs font-mono font-bold px-3 py-1.5 rounded-lg border border-emerald-700">
              🏪 SHOP WALK-IN COUNTER
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Step Progress Wizard Header */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs overflow-x-auto">
          <div className="flex items-center justify-between min-w-[700px]">
            {[
              { id: 1, title: 'Customer', icon: UserCheck },
              { id: 2, title: 'Products', icon: Package },
              { id: 3, title: 'Customization', icon: Ruler },
              { id: 4, title: 'Price Breakdown', icon: IndianRupee },
              { id: 5, title: 'Payment & Receipt', icon: CreditCard },
              { id: 6, title: 'Delivery & Worker', icon: Truck },
              { id: 7, title: 'Confirm & Invoice', icon: CheckCircle2 },
            ].map((step) => {
              const Icon = step.icon;
              const isPassed = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#F97316] text-white shadow-md'
                      : isPassed
                      ? 'bg-amber-50 text-amber-900 border border-amber-200'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] ${
                    isCurrent ? 'bg-white text-[#F97316]' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {step.id}
                  </span>
                  <span>{step.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 1: CUSTOMER INFORMATION */}
        {currentStep === 1 && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6 animate-in fade-in duration-150">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h2 className="font-heading font-black text-xl text-[#111111] flex items-center gap-2">
                  <UserCheck size={22} className="text-[#F97316]" /> STEP 1: CUSTOMER INFORMATION
                </h2>
                <p className="text-gray-500 text-xs mt-0.5">
                  Search existing customer by phone or name, or register a new walk-in buyer.
                </p>
              </div>

              <button
                onClick={() => {
                  setIsCreatingNewCustomer(!isCreatingNewCustomer);
                  setSelectedCustomer(null);
                }}
                className="bg-gray-100 hover:bg-gray-200 text-[#111111] font-bold text-xs px-3.5 py-2 rounded-xl border border-gray-300 transition-colors cursor-pointer"
              >
                {isCreatingNewCustomer ? '← Search Existing Customer' : '+ Create New Customer'}
              </button>
            </div>

            {!isCreatingNewCustomer ? (
              <div className="space-y-6">
                {/* Search Bar */}
                <div className="relative">
                  <Search size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search existing customer by phone (+91 98421...), name, or district..."
                    value={customerSearchTerm}
                    onChange={(e) => setCustomerSearchTerm(e.target.value)}
                    className="w-full bg-gray-50 hover:bg-white focus:bg-white pl-10 pr-4 py-3 rounded-xl border border-gray-300 outline-none text-xs font-medium text-gray-900 focus:border-[#F97316] transition-colors"
                  />
                </div>


                {/* Selected Customer Highlight Card */}
                {selectedCustomer && (
                  <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black font-heading text-lg">
                        {selectedCustomer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-heading font-black text-sm text-emerald-950">
                          SELECTED: {selectedCustomer.name}
                        </h4>
                        <p className="text-xs text-emerald-800 font-mono">
                          {selectedCustomer.phone} • {selectedCustomer.address}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
                    >
                      Change Customer
                    </button>
                  </div>
                )}

                {/* Customer Directory Table */}
                <div className="overflow-x-auto border rounded-xl">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="bg-[#111111] text-white font-heading font-extrabold uppercase text-[10px]">
                        <th className="p-3">Customer Name</th>
                        <th className="p-3">Phone</th>
                        <th className="p-3">Address / District</th>
                        <th className="p-3">Category</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredCustomers.map((cust) => (
                        <tr key={cust.id} className="hover:bg-amber-50/60 transition-colors">
                          <td className="p-3 font-bold text-[#111111]">{cust.name}</td>
                          <td className="p-3 font-mono font-semibold">{cust.phone}</td>
                          <td className="p-3 text-gray-600">{cust.address}</td>
                          <td className="p-3">
                            <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              {cust.customerType || 'Online'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleSelectCustomer(cust)}
                              className="bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs cursor-pointer"
                            >
                              Select Customer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-sans">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="e.g. Karuppusamy M"
                    className="w-full bg-gray-50 hover:bg-white focus:bg-white p-2.5 rounded-lg border border-gray-300 outline-none font-medium text-gray-900 focus:border-[#F97316] transition-colors"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="+91 94431 88900"
                    className="w-full bg-gray-50 hover:bg-white focus:bg-white p-2.5 rounded-lg border border-gray-300 outline-none font-mono font-medium text-gray-900 focus:border-[#F97316] transition-colors"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Alternative Phone (Optional)</label>
                  <input
                    type="tel"
                    value={custAltPhone}
                    onChange={(e) => setCustAltPhone(e.target.value)}
                    placeholder="+91 97865 43210"
                    className="w-full bg-gray-50 hover:bg-white focus:bg-white p-2.5 rounded-lg border border-gray-300 outline-none font-mono font-medium text-gray-900 focus:border-[#F97316] transition-colors"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    placeholder="customer@gmail.com"
                    className="w-full bg-gray-50 hover:bg-white focus:bg-white p-2.5 rounded-lg border border-gray-300 outline-none font-medium text-gray-900 focus:border-[#F97316] transition-colors"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Street Address</label>
                  <input
                    type="text"
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                    placeholder="Door No, Keeranur Road..."
                    className="w-full bg-gray-50 hover:bg-white focus:bg-white p-2.5 rounded-lg border border-gray-300 outline-none font-medium text-gray-900 focus:border-[#F97316] transition-colors"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Village / Area</label>
                  <input
                    type="text"
                    value={custVillage}
                    onChange={(e) => setCustVillage(e.target.value)}
                    placeholder="Kallimandhayam"
                    className="w-full bg-gray-50 hover:bg-white focus:bg-white p-2.5 rounded-lg border border-gray-300 outline-none font-medium text-gray-900 focus:border-[#F97316] transition-colors"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">City / Taluk</label>
                  <input
                    type="text"
                    value={custCity}
                    onChange={(e) => setCustCity(e.target.value)}
                    placeholder="Oddanchatram"
                    className="w-full bg-gray-50 hover:bg-white focus:bg-white p-2.5 rounded-lg border border-gray-300 outline-none font-medium text-gray-900 focus:border-[#F97316] transition-colors"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">District</label>
                  <input
                    type="text"
                    value={custDistrict}
                    onChange={(e) => setCustDistrict(e.target.value)}
                    placeholder="Dindigul"
                    className="w-full bg-gray-50 hover:bg-white focus:bg-white p-2.5 rounded-lg border border-gray-300 outline-none font-medium text-gray-900 focus:border-[#F97316] transition-colors"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Pincode</label>
                  <input
                    type="text"
                    value={custPincode}
                    onChange={(e) => setCustPincode(e.target.value)}
                    placeholder="624616"
                    className="w-full bg-gray-50 hover:bg-white focus:bg-white p-2.5 rounded-lg border border-gray-300 outline-none font-mono font-medium text-gray-900 focus:border-[#F97316] transition-colors"
                  />
                </div>
              </div>

            )}

            <div className="flex justify-end gap-2 border-t pt-4">
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!custName || !custPhone}
                className="bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-50 text-white font-heading font-black text-xs px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
              >
                Proceed to Product Selection <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PRODUCT SELECTION & CART */}
        {currentStep === 2 && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6 animate-in fade-in duration-150">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h2 className="font-heading font-black text-xl text-[#111111] flex items-center gap-2">
                  <Package size={22} className="text-[#F97316]" /> STEP 2: SELECT MACHINERY PRODUCTS
                </h2>
                <p className="text-gray-500 text-xs mt-0.5">
                  Pick tractor kalappai, SS gates, window grills, or custom lathe turned bushes.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="bg-[#F97316] text-white text-xs font-mono font-bold px-3 py-1.5 rounded-xl shadow-xs">
                  Cart Items: {cartItems.length}
                </span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative w-full sm:w-80">
                <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search product name, category..."
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  className="w-full bg-gray-100 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none text-xs font-bold focus:border-[#F97316]"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#111111] text-white border-[#111111]'
                        : 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredProducts.map((prod) => {
                const inCart = cartItems.find((ci) => ci.productId === prod.id);
                return (
                  <div key={prod.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col justify-between space-y-3">
                    <img
                      src={prod.images[0] || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=400&q=80'}
                      alt={prod.name}
                      className="w-full h-32 object-cover rounded-xl border border-gray-200"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-[#F97316] uppercase block">{prod.category}</span>
                      <h4 className="font-heading font-black text-xs text-[#111111] line-clamp-2 mt-0.5">{prod.name}</h4>
                      <div className="flex justify-between items-center mt-2">
                        <strong className="font-heading font-black text-sm text-[#111111]">
                          ₹{(prod.discountPrice || prod.price).toLocaleString('en-IN')}
                        </strong>
                        <span className="text-[10px] text-gray-500 font-mono">Stock: {prod.stock}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(prod)}
                      className={`w-full py-2 rounded-xl font-heading font-black text-xs transition-colors cursor-pointer ${
                        inCart
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-[#111111] hover:bg-[#F97316] text-white'
                      }`}
                    >
                      {inCart ? `Added (${inCart.quantity} in cart)` : '+ Add to Order'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Selected Items Preview */}
            {cartItems.length > 0 && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
                <h4 className="font-heading font-extrabold text-xs text-amber-900 uppercase tracking-wider">
                  SELECTED ORDER ITEMS ({cartItems.length})
                </h4>
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between bg-white p-3 rounded-xl border border-amber-200 text-xs font-sans">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.productName} className="w-10 h-10 object-cover rounded-lg" />
                        <div>
                          <strong className="font-bold block text-[#111111]">{item.productName}</strong>
                          <span className="text-gray-500 font-mono">₹{item.unitPrice.toLocaleString('en-IN')} each</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center border rounded-lg bg-gray-100">
                          <button
                            onClick={() => handleUpdateItemQuantity(item.productId, -1)}
                            className="p-1 text-gray-700 hover:bg-gray-200"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-3 font-mono font-bold">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateItemQuantity(item.productId, 1)}
                            className="p-1 text-gray-700 hover:bg-gray-200"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <strong className="font-heading font-black text-sm text-[#F97316] min-w-20 text-right">
                          ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between border-t pt-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={16} /> Back to Customer
              </button>

              <button
                onClick={() => setCurrentStep(3)}
                disabled={cartItems.length === 0}
                className="bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-50 text-white font-heading font-black text-xs px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
              >
                Proceed to Customization <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CUSTOMIZATION & MEASUREMENTS */}
        {currentStep === 3 && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6 animate-in fade-in duration-150">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h2 className="font-heading font-black text-xl text-[#111111] flex items-center gap-2">
                  <Ruler size={22} className="text-[#F97316]" /> STEP 3: CUSTOMIZATION & MEASUREMENTS
                </h2>
                <p className="text-gray-500 text-xs mt-0.5">
                  Input custom dimensions (length x width x height), material, finish, reference notes & drawing uploads.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item.productId} className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                  <div className="flex items-center gap-3 border-b pb-3">
                    <img src={item.image} alt={item.productName} className="w-12 h-12 object-cover rounded-xl border" />
                    <div>
                      <h4 className="font-heading font-black text-sm text-[#111111]">{item.productName}</h4>
                      <span className="text-[11px] text-gray-500 font-mono">Category: {item.category}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Material Grade</label>
                      <input
                        type="text"
                        value={item.material}
                        onChange={(e) => handleUpdateItemCustomization(item.productId, 'material', e.target.value)}
                        className="w-full bg-white p-2 rounded-lg border border-gray-300 outline-none font-medium text-gray-900 focus:border-[#F97316] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Color / Paint</label>
                      <input
                        type="text"
                        value={item.color}
                        onChange={(e) => handleUpdateItemCustomization(item.productId, 'color', e.target.value)}
                        className="w-full bg-white p-2 rounded-lg border border-gray-300 outline-none font-medium text-gray-900 focus:border-[#F97316] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Finish / Coating</label>
                      <input
                        type="text"
                        value={item.finish}
                        onChange={(e) => handleUpdateItemCustomization(item.productId, 'finish', e.target.value)}
                        className="w-full bg-white p-2 rounded-lg border border-gray-300 outline-none font-medium text-gray-900 focus:border-[#F97316] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Bar / Sheet Thickness</label>
                      <input
                        type="text"
                        value={item.thickness}
                        onChange={(e) => handleUpdateItemCustomization(item.productId, 'thickness', e.target.value)}
                        className="w-full bg-white p-2 rounded-lg border border-gray-300 outline-none font-medium text-gray-900 focus:border-[#F97316] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-xs font-sans">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Length</label>
                      <input
                        type="text"
                        value={item.length}
                        onChange={(e) => handleUpdateItemCustomization(item.productId, 'length', e.target.value)}
                        placeholder="7 ft / 2100mm"
                        className="w-full bg-white p-2 rounded-lg border border-gray-300 outline-none font-medium text-gray-900 focus:border-[#F97316] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Width</label>
                      <input
                        type="text"
                        value={item.width}
                        onChange={(e) => handleUpdateItemCustomization(item.productId, 'width', e.target.value)}
                        placeholder="4 ft / 1200mm"
                        className="w-full bg-white p-2 rounded-lg border border-gray-300 outline-none font-medium text-gray-900 focus:border-[#F97316] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Height</label>
                      <input
                        type="text"
                        value={item.height}
                        onChange={(e) => handleUpdateItemCustomization(item.productId, 'height', e.target.value)}
                        placeholder="4 ft / 1200mm"
                        className="w-full bg-white p-2 rounded-lg border border-gray-300 outline-none font-medium text-gray-900 focus:border-[#F97316] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Custom Fabrication Notes</label>
                      <input
                        type="text"
                        value={item.referenceNotes}
                        onChange={(e) => handleUpdateItemCustomization(item.productId, 'referenceNotes', e.target.value)}
                        placeholder="e.g. Extra forged tine welding at center"
                        className="w-full bg-white p-2 rounded-lg border border-gray-300 outline-none font-medium text-gray-900 focus:border-[#F97316] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Customer Drawing Image URL (Optional)</label>
                      <input
                        type="url"
                        value={item.drawingUrl}
                        onChange={(e) => handleUpdateItemCustomization(item.productId, 'drawingUrl', e.target.value)}
                        placeholder="https://... image link"
                        className="w-full bg-white p-2 rounded-lg border border-gray-300 outline-none font-mono font-medium text-gray-900 text-xs focus:border-[#F97316] transition-colors"
                      />
                    </div>
                  </div>

                </div>
              ))}
            </div>

            <div className="flex justify-between border-t pt-4">
              <button
                onClick={() => setCurrentStep(2)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={16} /> Back to Products
              </button>

              <button
                onClick={() => setCurrentStep(4)}
                className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
              >
                Proceed to Price Breakdown <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PRICE BREAKDOWN & CALCULATIONS */}
        {currentStep === 4 && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6 animate-in fade-in duration-150">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h2 className="font-heading font-black text-xl text-[#111111] flex items-center gap-2">
                  <IndianRupee size={22} className="text-[#F97316]" /> STEP 4: LIVE PRICE CALCULATOR & CHARGES
                </h2>
                <p className="text-gray-500 text-xs mt-0.5">
                  Adjust product subtotal, labour, fabrication, transport, manual discount & GST with live updates.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans">
              
              {/* Editable Charge Inputs */}
              <div className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-200">
                <h4 className="font-heading font-extrabold text-sm text-[#111111] uppercase tracking-wider border-b pb-2">
                  ADDITIONAL SERVICE CHARGES
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Labour Charge (₹)</label>
                    <input
                      type="number"
                      value={labourCharge}
                      onChange={(e) => setLabourCharge(parseInt(e.target.value) || 0)}
                      className="w-full bg-white p-2.5 rounded-lg border border-gray-300 outline-none font-mono font-medium text-gray-900 text-base focus:border-[#F97316]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Fabrication Charge (₹)</label>
                    <input
                      type="number"
                      value={fabricationCharge}
                      onChange={(e) => setFabricationCharge(parseInt(e.target.value) || 0)}
                      className="w-full bg-white p-2.5 rounded-lg border border-gray-300 outline-none font-mono font-medium text-gray-900 text-base focus:border-[#F97316]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Installation Charge (₹)</label>
                    <input
                      type="number"
                      value={installationCharge}
                      onChange={(e) => setInstallationCharge(parseInt(e.target.value) || 0)}
                      className="w-full bg-white p-2.5 rounded-lg border border-gray-300 outline-none font-mono font-medium text-gray-900 text-base focus:border-[#F97316]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Transport / Delivery (₹)</label>
                    <input
                      type="number"
                      value={transportCharge}
                      onChange={(e) => setTransportCharge(parseInt(e.target.value) || 0)}
                      className="w-full bg-white p-2.5 rounded-lg border border-gray-300 outline-none font-mono font-medium text-gray-900 text-base focus:border-[#F97316]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Special Shop Discount (₹)</label>
                    <input
                      type="number"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(parseInt(e.target.value) || 0)}
                      className="w-full bg-white p-2.5 rounded-lg border border-gray-300 outline-none font-mono font-medium text-emerald-700 text-base focus:border-[#F97316]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">GST Percentage</label>
                    <select
                      value={gstPercentage}
                      onChange={(e) => setGstPercentage(parseInt(e.target.value) || 0)}
                      className="w-full bg-white p-2.5 rounded-lg border border-gray-300 outline-none font-medium text-[#F97316] focus:border-[#F97316]"
                    >
                      <option value={0}>0% (No Tax)</option>
                      <option value={18}>18% GST Standard Tax</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Live Cost Summary Breakdown */}
              <div className="bg-[#111111] text-white p-6 rounded-2xl border border-gray-800 space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-heading font-black text-lg text-white border-b border-gray-800 pb-3 flex items-center gap-2">
                    <Sparkles size={18} className="text-[#F97316]" /> LIVE COST BREAKDOWN
                  </h4>

                  <div className="space-y-2.5 pt-4 text-xs font-mono">
                    <div className="flex justify-between text-gray-300">
                      <span>Products Subtotal:</span>
                      <strong>₹{productsSubtotal.toLocaleString('en-IN')}</strong>
                    </div>

                    <div className="flex justify-between text-gray-300">
                      <span>Service & Transport:</span>
                      <strong>+ ₹{extraChargesSubtotal.toLocaleString('en-IN')}</strong>
                    </div>

                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Manual Discount Reduced:</span>
                      <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between text-amber-400">
                      <span>GST Tax ({gstPercentage}%):</span>
                      <span>+ ₹{gstAmount.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="border-t border-gray-800 pt-3 flex justify-between items-center">
                      <span className="font-heading font-black text-sm text-gray-200">GRAND TOTAL PAYABLE:</span>
                      <strong className="font-heading font-black text-2xl text-[#F97316]">
                        ₹{grandTotal.toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white/10 rounded-xl border border-white/10 text-[11px] text-gray-300">
                  ⚡ All amounts update live as you edit. Proceed to step 5 to collect payment.
                </div>
              </div>
            </div>

            <div className="flex justify-between border-t pt-4">
              <button
                onClick={() => setCurrentStep(3)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={16} /> Back to Customization
              </button>

              <button
                onClick={() => setCurrentStep(5)}
                className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
              >
                Proceed to Payment & Receipt <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: PAYMENT DETAILS & RECEIPT */}
        {currentStep === 5 && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6 animate-in fade-in duration-150">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h2 className="font-heading font-black text-xl text-[#111111] flex items-center gap-2">
                  <CreditCard size={22} className="text-[#F97316]" /> STEP 5: PAYMENT COLLECTION & RECEIPT
                </h2>
                <p className="text-gray-500 text-xs mt-0.5">
                  Select payment mode (Cash, UPI, Card, Bank Transfer, Cheque) and collect advance.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans">
              
              <div className="space-y-4">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Payment Mode / Method *</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full bg-gray-50 hover:bg-white focus:bg-white p-3 rounded-xl border border-gray-300 outline-none font-heading font-extrabold text-sm text-[#F97316] focus:border-[#F97316]"
                  >
                    <option value="Cash">💵 Cash Handover</option>
                    <option value="UPI">📱 UPI (GPay / PhonePe / Paytm)</option>
                    <option value="Card">💳 Credit / Debit Card Swipe</option>
                    <option value="Bank Transfer">🏦 Direct Bank Transfer / NEFT</option>
                    <option value="Cheque">📜 Bank Cheque</option>
                    <option value="Razorpay">⚡ Razorpay Gateway</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Advance Collected Today (₹) *</label>
                  <input
                    type="number"
                    value={advancePaidAmount}
                    onChange={(e) => setAdvancePaidAmount(parseInt(e.target.value) || 0)}
                    className="w-full bg-gray-50 hover:bg-white focus:bg-white p-3 rounded-xl border border-gray-300 outline-none font-mono font-medium text-lg text-blue-700 focus:border-[#F97316]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Payment Reference ID / Txn Number (Optional)</label>
                  <input
                    type="text"
                    value={paymentRefId}
                    onChange={(e) => setPaymentRefId(e.target.value)}
                    placeholder="e.g. UPI/998822001 or Cheque #00412"
                    className="w-full bg-gray-50 hover:bg-white focus:bg-white p-2.5 rounded-lg border border-gray-300 outline-none font-mono font-medium text-gray-900 focus:border-[#F97316]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Collected By Admin Staff</label>
                  <input
                    type="text"
                    value={collectedBy}
                    onChange={(e) => setCollectedBy(e.target.value)}
                    className="w-full bg-gray-50 hover:bg-white focus:bg-white p-2.5 rounded-lg border border-gray-300 outline-none font-medium text-gray-900 focus:border-[#F97316]"
                  />
                </div>
              </div>

              {/* Remaining Balance Indicator */}
              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="font-heading font-black text-sm text-amber-900 uppercase tracking-wider border-b border-amber-200 pb-2">
                    BALANCE DUE AFTER TODAY'S ADVANCE
                  </h4>

                  <div className="space-y-3 pt-4 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-amber-800 font-bold">Grand Total Amount:</span>
                      <strong>₹{grandTotal.toLocaleString('en-IN')}</strong>
                    </div>

                    <div className="flex justify-between text-blue-700 font-bold">
                      <span>Advance Collected Today:</span>
                      <span>- ₹{advancePaidAmount.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="border-t border-amber-300 pt-3 flex justify-between items-center">
                      <span className="font-heading font-black text-sm text-red-900">REMAINING BALANCE DUE:</span>
                      <strong className="font-heading font-black text-2xl text-red-600">
                        ₹{remainingBalanceDue.toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-amber-300 text-[11px] text-amber-900 font-medium">
                  🧾 An official payment receipt (e.g. RCP-8821) will be issued instantly upon order generation.
                </div>
              </div>
            </div>

            <div className="flex justify-between border-t pt-4">
              <button
                onClick={() => setCurrentStep(4)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={16} /> Back to Price Breakdown
              </button>

              <button
                onClick={() => setCurrentStep(6)}
                className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
              >
                Proceed to Delivery Assignment <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: DELIVERY & WORKER ASSIGNMENT */}
        {currentStep === 6 && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6 animate-in fade-in duration-150">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h2 className="font-heading font-black text-xl text-[#111111] flex items-center gap-2">
                  <Truck size={22} className="text-[#F97316]" /> STEP 6: DELIVERY TYPE & WORKER ASSIGNMENT
                </h2>
                <p className="text-gray-500 text-xs mt-0.5">
                  Select pickup/delivery, assign senior machinist worker, vehicle, and set delivery date.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-sans">
              
              <div className="space-y-4">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Delivery Fulfillment Type</label>
                  <select
                    value={deliveryType}
                    onChange={(e) => setDeliveryType(e.target.value as any)}
                    className="w-full bg-gray-50 hover:bg-white focus:bg-white p-2.5 rounded-lg border border-gray-300 outline-none font-medium text-[#F97316] focus:border-[#F97316]"
                  >
                    <option value="Home Delivery">🚛 Home Delivery via Lathe Transport</option>
                    <option value="Installation">🛠️ Site Delivery & On-site Welding Installation</option>
                    <option value="Pickup">🏪 Direct Shop Pickup by Customer</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Expected Delivery / Completion Date *</label>
                  <input
                    type="date"
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="w-full bg-gray-50 hover:bg-white focus:bg-white p-2.5 rounded-lg border border-gray-300 outline-none font-mono font-medium text-gray-900 focus:border-[#F97316]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Assigned Senior Welder / Machinist Worker</label>
                  <select
                    value={assignedWorker}
                    onChange={(e) => setAssignedWorker(e.target.value)}
                    className="w-full bg-gray-50 hover:bg-white focus:bg-white p-2.5 rounded-lg border border-gray-300 outline-none font-medium text-gray-900 focus:border-[#F97316]"
                  >
                    <option value="Chellamuthu K (Master Machinist)">Chellamuthu K (Owner & Master Machinist)</option>
                    <option value="Ramasamy (Senior Welder)">Ramasamy (Senior Lathe Welder)</option>
                    <option value="Murugan (Tractor Kalappai Specialist)">Murugan (Tractor Implement Specialist)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Assigned Delivery Vehicle Number</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="TN-57-AB-1234 Tata Ace"
                    className="w-full bg-gray-50 hover:bg-white focus:bg-white p-2.5 rounded-lg border border-gray-300 outline-none font-mono font-medium text-gray-900 focus:border-[#F97316]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Special Delivery & Handling Instructions</label>
                  <textarea
                    rows={3}
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="e.g. Call customer before dispatch. Requires 2 workers for unloading."
                    className="w-full bg-gray-50 hover:bg-white focus:bg-white p-2.5 rounded-lg border border-gray-300 outline-none font-medium text-gray-900 focus:border-[#F97316]"
                  />
                </div>
              </div>
            </div>


            <div className="flex justify-between border-t pt-4">
              <button
                onClick={() => setCurrentStep(5)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={16} /> Back to Payment
              </button>

              <button
                onClick={() => setCurrentStep(7)}
                className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
              >
                Proceed to Final Summary & Order Creation <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: CONFIRMATION & ORDER GENERATION */}
        {currentStep === 7 && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6 animate-in fade-in duration-150">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h2 className="font-heading font-black text-xl text-[#111111] flex items-center gap-2">
                  <CheckCircle2 size={22} className="text-emerald-600" /> STEP 7: REVIEW & GENERATE OFFLINE ORDER
                </h2>
                <p className="text-gray-500 text-xs mt-0.5">
                  Verify customer, items, custom measurements, live price breakdown, and click Generate Order.
                </p>
              </div>
            </div>

            {/* Summary Review Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans">
              
              {/* Customer & Delivery Summary */}
              <div className="p-5 bg-gray-50 rounded-2xl border space-y-3">
                <h4 className="font-heading font-black text-sm text-[#111111] border-b pb-2 uppercase tracking-wider">
                  CUSTOMER & DELIVERY SUMMARY
                </h4>
                <div className="space-y-1">
                  <strong className="text-[#111111] text-sm block">{custName || selectedCustomer?.name}</strong>
                  <p className="text-gray-600 font-mono">{custPhone || selectedCustomer?.phone}</p>
                  <p className="text-gray-600 line-clamp-2">{custAddress || selectedCustomer?.address}</p>
                </div>
                <div className="border-t pt-2 space-y-1 text-gray-700">
                  <p>Fulfillment: <strong>{deliveryType}</strong></p>
                  <p>Expected Date: <strong className="font-mono">{expectedDate}</strong></p>
                  <p>Worker Assigned: <strong>{assignedWorker}</strong></p>
                </div>
              </div>

              {/* Price & Payment Summary */}
              <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
                <h4 className="font-heading font-black text-sm text-amber-950 border-b border-amber-200 pb-2 uppercase tracking-wider">
                  PAYMENT & FINANCIAL SUMMARY
                </h4>
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between">
                    <span>Products Subtotal:</span>
                    <span>₹{productsSubtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount:</span>
                    <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#111111] text-sm border-t pt-1">
                    <span>Grand Total Payable:</span>
                    <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-blue-700 font-bold">
                    <span>Advance Collected ({paymentMode}):</span>
                    <span>- ₹{advancePaidAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-red-600 font-bold border-t pt-1">
                    <span>Remaining Balance Due:</span>
                    <span>₹{remainingBalanceDue.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Products List Review */}
            <div className="p-5 bg-gray-50 rounded-2xl border space-y-3">
              <h4 className="font-heading font-black text-sm text-[#111111] uppercase tracking-wider">
                ORDER ITEMS & CUSTOM MEASUREMENTS ({cartItems.length})
              </h4>
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.productId} className="p-3 bg-white rounded-xl border flex items-center justify-between text-xs font-sans">
                    <div className="space-y-1">
                      <strong className="font-bold text-[#111111]">{item.productName} (Qty: {item.quantity})</strong>
                      <p className="text-gray-500 font-mono">
                        Dim: {item.length} x {item.width} x {item.height} • Material: {item.material} • {item.finish}
                      </p>
                    </div>
                    <strong className="font-heading font-black text-sm text-[#F97316]">
                      ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-between border-t pt-4">
              <button
                onClick={() => setCurrentStep(6)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={16} /> Back to Delivery
              </button>

              <button
                onClick={handleGenerateOfflineOrder}
                className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-sm px-8 py-3.5 rounded-xl shadow-xl flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
              >
                <Sparkles size={18} /> GENERATE OFFICIAL OFFLINE ORDER & INVOICE
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Tax Invoice Modal for Created Offline Order */}
      <PDFInvoiceModal
        order={createdOrder}
        isOpen={!!createdOrder}
        onClose={() => {
          setCreatedOrder(null);
          navigate('/admin/orders');
        }}
      />
    </div>
  );
};

export default AdminOfflineOrderPage;
