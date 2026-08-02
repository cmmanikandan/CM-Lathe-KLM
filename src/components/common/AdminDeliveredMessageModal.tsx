import React, { useState, useEffect } from 'react';
import { Order } from '../../types';
import { createDeliveredThankYouWhatsAppMessage } from '../../services/whatsappService';
import { MessageCircle, CheckCircle2, X, Send, Sparkles } from 'lucide-react';

interface AdminDeliveredMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const AdminDeliveredMessageModal: React.FC<AdminDeliveredMessageModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const [customNote, setCustomNote] = useState<string>(
    'Thanks for choosing MANIKANDAN LATHE, KALLIMANDHAYAM! Your order has been delivered and completed successfully.'
  );

  useEffect(() => {
    if (order) {
      setCustomNote(
        'Thanks for choosing MANIKANDAN LATHE, KALLIMANDHAYAM! Your order has been delivered and completed successfully.'
      );
    }
  }, [order?.id]);

  if (!isOpen || !order) return null;

  const waUrl = createDeliveredThankYouWhatsAppMessage(order, customNote);

  const handleSendWhatsApp = () => {
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] max-w-lg w-full p-6 space-y-5 shadow-2xl border border-gray-200 font-sans animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h3 className="font-heading font-black text-sm text-[#111111] uppercase tracking-wider">
                SEND DELIVERED THANK YOU MESSAGE
              </h3>
              <p className="text-[11px] text-gray-500 font-mono">Order #{order.orderNumber} • {order.customerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Order Summary Snapshot */}
        <div className="bg-orange-50/70 p-3.5 rounded-2xl border border-orange-200 text-xs font-mono space-y-1">
          <div className="flex justify-between font-bold text-gray-900">
            <span>Customer: {order.customerName} ({order.customerPhone})</span>
            <span className="text-[#F97316]">₹{order.finalPrice.toLocaleString('en-IN')}</span>
          </div>
          <p className="text-[11px] text-gray-600 font-sans">
            Items: {order.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
          </p>
        </div>

        {/* Custom Message Field */}
        <div className="space-y-1.5">
          <label className="font-bold text-xs text-gray-700 flex items-center justify-between">
            <span>Custom Note / Message for Customer *</span>
            <span className="text-[10px] text-[#F97316] font-mono font-bold">Kallimandhayam Workshop Signature Included</span>
          </label>
          <textarea
            rows={3}
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="e.g. Thanks for choosing MANIKANDAN LATHE, KALLIMANDHAYAM!"
            className="w-full bg-gray-50 p-3 rounded-2xl border border-gray-300 text-xs font-sans outline-none focus:border-[#F97316]"
          />
        </div>

        {/* Live Message Preview Box */}
        <div className="space-y-1.5">
          <span className="font-bold text-xs text-gray-600 block">WhatsApp Message Live Preview:</span>
          <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200 text-[11px] font-mono text-emerald-950 space-y-1 max-h-40 overflow-y-auto whitespace-pre-wrap">
            {`*MANIKANDAN LATHE WORKS - KALLIMANDHAYAM*
Dear *${order.customerName}*,

🎉 *Order Delivered & Finished Successfully!*
*Order No:* ${order.orderNumber}

"${customNote}"

Thanks for choosing MANIKANDAN LATHE, KALLIMANDHAYAM!`}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-3 rounded-xl cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="w-2/3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-heading font-black text-xs py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
          >
            <MessageCircle size={17} /> Send Custom WhatsApp Message →
          </button>
        </div>

      </div>
    </div>
  );
};
