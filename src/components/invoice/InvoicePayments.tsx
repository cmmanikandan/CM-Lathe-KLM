import React from 'react';
import { Order } from '../../types';

interface InvoicePaymentsProps {
  order: Order;
}

export const InvoicePayments: React.FC<InvoicePaymentsProps> = ({ order }) => {
  if (!order.paymentHistory || order.paymentHistory.length === 0) return null;

  return (
    <div className="space-y-2 font-sans avoid-break pt-2">
      <span className="text-[10px] font-mono font-black text-gray-500 uppercase tracking-wider block">
        PAYMENT TRANSACTION HISTORY & RECEIPT LOGS
      </span>

      <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 font-mono text-[10px] uppercase text-gray-600 border-b border-gray-200">
              <th className="py-2 px-3">Date & Time</th>
              <th className="py-2 px-3">Receipt No</th>
              <th className="py-2 px-3">Payment Mode</th>
              <th className="py-2 px-3">Collected By</th>
              <th className="py-2 px-3 text-right">Amount Paid</th>
              <th className="py-2 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
            {order.paymentHistory.map((p, idx) => (
              <tr key={p.id || idx} className="hover:bg-gray-50">
                <td className="py-2.5 px-3">
                  {p.date} {p.time ? `· ${p.time}` : ''}
                </td>
                <td className="py-2.5 px-3 font-bold text-gray-800">{p.receiptNumber}</td>
                <td className="py-2.5 px-3">{p.mode}</td>
                <td className="py-2.5 px-3 text-gray-600">{p.collectedBy || 'Cash Counter'}</td>
                <td className="py-2.5 px-3 text-right font-black text-green-700">
                  ₹{p.amount.toLocaleString('en-IN')}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="bg-green-100 text-green-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                    {p.paymentStatus || 'SUCCESS'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
