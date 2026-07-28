import React, { useState } from 'react';
import { useRefunds } from '../../context/RefundContext';
import { Refund, RefundStatus, RefundReason, RefundType } from '../../types';
import {
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  FileText,
  MessageCircle,
  Printer,
  ChevronRight,
  ShieldCheck,
  Building2,
  CreditCard,
  User,
  Phone,
  AlertTriangle,
  Plus,
  ArrowRight,
} from 'lucide-react';

export const AdminRefundsPage: React.FC = () => {
  const { refunds, loading, createRefund, approveRefund, rejectRefund, processRefund, retryRefund } = useRefunds();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterReason, setFilterReason] = useState<string>('ALL');
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);

  // New Refund Modal
  const [showNewRefundModal, setShowNewRefundModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newOrderNum, setNewOrderNum] = useState('');
  const [newOrigAmount, setNewOrigAmount] = useState(0);
  const [newRefundAmount, setNewRefundAmount] = useState(0);
  const [newType, setNewType] = useState<RefundType>('Full Refund');
  const [newReason, setNewReason] = useState<RefundReason>('Customer Cancelled');
  const [newCustomReason, setNewCustomReason] = useState('');
  const [newMethod, setNewMethod] = useState<'Razorpay' | 'Cash' | 'Bank Transfer' | 'UPI'>('Razorpay');

  // Process Refund Payout Modal
  const [processModalRefund, setProcessModalRefund] = useState<Refund | null>(null);
  const [payoutMethod, setPayoutMethod] = useState<'Razorpay' | 'Cash' | 'Bank Transfer' | 'UPI'>('Razorpay');
  const [razorpayRefundIdInput, setRazorpayRefundIdInput] = useState('');
  const [cashVoucherNoInput, setCashVoucherNoInput] = useState('');
  const [staffNameInput, setStaffNameInput] = useState('');
  const [staffSignatureInput, setStaffSignatureInput] = useState('');

  // Reject Modal
  const [rejectModalRefund, setRejectModalRefund] = useState<Refund | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');

  const filteredRefunds = refunds.filter((r) => {
    const matchesSearch =
      r.refundNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerPhone.includes(searchQuery) ||
      (r.orderNumber && r.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchesReason = filterReason === 'ALL' || r.reason === filterReason;

    return matchesSearch && matchesStatus && matchesReason;
  });

  const totalRefundedAmount = refunds
    .filter((r) => r.status === 'Completed')
    .reduce((sum, r) => sum + r.refundAmount, 0);

  const pendingRefundsCount = refunds.filter(
    (r) => r.status === 'Requested' || r.status === 'Pending Approval' || r.status === 'Approved'
  ).length;

  const handleCreateRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone || newRefundAmount <= 0) {
      alert('Please fill in customer details and refund amount.');
      return;
    }

    await createRefund({
      customerName: newCustName,
      customerPhone: newCustPhone,
      orderNumber: newOrderNum || undefined,
      originalPaymentAmount: newOrigAmount || newRefundAmount,
      originalPaymentMode: newMethod,
      refundAmount: newRefundAmount,
      refundType: newType,
      reason: newReason,
      customReason: newCustomReason || undefined,
      refundMethod: newMethod,
      createdBy: 'Owner Admin',
    });

    setShowNewRefundModal(false);
    // Reset form
    setNewCustName('');
    setNewCustPhone('');
    setNewOrderNum('');
    setNewOrigAmount(0);
    setNewRefundAmount(0);
  };

  const handleConfirmProcessPayout = async () => {
    if (!processModalRefund) return;
    await processRefund(processModalRefund.id, {
      refundMethod: payoutMethod,
      razorpayRefundId: razorpayRefundIdInput || undefined,
      cashVoucherNo: cashVoucherNoInput || undefined,
      staffName: staffNameInput || undefined,
      staffSignature: staffSignatureInput || undefined,
    });
    setProcessModalRefund(null);
    setRazorpayRefundIdInput('');
    setCashVoucherNoInput('');
    setStaffNameInput('');
  };

  const handleConfirmReject = async () => {
    if (!rejectModalRefund || !rejectReasonInput) return;
    await rejectRefund(rejectModalRefund.id, rejectReasonInput);
    setRejectModalRefund(null);
    setRejectReasonInput('');
  };

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
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] font-sans pb-24">
      
      {/* Page Header */}
      <div className="bg-[#111111] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-red-500 text-white text-[10px] font-mono font-black px-2.5 py-0.5 rounded uppercase">
                FINANCIAL MANAGEMENT
              </span>
              <span className="text-xs text-gray-400 font-mono">Razorpay & Cash Refund Ledger</span>
            </div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-white mt-1">
              REFUND MANAGEMENT SYSTEM
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNewRefundModal(true)}
              className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={15} /> Create New Refund
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* KPI Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-sans">
          <div className="bg-white p-4 rounded-[22px] border border-gray-200 shadow-xs space-y-1">
            <span className="text-[11px] font-mono text-gray-500 font-bold uppercase block">Pending Payouts</span>
            <span className="font-heading font-black text-2xl text-yellow-600">{pendingRefundsCount}</span>
          </div>
          <div className="bg-white p-4 rounded-[22px] border border-gray-200 shadow-xs space-y-1">
            <span className="text-[11px] font-mono text-gray-500 font-bold uppercase block">Total Refunded Paid</span>
            <span className="font-heading font-black text-2xl text-green-600">
              ₹{totalRefundedAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="bg-white p-4 rounded-[22px] border border-gray-200 shadow-xs space-y-1">
            <span className="text-[11px] font-mono text-gray-500 font-bold uppercase block">Completed Refunds</span>
            <span className="font-heading font-black text-2xl text-blue-600">
              {refunds.filter((r) => r.status === 'Completed').length}
            </span>
          </div>
          <div className="bg-white p-4 rounded-[22px] border border-gray-200 shadow-xs space-y-1">
            <span className="text-[11px] font-mono text-gray-500 font-bold uppercase block">Rejected / Cancelled</span>
            <span className="font-heading font-black text-2xl text-red-600">
              {refunds.filter((r) => r.status === 'Cancelled' || r.status === 'Failed').length}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-[24px] border border-gray-200 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Refund #, Order #, Customer, Phone..."
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
              <option value="Requested">Requested</option>
              <option value="Approved">Approved</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              value={filterReason}
              onChange={(e) => setFilterReason(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
            >
              <option value="ALL">All Reasons</option>
              <option value="Order Rejected">Order Rejected</option>
              <option value="Customer Cancelled">Customer Cancelled</option>
              <option value="Product Unavailable">Product Unavailable</option>
              <option value="Duplicate Payment">Duplicate Payment</option>
            </select>
          </div>
        </div>

        {/* Refunds List / Table */}
        {loading ? (
          <div className="p-12 text-center text-gray-500 font-mono">Loading refunds database...</div>
        ) : filteredRefunds.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-[24px] border border-gray-200 text-gray-500">
            No refunds match your filters.
          </div>
        ) : (
          <div className="bg-white rounded-[24px] border border-gray-200 overflow-hidden shadow-xs font-sans">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-mono uppercase text-[10px]">
                    <th className="py-3 px-4">Refund Details</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Original Payment</th>
                    <th className="py-3 px-4">Refund Amount</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRefunds.map((rfd) => (
                    <tr key={rfd.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-black text-[#F97316]">{rfd.refundNumber}</span>
                        {rfd.orderNumber && (
                          <span className="block text-[10px] text-gray-500 font-mono">Ref Order: {rfd.orderNumber}</span>
                        )}
                        <span className="block text-[10px] text-gray-400 font-mono">{new Date(rfd.createdAt).toLocaleDateString('en-IN')}</span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-[#111111]">
                        <div>{rfd.customerName}</div>
                        <div className="text-[11px] text-gray-500 font-mono">{rfd.customerPhone}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div>₹{rfd.originalPaymentAmount.toLocaleString('en-IN')}</div>
                        <span className="text-[10px] text-gray-500">{rfd.originalPaymentMode}</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-black text-red-600">
                        ₹{rfd.refundAmount.toLocaleString('en-IN')}
                        <span className="block text-[10px] text-gray-500 font-normal">{rfd.refundType}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-[10px] font-bold">
                          {rfd.reason}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(rfd.status)}
                        {rfd.razorpayRefundId && (
                          <span className="block text-[9px] text-gray-400 font-mono mt-0.5 truncate max-w-[120px]">
                            RZP: {rfd.razorpayRefundId}
                          </span>
                        )}
                        {rfd.cashVoucherNo && (
                          <span className="block text-[9px] text-gray-400 font-mono mt-0.5">
                            Voucher: {rfd.cashVoucherNo}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {rfd.status === 'Requested' && (
                            <>
                              <button
                                onClick={() => approveRefund(rfd.id, 'Owner Admin')}
                                className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-[11px]"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setRejectModalRefund(rfd)}
                                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-[11px]"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {(rfd.status === 'Approved' || rfd.status === 'Processing') && (
                            <button
                              onClick={() => {
                                setProcessModalRefund(rfd);
                                setPayoutMethod(rfd.refundMethod);
                              }}
                              className="px-3 py-1 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-lg text-[11px]"
                            >
                              Process Payout
                            </button>
                          )}

                          {rfd.status === 'Failed' && (
                            <button
                              onClick={() => retryRefund(rfd.id)}
                              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-[11px] flex items-center gap-1"
                            >
                              <RefreshCw size={12} /> Retry
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedRefund(rfd)}
                            className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg"
                            title="View Full Ledger & Timeline"
                          >
                            <FileText size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* NEW REFUND MODAL */}
      {showNewRefundModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] max-w-lg w-full p-6 space-y-4 shadow-2xl border border-gray-200 font-sans max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-heading font-black text-sm text-[#111111] uppercase">Create Manual Refund Entry</h3>
              <button onClick={() => setShowNewRefundModal(false)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <form onSubmit={handleCreateRefundSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-300 outline-none focus:border-[#F97316]"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-300 font-mono outline-none focus:border-[#F97316]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Order # / Enquiry # (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. MLO-102948 / ENQ-928412"
                    value={newOrderNum}
                    onChange={(e) => setNewOrderNum(e.target.value)}
                    className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-300 font-mono outline-none focus:border-[#F97316]"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Refund Method *</label>
                  <select
                    value={newMethod}
                    onChange={(e) => setNewMethod(e.target.value as any)}
                    className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-300 font-bold outline-none"
                  >
                    <option value="Razorpay">Razorpay Online</option>
                    <option value="Cash">Cash Voucher</option>
                    <option value="UPI">UPI Transfer</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Original Payment Amount (₹)</label>
                  <input
                    type="number"
                    value={newOrigAmount}
                    onChange={(e) => setNewOrigAmount(Number(e.target.value))}
                    className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-300 font-mono outline-none focus:border-[#F97316]"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Refund Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newRefundAmount}
                    onChange={(e) => setNewRefundAmount(Number(e.target.value))}
                    className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-300 font-mono font-bold outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Refund Reason *</label>
                <select
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value as RefundReason)}
                  className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-300 font-bold outline-none"
                >
                  <option value="Customer Cancelled">Customer Cancelled</option>
                  <option value="Admin Cancelled">Admin Cancelled</option>
                  <option value="Product Unavailable">Product Unavailable</option>
                  <option value="Duplicate Payment">Duplicate Payment</option>
                  <option value="Wrong Amount">Wrong Amount</option>
                  <option value="Order Rejected">Order Rejected</option>
                  <option value="Quality Issue">Quality Issue</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-[#111111] hover:bg-[#F97316] text-white font-heading font-black text-xs py-3 rounded-xl shadow-lg mt-2"
              >
                Create & Record Refund Entry →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PROCESS PAYOUT MODAL */}
      {processModalRefund && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-200 font-sans">
            <h3 className="font-heading font-black text-sm text-[#111111] uppercase border-b border-gray-100 pb-2">
              Process Payout for #{processModalRefund.refundNumber}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Payout Method *</label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value as any)}
                  className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-300 font-bold outline-none"
                >
                  <option value="Razorpay">Razorpay API / Dashboard</option>
                  <option value="Cash">Cash Counter Voucher</option>
                  <option value="UPI">UPI Direct</option>
                  <option value="Bank Transfer">NEFT / RTGS Bank</option>
                </select>
              </div>

              {payoutMethod === 'Razorpay' ? (
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Razorpay Refund ID / Reference ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. rfd_MnK92810Lks8"
                    value={razorpayRefundIdInput}
                    onChange={(e) => setRazorpayRefundIdInput(e.target.value)}
                    className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-300 font-mono outline-none focus:border-[#F97316]"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Enter the Razorpay Refund Transaction ID from dashboard.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Cash Out Voucher #</label>
                    <input
                      type="text"
                      placeholder="e.g. VCH-2026-0042"
                      value={cashVoucherNoInput}
                      onChange={(e) => setCashVoucherNoInput(e.target.value)}
                      className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-300 font-mono outline-none focus:border-[#F97316]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Staff / Manager Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Chellamuthu K"
                      value={staffNameInput}
                      onChange={(e) => setStaffNameInput(e.target.value)}
                      className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-300 outline-none focus:border-[#F97316]"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setProcessModalRefund(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-2.5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmProcessPayout}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-heading font-black text-xs py-2.5 rounded-xl"
                >
                  Complete Refund Payout ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL LEDGER MODAL */}
      {selectedRefund && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] max-w-xl w-full p-6 space-y-4 shadow-2xl border border-gray-200 font-sans max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-heading font-black text-base text-[#111111]">{selectedRefund.refundNumber}</h3>
                <p className="text-xs text-gray-500 font-mono">Full Refund & Accounting Audit Log</p>
              </div>
              <button onClick={() => setSelectedRefund(null)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <div className="bg-gray-50 p-3 rounded-2xl space-y-1 text-xs font-mono">
              <div>Customer: <strong>{selectedRefund.customerName}</strong> ({selectedRefund.customerPhone})</div>
              <div>Refund Amount: <strong className="text-red-600">₹{selectedRefund.refundAmount.toLocaleString('en-IN')}</strong> ({selectedRefund.refundType})</div>
              <div>Reason: <strong>{selectedRefund.reason}</strong></div>
              <div>Status: <strong>{selectedRefund.status}</strong></div>
            </div>

            {/* Timeline */}
            <div>
              <h4 className="font-heading font-black text-xs text-[#111111] uppercase mb-2">Refund Timeline</h4>
              <div className="space-y-2 border-l-2 border-orange-300 pl-3">
                {selectedRefund.timeline.map((t) => (
                  <div key={t.id} className="text-xs">
                    <div className="font-bold text-[#111111]">{t.action}</div>
                    <div className="text-[10px] text-gray-500 font-mono">{new Date(t.timestamp).toLocaleString('en-IN')} · By {t.performedBy}</div>
                    {t.details && <p className="text-[11px] text-gray-600 mt-0.5">{t.details}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Ledger Entries */}
            {selectedRefund.ledgerEntries && selectedRefund.ledgerEntries.length > 0 && (
              <div>
                <h4 className="font-heading font-black text-xs text-[#111111] uppercase mb-2">Automated Double-Entry Ledger Logs</h4>
                <div className="space-y-1.5">
                  {selectedRefund.ledgerEntries.map((l) => (
                    <div key={l.id} className="bg-gray-50 p-2 rounded-xl text-[11px] font-mono flex justify-between items-center">
                      <div>
                        <span className="font-bold text-gray-800">{l.account}</span>
                        <span className="block text-[9px] text-gray-500">{l.notes}</span>
                      </div>
                      <div className={l.debitCredit === 'DEBIT' ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                        {l.debitCredit} ₹{l.amount.toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedRefund(null)}
              className="w-full bg-[#111111] text-white font-heading font-black text-xs py-2.5 rounded-xl"
            >
              Close Ledger Details
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
