import React from 'react';
import { Order } from '../../types';

interface InvoiceCustomerProps {
  order: Order;
  isCompact?: boolean;
}

export const InvoiceCustomer: React.FC<InvoiceCustomerProps> = ({ order, isCompact = false }) => {
  const customerId = order.customerId || `MLC-${(order.customerPhone || '0000000000').slice(-6)}`;
  const createdDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const expectedDate = order.expectedDate || 'As per schedule';

  // Format phone cleanly
  const formattedPhone = order.customerPhone
    ? order.customerPhone.startsWith('+91')
      ? order.customerPhone
      : `+91 ${order.customerPhone}`
    : 'N/A';

  return (
    <div className={`grid grid-cols-2 gap-3.5 font-sans avoid-break ${isCompact ? 'text-[10px]' : 'text-xs'}`}>
      
      {/* Billed To / Customer Details */}
      <div className={`bg-[#F9FAFB] rounded-xl border border-[#D1D5DB] ${isCompact ? 'p-2.5 space-y-1' : 'p-3 space-y-1.5'}`}>
        <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-1">
          <span className="text-[9px] font-mono font-black text-[#6B7280] uppercase tracking-wider">
            BILLED TO (CUSTOMER DETAILS)
          </span>
          <span className="text-[9px] font-mono font-bold text-[#FF6A00]">
            ID: {customerId}
          </span>
        </div>

        <div className={`font-heading font-black text-[#111111] leading-tight ${isCompact ? 'text-xs' : 'text-sm'}`}>
          {order.customerName || 'Walk-in Counter Customer'}
        </div>

        <div className="space-y-0.5 text-[#374151] font-mono text-[10px]">
          <div className="flex items-center gap-1">
            <span className="text-[#6B7280]">Phone:</span>
            <strong className="text-[#111111]">{formattedPhone}</strong>
          </div>
          <div className="leading-tight text-[#4B5563] pt-0.5">
            <span className="text-[#6B7280]">Address: </span>
            {order.customerAddress || 'Kallimandhayam, Dindigul Dist, Tamil Nadu - 624614'}
          </div>
          {order.customerGstin && (
            <div className="text-[#111111] font-bold text-[10px] pt-0.5">
              GSTIN / UIN: {order.customerGstin}
            </div>
          )}
        </div>
      </div>

      {/* Invoice Particulars & Delivery Meta */}
      <div className={`bg-[#F9FAFB] rounded-xl border border-[#D1D5DB] font-mono ${isCompact ? 'p-2.5 space-y-1 text-[10px]' : 'p-3 space-y-1.5 text-[11px]'}`}>
        <div className="border-b border-[#E5E7EB] pb-1">
          <span className="text-[9px] font-mono font-black text-[#6B7280] uppercase tracking-wider block">
            INVOICE & DELIVERY SPECIFICATIONS
          </span>
        </div>

        <div className="space-y-0.5">
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Order Reference #:</span>
            <strong className="text-[#111111]">#{order.orderNumber}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Order Category:</span>
            <strong className="text-[#1F2937]">{order.orderType || 'Custom Lathe Fabrication'}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Invoice Date:</span>
            <strong className="text-[#111111]">{createdDate}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Target Delivery:</span>
            <strong className="text-[#FF6A00]">{expectedDate}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Place of Supply:</span>
            <strong className="text-[#111111]">Tamil Nadu (33)</strong>
          </div>
        </div>
      </div>

    </div>
  );
};
