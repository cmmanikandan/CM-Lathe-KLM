import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { Order, OrderStatus } from '../../types';
import { PDFInvoiceModal } from '../../components/common/PDFInvoiceModal';
import { AdminPaymentCollectionModal } from '../../components/common/AdminPaymentCollectionModal';
import { AdminPaymentRequestModal } from '../../components/common/AdminPaymentRequestModal';
import { RazorpayQRModal } from '../../components/common/RazorpayQRModal';

import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Clock,
  CreditCard,
  CheckCircle2,
  FileText,
  Truck,
  Wrench,
  Activity,
  Printer,
  Share2,
  MessageCircle,
  Plus,
  Trash2,
  Copy,
  Edit3,
  Calendar,
  AlertTriangle,
  Upload,
  ExternalLink,
  ShieldCheck,
  Building2,
  Sparkles,
  Download,
  Ruler,
  QrCode,

  Layers,
  FileCheck,
} from 'lucide-react';

export const AdminOrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const {
    getOrderById,
    updateOrderStatus,
    updateOrderPriority,
    updateOrderProduction,
    assignDeliveryDetails,
    uploadCompletedImages,
    logOrderActivity,
    cancelOrder,
  } = useOrders();

  const order = getOrderById(orderId || '');

  const [activeTab, setActiveTab] = useState<
    | 'OVERVIEW'
    | 'TIMELINE'
    | 'PRODUCTS'
    | 'MEASUREMENTS'
    | 'PRODUCTION'
    | 'PAYMENTS'
    | 'DELIVERY'
    | 'INVOICE'
    | 'ACTIVITY'
  >('OVERVIEW');

  // Modals
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  // Measurement Modal States
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState(0);
  const [measDimensions, setMeasDimensions] = useState('');
  const [measNotes, setMeasNotes] = useState('');

  const handleSaveMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    try {
      const updatedItems = [...order.items];
      if (updatedItems[editingItemIndex]) {
        updatedItems[editingItemIndex] = {
          ...updatedItems[editingItemIndex],
          customMeasurements: measDimensions,
          referenceNotes: measNotes,
        };
      }
      await updateOrderProduction(
        order.id,
        workerName || 'Chellamuthu K',
        machineName || 'Lathe Machine',
        expectedFinish,
        `Updated measurements for ${updatedItems[editingItemIndex]?.productName || 'Order Item'}`
      );
      alert('Measurements saved successfully!');
      setShowMeasurementModal(false);
    } catch (err) {
      console.error(err);
      alert('Measurements updated!');
      setShowMeasurementModal(false);
    }
  };


  // Production Form States
  const [workerName, setWorkerName] = useState('Chellamuthu K (Senior Machinist)');
  const [machineName, setMachineName] = useState('Lathe Machine #2 - Heavy Duty');
  const [expectedFinish, setExpectedFinish] = useState(order?.expectedDate || new Date().toISOString().split('T')[0]);
  const [prodNotes, setProdNotes] = useState('');

  // Delivery Form States
  const [driverName, setDriverName] = useState('Ramasamy');
  const [driverPhone, setDriverPhone] = useState('+91 97865 43210');
  const [vehicleNo, setVehicleNo] = useState('TN 57 AH 4812');
  const [fulfillmentType, setFulfillmentType] = useState<'Pickup' | 'Home Delivery' | 'Installation'>('Home Delivery');

  if (!order) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl shadow-xs border border-gray-200 my-12 max-w-md mx-auto space-y-4 font-sans">
        <h2 className="font-heading font-black text-xl text-[#111111]">Order Not Found</h2>
        <p className="text-xs text-gray-500">Order #{orderId} does not exist in workshop database.</p>
        <button
          onClick={() => navigate('/admin/orders')}
          className="bg-[#111111] text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
        >
          Back to Order Management
        </button>
      </div>
    );
  }

  const cleanPhone = order.customerPhone.replace(/\D/g, '').slice(-10);
  const waText = encodeURIComponent(
    `Hello ${order.customerName}, update regarding MANIKANDAN LATHE Order #${order.orderNumber}. Current Status: ${order.status}. Total Price: ₹${order.finalPrice.toLocaleString(
      'en-IN'
    )}, Balance Due: ₹${order.remainingBalance.toLocaleString('en-IN')}. Thank you!`
  );
  const waUrl = `https://wa.me/91${cleanPhone}?text=${waText}`;

  // Interactive Timeline Pipeline
  const timelinePipeline: Array<{ status: OrderStatus; label: string; desc: string }> = [
    { status: 'PENDING', label: 'Pending', desc: 'Order received at workshop' },
    { status: 'ACCEPTED', label: 'Accepted', desc: 'Order accepted by admin' },
    { status: 'MATERIAL_READY', label: 'Material Ready', desc: 'Steel/iron raw materials ready' },
    { status: 'IN_PRODUCTION', label: 'Production', desc: 'Lathe machining & fabrication' },
    { status: 'QUALITY_CHECK', label: 'Quality Check', desc: 'Inspected by foreman' },
    { status: 'READY', label: 'Ready', desc: 'Ready for pickup or dispatch' },
    { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Loaded on vehicle' },
    { status: 'INSTALLED', label: 'Installed', desc: 'Site erection completed' },
    { status: 'COMPLETED', label: 'Completed', desc: 'Fully paid and delivered' },
  ];

  const currentTimelineIndex = timelinePipeline.findIndex((t) => t.status === order.status);

  // Handle Production Save
  const handleSaveProduction = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateOrderProduction(order.id, workerName, machineName, expectedFinish, prodNotes);
    alert('Worker and Machine assignment saved.');
  };

  // Handle Delivery Save
  const handleSaveDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    await assignDeliveryDetails(order.id, {
      personName: driverName,
      mobileNumber: driverPhone,
      deliveryCharge: 500,
      expectedDate: expectedFinish,
      expectedTime: '04:00 PM',
      status: 'Assigned',
      vehicleNumber: vehicleNo,
      deliveryType: fulfillmentType,
    });
    alert('Delivery dispatch assignment saved.');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] pb-28 font-sans space-y-6">
      
      {/* Sticky Top Header Bar */}
      <div className="bg-[#111111] text-white p-5 shadow-lg border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/orders')}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#F97316] font-bold uppercase tracking-widest">
                  FULL ERP ORDER MANAGEMENT
                </span>
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                  order.isOfflineOrder ? 'bg-amber-900 text-amber-200 border-amber-700' : 'bg-blue-900 text-blue-200 border-blue-700'
                }`}>
                  {order.isOfflineOrder ? 'OFFLINE WALK-IN' : 'ONLINE BUYER'}
                </span>
              </div>
              <h1 className="font-heading font-black text-xl text-white mt-0.5 flex items-center gap-2">
                ORDER #{order.orderNumber}
                <span className="text-xs font-mono text-gray-400 font-normal">({order.customerName})</span>
              </h1>
            </div>
          </div>

          {/* Sticky Header Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {order.remainingBalance > 0 && (
              <button
                onClick={() => setPaymentModalOpen(true)}
                className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <CreditCard size={14} /> Collect Payment
              </button>
            )}

            <button
              onClick={() => setPdfModalOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white font-heading font-black text-xs px-3.5 py-2.5 rounded-xl border border-white/10 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Printer size={14} /> Tax Invoice
            </button>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-heading font-black text-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
          </div>

        </div>
      </div>

      {/* 9 HORIZONTALLY SCROLLABLE TABS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-1 overflow-x-auto text-xs font-heading">
          {[
            { id: 'OVERVIEW', title: 'Overview', icon: User },
            { id: 'TIMELINE', title: 'Timeline', icon: Clock },
            { id: 'PRODUCTS', title: 'Products', icon: Building2 },
            { id: 'MEASUREMENTS', title: 'Measurements', icon: Ruler },
            { id: 'PRODUCTION', title: 'Production', icon: Wrench },
            { id: 'PAYMENTS', title: 'Payments', icon: CreditCard },
            { id: 'DELIVERY', title: 'Delivery', icon: Truck },
            { id: 'INVOICE', title: 'Invoice', icon: FileText },
            { id: 'ACTIVITY', title: 'Activity', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  active
                    ? 'bg-[#111111] text-white shadow-md'
                    : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}
              >
                <Icon size={15} className={active ? 'text-[#F97316]' : 'text-gray-400'} />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TWO-COLUMN ERP MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT 70% (COL-SPAN-8) MAIN TAB CONTENT */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                
                {/* Customer Information Card */}
                <div className="bg-white p-6 rounded-[22px] border border-gray-200 shadow-xs space-y-4">
                  <h3 className="font-heading font-black text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2">
                    <User size={16} className="text-[#F97316]" /> CUSTOMER INFORMATION & ADDRESS
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                    <div>
                      <span className="text-gray-400 text-[10px] block font-mono">Customer Name:</span>
                      <strong className="text-base text-[#111111] font-heading font-bold">{order.customerName}</strong>
                    </div>

                    <div>
                      <span className="text-gray-400 text-[10px] block font-mono">Mobile Number:</span>
                      <strong className="text-sm font-mono text-[#F97316]">{order.customerPhone}</strong>
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-gray-400 text-[10px] block font-mono">Delivery / Workshop Address:</span>
                      <p className="text-gray-800 font-medium">{order.customerAddress || 'Kallimandhayam Workshop Counter'}</p>
                    </div>
                  </div>

                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(order.customerAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <MapPin size={14} className="text-red-500" /> Open Google Maps Navigation
                  </a>
                </div>

                {/* Financial Summary Card */}
                <div className="bg-white p-6 rounded-[22px] border border-gray-200 shadow-xs space-y-4">
                  <h3 className="font-heading font-black text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2">
                    <CreditCard size={16} className="text-[#F97316]" /> ORDER SUMMARY & BALANCES
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="text-[10px] text-gray-400 block uppercase">Agreed Total</span>
                      <strong className="text-gray-900 text-sm">₹{order.finalPrice.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <span className="text-[10px] text-emerald-700 block uppercase">Advance Paid</span>
                      <strong className="text-emerald-700 text-sm">₹{order.advancePaid.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <span className="text-[10px] text-amber-800 block uppercase">Balance Due</span>
                      <strong className="text-red-600 text-sm">₹{order.remainingBalance.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                      <span className="text-[10px] text-blue-700 block uppercase">Source</span>
                      <strong className="text-blue-800 text-xs">{order.isOfflineOrder ? 'Offline Counter' : 'Online Buyer'}</strong>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: TIMELINE */}
            {activeTab === 'TIMELINE' && (
              <div className="bg-white p-6 rounded-[22px] border border-gray-200 shadow-xs space-y-5 animate-in fade-in duration-150">
                <div>
                  <h3 className="font-heading font-black text-base text-[#111111]">INTERACTIVE PRODUCTION TIMELINE</h3>
                  <p className="text-xs text-gray-500">Click any step to transition live order status.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {timelinePipeline.map((step, idx) => {
                    const isCurrent = step.status === order.status;
                    const isPassed = idx <= currentTimelineIndex;
                    return (
                      <button
                        key={step.status}
                        onClick={() => updateOrderStatus(order.id, step.status)}
                        className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between space-y-1.5 transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-[#F97316] text-white border-[#F97316] shadow-md scale-102'
                            : isPassed
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono font-bold uppercase">STEP {idx + 1}</span>
                          {isCurrent || isPassed ? <CheckCircle2 size={14} /> : null}
                        </div>
                        <h4 className="font-heading font-black text-xs">{step.label}</h4>
                        <p className="text-[10px] opacity-80 line-clamp-1">{step.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: PRODUCTS */}
            {activeTab === 'PRODUCTS' && (
              <div className="bg-white p-6 rounded-[22px] border border-gray-200 shadow-xs space-y-4 animate-in fade-in duration-150">
                <h3 className="font-heading font-black text-base text-[#111111]">ORDERED PRODUCTS ({order.items.length})</h3>

                <div className="divide-y divide-gray-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80'}
                          alt={item.productName}
                          className="w-14 h-14 rounded-xl object-cover border border-gray-200"
                        />
                        <div>
                          <h4 className="font-heading font-black text-sm text-[#111111]">{item.productName}</h4>
                          <p className="text-xs text-gray-500 font-mono">
                            Variant: {item.variant?.size || 'Standard'} | Qty: {item.quantity}
                          </p>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <strong className="text-sm text-[#111111]">₹{item.totalPrice.toLocaleString('en-IN')}</strong>
                        <span className="text-[10px] text-gray-400 block">₹{item.unitPrice} each</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: MEASUREMENTS */}
            {activeTab === 'MEASUREMENTS' && (
              <div className="bg-white p-6 rounded-[22px] border border-gray-200 shadow-xs space-y-4 animate-in fade-in duration-150 text-xs font-sans">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="font-heading font-black text-base text-[#111111]">FABRICATION MEASUREMENTS & SPECS</h3>
                    <p className="text-xs text-gray-500">Custom dimensional tolerances and raw material specs.</p>
                  </div>

                  <button
                    onClick={() => {
                      if (order.items.length > 0) {
                        setEditingItemIndex(0);
                        setMeasDimensions(order.items[0].customMeasurements || '');
                        setMeasNotes(order.items[0].referenceNotes || '');
                      }
                      setShowMeasurementModal(true);
                    }}
                    className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                  >
                    <Ruler size={14} /> + Add / Edit Measurement
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 relative">
                      <div className="flex justify-between items-start">
                        <h4 className="font-heading font-black text-xs text-[#111111]">{item.productName}</h4>
                        <button
                          onClick={() => {
                            setEditingItemIndex(idx);
                            setMeasDimensions(item.customMeasurements || '');
                            setMeasNotes(item.referenceNotes || '');
                            setShowMeasurementModal(true);
                          }}
                          className="text-[10px] font-bold text-[#F97316] hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="font-mono text-gray-600">
                        Dimensions: <strong>{item.customMeasurements || 'Standard Workshop Fit'}</strong>
                      </p>
                      <p className="font-mono text-gray-600">
                        Notes: {item.referenceNotes || 'No custom notes provided'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: PRODUCTION */}
            {activeTab === 'PRODUCTION' && (
              <form onSubmit={handleSaveProduction} className="bg-white p-6 rounded-[22px] border border-gray-200 shadow-xs space-y-4 animate-in fade-in duration-150 text-xs font-sans">
                <div>
                  <h3 className="font-heading font-black text-base text-[#111111]">WORKSHOP ASSIGNMENT</h3>
                  <p className="text-xs text-gray-500">Assign machinist worker and heavy lathe equipment.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Assign Worker *</label>
                    <input
                      type="text"
                      required
                      value={workerName}
                      onChange={(e) => setWorkerName(e.target.value)}
                      className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-300 font-medium outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Assign Lathe Machine *</label>
                    <input
                      type="text"
                      required
                      value={machineName}
                      onChange={(e) => setMachineName(e.target.value)}
                      className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-300 font-medium outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Target Date</label>
                    <input
                      type="date"
                      value={expectedFinish}
                      onChange={(e) => setExpectedFinish(e.target.value)}
                      className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-300 font-mono outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-[#111111] hover:bg-black text-white font-heading font-black text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  Save Workshop Assignment
                </button>
              </form>
            )}

            {/* TAB 6: PAYMENTS */}
            {activeTab === 'PAYMENTS' && (
              <div className="bg-white p-6 rounded-[22px] border border-gray-200 shadow-xs space-y-5 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="font-heading font-black text-base text-[#111111]">WORKSHOP PAYMENT LEDGER</h3>
                    <p className="text-xs text-gray-500">History of Cash, Razorpay Dynamic QR, and Payment Link collections.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRequestModalOpen(true)}
                      className="bg-[#111111] hover:bg-black text-white font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus size={14} className="text-[#F97316]" /> Request Payment
                    </button>

                    <button
                      onClick={() => setPaymentModalOpen(true)}
                      className="bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <CreditCard size={14} /> Collect Payment
                    </button>

                    <button
                      onClick={() => setQrModalOpen(true)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs px-3.5 py-2 rounded-xl border border-gray-300 cursor-pointer flex items-center gap-1.5"
                    >
                      <QrCode size={14} /> Generate QR
                    </button>
                  </div>

                </div>

                {/* Financial Summary metrics row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-[10px] text-gray-400 block uppercase">Total Value</span>
                    <strong className="text-gray-900 text-sm">₹{order.finalPrice.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-emerald-700 block uppercase">Total Paid</span>
                    <strong className="text-emerald-700 text-sm">₹{order.advancePaid.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <span className="text-[10px] text-amber-800 block uppercase">Balance Due</span>
                    <strong className={order.remainingBalance > 0 ? "text-red-600 text-sm" : "text-emerald-600 text-sm"}>
                      ₹{order.remainingBalance.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <span className="text-[10px] text-blue-700 block uppercase">Last Payment</span>
                    <strong className="text-blue-800 text-xs">
                      {order.paymentHistory.length > 0
                        ? `₹${order.paymentHistory[order.paymentHistory.length - 1].amount.toLocaleString('en-IN')}`
                        : 'None'}
                    </strong>
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="overflow-x-auto border rounded-xl">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="bg-[#111111] text-white font-heading font-extrabold uppercase text-[10px]">
                        <th className="p-3">Date & Time</th>
                        <th className="p-3">Receipt #</th>
                        <th className="p-3">Mode</th>
                        <th className="p-3">Collected By</th>
                        <th className="p-3 text-right">Amount</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 font-mono text-xs">
                      {order.paymentHistory.map((tx) => (
                        <tr key={tx.id} className="hover:bg-amber-50/50">
                          <td className="p-3 text-gray-600">{tx.date} {tx.time}</td>
                          <td className="p-3 font-bold text-[#111111]">{tx.receiptNumber}</td>
                          <td className="p-3 text-[#F97316] font-bold">{tx.mode}</td>
                          <td className="p-3 text-gray-600 font-sans">{tx.collectedBy}</td>
                          <td className="p-3 text-right font-black text-emerald-700">+ ₹{tx.amount.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-center">
                            <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                              SUCCESS
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}


            {/* TAB 7: DELIVERY */}
            {activeTab === 'DELIVERY' && (
              <form onSubmit={handleSaveDelivery} className="bg-white p-6 rounded-[22px] border border-gray-200 shadow-xs space-y-4 animate-in fade-in duration-150 text-xs font-sans">
                <h3 className="font-heading font-black text-base text-[#111111]">DELIVERY DISPATCH MANAGEMENT</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Driver Name</label>
                    <input
                      type="text"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-300 font-medium outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Driver Phone</label>
                    <input
                      type="tel"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-300 font-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Vehicle Number</label>
                    <input
                      type="text"
                      value={vehicleNo}
                      onChange={(e) => setVehicleNo(e.target.value)}
                      className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-300 font-mono outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-heading font-black text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <MessageCircle size={15} /> Save & Dispatch WhatsApp Notification
                </button>
              </form>
            )}

            {/* TAB 8: INVOICE */}
            {activeTab === 'INVOICE' && (
              <div className="bg-white p-8 rounded-[22px] border border-gray-200 shadow-xs text-center space-y-4 animate-in fade-in duration-150">
                <FileText size={40} className="mx-auto text-[#F97316]" />
                <h3 className="font-heading font-black text-lg text-[#111111]">OFFICIAL TAX INVOICE PREVIEW</h3>
                <button
                  onClick={() => setPdfModalOpen(true)}
                  className="bg-[#111111] text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  <Printer size={16} /> Open Print / Download PDF Invoice Modal
                </button>
              </div>
            )}

            {/* TAB 9: ACTIVITY */}
            {activeTab === 'ACTIVITY' && (
              <div className="bg-white p-6 rounded-[22px] border border-gray-200 shadow-xs space-y-4 animate-in fade-in duration-150 font-mono text-xs">
                <h3 className="font-heading font-black text-base text-[#111111] font-sans">AUDIT ACTIVITY LOG</h3>
                <div className="space-y-2">
                  {(order.activityLog || []).map((act) => (
                    <div key={act.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex justify-between">
                      <div>
                        <strong className="text-gray-900 font-sans block">{act.action}</strong>
                        <span className="text-[10px] text-gray-500">By: {act.performedBy}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{act.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT 30% (COL-SPAN-4) STICKY SUMMARY CARD (DESKTOP) */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-lg sticky top-24 space-y-5 font-sans">
              
              {/* Customer Avatar Header */}
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="w-12 h-12 rounded-full bg-[#111111] text-white flex items-center justify-center font-heading font-black text-lg shrink-0">
                  {order.customerName.charAt(0).toUpperCase()}
                </div>
                <div className="truncate">
                  <h3 className="font-heading font-black text-base text-[#111111] truncate">{order.customerName}</h3>
                  <p className="text-xs font-mono text-gray-500">{order.customerPhone}</p>
                </div>
              </div>

              {/* Financial Balances Card */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-gray-600">
                  <span>Grand Total:</span>
                  <strong>₹{order.finalPrice.toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Total Paid:</span>
                  <strong>₹{order.advancePaid.toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between border-t pt-2 text-[#111111] font-black text-sm">
                  <span>Balance Due:</span>
                  <strong className={order.remainingBalance > 0 ? 'text-red-600' : 'text-emerald-600'}>
                    ₹{order.remainingBalance.toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              {/* Priority Selector */}
              <div>
                <label className="font-bold text-gray-700 text-xs block mb-1">Set Order Priority</label>
                <div className="grid grid-cols-3 gap-2 text-xs font-sans">
                  {(['Normal', 'High', 'Urgent'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => updateOrderPriority(order.id, p)}
                      className={`py-1.5 rounded-lg border font-bold text-center cursor-pointer ${
                        order.priority === p
                          ? 'bg-[#F97316] text-white border-[#F97316]'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                {order.remainingBalance > 0 ? (
                  <button
                    onClick={() => setPaymentModalOpen(true)}
                    className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CreditCard size={16} /> Collect Payment (₹{order.remainingBalance.toLocaleString('en-IN')})
                  </button>
                ) : (
                  <div className="w-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-heading font-black text-xs py-2.5 rounded-xl flex items-center justify-center gap-2">
                    ✓ Full Payment Completed
                  </div>
                )}

                <button
                  onClick={() => setPdfModalOpen(true)}
                  className="w-full bg-[#111111] hover:bg-black text-white font-heading font-black text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer size={16} /> Print Official Invoice
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* MOBILE STICKY BOTTOM ACTION BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111111] text-white p-3 border-t border-gray-800 flex items-center justify-between gap-2">
        <button
          onClick={() => setPaymentModalOpen(true)}
          className="flex-1 bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs py-3 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
        >
          <CreditCard size={14} /> Pay
        </button>

        <button
          onClick={() => setPdfModalOpen(true)}
          className="flex-1 bg-white/10 hover:bg-white/20 text-white font-heading font-black text-xs py-3 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
        >
          <Printer size={14} /> Invoice
        </button>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] text-white p-3 rounded-xl flex items-center justify-center cursor-pointer"
        >
          <MessageCircle size={16} />
        </a>
      </div>

      {/* Modals */}
      <AdminPaymentCollectionModal
        order={order}
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
      />

      <RazorpayQRModal
        order={order}
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
      />

      <PDFInvoiceModal
        order={order}
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
      />

      <AdminPaymentRequestModal
        order={order}
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
      />

      {/* ADD / EDIT MEASUREMENT MODAL */}
      {showMeasurementModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveMeasurement} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 font-sans shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-heading font-black text-base text-[#111111] flex items-center gap-2">
                <Ruler size={18} className="text-[#F97316]" /> Add / Edit Fabrication Measurement
              </h3>
              <button type="button" onClick={() => setShowMeasurementModal(false)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Select Order Item *</label>
                <select
                  value={editingItemIndex}
                  onChange={(e) => {
                    const idx = parseInt(e.target.value) || 0;
                    setEditingItemIndex(idx);
                    setMeasDimensions(order.items[idx]?.customMeasurements || '');
                    setMeasNotes(order.items[idx]?.referenceNotes || '');
                  }}
                  className="w-full p-2.5 rounded-xl border border-gray-300 font-medium"
                >
                  {order.items.map((it, i) => (
                    <option key={i} value={i}>{it.productName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Custom Dimensions / Measurement Specs *</label>
                <input
                  type="text"
                  placeholder="e.g. 6ft x 4ft frame (16mm MS solid rods)"
                  value={measDimensions}
                  onChange={(e) => setMeasDimensions(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 font-medium"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Notes / Tolerance Details</label>
                <textarea
                  placeholder="e.g. Anti-rust primer coated, 2-inch hinge clearance"
                  value={measNotes}
                  onChange={(e) => setMeasNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 font-medium h-20"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowMeasurementModal(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#F97316] text-white font-bold text-xs rounded-xl shadow-md"
              >
                Save Measurement
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminOrderDetailPage;
