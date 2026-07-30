import React, { useState } from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';

interface GenericDeleteModalProps {
  isOpen: boolean;
  title: string;
  itemTitle?: string;
  description?: string;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export const GenericDeleteModal: React.FC<GenericDeleteModalProps> = ({
  isOpen,
  title,
  itemTitle,
  description,
  onClose,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error('Delete action failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-5 font-sans">
        
        {/* Header */}
        <div className="flex items-center gap-3.5 border-b border-gray-100 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <Trash2 size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono text-red-600 font-bold uppercase tracking-wider block">
              CONFIRM DELETE
            </span>
            <h3 className="font-heading font-black text-lg text-[#111111] truncate mt-0.5">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Item Card */}
        {itemTitle && (
          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-mono">
            <span className="text-gray-500 block text-[10px]">Target Item:</span>
            <strong className="text-gray-900 font-sans text-sm font-bold block truncate mt-0.5">
              {itemTitle}
            </strong>
          </div>
        )}

        {/* Warning Banner */}
        <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-900 space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-red-800">
            <AlertTriangle size={16} /> Warning: Permanent Action
          </p>
          <p className="text-[11px] leading-relaxed text-red-700 font-medium">
            {description || 'Are you sure you want to remove this item? This action cannot be undone.'}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-heading font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={15} /> Delete Permanently
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
