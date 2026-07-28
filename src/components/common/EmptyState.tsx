import React from 'react';
import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  emoji,
  title,
  subtitle,
  action,
  secondaryAction,
  compact = false,
}) => {
  const navigate = useNavigate();

  return (
    <div
      className={`bg-white rounded-[22px] border border-gray-200 shadow-xs flex flex-col items-center text-center ${
        compact ? 'p-8' : 'p-12'
      } space-y-3`}
    >
      {/* Emoji illustration */}
      <div
        className={`flex items-center justify-center rounded-full bg-gray-50 border border-gray-100 ${
          compact ? 'w-14 h-14 text-3xl' : 'w-20 h-20 text-4xl'
        }`}
      >
        {emoji}
      </div>

      {/* Text */}
      <div className="space-y-1">
        <h3 className={`font-heading font-black text-[#111111] ${compact ? 'text-sm' : 'text-base'}`}>
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">{subtitle}</p>
        )}
      </div>

      {/* CTA Buttons */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-2 pt-1 flex-wrap justify-center">
          {action && (
            <button
              onClick={() => navigate(action.href)}
              className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
            >
              {action.label} →
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="bg-white hover:bg-gray-50 text-gray-700 font-heading font-black text-xs px-4 py-2.5 rounded-xl border border-gray-200 transition-all"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Preset Empty States ──────────────────────────────────────────────────────

export const EmptyOrders: React.FC = () => (
  <EmptyState
    emoji="📦"
    title="No Orders Yet"
    subtitle="You haven't placed any orders. Browse our products and request a quote."
    action={{ label: 'Browse Products', href: '/customer/products' }}
  />
);

export const EmptyWishlist: React.FC = () => (
  <EmptyState
    emoji="❤️"
    title="Wishlist is Empty"
    subtitle="Save products and gallery works you love to find them quickly."
    action={{ label: 'Explore Catalogue', href: '/customer/products' }}
  />
);

export const EmptyGallery: React.FC = () => (
  <EmptyState
    emoji="🖼️"
    title="No Gallery Favourites"
    subtitle="Like completed works from the factory gallery to save them here."
    action={{ label: 'Open Gallery', href: '/customer/status' }}
  />
);

export const EmptyNotifications: React.FC = () => (
  <EmptyState
    emoji="🔔"
    title="No Notifications"
    subtitle="Order updates, payment receipts, and workshop alerts will appear here."
  />
);

export const EmptyInvoices: React.FC = () => (
  <EmptyState
    emoji="🧾"
    title="No Invoices Yet"
    subtitle="Invoices will be generated automatically once you place an order."
    action={{ label: 'Browse Products', href: '/customer/products' }}
  />
);

export const EmptyPayments: React.FC = () => (
  <EmptyState
    emoji="💳"
    title="No Payments Yet"
    subtitle="Payment history will appear here after your first order."
    action={{ label: 'Browse Products', href: '/customer/products' }}
  />
);

export const EmptyStories: React.FC = () => (
  <EmptyState
    emoji="🔥"
    title="No Live Stories"
    subtitle="The workshop team hasn't posted any live updates yet. Check back soon!"
  />
);
