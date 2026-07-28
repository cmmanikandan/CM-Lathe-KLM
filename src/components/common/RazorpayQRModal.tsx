import React, { useState } from 'react';
import { Order } from '../../types';
import { generateRazorpayQRData } from '../../services/razorpayService';
import { QrCode, X, RefreshCw, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface RazorpayQRModalProps {
  order: Order | null;
  amount?: number;
  isOpen: boolean;
  onClose: () => void;
  onPaymentConfirmed?: () => void;
}

export const RazorpayQRModal: React.FC<RazorpayQRModalProps> = ({
  order,
  amount,
  isOpen,
  onClose,
  onPaymentConfirmed,
}) => {
  const [refreshCount, setRefreshCount] = useState(0);

  if (!isOpen || !order) return null;

  const payAmount = amount || order.remainingBalance;
  const qrData = generateRazorpayQRData(payAmount, order.orderNumber, order.customerName);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] max-w-md w-full p-6 space-y-5 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150 font-sans text-xs">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2">
            <QrCode size={20} className="text-[#F97316]" />
            <div>
              <h3 className="font-heading font-black text-sm text-[#111111]">RAZORPAY DYNAMIC DEDICATED QR</h3>
              <p className="text-[10px] text-gray-500 font-mono">Order #{order.orderNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Dynamic QR Display Box */}
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-center space-y-3">
          <div className="bg-white p-3 rounded-xl inline-block border border-gray-300 shadow-md">
            <img
              src={qrData.qrCodeUrl}
              alt="Razorpay QR"
              className="w-52 h-52 object-contain mx-auto rounded-md"
            />
          </div>

          <div>
            <span className="text-[10px] font-mono text-gray-500 font-bold block uppercase">PAYABLE AMOUNT</span>
            <strong className="font-heading font-black text-2xl text-[#F97316]">
              ₹{payAmount.toLocaleString('en-IN')}
            </strong>
          </div>

          <p className="text-gray-500 text-[11px]">
            Scan with Google Pay, PhonePe, Paytm, BHIM or any UPI app.
          </p>
        </div>

        {/* Live Status indicator */}
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-[11px] text-amber-900 font-mono font-bold">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            Waiting for customer scan...
          </span>
          <button
            onClick={() => setRefreshCount(refreshCount + 1)}
            className="text-[#F97316] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (onPaymentConfirmed) onPaymentConfirmed();
              onClose();
            }}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-black text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 size={16} /> Mark Payment Received
          </button>
        </div>

      </div>
    </div>
  );
};
