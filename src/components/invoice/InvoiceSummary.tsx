import React from 'react';
import { Order } from '../../types';

interface InvoiceSummaryProps {
  order: Order;
  isCompact?: boolean;
}

export const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({ order, isCompact = false }) => {
  const grossSubtotal = order.basePrice || order.items.reduce((sum, i) => sum + i.totalPrice, 0);
  const discount = order.reducedAmount || 0;

  const labour = order.labourCharge || 0;
  const transport = order.transportCharge || 0;
  const installation = order.installationCharge || 0;

  const grandTotal = order.finalPrice;
  const advance = order.advancePaid;
  const balance = order.remainingBalance;

  return (
    <div className={`flex flex-row justify-between items-start gap-4 font-sans text-xs avoid-break ${isCompact ? 'pt-1' : 'pt-2'}`}>
      
      {/* Left: Terms & Guarantee Notice */}
      <div className={`flex-1 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] ${isCompact ? 'p-2 space-y-1 text-[10px]' : 'p-3 space-y-1.5 text-[11px]'}`}>
        <span className="font-mono font-black text-[#6B7280] uppercase tracking-wider block text-[9px]">
          TERMS & WORKSHOP GUARANTEE
        </span>
        <p className="text-[#4B5563] leading-snug">
          • All items fabricated & tested at MANIKANDAN LATHE workshop, Kallimandhayam.<br />
          • Premium hardened lathe steel & anti-rust primer applied for lifetime durability.
        </p>
      </div>

      {/* Right: Price Summary Table */}
      <div className={`w-72 bg-[#F9FAFB] rounded-xl border border-[#111111] font-mono ${isCompact ? 'p-2 space-y-1 text-[10px]' : 'p-3 space-y-1.5 text-xs'}`}>
        <div className="flex justify-between text-[#4B5563]">
          <span>Subtotal:</span>
          <span>₹{grossSubtotal.toLocaleString('en-IN')}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-[#15803D] font-bold">
            <span>Discount:</span>
            <span>- ₹{discount.toLocaleString('en-IN')}</span>
          </div>
        )}

        {labour > 0 && (
          <div className="flex justify-between text-[#4B5563]">
            <span>Labour:</span>
            <span>+ ₹{labour.toLocaleString('en-IN')}</span>
          </div>
        )}

        {transport > 0 && (
          <div className="flex justify-between text-[#4B5563]">
            <span>Transport:</span>
            <span>+ ₹{transport.toLocaleString('en-IN')}</span>
          </div>
        )}

        {installation > 0 && (
          <div className="flex justify-between text-[#4B5563] border-b border-[#D1D5DB] pb-1">
            <span>Installation:</span>
            <span>+ ₹{installation.toLocaleString('en-IN')}</span>
          </div>
        )}

        {/* Grand Total */}
        <div className={`flex justify-between font-black text-[#111111] border-t border-[#D1D5DB] ${isCompact ? 'pt-1 text-xs' : 'pt-1 text-sm'}`}>
          <span>GRAND TOTAL:</span>
          <span className="text-[#FF6A00]">₹{grandTotal.toLocaleString('en-IN')}</span>
        </div>

        {/* Advance & Balance */}
        <div className="pt-1 border-t border-[#D1D5DB] space-y-0.5 text-[10px]">
          <div className="flex justify-between text-[#166534] font-bold">
            <span>Amount Paid:</span>
            <span>₹{advance.toLocaleString('en-IN')}</span>
          </div>

          {balance > 0 ? (
            <div className="flex justify-between text-[#DC2626] font-black">
              <span>Balance Due:</span>
              <span>₹{balance.toLocaleString('en-IN')}</span>
            </div>
          ) : (
            <div className="flex justify-between text-[#047857] font-black">
              <span>Status:</span>
              <span>FULLY PAID ✓</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
