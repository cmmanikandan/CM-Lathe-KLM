import React from 'react';
import { Order } from '../../types';

interface InvoiceItemsProps {
  order: Order;
}

export const InvoiceItems: React.FC<InvoiceItemsProps> = ({ order }) => {
  return (
    <div className="space-y-2 font-sans avoid-break">
      <span className="text-[10px] font-mono font-black text-gray-500 uppercase tracking-wider block">
        LINE ITEMS & FABRICATION PARTICULARS
      </span>

      <div className="border border-gray-900 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#111111] text-white font-mono text-[10px] uppercase">
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-3">Item & Specifications</th>
              <th className="py-2.5 px-3">HSN/SAC</th>
              <th className="py-2.5 px-3 text-center">Qty</th>
              <th className="py-2.5 px-3 text-right">Unit Rate</th>
              <th className="py-2.5 px-3 text-right">GST %</th>
              <th className="py-2.5 px-3 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {order.items.map((item, idx) => {
              const hsnCode = '73089090'; // HSN for Steel Structures / Lathe Goods
              const gstRate = 18;

              return (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-3 font-mono text-gray-500 text-[11px]">{idx + 1}</td>
                  
                  <td className="py-3 px-3">
                    <div className="flex items-start gap-2.5">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-300 shrink-0"
                        />
                      )}
                      <div>
                        <div className="font-heading font-black text-xs text-[#111111]">
                          {item.productName}
                        </div>
                        {item.variant && (
                          <div className="text-[10px] text-gray-500 font-mono">
                            {item.variant.size || item.variant.material} {item.variant.thickness ? `· ${item.variant.thickness}` : ''}
                          </div>
                        )}
                        {item.customMeasurements && (
                          <div className="text-[9px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-mono inline-block mt-0.5 border border-amber-200">
                            📏 {item.customMeasurements}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 font-mono text-[11px] text-gray-600">{hsnCode}</td>

                  <td className="py-3 px-3 text-center font-mono font-bold text-gray-900">
                    {item.quantity}
                  </td>

                  <td className="py-3 px-3 text-right font-mono text-gray-800">
                    ₹{item.unitPrice.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3 px-3 text-right font-mono text-gray-600">
                    {gstRate}%
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-black text-[#111111]">
                    ₹{item.totalPrice.toLocaleString('en-IN')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
