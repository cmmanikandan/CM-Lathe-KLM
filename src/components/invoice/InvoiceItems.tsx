import React from 'react';
import { Order } from '../../types';

interface InvoiceItemsProps {
  order: Order;
  isCompact?: boolean;
}

export const InvoiceItems: React.FC<InvoiceItemsProps> = ({ order, isCompact = false }) => {
  // Ensure line items are never empty (fall back to custom fabrication job entry matching subtotal)
  const displayItems =
    order.items && order.items.length > 0
      ? order.items
      : [
          {
            productName: 'Custom Lathe Machining & Heavy Steel Fabrication Work',
            quantity: 1,
            unitPrice: order.basePrice || order.finalPrice,
            totalPrice: order.basePrice || order.finalPrice,
            variant: { size: 'Custom Workshop Job Order' },
          },
        ];

  return (
    <div className="space-y-1 font-sans avoid-break">
      <div className="flex justify-between items-center text-[9px] font-mono font-black text-[#6B7280] uppercase tracking-wider">
        <span>LINE ITEMS & FABRICATION PARTICULARS ({displayItems.length} ITEMS)</span>
        <span>HSN CODE: 73089090</span>
      </div>

      <div className="border border-[#111111] rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#111111] text-[#FFFFFF] font-mono text-[9px] uppercase">
              <th className={`px-2.5 ${isCompact ? 'py-1.5' : 'py-2'}`}>#</th>
              <th className={`px-2.5 ${isCompact ? 'py-1.5' : 'py-2'}`}>Item & Specifications</th>
              <th className={`px-2.5 ${isCompact ? 'py-1.5' : 'py-2'}`}>HSN</th>
              <th className={`px-2.5 text-center ${isCompact ? 'py-1.5' : 'py-2'}`}>Qty</th>
              <th className={`px-2.5 text-right ${isCompact ? 'py-1.5' : 'py-2'}`}>Rate</th>
              <th className={`px-2.5 text-right ${isCompact ? 'py-1.5' : 'py-2'}`}>GST</th>
              <th className={`px-2.5 text-right ${isCompact ? 'py-1.5' : 'py-2'}`}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] bg-[#FFFFFF] font-sans">
            {displayItems.map((item, idx) => {
              const hsnCode = '73089090';
              const gstRate = 18;

              return (
                <tr key={idx} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className={`px-2.5 font-mono text-[#6B7280] ${isCompact ? 'py-1 text-[10px]' : 'py-2 text-[11px]'}`}>
                    {idx + 1}
                  </td>
                  
                  <td className={`px-2.5 ${isCompact ? 'py-1' : 'py-2'}`}>
                    <div className="flex items-center gap-2">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.productName}
                          className={`${isCompact ? 'w-6 h-6' : 'w-9 h-9'} rounded object-cover border border-[#D1D5DB] shrink-0`}
                        />
                      )}
                      <div>
                        <div className={`font-heading font-bold text-[#111111] ${isCompact ? 'text-[11px]' : 'text-xs'}`}>
                          {item.productName}
                        </div>
                        {item.variant && (item.variant.size || item.variant.material) && (
                          <div className="text-[9px] text-[#6B7280] font-mono">
                            {item.variant.size || item.variant.material} {item.variant.thickness ? `· ${item.variant.thickness}` : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className={`px-2.5 font-mono text-[#4B5563] ${isCompact ? 'py-1 text-[10px]' : 'py-2 text-[11px]'}`}>
                    {hsnCode}
                  </td>

                  <td className={`px-2.5 text-center font-mono font-bold text-[#111111] ${isCompact ? 'py-1 text-[10px]' : 'py-2 text-[11px]'}`}>
                    {item.quantity}
                  </td>

                  <td className={`px-2.5 text-right font-mono text-[#1F2937] ${isCompact ? 'py-1 text-[10px]' : 'py-2 text-[11px]'}`}>
                    ₹{item.unitPrice.toLocaleString('en-IN')}
                  </td>

                  <td className={`px-2.5 text-right font-mono text-[#4B5563] ${isCompact ? 'py-1 text-[10px]' : 'py-2 text-[11px]'}`}>
                    {gstRate}%
                  </td>

                  <td className={`px-2.5 text-right font-mono font-black text-[#111111] ${isCompact ? 'py-1 text-[10px]' : 'py-2 text-[11px]'}`}>
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
