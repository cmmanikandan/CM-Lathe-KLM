import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order } from '../../types';
import { InvoiceA4 } from '../invoice/InvoiceA4';
import { InvoiceThermal } from '../invoice/InvoiceThermal';
import { useInvoicePdf } from '../invoice/useInvoicePdf';
import { useRefunds } from '../../context/RefundContext';
import {
  Printer,
  X,
  MessageCircle,
  Download,
  FileText,
  CheckCircle2,
  Copy,
  ExternalLink,
  Mail,
  RotateCcw,
  Receipt,
  Plus,
  Share2,
  Check,
  Sparkles,
} from 'lucide-react';
import '../invoice/print.css';

interface AdminPOSReceiptModalProps {
  order: Order | null;
  cashReceived?: number;
  balanceReturn?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPOSReceiptModal: React.FC<AdminPOSReceiptModalProps> = ({
  order,
  cashReceived = 0,
  balanceReturn = 0,
  isOpen,
  onClose,
}) => {
  const [viewMode, setViewMode] = useState<'THERMAL' | 'A4'>('THERMAL');
  const [copiedLink, setCopiedLink] = useState(false);
  const navigate = useNavigate();
  const { createRefund } = useRefunds();

  const printRef = useRef<HTMLDivElement>(null);
  const { downloadPdf, isGeneratingPdf } = useInvoicePdf();

  if (!isOpen || !order) return null;

  const cleanPhone = order.customerPhone.replace(/\D/g, '').slice(-10);
  const baseUrl = window.location.origin;
  const invoiceUrl = `${baseUrl}/invoice/${order.id}`;
  const receiptUrl = `${baseUrl}/r/${order.id}`;
  const trackUrl = `${baseUrl}/customer/orders/${order.id}`;
  const paymentMode = order.paymentHistory?.[0]?.mode || 'Cash';
  const invoiceNum = `INV-${order.orderNumber.replace(/\D/g, '') || '2026-0899'}`;

  const waTextMessage = `🧾 *MANIKANDAN LATHE*

Hello ${order.customerName},

Thank you for choosing MANIKANDAN LATHE.

*Order No:*
#${order.orderNumber}

*Invoice:*
${invoiceNum}

*Amount Paid:*
₹${order.finalPrice.toLocaleString('en-IN')}

*Payment:*
${paymentMode}

*Status:*
✅ Fully Paid

Your invoice & receipt links are attached below.

📄 *View & Download Invoice:*
${invoiceUrl}

🧾 *View & Download Thermal Receipt:*
${receiptUrl}

🚚 *Track Order:*
${trackUrl}

If you have any questions, please contact us.
📞 +91 96592 86268

Thank You.`;

  const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(waTextMessage)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyInvoiceLink = () => {
    navigator.clipboard.writeText(invoiceUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleEmailBill = () => {
    const subject = encodeURIComponent(`Tax Invoice #${order.orderNumber} - MANIKANDAN LATHE`);
    const body = encodeURIComponent(waTextMessage);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleInitiateRefund = async () => {
    if (confirm(`Initiate full refund request for Order #${order.orderNumber}?`)) {
      await createRefund({
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        originalPaymentAmount: order.finalPrice,
        originalPaymentMode: paymentMode,
        refundAmount: order.finalPrice,
        refundType: 'Full Refund',
        reason: 'Customer Cancelled',
        refundMethod: paymentMode === 'Cash' ? 'Cash' : 'Razorpay',
        createdBy: 'Owner Admin (POS Receipt)',
      });
      alert(`Refund entry created for #${order.orderNumber}! Redirecting to /admin/refunds...`);
      onClose();
      navigate('/admin/refunds');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-white rounded-[26px] max-w-4xl w-full overflow-hidden shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[95vh] flex flex-col">
        
        {/* Top Header */}
        <div className="bg-[#111111] text-white p-4 sm:p-5 flex justify-between items-center border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center border border-green-500/30 font-black">
              ✓
            </div>
            <div>
              <span className="text-[10px] font-mono text-green-400 uppercase tracking-widest block font-bold">
                ✅ BILL GENERATED SUCCESSFULLY • PERMANENTLY SAVED
              </span>
              <h3 className="font-heading font-black text-lg text-white mt-0.5">
                ORDER #{order.orderNumber}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-gray-900 p-1 rounded-xl flex gap-1 text-xs border border-gray-800">
              <button
                onClick={() => setViewMode('THERMAL')}
                className={`px-3 py-1.5 rounded-lg font-heading font-black transition-colors cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'THERMAL' ? 'bg-[#FF6A00] text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Receipt size={14} /> Thermal 80mm
              </button>
              <button
                onClick={() => setViewMode('A4')}
                className={`px-3 py-1.5 rounded-lg font-heading font-black transition-colors cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'A4' ? 'bg-[#FF6A00] text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <FileText size={14} /> A4 Tax Invoice
              </button>
            </div>

            <button onClick={onClose} className="text-gray-400 hover:text-white p-2.5 bg-gray-900 hover:bg-gray-800 rounded-xl transition-colors cursor-pointer">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Main Area */}
        <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto bg-gray-100/90 custom-scrollbar">
          
          {/* Complete 12-Action Toolbar Grid */}
          <div className="no-print bg-white p-4 rounded-[22px] border border-gray-200 shadow-sm space-y-3 font-sans">
            <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider block">
              RECEIPT ACTIONS & WHATSAPP BILL DELIVERY HUB
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs font-bold">
              <button
                onClick={() => navigate(`/r/${order.id}`)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                title="View Receipt Page"
              >
                <Receipt size={14} className="text-[#FF6A00]" /> View Receipt
              </button>

              <button
                onClick={() => navigate(`/invoice/${order.id}`)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                title="View Tax Invoice Page"
              >
                <FileText size={14} className="text-[#FF6A00]" /> View Invoice
              </button>

              <button
                onClick={handlePrint}
                className="bg-[#111111] hover:bg-gray-900 text-white p-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                title="Print Receipt / Invoice"
              >
                <Printer size={14} className="text-[#FF6A00]" /> Print
              </button>

              <button
                onClick={() => downloadPdf(printRef.current, order)}
                disabled={isGeneratingPdf}
                className="bg-[#FF6A00] hover:bg-[#EA580C] text-white p-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                title="Download PDF File"
              >
                <Download size={14} /> Download PDF
              </button>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba5a] text-white p-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                title="Send WhatsApp Bill"
              >
                <MessageCircle size={14} /> WhatsApp
              </a>

              <button
                onClick={handleCopyInvoiceLink}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                title="Copy Invoice Link"
              >
                {copiedLink ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                {copiedLink ? 'Copied' : 'Copy Link'}
              </button>

              <button
                onClick={handleEmailBill}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                title="Email Invoice"
              >
                <Mail size={14} /> Email Bill
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate('/admin/offline-orders/quick');
                }}
                className="bg-amber-500 hover:bg-amber-600 text-black p-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                title="Duplicate Sale"
              >
                <Plus size={14} /> Duplicate
              </button>

              <button
                onClick={handleInitiateRefund}
                className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 p-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                title="Initiate Refund"
              >
                <RotateCcw size={14} /> Refund
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate('/admin/offline-orders/quick');
                }}
                className="col-span-2 sm:col-span-3 md:col-span-3 bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-colors"
              >
                + New Sale (30s)
              </button>
            </div>
          </div>

          {/* Template View Container */}
          <div className="max-w-3xl mx-auto">
            {viewMode === 'THERMAL' ? (
              <InvoiceThermal order={order} containerRef={printRef} />
            ) : (
              <InvoiceA4 order={order} containerRef={printRef} />
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
