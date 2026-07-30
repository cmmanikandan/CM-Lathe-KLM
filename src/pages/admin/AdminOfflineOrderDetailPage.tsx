import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { Order, OrderStatus } from '../../types';
import { PDFInvoiceModal } from '../../components/common/PDFInvoiceModal';
import { AdminPaymentCollectionModal } from '../../components/common/AdminPaymentCollectionModal';
import { RazorpayQRModal } from '../../components/common/RazorpayQRModal';
import { AdminPOSReceiptModal } from '../../components/common/AdminPOSReceiptModal';
import { ReduceDiscountModal } from '../../components/common/ReduceDiscountModal';
import { DeleteOrderConfirmationModal } from '../../components/common/DeleteOrderConfirmationModal';
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
} from 'lucide-react';

export const AdminOfflineOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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
    updateOrderDiscount,
    deleteOrder,
  } = useOrders();

  const order = getOrderById(id || '');

  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'TIMELINE' | 'PRODUCTS' | 'PAYMENTS' | 'PRODUCTION' | 'DELIVERY' | 'INVOICE' | 'ACTIVITY'
  >('OVERVIEW');

  // Modals
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [reduceModalOpen, setReduceModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleReduceAmount = () => {
    setReduceModalOpen(true);
  };

  const handleDeleteOrder = () => {
    setDeleteModalOpen(true);
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
        <h2 className="font-heading font-black text-xl text-[#111111]">Offline Order Not Found</h2>
        <button
          onClick={() => navigate('/admin/offline-orders/today')}
          className="bg-[#111111] text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
        >
          Back to Offline Orders Dashboard
        </button>
      </div>
    );
  }

  const cleanPhone = order.customerPhone.replace(/\D/g, '').slice(-10);
  const waText = encodeURIComponent(
    `Hello ${order.customerName}, update regarding MANIKANDAN LATHE Order #${order.orderNumber}. Current Status: ${order.status}. Agreed Price: ₹${order.finalPrice.toLocaleString(
      'en-IN'
    )}, Remaining Balance: ₹${order.remainingBalance.toLocaleString('en-IN')}. Thank you!`
  );
  const waUrl = `https://wa.me/91${cleanPhone}?text=${waText}`;

  const isPosBill =
    (order.orderType as string) === 'Quick Order' ||
    (order.orderType as string) === 'Walk-in Order' ||
    (order.orderType as string) === 'POS Quick Order' ||
    order.orderNumber.startsWith('POS-');

  if (isPosBill) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-[#111111] pb-24 font-sans space-y-6">
        
        {/* Top POS Header */}
        <div className="bg-[#111111] text-white p-6 shadow-md border-b border-gray-800">
          <div className="max-w-7xl mx-auto space-y-4">
            
            {/* Header Top Row: Navigation + Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (window.history.length > 1) {
                      navigate(-1);
                    } else {
                      navigate('/admin/offline-orders/today');
                    }
                  }}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#F97316] font-bold uppercase tracking-widest">
                      SHOP COUNTER POS BILL DETAIL
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border border-emerald-500/30">
                      POS COUNTER SALE
                    </span>
                  </div>
                  <h1 className="font-heading font-black text-2xl text-white mt-0.5 flex items-center gap-3">
                    #{order.orderNumber}
                    <span className="text-xs font-mono text-gray-400 font-normal">
                      ({new Date(order.createdAt).toLocaleDateString('en-IN')} {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })})
                    </span>
                  </h1>
                </div>
              </div>

              {/* Customer Quick Badge */}
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-xs font-mono">
                <User size={14} className="text-[#F97316]" />
                <span className="text-gray-200 font-sans font-bold">{order.customerName}</span>
                <span className="text-gray-500">|</span>
                <span className="text-gray-400">{order.customerPhone}</span>
              </div>
            </div>

            {/* Header Action Toolbar Section */}
            <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {order.remainingBalance > 0 && (
                  <button
                    onClick={() => setPaymentModalOpen(true)}
                    className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <CreditCard size={15} /> Collect Balance (₹{order.remainingBalance.toLocaleString('en-IN')})
                  </button>
                )}

                <button
                  onClick={handleReduceAmount}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-heading font-black text-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <Sparkles size={15} /> Reduce / Discount
                </button>

                <button
                  onClick={() => setReceiptModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-black text-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <Printer size={15} /> Thermal POS Bill
                </button>

                <button
                  onClick={() => setPdfModalOpen(true)}
                  className="bg-white/10 hover:bg-white/20 text-white font-heading font-black text-xs px-3.5 py-2.5 rounded-xl border border-white/15 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <FileText size={15} /> Tax Invoice (A4)
                </button>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-heading font-black text-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <MessageCircle size={15} /> WhatsApp
                </a>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDeleteOrder}
                  className="bg-red-600 hover:bg-red-700 text-white font-heading font-black text-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <Trash2 size={15} /> Delete Bill
                </button>
              </div>
            </div>

            {/* POS Banner Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-3 border-t border-gray-800">
              <div>
                <span className="text-gray-400 block text-[10px]">Customer Name:</span>
                <strong className="text-white text-sm font-sans">{order.customerName}</strong>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Mobile Phone:</span>
                <strong className="text-white text-sm">{order.customerPhone}</strong>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Total Billed Amount:</span>
                <strong className="text-white text-sm font-bold">₹{order.finalPrice.toLocaleString('en-IN')}</strong>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Payment Status:</span>
                <strong className={order.remainingBalance > 0 ? 'text-red-400 text-sm' : 'text-emerald-400 text-sm'}>
                  {order.remainingBalance > 0 ? `DUE ₹${order.remainingBalance.toLocaleString('en-IN')}` : 'FULLY PAID ✓'}
                </strong>
              </div>
            </div>

          </div>
        </div>

        {/* Dashboard Grid (2 Columns) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (8 Cols): Items & Pricing Summary */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Itemized Table Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="font-heading font-black text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2">
                  <Building2 size={18} className="text-[#F97316]" /> BOUGHT POS ITEMS ({order.items.length})
                </h3>
                <span className="text-xs font-mono text-gray-500 font-bold">POS Counter Sale</span>
              </div>

              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="bg-[#111111] text-white font-heading font-extrabold uppercase text-[10px]">
                      <th className="p-3">Item Name</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 font-mono text-xs">
                    {order.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-3 font-sans">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80'}
                              alt={item.productName}
                              className="w-12 h-12 rounded-lg object-cover border"
                            />
                            <div>
                              <strong className="font-heading font-black text-xs text-[#111111] block">{item.productName}</strong>
                              {item.variant?.size && <span className="text-[10px] text-gray-500 font-mono block">Variant: {item.variant.size}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-center font-bold text-sm font-sans">{item.quantity}</td>
                        <td className="p-3 text-right text-gray-600">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right font-black text-[#111111] text-sm">₹{item.totalPrice.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pricing breakdown box */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-gray-600">
                  <span>Items Subtotal:</span>
                  <span>₹{order.basePrice.toLocaleString('en-IN')}</span>
                </div>
                {order.reducedAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Manual Discount / Reduce:</span>
                    <span>- ₹{order.reducedAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-[#111111] border-t pt-2 font-sans">
                  <span>Total Billed Amount:</span>
                  <span className="text-base text-[#F97316]">₹{order.finalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Customer Details Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <h3 className="font-heading font-black text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2">
                <User size={18} className="text-[#F97316]" /> CUSTOMER INFORMATION
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <span className="text-gray-400 text-[10px] block font-mono">Customer Name:</span>
                  <strong className="text-base text-[#111111] font-heading font-bold">{order.customerName}</strong>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block font-mono">Mobile Phone:</span>
                  <strong className="text-sm font-mono text-[#F97316]">{order.customerPhone}</strong>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-400 text-[10px] block font-mono">Address:</span>
                  <p className="text-gray-800 font-medium">{order.customerAddress || 'Kallimandhayam Walk-in Counter'}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (4 Cols): Payment History Audit Ledger & Quick Print Buttons */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Financial Status Summary */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <h3 className="font-heading font-black text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2">
                <CreditCard size={18} className="text-[#F97316]" /> PAYMENT BREAKDOWN
              </h3>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center text-gray-700">
                  <span>Amount Paid:</span>
                  <strong className="text-emerald-700 text-sm font-bold">₹{order.advancePaid.toLocaleString('en-IN')}</strong>
                </div>

                <div className="flex justify-between items-center pt-2 border-t text-sm font-black">
                  <span>Remaining Due Balance:</span>
                  <strong className={order.remainingBalance > 0 ? 'text-red-600 text-base' : 'text-emerald-600 text-base'}>
                    ₹{order.remainingBalance.toLocaleString('en-IN')}
                  </strong>
                </div>

                {order.remainingBalance > 0 ? (
                  <button
                    onClick={() => setPaymentModalOpen(true)}
                    className="w-full mt-2 py-3 bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CreditCard size={16} /> Collect Remaining Balance
                  </button>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-center text-emerald-800 font-bold text-xs">
                    ✓ Fully Paid & Settled
                  </div>
                )}
              </div>
            </div>

            {/* Payment History Audit Ledger */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <h3 className="font-heading font-black text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2">
                <Activity size={18} className="text-[#F97316]" /> PAYMENT HISTORY LEDGER
              </h3>

              {order.paymentHistory && order.paymentHistory.length > 0 ? (
                <div className="space-y-2 font-mono text-xs">
                  {order.paymentHistory.map((tx) => (
                    <div key={tx.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-500">{tx.date} {tx.time}</span>
                        <span className="bg-orange-100 text-[#F97316] font-bold text-[10px] px-2 py-0.5 rounded uppercase">{tx.mode}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 font-bold">
                        <span>Collected:</span>
                        <span className="text-emerald-700 text-sm">+ ₹{tx.amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 flex justify-between">
                        <span>Receipt #{tx.receiptNumber}</span>
                        <span>Due After: ₹{tx.remainingBalanceAfter.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 font-mono italic">No payment history records found.</p>
              )}
            </div>

            {/* Quick Print Receipt Buttons Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3 text-center">
              <h3 className="font-heading font-black text-sm text-[#111111] uppercase">PRINT BILL & INVOICE</h3>
              
              <div className="space-y-2">
                <button
                  onClick={() => setReceiptModalOpen(true)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer size={15} /> Open Thermal POS Receipt
                </button>

                <button
                  onClick={() => setPdfModalOpen(true)}
                  className="w-full py-2.5 bg-[#111111] hover:bg-black text-white font-heading font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText size={15} /> Open Tax Invoice PDF (A4)
                </button>
              </div>
            </div>

          </div>

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

        <AdminPOSReceiptModal
          order={order}
          isOpen={receiptModalOpen}
          onClose={() => setReceiptModalOpen(false)}
        />

        <ReduceDiscountModal
          order={order}
          isOpen={reduceModalOpen}
          onClose={() => setReduceModalOpen(false)}
        />

        <DeleteOrderConfirmationModal
          order={order}
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onSuccess={() => navigate('/admin/offline-orders/today')}
        />

      </div>
    );
  }

  // Timeline statuses
  const timelinePipeline: Array<{ status: OrderStatus; label: string; desc: string }> = [
    { status: 'PENDING', label: 'Order Received', desc: 'Recorded at workshop counter' },
    { status: 'ACCEPTED', label: 'Admin Accepted', desc: 'Price & advance accepted' },
    { status: 'MATERIAL_READY', label: 'Material Ready', desc: 'Raw iron/steel allocated' },
    { status: 'IN_PRODUCTION', label: 'Workshop Production', desc: 'Lathe machining & welding' },
    { status: 'QUALITY_CHECK', label: 'Quality Check', desc: 'Inspected by foreman' },
    { status: 'READY', label: 'Ready for Pickup / Dispatch', desc: 'Fabrication completed' },
    { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Loaded on vehicle' },
    { status: 'INSTALLED', label: 'Installed at Site', desc: 'Customer site erection done' },
    { status: 'COMPLETED', label: 'Order Completed', desc: 'Paid & finished' },
  ];

  const currentTimelineIndex = timelinePipeline.findIndex((t) => t.status === order.status);

  // Handle Production Save
  const handleSaveProduction = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateOrderProduction(order.id, workerName, machineName, expectedFinish, prodNotes);
    alert('Worker and Machine assignment saved successfully.');
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
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] pb-24 font-sans space-y-6">
      
      {/* Top Header Bar */}
      <div className="bg-[#111111] text-white p-6 shadow-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto space-y-4">
          
          {/* Header Top Row: Navigation + Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (window.history.length > 1) {
                    navigate(-1);
                  } else {
                    navigate('/admin/offline-orders/today');
                  }
                }}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#F97316] font-bold uppercase tracking-widest">
                    OFFLINE ERP DETAIL VIEW
                  </span>
                  <span className="bg-orange-100 text-[#F97316] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border border-orange-300">
                    {order.orderType || 'Walk-in Order'}
                  </span>
                </div>
                <h1 className="font-heading font-black text-2xl text-white mt-0.5 flex items-center gap-3">
                  #{order.orderNumber}
                  <span className="text-xs font-mono text-gray-400 font-normal">
                    ({new Date(order.createdAt).toLocaleDateString('en-IN')})
                  </span>
                </h1>
              </div>
            </div>

            {/* Customer Quick Badge */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-xs font-mono">
              <User size={14} className="text-[#F97316]" />
              <span className="text-gray-200 font-sans font-bold">{order.customerName}</span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-400">{order.customerPhone}</span>
            </div>
          </div>

          {/* Header Quick Action Toolbar */}
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setPaymentModalOpen(true)}
                className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <CreditCard size={15} /> Collect Payment / Pay Balance
              </button>

              <button
                onClick={handleReduceAmount}
                className="bg-blue-600 hover:bg-blue-700 text-white font-heading font-black text-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <Sparkles size={15} /> Reduce / Discount
              </button>

              <button
                onClick={() => setReceiptModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-black text-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <Printer size={15} /> POS Thermal Bill
              </button>

              <button
                onClick={() => setPdfModalOpen(true)}
                className="bg-white/10 hover:bg-white/20 text-white font-heading font-black text-xs px-3.5 py-2.5 rounded-xl border border-white/15 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <FileText size={15} /> Tax Invoice (A4)
              </button>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-heading font-black text-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <MessageCircle size={15} /> WhatsApp
              </a>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDeleteOrder}
                className="bg-red-600 hover:bg-red-700 text-white font-heading font-black text-xs px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <Trash2 size={15} /> Delete Order
              </button>
            </div>
          </div>

          {/* Key Metrics Banner Header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-2 border-t border-gray-800">
            <div>
              <span className="text-gray-400 block text-[10px]">Customer:</span>
              <strong className="text-white text-sm font-sans">{order.customerName}</strong>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">Phone Number:</span>
              <strong className="text-white text-sm">{order.customerPhone}</strong>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">Current Status:</span>
              <strong className="text-[#F97316] text-sm uppercase">{order.status}</strong>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">Remaining Due Balance:</span>
              <strong className={order.remainingBalance > 0 ? 'text-red-400 text-sm' : 'text-emerald-400 text-sm'}>
                ₹{order.remainingBalance.toLocaleString('en-IN')}
              </strong>
            </div>
          </div>

        </div>
      </div>

      {/* 8 TAB NAVIGATION HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-1 overflow-x-auto text-xs font-heading">
          {[
            { id: 'OVERVIEW', title: 'Overview', icon: User },
            { id: 'TIMELINE', title: 'Timeline', icon: Clock },
            { id: 'PRODUCTS', title: 'Products', icon: Building2 },
            { id: 'PAYMENTS', title: 'Payments', icon: CreditCard },
            { id: 'PRODUCTION', title: 'Production', icon: Wrench },
            { id: 'DELIVERY', title: 'Delivery', icon: Truck },
            { id: 'INVOICE', title: 'Invoice', icon: FileText },
            { id: 'ACTIVITY', title: 'Activity Log', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                  active
                    ? 'bg-[#111111] text-white shadow-md'
                    : 'text-gray-600 hover:text-black hover:bg-gray-100'
                }`}
              >
                <Icon size={16} className={active ? 'text-[#F97316]' : 'text-gray-400'} />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT PANELS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-150">
            
            {/* Left 7 Cols */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Customer Details Card */}
              <div className="bg-white p-6 rounded-[22px] border border-gray-200 shadow-xs space-y-4">
                <h3 className="font-heading font-black text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2">
                  <User size={16} className="text-[#F97316]" /> CUSTOMER PROFILE & CONTACT
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                  <div>
                    <span className="text-gray-400 text-[10px] block font-mono">Full Name:</span>
                    <strong className="text-base text-[#111111] font-heading font-bold">{order.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block font-mono">Mobile Number:</span>
                    <strong className="text-sm font-mono text-[#F97316]">{order.customerPhone}</strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-400 text-[10px] block font-mono">Delivery / Workshop Address:</span>
                    <p className="text-gray-800 font-medium">{order.customerAddress || 'Kallimandhayam Counter Walk-in'}</p>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(order.customerAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <MapPin size={14} className="text-red-500" /> Open in Google Maps
                  </a>
                </div>
              </div>

              {/* Products Summary Card */}
              <div className="bg-white p-6 rounded-[22px] border border-gray-200 shadow-xs space-y-4">
                <h3 className="font-heading font-black text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2">
                  <Building2 size={16} className="text-[#F97316]" /> ORDERED PRODUCTS ({order.items.length})
                </h3>

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
                            Size: {item.variant?.size || 'Standard'} | Qty: {item.quantity}
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

            </div>

            {/* Right 5 Cols */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Financial Order Summary Card */}
              <div className="bg-white p-6 rounded-[22px] border border-gray-200 shadow-xs space-y-4">
                <h3 className="font-heading font-black text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2">
                  <CreditCard size={16} className="text-[#F97316]" /> FINANCIAL SUMMARY
                </h3>

                <div className="space-y-2 text-xs font-mono border-b border-gray-100 pb-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Base Machinery Price:</span>
                    <span>₹{order.basePrice.toLocaleString('en-IN')}</span>
                  </div>
                  {order.labourCharge ? (
                    <div className="flex justify-between text-gray-600">
                      <span>Labour Charge:</span>
                      <span>+ ₹{order.labourCharge.toLocaleString('en-IN')}</span>
                    </div>
                  ) : null}
                  {order.fabricationCharge ? (
                    <div className="flex justify-between text-gray-600">
                      <span>Fabrication Charge:</span>
                      <span>+ ₹{order.fabricationCharge.toLocaleString('en-IN')}</span>
                    </div>
                  ) : null}
                  {order.reducedAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Manual Discount:</span>
                      <span>- ₹{order.reducedAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-[#111111] border-t pt-2">
                    <span>Total Agreed Price:</span>
                    <span>₹{order.finalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Advance Received:</span>
                    <span>₹{order.advancePaid.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-base font-black pt-1">
                    <span>Remaining Due Balance:</span>
                    <span className={order.remainingBalance > 0 ? 'text-red-600' : 'text-emerald-600'}>
                      ₹{order.remainingBalance.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assigned Staff Card */}
              <div className="bg-white p-6 rounded-[22px] border border-gray-200 shadow-xs space-y-3">
                <h3 className="font-heading font-black text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2">
                  <Wrench size={16} className="text-[#F97316]" /> ASSIGNED WORKSHOP STAFF
                </h3>
                <div className="p-3 bg-gray-50 rounded-xl space-y-1 text-xs font-mono border border-gray-200">
                  <p>Worker: <strong>{order.assignedWorker || 'Chellamuthu K (Senior Machinist)'}</strong></p>
                  <p>Machine: <strong>{order.assignedMachine || 'Lathe Machine #1'}</strong></p>
                  <p>Priority: <strong className="text-[#F97316] uppercase">{order.priority || 'Normal'}</strong></p>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: EDITABLE PRODUCTION TIMELINE */}
        {activeTab === 'TIMELINE' && (
          <div className="bg-white p-8 rounded-[24px] border border-gray-200 shadow-xs space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="font-heading font-black text-base text-[#111111]">WORKSHOP PRODUCTION PIPELINE</h3>
              <p className="text-xs text-gray-500">Click any status step below to update live order status.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {timelinePipeline.map((step, idx) => {
                const isCurrent = step.status === order.status;
                const isPassed = idx <= currentTimelineIndex;
                return (
                  <button
                    key={step.status}
                    onClick={() => updateOrderStatus(order.id, step.status)}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-2 transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-[#F97316] text-white border-[#F97316] shadow-lg scale-102'
                        : isPassed
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono font-bold uppercase">STEP {idx + 1}</span>
                      {isCurrent ? (
                        <CheckCircle2 size={16} className="text-white" />
                      ) : isPassed ? (
                        <CheckCircle2 size={16} className="text-emerald-600" />
                      ) : null}
                    </div>

                    <div>
                      <h4 className="font-heading font-black text-xs">{step.label}</h4>
                      <p className="text-[10px] opacity-80 mt-0.5 line-clamp-1">{step.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCTS */}
        {activeTab === 'PRODUCTS' && (
          <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-xs space-y-4 animate-in fade-in duration-150">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-heading font-black text-base text-[#111111]">ITEMIZED PRODUCT DETAILS</h3>
                <p className="text-xs text-gray-500">Custom machinery dimensions, variants, unit prices and GST breakdown.</p>
              </div>
            </div>

            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="bg-[#111111] text-white font-heading font-extrabold uppercase text-[10px]">
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Variant / Dimensions</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-mono text-xs">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-[#111111] font-sans">{item.productName}</td>
                      <td className="p-3 text-gray-600">{item.variant?.size || 'Standard'}</td>
                      <td className="p-3 text-center font-bold">{item.quantity}</td>
                      <td className="p-3 text-right text-gray-600">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right font-black text-[#111111]">
                        ₹{item.totalPrice.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: PAYMENTS */}
        {activeTab === 'PAYMENTS' && (
          <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-xs space-y-5 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-heading font-black text-base text-[#111111]">PAYMENT HISTORY & LEDGER</h3>
                <p className="text-xs text-gray-500">Itemized audit ledger of all cash and online payments.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPaymentModalOpen(true)}
                  className="bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs cursor-pointer"
                >
                  + Collect Payment
                </button>
                <button
                  onClick={() => setQrModalOpen(true)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer"
                >
                  Generate Razorpay QR
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="bg-[#111111] text-white font-heading font-extrabold text-[10px] uppercase">
                    <th className="p-3">Date & Time</th>
                    <th className="p-3">Receipt #</th>
                    <th className="p-3">Payment Mode</th>
                    <th className="p-3">Collected By</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3 text-right">Remaining Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-mono text-xs">
                  {order.paymentHistory.map((tx) => (
                    <tr key={tx.id} className="hover:bg-amber-50/50">
                      <td className="p-3 text-gray-600">{tx.date} {tx.time}</td>
                      <td className="p-3 font-bold text-[#111111]">{tx.receiptNumber}</td>
                      <td className="p-3 text-[#F97316] font-bold">{tx.mode}</td>
                      <td className="p-3 text-gray-600 font-sans">{tx.collectedBy}</td>
                      <td className="p-3 text-right font-black text-emerald-700">
                        + ₹{tx.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 text-right font-bold text-gray-900">
                        ₹{tx.remainingBalanceAfter.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: PRODUCTION */}
        {activeTab === 'PRODUCTION' && (
          <form onSubmit={handleSaveProduction} className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-xs space-y-5 animate-in fade-in duration-150 text-xs font-sans">
            <div>
              <h3 className="font-heading font-black text-base text-[#111111]">PRODUCTION & WORKER ASSIGNMENT</h3>
              <p className="text-xs text-gray-500">Assign workshop machinist, lathe machinery & target finish date.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Assign Worker / Machinist *</label>
                <input
                  type="text"
                  required
                  value={workerName}
                  onChange={(e) => setWorkerName(e.target.value)}
                  className="w-full bg-gray-50 hover:bg-white focus:bg-white p-2.5 rounded-xl border border-gray-300 font-medium text-gray-900 outline-none focus:border-[#F97316]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Assign Lathe / Welding Machine *</label>
                <input
                  type="text"
                  required
                  value={machineName}
                  onChange={(e) => setMachineName(e.target.value)}
                  className="w-full bg-gray-50 hover:bg-white focus:bg-white p-2.5 rounded-xl border border-gray-300 font-medium text-gray-900 outline-none focus:border-[#F97316]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Target Completion Date</label>
                <input
                  type="date"
                  value={expectedFinish}
                  onChange={(e) => setExpectedFinish(e.target.value)}
                  className="w-full bg-gray-50 hover:bg-white focus:bg-white p-2.5 rounded-xl border border-gray-300 font-mono text-gray-900 outline-none focus:border-[#F97316]"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Workshop Fabrication Notes</label>
              <textarea
                rows={3}
                placeholder="Specific lathe turning, welding or tolerance instructions..."
                value={prodNotes}
                onChange={(e) => setProdNotes(e.target.value)}
                className="w-full bg-gray-50 hover:bg-white focus:bg-white p-2.5 rounded-xl border border-gray-300 font-medium text-gray-900 outline-none focus:border-[#F97316]"
              />
            </div>

            <button
              type="submit"
              className="bg-[#111111] hover:bg-black text-white font-heading font-black text-xs px-6 py-3 rounded-xl shadow-md cursor-pointer"
            >
              Save Worker & Machine Assignment
            </button>
          </form>
        )}

        {/* TAB 6: DELIVERY */}
        {activeTab === 'DELIVERY' && (
          <form onSubmit={handleSaveDelivery} className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-xs space-y-5 animate-in fade-in duration-150 text-xs font-sans">
            <div>
              <h3 className="font-heading font-black text-base text-[#111111]">DELIVERY & ERECTION MANAGEMENT</h3>
              <p className="text-xs text-gray-500">Configure vehicle dispatch, driver details & installation team.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Fulfillment Mode</label>
                <select
                  value={fulfillmentType}
                  onChange={(e) => setFulfillmentType(e.target.value as any)}
                  className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-300 font-bold outline-none"
                >
                  <option value="Home Delivery">Home Delivery</option>
                  <option value="Installation">Installation at Site</option>
                  <option value="Pickup">Customer Self-Pickup</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Driver / Executive Name</label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-300 font-medium text-gray-900 outline-none"
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
              className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-heading font-black text-xs px-6 py-3 rounded-xl shadow-md cursor-pointer flex items-center gap-2"
            >
              <MessageCircle size={16} /> Save & Dispatch Delivery Notification
            </button>
          </form>
        )}

        {/* TAB 7: INVOICE */}
        {activeTab === 'INVOICE' && (
          <div className="bg-white p-8 rounded-[24px] border border-gray-200 shadow-xs text-center space-y-5 animate-in fade-in duration-150">
            <FileText size={44} className="mx-auto text-[#F97316]" />
            <div>
              <h3 className="font-heading font-black text-lg text-[#111111]">OFFICIAL GST TAX INVOICE</h3>
              <p className="text-xs text-gray-500 font-mono">Invoice Number: INV-{order.orderNumber}</p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setPdfModalOpen(true)}
                className="bg-[#111111] hover:bg-black text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Printer size={16} /> View & Print Tax Invoice PDF
              </button>
            </div>
          </div>
        )}

        {/* TAB 8: ACTIVITY LOG */}
        {activeTab === 'ACTIVITY' && (
          <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-xs space-y-4 animate-in fade-in duration-150">
            <div>
              <h3 className="font-heading font-black text-base text-[#111111]">REAL-TIME AUDIT LOG HISTORY</h3>
              <p className="text-xs text-gray-500">Timestamped record of all staff edits, status changes & payments.</p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {(order.activityLog && order.activityLog.length > 0
                ? order.activityLog
                : [
                    {
                      id: '1',
                      timestamp: new Date(order.createdAt).toLocaleString('en-IN'),
                      action: 'Order Created at Workshop Counter',
                      performedBy: 'Staff Counter POS',
                    },
                  ]
              ).map((act) => (
                <div key={act.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center">
                  <div>
                    <strong className="text-[#111111] font-sans block">{act.action}</strong>
                    <span className="text-[10px] text-gray-500">Performed by: {act.performedBy}</span>
                  </div>
                  <span className="text-[11px] text-gray-400">{act.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Admin Payment Collection Modal */}
      <AdminPaymentCollectionModal
        order={order}
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
      />

      {/* Razorpay QR Modal */}
      <RazorpayQRModal
        order={order}
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
      />

      {/* PDF Invoice Modal */}
      <PDFInvoiceModal
        order={order}
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
      />

      {/* POS Thermal Receipt Modal */}
      <AdminPOSReceiptModal
        order={order}
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
      />

      <ReduceDiscountModal
        order={order}
        isOpen={reduceModalOpen}
        onClose={() => setReduceModalOpen(false)}
      />

      <DeleteOrderConfirmationModal
        order={order}
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onSuccess={() => navigate('/admin/offline-orders/today')}
      />

    </div>
  );
};

export default AdminOfflineOrderDetailPage;
