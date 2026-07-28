import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCustomerOrders } from '../../context/OrderContext';
import { OrderStatus } from '../../types';
import { PDFInvoiceModal } from '../../components/common/PDFInvoiceModal';
import { OrderCardSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyOrders } from '../../components/common/EmptyState';
import {
  Search,
  Filter,
  ShoppingBag,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  SlidersHorizontal,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  PackageCheck
} from 'lucide-react';

export const CustomerOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const { orders, loading } = useCustomerOrders(user?.phone || '');
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPayment, setSelectedPayment] = useState<'ALL' | 'PAID' | 'DUE'>('ALL');
  const [sortDate, setSortDate] = useState<'NEWEST' | 'OLDEST'>('NEWEST');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [pdfModalOrder, setPdfModalOrder] = useState<any>(null);

  // Status Badge Colors Mapping
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Pending', bg: 'bg-yellow-100 text-yellow-800 border-yellow-300', dot: 'bg-yellow-500' };
      case 'ACCEPTED':
        return { label: 'Accepted', bg: 'bg-blue-100 text-blue-800 border-blue-300', dot: 'bg-blue-500' };
      case 'IN_PRODUCTION':
        return { label: 'In Production', bg: 'bg-orange-100 text-[#F97316] border-orange-300', dot: 'bg-[#F97316]' };
      case 'READY':
        return { label: 'Ready for Pickup', bg: 'bg-purple-100 text-purple-800 border-purple-300', dot: 'bg-purple-500' };
      case 'COMPLETED':
        return { label: 'Completed', bg: 'bg-green-100 text-green-800 border-green-300', dot: 'bg-green-600' };
      case 'REJECTED':
        return { label: 'Cancelled', bg: 'bg-red-100 text-red-800 border-red-300', dot: 'bg-red-600' };
      default:
        return { label: status, bg: 'bg-gray-100 text-gray-800 border-gray-300', dot: 'bg-gray-500' };
    }
  };

  // Filter & Search Logic
  let filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((i) => i.productName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'ALL' || order.status === selectedStatus;
    const matchesPayment =
      selectedPayment === 'ALL' ||
      (selectedPayment === 'PAID' && order.remainingBalance === 0) ||
      (selectedPayment === 'DUE' && order.remainingBalance > 0);

    return matchesSearch && matchesStatus && matchesPayment;
  });

  if (sortDate === 'NEWEST') {
    filteredOrders = [...filteredOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else {
    filteredOrders = [...filteredOrders].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 font-sans max-w-7xl mx-auto relative">
      
      {/* 1. STICKY PAGE HEADER WITH ORDER COUNT & SEARCH CONTROLS */}
      <div className="bg-white p-4 sm:p-6 rounded-[22px] border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-[#111111]">MY ORDERS</h1>
              <span className="bg-[#F97316] text-white font-mono font-black text-xs px-2.5 py-0.5 rounded-full shadow-xs">
                {orders.length} Orders
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Track live workshop production progress, view payments & tax invoices</p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Order ID or Product Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 focus:bg-white text-xs text-[#111111] pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#F97316] outline-none font-bold"
              />
            </div>

            <button
              onClick={() => setFilterSheetOpen(true)}
              className="bg-[#111111] hover:bg-[#F97316] text-white font-heading font-black text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors shrink-0"
            >
              <SlidersHorizontal size={14} /> Filter
            </button>
          </div>
        </div>
      </div>

      {/* 2. ORDER CARDS */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => <OrderCardSkeleton key={i} />)}
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyOrders />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredOrders.map((order) => {
            const firstItem = order.items[0];
            const badge = getStatusBadge(order.status);
            return (
              <motion.div
                key={order.id}
                onClick={() => navigate(`/customer/orders/${order.id}`)}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-[22px] border border-gray-200/90 p-4 shadow-xs hover:border-[#F97316] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 relative group"
              >
                {/* Top Info Row */}
                <div className="flex gap-4 items-start">
                  
                  {/* Large 100x100 Product Image */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                    <img
                      src={firstItem?.image || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=400&q=80'}
                      alt={firstItem?.productName || 'Order Item'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Center Text Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono font-bold text-gray-400">
                        #{order.orderNumber}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${badge.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </div>

                    <h3 className="font-heading font-black text-sm sm:text-base text-[#111111] line-clamp-2 group-hover:text-[#F97316] transition-colors leading-tight">
                      {firstItem?.productName || 'Lathe Machined Product'}
                    </h3>

                    <div className="text-[11px] text-gray-500 font-mono space-y-0.5 pt-0.5">
                      <p>Qty: <strong className="text-[#111111]">{firstItem?.quantity || 1}</strong> | Size: {firstItem?.variant?.size || 'Standard'}</p>
                      <p>Ordered On: {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>

                    {/* Payment Due / Paid Tag */}
                    {order.remainingBalance > 0 ? (
                      <div className="inline-flex items-center gap-1 bg-orange-50 text-[#F97316] text-[10px] font-extrabold px-2 py-0.5 rounded border border-orange-200">
                        Balance Due: ₹{order.remainingBalance.toLocaleString('en-IN')}
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-extrabold px-2 py-0.5 rounded border border-green-200">
                        ✓ Paid in Full
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action & Price Row */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                  <div>
                    <span className="text-[10px] text-gray-400 font-mono block">Final Amount Payable</span>
                    <span className="font-heading font-black text-base text-[#111111]">
                      ₹{order.finalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status === 'COMPLETED' && (
                      <button
                        onClick={() => setPdfModalOrder(order)}
                        className="bg-gray-100 hover:bg-gray-200 text-[#111111] font-heading font-black text-xs px-3 py-2 rounded-xl flex items-center gap-1"
                      >
                        <FileText size={14} className="text-[#F97316]" /> Tax Invoice
                      </button>
                    )}

                    <button
                      onClick={() => navigate(`/customer/orders/${order.id}`)}
                      className="bg-[#111111] hover:bg-[#F97316] text-white font-heading font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 shadow-xs transition-colors"
                    >
                      Track Order <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>
      )}

      {/* 3. FILTER BOTTOM SHEET MODAL */}
      {filterSheetOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-sm h-full p-6 space-y-6 overflow-y-auto shadow-2xl animate-fade-in flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h3 className="font-heading font-black text-base text-[#111111] flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-[#F97316]" /> FILTER ORDERS
                </h3>
                <button onClick={() => setFilterSheetOpen(false)} className="text-gray-400 hover:text-black">
                  <X size={20} />
                </button>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="font-heading font-extrabold text-xs text-[#111111] uppercase block">Order Status</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['ALL', 'PENDING', 'ACCEPTED', 'IN_PRODUCTION', 'READY', 'COMPLETED', 'REJECTED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setSelectedStatus(st)}
                      className={`p-2 rounded-xl font-bold border transition-all ${
                        selectedStatus === st ? 'bg-[#111111] text-white border-[#111111]' : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Filter */}
              <div className="space-y-2">
                <label className="font-heading font-extrabold text-xs text-[#111111] uppercase block">Payment Status</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    onClick={() => setSelectedPayment('ALL')}
                    className={`p-2 rounded-xl font-bold border ${selectedPayment === 'ALL' ? 'bg-[#F97316] text-white border-[#F97316]' : 'bg-gray-50 text-gray-700 border-gray-200'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSelectedPayment('PAID')}
                    className={`p-2 rounded-xl font-bold border ${selectedPayment === 'PAID' ? 'bg-[#F97316] text-white border-[#F97316]' : 'bg-gray-50 text-gray-700 border-gray-200'}`}
                  >
                    Paid in Full
                  </button>
                  <button
                    onClick={() => setSelectedPayment('DUE')}
                    className={`p-2 rounded-xl font-bold border ${selectedPayment === 'DUE' ? 'bg-[#F97316] text-white border-[#F97316]' : 'bg-gray-50 text-gray-700 border-gray-200'}`}
                  >
                    Balance Due
                  </button>
                </div>
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <label className="font-heading font-extrabold text-xs text-[#111111] uppercase block">Sort Date</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setSortDate('NEWEST')}
                    className={`p-2 rounded-xl font-bold border ${sortDate === 'NEWEST' ? 'bg-[#111111] text-white border-[#111111]' : 'bg-gray-50 text-gray-700 border-gray-200'}`}
                  >
                    Newest First
                  </button>
                  <button
                    onClick={() => setSortDate('OLDEST')}
                    className={`p-2 rounded-xl font-bold border ${sortDate === 'OLDEST' ? 'bg-[#111111] text-white border-[#111111]' : 'bg-gray-50 text-gray-700 border-gray-200'}`}
                  >
                    Oldest First
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 space-y-2">
              <button
                onClick={() => setFilterSheetOpen(false)}
                className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs py-3.5 rounded-xl shadow-md"
              >
                Apply Filters ({filteredOrders.length} Orders)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF INVOICE PREVIEW MODAL */}
      <PDFInvoiceModal
        order={pdfModalOrder}
        isOpen={Boolean(pdfModalOrder)}
        onClose={() => setPdfModalOrder(null)}
      />

    </div>
  );
};
