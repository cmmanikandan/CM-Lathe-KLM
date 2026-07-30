import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { PDFInvoiceModal } from '../../components/common/PDFInvoiceModal';
import { PaymentTransaction, Order, PaymentRequest } from '../../types';
import {
  IndianRupee,
  Search,
  Receipt,
  Calendar,
  CreditCard,
  Banknote,
  Building2,
  FileCheck,
  Printer,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  FileText,
  Download,
  PlusCircle,
  Send,
  CheckCircle2,
  XCircle,
  Copy,
  ExternalLink,
  MessageSquare,
  Clock,
  Filter,
} from 'lucide-react';

export const AdminPaymentsPage: React.FC = () => {
  const { orders, addPaymentToOrder, createPaymentRequest, payPaymentRequest, cancelPaymentRequest } = useOrders();
  const [activeTab, setActiveTab] = useState<'LEDGER' | 'REQUESTS'>('LEDGER');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMode, setSelectedMode] = useState<string>('ALL');
  const [pdfModalOrder, setPdfModalOrder] = useState<Order | null>(null);

  // Record Payment Modal State
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [payAmount, setPayAmount] = useState<number | ''>(0);
  const [payMode, setPayMode] = useState<PaymentTransaction['mode']>('Cash');
  const [payType, setPayType] = useState<'Advance' | 'Partial' | 'Full'>('Partial');
  const [collectedBy, setCollectedBy] = useState('Chellamuthu K (Admin)');
  const [referenceId, setReferenceId] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Payment Request Modal State
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [reqOrderId, setReqOrderId] = useState('');
  const [reqAmount, setReqAmount] = useState<number | ''>(0);
  const [reqReason, setReqReason] = useState<PaymentRequest['reason']>('Advance');
  const [reqMessage, setReqMessage] = useState('');
  const [reqDueDate, setReqDueDate] = useState('');
  const [submittingReq, setSubmittingReq] = useState(false);

  // Collect all transactions linked with parent order
  const allTransactions = orders.flatMap((order) =>
    order.paymentHistory.map((t) => ({
      ...t,
      orderObj: order,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
    }))
  );

  // Collect all payment requests across orders
  const allRequests = orders.flatMap((order) =>
    (order.paymentRequests || []).map((r) => ({
      ...r,
      orderObj: order,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
    }))
  );

  // Filtered transactions
  const filteredTransactions = allTransactions.filter((t) => {
    const matchesSearch =
      t.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerPhone.includes(searchTerm) ||
      t.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.razorpayPaymentId && t.razorpayPaymentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.referenceId && t.referenceId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMode = selectedMode === 'ALL' || t.mode === selectedMode;
    return matchesSearch && matchesMode;
  });

  // Filtered requests
  const filteredRequests = allRequests.filter((r) => {
    return (
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customerPhone.includes(searchTerm) ||
      r.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Calculate Metrics
  const totalLifetimeRevenue = allTransactions.reduce((s, t) => s + t.amount, 0);
  const totalRazorpayOnline = allTransactions
    .filter((t) => t.mode === 'Razorpay' || t.mode === 'UPI' || t.mode === 'Card' || t.mode === 'NetBanking')
    .reduce((s, t) => s + t.amount, 0);
  const totalCashCollected = allTransactions
    .filter((t) => t.mode === 'Cash')
    .reduce((s, t) => s + t.amount, 0);
  const totalBankTransfer = allTransactions
    .filter((t) => t.mode === 'Bank Transfer' || t.mode === 'Cheque')
    .reduce((s, t) => s + t.amount, 0);

  const totalOutstandingBalance = orders.reduce((s, o) => s + o.remainingBalance, 0);
  const totalFilteredAmount = filteredTransactions.reduce((s, t) => s + t.amount, 0);

  // Handlers
  const handleOpenRecordModal = (orderId?: string) => {
    const defaultOrder = orderId ? orders.find((o) => o.id === orderId) : orders.find((o) => o.remainingBalance > 0);
    if (defaultOrder) {
      setSelectedOrderId(defaultOrder.id);
      setPayAmount(defaultOrder.remainingBalance);
    }
    setIsRecordModalOpen(true);
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = payAmount === '' ? 0 : Number(payAmount);
    if (!selectedOrderId || finalAmount <= 0) return;
    setSubmittingPayment(true);
    try {
      await addPaymentToOrder(selectedOrderId, finalAmount, payMode, collectedBy, referenceId, {
        paymentType: payType,
        notes: payNotes,
      });
      setIsRecordModalOpen(false);
      setReferenceId('');
      setPayNotes('');
    } catch (err) {
      console.error('Failed to record payment:', err);
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleCreatePaymentRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = reqAmount === '' ? 0 : Number(reqAmount);
    if (!reqOrderId || finalAmount <= 0) return;
    setSubmittingReq(true);
    try {
      await createPaymentRequest({
        orderId: reqOrderId,
        amount: finalAmount,
        reason: reqReason,
        message: reqMessage,
        dueDate: reqDueDate,
        createdBy: 'Chellamuthu K (Admin)',
      });
      setIsReqModalOpen(false);
      setReqMessage('');
    } catch (err) {
      console.error('Failed to create payment request:', err);
    } finally {
      setSubmittingReq(false);
    }
  };

  const shareWhatsAppRequest = (req: any) => {
    const text = `Hello ${req.customerName},\n\nPayment Request from *MANIKANDAN LATHE & FABRICATION* for Order #${req.orderNumber}.\nReason: *${req.reason}*\nAmount Due: *₹${req.amount.toLocaleString('en-IN')}*\n\nPlease complete your payment at your earliest convenience. Thank you!\nPhone: +91 96592 86268`;
    const cleanPhone = req.customerPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Time', 'Receipt #', 'Order #', 'Customer Name', 'Phone', 'Mode', 'Txn Reference', 'Collected By', 'Amount Collected (Rs)', 'Balance After (Rs)'];
    const rows = filteredTransactions.map((t) => [
      t.date,
      t.time,
      t.receiptNumber,
      t.orderNumber,
      `"${t.customerName}"`,
      t.customerPhone,
      t.mode,
      t.razorpayPaymentId || t.referenceId || t.txnReference || 'N/A',
      `"${t.collectedBy}"`,
      t.amount,
      t.remainingBalanceAfter,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MANIKANDAN_LATHE_Payment_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] pb-24 font-sans">
      
      {/* Header Banner */}
      <div className="bg-[#111111] text-white py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[#F97316] font-heading font-extrabold text-xs uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck size={16} /> CENTRALIZED FINANCIAL AUDIT LEDGER
            </span>
            <h1 className="font-heading font-black text-3xl text-white mt-1">
              SHOP PAYMENTS & RECEIPT LEDGER
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleOpenRecordModal()}
              className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <PlusCircle size={15} /> Record Payment
            </button>
            <button
              onClick={() => setIsReqModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Send size={15} /> Create Payment Request
            </button>
            <button
              onClick={exportToCSV}
              className="bg-white/10 hover:bg-white/20 text-white font-heading font-black text-xs px-3.5 py-2.5 rounded-xl border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              onClick={exportToPDF}
              className="bg-white/10 hover:bg-white/20 text-white font-heading font-black text-xs px-3.5 py-2.5 rounded-xl border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer size={14} /> PDF
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs border-l-4 border-l-[#111111]">
            <span className="text-[11px] font-mono text-gray-500 font-bold uppercase block">Total Lifetime Revenue</span>
            <h3 className="font-heading font-black text-2xl text-[#111111] mt-2">
              ₹{totalLifetimeRevenue.toLocaleString('en-IN')}
            </h3>
            <span className="text-[10px] text-gray-400 font-bold">All recorded transactions</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs border-l-4 border-l-blue-600">
            <span className="text-[11px] font-mono text-blue-700 font-bold uppercase block">Razorpay & Online</span>
            <h3 className="font-heading font-black text-2xl text-blue-700 mt-2">
              ₹{totalRazorpayOnline.toLocaleString('en-IN')}
            </h3>
            <span className="text-[10px] text-gray-400 font-bold">UPI, Cards, NetBanking</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs border-l-4 border-l-emerald-600">
            <span className="text-[11px] font-mono text-emerald-800 font-bold uppercase block">Cash Counter Collection</span>
            <h3 className="font-heading font-black text-2xl text-emerald-700 mt-2">
              ₹{totalCashCollected.toLocaleString('en-IN')}
            </h3>
            <span className="text-[10px] text-gray-400 font-bold">Physical shop cash</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs border-l-4 border-l-purple-600">
            <span className="text-[11px] font-mono text-purple-800 font-bold uppercase block">Bank & Cheque Collection</span>
            <h3 className="font-heading font-black text-2xl text-purple-700 mt-2">
              ₹{totalBankTransfer.toLocaleString('en-IN')}
            </h3>
            <span className="text-[10px] text-gray-400 font-bold">NEFT / Cheque clears</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs border-l-4 border-l-red-600">
            <span className="text-[11px] font-mono text-red-600 font-bold uppercase block">Shop Outstanding Due</span>
            <h3 className="font-heading font-black text-2xl text-red-600 mt-2">
              ₹{totalOutstandingBalance.toLocaleString('en-IN')}
            </h3>
            <span className="text-[10px] text-gray-400 font-bold">Pending customer balance</span>
          </div>
        </div>

        {/* Primary View Navigation Tabs (Ledger vs Payment Requests) */}
        <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('LEDGER')}
              className={`px-5 py-2.5 rounded-xl font-heading font-black text-xs transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'LEDGER'
                  ? 'bg-[#111111] text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Receipt size={16} /> Central Audit Payment Ledger ({allTransactions.length})
            </button>
            <button
              onClick={() => setActiveTab('REQUESTS')}
              className={`px-5 py-2.5 rounded-xl font-heading font-black text-xs transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'REQUESTS'
                  ? 'bg-[#111111] text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Send size={16} /> Payment Requests Tracker ({allRequests.length})
            </button>
          </div>

          {activeTab === 'LEDGER' && (
            <div className="hidden md:block font-mono text-xs text-gray-500 font-bold pr-4">
              Filter Total: <span className="text-[#F97316] text-sm">₹{totalFilteredAmount.toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>

        {/* Search & Mode Filters */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Customer, Receipt #, Order #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 hover:bg-white focus:bg-white text-xs p-2.5 pl-10 rounded-xl border border-gray-300 outline-none font-medium text-gray-900 focus:border-[#F97316] transition-colors"
            />
          </div>

          {activeTab === 'LEDGER' && (
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {['ALL', 'Razorpay', 'UPI', 'Card', 'Cash', 'Bank Transfer', 'Cheque'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    selectedMode === mode
                      ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                      : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* TAB 1: PAYMENT LEDGER TABLE */}
        {activeTab === 'LEDGER' && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#111111] text-white font-heading font-extrabold uppercase text-[10px]">
                    <th className="p-3.5 rounded-l-xl">Date & Time</th>
                    <th className="p-3.5">Receipt #</th>
                    <th className="p-3.5">Order No</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Mode / Gateway</th>
                    <th className="p-3.5">Reference / Txn ID</th>
                    <th className="p-3.5">Collected By</th>
                    <th className="p-3.5 text-right">Amount Collected</th>
                    <th className="p-3.5 text-right">Balance After</th>
                    <th className="p-3.5 text-center rounded-r-xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-mono text-xs">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-gray-500 font-sans">
                        No payment transactions found matching search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-amber-50/50 transition-colors">
                        <td className="p-3.5 text-gray-600">{tx.date} {tx.time}</td>
                        <td className="p-3.5 font-bold text-[#111111]">{tx.receiptNumber}</td>
                        <td className="p-3.5 font-bold text-gray-800">{tx.orderNumber}</td>
                        <td className="p-3.5 font-sans font-bold text-gray-900">{tx.customerName}</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            tx.mode === 'Razorpay' || tx.mode === 'UPI' || tx.mode === 'Card'
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : tx.mode === 'Cash'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-purple-100 text-purple-800 border-purple-300'
                          }`}>
                            {tx.mode}
                          </span>
                        </td>
                        <td className="p-3.5 text-gray-600 text-[11px] truncate max-w-[140px]">
                          {tx.razorpayPaymentId || tx.referenceId || tx.txnReference || 'N/A'}
                        </td>
                        <td className="p-3.5 text-gray-600 font-sans">{tx.collectedBy}</td>
                        <td className="p-3.5 text-right font-black text-emerald-700 text-sm">
                          + ₹{tx.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 text-right font-bold text-gray-900">
                          ₹{tx.remainingBalanceAfter.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => setPdfModalOrder(tx.orderObj)}
                            className="p-1.5 bg-gray-100 hover:bg-[#F97316] hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Print / View Receipt"
                          >
                            <Printer size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PAYMENT REQUESTS TRACKER */}
        {activeTab === 'REQUESTS' && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#111111] text-white font-heading font-extrabold uppercase text-[10px]">
                    <th className="p-3.5 rounded-l-xl">Requested Date</th>
                    <th className="p-3.5">Order No</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Reason</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Created By</th>
                    <th className="p-3.5 text-center rounded-r-xl">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-mono text-xs">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500 font-sans">
                        No payment requests found. Click "Create Payment Request" to issue advance payment links.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-emerald-50/40 transition-colors">
                        <td className="p-3.5 text-gray-600">{new Date(req.createdAt).toLocaleDateString('en-IN')}</td>
                        <td className="p-3.5 font-bold text-gray-900">{req.orderNumber}</td>
                        <td className="p-3.5 font-sans font-bold text-gray-900">{req.customerName} ({req.customerPhone})</td>
                        <td className="p-3.5 font-sans">
                          <span className="font-bold text-gray-800">{req.reason}</span>
                          {req.message && <p className="text-[10px] text-gray-400 truncate max-w-xs">{req.message}</p>}
                        </td>
                        <td className="p-3.5 font-black text-sm text-[#F97316]">
                          ₹{req.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5 font-sans">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                            req.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : req.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-red-100 text-red-800 border-red-300'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="p-3.5 font-sans text-gray-600">{req.createdBy}</td>
                        <td className="p-3.5 text-center font-sans">
                          <div className="flex items-center justify-center gap-1.5">
                            {req.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => shareWhatsAppRequest(req)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                                  title="Send WhatsApp Link"
                                >
                                  <MessageSquare size={13} /> Share Link
                                </button>
                                <button
                                  onClick={() => payPaymentRequest(req.id, 'MANUAL_SUCCESS')}
                                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                                  title="Mark as Paid"
                                >
                                  <CheckCircle2 size={13} /> Paid
                                </button>
                                <button
                                  onClick={() => cancelPaymentRequest(req.id)}
                                  className="px-2.5 py-1 bg-gray-200 hover:bg-red-600 hover:text-white text-gray-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                                  title="Cancel Request"
                                >
                                  <XCircle size={13} /> Cancel
                                </button>
                              </>
                            )}
                            {req.status === 'PAID' && (
                              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 size={14} /> Completed
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* RECORD NEW PAYMENT MODAL */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-heading font-black text-xl text-[#111111] flex items-center gap-2">
                  <Banknote size={20} className="text-[#F97316]" /> Record Order Payment
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Collect payment against an active order and update balance.</p>
              </div>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Select Customer Order</label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => {
                    setSelectedOrderId(e.target.value);
                    const selected = orders.find((o) => o.id === e.target.value);
                    if (selected) setPayAmount(selected.remainingBalance);
                  }}
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:border-[#F97316] outline-none font-bold"
                  required
                >
                  <option value="">-- Choose Order --</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      Order #{o.orderNumber} - {o.customerName} (Bal: ₹{o.remainingBalance.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Payment Amount (₹)</label>
                  <input
                    type="number"
                    value={payAmount}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPayAmount(val === '' ? '' : Number(val));
                    }}
                    min={1}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:border-[#F97316] outline-none font-bold text-sm text-emerald-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Payment Mode</label>
                  <select
                    value={payMode}
                    onChange={(e) => setPayMode(e.target.value as any)}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:border-[#F97316] outline-none font-bold"
                  >
                    <option value="Cash">Cash Counter</option>
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="Razorpay">Razorpay Gateway</option>
                    <option value="Bank Transfer">Bank NEFT / IMPS</option>
                    <option value="Cheque">Cheque Deposit</option>
                    <option value="Card">Credit / Debit Card</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Payment Type</label>
                  <select
                    value={payType}
                    onChange={(e) => setPayType(e.target.value as any)}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:border-[#F97316] outline-none font-bold"
                  >
                    <option value="Advance">Advance Payment</option>
                    <option value="Partial">Partial Installment</option>
                    <option value="Full">Full Final Settlement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Collected By</label>
                  <input
                    type="text"
                    value={collectedBy}
                    onChange={(e) => setCollectedBy(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:border-[#F97316] outline-none font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Txn Ref / Cheque / UTR # (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. UTR-987123 / Chq #4001"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:border-[#F97316] outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Notes / Ledger Remarks (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Additional remarks..."
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:border-[#F97316] outline-none font-medium text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="px-6 py-2.5 rounded-xl font-heading font-black bg-[#F97316] hover:bg-[#EA580C] text-white shadow-md transition-all cursor-pointer"
                >
                  {submittingPayment ? 'Saving Transaction...' : 'Confirm & Issue Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PAYMENT REQUEST MODAL */}
      {isReqModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-heading font-black text-xl text-[#111111] flex items-center gap-2">
                  <Send size={20} className="text-emerald-600" /> Issue Payment Request Link
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Send SMS / WhatsApp payment notification to customer.</p>
              </div>
              <button
                onClick={() => setIsReqModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePaymentRequestSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Select Order</label>
                <select
                  value={reqOrderId}
                  onChange={(e) => {
                    setReqOrderId(e.target.value);
                    const selected = orders.find((o) => o.id === e.target.value);
                    if (selected) setReqAmount(selected.remainingBalance || selected.advanceRequired);
                  }}
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:border-emerald-600 outline-none font-bold"
                  required
                >
                  <option value="">-- Select Order --</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      Order #{o.orderNumber} - {o.customerName} (Bal: ₹{o.remainingBalance.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Requested Amount (₹)</label>
                  <input
                    type="number"
                    value={reqAmount}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value;
                      setReqAmount(val === '' ? '' : Number(val));
                    }}
                    min={1}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:border-emerald-600 outline-none font-bold text-sm text-emerald-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">Payment Reason</label>
                  <select
                    value={reqReason}
                    onChange={(e) => setReqReason(e.target.value as any)}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:border-emerald-600 outline-none font-bold"
                  >
                    <option value="Advance">Advance Deposit</option>
                    <option value="Balance">Remaining Balance</option>
                    <option value="Material Cost">Raw Material Advance</option>
                    <option value="Transport">Transport / Delivery</option>
                    <option value="Installation">Installation Fee</option>
                    <option value="Custom">Custom Amount</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Custom Note / WhatsApp Message</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please pay advance so we can begin lathe machining process..."
                  value={reqMessage}
                  onChange={(e) => setReqMessage(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:border-emerald-600 outline-none font-medium text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsReqModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReq}
                  className="px-6 py-2.5 rounded-xl font-heading font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all cursor-pointer"
                >
                  {submittingReq ? 'Generating...' : 'Create Payment Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Tax Invoice / Receipt Modal */}
      <PDFInvoiceModal
        order={pdfModalOrder}
        isOpen={!!pdfModalOrder}
        onClose={() => setPdfModalOrder(null)}
      />
    </div>
  );
};

export default AdminPaymentsPage;
