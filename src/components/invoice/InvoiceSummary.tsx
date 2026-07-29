import React from 'react';
import { Order } from '../../types';

interface InvoiceSummaryProps {
  order: Order;
}

export const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({ order }) => {
  const grossSubtotal = order.basePrice || order.items.reduce((sum, i) => sum + i.totalPrice, 0);
  const discount = order.reducedAmount || 0;

  const labour = order.labourCharge || 0;
  const transport = order.transportCharge || 0;
  const installation = order.installationCharge || 0;

  const grandTotal = order.finalPrice;
  const advance = order.advancePaid;
  const balance = order.remainingBalance;

  return (
    <div className="flex flex-col md:flex-row justify-between items-start gap-6 font-sans text-xs avoid-break pt-2">
      
      {/* Left: Terms & Guarantee Notice */}
      <div className="flex-1 bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2 text-[11px]">
        <span className="font-mono font-black text-gray-500 uppercase tracking-wider block text-[10px]">
          TERMS & WORKSHOP GUARANTEE
        </span>
        <p className="text-gray-600 leading-relaxed text-[11px]">
          • All items fabricated & tested at MANIKANDAN LATHE workshop, Kallimandhayam.<br />
          • Premium hardened lathe steel & anti-rust primer applied for lifetime durability.
        </p>
      </div>

      {/* Right: Price Summary Table */}
      <div className="w-full md:w-80 bg-gray-50 p-4 rounded-2xl border border-gray-900 space-y-2 font-mono">
        <div className="flex justify-between text-gray-600">
          <span>Item Subtotal:</span>
          <span>₹{grossSubtotal.toLocaleString('en-IN')}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-green-700 font-bold">
            <span>Special Discount:</span>
            <span>- ₹{discount.toLocaleString('en-IN')}</span>
          </div>
        )}

        {labour > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>Labour Charge:</span>
            <span>+ ₹{labour.toLocaleString('en-IN')}</span>
          </div>
        )}

        {transport > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>Transport Charge:</span>
            <span>+ ₹{transport.toLocaleString('en-IN')}</span>
          </div>
        )}

        {installation > 0 && (
          <div className="flex justify-between text-gray-600 border-b border-gray-300 pb-2">
            <span>Installation Charge:</span>
            <span>+ ₹{installation.toLocaleString('en-IN')}</span>
          </div>
        )}

        {/* Grand Total */}
        <div className="flex justify-between text-base font-black text-[#111111] pt-1 border-t border-gray-300">
          <span>GRAND TOTAL:</span>
          <span className="text-[#FF6A00]">₹{grandTotal.toLocaleString('en-IN')}</span>
        </div>

        {/* Advance & Balance */}
        <div className="pt-2 border-t border-gray-300 space-y-1 text-xs">
          <div className="flex justify-between text-green-800 font-bold">
            <span>Amount Paid:</span>
            <span>₹{advance.toLocaleString('en-IN')}</span>
          </div>

          {balance > 0 ? (
            <div className="flex justify-between text-red-600 font-black">
              <span>Balance Due:</span>
              <span>₹{balance.toLocaleString('en-IN')}</span>
            </div>
          ) : (
            <div className="flex justify-between text-emerald-700 font-black pt-1">
              <span>Payment Status:</span>
              <span>FULL AMOUNT PAID ✓</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
