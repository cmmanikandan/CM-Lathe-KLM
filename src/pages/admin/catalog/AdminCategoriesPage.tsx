import React, { useState, useMemo } from 'react';
import { useProducts } from '../../../context/ProductContext';
import {
  Tag,
  Plus,
  Edit3,
  Trash2,
  Search,
  ChevronRight,
  Package,
  TrendingUp,
  BarChart3,
  Eye,
  EyeOff,
  Check,
  X,
  GripVertical,
  FolderOpen,
  Layers,
  AlertTriangle,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  status: 'Active' | 'Disabled';
  displayOrder: number;
  subCategories: string[];
  productCount?: number;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Windows Grill', slug: 'windows-grill', description: 'Steel window grills and safety grids', icon: '🪟', status: 'Active', displayOrder: 1, subCategories: ['Standard Safety', 'Designer', 'Sliding', 'Fixed'], productCount: 12 },
  { id: 'cat-2', name: 'Gates', slug: 'gates', description: 'Fabricated compound and sliding gates', icon: '🚪', status: 'Active', displayOrder: 2, subCategories: ['Compound Gates', 'Sliding Gates', 'Swing Gates', 'Auto Gates'], productCount: 8 },
  { id: 'cat-3', name: 'Doors', slug: 'doors', description: 'Steel security doors', icon: '🚪', status: 'Active', displayOrder: 3, subCategories: ['Security Doors', 'MS Doors', 'Steel Frames'], productCount: 6 },
  { id: 'cat-4', name: 'Tractor Kalappai', slug: 'tractor-kalappai', description: 'Agricultural tilling implements', icon: '🚜', status: 'Active', displayOrder: 4, subCategories: ['Cultivators', 'Ploughs', 'Harrows'], productCount: 15 },
  { id: 'cat-5', name: 'Machine Works', slug: 'machine-works', description: 'Lathe turning and machining services', icon: '⚙️', status: 'Active', displayOrder: 5, subCategories: ['Lathe Turning', 'Welding', 'Drilling'], productCount: 9 },
  { id: 'cat-6', name: 'Steel Furniture', slug: 'steel-furniture', description: 'Steel chairs, tables, racks', icon: '🪑', status: 'Active', displayOrder: 6, subCategories: ['Chairs', 'Tables', 'Racks', 'Shelves'], productCount: 7 },
  { id: 'cat-7', name: 'Custom Fabrication', slug: 'custom-fabrication', description: 'Custom steel fabrication to order', icon: '🔧', status: 'Active', displayOrder: 7, subCategories: ['Custom Orders', 'Prototype'], productCount: 4 },
];

export const AdminCategoriesPage: React.FC = () => {
  const { products } = useProducts();

  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'categories' | 'subcategories'>('categories');

  // Form state
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIcon, setFormIcon] = useState('📦');
  const [formStatus, setFormStatus] = useState<'Active' | 'Disabled'>('Active');
  const [formSubCats, setFormSubCats] = useState('');

  const filtered = useMemo(() =>
    categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [categories, searchQuery]
  );

  const totalProducts = categories.reduce((s, c) => s + (c.productCount || 0), 0);

  const openAdd = () => {
    setEditingCat(null);
    setFormName(''); setFormSlug(''); setFormDescription('');
    setFormIcon('📦'); setFormStatus('Active'); setFormSubCats('');
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCat(cat);
    setFormName(cat.name); setFormSlug(cat.slug); setFormDescription(cat.description);
    setFormIcon(cat.icon); setFormStatus(cat.status); setFormSubCats(cat.subCategories.join(', '));
    setShowModal(true);
  };

  const handleSave = () => {
    const subCatsArr = formSubCats.split(',').map(s => s.trim()).filter(Boolean);
    if (editingCat) {
      setCategories(prev => prev.map(c => c.id === editingCat.id
        ? { ...c, name: formName, slug: formSlug, description: formDescription, icon: formIcon, status: formStatus, subCategories: subCatsArr }
        : c));
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`, name: formName, slug: formSlug || formName.toLowerCase().replace(/\s+/g, '-'),
        description: formDescription, icon: formIcon, status: formStatus,
        displayOrder: categories.length + 1, subCategories: subCatsArr, productCount: 0,
      };
      setCategories(prev => [...prev, newCat]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setConfirmDelete(null);
  };

  const toggleStatus = (id: string) => {
    setCategories(prev => prev.map(c => c.id === id
      ? { ...c, status: c.status === 'Active' ? 'Disabled' : 'Active' }
      : c));
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] pb-24 font-sans">

      {/* Top Header */}
      <div className="bg-[#111111] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[#F97316] font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
              <Tag size={16} /> PRODUCT CATALOG • CATEGORIES
            </span>
            <h1 className="font-heading font-black text-2xl text-white mt-1">
              Categories & Subcategories
            </h1>
          </div>
          <button
            onClick={openAdd}
            className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={15} /> Add Category
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Categories', value: categories.length, color: 'text-[#111111]' },
            { label: 'Active Categories', value: categories.filter(c => c.status === 'Active').length, color: 'text-emerald-700' },
            { label: 'Total Products', value: totalProducts, color: 'text-blue-700' },
            { label: 'Disabled', value: categories.filter(c => c.status === 'Disabled').length, color: 'text-red-600' },
          ].map(s => (
            <div key={s.label} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[10px] font-mono text-gray-500 font-bold uppercase block">{s.label}</span>
              <span className={`font-heading font-black text-2xl ${s.color} block mt-0.5`}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 text-xs p-3 pl-10 rounded-xl border border-gray-300 outline-none focus:border-[#F97316] font-medium"
            />
          </div>
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-sans">
              <thead>
                <tr className="bg-[#111111] text-white font-heading uppercase text-[10px]">
                  <th className="p-3 text-left w-8"></th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Subcategories</th>
                  <th className="p-3 text-center">Products</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Order</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(cat => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-gray-300">
                      <GripVertical size={16} />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{cat.icon}</span>
                        <div>
                          <span className="font-heading font-bold text-[#111111] block">{cat.name}</span>
                          <span className="text-[10px] font-mono text-gray-400">{cat.slug}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5 max-w-xs truncate">{cat.description}</p>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {cat.subCategories.map(sub => (
                          <span key={sub} className="bg-gray-100 text-gray-700 font-mono text-[10px] px-2 py-0.5 rounded-full">{sub}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="font-heading font-bold text-sm text-[#F97316]">{cat.productCount || 0}</span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => toggleStatus(cat.id)}
                        className={`px-2 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                          cat.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {cat.status}
                      </button>
                    </td>
                    <td className="p-3 text-center font-mono text-gray-500">#{cat.displayOrder}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openEdit(cat)} className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer" title="Edit">
                          <Edit3 size={13} />
                        </button>
                        <button onClick={() => setConfirmDelete(cat.id)} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer" title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
              <h3 className="font-heading font-black text-lg text-[#111111]">
                {editingCat ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer"><X size={20} /></button>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Category Name *</label>
                  <input value={formName} onChange={e => setFormName(e.target.value)} className="w-full p-2 border border-gray-300 rounded-xl outline-none focus:border-[#F97316] text-sm" placeholder="e.g. Windows Grill" />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Icon (emoji)</label>
                  <input value={formIcon} onChange={e => setFormIcon(e.target.value)} className="w-full p-2 border border-gray-300 rounded-xl outline-none text-xl" placeholder="📦" />
                </div>
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">URL Slug</label>
                <input value={formSlug} onChange={e => setFormSlug(e.target.value)} className="w-full p-2 border border-gray-300 rounded-xl outline-none focus:border-[#F97316] font-mono" placeholder="windows-grill" />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Description</label>
                <textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} className="w-full p-2 border border-gray-300 rounded-xl outline-none focus:border-[#F97316] resize-none h-16" placeholder="Short description..." />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Subcategories (comma separated)</label>
                <input value={formSubCats} onChange={e => setFormSubCats(e.target.value)} className="w-full p-2 border border-gray-300 rounded-xl outline-none focus:border-[#F97316]" placeholder="Standard, Designer, Heavy Duty" />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">Status</label>
                <div className="flex gap-2">
                  {(['Active', 'Disabled'] as const).map(s => (
                    <button key={s} type="button" onClick={() => setFormStatus(s)}
                      className={`px-4 py-1.5 rounded-xl font-bold cursor-pointer ${formStatus === s ? 'bg-[#111111] text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl cursor-pointer text-xs">Cancel</button>
              <button onClick={handleSave} disabled={!formName} className="flex-1 py-2.5 bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-50 text-white font-bold rounded-xl cursor-pointer text-xs">
                {editingCat ? 'Save Changes' : 'Add Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
            <AlertTriangle size={36} className="mx-auto text-red-500" />
            <h3 className="font-heading font-black text-lg">Delete Category?</h3>
            <p className="text-xs text-gray-500">This will remove the category. Products in this category will be unassigned.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-800 font-bold rounded-xl cursor-pointer text-xs">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl cursor-pointer text-xs">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
