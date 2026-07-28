import React from 'react';
import { Order } from '../../types';

interface InvoiceCustomerProps {
  order: Order;
}

export const InvoiceCustomer: React.FC<InvoiceCustomerProps> = ({ order }) => {
  const customerId = `MLC-${(order.customerPhone || '0000000000').slice(-6)}`;
  const createdDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const expectedDate = order.expectedDate || 'As per Workshop schedule';
  const deliveredDate = order.status === 'COMPLETED' || order.status === 'INSTALLED' ? 'Delivered' : 'In Progress';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans text-xs avoid-break">
      
      {/* Billed To / Customer Details */}
      <div className="bg-gray-50/90 p-4 rounded-2xl border border-gray-200 space-y-1.5">
        <span className="text-[10px] font-mono font-black text-gray-500 uppercase tracking-wider block">
          BILLED TO (CUSTOMER DETAILS)
        </span>
        <div className="font-heading font-black text-sm text-[#111111]">{order.customerName}</div>
        <div className="text-[11px] text-gray-700 font-mono">
          Customer ID: <strong className="text-[#FF6A00]">{customerId}</strong>
        </div>
        <div className="text-[11px] text-gray-700 font-mono">
          Mobile: <strong>+91 {order.customerPhone}</strong>
        </div>
        <div className="text-[11px] text-gray-600 leading-relaxed pt-0.5">
          Address: {order.customerAddress || 'Kallimandhayam, Tamil Nadu'}
        </div>
      </div>

      {/* Order Specifications & Meta */}
      <div className="bg-gray-50/90 p-4 rounded-2xl border border-gray-200 space-y-1.5 font-mono">
        <span className="text-[10px] font-mono font-black text-gray-500 uppercase tracking-wider block">
          ORDER & DELIVERY SPECIFICATIONS
        </span>
        <div className="flex justify-between">
          <span className="text-gray-500">Order Ref #:</span>
          <strong className="text-[#111111]">#{order.orderNumber}</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Order Category:</span>
          <strong className="text-gray-800">{order.orderType || 'Custom Fabrication'}</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Booking Date:</span>
          <strong className="text-gray-800">{createdDate}</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Expected Finish:</span>
          <strong className="text-[#FF6A00]">{expectedDate}</strong>
        </div>
        {order.assignedWorker && (
          <div className="flex justify-between">
            <span className="text-gray-500">Master Technician:</span>
            <strong className="text-gray-800">{order.assignedWorker}</strong>
          </div>
        )}
      </div>

    </div>
  );
};
