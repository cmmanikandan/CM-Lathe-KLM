import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { Order } from '../../types';
import { AdminPOSReceiptModal } from '../../components/common/AdminPOSReceiptModal';
import { PDFInvoiceModal } from '../../components/common/PDFInvoiceModal';
import {
  Zap,
  Search,
  Clock,
  User,
  CreditCard,
  Printer,
  MessageCircle,
  ChevronRight,
  CheckCircle2,
  Copy,
  FileText,
  FileBox,
} from 'lucide-react';

interface AdminTodayOfflineOrdersPageProps {
  showAllSources?: boolean;
}

export const AdminTodayOfflineOrdersPage: React.FC<AdminTodayOfflineOrdersPageProps> = ({
  showAllSources = false,
}) => {
  const navigate = useNavigate();
  const { orders, getDraftOrders } = useOrders();

  const [searchTerm, setSearchTerm] = useState('');
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [pdfOrder, setPdfOrder] = useState<Order | null>(null);

  // Draft orders count for top-right button
  const drafts = getDraftOrders();
  const draftCount = drafts.length;

  // Filter today's POS counter sales
  const todayStr = new Date().toISOString().split('T')[0];
  const todayOfflineOrders = orders.filter(
    (o) =>
      o.createdAt.startsWith(todayStr) &&
      (showAllSources ? true : Boolean(o.isOfflineOrder))
  );

  const totalSalesToday = todayOfflineOrders.reduce((sum, o) => sum + o.finalPrice, 0);

  const filteredOrders = todayOfflineOrders.filter((o) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(searchLower) ||
      o.customerName.toLowerCase().includes(searchLower) ||
      o.customerPhone.includes(searchTerm)
    );
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] pb-24 font-sans space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#111111] text-white py-8 px-4 sm:px-6 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[#F97316] font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
              <Zap size={16} /> POS SOFTWARE • TODAY'S WALK-IN SALES
            </span>
            <h1 className="font-heading font-black text-2xl text-white mt-1">
              TODAY'S COUNTER BILLS ({todayOfflineOrders.length})
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Top-Right Draft Orders Badge (hidden if count === 0) */}
            {draftCount > 0 && (
              <button
                onClick={() => navigate('/admin/offline-orders/drafts')}
                className="bg-amber-500 hover:bg-amber-600 text-black font-heading font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer animate-pulse"
              >
                <FileBox size={15} /> Draft Orders ({draftCount})
              </button>
            )}

            <button
              onClick={() => navigate('/admin/offline-orders/quick')}
              className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Zap size={15} /> + New POS Billing (30s)
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs border-l-4 border-l-[#111111]">
            <span className="text-[10px] text-gray-500 font-bold uppercase block">Today's POS Sales Count</span>
            <h3 className="font-heading font-black text-2xl text-[#111111] mt-0.5">{todayOfflineOrders.length}</h3>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs border-l-4 border-l-emerald-600">
            <span className="text-[10px] text-emerald-800 font-bold uppercase block">Total Revenue Collected Today</span>
            <h3 className="font-heading font-black text-2xl text-emerald-700 mt-0.5">
              ₹{totalSalesToday.toLocaleString('en-IN')}
            </h3>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs border-l-4 border-l-blue-600 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-blue-800 font-bold uppercase block">Payment Fulfillment</span>
            <h3 className="font-heading font-black text-base text-blue-700 mt-0.5">100% FULLY PAID ✓</h3>
          </div>
        </div>

        {/* Search Input */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Today's Order #, Customer Name, or Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 hover:bg-white focus:bg-white text-xs p-3 pl-10 rounded-xl border border-gray-300 font-medium text-gray-900 outline-none focus:border-[#F97316]"
            />
          </div>
        </div>

        {/* COMPACT TODAY'S POS CARDS GRID */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center max-w-md mx-auto space-y-3">
            <Clock size={40} className="mx-auto text-gray-300" />
            <h3 className="font-heading font-bold text-base text-[#111111]">No Sales Today Yet</h3>
            <p className="text-xs text-gray-500">Click "+ New POS Billing" to make your first counter sale today.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((ord) => {
              const cleanPhone = ord.customerPhone.replace(/\D/g, '').slice(-10);
              const baseUrl = window.location.origin;
              const invoiceUrl = `${baseUrl}/invoice/${ord.id}`;
              const receiptUrl = `${baseUrl}/r/${ord.id}`;
              const trackUrl = `${baseUrl}/customer/orders/${ord.id}`;
              const invoiceNum = `INV-${ord.orderNumber.replace(/\D/g, '') || '2026-0899'}`;

              const waTextMessage = `🧾 *MANIKANDAN LATHE*

Hello ${ord.customerName},

Thank you for choosing MANIKANDAN LATHE.

*Order No:*
#${ord.orderNumber}

*Invoice:*
${invoiceNum}

*Amount Paid:*
₹${ord.finalPrice.toLocaleString('en-IN')}

*Payment:*
${ord.paymentHistory?.[0]?.mode || 'Cash'}

*Status:*
✅ Fully Paid

Your invoice & receipt links are attached below.

📄 *View & Download Invoice:*
${invoiceUrl}

🧾 *View & Download Thermal Receipt:*
${receiptUrl}

🚚 *Track Order:*
${trackUrl}

If you have any questions, please contact us.
📞 +91 96592 86268

Thank You.`;

              const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(waTextMessage)}`;
              const payMode = ord.paymentHistory?.[0]?.mode || 'Cash';

              return (
                <div
                  key={ord.id}
                  onClick={() => setReceiptOrder(ord)}
                  className="bg-white rounded-[22px] border border-gray-200 hover:border-[#F97316] hover:shadow-md transition-all p-4 space-y-3 font-sans cursor-pointer group flex flex-col justify-between"
                >
                  {/* Top Row: Order #, Time & Status */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-black text-base text-[#111111] group-hover:text-[#F97316] transition-colors">
                        #{ord.orderNumber}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase">
                        COMPLETED ✓
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-gray-400">
                      {new Date(ord.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-0.5">
                    <h4 className="font-heading font-bold text-xs text-gray-900 truncate">
                      {ord.customerName}
                    </h4>
                    <p className="text-[11px] font-mono text-gray-500">{ord.customerPhone}</p>
                  </div>

                  {/* Items summary */}
                  <div className="text-[11px] text-gray-600 line-clamp-1 bg-gray-50 p-2 rounded-xl font-mono">
                    {ord.items.map((i) => `${i.productName} (${i.quantity})`).join(', ')}
                  </div>

                  {/* Price & Payment Mode */}
                  <div className="flex justify-between items-center text-xs font-mono border-t border-b border-gray-100 py-2">
                    <div>
                      <span className="text-[10px] text-gray-400 block">Payment Method</span>
                      <strong className="text-[#F97316]">{payMode}</strong>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block">Total Billed</span>
                      <strong className="text-base text-emerald-700 font-black">
                        ₹{ord.finalPrice.toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>

                  {/* Quick Actions Bar */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setReceiptOrder(ord)}
                      className="py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                      title="View POS Thermal Receipt"
                    >
                      <Printer size={13} /> Bill
                    </button>

                    <button
                      onClick={() => setPdfOrder(ord)}
                      className="py-1.5 bg-[#111111] hover:bg-black text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                      title="Print A4 Tax Invoice"
                    >
                      <FileText size={13} /> A4
                    </button>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                      title="WhatsApp Customer"
                    >
                      <MessageCircle size={13} /> WA
                    </a>

                    <button
                      onClick={() => navigate('/admin/offline-orders/quick')}
                      className="py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                      title="Duplicate POS Sale"
                    >
                      <Copy size={13} /> Sale
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* POS Receipt Modal */}
      <AdminPOSReceiptModal
        order={receiptOrder}
        isOpen={!!receiptOrder}
        onClose={() => setReceiptOrder(null)}
      />

      {/* PDF Invoice Modal */}
      <PDFInvoiceModal
        order={pdfOrder}
        isOpen={!!pdfOrder}
        onClose={() => setPdfOrder(null)}
      />
    </div>
  );
};

export default AdminTodayOfflineOrdersPage;
