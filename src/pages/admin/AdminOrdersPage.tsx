import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { Order } from '../../types';
import { AdminPaymentCollectionModal } from '../../components/common/AdminPaymentCollectionModal';
import { AdminPaymentRequestModal } from '../../components/common/AdminPaymentRequestModal';
import { AdminDeliveredMessageModal } from '../../components/common/AdminDeliveredMessageModal';
import { AdminWorkshopProgressModal } from '../../components/admin/AdminWorkshopProgressModal';
import { PDFInvoiceModal } from '../../components/common/PDFInvoiceModal';
import { createDeliveredThankYouWhatsAppMessage } from '../../services/whatsappService';
import {
  Search,
  Filter,
  CreditCard,
  Printer,
  MessageCircle,
  ChevronRight,
  ShoppingBag,
  Zap,
  Globe,
  Store,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Calendar,
  User,
  SlidersHorizontal,
  Trash2,
  AlertTriangle,
  Camera,
} from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, getDraftOrders, deleteOrder, updateOrderStatus, updateOrderWorkshopProgress } = useOrders();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<
    'ALL' | 'ONLINE' | 'OFFLINE' | 'DRAFTS' | 'COMPLETED' | 'CANCELLED'
  >('ALL');

  // Advanced Filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterOrderType, setFilterOrderType] = useState<string>('ALL');

  // Modals State
  const [requestOrder, setRequestOrder] = useState<Order | null>(null);
  const [deliveredModalOrder, setDeliveredModalOrder] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
  const [payingOrder, setPayingOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [progressModalOrder, setProgressModalOrder] = useState<Order | null>(null);

  // Draft Orders count
  const drafts = getDraftOrders();

  // Calculate Top Statistics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter((o) => o.createdAt.startsWith(todayStr));

  const countTotal = orders.length;
  const countPending = orders.filter((o) => o.status === 'PENDING').length;
  const countAccepted = orders.filter((o) => o.status === 'ACCEPTED' || o.status === 'MATERIAL_READY').length;
  const countProduction = orders.filter((o) => o.status === 'IN_PRODUCTION' || o.status === 'QUALITY_CHECK').length;
  const countReady = orders.filter((o) => o.status === 'READY' || o.status === 'OUT_FOR_DELIVERY').length;
  const countCompleted = orders.filter((o) => o.status === 'COMPLETED').length;
  const countCancelled = orders.filter((o) => o.status === 'REJECTED').length;

  const countOnline = orders.filter((o) => !o.isOfflineOrder).length;
  const countOffline = orders.filter((o) => Boolean(o.isOfflineOrder)).length;

  const revenueToday = todayOrders.filter((o) => o.status !== 'REJECTED').reduce((sum, o) => sum + o.advancePaid, 0);
  const totalOutstandingBalance = orders.filter((o) => o.status !== 'REJECTED').reduce((sum, o) => sum + o.remainingBalance, 0);

  // Filter Logic — ONLY ONLINE CUSTOMER ORDERS
  const OFFLINE_ORDER_TYPES = ['POS', 'Quick Order', 'Walk-in Order'];
  const onlineOrders = orders.filter(
    (o) => !o.isOfflineOrder && !OFFLINE_ORDER_TYPES.includes(o.orderType as string)
  );

  const filteredOrders = onlineOrders.filter((o) => {
    // 1. Search Query
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchLower) ||
      o.customerName.toLowerCase().includes(searchLower) ||
      o.customerPhone.includes(searchTerm) ||
      (o.id && o.id.toLowerCase().includes(searchLower));

    // 2. Tab Filter
    let matchesTab = true;
    if (activeTab === 'COMPLETED') matchesTab = o.status === 'COMPLETED';
    if (activeTab === 'CANCELLED') matchesTab = o.status === 'REJECTED';

    // 3. Advanced Filters
    let matchesAdv = true;
    if (filterStatus !== 'ALL' && o.status !== filterStatus) matchesAdv = false;
    if (filterPaymentStatus === 'PAID' && o.remainingBalance > 0) matchesAdv = false;
    if (filterPaymentStatus === 'DUE' && o.remainingBalance === 0) matchesAdv = false;
    if (filterPriority !== 'ALL' && o.priority !== filterPriority) matchesAdv = false;

    return matchesSearch && matchesTab && matchesAdv;
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] pb-24 font-sans space-y-6">
      
      {/* Top Banner Header */}
      <div className="bg-[#111111] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[#F97316] font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
              <ShoppingBag size={16} /> PRODUCTION ERP • ORDER MANAGEMENT
            </span>
            <h1 className="font-heading font-black text-2xl text-white mt-1">
              ONLINE CUSTOMER ORDERS ({onlineOrders.length})
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin/offline-orders/quick')}
              className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Zap size={15} /> + Quick Order (30s)
            </button>

            <button
              onClick={() => navigate('/admin/offline-orders/advanced')}
              className="bg-white/10 hover:bg-white/20 text-white font-heading font-black text-xs px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-1.5 cursor-pointer"
            >
              + Advanced Order
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top ERP Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs font-sans">
          
          <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs border-l-4 border-l-[#111111]">
            <span className="text-[10px] font-mono text-gray-500 font-bold uppercase block">Total Orders</span>
            <h3 className="font-heading font-black text-xl text-[#111111] mt-0.5">{countTotal}</h3>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs border-l-4 border-l-amber-500">
            <span className="text-[10px] font-mono text-amber-800 font-bold uppercase block">Pending</span>
            <h3 className="font-heading font-black text-xl text-amber-600 mt-0.5">{countPending}</h3>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs border-l-4 border-l-blue-600">
            <span className="text-[10px] font-mono text-blue-800 font-bold uppercase block">Accepted</span>
            <h3 className="font-heading font-black text-xl text-blue-600 mt-0.5">{countAccepted}</h3>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs border-l-4 border-l-purple-600">
            <span className="text-[10px] font-mono text-purple-800 font-bold uppercase block">In Production</span>
            <h3 className="font-heading font-black text-xl text-purple-600 mt-0.5">{countProduction}</h3>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs border-l-4 border-l-emerald-600">
            <span className="text-[10px] font-mono text-emerald-800 font-bold uppercase block">Completed</span>
            <h3 className="font-heading font-black text-xl text-emerald-600 mt-0.5">{countCompleted}</h3>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs border-l-4 border-l-[#F97316]">
            <span className="text-[10px] font-mono text-[#F97316] font-bold uppercase block">Outstanding Due</span>
            <h3 className="font-heading font-black text-base text-[#111111] mt-0.5 truncate">
              ₹{totalOutstandingBalance.toLocaleString('en-IN')}
            </h3>
          </div>

        </div>

        {/* Primary Filter Tabs Bar */}
        <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between gap-2 overflow-x-auto text-xs font-heading">
          <div className="flex items-center gap-1">
            {[
              { id: 'ALL', title: 'All Online Orders', count: onlineOrders.length },
              { id: 'COMPLETED', title: 'Completed', count: onlineOrders.filter(o => o.status === 'COMPLETED').length },
              { id: 'CANCELLED', title: 'Cancelled', count: onlineOrders.filter(o => o.status === 'REJECTED').length },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'DRAFTS') {
                      navigate('/admin/offline-orders/drafts');
                    } else {
                      setActiveTab(tab.id as any);
                    }
                  }}
                  className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                    active
                      ? 'bg-[#111111] text-white shadow-md'
                      : 'text-gray-600 hover:text-black hover:bg-gray-100'
                  }`}
                >
                  <span>{tab.title}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    active ? 'bg-[#F97316] text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-3 py-2 rounded-xl font-bold border text-xs flex items-center gap-1.5 shrink-0 cursor-pointer ${
              showAdvancedFilters ? 'bg-gray-200 border-gray-400 text-black' : 'bg-gray-50 border-gray-200 text-gray-700'
            }`}
          >
            <SlidersHorizontal size={14} /> Advanced Filters
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Order ID, Customer Name, Phone, Invoice Number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 hover:bg-white focus:bg-white text-xs p-3 pl-10 rounded-xl border border-gray-300 font-medium text-gray-900 outline-none focus:border-[#F97316] transition-colors"
            />
          </div>

          {/* Advanced Filter Panel */}
          {showAdvancedFilters && (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-sans animate-in fade-in duration-150">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-white p-2 rounded-lg border border-gray-300 font-medium outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="ACCEPTED">ACCEPTED</option>
                  <option value="IN_PRODUCTION">IN_PRODUCTION</option>
                  <option value="READY">READY</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Payment Status</label>
                <select
                  value={filterPaymentStatus}
                  onChange={(e) => setFilterPaymentStatus(e.target.value)}
                  className="w-full bg-white p-2 rounded-lg border border-gray-300 font-medium outline-none"
                >
                  <option value="ALL">All Payment States</option>
                  <option value="PAID">Fully Paid</option>
                  <option value="DUE">Outstanding Due Balance</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Priority</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full bg-white p-2 rounded-lg border border-gray-300 font-medium outline-none"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Order Type</label>
                <select
                  value={filterOrderType}
                  onChange={(e) => setFilterOrderType(e.target.value)}
                  className="w-full bg-white p-2 rounded-lg border border-gray-300 font-medium outline-none"
                >
                  <option value="ALL">All Types</option>
                  <option value="Quick Order">Quick Order</option>
                  <option value="Walk-in Order">Walk-in Order</option>
                  <option value="Custom Fabrication">Custom Fabrication</option>
                  <option value="Repair Order">Repair Order</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* LIGHTWEIGHT SCANNING ORDER CARDS GRID */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center max-w-md mx-auto space-y-3">
            <Clock size={40} className="mx-auto text-gray-300" />
            <h3 className="font-heading font-bold text-base text-[#111111]">No Orders Found</h3>
            <p className="text-xs text-gray-500">Try adjusting your search criteria or tab filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((ord) => {
              const cleanPhone = ord.customerPhone.replace(/\D/g, '').slice(-10);
              const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                `Hello ${ord.customerName}, regarding Order #${ord.orderNumber} (Total: ₹${ord.finalPrice.toLocaleString('en-IN')}).`
              )}`;

              const firstItemImage =
                ord.items?.[0]?.image ||
                'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80';

              return (
                <div
                  key={ord.id}
                  onClick={() => navigate(`/admin/orders/${ord.id}`)}
                  className="bg-white rounded-[22px] border border-gray-200 hover:border-[#F97316] hover:shadow-md transition-all p-4 space-y-3 font-sans cursor-pointer group flex flex-col justify-between"
                >
                  {/* Card Top Row: Image, Order # & Source Badge */}
                  <div className="flex items-center gap-3">
                    <img
                      src={firstItemImage}
                      alt={ord.orderNumber}
                      className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0 group-hover:scale-105 transition-transform"
                    />

                    <div className="truncate flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-heading font-black text-base text-[#111111] group-hover:text-[#F97316] transition-colors truncate">
                          #{ord.orderNumber}
                        </span>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase ${
                          ord.isOfflineOrder
                            ? 'bg-[#111111] text-white border-[#111111]'
                            : 'bg-blue-100 text-blue-800 border-blue-300'
                        }`}>
                          {ord.isOfflineOrder ? 'OFFLINE' : 'ONLINE'}
                        </span>
                      </div>

                      <h4 className="font-heading font-bold text-xs text-gray-900 truncate mt-0.5">
                        {ord.customerName}
                      </h4>
                      <p className="text-[11px] font-mono text-gray-500">{ord.customerPhone}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/orders/${ord.id}`);
                      }}
                      className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-[#F97316] group-hover:text-white text-gray-700 flex items-center justify-center transition-colors shrink-0"
                      title="Open Full Order Detail Page"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  {/* Status & Priority Badge Row */}
                  <div className="flex items-center justify-between gap-2 border-t border-b border-gray-100 py-2 text-[11px] font-mono">
                    <div onClick={(e) => e.stopPropagation()}>
                      <select
                        value={ord.status}
                        onChange={(e) => {
                          const newStatus = e.target.value as any;
                          updateOrderStatus(ord.id, newStatus);
                          if (['COMPLETED', 'INSTALLED', 'OUT_FOR_DELIVERY'].includes(newStatus)) {
                            setDeliveredModalOrder(ord);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border outline-none cursor-pointer ${
                          ord.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : ord.status === 'IN_PRODUCTION'
                            ? 'bg-purple-100 text-purple-800 border-purple-300'
                            : ord.status === 'ACCEPTED'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="ACCEPTED">ACCEPTED</option>
                        <option value="IN_PRODUCTION">IN PRODUCTION</option>
                        <option value="QUALITY_CHECK">QUALITY CHECK</option>
                        <option value="READY">READY FOR DISPATCH</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="REJECTED">REJECTED / CANCELLED</option>
                      </select>
                    </div>

                    <span className="text-gray-400 text-[10px]">
                      Created: {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>

                  {/* Financial Price Summary */}
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-gray-400 block">Total Price</span>
                      <strong className="text-[#111111]">₹{ord.finalPrice.toLocaleString('en-IN')}</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-emerald-700 block">Paid</span>
                      <strong className="text-emerald-700">₹{ord.advancePaid.toLocaleString('en-IN')}</strong>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block">Balance Due</span>
                      <strong className={ord.remainingBalance > 0 ? 'text-red-600' : 'text-emerald-600'}>
                        ₹{ord.remainingBalance.toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>

                  {/* Card Bottom Quick Actions */}
                  <div className="grid grid-cols-5 gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/admin/orders/${ord.id}`)}
                      className="py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl flex items-center justify-center cursor-pointer"
                      title="Open Detail Page"
                    >
                      <ChevronRight size={13} />
                    </button>

                    {ord.remainingBalance > 0 && (
                      <button
                        onClick={() => setPayingOrder(ord)}
                        className="py-1.5 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs rounded-xl flex items-center justify-center cursor-pointer"
                        title="Collect Payment"
                      >
                        <CreditCard size={13} />
                      </button>
                    )}

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs rounded-xl flex items-center justify-center cursor-pointer"
                      title="WhatsApp Customer"
                    >
                      <MessageCircle size={13} />
                    </a>

                    <button
                      onClick={() => setProgressModalOrder(ord)}
                      className="py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center justify-center cursor-pointer"
                      title="Upload Live Workshop Progress Photo"
                    >
                      <Camera size={13} />
                    </button>

                    <button
                      onClick={() => setDeliveredModalOrder(ord)}
                      className="py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center cursor-pointer"
                      title="Send Delivery Thank You Message (MANIKANDAN LATHE)"
                    >
                      <CheckCircle2 size={13} />
                    </button>

                    <button
                      onClick={() => setInvoiceOrder(ord)}
                      className="py-1.5 bg-[#111111] hover:bg-black text-white font-bold text-xs rounded-xl flex items-center justify-center cursor-pointer"
                      title="Print Tax Invoice"
                    >
                      <Printer size={13} />
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
              <span>Are you sure you want to permanently delete Order <strong>#{deletingOrder.orderNumber}</strong>? This record will be permanently deleted from system database and cannot be recovered.</span>
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

      {/* Admin Payment Collection Modal */}
      <AdminPaymentCollectionModal
        order={payingOrder}
        isOpen={!!payingOrder}
        onClose={() => setPayingOrder(null)}
      />

      {/* PDF Tax Invoice Modal */}
      <PDFInvoiceModal
        order={invoiceOrder}
        isOpen={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
      />
      <AdminDeliveredMessageModal
        isOpen={Boolean(deliveredModalOrder)}
        onClose={() => setDeliveredModalOrder(null)}
        order={deliveredModalOrder}
      />
      <AdminWorkshopProgressModal
        order={progressModalOrder}
        isOpen={Boolean(progressModalOrder)}
        onClose={() => setProgressModalOrder(null)}
        onUpdateOrderProgress={updateOrderWorkshopProgress}
      />
    </div>
  );
};

export default AdminOrdersPage;
