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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[22px] max-w-md w-full p-6 space-y-5 shadow-2xl border border-gray-200 animate-fade-in relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Lock Icon Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-orange-100 text-[#F97316] flex items-center justify-center mx-auto shadow-inner">
            <Lock size={28} />
          </div>
          
          <h3 className="font-heading font-black text-xl text-[#111111]">LOGIN REQUIRED</h3>
          {productName && (
            <p className="text-xs text-[#F97316] font-extrabold line-clamp-1">{productName}</p>
          )}
        </div>

        {/* Requirements Bullet List */}
        <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-200/80 text-xs text-gray-700 font-sans">
          <p className="font-bold text-[#111111] mb-1">Please log in to your account to access:</p>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#F97316] shrink-0" />
            <span>Place custom lathe & gate fabrication orders</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#F97316] shrink-0" />
            <span>Track live workshop manufacturing progress</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#F97316] shrink-0" />
            <span>Make partial payments & view payment ledger</span>
          </div>
          <div className="flex items-center gap-2">
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
            className="w-full bg-[#111111] hover:bg-[#F97316] text-white font-heading font-black text-xs py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <LogIn size={16} /> Sign In to Account
          </button>

          <button
            onClick={() => {
              onClose();
              navigate('/register');
            }}
            className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <UserPlus size={16} /> Register New Account
          </button>

          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-2.5 rounded-xl transition-colors"
          >
            Continue Browsing Catalog
          </button>
        </div>

      </div>
    </div>
  );
};
