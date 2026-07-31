import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../../context/ProductContext';
import { Product } from '../../../types';
import {
  Layers,
  Plus,
  Edit3,
  Trash2,
  Search,
  X,
  AlertTriangle,
  Zap,
  Check,
  Package,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Eye,
  Box,
} from 'lucide-react';

type VariantType = 'Size' | 'Color' | 'Material' | 'Finish' | 'Weight' | 'Capacity' | 'Length' | 'Height' | 'Width';

interface GlobalVariant {
  id: string;
  name: string;
  type: VariantType;
  sku: string;
  barcode?: string;
  priceDiff: number; // positive = premium, negative = discount
  stock: number;
  enabled: boolean;
}

const INITIAL_VARIANTS: GlobalVariant[] = [
  { id: 'gv-1', name: '4 Feet', type: 'Size', sku: 'SZ-4FT', priceDiff: -8000, stock: 12, enabled: true },
  { id: 'gv-2', name: '5 Feet', type: 'Size', sku: 'SZ-5FT', priceDiff: 0, stock: 15, enabled: true },
  { id: 'gv-3', name: '6 Feet', type: 'Size', sku: 'SZ-6FT', priceDiff: 9600, stock: 8, enabled: true },
  { id: 'gv-4', name: '7 Feet', type: 'Size', sku: 'SZ-7FT', priceDiff: 19200, stock: 5, enabled: true },
  { id: 'gv-5', name: 'Industrial Black', type: 'Color', sku: 'COL-BLK', priceDiff: 0, stock: 999, enabled: true },
  { id: 'gv-6', name: 'Silver Chrome', type: 'Color', sku: 'COL-CHR', priceDiff: 1500, stock: 999, enabled: true },
  { id: 'gv-7', name: 'Custom Color (RAL)', type: 'Color', sku: 'COL-RAL', priceDiff: 3000, stock: 999, enabled: true },
  { id: 'gv-8', name: 'Mild Steel (MS)', type: 'Material', sku: 'MAT-MS', priceDiff: 0, stock: 999, enabled: true },
  { id: 'gv-9', name: 'Stainless Steel 304', type: 'Material', sku: 'MAT-SS304', priceDiff: 8000, stock: 999, enabled: true },
  { id: 'gv-10', name: 'Powder Coated', type: 'Finish', sku: 'FIN-PC', priceDiff: 0, stock: 999, enabled: true },
  { id: 'gv-11', name: 'Galvanized', type: 'Finish', sku: 'FIN-GALV', priceDiff: 2500, stock: 999, enabled: true },
  { id: 'gv-12', name: '100 kg', type: 'Capacity', sku: 'CAP-100', priceDiff: 0, stock: 20, enabled: true },
  { id: 'gv-13', name: '250 kg', type: 'Capacity', sku: 'CAP-250', priceDiff: 5000, stock: 12, enabled: true },
];

const VARIANT_TYPES: VariantType[] = ['Size', 'Color', 'Material', 'Finish', 'Weight', 'Capacity', 'Length', 'Height', 'Width'];

export const AdminVariantsPage: React.FC = () => {
  const navigate = useNavigate();
  const { products } = useProducts();

  const [variants, setVariants] = useState<GlobalVariant[]>(INITIAL_VARIANTS);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [showModal, setShowModal] = useState(false);
  const [editingVar, setEditingVar] = useState<GlobalVariant | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showBulkGen, setShowBulkGen] = useState(false);

  // Selected variant for live products popup
  const [selectedVariantForProducts, setSelectedVariantForProducts] = useState<GlobalVariant | null>(null);

  // Form states
  const [fName, setFName] = useState('');
  const [fType, setFType] = useState<VariantType>('Size');
  const [fSku, setFSku] = useState('');
  const [fPriceDiff, setFPriceDiff] = useState(0);
  const [fStock, setFStock] = useState(10);

  // Bulk generator
  const [bulkTypes, setBulkTypes] = useState<string[]>([]);
  const [bulkValues, setBulkValues] = useState('');

  // Dynamically find live catalog products matching a variant
  const getLiveMatchingProducts = (variant: GlobalVariant): Product[] => {
    const vLower = variant.name.toLowerCase();
    const skuLower = variant.sku.toLowerCase();

    return products.filter((p) => {
      // 1. Direct name or category match
      const nameMatch = p.name.toLowerCase().includes(vLower);
      const catMatch = p.category.toLowerCase().includes(vLower);
      const descMatch = p.description ? p.description.toLowerCase().includes(vLower) : false;

      // 2. Specifications match
      const specMatch =
        p.specifications &&
        ((p.specifications.material && p.specifications.material.toLowerCase().includes(vLower)) ||
          (p.specifications.size && p.specifications.size.toLowerCase().includes(vLower)) ||
          (p.specifications.color && p.specifications.color.toLowerCase().includes(vLower)) ||
          (p.specifications.finish && p.specifications.finish.toLowerCase().includes(vLower)));

      // 3. Variant array match
      const variantArrayMatch =
        p.variants &&
        p.variants.some(
          (pv) =>
            (pv.name && pv.name.toLowerCase().includes(vLower)) ||
            (pv.material && pv.material.toLowerCase().includes(vLower)) ||
            (pv.color && pv.color.toLowerCase().includes(vLower)) ||
            (pv.finish && pv.finish.toLowerCase().includes(vLower)) ||
            (pv.code && pv.code.toLowerCase().includes(skuLower))
        );

      return nameMatch || catMatch || descMatch || Boolean(specMatch) || Boolean(variantArrayMatch);
    });
  };

  const filtered = useMemo(
    () =>
      variants.filter((v) => {
        const matchS = v.name.toLowerCase().includes(search.toLowerCase()) || v.sku.toLowerCase().includes(search.toLowerCase());
        const matchT = filterType === 'All' || v.type === filterType;
        return matchS && matchT;
      }),
    [variants, search, filterType]
  );

  const grouped = useMemo(() => {
    const map: Record<string, GlobalVariant[]> = {};
    filtered.forEach((v) => {
      if (!map[v.type]) map[v.type] = [];
      map[v.type].push(v);
    });
    return map;
  }, [filtered]);

  const openAdd = () => {
    setEditingVar(null);
    setFName('');
    setFType('Size');
    setFSku('');
    setFPriceDiff(0);
    setFStock(10);
    setShowModal(true);
  };

  const openEdit = (v: GlobalVariant) => {
    setEditingVar(v);
    setFName(v.name);
    setFType(v.type);
    setFSku(v.sku);
    setFPriceDiff(v.priceDiff);
    setFStock(v.stock);
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingVar) {
      setVariants((prev) =>
        prev.map((v) =>
          v.id === editingVar.id
            ? { ...v, name: fName, type: fType, sku: fSku, priceDiff: fPriceDiff, stock: fStock }
            : v
        )
      );
    } else {
      setVariants((prev) => [
        ...prev,
        {
          id: `gv-${Date.now()}`,
          name: fName,
          type: fType,
          sku: fSku,
          priceDiff: fPriceDiff,
          stock: fStock,
          enabled: true,
        },
      ]);
    }
    setShowModal(false);
  };

  const toggleEnabled = (id: string) => {
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, enabled: !v.enabled } : v)));
  };

  const handleBulkGenerate = () => {
    const values = bulkValues
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
    const type = (bulkTypes[0] as VariantType) || 'Size';
    const newVars: GlobalVariant[] = values.map((val, i) => ({
      id: `gv-bulk-${Date.now()}-${i}`,
      name: val,
      type,
      sku: `${type.substring(0, 3).toUpperCase()}-${val.replace(/\s+/g, '').toUpperCase()}`,
      priceDiff: 0,
      stock: 10,
      enabled: true,
    }));
    setVariants((prev) => [...prev, ...newVars]);
    setShowBulkGen(false);
    setBulkValues('');
  };

  const typeColors: Record<string, string> = {
    Size: 'bg-blue-100 text-blue-800 border-blue-200',
    Color: 'bg-purple-100 text-purple-800 border-purple-200',
    Material: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Finish: 'bg-amber-100 text-amber-800 border-amber-200',
    Weight: 'bg-gray-100 text-gray-700 border-gray-200',
    Capacity: 'bg-orange-100 text-orange-800 border-orange-200',
    Length: 'bg-teal-100 text-teal-800 border-teal-200',
    Height: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    Width: 'bg-pink-100 text-pink-800 border-pink-200',
  };

  const activeMatchingProducts = selectedVariantForProducts ? getLiveMatchingProducts(selectedVariantForProducts) : [];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] pb-24 font-sans space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#111111] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[#F97316] font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
              <Layers size={16} /> PRODUCT CATALOG • VARIANTS MATRIX
            </span>
            <h1 className="font-heading font-black text-2xl text-white mt-1">Global Variants Matrix</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowBulkGen(true)}
              className="bg-white/10 hover:bg-white/20 text-white font-heading font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Zap size={14} /> Bulk Generate
            </button>
            <button
              onClick={openAdd}
              className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={15} /> Add Variant
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Variants', value: variants.length },
            { label: 'Enabled', value: variants.filter((v) => v.enabled).length },
            { label: 'Disabled', value: variants.filter((v) => !v.enabled).length },
            { label: 'Variant Types', value: Object.keys(grouped).length },
          ].map((s) => (
            <div key={s.label} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[10px] font-mono text-gray-500 font-bold uppercase block">{s.label}</span>
              <span className="font-heading font-black text-2xl text-[#111111] block mt-0.5">{s.value}</span>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search variants, SKUs..."
              className="w-full bg-gray-50 text-xs p-3 pl-10 rounded-xl border border-gray-300 outline-none focus:border-[#F97316] font-medium text-gray-900"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-gray-50 text-xs p-3 rounded-xl border border-gray-300 outline-none focus:border-[#F97316] font-mono font-bold text-gray-800"
          >
            <option value="All">All Types</option>
            {VARIANT_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Grouped Variant Tables */}
        {Object.entries(grouped).map(([type, vars]) => (
          <div key={type} className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    typeColors[type] || 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  {type}
                </span>
                <span className="text-xs font-mono text-gray-500">{vars.length} variants</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-sans">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 font-heading uppercase text-[10px] border-b border-gray-100">
                    <th className="p-3.5 text-left">Variant Name</th>
                    <th className="p-3.5 text-left">SKU</th>
                    <th className="p-3.5 text-right">Price Diff</th>
                    <th className="p-3.5 text-center">Stock</th>
                    <th className="p-3.5 text-center">Live Used In</th>
                    <th className="p-3.5 text-center">Enabled</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vars.map((v) => {
                    const matchingProds = getLiveMatchingProducts(v);
                    const prodCount = matchingProds.length;

                    return (
                      <tr key={v.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-3.5 font-heading font-bold text-[#111111]">{v.name}</td>
                        <td className="p-3.5 font-mono text-gray-500">{v.sku}</td>
                        <td className="p-3.5 text-right font-mono font-bold">
                          <span
                            className={
                              v.priceDiff > 0
                                ? 'text-emerald-700'
                                : v.priceDiff < 0
                                ? 'text-red-600'
                                : 'text-gray-400'
                            }
                          >
                            {v.priceDiff > 0
                              ? `+₹${v.priceDiff.toLocaleString('en-IN')}`
                              : v.priceDiff < 0
                              ? `-₹${Math.abs(v.priceDiff).toLocaleString('en-IN')}`
                              : '—'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-gray-800">{v.stock}</td>

                        {/* Interactive Live "Used In" Button */}
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => setSelectedVariantForProducts(v)}
                            className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-mono font-bold text-[11px] px-3 py-1 rounded-full transition-all cursor-pointer shadow-xs active:scale-95"
                            title={`Click to view all ${prodCount} live products using ${v.name}`}
                          >
                            <Package size={12} />
                            <span>{prodCount} products</span>
                          </button>
                        </td>

                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => toggleEnabled(v.id)}
                            className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${
                              v.enabled ? 'bg-emerald-500' : 'bg-gray-300'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${
                                v.enabled ? 'right-0.5' : 'left-0.5'
                              }`}
                            />
                          </button>
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEdit(v)}
                              className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer text-gray-700"
                              title="Edit Variant"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => setConfirmDelete(v.id)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl cursor-pointer"
                              title="Delete Variant"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}

      </div>

      {/* POPUP MODAL: LIVE PRODUCTS USING VARIANT */}
      {selectedVariantForProducts && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans overflow-y-auto">
          <div className="bg-white rounded-[26px] max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 my-auto max-h-[85vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Package size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-blue-600 font-bold uppercase tracking-wider block">
                    LIVE CATALOG MATCHING
                  </span>
                  <h3 className="font-heading font-black text-lg text-[#111111]">
                    Products Using "{selectedVariantForProducts.name}"
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedVariantForProducts(null)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-500 hover:text-gray-900 cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Products List */}
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
              {activeMatchingProducts.length === 0 ? (
                <div className="text-center py-12 space-y-2 text-gray-500 font-mono text-xs">
                  <Box size={36} className="mx-auto text-gray-300 mb-2" />
                  <p className="font-bold text-gray-700">No Live Products Assigned Yet</p>
                  <p className="text-[11px] text-gray-400">
                    No active product in the catalog currently uses "{selectedVariantForProducts.name}".
                  </p>
                </div>
              ) : (
                activeMatchingProducts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 hover:border-blue-300 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-300 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center text-gray-500 font-bold shrink-0">
                          <Package size={20} />
                        </div>
                      )}

                      <div>
                        <h4 className="font-heading font-black text-xs text-[#111111]">{p.name}</h4>
                        <p className="text-[11px] text-gray-500 font-mono">
                          Category: <strong>{p.category}</strong>
                        </p>
                        {p.specifications?.size && (
                          <span className="text-[9px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono inline-block mt-0.5">
                            Specs: {p.specifications.size}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono">
                      <strong className="text-xs text-[#111111] block">₹{p.price.toLocaleString('en-IN')}</strong>
                      <button
                        onClick={() => {
                          setSelectedVariantForProducts(null);
                          navigate(`/products/${p.id}`);
                        }}
                        className="mt-1 text-[11px] font-bold text-[#F97316] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Eye size={12} /> View Live Product
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-xs font-mono text-gray-500 shrink-0">
              <span>Total Live Products: <strong>{activeMatchingProducts.length}</strong></span>
              <button
                onClick={() => setSelectedVariantForProducts(null)}
                className="bg-[#111111] hover:bg-black text-white font-bold px-5 py-2 rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add / Edit Variant Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-black text-lg">{editingVar ? 'Edit Variant' : 'Add Variant'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Variant Name *</label>
                  <input
                    value={fName}
                    onChange={(e) => setFName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-xl outline-none focus:border-[#F97316]"
                    placeholder="e.g. 5 Feet"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Type *</label>
                  <select
                    value={fType}
                    onChange={(e) => setFType(e.target.value as VariantType)}
                    className="w-full p-2 border border-gray-300 rounded-xl outline-none focus:border-[#F97316]"
                  >
                    {VARIANT_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">SKU</label>
                <input
                  value={fSku}
                  onChange={(e) => setFSku(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-xl outline-none focus:border-[#F97316] font-mono"
                  placeholder="SZ-5FT"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Price Difference (₹)</label>
                  <input
                    type="number"
                    value={fPriceDiff}
                    onChange={(e) => setFPriceDiff(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-xl outline-none focus:border-[#F97316] font-mono"
                    placeholder="0"
                  />
                  <span className="text-[10px] text-gray-400">Negative = discount</span>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Stock</label>
                  <input
                    type="number"
                    value={fStock}
                    onChange={(e) => setFStock(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-xl outline-none focus:border-[#F97316] font-mono"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-800 font-bold rounded-xl cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!fName}
                className="flex-1 py-2.5 bg-[#F97316] disabled:opacity-50 text-white font-bold rounded-xl cursor-pointer text-xs"
              >
                {editingVar ? 'Save Changes' : 'Add Variant'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Generator Modal */}
      {showBulkGen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-black text-lg flex items-center gap-2">
                <Zap size={18} className="text-[#F97316]" /> Bulk Variant Generator
              </h3>
              <button onClick={() => setShowBulkGen(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Variant Type</label>
                <select
                  value={bulkTypes[0] || 'Size'}
                  onChange={(e) => setBulkTypes([e.target.value])}
                  className="w-full p-2 border border-gray-300 rounded-xl outline-none focus:border-[#F97316]"
                >
                  {VARIANT_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Values (comma separated)</label>
                <input
                  value={bulkValues}
                  onChange={(e) => setBulkValues(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-xl outline-none focus:border-[#F97316]"
                  placeholder="e.g. 4 Feet, 5 Feet, 6 Feet, 7 Feet"
                />
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-[11px] text-blue-800">
                Will generate {bulkValues.split(',').filter(Boolean).length} variants automatically with SKUs.
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowBulkGen(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-800 font-bold rounded-xl cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkGenerate}
                disabled={!bulkValues}
                className="flex-1 py-2.5 bg-[#F97316] disabled:opacity-50 text-white font-bold rounded-xl cursor-pointer text-xs"
              >
                Generate Variants
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
            <AlertTriangle size={36} className="mx-auto text-red-500" />
            <h3 className="font-heading font-black text-lg">Delete Variant?</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 bg-gray-100 font-bold rounded-xl cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setVariants((p) => p.filter((v) => v.id !== confirmDelete));
                  setConfirmDelete(null);
                }}
                className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl cursor-pointer text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminVariantsPage;
