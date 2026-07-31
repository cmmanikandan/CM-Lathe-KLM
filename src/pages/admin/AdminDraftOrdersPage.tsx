import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { Clock, Trash2, ArrowRight, FileText, PlusCircle, AlertCircle } from 'lucide-react';

export const AdminDraftOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { getDraftOrders, deleteDraftOrder } = useOrders();
  const [drafts, setDrafts] = useState<any[]>([]);

  useEffect(() => {
    setDrafts(getDraftOrders());
  }, []);

  const handleDelete = (id: string) => {
    deleteDraftOrder(id);
    setDrafts(getDraftOrders());
  };

  const handleResume = (draft: any) => {
    if (draft.orderType === 'Quick Order') {
      navigate('/admin/offline-orders/quick');
    } else {
      navigate('/admin/offline-orders/advanced');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] pb-24 font-sans">
      <div className="bg-[#111111] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div>
            <span className="text-[#F97316] font-mono font-bold text-xs uppercase tracking-widest block">
              INTERRUPTED WORKFLOW AUTO-SAVER
            </span>
            <h1 className="font-heading font-black text-2xl text-white mt-1">
              OFFLINE ORDER DRAFTS
            </h1>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate('/admin/offline-orders/quick')}
              className="bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
            >
              + Quick Order
            </button>
            <button
              onClick={() => navigate('/admin/offline-orders/advanced')}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
            >
              + Advanced Order
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        {drafts.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center max-w-md mx-auto space-y-3 shadow-xs">
            <Clock size={40} className="mx-auto text-gray-300" />
            <h3 className="font-heading font-bold text-base text-[#111111]">No Saved Drafts</h3>
            <p className="text-xs text-gray-500">
              When counter staff start creating a Quick or Advanced order and leave before submitting, the draft automatically saves here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drafts.map((draft) => (
              <div key={draft.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4 hover:border-[#F97316] transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border border-amber-300 uppercase">
                      {draft.orderType || 'Offline Order'} Draft
                    </span>
                    <h3 className="font-heading font-black text-base text-[#111111] mt-1.5">
                      {draft.customerName || 'Unnamed Walk-in Customer'}
                    </h3>
                    <p className="text-xs font-mono text-gray-500">{draft.customerPhone || 'No Phone'}</p>
                  </div>

                  <button
                    onClick={() => handleDelete(draft.id)}
                    className="text-gray-400 hover:text-red-600 p-1 cursor-pointer"
                    title="Delete Draft"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl space-y-1 text-xs font-mono border border-gray-200">
                  <div className="flex justify-between">
                    <span>Items in Cart:</span>
                    <strong>{draft.cart?.length || 0} Products</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Saved:</span>
                    <span className="text-gray-500">
                      {draft.updatedAt ? new Date(draft.updatedAt).toLocaleTimeString('en-IN') : 'Just now'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleResume(draft)}
                  className="w-full bg-[#111111] hover:bg-[#F97316] text-white font-heading font-black text-xs py-3 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  Resume Order Creation <ArrowRight size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDraftOrdersPage;
