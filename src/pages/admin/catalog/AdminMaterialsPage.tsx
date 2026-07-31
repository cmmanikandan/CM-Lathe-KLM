import React, { useState, useMemo } from 'react';
import {
  Wrench,
  Plus,
  Edit3,
  Trash2,
  Search,
  X,
  AlertTriangle,
  Package,
  Layers,
  Palette,
  Ruler,
  Factory,
  Check,
} from 'lucide-react';

type MaterialType = {
  id: string;
  name: string;
  type: 'Brand' | 'Steel Grade' | 'Material' | 'Finish' | 'Color' | 'Thickness' | 'Pipe Type' | 'Rod Type';
  description?: string;
  supplier?: string;
  costPerUnit?: number;
  unit?: string;
  availability: 'In Stock' | 'Low' | 'Out of Stock';
  usageCount: number;
  status: 'Active' | 'Disabled';
};

const ICON_MAP: Record<string, React.FC<any>> = {
  Brand: Factory,
  'Steel Grade': Layers,
  Material: Package,
  Finish: Palette,
  Color: Palette,
  Thickness: Ruler,
  'Pipe Type': Wrench,
  'Rod Type': Wrench,
};

const INITIAL_MATERIALS: MaterialType[] = [
  { id: 'm-1', name: 'MANIKANDAN LATHE', type: 'Brand', description: 'Own brand fabrication', availability: 'In Stock', usageCount: 120, status: 'Active' },
  { id: 'm-2', name: 'MS Grade A1', type: 'Steel Grade', description: 'Mild steel grade A1 structural', supplier: 'JSW Steel', costPerUnit: 75, unit: 'kg', availability: 'In Stock', usageCount: 89, status: 'Active' },
  { id: 'm-3', name: 'High Tensile Steel', type: 'Steel Grade', description: 'High tensile strength alloy', supplier: 'TATA Steel', costPerUnit: 110, unit: 'kg', availability: 'In Stock', usageCount: 45, status: 'Active' },
  { id: 'm-4', name: 'Mild Steel (MS)', type: 'Material', availability: 'In Stock', usageCount: 95, status: 'Active' },
  { id: 'm-5', name: 'Stainless Steel 304', type: 'Material', costPerUnit: 220, unit: 'kg', availability: 'In Stock', usageCount: 32, status: 'Active' },
  { id: 'm-6', name: 'Powder Coated', type: 'Finish', availability: 'In Stock', usageCount: 78, status: 'Active' },
  { id: 'm-7', name: 'Galvanized', type: 'Finish', availability: 'In Stock', usageCount: 41, status: 'Active' },
  { id: 'm-8', name: 'Industrial Black', type: 'Color', availability: 'In Stock', usageCount: 65, status: 'Active' },
  { id: 'm-9', name: 'Silver Chrome', type: 'Color', availability: 'In Stock', usageCount: 28, status: 'Active' },
  { id: 'm-10', name: '12mm', type: 'Thickness', unit: 'mm', availability: 'In Stock', usageCount: 42, status: 'Active' },
  { id: 'm-11', name: '16mm', type: 'Thickness', unit: 'mm', availability: 'In Stock', usageCount: 38, status: 'Active' },
  { id: 'm-12', name: 'Square Hollow Section (SHS)', type: 'Pipe Type', availability: 'In Stock', usageCount: 55, status: 'Active' },
  { id: 'm-13', name: 'Rectangular Hollow Section (RHS)', type: 'Pipe Type', availability: 'In Stock', usageCount: 48, status: 'Active' },
  { id: 'm-14', name: 'MS Round Rod', type: 'Rod Type', availability: 'Low', usageCount: 22, status: 'Active' },
  { id: 'm-15', name: 'MS Flat Rod', type: 'Rod Type', availability: 'In Stock', usageCount: 19, status: 'Active' },
];

const TYPES = ['Brand', 'Steel Grade', 'Material', 'Finish', 'Color', 'Thickness', 'Pipe Type', 'Rod Type'] as const;

export const AdminMaterialsPage: React.FC = () => {
  const [materials, setMaterials] = useState<MaterialType[]>(INITIAL_MATERIALS);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [showModal, setShowModal] = useState(false);
  const [editingMat, setEditingMat] = useState<MaterialType | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Form
  const [fName, setFName] = useState('');
  const [fType, setFType] = useState<MaterialType['type']>('Material');
  const [fDesc, setFDesc] = useState('');
  const [fSupplier, setFSupplier] = useState('');
  const [fCost, setFCost] = useState(0);
  const [fUnit, setFUnit] = useState('kg');
  const [fAvail, setFAvail] = useState<MaterialType['availability']>('In Stock');

  const filtered = useMemo(() =>
    materials.filter(m => {
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || (m.supplier || '').toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === 'All' || m.type === filterType;
      return matchSearch && matchType;
    }),
    [materials, search, filterType]
  );

  const openAdd = () => {
    setEditingMat(null);
    setFName(''); setFType('Material'); setFDesc(''); setFSupplier(''); setFCost(0); setFUnit('kg'); setFAvail('In Stock');
    setShowModal(true);
  };

  const openEdit = (m: MaterialType) => {
    setEditingMat(m);
    setFName(m.name); setFType(m.type); setFDesc(m.description || ''); setFSupplier(m.supplier || '');
    setFCost(m.costPerUnit || 0); setFUnit(m.unit || 'kg'); setFAvail(m.availability);
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingMat) {
      setMaterials(prev => prev.map(m => m.id === editingMat.id
        ? { ...m, name: fName, type: fType, description: fDesc, supplier: fSupplier, costPerUnit: fCost, unit: fUnit, availability: fAvail }
        : m));
    } else {
      setMaterials(prev => [...prev, {
        id: `m-${Date.now()}`, name: fName, type: fType, description: fDesc, supplier: fSupplier,
        costPerUnit: fCost, unit: fUnit, availability: fAvail, usageCount: 0, status: 'Active',
      }]);
    }
    setShowModal(false);
  };

  const availColor = (a: string) =>
    a === 'In Stock' ? 'bg-emerald-100 text-emerald-800' :
    a === 'Low' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-700';

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] pb-24 font-sans">
      <div className="bg-[#111111] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[#F97316] font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
              <Wrench size={16} /> PRODUCT CATALOG • MATERIALS & BRANDS
            </span>
            <h1 className="font-heading font-black text-2xl text-white mt-1">Brands & Materials Library</h1>
          </div>
          <button onClick={openAdd} className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer">
            <Plus size={15} /> Add Entry
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {TYPES.map(t => (
            <div key={t} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[10px] font-mono text-gray-500 font-bold uppercase block">{t}</span>
              <span className="font-heading font-black text-2xl text-[#111111] block mt-0.5">
                {materials.filter(m => m.type === t).length}
              </span>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search materials, brands, suppliers..."
              className="w-full bg-gray-50 text-xs p-3 pl-10 rounded-xl border border-gray-300 outline-none focus:border-[#F97316] font-medium" />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="bg-gray-50 text-xs p-3 rounded-xl border border-gray-300 outline-none focus:border-[#F97316] font-mono font-bold">
            <option value="All">All Types</option>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-sans">
              <thead>
                <tr className="bg-[#111111] text-white font-heading uppercase text-[10px]">
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Supplier</th>
                  <th className="p-3 text-right">Cost</th>
                  <th className="p-3 text-center">Availability</th>
                  <th className="p-3 text-center">Usage</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(m => {
                  const Icon = ICON_MAP[m.type] || Package;
                  return (
                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-gray-100 rounded-lg"><Icon size={13} className="text-gray-500" /></div>
                          <div>
                            <span className="font-heading font-bold text-[#111111] block">{m.name}</span>
                            {m.description && <span className="text-[10px] text-gray-400">{m.description}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="bg-blue-100 text-blue-800 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full">{m.type}</span>
                      </td>
                      <td className="p-3 text-gray-500">{m.supplier || '—'}</td>
                      <td className="p-3 text-right font-mono">
                        {m.costPerUnit ? `₹${m.costPerUnit}/${m.unit}` : '—'}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${availColor(m.availability)}`}>{m.availability}</span>
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-[#F97316]">{m.usageCount}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openEdit(m)} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer"><Edit3 size={13} /></button>
                          <button onClick={() => setConfirmDelete(m.id)} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-black text-lg">{editingMat ? 'Edit Entry' : 'Add Material / Brand'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer"><X size={20} /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Name *</label>
                  <input value={fName} onChange={e => setFName(e.target.value)} className="w-full p-2 border border-gray-300 rounded-xl outline-none focus:border-[#F97316]" placeholder="e.g. MS Grade A1" />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Type *</label>
                  <select value={fType} onChange={e => setFType(e.target.value as any)} className="w-full p-2 border border-gray-300 rounded-xl outline-none focus:border-[#F97316]">
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Description</label>
                <input value={fDesc} onChange={e => setFDesc(e.target.value)} className="w-full p-2 border border-gray-300 rounded-xl outline-none focus:border-[#F97316]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Supplier</label>
                  <input value={fSupplier} onChange={e => setFSupplier(e.target.value)} className="w-full p-2 border border-gray-300 rounded-xl outline-none focus:border-[#F97316]" />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Availability</label>
                  <select value={fAvail} onChange={e => setFAvail(e.target.value as any)} className="w-full p-2 border border-gray-300 rounded-xl outline-none focus:border-[#F97316]">
                    {['In Stock', 'Low', 'Out of Stock'].map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Cost Per Unit (₹)</label>
                  <input type="number" value={fCost} onChange={e => setFCost(Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded-xl outline-none focus:border-[#F97316]" />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Unit</label>
                  <input value={fUnit} onChange={e => setFUnit(e.target.value)} className="w-full p-2 border border-gray-300 rounded-xl outline-none focus:border-[#F97316]" placeholder="kg, meter, pcs..." />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-800 font-bold rounded-xl cursor-pointer text-xs">Cancel</button>
              <button onClick={handleSave} disabled={!fName} className="flex-1 py-2.5 bg-[#F97316] disabled:opacity-50 text-white font-bold rounded-xl cursor-pointer text-xs">
                {editingMat ? 'Save Changes' : 'Add Entry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
            <AlertTriangle size={36} className="mx-auto text-red-500" />
            <h3 className="font-heading font-black text-lg">Delete Entry?</h3>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 bg-gray-100 font-bold rounded-xl cursor-pointer text-xs">Cancel</button>
              <button onClick={() => { setMaterials(p => p.filter(m => m.id !== confirmDelete)); setConfirmDelete(null); }} className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl cursor-pointer text-xs">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMaterialsPage;
