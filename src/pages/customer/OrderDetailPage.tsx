import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { PDFInvoiceModal } from '../../components/common/PDFInvoiceModal';
import { RazorpayPaymentModal } from '../../components/common/RazorpayPaymentModal';
import { createCancellationWhatsAppMessage } from '../../services/whatsappService';
import {
  ArrowLeft,
  FileText,
  Share2,
  Clock,
  CheckCircle2,
  Phone,
  MessageCircle,
  Truck,
  User,
  CreditCard,
  Download,
  ShieldCheck,
  ChevronRight,
  XCircle,
  AlertTriangle,
  Loader2,
  Sparkles
} from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrderById, cancelOrder } = useOrders();

  const order = getOrderById(id || '');

  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');
  const [customReason, setCustomReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  if (!order) {
    return (
      <div className="p-8 text-center bg-white rounded-[22px] shadow-xs border border-gray-200 my-12 max-w-lg mx-auto space-y-3 font-sans">
        <h2 className="font-heading font-black text-lg text-[#111111]">Order Not Found</h2>
        <button
          onClick={() => navigate('/customer/orders')}
          className="bg-[#111111] text-white font-bold text-xs px-5 py-2.5 rounded-xl"
        >
          Back to My Orders
        </button>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `MANIKANDAN LATHE Order #${order.orderNumber}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Order link copied to clipboard!');
    }
  };

  const timelineSteps = [
    { label: 'Order Placed', date: new Date(order.createdAt).toLocaleDateString('en-IN'), done: true },
    { label: 'Admin Accepted', date: 'Same Day', done: order.status !== 'PENDING' },
    { label: 'Advance Payment', date: order.advancePaid > 0 ? 'Received' : 'Pending', done: order.advancePaid > 0 },
    { label: 'Workshop Production', date: 'In Progress', done: ['IN_PRODUCTION', 'READY', 'COMPLETED'].includes(order.status) },
    { label: 'Ready for Dispatch', date: 'Inspected', done: ['READY', 'COMPLETED'].includes(order.status) },
    { label: 'Delivery / Pickup', date: 'Final Step', done: ['COMPLETED'].includes(order.status) }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 font-sans max-w-5xl mx-auto">
      
      {/* 1. TOP BAR WITH BACK, ORDER NUMBER & ACTIONS */}
      <div className="bg-white p-4 sm:p-5 rounded-[22px] border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/customer/orders');
              }
            }}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#111111] transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase block">Customer Order Details</span>
            <h1 className="font-heading font-black text-xl text-[#111111] flex items-center gap-2">
              #{order.orderNumber}
              <span className="bg-orange-100 text-[#F97316] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border border-orange-300">
                {order.status.replace('_', ' ')}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {order.status !== 'COMPLETED' && order.status !== 'REJECTED' && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-heading font-black text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <XCircle size={14} /> Cancel Order
            </button>
          )}

          {order.status === 'COMPLETED' ? (
            <button
              onClick={() => setPdfModalOpen(true)}
              className="bg-[#111111] hover:bg-[#F97316] text-white font-heading font-black text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <FileText size={14} className="text-[#F97316]" /> Tax Invoice
            </button>
          ) : (
            <span className="text-[10px] font-mono font-bold bg-gray-100 text-gray-500 border border-gray-200 px-3 py-2 rounded-xl">
              Invoice generated after completion
            </span>
          )}

          <button
            onClick={handleShare}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-700 hover:text-black hover:bg-gray-100 transition-colors"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* 2. ORDERED PRODUCTS LIST */}
      <div className="bg-white p-6 rounded-[22px] border border-gray-200 shadow-xs space-y-4">
        <h2 className="font-heading font-black text-sm text-[#111111] uppercase tracking-wider">
          ORDERED MACHINERY & PRODUCTS
        </h2>

        <div className="divide-y divide-gray-100">
          {order.items.map((item, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/customer/products/${item.productId}`)}
              className="py-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-3">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=300&q=80'}
                  alt={item.productName}
                  className="w-16 h-16 rounded-xl object-cover border border-gray-200 group-hover:scale-105 transition-transform"
                />
                <div>
                  <h3 className="font-heading font-extrabold text-sm text-[#111111] group-hover:text-[#F97316] transition-colors">
                    {item.productName}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">
                    Size: {item.variant?.size || 'Standard'} | Qty: {item.quantity}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-heading font-black text-base text-[#111111]">
                  ₹{item.totalPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-gray-400 font-mono block">₹{item.unitPrice} each</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. LIVE WORKSHOP CRAFTING STAGE & PHOTOS (Real-time Updates) */}
      <div className="bg-white p-6 rounded-[24px] border border-gray-200 shadow-xs space-y-4 font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div>
            <h2 className="font-heading font-black text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} className="text-[#F97316]" /> LIVE WORKSHOP CRAFTING STAGE & PHOTOS
            </h2>
            <p className="text-xs text-gray-500 font-mono">
              Real-time forging, lathe machining & anti-rust coating photos from Kallimandhayam factory
            </p>
          </div>

          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shrink-0">
            ✓ Live Factory Sync
          </span>
        </div>

        {/* 4 Workshop Stage Progress Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              stage: 'RAW_METAL_FORGING',
              title: '1. Metal Forging & Cutting',
              desc: 'Steel channels & pipe cutting',
              icon: '🔨',
            },
            {
              stage: 'LATHE_PRECISION_ALIGNMENT',
              title: '2. Lathe Machine Alignment',
              desc: 'Precision shaft & bush turning',
              icon: '⚙',
            },
            {
              stage: 'ANTI_RUST_PRIMER',
              title: '3. Red Oxide Anti-Rust Primer',
              desc: 'Corrosion-proof spray coating',
              icon: '🎨',
            },
            {
              stage: 'READY_FOR_LOADING',
              title: '4. Ready for Loading & Dispatch',
              desc: 'Final inspection & vehicle loading',
              icon: '🚚',
            },
          ].map((s, sIdx) => {
            const stageData = order.workshopProgress?.find((p) => p.stage === s.stage);
            const hasPhotos = stageData?.photos && stageData.photos.length > 0;
            const isCompleted = Boolean(stageData?.completedAt);

            return (
              <div
                key={s.stage}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  isCompleted
                    ? 'bg-orange-50/70 border-orange-200'
                    : 'bg-gray-50/70 border-gray-200 opacity-80'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-base">{s.icon}</span>
                    {isCompleted ? (
                      <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        ✓ Completed
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>

                  <h4 className="font-heading font-black text-xs text-[#111111] leading-tight pt-1">
                    {s.title}
                  </h4>
                  <p className="text-[10px] text-gray-500 line-clamp-1">{stageData?.description || s.desc}</p>
                </div>

                {/* Stage Photo Gallery */}
                {hasPhotos ? (
                  <div className="space-y-1.5 pt-1 border-t border-orange-200/60">
                    <span className="text-[9px] font-mono text-gray-500 font-bold uppercase block">
                      📸 Live Photos ({stageData.photos!.length})
                    </span>
                    <div className="flex gap-1.5 overflow-x-auto">
                      {stageData.photos!.map((photo, pIdx) => (
                        <a
                          key={pIdx}
                          href={photo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 rounded-xl overflow-hidden border border-gray-300 shrink-0 bg-white hover:scale-105 transition-transform"
                        >
                          <img src={photo} alt={`Stage ${sIdx + 1} Photo ${pIdx + 1}`} className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-gray-400 font-mono pt-1">
                    No photo uploaded yet
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. ORDER STATUS PRODUCTION TIMELINE */}
      <div className="bg-white p-6 rounded-[22px] border border-gray-200 shadow-xs space-y-4">
        <h2 className="font-heading font-black text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2">
          <Clock size={16} className="text-[#F97316]" /> WORKSHOP PRODUCTION TIMELINE
        </h2>

        <div className="relative pl-6 space-y-6 border-l-2 border-orange-200">
          {timelineSteps.map((step, idx) => (
            <div key={idx} className="relative">
              <div
                className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                  step.done ? 'bg-[#F97316] border-[#F97316] text-white shadow-xs' : 'bg-white border-gray-300 text-gray-300'
                }`}
              >
                <CheckCircle2 size={14} />
              </div>

              <div>
                <h4 className={`font-heading font-extrabold text-xs ${step.done ? 'text-[#111111]' : 'text-gray-400'}`}>
                  {step.label}
                </h4>
                <span className="text-[11px] font-mono text-gray-400">{step.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. FINANCIAL PAYMENT SUMMARY & LEDGER */}
      <div className="bg-white p-6 rounded-[22px] border border-gray-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div>
            <h2 className="font-heading font-black text-base text-[#111111] uppercase tracking-wider flex items-center gap-2">
              <CreditCard size={18} className="text-[#F97316]" /> FINANCIAL PAYMENT LEDGER
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Itemized history of advance payments, partial payments & official shop receipts.
            </p>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-right">
            <span className="text-[10px] font-mono text-amber-800 font-bold uppercase block">Outstanding Balance</span>
            <strong className={`font-heading font-black text-xl ${order.remainingBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              ₹{order.remainingBalance.toLocaleString('en-IN')}
            </strong>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-[10px] text-gray-400 block uppercase">Agreed Total</span>
            <strong className="text-gray-900 text-sm">₹{order.finalPrice.toLocaleString('en-IN')}</strong>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-[10px] text-emerald-700 block uppercase">Total Paid</span>
            <strong className="text-emerald-700 text-sm">₹{order.advancePaid.toLocaleString('en-IN')}</strong>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <span className="text-[10px] text-amber-800 block uppercase">Remaining Due</span>
            <strong className="text-red-600 text-sm">₹{order.remainingBalance.toLocaleString('en-IN')}</strong>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
            <span className="text-[10px] text-blue-700 block uppercase">Gateway</span>
            <strong className="text-blue-800 text-xs">Razorpay Only</strong>
          </div>
        </div>

        {/* Payment Transactions Ledger Table */}
        {order.paymentHistory.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-heading font-extrabold text-xs text-[#111111] uppercase tracking-wider">
              PAYMENT TRANSACTIONS & RECEIPTS
            </h4>
            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="bg-[#111111] text-white font-heading font-extrabold text-[10px] uppercase">
                    <th className="p-2.5">Date & Time</th>
                    <th className="p-2.5">Receipt #</th>
                    <th className="p-2.5">Payment Method</th>
                    <th className="p-2.5 text-right">Amount Paid</th>
                    <th className="p-2.5 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-mono text-xs">
                  {order.paymentHistory.map((tx) => (
                    <tr key={tx.id} className="hover:bg-amber-50/50">
                      <td className="p-2.5 text-gray-600">{tx.date} {tx.time}</td>
                      <td className="p-2.5 font-bold text-[#111111]">{tx.receiptNumber}</td>
                      <td className="p-2.5">
                        <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px] border border-blue-200">
                          Paid via {tx.mode}
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-black text-emerald-700">
                        + ₹{tx.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => setPdfModalOpen(true)}
                          className="text-[11px] font-bold text-[#F97316] hover:underline"
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sticky Large Razorpay Payment Card */}
        {order.remainingBalance > 0 && (() => {
          const pendingReq = (order.paymentRequests || []).find((r) => r.status === 'PENDING');
          const reqAmount = pendingReq ? pendingReq.amount : order.remainingBalance;

          return (
            <div className="p-5 bg-[#111111] text-white rounded-2xl shadow-xl space-y-4 border-2 border-[#F97316] font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-[#F97316] font-bold uppercase tracking-wider block">
                    {pendingReq ? `⚡ ADMIN PAYMENT REQUEST (${pendingReq.reason.toUpperCase()})` : 'RAZORPAY SECURE PAYMENT DUE'}
                  </span>
                  <h3 className="font-heading font-black text-2xl text-white mt-0.5">
                    {pendingReq ? `Requested Amount: ₹${pendingReq.amount.toLocaleString('en-IN')}` : `Outstanding: ₹${order.remainingBalance.toLocaleString('en-IN')}`}
                  </h3>
                  {pendingReq?.dueDate && (
                    <span className="text-xs font-mono text-amber-400">Due Date: {pendingReq.dueDate}</span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-gray-300">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Total Due</span>
                    <strong className="text-red-500 text-sm">₹{order.remainingBalance.toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Advance Paid</span>
                    <strong className="text-emerald-400 text-sm">₹{order.advancePaid.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pendingReq && (
                  <button
                    onClick={() => setRazorpayModalOpen(true)}
                    className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-sm py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer"
                  >
                    <CreditCard size={20} /> PAY REQUESTED ₹{pendingReq.amount.toLocaleString('en-IN')}
                  </button>
                )}

                <button
                  onClick={() => setRazorpayModalOpen(true)}
                  className={`font-heading font-black text-sm py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer ${
                    pendingReq
                      ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                      : 'bg-[#F97316] hover:bg-[#EA580C] text-white col-span-2'
                  }`}
                >
                  <CreditCard size={20} /> PAY FULL BALANCE (₹{order.remainingBalance.toLocaleString('en-IN')})
                </button>
              </div>
            </div>
          );
        })()}
      </div>




      {/* 5. WORKSHOP DELIVERY & PICKUP */}
      <div className="bg-white p-6 rounded-[22px] border border-gray-200 shadow-xs space-y-3">
        <h2 className="font-heading font-black text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2">
          <Truck size={16} className="text-[#F97316]" /> FACTORY DISPATCH & PICKUP
        </h2>

        <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-xs font-sans border border-gray-200">
          <p><strong className="text-gray-800">Dispatch Executive:</strong> {order.deliveryDetails?.personName || 'Chellamuthu K Workshop Team'}</p>
          <p><strong className="text-gray-800">Workshop Address:</strong> K. Keeranur Road, Kallimandhayam - 624616</p>
          
          <div className="pt-2 flex items-center gap-3">
            <a
              href="tel:+919659286268"
              className="bg-[#111111] hover:bg-[#F97316] text-white text-xs font-heading font-black px-4 py-2 rounded-xl flex items-center gap-1.5"
            >
              <Phone size={14} /> Call Chellamuthu K
            </a>
            <a
              href="https://wa.me/919659286268"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-heading font-black px-4 py-2 rounded-xl flex items-center gap-1.5"
            >
              <MessageCircle size={14} /> WhatsApp Factory
            </a>
          </div>
        </div>
      </div>

      {/* TAX INVOICE MODAL */}
      <PDFInvoiceModal
        order={order}
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
      />

      {/* RAZORPAY PAYMENT MODAL */}
      <RazorpayPaymentModal
        order={order}
        isOpen={razorpayModalOpen}
        onClose={() => setRazorpayModalOpen(false)}
      />

      {/* CANCEL ORDER CONFIRMATION MODAL */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-200 font-sans">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-heading font-black text-base text-[#111111]">Cancel Order #{order.orderNumber}?</h3>
                <p className="text-xs text-gray-500">Please tell us why you are cancelling</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <label className="font-bold text-gray-700 block">Select Cancellation Reason:</label>
              <div className="space-y-2">
                {[
                  'Ordered by mistake',
                  'Need different dimensions / specifications',
                  'Timeline delay / Changed mind',
                  'Other'
                ].map((reason) => (
                  <label key={reason} className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer font-medium text-gray-800">
                    <input
                      type="radio"
                      name="cancelReason"
                      value={reason}
                      checked={cancelReason === reason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="accent-red-600"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              {cancelReason === 'Other' && (
                <textarea
                  rows={2}
                  placeholder="Type specific reason..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full bg-gray-100 p-2.5 rounded-xl border border-gray-300 text-xs outline-none focus:border-red-500"
                />
              )}

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-[11px] text-amber-800 leading-relaxed">
                ⚠️ Note: Once cancelled, the order status will be updated in factory ledger. Any advance payment refund will be processed by Chellamuthu K.
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setCancelModalOpen(false)}
                disabled={isCancelling}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-heading font-black text-xs py-3 rounded-xl transition-all"
              >
                Go Back
              </button>

              <button
                onClick={async () => {
                  setIsCancelling(true);
                  const finalReason = cancelReason === 'Other' ? customReason : cancelReason;
                  await cancelOrder(order.id, finalReason);
                  setIsCancelling(false);
                  setCancelModalOpen(false);

                  // Open professional WhatsApp cancellation message to owner Chellamuthu K
                  const waUrl = createCancellationWhatsAppMessage({
                    orderNumber: order.orderNumber,
                    customerName: order.customerName,
                    customerPhone: order.customerPhone,
                    productName: order.items.map((i) => i.productName).join(', '),
                    reason: finalReason,
                  });
                  window.open(waUrl, '_blank');
                }}
                disabled={isCancelling}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-heading font-black text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isCancelling ? (
                  <><Loader2 size={14} className="animate-spin" /> Cancelling...</>
                ) : (
                  <>Confirm Cancel</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
