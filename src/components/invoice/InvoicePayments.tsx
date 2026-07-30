import React from 'react';
import { Order } from '../../types';

interface InvoicePaymentsProps {
  order: Order;
  isCompact?: boolean;
}

export const InvoicePayments: React.FC<InvoicePaymentsProps> = ({ order, isCompact = false }) => {
  if (!order.paymentHistory || order.paymentHistory.length === 0) return null;

  return (
    <div className="space-y-1 font-sans avoid-break pt-1">
      <span className="text-[9px] font-mono font-black text-[#6B7280] uppercase tracking-wider block">
        PAYMENT RECEIPTS ({order.paymentHistory.length})
      </span>

      <div className="border border-[#E5E7EB] rounded-xl overflow-hidden text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F3F4F6] font-mono text-[9px] uppercase text-[#4B5563] border-b border-[#E5E7EB]">
              <th className={`px-2.5 ${isCompact ? 'py-1' : 'py-1.5'}`}>Date & Time</th>
              <th className={`px-2.5 ${isCompact ? 'py-1' : 'py-1.5'}`}>Receipt No</th>
              <th className={`px-2.5 ${isCompact ? 'py-1' : 'py-1.5'}`}>Mode</th>
              <th className={`px-2.5 ${isCompact ? 'py-1' : 'py-1.5'}`}>Collected By</th>
              <th className={`px-2.5 text-right ${isCompact ? 'py-1' : 'py-1.5'}`}>Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6] font-mono text-[10px] bg-[#FFFFFF]">
            {order.paymentHistory.map((p, idx) => (
              <tr key={p.id || idx} className="hover:bg-[#F9FAFB]">
                <td className={`px-2.5 ${isCompact ? 'py-1' : 'py-1.5'}`}>
                  {p.date} {p.time ? `· ${p.time}` : ''}
                </td>
                <td className={`px-2.5 font-bold text-[#111111] ${isCompact ? 'py-1' : 'py-1.5'}`}>{p.receiptNumber}</td>
                <td className={`px-2.5 ${isCompact ? 'py-1' : 'py-1.5'}`}>{p.mode}</td>
                <td className={`px-2.5 text-[#4B5563] ${isCompact ? 'py-1' : 'py-1.5'}`}>{p.collectedBy || 'Admin'}</td>
                <td className={`px-2.5 text-right font-black text-[#15803D] ${isCompact ? 'py-1' : 'py-1.5'}`}>
                  ₹{p.amount.toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
