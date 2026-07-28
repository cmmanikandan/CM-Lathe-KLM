import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCustomerOrders } from '../../context/OrderContext';
import {
  Bell, CheckCircle, Clock, Trash2, ChevronRight, Sparkles, ArrowLeft
} from 'lucide-react';
import { NotificationSkeleton } from '../../components/common/SkeletonLoader';
import { EmptyNotifications } from '../../components/common/EmptyState';

export const CustomerNotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { orders, loading } = useCustomerOrders(user?.phone || '');

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ORDERS' | 'PAYMENTS'>('ALL');
  const [cleared, setCleared] = useState(false);

  interface NotificationItem {
    id: string;
    type: 'ORDERS' | 'PAYMENTS';
    title: string;
    message: string;
    date: string;
    orderId?: string;
    unread: boolean;
  }

  // Derive notifications purely from real customer orders
  const notificationsList: NotificationItem[] = cleared ? [] : orders.flatMap((order) => {
    const list: NotificationItem[] = [
      {
        id: `notif-order-${order.id}`,
        type: 'ORDERS',
        title: `Order #${order.orderNumber} — ${order.status.replace('_', ' ')}`,
        message: `Your order is currently ${order.status.replace('_', ' ').toLowerCase()}. ${
          order.status === 'ACCEPTED' ? 'Work will begin soon.' :
          order.status === 'IN_PRODUCTION' ? 'Your item is being fabricated in the workshop.' :
          order.status === 'READY' ? 'Your item is ready for pickup / delivery.' :
          order.status === 'COMPLETED' ? 'Order delivered successfully. Thank you!' :
          order.status === 'REJECTED' ? 'This order was cancelled. Contact us for details.' :
          'Track status live in the workshop stories.'
        }`,
        date: order.createdAt,
        orderId: order.id,
        unread: order.status !== 'COMPLETED' && order.status !== 'REJECTED',
      },
    ];

    order.paymentHistory.forEach((pay) => {
      list.push({
        id: `notif-pay-${pay.id}`,
        type: 'PAYMENTS',
        title: `Payment Received — ₹${pay.amount.toLocaleString('en-IN')}`,
        message: `₹${pay.amount.toLocaleString('en-IN')} received via ${pay.mode} (${pay.receiptNumber}). Remaining: ₹${pay.remainingBalanceAfter.toLocaleString('en-IN')}`,
        date: `${pay.date} ${pay.time}`,
        orderId: order.id,
        unread: false,
      });
    });

    return list;
  });

  const filteredNotifs = notificationsList.filter(
    (n) => activeFilter === 'ALL' || n.type === activeFilter
  );

  return (
    <div className="p-4 space-y-4 font-sans max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-1 rounded-lg hover:bg-gray-100">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-heading font-black text-lg text-[#111111] flex items-center gap-1.5">
              <Bell size={18} className="text-[#F97316]" /> Notifications
            </h1>
            <p className="text-xs text-gray-500">Order updates and payment receipts</p>
          </div>
        </div>

        {filteredNotifs.length > 0 && (
          <button
            onClick={() => setCleared(true)}
            className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1 shrink-0"
          >
            <Trash2 size={14} /> Clear All
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {(['ALL', 'ORDERS', 'PAYMENTS'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1.5 rounded-full text-xs font-heading font-extrabold transition-all border ${
              activeFilter === filter
                ? 'bg-[#111111] text-white border-[#111111]'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => <NotificationSkeleton key={i} />)}
        </div>
      ) : filteredNotifs.length === 0 ? (
        <EmptyNotifications />
      ) : (
        <div className="space-y-2.5">
          {filteredNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => { if (n.orderId) navigate(`/customer/orders/${n.orderId}`); }}
              className={`p-3.5 rounded-[22px] border transition-all cursor-pointer flex items-start gap-3 ${
                n.unread
                  ? 'bg-orange-50/70 border-orange-200 shadow-xs'
                  : 'bg-white border-gray-200/80 hover:border-gray-300'
              }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                n.type === 'ORDERS' ? 'bg-amber-100 text-[#F97316]' : 'bg-green-100 text-green-700'
              }`}>
                {n.type === 'ORDERS' ? <Clock size={18} /> : <CheckCircle size={18} />}
              </div>

              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-black text-xs text-[#111111]">{n.title}</h4>
                  <span className="text-[10px] text-gray-400 font-mono shrink-0 ml-2">
                    {new Date(n.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-snug">{n.message}</p>
              </div>

              {n.orderId && <ChevronRight size={16} className="text-gray-400 shrink-0 self-center" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
