import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Order } from '../../types';
import { CheckCircle2, AlertTriangle, Sparkles, ChevronRight, X, Phone, MessageCircle } from 'lucide-react';

interface CustomerOrderStatusNotificationProps {
  orders: Order[];
}

export const CustomerOrderStatusNotification: React.FC<CustomerOrderStatusNotificationProps> = ({ orders }) => {
  const navigate = useNavigate();
  const [activeAlertOrder, setActiveAlertOrder] = useState<{
    order: Order;
    type: 'ACCEPTED' | 'REJECTED' | 'PRODUCTION';
  } | null>(null);

  useEffect(() => {
    if (!orders || orders.length === 0) return;

    try {
      const storageKey = 'ml_seen_order_statuses_v1';
      const savedSeen = localStorage.getItem(storageKey);
      const seenMap: Record<string, string> = savedSeen ? JSON.parse(savedSeen) : {};

      // Find first order with unseen updated status
      const updatedOrder = orders.find((o) => {
        const lastSeenStatus = seenMap[o.id];
        return lastSeenStatus !== o.status && (
          ['ACCEPTED', 'IN_PRODUCTION', 'READY', 'REJECTED'].includes(o.status)
        );
      });

      if (updatedOrder) {
        let type: 'ACCEPTED' | 'REJECTED' | 'PRODUCTION' = 'ACCEPTED';
        if (updatedOrder.status === 'REJECTED') {
          type = 'REJECTED';
        } else if (['IN_PRODUCTION', 'READY'].includes(updatedOrder.status)) {
          type = 'PRODUCTION';
        }

        setActiveAlertOrder({ order: updatedOrder, type });
      }
    } catch (e) {
      console.error('Order status notification error:', e);
    }
  }, [orders]);

  const handleDismiss = () => {
    if (!activeAlertOrder) return;
    try {
      const storageKey = 'ml_seen_order_statuses_v1';
      const savedSeen = localStorage.getItem(storageKey);
      const seenMap: Record<string, string> = savedSeen ? JSON.parse(savedSeen) : {};
      seenMap[activeAlertOrder.order.id] = activeAlertOrder.order.status;
      localStorage.setItem(storageKey, JSON.stringify(seenMap));
    } catch {}
    setActiveAlertOrder(null);
  };

  const handleViewDetails = () => {
    if (!activeAlertOrder) return;
    handleDismiss();
    navigate(`/customer/orders/${activeAlertOrder.order.id}`);
  };

  if (!activeAlertOrder) return null;

  const { order, type } = activeAlertOrder;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        className="fixed top-4 left-4 right-4 z-50 max-w-xl mx-auto font-sans"
      >
        <div
          className={`p-5 rounded-[24px] shadow-2xl border-2 relative overflow-hidden backdrop-blur-xl ${
            type === 'REJECTED'
              ? 'bg-red-950/95 text-white border-red-500 shadow-red-950/40'
              : type === 'PRODUCTION'
              ? 'bg-[#111111]/95 text-white border-[#F97316] shadow-orange-950/40'
              : 'bg-gradient-to-r from-[#111111] via-[#1A1A1A] to-[#232323] text-white border-green-500 shadow-emerald-950/40'
          }`}
        >
          {/* Top Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Dismiss notification"
          >
            <X size={16} />
          </button>

          <div className="flex items-start gap-4">
            {/* Status Icon Badge */}
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-md ${
                type === 'REJECTED'
                  ? 'bg-red-900/80 text-red-300 border-red-600'
                  : type === 'PRODUCTION'
                  ? 'bg-orange-900/80 text-[#F97316] border-[#F97316]'
                  : 'bg-emerald-900/80 text-emerald-300 border-emerald-500 animate-bounce'
              }`}
            >
              {type === 'REJECTED' ? (
                <AlertTriangle size={24} />
              ) : type === 'PRODUCTION' ? (
                <Sparkles size={24} />
              ) : (
                <CheckCircle2 size={24} />
              )}
            </div>

            {/* Status Message Content */}
            <div className="space-y-1 pr-6 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F97316]">
                  {type === 'REJECTED'
                    ? '⚠️ ORDER STATUS NOTICE'
                    : type === 'PRODUCTION'
                    ? '⚡ WORKSHOP IN PRODUCTION'
                    : '🎉 ORDER APPROVED BY FACTORY OWNER'}
                </span>
              </div>

              <h3 className="font-heading font-black text-lg text-white leading-snug truncate">
                Order #{order.orderNumber}
              </h3>

              <p className="text-xs text-gray-200 leading-relaxed font-medium">
                {type === 'REJECTED' ? (
                  <span>
                    Your order #{order.orderNumber} status has been updated to{' '}
                    <strong className="text-red-400 font-bold uppercase">{order.status}</strong>. Please contact owner Chellamuthu K for details.
                  </span>
                ) : type === 'PRODUCTION' ? (
                  <span>
                    Great news! Lathe turning & steel fabrication for your order is currently active in the workshop.
                  </span>
                ) : (
                  <span>
                    Factory owner <strong className="text-emerald-400 font-bold">Chellamuthu K</strong> has reviewed and accepted your order!
                  </span>
                )}
              </p>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={handleViewDetails}
                  className="bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-heading font-black px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  View Order Details <ChevronRight size={14} />
                </button>

                <a
                  href="tel:+919659286268"
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-heading font-bold px-3 py-2.5 rounded-xl flex items-center gap-1 transition-all"
                >
                  <Phone size={13} /> Call Owner
                </a>

                <button
                  onClick={handleDismiss}
                  className="text-xs text-gray-400 hover:text-white px-2 py-1 font-mono font-bold"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
