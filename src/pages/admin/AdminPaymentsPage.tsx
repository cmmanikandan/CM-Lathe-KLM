import React, { useState } from 'react';
import { useOrders } from '../../context/OrderContext';
import { PDFInvoiceModal } from '../../components/common/PDFInvoiceModal';
import { PaymentTransaction, Order } from '../../types';
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
} from 'lucide-react';

export const AdminPaymentsPage: React.FC = () => {
  const { orders } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMode, setSelectedMode] = useState<string>('ALL');
  const [pdfModalOrder, setPdfModalOrder] = useState<Order | null>(null);

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
            <p className="text-gray-400 text-xs mt-1">
              Complete history of advance collected, Razorpay online payments, cash & bank receipts permanently linked to customer orders.
            </p>
          </div>

          <div className="bg-white/10 p-3.5 rounded-xl border border-white/10 text-right font-mono">
            <span className="text-[11px] text-gray-400 block uppercase font-bold">Screen Filter Total</span>
            <span className="font-heading font-black text-2xl text-[#F97316]">
              ₹{totalFilteredAmount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Financial Metrics Row */}
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

        {/* Search & Mode Filter Tabs */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Receipt #, Razorpay Txn ID, Order #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 hover:bg-white focus:bg-white text-xs p-2.5 pl-10 rounded-xl border border-gray-300 outline-none font-medium text-gray-900 focus:border-[#F97316] transition-colors"
            />
          </div>

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
        </div>

        {/* Transactions Table */}
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
                  <th className="p-3.5 text-center rounded-r-xl">Receipt</th>
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

      </div>

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
