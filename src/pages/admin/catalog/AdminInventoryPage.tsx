import React, { useState, useMemo } from 'react';
import { useProducts } from '../../../context/ProductContext';
import {
  Box,
  AlertTriangle,
  TrendingDown,
  Search,
  Download,
  Plus,
  Edit3,
  X,
  ChevronUp,
  ChevronDown,
  Package,
  BarChart3,
  ArrowUpDown,
  RefreshCw,
  Check,
} from 'lucide-react';

interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  type: 'Add' | 'Remove' | 'Set' | 'Purchase';
  qty: number;
  before: number;
  after: number;
  reason: string;
  date: string;
  by: string;
}

export const AdminInventoryPage: React.FC = () => {
  const { products, updateProduct } = useProducts();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Low' | 'Out'>('All');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<{ id: string; name: string; stock: number } | null>(null);
  const [adjType, setAdjType] = useState<'Add' | 'Remove' | 'Set'>('Add');
  const [adjQty, setAdjQty] = useState(0);
  const [adjReason, setAdjReason] = useState('');
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [activeTab, setActiveTab] = useState<'stock' | 'history' | 'purchase'>('stock');
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'All' ? true
        : filterStatus === 'Low' ? p.stock > 0 && p.stock <= 5
        : p.stock === 0;
      return matchSearch && matchStatus;
    });
  }, [products, search, filterStatus]);

  const openAdjust = (p: { id: string; name: string; stock: number }) => {
    setAdjustTarget(p);
    setAdjType('Add');
    setAdjQty(0);
    setAdjReason('');
    setShowAdjustModal(true);
  };

  const handleAdjust = async () => {
    if (!adjustTarget) return;
    const before = adjustTarget.stock;
    let after = before;
    if (adjType === 'Add') after = before + adjQty;
    else if (adjType === 'Remove') after = Math.max(0, before - adjQty);
    else if (adjType === 'Set') after = adjQty;

    await updateProduct(adjustTarget.id, { stock: after });

    const log: StockAdjustment = {
      id: `adj-${Date.now()}`,
      productId: adjustTarget.id,
      productName: adjustTarget.name,
      type: adjType,
      qty: adjQty,
      before,
      after,
      reason: adjReason || 'Manual adjustment',
      date: new Date().toISOString(),
      by: 'Admin',
    };
    setAdjustments(prev => [log, ...prev]);
    showToast(`Stock updated: ${adjustTarget.name} → ${after} units`);
    setShowAdjustModal(false);
  };

  const exportCSV = () => {
    const rows = [
      ['Product Name', 'SKU', 'Category', 'Stock', 'Status'],
      ...products.map(p => [p.name, p.sku || '', p.category, p.stock, p.stock === 0 ? 'Out of Stock' : p.stock <= 5 ? 'Low Stock' : 'In Stock']),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stockStatusBadge = (stock: number) => {
    if (stock === 0) return <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Out of Stock</span>;
    if (stock <= 5) return <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">Low Stock</span>;
    return <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">In Stock</span>;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] pb-24 font-sans">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-[999] bg-emerald-600 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-right">
          <Check size={15} /> {toastMsg}
        </div>
      )}

      <div className="bg-[#111111] text-white py-8 px-4 sm:px-6 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[#F97316] font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
              <Box size={16} /> PRODUCT CATALOG • INVENTORY
            </span>
            <h1 className="font-heading font-black text-2xl text-white mt-1">Inventory & Stock Management</h1>
          </div>
          <button onClick={exportCSV} className="bg-white/10 hover:bg-white/20 text-white font-heading font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer">
            <Download size={14} /> Export Stock Report
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Stock Units', value: totalStock, color: 'text-[#111111]', bg: 'border-gray-200' },
            { label: 'Total Products', value: products.length, color: 'text-blue-700', bg: 'border-blue-200' },
            { label: 'Low Stock Alerts', value: lowStockProducts.length, color: 'text-amber-700', bg: 'border-amber-300' },
            { label: 'Out of Stock', value: outOfStockProducts.length, color: 'text-red-700', bg: 'border-red-300' },
          ].map(s => (
            <div key={s.label} className={`bg-white p-4 rounded-2xl border shadow-xs ${s.bg}`}>
              <span className="text-[10px] font-mono text-gray-500 font-bold uppercase block">{s.label}</span>
              <span className={`font-heading font-black text-2xl block mt-0.5 ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Sub Tabs */}
        <div className="flex gap-2 text-xs font-heading">
          {[
            { id: 'stock', label: 'Stock Table' },
            { id: 'history', label: 'Adjustment History' },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-xl font-bold cursor-pointer transition-colors ${activeTab === t.id ? 'bg-[#111111] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'stock' && (
          <>
            {/* Filters */}
            <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products, SKU..."
                  className="w-full bg-gray-50 text-xs p-3 pl-10 rounded-xl border border-gray-300 outline-none focus:border-[#F97316] font-medium" />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
                className="bg-gray-50 text-xs p-3 rounded-xl border border-gray-300 outline-none focus:border-[#F97316] font-mono font-bold">
                <option value="All">All Status</option>
                <option value="Low">Low Stock (≤5)</option>
                <option value="Out">Out of Stock</option>
              </select>
            </div>

            {/* Stock Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-sans">
                  <thead>
                    <tr className="bg-[#111111] text-white font-heading uppercase text-[10px]">
                      <th className="p-3 text-left">Product</th>
                      <th className="p-3 text-left">SKU</th>
                      <th className="p-3 text-left">Category</th>
                      <th className="p-3 text-center">Current Stock</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map(p => (
                      <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${p.stock === 0 ? 'bg-red-50/30' : p.stock <= 5 ? 'bg-amber-50/30' : ''}`}>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-8 h-8 rounded-lg object-cover border border-gray-200 shrink-0" />}
                            <span className="font-heading font-bold text-[#111111] truncate max-w-[180px]">{p.name}</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-gray-500">{p.sku || '—'}</td>
                        <td className="p-3 text-gray-500">{p.category}</td>
                        <td className="p-3 text-center">
                          <span className={`font-heading font-black text-lg ${p.stock === 0 ? 'text-red-600' : p.stock <= 5 ? 'text-amber-600' : 'text-emerald-700'}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="p-3 text-center">{stockStatusBadge(p.stock)}</td>
                        <td className="p-3 text-right">
                          <button onClick={() => openAdjust({ id: p.id, name: p.name, stock: p.stock })}
                            className="bg-[#111111] hover:bg-[#F97316] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1 ml-auto transition-colors">
                            <ArrowUpDown size={11} /> Adjust
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            {adjustments.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <RefreshCw size={32} className="mx-auto mb-3 text-gray-200" />
                <p className="text-sm font-bold">No Adjustments Yet</p>
                <p className="text-xs">Stock adjustments will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-sans">
                  <thead>
                    <tr className="bg-[#111111] text-white font-heading uppercase text-[10px]">
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Product</th>
                      <th className="p-3 text-center">Type</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-center">Before</th>
                      <th className="p-3 text-center">After</th>
                      <th className="p-3 text-left">Reason</th>
                      <th className="p-3 text-left">By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {adjustments.map(a => (
                      <tr key={a.id} className="hover:bg-gray-50">
                        <td className="p-3 font-mono text-gray-400">{new Date(a.date).toLocaleDateString('en-IN')}</td>
                        <td className="p-3 font-bold text-[#111111]">{a.productName}</td>
                        <td className="p-3 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.type === 'Add' ? 'bg-emerald-100 text-emerald-800' : a.type === 'Remove' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-800'}`}>{a.type}</span>
                        </td>
                        <td className="p-3 text-center font-mono">{a.qty}</td>
                        <td className="p-3 text-center font-mono text-gray-500">{a.before}</td>
                        <td className="p-3 text-center font-mono font-bold text-[#111111]">{a.after}</td>
                        <td className="p-3 text-gray-500">{a.reason}</td>
                        <td className="p-3 text-gray-500">{a.by}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Adjust Modal */}
      {showAdjustModal && adjustTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-black text-lg">Stock Adjustment</h3>
              <button onClick={() => setShowAdjustModal(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer"><X size={20} /></button>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
              <span className="font-bold text-[#111111] block">{adjustTarget.name}</span>
              <span className="font-mono text-gray-500">Current Stock: <strong className="text-[#111111]">{adjustTarget.stock} units</strong></span>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-2">Adjustment Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Add', 'Remove', 'Set'] as const).map(t => (
                    <button key={t} type="button" onClick={() => setAdjType(t)}
                      className={`py-2 rounded-xl font-bold cursor-pointer ${adjType === t ? 'bg-[#111111] text-white' : 'bg-gray-100 text-gray-700'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  {adjType === 'Set' ? 'Set Stock To' : `Quantity to ${adjType}`}
                </label>
                <input type="number" min="0" value={adjQty} onChange={e => setAdjQty(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-xl outline-none focus:border-[#F97316] font-mono text-lg text-center font-bold" />
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-[11px] text-blue-800 font-mono">
                After adjustment: <strong>
                  {adjType === 'Add' ? adjustTarget.stock + adjQty
                    : adjType === 'Remove' ? Math.max(0, adjustTarget.stock - adjQty)
                    : adjQty} units
                </strong>
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Reason</label>
                <input value={adjReason} onChange={e => setAdjReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-xl outline-none focus:border-[#F97316]"
                  placeholder="e.g. Received from supplier, damaged, stock count..." />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowAdjustModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-800 font-bold rounded-xl cursor-pointer text-xs">Cancel</button>
              <button onClick={handleAdjust} className="flex-1 py-2.5 bg-[#F97316] text-white font-bold rounded-xl cursor-pointer text-xs">Apply Adjustment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventoryPage;
