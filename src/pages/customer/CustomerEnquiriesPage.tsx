import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useEnquiries } from '../../context/EnquiryContext';
import { CustomerEnquiry, EnquiryStatus } from '../../types';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ShoppingBag,
  RefreshCw,
  Phone,
  MessageCircle,
  ArrowLeft,
  Search,
  Filter,
  SlidersHorizontal,
  Info,
  Calendar,
  Layers,
  Ruler,
  Tag,
  X
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { createCustomerEnquiryWhatsAppMessage } from '../../services/whatsappService';

export const CustomerEnquiriesPage: React.FC = () => {
  const { user } = useAuth();
  const { getCustomerEnquiries, loading } = useEnquiries();
  const navigate = useNavigate();

  const userPhone = user?.phone || '';
  const myEnquiries = getCustomerEnquiries(userPhone);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [expandedEnquiryId, setExpandedEnquiryId] = useState<string | null>(null);

  const getStatusBadge = (status: EnquiryStatus) => {
    switch (status) {
      case 'ENQUIRY_RECEIVED':
        return <span className="bg-yellow-100 text-yellow-800 border border-yellow-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">ENQUIRY RECEIVED</span>;
      case 'UNDER_REVIEW':
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">UNDER REVIEW</span>;
      case 'INFO_REQUESTED':
        return <span className="bg-purple-100 text-purple-800 border border-purple-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">INFO REQUESTED</span>;
      case 'ORDER_ACCEPTED':
        return <span className="bg-green-100 text-green-800 border border-green-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">ORDER ACCEPTED</span>;
      case 'REJECTED':
        return <span className="bg-red-100 text-red-800 border border-red-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">REJECTED</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 border border-gray-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">{status}</span>;
    }
  };

  const filteredEnquiries = myEnquiries.filter((enq) => {
    const matchesSearch =
      enq.enquiryNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enq.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (enq.measurements && enq.measurements.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = selectedStatusFilter === 'ALL' || enq.status === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 font-sans max-w-7xl mx-auto pb-28 text-[#111111]">
      
      {/* 1. TOP HEADER CARD (MATCHING ORDERS PAGE STYLE) */}
      <div className="bg-white p-4 sm:p-6 rounded-[22px] border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-[#111111]">MY ENQUIRIES</h1>
              <span className="bg-[#F97316] text-white font-mono font-black text-xs px-2.5 py-0.5 rounded-full shadow-xs">
                {myEnquiries.length} Enquiries
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Fabrication custom quotes, price adjustments & enquiry status tracking
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Enquiry ID or Product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-[#111111] placeholder-gray-400 focus:outline-none focus:border-[#F97316]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              onClick={() => setFilterSheetOpen(!filterSheetOpen)}
              className={`px-4 py-2.5 rounded-xl text-xs font-heading font-extrabold flex items-center gap-2 transition-colors shrink-0 cursor-pointer ${
                selectedStatusFilter !== 'ALL'
                  ? 'bg-[#F97316] text-white'
                  : 'bg-[#111111] text-white hover:bg-gray-800'
              }`}
            >
              <SlidersHorizontal size={14} /> Filter
            </button>
          </div>
        </div>

        {/* Filter Quick Pills */}
        {filterSheetOpen && (
          <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-2 animate-in fade-in duration-150">
            <span className="text-xs font-bold text-gray-500 flex items-center gap-1 self-center mr-1">
              <Filter size={12} /> Status:
            </span>
            {['ALL', 'ENQUIRY_RECEIVED', 'UNDER_REVIEW', 'INFO_REQUESTED', 'ORDER_ACCEPTED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatusFilter(st)}
                className={`px-3 py-1 rounded-xl text-[11px] font-mono font-bold border transition-all cursor-pointer ${
                  selectedStatusFilter === st
                    ? 'bg-[#111111] text-white border-[#111111]'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. ENQUIRIES LIST / CARDS */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-gray-500 font-mono bg-white rounded-[22px] border border-gray-200">
            Fetching your enquiries...
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-[26px] border border-gray-200 shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto text-[#F97316]">
              <FileText size={32} />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-[#111111]">
                {searchQuery || selectedStatusFilter !== 'ALL' ? 'No Matching Enquiries Found' : 'No Enquiries Submitted Yet'}
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                {searchQuery || selectedStatusFilter !== 'ALL'
                  ? 'Try adjusting your search query or status filter criteria.'
                  : 'Browse our product catalog to request custom dimensions, lathe turning, or fabrication quotes.'}
              </p>
            </div>
            {searchQuery || selectedStatusFilter !== 'ALL' ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatusFilter('ALL');
                }}
                className="bg-gray-100 hover:bg-gray-200 text-[#111111] font-heading font-black text-xs px-5 py-3 rounded-xl cursor-pointer"
              >
                Reset Filters
              </button>
            ) : (
              <button
                onClick={() => navigate('/customer/products')}
                className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-5 py-3 rounded-xl shadow-md cursor-pointer"
              >
                Browse Catalog →
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEnquiries.map((enq) => {
              const isExpanded = expandedEnquiryId === enq.id;

              return (
                <div
                  key={enq.id}
                  className={`bg-white rounded-[24px] border transition-all duration-200 overflow-hidden shadow-xs ${
                    isExpanded ? 'border-[#F97316] ring-2 ring-[#F97316]/20' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* CARD HEADER SUMMARY - CLICK TO EXPAND */}
                  <div
                    onClick={() => setExpandedEnquiryId(isExpanded ? null : enq.id)}
                    className="p-4 sm:p-5 cursor-pointer hover:bg-gray-50/50 transition-colors space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-[#F97316]">{enq.enquiryNumber}</span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          • Submitted {new Date(enq.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(enq.status)}
                        <button className="text-gray-400 hover:text-black transition-colors p-1">
                          {isExpanded ? <ChevronDown size={18} className="rotate-180 transition-transform" /> : <ChevronRight size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <img
                        src={enq.productImage}
                        alt={enq.productName}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-gray-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0 text-xs space-y-1">
                        <h4 className="font-heading font-black text-sm sm:text-base text-[#111111] leading-tight">
                          {enq.productName}
                        </h4>
                        <p className="text-[11px] text-gray-500 font-mono">
                          Variant: <strong className="text-gray-800">{enq.variantName || 'Standard'}</strong> | Qty: <strong className="text-gray-800">{enq.quantity}</strong>
                        </p>
                        {enq.measurements && (
                          <span className="text-[11px] text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-lg font-mono border border-amber-200 inline-block font-semibold">
                            📏 Specs: {enq.measurements}
                          </span>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-gray-400 font-mono block">Estimated Total</span>
                        <span className="font-heading font-black text-base sm:text-lg text-[#F97316]">
                          ₹{(enq.adjustedPrice ?? enq.estimatedPrice).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-[#F97316] font-extrabold block mt-0.5">
                          {isExpanded ? 'Click to collapse ▲' : 'Click for details ▼'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. EXPANDED IN-PAGE ENQUIRY DETAIL VIEW */}
                  {isExpanded && (
                    <div className="bg-gray-50/70 p-4 sm:p-6 border-t border-gray-200 space-y-5 animate-in fade-in duration-200">
                      
                      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                        <h4 className="font-heading font-black text-xs uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                          <Info size={14} className="text-[#F97316]" /> ENQUIRY FULL DETAILS & WORKSHOP LEDGER
                        </h4>
                        <span className="text-[11px] text-gray-500 font-mono">Enquiry #{enq.enquiryNumber}</span>
                      </div>

                      {/* Status Alerts */}
                      {enq.status === 'REJECTED' && (
                        <div className="bg-red-50 p-4 rounded-2xl border border-red-200 text-xs text-red-900 space-y-1.5">
                          <div className="font-bold flex items-center gap-1.5 text-red-700">
                            <XCircle size={16} /> Enquiry Declined by Workshop
                          </div>
                          <p className="text-[11px] leading-relaxed">{enq.rejectionReason || 'Workshop cannot process this request.'}</p>
                          {enq.advancePaid > 0 && (
                            <div className="pt-1 text-[11px] font-bold text-red-700">
                              💳 Your 25% Advance payment of ₹{enq.advancePaid.toLocaleString('en-IN')} has been credited to your Refunds ledger.
                            </div>
                          )}
                        </div>
                      )}

                      {enq.status === 'INFO_REQUESTED' && (
                        <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 text-xs text-purple-900 space-y-1.5">
                          <div className="font-bold flex items-center gap-1.5 text-purple-700">
                            <MessageSquare size={16} /> Workshop Information Request
                          </div>
                          <p className="text-[11px] leading-relaxed">{enq.infoRequestedMessage}</p>
                        </div>
                      )}

                      {enq.status === 'ORDER_ACCEPTED' && enq.orderId && (
                        <div className="bg-green-50 p-4 rounded-2xl border border-green-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-green-900">
                          <div>
                            <span className="font-bold text-green-800 block text-sm">✓ Approved & Production Order Created!</span>
                            <span className="text-[11px] text-green-700">Your order is active in the workshop production line.</span>
                          </div>
                          <button
                            onClick={() => navigate(`/customer/orders/${enq.orderId}`)}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shrink-0 cursor-pointer shadow-xs"
                          >
                            View Order Progress →
                          </button>
                        </div>
                      )}

                      {/* Specifications Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-gray-200 text-xs font-mono">
                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-bold">Product Model</span>
                          <span className="font-bold text-[#111111]">{enq.productName}</span>
                        </div>

                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-bold">Variant / Material</span>
                          <span className="font-bold text-[#111111]">{enq.variantName || 'Standard'}</span>
                        </div>

                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-bold">Quantity Requested</span>
                          <span className="font-bold text-[#111111]">{enq.quantity} units</span>
                        </div>

                        <div>
                          <span className="text-gray-400 block text-[10px] uppercase font-bold">Delivery Preference</span>
                          <span className="font-bold text-[#111111]">{enq.deliveryType || 'Shop Pickup'}</span>
                        </div>

                        {enq.measurements && (
                          <div className="sm:col-span-2 border-t border-gray-100 pt-2">
                            <span className="text-gray-400 block text-[10px] uppercase font-bold">Custom Dimensions / Notes</span>
                            <span className="font-bold text-amber-900">{enq.measurements}</span>
                          </div>
                        )}
                      </div>

                      {/* Activity Log / Timeline */}
                      <div className="bg-white p-4 rounded-2xl space-y-3 border border-gray-200">
                        <span className="text-[10px] font-mono font-bold uppercase text-gray-500 block">
                          Enquiry Progress Timeline Log
                        </span>
                        <div className="space-y-2 border-l-2 border-orange-400 pl-3">
                          {enq.timeline.map((t) => (
                            <div key={t.id} className="text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#111111]">{t.action}</span>
                                <span className="text-[10px] text-gray-400 font-mono">
                                  {new Date(t.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              {t.details && <p className="text-[11px] text-gray-600 font-mono mt-0.5">{t.details}</p>}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* WhatsApp Direct Action Bar */}
                      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-200">
                        <div className="text-xs">
                          <span className="text-gray-500 block">Workshop Direct Contact:</span>
                          <strong className="text-[#111111] font-mono">Chellamuthu K (+91 96592 86268)</strong>
                        </div>
                        <a
                          href={createCustomerEnquiryWhatsAppMessage(enq)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-heading font-black text-xs px-5 py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-95"
                        >
                          <MessageCircle size={16} /> Send WhatsApp Enquiry to Chellamuthu K
                        </a>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default CustomerEnquiriesPage;
