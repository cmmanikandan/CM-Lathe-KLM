import React from 'react';
import { OrderStatus } from '../../types';
import { ShoppingBag, CheckCircle2, Wrench, PackageCheck, ShieldCheck, XCircle, Clock } from 'lucide-react';

interface OrderStatusTimelineProps {
  status: OrderStatus;
  createdAt?: string;
  expectedDate?: string;
  className?: string;
}

interface TimelineStep {
  key: OrderStatus;
  stepNumber: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({
  status,
  createdAt,
  expectedDate,
  className = ''
}) => {
  const steps: TimelineStep[] = [
    {
      key: 'PENDING',
      stepNumber: 1,
      title: 'Order Placed',
      description: 'Order received & pending shop verification',
      icon: ShoppingBag
    },
    {
      key: 'ACCEPTED',
      stepNumber: 2,
      title: 'Order Accepted',
      description: 'Specifications approved & advance confirmed',
      icon: CheckCircle2
    },
    {
      key: 'IN_PRODUCTION',
      stepNumber: 3,
      title: 'In Production',
      description: 'Lathe turning, cutting & welding in progress',
      icon: Wrench
    },
    {
      key: 'READY',
      stepNumber: 4,
      title: 'Ready for Dispatch',
      description: 'Finished goods quality checked & packed',
      icon: PackageCheck
    },
    {
      key: 'COMPLETED',
      stepNumber: 5,
      title: 'Completed',
      description: 'Delivered to customer & balance settled',
      icon: ShieldCheck
    }
  ];

  const getStepStatus = (stepKey: OrderStatus) => {
    if (status === 'REJECTED') return 'rejected';

    const orderSequence: OrderStatus[] = ['PENDING', 'ACCEPTED', 'IN_PRODUCTION', 'READY', 'COMPLETED'];
    const currentIndex = orderSequence.indexOf(status);
    const stepIndex = orderSequence.indexOf(stepKey);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'upcoming';
  };

  if (status === 'REJECTED') {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-6 text-red-900 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <XCircle size={24} />
          </div>
          <div>
            <h4 className="font-heading font-black text-sm uppercase text-red-800">Order Rejected / Cancelled</h4>
            <p className="text-xs text-red-700 mt-0.5">
              This order has been cancelled or declined by shop administration. Please contact Manikandan Lathe support for assistance (+91 96592 86268).
            </p>
          </div>
        </div>
      </div>
    );
  }

  const activeIndex = ['PENDING', 'ACCEPTED', 'IN_PRODUCTION', 'READY', 'COMPLETED'].indexOf(status);
  const progressPercent = Math.max(0, Math.min(100, (activeIndex / 4) * 100));

  return (
    <div className={`bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm ${className}`}>
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 pb-4 mb-6">
        <div>
          <span className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider block">
            LIVE ORDER STATUS TIMELINE
          </span>
          <h3 className="font-heading font-black text-base text-[#111111] flex items-center gap-2">
            <span>Status:</span>
            <span className="text-[#F97316] font-mono uppercase">{status.replace('_', ' ')}</span>
          </h3>
        </div>

        {expectedDate && (
          <div className="flex items-center gap-1.5 text-xs font-mono text-gray-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
            <Clock size={14} className="text-[#F97316]" />
            <span>Target Completion: <strong>{expectedDate}</strong></span>
          </div>
        )}
      </div>

      {/* Visual Timeline Steps (Desktop Horizontal / Mobile Vertical) */}
      
      {/* Desktop Step Bar */}
      <div className="hidden md:block relative mb-4">
        {/* Track Line Background */}
        <div className="absolute top-5 left-[10%] right-[10%] h-1 bg-gray-200 z-0" />
        
        {/* Active Progress Line */}
        <div 
          className="absolute top-5 left-[10%] h-1 bg-[#F97316] transition-all duration-500 z-0 shadow-sm"
          style={{ width: `${progressPercent * 0.8}%` }}
        />

        <div className="grid grid-cols-5 relative z-10">
          {steps.map((step) => {
            const state = getStepStatus(step.key);
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex flex-col items-center text-center group">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                    state === 'completed'
                      ? 'bg-green-600 text-white border-green-600 shadow-md'
                      : state === 'active'
                      ? 'bg-[#F97316] text-white border-[#F97316] ring-4 ring-orange-100 scale-110 shadow-lg'
                      : 'bg-white text-gray-400 border-gray-300'
                  }`}
                >
                  <Icon size={18} />
                </div>

                <div className="mt-3 space-y-1">
                  <span className={`text-[11px] font-heading font-black block uppercase ${
                    state === 'completed' ? 'text-green-700' : state === 'active' ? 'text-[#F97316]' : 'text-gray-400'
                  }`}>
                    {step.stepNumber}. {step.title}
                  </span>
                  <p className="text-[10px] text-gray-500 max-w-[120px] mx-auto leading-tight font-sans">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Vertical Step List */}
      <div className="md:hidden space-y-4 relative pl-3">
        <div className="absolute top-3 bottom-3 left-7 w-0.5 bg-gray-200" />

        {steps.map((step) => {
          const state = getStepStatus(step.key);
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex items-start gap-4 relative z-10">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                  state === 'completed'
                    ? 'bg-green-600 text-white border-green-600'
                    : state === 'active'
                    ? 'bg-[#F97316] text-white border-[#F97316] ring-2 ring-orange-100 scale-105'
                    : 'bg-white text-gray-400 border-gray-300'
                }`}
              >
                <Icon size={14} />
              </div>

              <div className="flex-1 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-heading font-black uppercase ${
                    state === 'completed' ? 'text-green-700' : state === 'active' ? 'text-[#F97316]' : 'text-gray-500'
                  }`}>
                    {step.stepNumber}. {step.title}
                  </span>
                  {state === 'completed' && <span className="text-[10px] text-green-600 font-bold">✓ Done</span>}
                  {state === 'active' && <span className="text-[10px] bg-[#F97316] text-white font-bold px-1.5 py-0.2 rounded">In Progress</span>}
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
