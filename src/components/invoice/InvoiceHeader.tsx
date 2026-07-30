import React from 'react';
import { Order } from '../../types';
import { QRCodeSVG } from '../common/QRCodeSVG';

interface InvoiceHeaderProps {
  order: Order;
  isCompact?: boolean;
}

export const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({ order, isCompact = false }) => {
  const isPaidFull = order.remainingBalance <= 0;
  const isPartial = order.advancePaid > 0 && order.remainingBalance > 0;

  const invoiceNumber = order.orderNumber.startsWith('INV-') ? order.orderNumber : `INV-${order.orderNumber}`;
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const qrDataText = `MANIKANDAN LATHE Tax Invoice #${order.orderNumber} - Customer: ${order.customerName} - Total: Rs.${order.finalPrice}`;

  return (
    <div className={`border-b-2 border-[#111111] font-sans ${isCompact ? 'pb-2' : 'pb-4'}`}>
      <div className="flex flex-row justify-between items-center gap-4">
        
        {/* Left: Company Details & Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="MANIKANDAN LATHE Logo"
            className={`${isCompact ? 'w-12 h-12' : 'w-16 h-16'} object-contain shrink-0`}
          />
          <div className="space-y-0.5">
            <h1 className={`font-heading font-black text-[#111111] tracking-tight leading-none uppercase ${isCompact ? 'text-base' : 'text-xl'}`}>
              MANIKANDAN LATHE
            </h1>
            <p className={`font-heading font-bold text-[#FF6A00] uppercase tracking-wider ${isCompact ? 'text-[9px]' : 'text-[11px]'}`}>
              Precision Machine & Heavy Fabrication Works
            </p>
            <p className={`text-[#4B5563] leading-snug ${isCompact ? 'text-[9px]' : 'text-[10px]'}`}>
              Kallimandhayam, Dindigul Dist, Tamil Nadu - 624614
            </p>
            <div className={`flex flex-wrap gap-x-3 text-[#374151] font-mono ${isCompact ? 'text-[9px]' : 'text-[10px]'}`}>
              <span><strong>GSTIN:</strong> 33AAAPM9281K1Z5</span>
              <span><strong>Phone:</strong> +91 96592 86268</span>
            </div>
          </div>
        </div>

        {/* Right: Invoice Metadata & Pure Inline SVG QR Code */}
        <div className="flex items-center gap-3 text-right">
          <div className="space-y-0.5">
            <div className="bg-[#111111] text-[#FFFFFF] text-[9px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest inline-block mb-0.5">
              TAX INVOICE
            </div>
            
            <div className={`font-mono font-bold text-[#111111] ${isCompact ? 'text-[11px]' : 'text-xs'}`}>
              Invoice: <span className="text-[#FF6A00]">{invoiceNumber}</span>
            </div>
            <div className={`font-mono text-[#4B5563] ${isCompact ? 'text-[10px]' : 'text-[11px]'}`}>
              Date: <strong>{invoiceDate}</strong>
            </div>
            <div className={`font-mono text-[#4B5563] ${isCompact ? 'text-[10px]' : 'text-[11px]'}`}>
              Order: <strong>#{order.orderNumber}</strong>
            </div>

            <div className="pt-0.5">
              {isPaidFull ? (
                <span className="bg-[#DCFCE7] text-[#166534] border border-[#86EFAC] text-[9px] font-mono font-black px-2 py-0.5 rounded-full uppercase">
                  ✓ FULLY PAID
                </span>
              ) : isPartial ? (
                <span className="bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-[9px] font-mono font-black px-2 py-0.5 rounded-full uppercase">
                  PARTIAL ADVANCE
                </span>
              ) : (
                <span className="bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5] text-[9px] font-mono font-black px-2 py-0.5 rounded-full uppercase">
                  PAYMENT DUE
                </span>
              )}
            </div>
          </div>

          {/* Pure Inline SVG QR Code */}
          <div className="shrink-0">
            <QRCodeSVG value={qrDataText} size={isCompact ? 60 : 75} />
          </div>
        </div>

      </div>
    </div>
  );
};
