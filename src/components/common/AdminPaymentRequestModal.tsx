import React, { useState } from 'react';
import { Order, PaymentRequest } from '../../types';
import { useOrders } from '../../context/OrderContext';
import { createRazorpayPaymentLink } from '../../services/razorpayService';
import {
  Send,
  X,
  CreditCard,
  MessageCircle,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface AdminPaymentRequestModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPaymentRequestModal: React.FC<AdminPaymentRequestModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const { createPaymentRequest } = useOrders();

  const [amount, setAmount] = useState<number>(order?.remainingBalance || 5000);
  const [reason, setReason] = useState<
    'Advance' | 'Balance' | 'Material Cost' | 'Transport' | 'Installation' | 'Custom'
  >('Advance');
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [createdReq, setCreatedReq] = useState<PaymentRequest | null>(null);

  if (!isOpen || !order) return null;

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Please enter a valid request amount.');
      return;
    }

    setLoading(true);
    try {
      const linkPayload = createRazorpayPaymentLink(
        order.orderNumber,
        amount,
        order.customerName,
        order.customerPhone
      );

      const newReq: PaymentRequest = {
        id: `req-${Date.now()}`,
        orderId: order.id,
        customerId: order.customerPhone,
        amount,
        reason,
        dueDate,
        message,
        status: 'PENDING',
        paymentLink: linkPayload.paymentLinkUrl,
        createdBy: 'Chellamuthu K (Admin)',
        createdAt: new Date().toISOString(),
      };

      const result = await createPaymentRequest(newReq);
      if (result) {
        setCreatedReq(result);
      }
    } catch (err) {
      console.error('Error creating payment request:', err);
      alert('Failed creating payment request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] max-w-lg w-full overflow-hidden shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150 font-sans">
        
        {/* Top Header */}
        <div className="bg-[#111111] text-white p-5 flex justify-between items-center border-b border-gray-800">
          <div>
            <span className="text-[10px] font-mono text-[#F97316] uppercase tracking-widest block font-bold">
              WORKSHOP ERP • PAYMENT REQUEST WORKFLOW
            </span>
            <h3 className="font-heading font-black text-lg text-white mt-0.5">
              REQUEST PAYMENT — ORDER #{order.orderNumber}
            </h3>
            <p className="text-gray-400 text-xs mt-0.5">
              Customer: <strong>{order.customerName}</strong> ({order.customerPhone})
            </p>
          </div>

          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 cursor-pointer">
            <X size={22} />
          </button>
        </div>

        {createdReq ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={40} />
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-emerald-800 uppercase block">
                ✓ PAYMENT REQUEST CREATED & DISPATCHED
              </span>
              <h2 className="font-heading font-black text-2xl text-[#111111] mt-1">
                REQUESTED ₹{createdReq.amount.toLocaleString('en-IN')}
              </h2>
              <p className="text-gray-500 text-xs mt-1">
                Reason: <strong>{createdReq.reason}</strong> | Due Date: <strong>{createdReq.dueDate}</strong>
              </p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs font-mono text-emerald-950 space-y-1 text-left">
              <span className="font-bold block text-emerald-800">Payment Link Generated:</span>
              <p className="truncate text-blue-700 font-bold">{createdReq.paymentLink}</p>
              <p className="text-[11px] text-gray-600 mt-2">
                This request will automatically trigger the sticky priority payment banner on the customer's home page.
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <a
                href={`https://wa.me/91${order.customerPhone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(
                  `Hi ${order.customerName},\n\nPayment request for Order #${order.orderNumber}:\nReason: ${createdReq.reason}\nAmount: ₹${createdReq.amount.toLocaleString(
                    'en-IN'
                  )}\nDue Date: ${createdReq.dueDate}\n\nPay securely: ${createdReq.paymentLink}\n\nThank you,\nMANIKANDAN LATHE`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <MessageCircle size={15} /> WhatsApp Customer Now
              </a>

              <button
                onClick={() => {
                  setCreatedReq(null);
                  onClose();
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateRequest} className="p-6 space-y-4 text-xs font-sans">
            
            {/* Amount input */}
            <div>
              <label className="font-bold text-gray-700 block mb-1">Request Amount (₹) *</label>
              <input
                type="number"
                required
                min="1"
                max={order.remainingBalance || 100000}
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                className="w-full bg-gray-50 p-3 rounded-xl border border-gray-300 font-mono font-bold text-lg text-[#F97316] outline-none focus:border-[#F97316]"
              />
              <span className="text-[10px] text-gray-400 font-mono mt-1 block">
                Max Outstanding Due: ₹{order.remainingBalance.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Reason selector */}
            <div>
              <label className="font-bold text-gray-700 block mb-1">Payment Reason *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-300 font-medium text-gray-900 outline-none focus:border-[#F97316]"
              >
                <option value="Advance">Advance Payment</option>
                <option value="Balance">Remaining Balance</option>
                <option value="Material Cost">Material Cost Payment</option>
                <option value="Transport">Transport Charge</option>
                <option value="Installation">Installation Charge</option>
                <option value="Custom">Custom Workshop Charge</option>
              </select>
            </div>

            {/* Due date */}
            <div>
              <label className="font-bold text-gray-700 block mb-1">Payment Due Date *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-300 font-mono outline-none focus:border-[#F97316]"
              />
            </div>

            {/* Optional message */}
            <div>
              <label className="font-bold text-gray-700 block mb-1">Optional Note / Message to Customer</label>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Please pay advance so we can purchase raw steel materials."
                className="w-full bg-gray-50 p-2.5 rounded-xl border border-gray-300 font-medium outline-none focus:border-[#F97316]"
              />
            </div>

            <button
              type="submit"
              disabled={loading || amount <= 0}
              className="w-full py-3.5 bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-50 text-white font-heading font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Send size={16} /> Create & Dispatch Payment Request (₹{amount.toLocaleString('en-IN')})
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default AdminPaymentRequestModal;
