import React from 'react';
import { Order } from '../../types';
import { QRCodeSVG } from '../common/QRCodeSVG';

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
  const qrDataText = `MANIKANDAN LATHE #${order.orderNumber} Total: Rs.${order.finalPrice}`;

  // Ensure line items are never empty
  const displayItems =
    order.items && order.items.length > 0
      ? order.items
      : [
          {
            productName: 'Custom Lathe Machining & Fabrication Work',
            quantity: 1,
            unitPrice: order.basePrice || order.finalPrice,
            totalPrice: order.basePrice || order.finalPrice,
            variant: { size: 'Custom Specs' },
          },
        ];

  return (
    <div
      ref={containerRef}
      id="printable-thermal-container"
      className="invoice-thermal-container bg-[#FFFFFF] text-[#111111] p-3.5 font-mono text-[11px] leading-tight mx-auto border border-[#D1D5DB] shadow-xl rounded-xl space-y-2.5"
      style={{
        width: '80mm',
        maxWidth: '80mm',
        backgroundColor: '#FFFFFF',
        boxSizing: 'border-box',
      }}
    >
      {/* Shop Header */}
      <div className="text-center space-y-1 border-b border-dashed border-[#111111] pb-2">
        <img
          src="/logo.png"
          alt="MANIKANDAN LATHE Logo"
          className="w-10 h-10 object-contain mx-auto"
        />
        <h2 className="font-heading font-black text-xs uppercase text-[#111111] tracking-tight">
          MANIKANDAN LATHE
        </h2>
        <p className="text-[8.5px] font-bold text-[#374151]">Kallimandhayam, Dindigul - 624614</p>
        <p className="text-[8.5px] text-[#4B5563]">Ph: +91 96592 86268</p>
        <p className="text-[8.5px] text-[#4B5563]">manikandanlatheklm@gmail.com</p>
      </div>

      {/* Invoice Meta */}
      <div className="space-y-1 text-[9.5px] border-b border-dashed border-[#111111] pb-2">
        <div className="flex justify-between items-center">
          <span className="text-[#6B7280]">Inv #:</span>
          <strong className="font-bold text-[#111111]">{invoiceNumber}</strong>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#6B7280]">Order #:</span>
          <strong className="text-[#111111]">#{order.orderNumber}</strong>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#6B7280]">Date:</span>
          <span className="text-[#374151]">{dateStr}</span>
        </div>
        <div className="flex justify-between items-start">
          <span className="text-[#6B7280]">Cust:</span>
          <strong className="text-right text-[#111111] max-w-[150px] leading-tight">{order.customerName}</strong>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#6B7280]">Phone:</span>
          <span className="text-[#374151]">{order.customerPhone}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#6B7280]">Payment Mode:</span>
          <strong className="text-[#111111]">{payMode}</strong>
        </div>
      </div>

      {/* Items Table */}
      <div className="space-y-1.5 border-b border-dashed border-[#111111] pb-2">
        <div className="flex justify-between font-bold text-[9px] border-b border-[#111111] pb-1 uppercase text-[#111111]">
          <span className="w-28 text-left">ITEM</span>
          <span className="w-24 text-center">QTY X PRICE</span>
          <span className="w-16 text-right">TOTAL</span>
        </div>

        {displayItems.map((item, idx) => (
          <div key={idx} className="space-y-0.5 pt-0.5">
            <div className="font-bold text-[9.5px] text-[#111111] leading-tight">{item.productName}</div>
            <div className="flex justify-between text-[8.5px] text-[#4B5563]">
              <span>{item.variant?.size || 'Standard'}</span>
              <span>{item.quantity} x ₹{item.unitPrice.toLocaleString('en-IN')}</span>
              <strong className="text-[#111111]">₹{item.totalPrice.toLocaleString('en-IN')}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Totals Breakdown */}
      <div className="space-y-1 text-[9.5px] border-b border-dashed border-[#111111] pb-2">
        <div className="flex justify-between text-[#374151]">
          <span>Subtotal:</span>
          <span>₹{(order.basePrice || order.finalPrice).toLocaleString('en-IN')}</span>
        </div>
        {order.reducedAmount > 0 && (
          <div className="flex justify-between text-[#15803D] font-bold">
            <span>Discount:</span>
            <span>- ₹{order.reducedAmount.toLocaleString('en-IN')}</span>
          </div>
        )}
        <div className="flex justify-between font-black text-xs pt-1 border-t border-[#111111] text-[#111111]">
          <span>GRAND TOTAL:</span>
          <span>₹{order.finalPrice.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between font-bold text-[#15803D]">
          <span>Paid Amount:</span>
          <span>₹{order.advancePaid.toLocaleString('en-IN')}</span>
        </div>
        {order.remainingBalance > 0 ? (
          <div className="flex justify-between font-bold text-[#DC2626]">
            <span>Balance Due:</span>
            <span>₹{order.remainingBalance.toLocaleString('en-IN')}</span>
          </div>
        ) : (
          <div className="flex justify-between font-bold text-[#15803D]">
            <span>Status:</span>
            <span>FULLY PAID ✓</span>
          </div>
        )}
      </div>

      {/* Footer & Scannable Pure SVG Vector QR Code */}
      <div className="text-center space-y-1 pt-1 flex flex-col items-center justify-center">
        <div className="p-1 bg-[#FFFFFF] rounded border border-[#E5E7EB]">
          <QRCodeSVG value={qrDataText} size={85} />
        </div>
        <p className="text-[8.5px] font-bold text-[#111111]">THANK YOU FOR YOUR BUSINESS!</p>
        <p className="text-[7.5px] text-[#6B7280]">MANIKANDAN LATHE · KALLIMANDHAYAM</p>
      </div>

    </div>
  );
};
