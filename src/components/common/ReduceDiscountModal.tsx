import React, { useState, useEffect } from 'react';
import { Order } from '../../types';
import { useOrders } from '../../context/OrderContext';
import { Tag, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface ReduceDiscountModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReduceDiscountModal: React.FC<ReduceDiscountModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const { updateOrderDiscount } = useOrders();
  const [discountVal, setDiscountVal] = useState<string>('100');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (order) {
      setDiscountVal('100');
      setError('');
    }
  }, [order, isOpen]);

  if (!isOpen || !order) return null;

  const numDisc = parseFloat(discountVal) || 0;
  const newFinalPrice = Math.max(0, order.finalPrice - numDisc);
  const newBalance = Math.max(0, order.remainingBalance - numDisc);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(numDisc) || numDisc <= 0) {
      setError('Please enter a valid discount amount greater than 0.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await updateOrderDiscount(order.id, numDisc);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to apply discount. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 font-sans relative">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-3.5">
          <div>
            <span className="text-[10px] font-mono text-[#F97316] font-bold uppercase tracking-wider block">
              POS BILL DISCOUNT
            </span>
            <h3 className="font-heading font-black text-lg text-slate-900 flex items-center gap-2 mt-0.5">
              <Tag size={20} className="text-[#F97316]" /> Reduce Billed Amount
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Order #{order.orderNumber} • {order.customerName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Current Financial Summary Card */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">Current Total Billed:</span>
              <strong className="text-slate-900 font-bold text-sm">₹{order.finalPrice.toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Current Balance Due:</span>
              <strong className="text-red-600 font-bold text-sm">₹{order.remainingBalance.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {/* Discount Input */}
          <div className="space-y-1.5">
            <label className="font-bold text-xs text-slate-700 block">
              Enter Extra Discount Amount to Reduce (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-slate-500 font-mono font-bold text-sm">₹</span>
              <input
                type="number"
                min="1"
                required
                value={discountVal}
                onChange={(e) => setDiscountVal(e.target.value)}
                placeholder="100"
                className="w-full bg-slate-50 hover:bg-white focus:bg-white pl-9 pr-4 py-3.5 rounded-2xl border border-slate-200 font-mono text-base font-bold text-slate-900 outline-none focus:border-[#F97316] transition-colors"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 font-bold flex items-center gap-1">
              <AlertCircle size={14} /> {error}
            </p>
          )}

          {/* Live Preview Box */}
          {numDisc > 0 && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-amber-900">
                <span>New Total Billed:</span>
                <strong className="font-bold">₹{newFinalPrice.toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between text-amber-900 border-t border-amber-200/60 pt-1.5">
                <span>New Balance Due:</span>
                <strong className={newBalance > 0 ? 'text-red-600 font-bold' : 'text-emerald-700 font-bold'}>
                  ₹{newBalance.toLocaleString('en-IN')}
                </strong>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-50 text-white font-heading font-black text-xs rounded-2xl shadow-lg flex items-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} /> Apply Discount ✓
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
