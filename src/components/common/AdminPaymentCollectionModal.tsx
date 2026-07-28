import React, { useState } from 'react';
import { Order, PaymentTransaction } from '../../types';
import { useOrders } from '../../context/OrderContext';
import {
  generateRazorpayQRData,
  createRazorpayPaymentLink,
} from '../../services/razorpayService';
import {
  QrCode,
  Link,
  Banknote,
  X,
  CheckCircle2,
  Copy,
  MessageCircle,
  Mail,
  Smartphone,
  RefreshCw,
  Printer,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface AdminPaymentCollectionModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPaymentCollectionModal: React.FC<AdminPaymentCollectionModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const { addPaymentToOrder, logOrderActivity } = useOrders();

  // ONLY 3 Streamlined Payment Methods: Cash, Dynamic QR, Send Payment Link
  const [activeTab, setActiveTab] = useState<'CASH' | 'QR' | 'LINK'>('CASH');

  // Input states
  const [customAmount, setCustomAmount] = useState<number>(order?.remainingBalance || 5000);
  const [collectedBy, setCollectedBy] = useState<string>('Chellamuthu K (Admin)');
  const [remarks, setRemarks] = useState<string>('Counter payment collection');

  // QR State
  const [qrRefreshCount, setQrRefreshCount] = useState<number>(0);

  // Success State & Issued Receipt
  const [loading, setLoading] = useState<boolean>(false);
  const [issuedTransaction, setIssuedTransaction] = useState<PaymentTransaction | null>(null);

  if (!isOpen || !order) return null;

  const currentDue = order.remainingBalance;
  const payAmount = Math.min(customAmount, currentDue > 0 ? currentDue : customAmount);

  // QR Data matching entered custom amount!
  const qrData = generateRazorpayQRData(payAmount, order.orderNumber, order.customerName);

  // Payment Link Data matching entered custom amount!
  const linkData = createRazorpayPaymentLink(
    order.orderNumber,
    payAmount,
    order.customerName,
    order.customerPhone
  );

  // Handle Record Cash Payment
  const handleSaveCashPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) {
      alert('Please enter a valid payment amount greater than ₹0.');
      return;
    }

    setLoading(true);
    try {
      const tx = await addPaymentToOrder(
        order.id,
        payAmount,
        'Cash',
        collectedBy,
        `CASH-${Date.now()}`,
        {
          notes: remarks,
          paymentType: payAmount >= order.remainingBalance ? 'Full' : 'Partial',
        }
      );

      await logOrderActivity(
        order.id,
        `Collected ₹${payAmount.toLocaleString('en-IN')} Cash at Counter`,
        collectedBy,
        remarks
      );

      setIssuedTransaction(tx);
    } catch (err) {
      console.error('Payment saving error:', err);
      alert('Failed saving cash payment record.');
    } finally {
      setLoading(false);
    }
  };

  // Handle QR Scan Verified Payment
  const handleConfirmQRPayment = async () => {
    if (payAmount <= 0) {
      alert('Please enter a valid payment amount greater than ₹0.');
      return;
    }

    setLoading(true);
    try {
      const tx = await addPaymentToOrder(
        order.id,
        payAmount,
        'UPI',
        collectedBy,
        `RZP-QR-${Date.now()}`,
        {
          razorpayPaymentId: `pay_qr_${Date.now()}`,
          notes: `Scanned Dynamic Razorpay QR Code for ₹${payAmount.toLocaleString('en-IN')}`,
          paymentType: payAmount >= order.remainingBalance ? 'Full' : 'Partial',
        }
      );

      await logOrderActivity(
        order.id,
        `Scanned Razorpay Dynamic QR Payment of ₹${payAmount.toLocaleString('en-IN')}`,
        'Customer via Razorpay QR'
      );

      setIssuedTransaction(tx);
    } catch (err) {
      console.error('QR payment confirm error:', err);
      alert('Failed saving QR payment record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] max-w-xl w-full overflow-hidden shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150 font-sans">
        
        {/* Top Header */}
        <div className="bg-[#111111] text-white p-5 flex justify-between items-center border-b border-gray-800">
          <div>
            <span className="text-[10px] font-mono text-[#F97316] uppercase tracking-widest block font-bold">
              WORKSHOP ERP • PAYMENT COLLECTION
            </span>
            <h3 className="font-heading font-black text-lg text-white mt-0.5">
              COLLECT PAYMENT — ORDER #{order.orderNumber}
            </h3>
            <p className="text-gray-400 text-xs mt-0.5">
              Customer: <strong>{order.customerName}</strong> ({order.customerPhone})
            </p>
          </div>

          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 cursor-pointer">
            <X size={22} />
          </button>
        </div>

        {/* Issued Receipt View */}
        {issuedTransaction ? (
          <div className="p-8 text-center space-y-5 animate-in fade-in duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={40} />
            </div>

            <div>
              <span className="text-xs text-emerald-800 font-mono font-bold uppercase block">
                ✓ PAYMENT RECORDED & LEDGER UPDATED
              </span>
              <h2 className="font-heading font-black text-2xl text-[#111111] mt-1">
                RECEIPT #{issuedTransaction.receiptNumber}
              </h2>
              <p className="text-gray-500 text-xs font-mono mt-1">
                ₹{issuedTransaction.amount.toLocaleString('en-IN')} collected via {issuedTransaction.mode}
              </p>
            </div>

            {/* Financial Status Summary */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 max-w-md mx-auto space-y-2 text-xs font-mono text-emerald-950">
              <div className="flex justify-between">
                <span>Order Agreed Total:</span>
                <strong>₹{order.finalPrice.toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Amount Paid Today:</span>
                <strong>+ ₹{issuedTransaction.amount.toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between border-t border-emerald-200 pt-2 text-[#111111] font-black text-sm">
                <span>Remaining Due Balance:</span>
                <strong className={issuedTransaction.remainingBalanceAfter > 0 ? 'text-amber-800' : 'text-emerald-700'}>
                  ₹{issuedTransaction.remainingBalanceAfter.toLocaleString('en-IN')}
                </strong>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="bg-[#111111] hover:bg-black text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={15} /> Print Digital Receipt
              </button>

              <a
                href={linkData.whatsAppShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <MessageCircle size={15} /> WhatsApp Receipt
              </a>

              <button
                onClick={() => {
                  setIssuedTransaction(null);
                  onClose();
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          /* Collection Form & 3 Streamlined Method Tabs */
          <div className="p-6 space-y-5">
            
            {/* Amount & Remaining Due Indicator Header */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-800 uppercase block">
                  OUTSTANDING DUE BALANCE
                </span>
                <h4 className="font-heading font-black text-2xl text-[#111111]">
                  ₹{order.remainingBalance.toLocaleString('en-IN')}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <label className="text-[10px] font-mono text-gray-500 font-bold block">Collecting Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    max={order.remainingBalance}
                    value={customAmount}
                    onChange={(e) => setCustomAmount(parseInt(e.target.value) || 0)}
                    className="w-36 bg-white p-2 rounded-xl border border-gray-300 font-mono font-bold text-base text-[#F97316] outline-none text-right focus:border-[#F97316]"
                  />
                </div>
              </div>
            </div>

            {/* 3 Streamlined Method Tabs Selector */}
            <div className="grid grid-cols-3 gap-3 text-xs font-sans">
              {[
                { id: 'CASH', title: '1. Cash', icon: Banknote },
                { id: 'QR', title: '2. Dynamic QR', icon: QrCode },
                { id: 'LINK', title: '3. Send Pay Link', icon: Link },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`p-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      active
                        ? 'bg-[#F97316] text-white border-[#F97316] shadow-md scale-102'
                        : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="font-heading">{tab.title}</span>
                  </button>
                );
              })}
            </div>

            {/* METHOD 1: CASH */}
            {activeTab === 'CASH' && (
              <form onSubmit={handleSaveCashPayment} className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-4 animate-in fade-in duration-150 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Staff / Receiver Name</label>
                    <input
                      type="text"
                      required
                      value={collectedBy}
                      onChange={(e) => setCollectedBy(e.target.value)}
                      className="w-full bg-white p-2.5 rounded-xl border border-gray-300 font-medium text-gray-900 outline-none focus:border-[#F97316]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Collection Remarks</label>
                    <input
                      type="text"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="e.g. Received cash at workshop counter"
                      className="w-full bg-white p-2.5 rounded-xl border border-gray-300 font-medium text-gray-900 outline-none focus:border-[#F97316]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || payAmount <= 0}
                  className="w-full py-3.5 bg-[#111111] hover:bg-black disabled:opacity-50 text-white font-heading font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Banknote size={18} className="text-[#F97316]" /> Record ₹{payAmount.toLocaleString('en-IN')} Cash & Generate Receipt
                </button>
              </form>
            )}

            {/* METHOD 2: RAZORPAY DYNAMIC QR CODE */}
            {activeTab === 'QR' && (
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center gap-6 animate-in fade-in duration-150">
                <div className="relative p-3 bg-white rounded-2xl border border-gray-300 shadow-md text-center shrink-0">
                  <img
                    src={qrData.qrCodeUrl}
                    alt="Razorpay Dynamic Payment QR"
                    className="w-44 h-44 object-contain mx-auto rounded-lg"
                  />
                  <span className="text-[10px] font-mono text-gray-500 font-bold mt-1 block">
                    Auto QR for ₹{payAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="space-y-3 text-xs font-sans flex-1">
                  <div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-300 inline-flex items-center gap-1">
                      <Sparkles size={12} /> Dynamic Razorpay UPI QR
                    </span>
                    <h4 className="font-heading font-black text-base text-[#111111] mt-1">
                      Scan to pay ₹{payAmount.toLocaleString('en-IN')}
                    </h4>
                    <p className="text-gray-500 text-xs">
                      Supports GPay, PhonePe, Paytm, BHIM, and all UPI mobile apps.
                    </p>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-gray-200 space-y-1 font-mono text-[11px]">
                    <p className="flex justify-between">
                      <span className="text-gray-500">Order #:</span> <strong>{order.orderNumber}</strong>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-500">Razorpay VPA:</span> <strong>manikandanlathe@icici</strong>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setQrRefreshCount(qrRefreshCount + 1)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-3 py-2 rounded-xl flex items-center gap-1 text-xs cursor-pointer"
                    >
                      <RefreshCw size={14} /> Refresh
                    </button>

                    <button
                      onClick={handleConfirmQRPayment}
                      disabled={loading || payAmount <= 0}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex-1 flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <CheckCircle2 size={16} /> Mark QR Payment Received
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* METHOD 3: SEND RAZORPAY PAYMENT LINK */}
            {activeTab === 'LINK' && (
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-4 animate-in fade-in duration-150 text-xs font-sans">
                <div>
                  <h4 className="font-heading font-black text-sm text-[#111111]">
                    SEND RAZORPAY PAYMENT LINK (₹{payAmount.toLocaleString('en-IN')})
                  </h4>
                  <p className="text-gray-500 text-xs">
                    Sends standardized workshop payment link message via WhatsApp, SMS, or Email.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-gray-300 flex items-center justify-between gap-2 font-mono text-xs">
                  <span className="truncate text-blue-700 font-bold">{linkData.paymentLinkUrl}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(linkData.paymentLinkUrl);
                      alert('Razorpay Payment Link copied to clipboard!');
                    }}
                    className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg text-gray-700 font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Copy size={14} /> Copy Link
                  </button>
                </div>

                {/* WhatsApp Template Preview Box */}
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1 text-emerald-950 font-mono text-[11px]">
                  <span className="font-bold text-emerald-800 uppercase block">WhatsApp Message Format:</span>
                  <p className="whitespace-pre-line leading-relaxed">
                    Hi {order.customerName},
                    {'\n\n'}Your payment request for
                    {'\n\n'}Order #{order.orderNumber}
                    {'\n\n'}Amount
                    {'\n'}₹{payAmount.toLocaleString('en-IN')}
                    {'\n\n'}is ready.
                    {'\n\n'}Click below to pay securely using
                    {'\n\n'}UPI, Google Pay, PhonePe, Paytm, Cards, Net Banking
                    {'\n\n'}{linkData.paymentLinkUrl}
                    {'\n\n'}After successful payment your order will automatically update.
                    {'\n\n'}Thank you,
                    {'\n'}MANIKANDAN LATHE
                    {'\n'}Kallimandhayam
                  </p>
                </div>


                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <a
                    href={linkData.whatsAppShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <MessageCircle size={16} /> WhatsApp Customer
                  </a>

                  <a
                    href={linkData.smsShareUrl}
                    className="p-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Smartphone size={16} /> SMS Text Link
                  </a>

                  <a
                    href={linkData.emailShareUrl}
                    className="p-3 bg-gray-800 hover:bg-black text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Mail size={16} /> Email Link
                  </a>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPaymentCollectionModal;
