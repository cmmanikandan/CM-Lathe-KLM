import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useEnquiries } from '../../context/EnquiryContext';
import { useAuth } from '../../context/AuthContext';
import { openRazorpayCheckout } from '../../services/razorpayService';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import { createCustomerEnquiryWhatsAppMessage } from '../../services/whatsappService';
import {
  ArrowLeft,
  ShoppingBag,
  CheckCircle2,
  Upload,
  CreditCard,
  FileText,
  Truck,
  Loader2,
  MessageCircle,
  Phone,
  Sparkles,
  ShieldCheck,
  Award
} from 'lucide-react';

export const CustomerEnquiryFormPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId') || '';
  const navigate = useNavigate();
  const { products, getProductById } = useProducts();
  const { submitEnquiry } = useEnquiries();
  const { user } = useAuth();

  const selectedProduct = getProductById(productId) || products[0];

  // Form Fields
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerAddress, setCustomerAddress] = useState(user?.address || '');
  
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [customMeasurements, setCustomMeasurements] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [deliveryType, setDeliveryType] = useState<'Factory Pickup' | 'Workshop Delivery'>('Workshop Delivery');
  const [paymentChoice, setPaymentChoice] = useState<'Pay Later' | 'Pay Advance Online'>('Pay Later');

  const [selectedVariantId, setSelectedVariantId] = useState<string>(() => {
    return selectedProduct?.variants && selectedProduct.variants.length > 0
      ? selectedProduct.variants[0].id
      : '';
  });

  useEffect(() => {
    if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.phone) setCustomerPhone(user.phone);
      if (user.email) setCustomerEmail(user.email);
      if (user.address) setCustomerAddress(user.address);
    }
  }, [user]);

  const selectedVariant = selectedProduct?.variants?.find((v) => v.id === selectedVariantId);
  const currentUnitPrice = selectedVariant?.price || selectedProduct?.price || 0;
  const totalEstPrice = currentUnitPrice * orderQuantity;

  // Reference images upload
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [createdEnquiryNumber, setCreatedEnquiryNumber] = useState('');
  const [whatsAppUrl, setWhatsAppUrl] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress) {
      alert('Please fill in your name, mobile number, and address.');
      return;
    }

    const variantName = selectedVariant?.name || 'Standard Unit';
    setIsSubmitting(true);

    if (paymentChoice === 'Pay Advance Online') {
      const advanceAmount = Math.round(totalEstPrice * 0.25);
      openRazorpayCheckout({
        amount: advanceAmount,
        orderNumber: `ENQ-ADV-${Date.now().toString().slice(-6)}`,
        customerName,
        customerPhone,
        customerEmail,
        description: `25% Advance Payment for ${selectedProduct.name} Enquiry`,
        onSuccess: async (payload) => {
          const newEnq = await submitEnquiry({
            customerName,
            customerPhone,
            customerEmail,
            customerAddress,
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            productImage: selectedProduct.images?.[0] || '',
            variantName,
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

          const wa = createCustomerEnquiryWhatsAppMessage(newEnq);
          setWhatsAppUrl(wa);
          setCreatedEnquiryNumber(newEnq.enquiryNumber);
          setIsSubmitting(false);
          setEnquirySuccess(true);
          window.open(wa, '_blank');
        },
        onFailure: () => {
          setIsSubmitting(false);
          alert('Advance payment was cancelled or failed. You can switch to "Pay Later" to submit your enquiry.');
        },
      });
    } else {
      // Pay Later
      const newEnq = await submitEnquiry({
        customerName,
        customerPhone,
        customerEmail,
        customerAddress,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productImage: selectedProduct.images?.[0] || '',
        variantName,
        measurements: customMeasurements,
        referenceImages,
        notes: orderNotes,
        quantity: orderQuantity,
        estimatedPrice: totalEstPrice,
        paymentOption: 'Pay Later',
        deliveryType,
      });

      const wa = createCustomerEnquiryWhatsAppMessage(newEnq);
      setWhatsAppUrl(wa);
      setCreatedEnquiryNumber(newEnq.enquiryNumber);
      setIsSubmitting(false);
      setEnquirySuccess(true);
      window.open(wa, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111] font-sans antialiased pb-24">
      
      {/* 1. TOP DEDICATED FULL-PAGE HEADER */}
      <div className="bg-white border-b border-gray-200 py-4 px-4 sm:px-8 shadow-xs sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 font-heading font-extrabold text-xs text-[#111111] bg-gray-100 hover:bg-gray-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} className="text-[#F97316]" /> Back
          </button>

          <div className="text-center">
            <h1 className="font-heading font-black text-base sm:text-lg text-[#111111]">
              Submit Custom Fabrication Order Enquiry
            </h1>
            <span className="text-[11px] text-gray-500 font-mono">
              MANIKANDAN LATHE WORKS • Kallimandhayam Factory
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-bold">
            <ShieldCheck size={14} /> Factory Direct
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* SUCCESS CELEBRATION EFFECT SCREEN */}
        {enquirySuccess ? (
          <div className="bg-white rounded-[26px] border-2 border-emerald-500 p-8 sm:p-12 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <CheckCircle2 size={48} />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-widest block">
                🎉 ORDER ENQUIRY SUBMITTED SUCCESSFULLY
              </span>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#111111]">
                Enquiry #{createdEnquiryNumber} Placed!
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
                Thank you! Your custom order enquiry has been saved in the factory ledger. Factory owner <strong className="text-[#111111]">Chellamuthu K</strong> will review your dimensions and approve your quote shortly.
              </p>
            </div>

            {/* Actions: Open WhatsApp & View Enquiries */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 bg-[#25D366] hover:bg-[#20ba5a] text-white font-heading font-black text-xs py-3.5 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <MessageCircle size={18} /> Send Details on WhatsApp
              </a>

              <button
                onClick={() => navigate('/customer/enquiries')}
                className="w-full sm:flex-1 bg-[#111111] hover:bg-[#F97316] text-white font-heading font-black text-xs py-3.5 px-6 rounded-2xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <FileText size={18} /> Track My Enquiries →
              </button>
            </div>
          </div>
        ) : (
          /* FULL-PAGE ENQUIRY FORM */
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Selected Product Hero Card */}
            <div className="bg-white p-5 rounded-[22px] border border-gray-200 shadow-xs flex items-center gap-4">
              <img
                src={selectedProduct?.images?.[0] || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=300&q=80'}
                alt={selectedProduct?.name}
                className="w-20 h-20 rounded-2xl object-contain bg-gray-50 border border-gray-200 p-1 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono font-bold text-[#F97316] uppercase block">
                  Selected Item: {selectedProduct?.category}
                </span>
                <h3 className="font-heading font-black text-lg text-[#111111] truncate">
                  {selectedProduct?.name}
                </h3>
                <span className="font-heading font-black text-base text-[#F97316] block mt-0.5">
                  Est. Factory Price: ₹{currentUnitPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* STEP 1: Customer Contact & Delivery Info */}
            <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-xs space-y-4">
              <h2 className="font-heading font-black text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3">
                <Sparkles size={18} className="text-[#F97316]" /> 1. Customer Contact & Delivery Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <label className="font-bold text-gray-800 block mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-gray-50 text-gray-900 font-medium p-3 rounded-xl border border-gray-300 outline-none focus:border-[#F97316] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Mobile Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full bg-gray-50 text-gray-900 font-mono font-medium p-3 rounded-xl border border-gray-300 outline-none focus:border-[#F97316] focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-gray-800 block mb-1">Delivery / Installation Address *</label>
                  <textarea
                    rows={2}
                    required
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Street, Town, District, Pincode..."
                    className="w-full bg-gray-50 text-gray-900 font-medium p-3 rounded-xl border border-gray-300 outline-none focus:border-[#F97316] focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="font-bold text-gray-800 block">Delivery Method:</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('Workshop Delivery')}
                      className={`p-3 rounded-xl border-2 text-left font-bold text-xs transition-all ${
                        deliveryType === 'Workshop Delivery'
                          ? 'bg-orange-50 border-[#F97316] text-[#111111]'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Truck size={16} className="text-[#F97316] mb-1" />
                      <span>Workshop On-Site Delivery</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType('Factory Pickup')}
                      className={`p-3 rounded-xl border-2 text-left font-bold text-xs transition-all ${
                        deliveryType === 'Factory Pickup'
                          ? 'bg-orange-50 border-[#F97316] text-[#111111]'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Award size={16} className="text-[#F97316] mb-1" />
                      <span>Self Factory Pickup</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 2: Custom Specifications & Quantity */}
            <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-xs space-y-4">
              <h2 className="font-heading font-black text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3">
                <ShoppingBag size={18} className="text-[#F97316]" /> 2. Custom Dimensions & Requirements
              </h2>

              <div className="space-y-4 text-xs font-sans">
                
                {/* Variant Selection if available */}
                {selectedProduct?.variants && selectedProduct.variants.length > 0 && (
                  <div>
                    <label className="font-bold text-gray-800 block mb-1">Select Size / Variant:</label>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedProduct.variants.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariantId(v.id)}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            selectedVariantId === v.id
                              ? 'bg-orange-50 border-[#F97316] text-[#111111]'
                              : 'bg-white border-gray-200 text-gray-700'
                          }`}
                        >
                          <strong className="block">{v.name}</strong>
                          <span className="text-[11px] text-[#F97316] font-mono font-bold">₹{v.price.toLocaleString('en-IN')}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-800 block mb-1">Order Quantity (Units):</label>
                    <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-300 w-fit">
                      <button
                        type="button"
                        onClick={() => setOrderQuantity((q) => Math.max(1, q - 1))}
                        className="w-8 h-8 bg-white text-[#111111] font-black rounded-lg border shadow-xs hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="font-mono font-black text-sm text-gray-900 px-3">{orderQuantity}</span>
                      <button
                        type="button"
                        onClick={() => setOrderQuantity((q) => q + 1)}
                        className="w-8 h-8 bg-white text-[#111111] font-black rounded-lg border shadow-xs hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-gray-800 block mb-1">Custom Dimensions (Width x Height, Gauge):</label>
                    <input
                      type="text"
                      placeholder="e.g., 6ft x 4ft Gate, 16 Gauge Steel Pipe"
                      value={customMeasurements}
                      onChange={(e) => setCustomMeasurements(e.target.value)}
                      className="w-full bg-gray-50 text-gray-900 font-medium p-3 rounded-xl border border-gray-300 outline-none focus:border-[#F97316] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Upload Reference Drawing / Design Photo (Optional):</label>
                  <div className="flex items-center gap-3">
                    <label className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs px-4 py-2.5 rounded-xl border border-gray-300 cursor-pointer flex items-center gap-1.5 transition-colors">
                      {isUploadingImages ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} className="text-[#F97316]" />}
                      <span>{isUploadingImages ? 'Uploading Image...' : 'Upload Photo from Device'}</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    {referenceImages.length > 0 && (
                      <span className="text-xs text-emerald-700 font-mono font-bold">
                        ✓ {referenceImages.length} image uploaded
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-800 block mb-1">Additional Notes / Instructions:</label>
                  <textarea
                    rows={2}
                    placeholder="Specific welding instructions, color primer preference..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full bg-gray-50 text-gray-900 font-medium p-3 rounded-xl border border-gray-300 outline-none focus:border-[#F97316] focus:bg-white"
                  />
                </div>

              </div>
            </div>

            {/* STEP 3: Payment Option & Total Estimated Price */}
            <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-xs space-y-4">
              <h2 className="font-heading font-black text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3">
                <CreditCard size={18} className="text-[#F97316]" /> 3. Payment Option & Summary
              </h2>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentChoice('Pay Later')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      paymentChoice === 'Pay Later'
                        ? 'bg-[#111111] text-white border-[#111111] shadow-md'
                        : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-heading font-black text-xs flex items-center gap-1.5">
                      <FileText size={16} className="text-[#F97316]" /> Option 1: Pay Later
                    </div>
                    <p className="text-[11px] opacity-80 mt-1">Submit enquiry first. Pay after owner Chellamuthu K approves final quote.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentChoice('Pay Advance Online')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      paymentChoice === 'Pay Advance Online'
                        ? 'bg-[#111111] text-white border-[#111111] shadow-md'
                        : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-heading font-black text-xs flex items-center gap-1.5">
                      <CreditCard size={16} className="text-emerald-400" /> Option 2: Pay 25% Advance Online
                    </div>
                    <p className="text-[11px] opacity-80 mt-1">
                      Pay 25% Advance (₹{Math.round(totalEstPrice * 0.25).toLocaleString('en-IN')}) via Razorpay to confirm immediate workshop slot.
                    </p>
                  </button>
                </div>

                <div className="bg-orange-50/80 border border-orange-200 p-4 rounded-2xl flex items-center justify-between text-xs font-mono text-gray-900">
                  <span className="font-bold">Total Estimated Workshop Price:</span>
                  <strong className="text-xl text-[#F97316] font-heading font-black">₹{totalEstPrice.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-sm py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <><Loader2 size={18} className="animate-spin" /> Submitting Enquiry to Workshop...</>
                ) : paymentChoice === 'Pay Advance Online' ? (
                  <>Pay 25% Advance & Submit Custom Order Enquiry →</>
                ) : (
                  <>Submit Custom Fabrication Enquiry →</>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
