import React from 'react';
import { Order } from '../../types';

interface InvoiceThermalProps {
  order: Order;
  containerRef?: React.Ref<HTMLDivElement>;
}

export const InvoiceThermal: React.FC<InvoiceThermalProps> = ({ order, containerRef }) => {
  const invoiceNumber = order.orderNumber.startsWith('INV-') ? order.orderNumber : `INV-${order.orderNumber}`;
  const dateStr = new Date(order.createdAt).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const payMode = order.paymentHistory?.[0]?.mode || 'Cash';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
    `MANIKANDAN LATHE #${order.orderNumber} Total: Rs.${order.finalPrice}`
  )}`;

  return (
    <div
      ref={containerRef}
      className="invoice-thermal-container bg-white text-black p-4 font-mono text-[11px] leading-tight max-w-[80mm] mx-auto border border-gray-300 shadow-xl rounded-2xl space-y-3"
      style={{ width: '80mm' }}
    >
      {/* Header */}
      <div className="text-center space-y-1 border-b border-dashed border-black pb-2">
        <img
          src="/logo.png"
          alt="MANIKANDAN LATHE Logo"
          className="w-12 h-12 object-contain mx-auto"
          crossOrigin="anonymous"
        />
        <h2 className="font-heading font-black text-sm uppercase text-black">MANIKANDAN LATHE</h2>
        <p className="text-[9px] font-bold">Kallimandhayam, Dindigul - 624614</p>
        <p className="text-[9px]">Ph: +91 96592 86268</p>
        <p className="text-[9px]">manikandanlatheklm@gmail.com</p>
      </div>

      {/* Invoice Meta */}
      <div className="space-y-0.5 text-[10px] border-b border-dashed border-black pb-2">
        <div className="flex justify-between">
          <span>Inv #:</span>
          <strong className="font-bold">{invoiceNumber}</strong>
        </div>
        <div className="flex justify-between">
          <span>Order #:</span>
          <strong>#{order.orderNumber}</strong>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{dateStr}</span>
        </div>
        <div className="flex justify-between">
          <span>Cust:</span>
          <strong className="truncate max-w-[120px]">{order.customerName}</strong>
        </div>
        <div className="flex justify-between">
          <span>Phone:</span>
          <span>{order.customerPhone}</span>
        </div>
        <div className="flex justify-between">
          <span>Payment:</span>
          <strong>{payMode}</strong>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-1 border-b border-dashed border-black pb-2">
        <div className="flex justify-between font-bold text-[10px] border-b border-black pb-1">
          <span>Item</span>
          <span className="text-right">Qty x Price</span>
          <span className="text-right">Total</span>
        </div>

        {order.items.map((item, idx) => (
          <div key={idx} className="space-y-0.5 pt-1">
            <div className="font-bold text-[10px] truncate">{item.productName}</div>
            <div className="flex justify-between text-[9px] text-gray-700">
              <span>{item.variant?.size || 'Standard'}</span>
              <span>{item.quantity} x ₹{item.unitPrice}</span>
              <strong className="text-black">₹{item.totalPrice}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-1 text-[10px] border-b border-dashed border-black pb-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>₹{order.basePrice || order.finalPrice}</span>
        </div>
        {order.reducedAmount > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Discount:</span>
            <span>- ₹{order.reducedAmount}</span>
          </div>
        )}
        <div className="flex justify-between font-black text-xs pt-1 border-t border-black">
          <span>GRAND TOTAL:</span>
          <span>₹{order.finalPrice.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between font-bold text-green-800">
          <span>Paid Amount:</span>
          <span>₹{order.advancePaid.toLocaleString('en-IN')}</span>
        </div>
        {order.remainingBalance > 0 ? (
          <div className="flex justify-between font-bold text-red-600">
            <span>Balance Due:</span>
            <span>₹{order.remainingBalance.toLocaleString('en-IN')}</span>
          </div>
        ) : (
          <div className="flex justify-between font-bold text-emerald-700">
            <span>Status:</span>
            <span>FULLY PAID ✓</span>
          </div>
        )}
      </div>

      {/* Footer & QR Code */}
      <div className="text-center space-y-1.5 pt-1">
        <img src={qrUrl} alt="QR" className="w-16 h-16 mx-auto object-contain" />
        <p className="text-[9px] font-bold">THANK YOU FOR YOUR BUSINESS!</p>
        <p className="text-[8px] text-gray-600">Visit: manikandanlathe.com</p>
      </div>

    </div>
  );
};
