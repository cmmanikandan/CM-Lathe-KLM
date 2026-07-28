import React from 'react';
import { Order, OrderStatus } from '../../types';

interface InvoiceTimelineProps {
  order: Order;
}

export const InvoiceTimeline: React.FC<InvoiceTimelineProps> = ({ order }) => {
  const steps: { status: OrderStatus; label: string }[] = [
    { status: 'PENDING', label: 'Order Created' },
    { status: 'ACCEPTED', label: 'Accepted' },
    { status: 'IN_PRODUCTION', label: 'Production' },
    { status: 'QUALITY_CHECK', label: 'Quality Check' },
    { status: 'READY', label: 'Ready' },
    { status: 'COMPLETED', label: 'Delivered' },
  ];

  const getStepStatus = (stepStatus: OrderStatus) => {
    const orderStatus = order.status;

    if (orderStatus === 'REJECTED') {
      return 'rejected';
    }

    const orderIndex = steps.findIndex((s) => s.status === orderStatus);
    const stepIndex = steps.findIndex((s) => s.status === stepStatus);

    if (stepIndex <= orderIndex || orderStatus === 'COMPLETED' || orderStatus === 'INSTALLED') {
      return 'completed';
    }
    return 'upcoming';
  };

  return (
    <div className="space-y-2 font-sans avoid-break pt-2">
      <span className="text-[10px] font-mono font-black text-gray-500 uppercase tracking-wider block">
        WORKSHOP PRODUCTION TIMELINE
      </span>

      <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 flex items-center justify-between gap-1 overflow-x-auto text-[10px] font-mono">
        {steps.map((step, idx) => {
          const state = getStepStatus(step.status);
          const isDone = state === 'completed';

          return (
            <div key={step.status} className="flex items-center gap-1.5 shrink-0">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                  isDone ? 'bg-[#FF6A00] text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isDone ? '✓' : idx + 1}
              </div>
              <span className={isDone ? 'font-bold text-[#111111]' : 'text-gray-400'}>
                {step.label}
              </span>
              {idx < steps.length - 1 && (
                <div className={`w-4 sm:w-8 h-0.5 ${isDone ? 'bg-[#FF6A00]' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
