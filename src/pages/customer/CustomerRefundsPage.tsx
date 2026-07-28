import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRefunds } from '../../context/RefundContext';
import { RefundStatus } from '../../types';
import {
  RefreshCw,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  ShieldCheck,
  CreditCard,
  Building2,
  ArrowLeft,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const CustomerRefundsPage: React.FC = () => {
  const { user } = useAuth();
  const { getCustomerRefunds, loading } = useRefunds();
  const navigate = useNavigate();

  const userPhone = user?.phone || '';
  const myRefunds = getCustomerRefunds(userPhone);

  const getStatusBadge = (status: RefundStatus) => {
    switch (status) {
      case 'Requested':
        return <span className="bg-yellow-100 text-yellow-800 border border-yellow-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">REQUESTED</span>;
      case 'Approved':
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">APPROVED</span>;
      case 'Processing':
        return <span className="bg-purple-100 text-purple-800 border border-purple-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">PROCESSING</span>;
      case 'Completed':
        return <span className="bg-green-100 text-green-800 border border-green-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">COMPLETED</span>;
      case 'Cancelled':
      case 'Failed':
        return <span className="bg-red-100 text-red-800 border border-red-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">{status.toUpperCase()}</span>;
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
              <span className="bg-red-500 text-white text-[10px] font-mono font-black px-2.5 py-0.5 rounded uppercase">
                PAYOUT TRACKER
              </span>
              <span className="text-xs text-gray-400 font-mono">Razorpay & Cash Refunds</span>
            </div>
            <h1 className="font-heading font-black text-2xl text-white mt-1">MY REFUNDS</h1>
          </div>

          <Link
            to="/customer/enquiries"
            className="bg-gray-800 hover:bg-gray-700 text-white font-heading font-black text-xs px-3.5 py-2 rounded-xl transition-all"
          >
            ← My Enquiries
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {loading ? (
          <div className="p-12 text-center text-gray-500 font-mono">Fetching your refund records...</div>
        ) : myRefunds.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-[26px] border border-gray-200 shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto text-green-600">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-[#111111]">No Active Refunds</h3>
              <p className="text-xs text-gray-500">
                You do not have any pending or completed refund requests.
              </p>
            </div>
            <button
              onClick={() => navigate('/customer/enquiries')}
              className="bg-[#111111] hover:bg-[#F97316] text-white font-heading font-black text-xs px-5 py-3 rounded-xl"
            >
              Go to My Enquiries
            </button>
          </div>
        ) : (
          <div className="space-y-4 font-sans">
            {myRefunds.map((rfd) => (
              <div
                key={rfd.id}
                className="bg-white rounded-[24px] border border-gray-200 p-5 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div>
                    <span className="font-mono text-xs font-black text-[#F97316]">{rfd.refundNumber}</span>
                    <span className="block text-[10px] text-gray-400 font-mono">
                      Created on {new Date(rfd.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  {getStatusBadge(rfd.status)}
                </div>

                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-500 font-mono block">Refund Amount</span>
                    <span className="font-heading font-black text-xl text-red-600">
                      ₹{rfd.refundAmount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-gray-500 block mt-0.5">{rfd.refundType} · {rfd.refundMethod}</span>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-[10px] text-gray-500 block">Reason</span>
                    <span className="bg-gray-200 text-gray-800 font-bold px-2.5 py-0.5 rounded-full text-[10px] inline-block mt-0.5">
                      {rfd.reason}
                    </span>
                    {rfd.expectedCompletionDate && rfd.status !== 'Completed' && (
                      <span className="block text-[10px] text-gray-500 mt-1">
                        Est. Completion: {rfd.expectedCompletionDate}
                      </span>
                    )}
                  </div>
                </div>

                {rfd.razorpayRefundId && (
                  <div className="bg-green-50 p-3 rounded-2xl border border-green-200 text-xs text-green-900 font-mono">
                    💳 <strong>Razorpay Refund Txn ID:</strong> {rfd.razorpayRefundId}
                  </div>
                )}

                {rfd.cashVoucherNo && (
                  <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs text-amber-900 font-mono">
                    🧾 <strong>Cash Voucher No:</strong> {rfd.cashVoucherNo} (Collected from workshop counter)
                  </div>
                )}

                {/* Timeline */}
                <div className="bg-gray-50 p-3 rounded-2xl space-y-2 border border-gray-100">
                  <span className="text-[10px] font-mono font-bold uppercase text-gray-500 block">Refund Progress Timeline</span>
                  <div className="space-y-1.5 border-l-2 border-red-400 pl-3">
                    {rfd.timeline.map((t) => (
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
