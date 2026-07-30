import React, { useState } from 'react';
import { useEnquiries } from '../../context/EnquiryContext';
import { CustomerEnquiry, EnquiryStatus } from '../../types';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  MessageSquare,
  DollarSign,
  Phone,
  MessageCircle,
  Eye,
  FileText,
  Layers,
  Sparkles,
  Clock,
  User,
  MapPin,
  Calendar,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminEnquiriesPage: React.FC = () => {
  const { enquiries, loading, adminApproveEnquiry, adminRejectEnquiry, requestMoreInfo, adjustEnquiryPrice } = useEnquiries();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPayment, setFilterPayment] = useState<string>('ALL');
  const [selectedEnquiry, setSelectedEnquiry] = useState<CustomerEnquiry | null>(null);

  // Action Modals State
  const [rejectModalEnquiry, setRejectModalEnquiry] = useState<CustomerEnquiry | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [infoModalEnquiry, setInfoModalEnquiry] = useState<CustomerEnquiry | null>(null);
  const [infoMessage, setInfoMessage] = useState('');
  const [priceModalEnquiry, setPriceModalEnquiry] = useState<CustomerEnquiry | null>(null);
  const [newPriceInput, setNewPriceInput] = useState<number>(0);

  // Filter Logic
  const filteredEnquiries = enquiries.filter((e) => {
    const matchesSearch =
      e.enquiryNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.customerPhone.includes(searchQuery) ||
      e.productName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || e.status === filterStatus;
    const matchesPayment =
      filterPayment === 'ALL' ||
      (filterPayment === 'ADVANCE_PAID' && e.advancePaid > 0) ||
      (filterPayment === 'PAY_LATER' && e.advancePaid === 0);

    return matchesSearch && matchesStatus && matchesPayment;
  });

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

  const handleApprove = async (e: CustomerEnquiry) => {
    const orderId = await adminApproveEnquiry(e.id);
    if (orderId) {
      navigate(`/admin/orders/${orderId}`);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectModalEnquiry || !rejectReason.trim()) return;
    await adminRejectEnquiry(rejectModalEnquiry.id, rejectReason);
    setRejectModalEnquiry(null);
    setRejectReason('');
  };

  const handleConfirmInfoRequest = async () => {
    if (!infoModalEnquiry || !infoMessage.trim()) return;
    await requestMoreInfo(infoModalEnquiry.id, infoMessage);
    setInfoModalEnquiry(null);
    setInfoMessage('');
  };

  const handleConfirmPriceAdjust = async () => {
    if (!priceModalEnquiry || newPriceInput <= 0) return;
    await adjustEnquiryPrice(priceModalEnquiry.id, newPriceInput);
    setPriceModalEnquiry(null);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] font-sans pb-24">
      
      {/* Page Header */}
      <div className="bg-[#111111] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#F97316] text-white text-[10px] font-mono font-black px-2.5 py-0.5 rounded uppercase">
                FABRICATION WORKFLOW
              </span>
              <span className="text-xs text-gray-400 font-mono">Real-time Online Order Approvals</span>
            </div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-white mt-1">
              CUSTOMER ENQUIRIES & QUOTATIONS
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-gray-800 px-4 py-2 rounded-xl text-xs font-mono">
              Total Enquiries: <strong className="text-[#F97316]">{enquiries.length}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-sans">
          <div className="bg-white p-4 rounded-[22px] border border-gray-200 shadow-xs space-y-1">
            <span className="text-[11px] font-mono text-gray-500 font-bold uppercase block">Received Enquiries</span>
            <span className="font-heading font-black text-2xl text-yellow-600">
              {enquiries.filter((e) => e.status === 'ENQUIRY_RECEIVED').length}
            </span>
          </div>
          <div className="bg-white p-4 rounded-[22px] border border-gray-200 shadow-xs space-y-1">
            <span className="text-[11px] font-mono text-gray-500 font-bold uppercase block">Advance Paid</span>
            <span className="font-heading font-black text-2xl text-green-600">
              {enquiries.filter((e) => e.advancePaid > 0).length}
            </span>
          </div>
          <div className="bg-white p-4 rounded-[22px] border border-gray-200 shadow-xs space-y-1">
            <span className="text-[11px] font-mono text-gray-500 font-bold uppercase block">Accepted Orders</span>
            <span className="font-heading font-black text-2xl text-blue-600">
              {enquiries.filter((e) => e.status === 'ORDER_ACCEPTED').length}
            </span>
          </div>
          <div className="bg-white p-4 rounded-[22px] border border-gray-200 shadow-xs space-y-1">
            <span className="text-[11px] font-mono text-gray-500 font-bold uppercase block">Rejected / Closed</span>
            <span className="font-heading font-black text-2xl text-red-600">
              {enquiries.filter((e) => e.status === 'REJECTED').length}
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-[24px] border border-gray-200 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Enquiry #, Name, Phone, Product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#F97316]"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto text-xs font-bold">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ENQUIRY_RECEIVED">Enquiry Received</option>
              <option value="INFO_REQUESTED">Info Requested</option>
              <option value="ORDER_ACCEPTED">Order Accepted</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
            >
              <option value="ALL">All Payments</option>
              <option value="ADVANCE_PAID">Advance Online Paid</option>
              <option value="PAY_LATER">Pay Later (Enquiry)</option>
            </select>
          </div>
        </div>

        {/* Enquiries Grid */}
        {loading ? (
          <div className="p-12 text-center text-gray-500 font-mono">Loading live workshop enquiries...</div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-[24px] border border-gray-200 text-gray-500">
            No customer enquiries match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
            {filteredEnquiries.map((enq) => (
              <div
                key={enq.id}
                className="bg-white rounded-[24px] border border-gray-200 p-5 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div>
                      <span className="font-mono text-xs font-black text-[#F97316]">{enq.enquiryNumber}</span>
                      <p className="text-[10px] text-gray-400 font-mono">{new Date(enq.createdAt).toLocaleString('en-IN')}</p>
                    </div>
                    {getStatusBadge(enq.status)}
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 p-3 rounded-2xl space-y-1.5 text-xs">
                    <div className="font-heading font-black text-sm text-[#111111] flex items-center gap-1.5">
                      <User size={14} className="text-gray-500" /> {enq.customerName}
                    </div>
                    <div className="text-gray-600 font-mono flex items-center gap-1.5">
                      <Phone size={12} className="text-gray-400" /> {enq.customerPhone}
                    </div>
                    <div className="text-gray-500 text-[11px] flex items-start gap-1.5">
                      <MapPin size={12} className="text-gray-400 shrink-0 mt-0.5" /> {enq.customerAddress}
                    </div>
                  </div>

                  {/* Product & Measurements */}
                  <div className="flex gap-3 items-start border-b border-gray-100 pb-3">
                    <img src={enq.productImage} alt={enq.productName} className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0" />
                    <div className="flex-1 min-w-0 text-xs">
                      <h4 className="font-heading font-black text-xs text-[#111111] line-clamp-1">{enq.productName}</h4>
                      <p className="text-[11px] text-gray-500 font-mono">Variant: {enq.variantName || 'Standard'}</p>
                      <p className="text-[11px] text-gray-500 font-mono">Qty: {enq.quantity}</p>
                      {enq.measurements && (
                        <div className="mt-1 bg-amber-50 text-amber-900 px-2 py-0.5 rounded text-[10px] font-mono border border-amber-200">
                          📏 {enq.measurements}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reference Images */}
                  {enq.referenceImages && enq.referenceImages.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 block mb-1">Uploaded Reference Site Photos:</span>
                      <div className="flex gap-1.5 overflow-x-auto">
                        {enq.referenceImages.map((img, idx) => (
                          <a key={idx} href={img} target="_blank" rel="noopener noreferrer">
                            <img src={img} alt="ref" className="w-12 h-12 rounded-lg object-cover border border-gray-300 hover:scale-105 transition-transform" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pricing & Advance Details */}
                  <div className="bg-orange-50/60 p-3 rounded-2xl border border-orange-100 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[10px] text-gray-500 font-mono block">Estimated Total Price</span>
                      <span className="font-heading font-black text-base text-[#F97316]">
                        ₹{(enq.adjustedPrice ?? enq.estimatedPrice).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-500 font-mono block">Payment Option</span>
                      {enq.advancePaid > 0 ? (
                        <span className="bg-green-100 text-green-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                          Advance Paid: ₹{enq.advancePaid.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="bg-gray-200 text-gray-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                          Pay Later (Enquiry)
                        </span>
                      )}
                    </div>
                  </div>

                  {enq.notes && (
                    <p className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded-xl border border-gray-200">
                      💬 <strong>Customer Notes:</strong> {enq.notes}
                    </p>
                  )}
                </div>

                {/* Actions Bar */}
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  {enq.status !== 'ORDER_ACCEPTED' && enq.status !== 'REJECTED' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleApprove(enq)}
                        className="bg-green-600 hover:bg-green-700 text-white font-heading font-black text-xs py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 size={14} /> Approve & Create Order
                      </button>

                      <button
                        onClick={() => setRejectModalEnquiry(enq)}
                        className="bg-red-600 hover:bg-red-700 text-white font-heading font-black text-xs py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <XCircle size={14} /> Reject Enquiry
                      </button>
                    </div>
                  )}

                  <div className="flex gap-1.5 text-xs font-bold">
                    <button
                      onClick={() => {
                        setPriceModalEnquiry(enq);
                        setNewPriceInput(enq.adjustedPrice ?? enq.estimatedPrice);
                      }}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-xl flex items-center justify-center gap-1"
                    >
                      <DollarSign size={13} /> Adjust Price
                    </button>

                    <button
                      onClick={() => setInfoModalEnquiry(enq)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-xl flex items-center justify-center gap-1"
                    >
                      <MessageSquare size={13} /> Request Info
                    </button>

                    <a
                      href={`https://wa.me/91${enq.customerPhone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(
                        `Hi ${enq.customerName}, regarding your ${enq.productName} enquiry (#${enq.enquiryNumber}) at MANIKANDAN LATHE:`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-xl flex items-center justify-center"
                      title="WhatsApp Customer"
                    >
                      <MessageCircle size={15} />
                    </a>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* REJECT MODAL */}
      {rejectModalEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] max-w-md w-full p-5 space-y-4 shadow-2xl border border-gray-200 font-sans">
            <h3 className="font-heading font-black text-sm text-[#111111] uppercase border-b border-gray-100 pb-2">
              Reject Enquiry #{rejectModalEnquiry.enquiryNumber}
            </h3>
            <div>
              <label className="font-bold text-xs text-gray-700 block mb-1">Reason for Rejection *</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Dimensions out of workshop scope, raw material out of stock..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-300 text-xs outline-none focus:border-red-500"
              />
            </div>
            {rejectModalEnquiry.advancePaid > 0 && (
              <div className="bg-red-50 p-3 rounded-xl border border-red-200 text-xs text-red-900">
                ⚠️ Customer paid <strong>₹{rejectModalEnquiry.advancePaid.toLocaleString('en-IN')}</strong> advance online. Rejecting will automatically create a refundable entry in <strong>/admin/refunds</strong>.
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setRejectModalEnquiry(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-2.5 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-heading font-black text-xs py-2.5 rounded-xl"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REQUEST INFO MODAL */}
      {infoModalEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] max-w-md w-full p-5 space-y-4 shadow-2xl border border-gray-200 font-sans">
            <h3 className="font-heading font-black text-sm text-[#111111] uppercase border-b border-gray-100 pb-2">
              Request Information for #{infoModalEnquiry.enquiryNumber}
            </h3>
            <div>
              <label className="font-bold text-xs text-gray-700 block mb-1">Message for Customer *</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Please measure door frame height again from floor level..."
                value={infoMessage}
                onChange={(e) => setInfoMessage(e.target.value)}
                className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-300 text-xs outline-none focus:border-[#F97316]"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setInfoModalEnquiry(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-2.5 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmInfoRequest}
                className="flex-1 bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs py-2.5 rounded-xl"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADJUST PRICE MODAL */}
      {priceModalEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] max-w-md w-full p-5 space-y-4 shadow-2xl border border-gray-200 font-sans">
            <h3 className="font-heading font-black text-sm text-[#111111] uppercase border-b border-gray-100 pb-2">
              Adjust Price for #{priceModalEnquiry.enquiryNumber}
            </h3>
            <div>
              <label className="font-bold text-xs text-gray-700 block mb-1">New Total Price (₹) *</label>
              <input
                type="number"
                required
                value={newPriceInput}
                onChange={(e) => setNewPriceInput(Number(e.target.value))}
                className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-300 text-xs font-mono font-bold outline-none focus:border-[#F97316]"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPriceModalEnquiry(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-2.5 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPriceAdjust}
                className="flex-1 bg-[#111111] hover:bg-[#F97316] text-white font-heading font-black text-xs py-2.5 rounded-xl"
              >
                Update Price
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
