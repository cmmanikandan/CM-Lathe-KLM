import React from 'react';
import { Order } from '../../types';
import { InvoiceHeader } from './InvoiceHeader';
import { InvoiceCustomer } from './InvoiceCustomer';
import { InvoiceItems } from './InvoiceItems';
import { InvoiceSummary } from './InvoiceSummary';
import { InvoicePayments } from './InvoicePayments';
import { InvoiceFooter } from './InvoiceFooter';

interface InvoiceA4Props {
  order: Order;
  containerRef?: React.Ref<HTMLDivElement>;
}

export const InvoiceA4: React.FC<InvoiceA4Props> = ({ order, containerRef }) => {
  // If order has > 5 items, enable compact spacing to guarantee single A4 page fit (up to 15 items)
  const isCompact = (order.items?.length || 0) > 5;

  return (
    <div
      ref={containerRef}
      id="printable-invoice-container"
      className="invoice-a4-container bg-white text-[#111111] mx-auto border border-gray-200 shadow-2xl font-sans relative"
      style={{
        width: '210mm',
        minHeight: '297mm',
        maxWidth: '210mm',
        padding: isCompact ? '6mm 8mm' : '8mm 10mm',
        boxSizing: 'border-box',
        backgroundColor: '#FFFFFF',
      }}
    >
      <div className={isCompact ? 'space-y-2' : 'space-y-4'}>
        <InvoiceHeader order={order} isCompact={isCompact} />
        <InvoiceCustomer order={order} isCompact={isCompact} />
        <InvoiceItems order={order} isCompact={isCompact} />
        <InvoiceSummary order={order} isCompact={isCompact} />
        <InvoicePayments order={order} isCompact={isCompact} />
        <InvoiceFooter order={order} isCompact={isCompact} />
      </div>
    </div>
  );
};
