import React, { useState } from 'react';
import { Order, PaymentTransaction } from '../../types';
import { useOrders } from '../../context/OrderContext';
import { openRazorpayCheckout } from '../../services/razorpayService';
import { CreditCard, X, ShieldCheck, CheckCircle2, Lock, Sparkles, Printer, MessageCircle } from 'lucide-react';

interface RazorpayPaymentModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RazorpayPaymentModal: React.FC<RazorpayPaymentModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const { addPaymentToOrder } = useOrders();
  const [paymentAmount, setPaymentAmount] = useState<number>(order?.remainingBalance || 5000);
  const [loading, setLoading] = useState(false);
  const [successTx, setSuccessTx] = useState<PaymentTransaction | null>(null);

  if (!isOpen || !order) return null;

  const currentDue = order.remainingBalance;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    openRazorpayCheckout({
      amount: Math.min(paymentAmount, currentDue > 0 ? currentDue : paymentAmount),
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      onSuccess: async (payload) => {
        try {
          const tx = await addPaymentToOrder(
            order.id,
            paymentAmount,
            'Razorpay',
            'Customer Self-Service Online Gateway',
            payload.razorpayPaymentId,
            {
              razorpayPaymentId: payload.razorpayPaymentId,
              razorpayOrderId: payload.razorpayOrderId,
              razorpaySignature: payload.razorpaySignature,
              paymentType: paymentAmount >= currentDue ? 'Full' : 'Partial',
              notes: 'Paid online via Razorpay Standard Checkout (UPI, Cards, NetBanking)',
            }
          );
          setLoading(false);
          setSuccessTx(tx);
        } catch (err) {
          console.error('Error saving payment:', err);
          setLoading(false);
          alert('Payment succeeded on Razorpay but recording failed. Please contact workshop.');
        }
      },
      onFailure: (err) => {
        setLoading(false);
        console.error('Razorpay payment failed:', err);
        alert('Payment was cancelled or failed on Razorpay.');
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150 font-sans">
        
        {successTx ? (
          <div className="text-center py-6 space-y-4 animate-in fade-in duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={42} className="animate-bounce" />
            </div>

            <div>
              <span className="text-xs text-emerald-800 font-mono font-bold uppercase block">
                ⚡ PAYMENT SUCCESSFUL
              </span>
              <h3 className="font-heading font-black text-xl text-[#111111] mt-1">
                RECEIPT #{successTx.receiptNumber}
              </h3>
              <p className="text-xs text-gray-500 font-mono mt-1">
                ₹{successTx.amount.toLocaleString('en-IN')} paid via Razorpay
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1 text-xs font-mono">
              <div className="flex justify-between text-gray-600">
                <span>Razorpay Txn ID:</span>
                <strong className="text-gray-900 truncate max-w-[150px]">{successTx.razorpayPaymentId}</strong>
              </div>
              <div className="flex justify-between text-[#111111] font-bold border-t pt-1">
                <span>Remaining Due:</span>
                <strong className={successTx.remainingBalanceAfter > 0 ? 'text-red-600' : 'text-emerald-600'}>
                  ₹{successTx.remainingBalanceAfter.toLocaleString('en-IN')}
                </strong>
              </div>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="bg-[#111111] hover:bg-black text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} /> Print Receipt
              </button>

              <button
                onClick={() => {
                  setSuccessTx(null);
                  onClose();
                }}
                className="bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard size={20} className="text-[#F97316]" />
                <div>
                  <h3 className="font-heading font-black text-sm text-[#111111]">RAZORPAY STANDARD CHECKOUT</h3>
                  <p className="text-[10px] text-gray-500 font-mono">Order #{order.orderNumber}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-black cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-gray-700">
                <span>Total Order Agreed Amount:</span>
                <strong>₹{order.finalPrice.toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between text-[#F97316] font-bold">
                <span>Outstanding Balance Due:</span>
                <strong>₹{order.remainingBalance.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <form onSubmit={handlePay} className="space-y-4 text-xs font-sans">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Select Payment Amount (₹) *</label>
                
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(order.remainingBalance)}
                    className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                      paymentAmount === order.remainingBalance
                        ? 'bg-[#111111] text-white border-[#111111]'
                        : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    Pay Full Due (₹{order.remainingBalance.toLocaleString('en-IN')})
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentAmount(Math.min(5000, order.remainingBalance))}
                    className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                      paymentAmount !== order.remainingBalance
                        ? 'bg-[#111111] text-white border-[#111111]'
                        : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    Custom / Partial
                  </button>
                </div>

                <input
                  type="number"
                  min="100"
                  max={order.remainingBalance}
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-gray-50 hover:bg-white focus:bg-white p-3 rounded-xl border border-gray-300 font-mono font-black text-lg outline-none text-[#F97316] focus:border-[#F97316] transition-colors"
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-xl text-[11px] text-gray-600 space-y-1.5 border border-gray-200">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <ShieldCheck size={15} /> Razorpay 256-Bit SSL Encrypted Gateway
                </div>
                <p className="text-gray-500 leading-relaxed">
                  Supports Google Pay, PhonePe, Paytm, BHIM UPI, Credit & Debit Cards, Net Banking, EMI & Pay Later.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || paymentAmount <= 0}
                className="w-full bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-50 text-white font-heading font-black text-xs py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer"
              >
                <Lock size={15} /> {loading ? 'Opening Razorpay Gateway...' : `Proceed to Pay ₹${paymentAmount.toLocaleString('en-IN')}`}
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
};
