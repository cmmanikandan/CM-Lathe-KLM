import React from 'react';

// ─── Base pulse skeleton block ────────────────────────────────────────────
const Pulse: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

// ─── Order card skeleton ──────────────────────────────────────────────────
export const OrderCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-[22px] border border-gray-100 p-4 shadow-xs space-y-3">
    <div className="flex items-center justify-between">
      <Pulse className="h-4 w-32" />
      <Pulse className="h-6 w-20 rounded-full" />
    </div>
    <div className="flex items-center gap-3">
      <Pulse className="w-14 h-14 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Pulse className="h-3.5 w-3/4" />
        <Pulse className="h-3 w-1/2" />
      </div>
    </div>
    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
      <Pulse className="h-5 w-24" />
      <Pulse className="h-8 w-28 rounded-xl" />
    </div>
  </div>
);

// ─── Stat card skeleton ───────────────────────────────────────────────────
export const StatCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-[18px] border border-gray-100 p-4 shadow-xs space-y-3">
    <Pulse className="w-9 h-9 rounded-xl" />
    <Pulse className="h-6 w-12" />
    <Pulse className="h-3 w-20" />
  </div>
);

// ─── Product card skeleton ────────────────────────────────────────────────
export const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-[18px] border border-gray-100 p-3 shadow-xs space-y-3">
    <Pulse className="w-full aspect-square rounded-xl" />
    <Pulse className="h-3.5 w-3/4" />
    <Pulse className="h-3 w-1/2" />
    <div className="flex items-center justify-between pt-1">
      <Pulse className="h-5 w-16" />
      <Pulse className="h-8 w-20 rounded-xl" />
    </div>
  </div>
);

// ─── Story card skeleton ──────────────────────────────────────────────────
export const StoryCardSkeleton: React.FC = () => (
  <div className="flex flex-col gap-2 items-center">
    <Pulse className="w-16 h-16 rounded-full" />
    <Pulse className="h-3 w-14 rounded-full" />
  </div>
);

// ─── Profile header skeleton ──────────────────────────────────────────────
export const ProfileHeaderSkeleton: React.FC = () => (
  <div className="bg-white rounded-[22px] border border-gray-100 p-5 shadow-xs space-y-4">
    <div className="flex items-center gap-4">
      <Pulse className="w-16 h-16 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Pulse className="h-5 w-40" />
        <Pulse className="h-3 w-28" />
        <Pulse className="h-3 w-36" />
      </div>
    </div>
    <Pulse className="h-2 w-full rounded-full" />
  </div>
);

// ─── Notification skeleton ────────────────────────────────────────────────
export const NotificationSkeleton: React.FC = () => (
  <div className="bg-white rounded-[22px] border border-gray-100 p-3.5 shadow-xs flex items-start gap-3">
    <Pulse className="w-9 h-9 rounded-full shrink-0" />
    <div className="flex-1 space-y-2">
      <Pulse className="h-3.5 w-3/4" />
      <Pulse className="h-3 w-full" />
      <Pulse className="h-3 w-1/2" />
    </div>
  </div>
);

// ─── Generic list skeleton (renders N items) ──────────────────────────────
export const SkeletonList: React.FC<{ count?: number; variant?: 'order' | 'stat' | 'product' | 'story' | 'notification' }> = ({
  count = 3,
  variant = 'order',
}) => {
  const Comp = {
    order: OrderCardSkeleton,
    stat: StatCardSkeleton,
    product: ProductCardSkeleton,
    story: StoryCardSkeleton,
    notification: NotificationSkeleton,
  }[variant];

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Comp key={i} />
      ))}
    </>
  );
};
