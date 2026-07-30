import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { useRefunds } from '../../context/RefundContext';
import { Order } from '../../types';
import { AdminPOSReceiptModal } from '../../components/common/AdminPOSReceiptModal';
import { PDFInvoiceModal } from '../../components/common/PDFInvoiceModal';
import { AdminPaymentCollectionModal } from '../../components/common/AdminPaymentCollectionModal';
import { ReduceDiscountModal } from '../../components/common/ReduceDiscountModal';
import { DeleteOrderConfirmationModal } from '../../components/common/DeleteOrderConfirmationModal';
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
  RotateCcw,
  ShoppingCart,
  Hammer,
  Table as TableIcon,
  LayoutGrid,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

interface AdminTodayOfflineOrdersPageProps {
  showAllSources?: boolean;
}

export const AdminTodayOfflineOrdersPage: React.FC<AdminTodayOfflineOrdersPageProps> = ({
  showAllSources = false,
}) => {
  const navigate = useNavigate();
  const { orders, getDraftOrders, deleteOrder, bulkDeleteOrders, addPaymentToOrder, updateOrderDiscount } = useOrders();
  const { createRefund } = useRefunds();

  const [activeTab, setActiveTab] = useState<'POS_BILL' | 'FABRICATION_ORDER'>('POS_BILL');
  const [searchTerm, setSearchTerm] = useState('');
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [pdfOrder, setPdfOrder] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
  const [reduceOrder, setReduceOrder] = useState<Order | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Draft orders count for top button
  const drafts = getDraftOrders();
  const draftCount = drafts.length;

  // Filter offline POS bills vs Fabrication orders
  const offlineOrders = orders.filter((o) => Boolean(o.isOfflineOrder));

  const posOrders = offlineOrders.filter(
    (o) => o.orderType === 'Quick Order' || (o.orderType as string) === 'POS' || o.notes?.toLowerCase().includes('pos') || o.items.some((i: any) => i.isPosItem)
  );

  const fabOrders = offlineOrders.filter(
    (o) => o.orderType !== 'Quick Order' && (o.orderType as string) !== 'POS' && !o.notes?.toLowerCase().includes('pos') && !o.items.some((i: any) => i.isPosItem)
  );

  const currentList = activeTab === 'POS_BILL' ? posOrders : fabOrders;

  const totalSalesToday = posOrders.reduce((sum, o) => sum + o.finalPrice, 0);

  const filteredOrders = currentList.filter((o) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(searchLower) ||
      o.customerName.toLowerCase().includes(searchLower) ||
      o.customerPhone.includes(searchTerm)
    );
  });

  const handleRefund = async (ord: Order) => {
    const payMode = ord.paymentHistory?.[0]?.mode || 'Cash';
    if (confirm(`Initiate return & full refund for POS Bill #${ord.orderNumber}? (Amount: ₹${ord.finalPrice.toLocaleString('en-IN')})`)) {
      await createRefund({
        orderId: ord.id,
        orderNumber: ord.orderNumber,
        customerName: ord.customerName,
        customerPhone: ord.customerPhone,
        originalPaymentAmount: ord.finalPrice,
        originalPaymentMode: payMode,
        refundAmount: ord.finalPrice,
        refundType: 'Full Refund',
        reason: 'Customer Cancelled',
        refundMethod: payMode === 'Cash' ? 'Cash' : 'Razorpay',
        createdBy: 'Owner Admin',
      });
      alert(`Refund initiated for #${ord.orderNumber}! Recorded in Refund Management & Payment Ledger.`);
      navigate('/admin/refunds');
    }
  };

  const handleMarkPaid = (ord: Order) => {
    setPaymentOrder(ord);
  };

  const handleReduceAmount = (ord: Order) => {
    setReduceOrder(ord);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] pb-24 font-sans space-y-6">
      
      {/* Top Banner Header */}
      <div className="bg-[#111111] text-white py-8 px-4 sm:px-6 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[#F97316] font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
              <Zap size={16} /> OFFLINE & WORKSHOP ORDERS
            </span>
            <h1 className="font-heading font-black text-2xl text-white mt-1">
              OFFLINE ORDER MANAGEMENT
            </h1>
          </div>

          <div className="flex items-center gap-2">
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
            <span className="text-[10px] text-gray-500 font-bold uppercase block">POS Counter Sales</span>
            <h3 className="font-heading font-black text-2xl text-[#111111] mt-0.5">{posOrders.length} Bills</h3>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs border-l-4 border-l-emerald-600">
            <span className="text-[10px] text-emerald-800 font-bold uppercase block">POS Sales Collected Revenue</span>
            <h3 className="font-heading font-black text-2xl text-emerald-700 mt-0.5">
              ₹{totalSalesToday.toLocaleString('en-IN')}
            </h3>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs border-l-4 border-l-blue-600 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-blue-800 font-bold uppercase block">Advanced Fabrication Orders</span>
            <h3 className="font-heading font-black text-2xl text-blue-700 mt-0.5">{fabOrders.length} Orders</h3>
          </div>
        </div>

        {/* PAGE LINK TABS & SEARCH BAR */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-100 pb-3">
            {/* 2 Page Link Tabs */}
            <div className="flex items-center gap-2 w-full sm:w-auto bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('POS_BILL')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-heading font-black transition-all ${
                  activeTab === 'POS_BILL'
                    ? 'bg-[#111111] text-white shadow-md'
                    : 'text-gray-600 hover:text-black hover:bg-gray-200'
                }`}
              >
                <TableIcon size={16} className={activeTab === 'POS_BILL' ? 'text-[#F97316]' : ''} />
                POS Bill (Table View) ({posOrders.length})
              </button>

              <button
                onClick={() => setActiveTab('FABRICATION_ORDER')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-heading font-black transition-all ${
                  activeTab === 'FABRICATION_ORDER'
                    ? 'bg-[#111111] text-white shadow-md'
                    : 'text-gray-600 hover:text-black hover:bg-gray-200'
                }`}
              >
                <LayoutGrid size={16} className={activeTab === 'FABRICATION_ORDER' ? 'text-[#F97316]' : ''} />
                Advanced Fabrication Order (Card View) ({fabOrders.length})
              </button>
            </div>

            <span className="text-xs font-mono text-gray-500 font-bold hidden md:inline">
              {activeTab === 'POS_BILL' ? '📊 Displaying POS Bills in Table Format' : '🖼️ Displaying Fabrication Orders in Card Format'}
            </span>
          </div>

          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Order #, Customer Name, or Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 hover:bg-white focus:bg-white text-xs p-3 pl-10 rounded-xl border border-gray-300 font-medium text-gray-900 outline-none focus:border-[#F97316]"
            />
          </div>

        </div>

        {/* TAB 1: POS BILL — TABLE FORMAT */}
        {activeTab === 'POS_BILL' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden space-y-2">
            
            {/* Bulk Action Bar */}
            {selectedOrderIds.length > 0 && (
              <div className="bg-red-50 border-b border-red-200 p-3 px-4 flex items-center justify-between font-sans">
                <span className="text-xs font-bold text-red-800">
                  {selectedOrderIds.length} POS Bill(s) selected
                </span>
                <button
                  onClick={async () => {
                    if (confirm(`Permanently delete ${selectedOrderIds.length} selected POS bills?`)) {
                      await bulkDeleteOrders(selectedOrderIds);
                      setSelectedOrderIds([]);
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={13} /> Delete Selected ({selectedOrderIds.length})
                </button>
              </div>
            )}

            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center max-w-md mx-auto space-y-3">
                <ShoppingCart size={40} className="mx-auto text-gray-300" />
                <h3 className="font-heading font-bold text-base text-[#111111]">No POS Bills Found</h3>
                <p className="text-xs text-gray-500">Click "+ New POS Billing" to generate a instant POS counter bill.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead>
                    <tr className="bg-gray-900 text-white font-mono text-[11px] uppercase border-b border-gray-800">
                      <th className="p-3.5 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOrderIds(filteredOrders.map((o) => o.id));
                            } else {
                              setSelectedOrderIds([]);
                            }
                          }}
                          className="rounded border-gray-600 text-[#F97316] focus:ring-[#F97316] cursor-pointer"
                        />
                      </th>
                      <th className="p-3.5">Bill #</th>
                      <th className="p-3.5">Date & Time</th>
                      <th className="p-3.5">Customer Name & Phone</th>
                      <th className="p-3.5">Items Billed</th>
                      <th className="p-3.5 text-right">Total Product Amount</th>
                      <th className="p-3.5 text-right">Paid Amount</th>
                      <th className="p-3.5 text-right">Balance Due</th>
                      <th className="p-3.5 text-center">Payment Method</th>
                      <th className="p-3.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.map((ord) => {
                      const isSelected = selectedOrderIds.includes(ord.id);
                      const cleanPhone = ord.customerPhone.replace(/\D/g, '').slice(-10);
                      const baseUrl = window.location.origin;
                      const invoiceUrl = `${baseUrl}/invoice/${ord.id}`;
                      const payMode = ord.paymentHistory?.[0]?.mode || 'Cash';

                      const waTextMessage = `🧾 *MANIKANDAN LATHE* POS Bill #${ord.orderNumber}\nAmount Paid: ₹${ord.advancePaid.toLocaleString('en-IN')}\nBalance: ₹${ord.remainingBalance.toLocaleString('en-IN')}\nPayment: ${payMode}\nInvoice: ${invoiceUrl}`;
                      const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(waTextMessage)}`;

                      return (
                        <tr key={ord.id} className={`hover:bg-amber-50/50 transition-colors ${isSelected ? 'bg-amber-50' : ''}`}>
                          <td className="p-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                setSelectedOrderIds((prev) =>
                                  prev.includes(ord.id) ? prev.filter((id) => id !== ord.id) : [...prev, ord.id]
                                );
                              }}
                              className="rounded border-gray-300 text-[#F97316] focus:ring-[#F97316] cursor-pointer"
                            />
                          </td>
                          <td className="p-3.5 font-heading font-black text-sm text-[#111111]">
                            <button
                              onClick={() => navigate(`/admin/offline-orders/detail/${ord.id}`)}
                              className="hover:text-[#F97316] transition-colors cursor-pointer text-left font-black"
                              title="Click to open full order detail page"
                            >
                              #{ord.orderNumber}
                            </button>
                          </td>
                          <td className="p-3.5 font-mono text-gray-500 text-[11px]">
                            <div>{new Date(ord.createdAt).toLocaleDateString('en-IN')}</div>
                            <div className="text-[10px] text-gray-400">
                              {new Date(ord.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-gray-900">{ord.customerName}</div>
                            <div className="font-mono text-gray-500 text-[11px]">{ord.customerPhone}</div>
                          </td>
                          <td className="p-3.5 font-mono text-gray-700 max-w-xs truncate">
                            {ord.items.map((i) => `${i.productName} (${i.quantity})`).join(', ')}
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-gray-900">
                            ₹{ord.finalPrice.toLocaleString('en-IN')}
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-emerald-700">
                            ₹{ord.advancePaid.toLocaleString('en-IN')}
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold">
                            {ord.remainingBalance > 0 ? (
                              <span className="text-red-600 font-black">₹{ord.remainingBalance.toLocaleString('en-IN')}</span>
                            ) : (
                              <span className="text-emerald-700 font-black">0 (Paid ✓)</span>
                            )}
                          </td>
                          <td className="p-3.5 text-center">
                            <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                              {payMode}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <button
                              onClick={() => navigate(`/admin/offline-orders/${ord.id}`)}
                              className="w-8 h-8 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white flex items-center justify-center font-black mx-auto transition-transform active:scale-95 shadow-md cursor-pointer"
                              title="Open Full Order Page & Actions (>)"
                            >
                              <ChevronRight size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ADVANCED FABRICATION ORDER — CARD FORMAT */}
        {activeTab === 'FABRICATION_ORDER' && (
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center max-w-md mx-auto space-y-3">
                <Hammer size={40} className="mx-auto text-gray-300" />
                <h3 className="font-heading font-bold text-base text-[#111111]">No Fabrication Orders</h3>
                <p className="text-xs text-gray-500">Go to Advanced Fabrication to create custom manufacturing orders.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.map((ord) => {
                  const cleanPhone = ord.customerPhone.replace(/\D/g, '').slice(-10);
                  const baseUrl = window.location.origin;
                  const trackUrl = `${baseUrl}/customer/orders/${ord.id}`;

                  const waTextMessage = `🛠️ *MANIKANDAN LATHE* Fabrication Order #${ord.orderNumber}\nTotal: ₹${ord.finalPrice.toLocaleString('en-IN')}\nStatus: ${ord.status}\nTrack: ${trackUrl}`;
                  const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(waTextMessage)}`;

                  return (
                    <div
                      key={ord.id}
                      onClick={() => navigate(`/admin/orders/${ord.id}`)}
                      className="bg-white rounded-[22px] border border-gray-200 hover:border-[#F97316] hover:shadow-md transition-all p-4 space-y-3 font-sans cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-black text-base text-[#111111] group-hover:text-[#F97316] transition-colors">
                            #{ord.orderNumber}
                          </span>
                          <span className="bg-blue-100 text-blue-800 border border-blue-300 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase">
                            {ord.status.replace('_', ' ')}
                          </span>
                        </div>

                        <span className="text-[10px] font-mono text-gray-400">
                          {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="font-heading font-bold text-xs text-gray-900 truncate">
                          {ord.customerName}
                        </h4>
                        <p className="text-[11px] font-mono text-gray-500">{ord.customerPhone}</p>
                      </div>

                      <div className="text-[11px] text-gray-600 line-clamp-1 bg-gray-50 p-2 rounded-xl font-mono">
                        {ord.items.map((i) => i.productName).join(', ')}
                      </div>

                      <div className="flex justify-between items-center text-xs font-mono border-t border-b border-gray-100 py-2">
                        <div>
                          <span className="text-[10px] text-gray-400 block">Advance Paid</span>
                          <strong className="text-emerald-700">₹{ord.advancePaid.toLocaleString('en-IN')}</strong>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 block">Balance Due</span>
                          <strong className={ord.remainingBalance > 0 ? 'text-red-600 font-black' : 'text-emerald-700 font-black'}>
                            {ord.remainingBalance > 0 ? `₹${ord.remainingBalance.toLocaleString('en-IN')}` : 'Paid ✓'}
                          </strong>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setPdfOrder(ord)}
                          className="py-1.5 bg-[#111111] hover:bg-black text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <FileText size={13} /> Bill
                        </button>

                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <MessageCircle size={13} /> WA
                        </a>

                        <button
                          onClick={() => navigate(`/admin/orders/${ord.id}`)}
                          className="py-1.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <ChevronRight size={14} /> Open
                        </button>

                        <button
                          onClick={() => setDeletingOrder(ord)}
                          className="py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs rounded-xl flex items-center justify-center cursor-pointer"
                          title="Delete Order"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── CUSTOM DELETE ORDER CONFIRMATION CARD MODAL ── */}
      {deletingOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[26px] border-2 border-red-200 shadow-2xl max-w-md w-full p-6 space-y-5 font-sans">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-red-600 font-heading font-black text-base uppercase tracking-wide">
                <div className="p-2 bg-red-100 rounded-xl text-red-600">
                  <Trash2 size={20} />
                </div>
                Delete Order Confirmation
              </div>
              <button
                onClick={() => setDeletingOrder(null)}
                className="text-gray-400 hover:text-black font-bold p-1 rounded-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2.5 text-xs font-sans">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-mono">Order Number:</span>
                <strong className="font-heading font-black text-sm text-[#111111]">#{deletingOrder.orderNumber}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-mono">Customer Name:</span>
                <strong className="font-bold text-gray-900">{deletingOrder.customerName}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-mono">Customer Mobile:</span>
                <span className="font-mono text-gray-700">{deletingOrder.customerPhone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-mono">Items Billed:</span>
                <span className="font-mono text-gray-800 truncate max-w-[200px]">
                  {deletingOrder.items.map((i) => `${i.productName} (${i.quantity})`).join(', ')}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-gray-500 font-mono">Total Billed:</span>
                <strong className="font-mono font-black text-sm text-emerald-700">₹{deletingOrder.finalPrice.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-xs text-red-900 font-bold flex items-start gap-2.5">
              <AlertTriangle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <span>Are you sure you want to permanently delete POS Bill <strong>#{deletingOrder.orderNumber}</strong>? This record will be permanently deleted from system database and cannot be recovered.</span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => setDeletingOrder(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-heading font-black text-xs py-3.5 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await deleteOrder(deletingOrder.id);
                  setDeletingOrder(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-heading font-black text-xs py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Trash2 size={16} /> Delete Permanently
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── BULK DELETE CONFIRMATION CARD MODAL ── */}
      {isBulkDeleting && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[26px] border-2 border-red-200 shadow-2xl max-w-md w-full p-6 space-y-5 font-sans">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-red-600 font-heading font-black text-base uppercase tracking-wide">
                <div className="p-2 bg-red-100 rounded-xl text-red-600">
                  <Trash2 size={20} />
                </div>
                Bulk Delete Confirmation
              </div>
              <button
                onClick={() => setIsBulkDeleting(false)}
                className="text-gray-400 hover:text-black font-bold p-1 rounded-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-xs text-red-900 font-bold space-y-2">
              <div className="flex items-center gap-2 text-red-700 font-black text-sm">
                <AlertTriangle size={18} /> Permanently Delete {selectedOrderIds.length} Selected POS Bills?
              </div>
              <p className="text-gray-700 font-normal">
                You are about to permanently remove {selectedOrderIds.length} selected POS bills from the system database. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => setIsBulkDeleting(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-heading font-black text-xs py-3.5 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await bulkDeleteOrders(selectedOrderIds);
                  setSelectedOrderIds([]);
                  setIsBulkDeleting(false);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-heading font-black text-xs py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Trash2 size={16} /> Delete Selected ({selectedOrderIds.length})
              </button>
            </div>

          </div>
        </div>
      )}

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

      {/* Admin Payment Collection Modal */}
      <AdminPaymentCollectionModal
        order={paymentOrder}
        isOpen={!!paymentOrder}
        onClose={() => setPaymentOrder(null)}
      />

      {/* Reduce Discount Modal */}
      <ReduceDiscountModal
        order={reduceOrder}
        isOpen={!!reduceOrder}
        onClose={() => setReduceOrder(null)}
      />

      {/* Delete Order Modal */}
      <DeleteOrderConfirmationModal
        order={deletingOrder}
        isOpen={!!deletingOrder}
        onClose={() => setDeletingOrder(null)}
      />
    </div>
  );
};

export default AdminTodayOfflineOrdersPage;
