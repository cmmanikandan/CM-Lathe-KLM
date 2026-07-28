import React from 'react';
import { Order } from '../../types';
import { BrandLogo } from '../common/BrandLogo';

interface InvoiceHeaderProps {
  order: Order;
  qrCodeUrl?: string;
}

export const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({ order, qrCodeUrl }) => {
  const isPaidFull = order.remainingBalance <= 0;
  const isPartial = order.advancePaid > 0 && order.remainingBalance > 0;

  const invoiceNumber = `ML-INV-${order.orderNumber.replace(/\D/g, '') || Date.now().toString().slice(-4)}`;
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Dynamic QR Code fallback using QR server API
  const defaultQrUrl = qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
    `MANIKANDAN LATHE Tax Invoice #${order.orderNumber} - Amt: Rs.${order.finalPrice}`
  )}`;

  return (
    <div className="border-b-2 border-gray-900 pb-5 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        
        {/* Left: Company Details & Logo */}
        <div className="flex items-start gap-4">
          <img
            src="/logo.png"
            alt="MANIKANDAN LATHE Logo"
            className="w-16 h-16 object-contain shrink-0 drop-shadow-md"
            crossOrigin="anonymous"
          />
          <div className="space-y-1">
            <h1 className="font-heading font-black text-xl text-[#111111] tracking-tight leading-none uppercase">
              MANIKANDAN LATHE
            </h1>
            <p className="text-[11px] font-heading font-bold text-[#FF6A00] uppercase tracking-wider">
              Precision Machine & Heavy Fabrication Works
            </p>
            <p className="text-[10px] text-gray-600 leading-snug">
              Main Road, Kallimandhayam, Oddanchatram, Dindigul Dist, Tamil Nadu - 624614
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-gray-700 font-mono pt-1">
              <span><strong>GSTIN:</strong> 33AAAPM9281K1Z5</span>
              <span><strong>PAN:</strong> AAAPM9281K</span>
              <span><strong>Phone:</strong> +91 96592 86268</span>
            </div>
            <div className="flex flex-wrap gap-x-3 text-[10px] text-gray-500 font-mono">
              <span>Email: info@manikandanlathe.com</span>
              <span>Web: manikandanlathe.com</span>
            </div>
          </div>
        </div>

        {/* Right: Invoice Metadata & QR Code */}
        <div className="flex items-center gap-4 text-right self-end md:self-auto">
          <div className="space-y-1">
            <div className="bg-[#111111] text-white text-[10px] font-mono font-black px-3 py-1 rounded-full uppercase tracking-widest inline-block mb-1">
              OFFICIAL TAX INVOICE
            </div>
            
            <div className="text-xs font-mono font-bold text-[#111111]">
              Invoice No: <span className="text-[#FF6A00]">{invoiceNumber}</span>
            </div>
            <div className="text-[11px] font-mono text-gray-600">
              Date: <strong>{invoiceDate}</strong>
            </div>
            <div className="text-[11px] font-mono text-gray-600">
              Order No: <strong>#{order.orderNumber}</strong>
            </div>

            <div className="pt-1">
              {isPaidFull ? (
                <span className="bg-green-100 text-green-800 border border-green-300 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase">
                  ✓ PAID IN FULL
                </span>
              ) : isPartial ? (
                <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase">
                  PARTIAL ADVANCE PAID
                </span>
              ) : (
                <span className="bg-red-100 text-red-800 border border-red-300 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase">
                  PAYMENT DUE
                </span>
              )}
            </div>
          </div>

          {/* QR Code */}
          <div className="w-20 h-20 bg-white p-1 rounded-xl border border-gray-300 shadow-xs shrink-0 flex flex-col items-center justify-center">
            <img src={defaultQrUrl} alt="Invoice QR" className="w-full h-full object-contain" />
            <span className="text-[8px] font-mono text-gray-400">Scan to Verify</span>
          </div>
        </div>

      </div>
    </div>
  );
};
