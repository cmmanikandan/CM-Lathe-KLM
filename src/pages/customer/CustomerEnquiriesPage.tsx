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
  Sparkles,
  ShoppingBag,
  RefreshCw,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const CustomerEnquiriesPage: React.FC = () => {
  const { user } = useAuth();
  const { getCustomerEnquiries, loading, refreshEnquiries } = useEnquiries();
  const navigate = useNavigate();

  const userPhone = user?.phone || '';
  const myEnquiries = getCustomerEnquiries(userPhone);

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

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111] font-sans pb-28">
      {/* Header */}
      <div className="bg-[#111111] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#F97316] text-white text-[10px] font-mono font-black px-2.5 py-0.5 rounded uppercase">
                MY ENQUIRIES
              </span>
              <span className="text-xs text-gray-400 font-mono">Fabrication Orders Tracking</span>
            </div>
            <h1 className="font-heading font-black text-2xl text-white mt-1">ONLINE ORDER ENQUIRIES</h1>
          </div>

          <div className="flex gap-2">
            <Link
              to="/customer/refunds"
              className="bg-gray-800 hover:bg-gray-700 text-white font-heading font-black text-xs px-3.5 py-2 rounded-xl transition-all"
            >
              My Refunds →
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {loading ? (
          <div className="p-12 text-center text-gray-500 font-mono">Fetching your enquiries...</div>
        ) : myEnquiries.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-[26px] border border-gray-200 shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto text-[#F97316]">
              <FileText size={32} />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-[#111111]">No Enquiries Submitted Yet</h3>
              <p className="text-xs text-gray-500">
                Browse our product catalog to request custom dimensions, lathe turning, or fabrication quotes.
              </p>
            </div>
            <button
              onClick={() => navigate('/customer/products')}
              className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-5 py-3 rounded-xl shadow-md"
            >
              Browse Catalog →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {myEnquiries.map((enq) => (
              <div
                key={enq.id}
                className="bg-white rounded-[24px] border border-gray-200/90 p-5 shadow-xs space-y-4 hover:border-[#F97316] transition-all"
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <span className="font-mono text-xs font-black text-[#F97316]">{enq.enquiryNumber}</span>
                    <span className="block text-[10px] text-gray-400 font-mono">
                      Submitted on {new Date(enq.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  {getStatusBadge(enq.status)}
                </div>

                <div className="flex items-start gap-3">
                  <img
                    src={enq.productImage}
                    alt={enq.productName}
                    className="w-20 h-20 rounded-2xl object-cover border border-gray-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <h4 className="font-heading font-black text-sm text-[#111111]">{enq.productName}</h4>
                    <p className="text-[11px] text-gray-500 font-mono mt-0.5">Variant: {enq.variantName || 'Standard'}</p>
                    <p className="text-[11px] text-gray-500 font-mono">Quantity: {enq.quantity}</p>
                    {enq.measurements && (
                      <p className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-mono mt-1 border border-amber-200 inline-block">
                        📏 Measurements: {enq.measurements}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-gray-400 font-mono block">Estimated Total</span>
                    <span className="font-heading font-black text-base text-[#F97316]">
                      ₹{(enq.adjustedPrice ?? enq.estimatedPrice).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Rejection / Info alert box */}
                {enq.status === 'REJECTED' && (
                  <div className="bg-red-50 p-3 rounded-2xl border border-red-200 text-xs text-red-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <XCircle size={14} className="text-red-600" /> Enquiry Declined by Workshop
                    </div>
                    <p className="text-[11px]">{enq.rejectionReason || 'Workshop cannot process this request.'}</p>
                    {enq.advancePaid > 0 && (
                      <div className="pt-1 text-[11px] font-bold text-red-700">
                        💳 Your 25% Advance payment of ₹{enq.advancePaid.toLocaleString('en-IN')} has been sent to Refunds section.
                      </div>
                    )}
                  </div>
                )}

                {enq.status === 'INFO_REQUESTED' && (
                  <div className="bg-purple-50 p-3 rounded-2xl border border-purple-200 text-xs text-purple-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <MessageSquare size={14} className="text-purple-600" /> Information Requested by Workshop
                    </div>
                    <p className="text-[11px]">{enq.infoRequestedMessage}</p>
                  </div>
                )}

                {enq.status === 'ORDER_ACCEPTED' && enq.orderId && (
                  <div className="bg-green-50 p-3 rounded-2xl border border-green-200 flex items-center justify-between text-xs text-green-900">
                    <div>
                      <span className="font-bold block">✓ Approved & Production Order Created!</span>
                      <span className="text-[11px] text-green-700">Your order is now in the workshop production line.</span>
                    </div>
                    <button
                      onClick={() => navigate(`/customer/orders/${enq.orderId}`)}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shrink-0"
                    >
                      View Order →
                    </button>
                  </div>
                )}

                {/* Timeline dropdown / summary */}
                <div className="bg-gray-50 p-3 rounded-2xl space-y-2 border border-gray-100">
                  <span className="text-[10px] font-mono font-bold uppercase text-gray-500 block">Activity Log</span>
                  <div className="space-y-1.5 border-l-2 border-orange-300 pl-3">
                    {enq.timeline.map((t) => (
                      <div key={t.id} className="text-[11px]">
                        <span className="font-bold text-[#111111]">{t.action}</span>
                        <span className="text-[9px] text-gray-400 font-mono ml-2">
                          {new Date(t.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {t.details && <p className="text-[10px] text-gray-600">{t.details}</p>}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
