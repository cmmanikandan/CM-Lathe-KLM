import React from 'react';
import { Order } from '../../types';
import { InvoiceHeader } from './InvoiceHeader';
import { InvoiceCustomer } from './InvoiceCustomer';
import { InvoiceItems } from './InvoiceItems';
import { InvoiceSummary } from './InvoiceSummary';
import { InvoicePayments } from './InvoicePayments';
import { InvoiceTimeline } from './InvoiceTimeline';
import { InvoiceFooter } from './InvoiceFooter';

interface InvoiceA4Props {
  order: Order;
  containerRef?: React.Ref<HTMLDivElement>;
}

export const InvoiceA4: React.FC<InvoiceA4Props> = ({ order, containerRef }) => {
  return (
    <div
      ref={containerRef}
      className="invoice-a4-container bg-white text-[#111111] p-6 sm:p-8 space-y-6 max-w-[800px] mx-auto border border-gray-200 rounded-[22px] shadow-2xl font-sans"
      style={{
        minHeight: '297mm', // True A4 height aspect ratio
      }}
    >
      <InvoiceHeader order={order} />
      <InvoiceCustomer order={order} />
      <InvoiceItems order={order} />
      <InvoiceSummary order={order} />
      <InvoicePayments order={order} />
      <InvoiceTimeline order={order} />
      <InvoiceFooter order={order} />
    </div>
  );
};
