import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LogIn, UserPlus, X, ShieldCheck } from 'lucide-react';

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
}

export const LoginRequiredModal: React.FC<LoginRequiredModalProps> = ({
  isOpen,
  onClose,
  productName
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 relative animate-fade-in">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Lock Icon Header */}
        <div className="text-center space-y-2.5 pt-2">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 text-[#F97316] flex items-center justify-center mx-auto shadow-xs">
            <Lock size={28} />
          </div>
          
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-[#F97316] tracking-wider block">Customer Account Security</span>
            <h3 className="font-heading font-black text-xl text-slate-900 mt-0.5">Account Sign In Required</h3>
            {productName && (
              <p className="text-xs text-[#F97316] font-bold line-clamp-1 mt-1 bg-orange-50/80 px-3 py-1 rounded-full border border-orange-200/60 inline-block">{productName}</p>
            )}
          </div>
        </div>

        {/* Requirements Bullet List */}
        <div className="bg-slate-50 p-4.5 rounded-2xl space-y-2.5 border border-slate-200/80 text-xs text-slate-700 font-sans">
          <p className="font-bold text-slate-900">Please log in to your account to access:</p>
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={16} className="text-[#F97316] shrink-0" />
            <span>Place custom lathe & gate fabrication orders</span>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={16} className="text-[#F97316] shrink-0" />
            <span>Track live workshop manufacturing progress</span>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={16} className="text-[#F97316] shrink-0" />
            <span>Make partial payments & view payment ledger</span>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={16} className="text-[#F97316] shrink-0" />
            <span>Download official GST tax invoices</span>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="space-y-2.5 pt-1">
          <button
            onClick={() => {
              onClose();
              navigate('/login');
            }}
            className="w-full bg-[#111111] hover:bg-[#F97316] text-white font-heading font-black text-xs py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <LogIn size={16} /> Sign In to Account
          </button>

          <button
            onClick={() => {
              onClose();
              navigate('/register');
            }}
            className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <UserPlus size={16} /> Register New Account
          </button>

          <button
            onClick={onClose}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-2xl transition-colors cursor-pointer"
          >
            Continue Browsing Catalog
          </button>
        </div>

      </div>
    </div>
  );
};
