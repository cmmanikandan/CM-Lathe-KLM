import React, { useState } from 'react';
import { Order } from '../../types';
import {
  Printer,
  Download,
  Share2,
  MessageCircle,
  ExternalLink,
  Copy,
  Check,
  X,
  FileText,
  Receipt,
  Loader2,
} from 'lucide-react';

interface InvoiceToolbarProps {
  order: Order;
  activeTemplate: 'a4' | 'thermal';
  setActiveTemplate: (template: 'a4' | 'thermal') => void;
  onPrint: () => void;
  onDownloadPdf: () => void;
  onClose: () => void;
  isGeneratingPdf?: boolean;
}

export const InvoiceToolbar: React.FC<InvoiceToolbarProps> = ({
  order,
  activeTemplate,
  setActiveTemplate,
  onPrint,
  onDownloadPdf,
  onClose,
  isGeneratingPdf = false,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleOpenNewTab = () => {
    const newWin = window.open(`/invoice/${order.id}`, '_blank');
    if (!newWin) alert('Please allow popups to open in a new tab.');
  };

  const handleWhatsAppShare = async () => {
    // Automatically trigger PDF download so the user has the high quality PDF ready to send
    try {
      onDownloadPdf();
    } catch (e) {
      console.error('WhatsApp PDF download trigger failed:', e);
    }

    const text = `Hi ${order.customerName},\n\nHere is your Official Tax Invoice #${order.orderNumber} for *₹${order.finalPrice.toLocaleString('en-IN')}* from *MANIKANDAN LATHE & FABRICATION*, Kallimandhayam.\n\n📄 High-quality PDF Tax Invoice has been generated and saved. Thank you for your business!\nContact: +91 96592 86268`;
    const cleanPhone = order.customerPhone.replace(/\D/g, '').slice(-10);
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/invoice/${order.id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="invoice-toolbar no-print bg-[#111111] text-white p-3 sm:p-4 rounded-t-[24px] border-b border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 font-sans shrink-0">
      
      {/* Left: Template Switcher */}
      <div className="flex items-center gap-1.5 bg-gray-900 p-1 rounded-xl border border-gray-800">
        <button
          onClick={() => setActiveTemplate('a4')}
          className={`px-3 py-1.5 rounded-lg text-xs font-heading font-black transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTemplate === 'a4'
              ? 'bg-[#FF6A00] text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <FileText size={14} /> A4 Tax Invoice
        </button>
        <button
          onClick={() => setActiveTemplate('thermal')}
          className={`px-3 py-1.5 rounded-lg text-xs font-heading font-black transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTemplate === 'thermal'
              ? 'bg-[#FF6A00] text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Receipt size={14} /> 80mm Thermal POS
        </button>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap justify-end">
        <button
          onClick={handleOpenNewTab}
          className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Open Dedicated Page"
        >
          <ExternalLink size={14} /> Dedicated Page
        </button>

        <button
          onClick={onPrint}
          className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Print Invoice"
        >
          <Printer size={14} /> Print
        </button>

        <button
          onClick={onDownloadPdf}
          disabled={isGeneratingPdf}
          className="bg-[#FF6A00] hover:bg-[#EA580C] text-white text-xs font-heading font-black px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          title="Download High Resolution 300 DPI PDF"
        >
          {isGeneratingPdf ? (
            <><Loader2 size={14} className="animate-spin" /> Generating PDF...</>
          ) : (
            <><Download size={14} /> Download PDF</>
          )}
        </button>

        <button
          onClick={handleWhatsAppShare}
          className="bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Share PDF via WhatsApp"
        >
          <MessageCircle size={15} /> WhatsApp PDF
        </button>

        <button
          onClick={handleCopyLink}
          className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold p-2 rounded-xl transition-colors cursor-pointer"
          title="Copy Direct Invoice Link"
        >
          {copiedLink ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
        </button>

        <button
          onClick={onClose}
          className="bg-gray-800 hover:bg-red-600 text-gray-400 hover:text-white text-xs p-2 rounded-xl transition-colors ml-1 cursor-pointer"
          title="Close Modal"
        >
          <X size={16} />
        </button>
      </div>

    </div>
  );
};
