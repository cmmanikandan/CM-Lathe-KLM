import React, { useState, useMemo } from 'react';
import { Star, Search, Check, X, Trash2, AlertTriangle, MessageSquare, Eye, EyeOff, Download, Filter } from 'lucide-react';

interface Review {
  id: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Spam';
  reply?: string;
  reported: boolean;
}

const MOCK_REVIEWS: Review[] = [
  { id: 'r-1', customerName: 'Senthil Kumar', customerPhone: '9876543210', productName: 'Compound Gate (5 Feet)', rating: 5, comment: 'Excellent quality gate! Very heavy duty and the welding is perfect. Installed within 3 days.', date: '2026-07-25', status: 'Pending', reported: false },
  { id: 'r-2', customerName: 'Murugan R', customerPhone: '9865432109', productName: 'Window Grill (Standard)', rating: 4, comment: 'Good quality MS grill. Powder coating looks great. Slightly delayed delivery but overall satisfied.', date: '2026-07-23', status: 'Approved', reported: false },
  { id: 'r-3', customerName: 'Priya Devi', customerPhone: '9812345678', productName: 'Tractor Cultivator 9 Teeth', rating: 5, comment: 'Tractor work is perfect. All 9 teeth are strong and sharp. Agricultural work completed in half the time!', date: '2026-07-20', status: 'Approved', reported: false },
  { id: 'r-4', customerName: 'Arumugam K', customerPhone: '9798765432', productName: 'MS Door Frame', rating: 2, comment: 'Quality was below expectation. The finish was rough and welding has gaps at corners.', date: '2026-07-18', status: 'Pending', reported: true },
  { id: 'r-5', customerName: 'Test Bot', customerPhone: '0000000000', productName: 'Random Product', rating: 1, comment: 'SPAM SPAM BUY FROM MY WEBSITE CLICK HERE spam spam', date: '2026-07-17', status: 'Spam', reported: true },
];

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={12} className={i <= rating ? 'text-[#F97316] fill-[#F97316]' : 'text-gray-200 fill-gray-200'} />
    ))}
  </div>
);

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [activeTab, setActiveTab] = useState<'Pending' | 'Approved' | 'Rejected' | 'Spam'>('Pending');
  const [search, setSearch] = useState('');
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = useMemo(() =>
    reviews.filter(r => {
      const matchTab = r.status === activeTab;
      const matchSearch = r.customerName.toLowerCase().includes(search.toLowerCase()) ||
        r.productName.toLowerCase().includes(search.toLowerCase()) ||
        r.comment.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    }),
    [reviews, activeTab, search]
  );

  const updateStatus = (id: string, status: Review['status']) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const submitReply = (id: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, reply: replyText } : r));
    setReplyingId(null);
    setReplyText('');
  };

  const tabCounts = {
    Pending: reviews.filter(r => r.status === 'Pending').length,
    Approved: reviews.filter(r => r.status === 'Approved').length,
    Rejected: reviews.filter(r => r.status === 'Rejected').length,
    Spam: reviews.filter(r => r.status === 'Spam').length,
  };

  const avgRating = reviews.filter(r => r.status === 'Approved').reduce((s, r) => s + r.rating, 0) /
    Math.max(1, reviews.filter(r => r.status === 'Approved').length);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] pb-24 font-sans">
      <div className="bg-[#111111] text-white py-8 px-4 sm:px-6 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[#F97316] font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
              <Star size={16} /> PRODUCT CATALOG • REVIEWS
            </span>
            <h1 className="font-heading font-black text-2xl text-white mt-1">Customer Reviews Moderation</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Reviews', value: reviews.length, color: 'text-[#111111]' },
            { label: 'Avg Rating', value: avgRating.toFixed(1) + ' ⭐', color: 'text-[#F97316]' },
            { label: 'Pending Review', value: tabCounts.Pending, color: 'text-amber-700' },
            { label: 'Reported', value: reviews.filter(r => r.reported).length, color: 'text-red-600' },
          ].map(s => (
            <div key={s.label} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[10px] font-mono text-gray-500 font-bold uppercase block">{s.label}</span>
              <span className={`font-heading font-black text-2xl block mt-0.5 ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 flex-wrap text-xs font-heading">
          {(['Pending', 'Approved', 'Rejected', 'Spam'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl font-bold cursor-pointer flex items-center gap-1.5 transition-colors ${activeTab === tab ? 'bg-[#111111] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
              {tab}
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${activeTab === tab ? 'bg-[#F97316] text-white' : 'bg-gray-100 text-gray-600'}`}>{tabCounts[tab]}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reviews, customers, products..."
              className="w-full bg-gray-50 text-xs p-3 pl-10 rounded-xl border border-gray-300 outline-none focus:border-[#F97316] font-medium" />
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center text-gray-400">
              <MessageSquare size={36} className="mx-auto mb-3 text-gray-200" />
              <p className="text-sm font-bold">No {activeTab} Reviews</p>
              <p className="text-xs">Reviews will appear here as customers submit them.</p>
            </div>
          ) : (
            filtered.map(r => (
              <div key={r.id} className={`bg-white rounded-2xl border shadow-xs p-4 space-y-3 ${r.reported ? 'border-red-300 bg-red-50/20' : 'border-gray-200'}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading font-bold text-sm text-[#111111]">{r.customerName}</span>
                      <span className="text-[10px] font-mono text-gray-400">{r.customerPhone}</span>
                      {r.reported && <span className="bg-red-100 text-red-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Reported</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating rating={r.rating} />
                      <span className="text-[10px] font-mono text-gray-400">{r.productName}</span>
                      <span className="text-[10px] font-mono text-gray-300">{r.date}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {activeTab === 'Pending' && (
                      <>
                        <button onClick={() => updateStatus(r.id, 'Approved')}
                          className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg cursor-pointer" title="Approve">
                          <Check size={13} />
                        </button>
                        <button onClick={() => updateStatus(r.id, 'Rejected')}
                          className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer" title="Reject">
                          <X size={13} />
                        </button>
                        <button onClick={() => updateStatus(r.id, 'Spam')}
                          className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg cursor-pointer" title="Mark Spam">
                          <AlertTriangle size={13} />
                        </button>
                      </>
                    )}
                    {activeTab === 'Approved' && (
                      <button onClick={() => updateStatus(r.id, 'Rejected')}
                        className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer" title="Unpublish">
                        <EyeOff size={13} />
                      </button>
                    )}
                    <button onClick={() => setReplyingId(r.id)}
                      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg cursor-pointer" title="Reply">
                      <MessageSquare size={13} />
                    </button>
                    <button onClick={() => setConfirmDelete(r.id)}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer" title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed">{r.comment}</p>

                {r.reply && (
                  <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900">
                    <span className="font-bold block text-[10px] uppercase mb-0.5">Workshop Reply</span>
                    {r.reply}
                  </div>
                )}

                {replyingId === r.id && (
                  <div className="space-y-2">
                    <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                      placeholder="Write your reply as MANIKANDAN LATHE..."
                      className="w-full text-xs p-2.5 border border-gray-300 rounded-xl outline-none focus:border-[#F97316] resize-none h-16" />
                    <div className="flex gap-2">
                      <button onClick={() => setReplyingId(null)} className="px-3 py-1.5 bg-gray-100 text-gray-700 font-bold rounded-lg text-xs cursor-pointer">Cancel</button>
                      <button onClick={() => submitReply(r.id)} className="px-3 py-1.5 bg-[#111111] text-white font-bold rounded-lg text-xs cursor-pointer">Post Reply</button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
            <Trash2 size={36} className="mx-auto text-red-500" />
            <h3 className="font-heading font-black text-lg">Delete Review?</h3>
            <p className="text-xs text-gray-500">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 bg-gray-100 font-bold rounded-xl cursor-pointer text-xs">Cancel</button>
              <button onClick={() => { setReviews(p => p.filter(r => r.id !== confirmDelete)); setConfirmDelete(null); }} className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl cursor-pointer text-xs">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewsPage;
