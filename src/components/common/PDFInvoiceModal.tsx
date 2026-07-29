import React, { useState, useRef, useEffect } from 'react';
import { Order } from '../../types';
import { InvoiceToolbar } from '../invoice/InvoiceToolbar';
import { InvoiceA4 } from '../invoice/InvoiceA4';
import { InvoiceThermal } from '../invoice/InvoiceThermal';
import { useInvoicePdf } from '../invoice/useInvoicePdf';
import { printInvoiceElement } from '../../utils/printHelper';
import '../invoice/print.css';

interface PDFInvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PDFInvoiceModal: React.FC<PDFInvoiceModalProps> = ({ order, isOpen, onClose }) => {
  const [activeTemplate, setActiveTemplate] = useState<'a4' | 'thermal'>('a4');
  const invoiceRef = useRef<HTMLDivElement>(null);
  const { downloadPdf, isGeneratingPdf } = useInvoicePdf();

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    printInvoiceElement(invoiceRef.current, activeTemplate === 'thermal');
  };

  const handleDownloadPDF = () => {
    downloadPdf(invoiceRef.current, order, activeTemplate === 'thermal' ? 'THERMAL' : 'A4');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 font-sans overflow-y-auto">
      <div className="bg-white rounded-[26px] max-w-4xl w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col my-auto max-h-[95vh]">
        
        {/* TOP TOOLBAR */}
        <InvoiceToolbar
          order={order}
          activeTemplate={activeTemplate}
          setActiveTemplate={setActiveTemplate}
          onPrint={handlePrint}
          onDownloadPdf={handleDownloadPDF}
          onClose={onClose}
          isGeneratingPdf={isGeneratingPdf}
        />

        {/* INVOICE VIEWPORT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-100/90 custom-scrollbar">
          {activeTemplate === 'a4' ? (
            <InvoiceA4 order={order} containerRef={invoiceRef} />
          ) : (
            <InvoiceThermal order={order} containerRef={invoiceRef} />
          )}
        </div>

      </div>
    </div>
  );
};

export default PDFInvoiceModal;
