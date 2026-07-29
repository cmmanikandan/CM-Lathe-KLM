import React, { useState, useRef } from 'react';
import { uploadToCloudinary } from '../../../services/cloudinaryService';
import {
  Image,
  Video,
  Upload,
  Trash2,
  Star,
  Eye,
  EyeOff,
  Search,
  Download,
  X,
  Plus,
  Check,
  Loader2,
  Film,
  Grid3x3,
  List,
  Tag,
  AlertTriangle,
} from 'lucide-react';

type MediaItem = {
  id: string;
  url: string;
  type: 'Image' | 'Video';
  title: string;
  tags: string[];
  category: 'Products' | 'Workshop' | 'Installation' | 'Completed Works' | 'Before & After' | 'Team';
  featured: boolean;
  visible: boolean;
  uploadedAt: string;
  size?: string;
};

const DEMO_MEDIA: MediaItem[] = [
  { id: 'med-1', url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80', type: 'Image', title: 'Compound Gate - Completed Installation', tags: ['gate', 'installation', 'heavy duty'], category: 'Completed Works', featured: true, visible: true, uploadedAt: '2026-07-25', size: '1.2 MB' },
  { id: 'med-2', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80', type: 'Image', title: 'Workshop MS Fabrication', tags: ['workshop', 'fabrication', 'ms steel'], category: 'Workshop', featured: false, visible: true, uploadedAt: '2026-07-22', size: '0.9 MB' },
  { id: 'med-3', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80', type: 'Image', title: 'Window Grill - Standard Safety', tags: ['grill', 'window', 'safety'], category: 'Products', featured: true, visible: true, uploadedAt: '2026-07-20', size: '1.5 MB' },
  { id: 'med-4', url: 'https://images.unsplash.com/photo-1565688534245-05d6b5be184a?auto=format&fit=crop&w=800&q=80', type: 'Image', title: 'Tractor Cultivator - Ready', tags: ['tractor', 'agricultural', 'cultivator'], category: 'Products', featured: false, visible: true, uploadedAt: '2026-07-18', size: '0.7 MB' },
  { id: 'med-5', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80', type: 'Image', title: 'Before Installation - Client Site', tags: ['before', 'site', 'client'], category: 'Before & After', featured: false, visible: true, uploadedAt: '2026-07-15', size: '1.1 MB' },
  { id: 'med-6', url: 'https://images.unsplash.com/photo-1565688534245-05d6b5be184a?auto=format&fit=crop&w=800&q=80', type: 'Image', title: 'After Installation - Client Site', tags: ['after', 'completed', 'client'], category: 'Before & After', featured: false, visible: false, uploadedAt: '2026-07-15', size: '1.0 MB' },
];

const CATEGORIES: MediaItem['category'][] = ['Products', 'Workshop', 'Installation', 'Completed Works', 'Before & After', 'Team'];

export const AdminMediaGalleryPage: React.FC = () => {
  const [media, setMedia] = useState<MediaItem[]>(DEMO_MEDIA);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); };

  const filtered = media.filter(m => {
    const matchS = m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchC = filterCat === 'All' || m.category === filterCat;
    return matchS && matchC;
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        let url: string;
        if (typeof uploadToCloudinary === 'function') {
          url = await uploadToCloudinary(file);
        } else {
          url = URL.createObjectURL(file);
        }
        const newItem: MediaItem = {
          id: `med-${Date.now()}-${i}`,
          url,
          type: file.type.startsWith('video') ? 'Video' : 'Image',
          title: file.name.replace(/\.[^.]+$/, ''),
          tags: [],
          category: 'Products',
          featured: false,
          visible: true,
          uploadedAt: new Date().toISOString().split('T')[0],
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        };
        setMedia(prev => [newItem, ...prev]);
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
    setUploading(false);
    showToast(`${files.length} file(s) uploaded successfully`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleFeature = (id: string) => setMedia(prev => prev.map(m => m.id === id ? { ...m, featured: !m.featured } : m));
  const toggleVisible = (id: string) => setMedia(prev => prev.map(m => m.id === id ? { ...m, visible: !m.visible } : m));
  const deleteItem = (id: string) => setMedia(prev => prev.filter(m => m.id !== id));
  const bulkDelete = () => { setMedia(prev => prev.filter(m => !selectedIds.includes(m.id))); setSelectedIds([]); setConfirmBulkDelete(false); };
  const toggleSelect = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] pb-24 font-sans">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-[999] bg-emerald-600 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2">
          <Check size={15} /> {toastMsg}
        </div>
      )}

      <div className="bg-[#111111] text-white py-8 px-4 sm:px-6 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[#F97316] font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
              <Image size={16} /> PRODUCT CATALOG • MEDIA GALLERY
            </span>
            <h1 className="font-heading font-black text-2xl text-white mt-1">Workshop Media Gallery</h1>
          </div>
          <div className="flex gap-2">
            <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" onChange={handleUpload} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()}
              className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer">
              {uploading ? <><Loader2 size={14} className="animate-spin" /> {uploadProgress}%</> : <><Upload size={14} /> Upload Media</>}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Media', value: media.length },
            { label: 'Images', value: media.filter(m => m.type === 'Image').length },
            { label: 'Videos', value: media.filter(m => m.type === 'Video').length },
            { label: 'Featured', value: media.filter(m => m.featured).length },
          ].map(s => (
            <div key={s.label} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-[10px] font-mono text-gray-500 font-bold uppercase block">{s.label}</span>
              <span className="font-heading font-black text-2xl text-[#111111] block mt-0.5">{s.value}</span>
            </div>
          ))}
        </div>

        {/* Search + Filter + View Toggle */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search media, tags..."
              className="w-full bg-gray-50 text-xs p-3 pl-10 rounded-xl border border-gray-300 outline-none focus:border-[#F97316] font-medium" />
          </div>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="bg-gray-50 text-xs p-3 rounded-xl border border-gray-300 outline-none focus:border-[#F97316] font-mono font-bold">
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg cursor-pointer ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}><Grid3x3 size={15} /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg cursor-pointer ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}><List size={15} /></button>
          </div>
          {selectedIds.length > 0 && (
            <button onClick={() => setConfirmBulkDelete(true)} className="bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-xl cursor-pointer flex items-center gap-1">
              <Trash2 size={12} /> Delete {selectedIds.length}
            </button>
          )}
        </div>

        {/* Media Grid */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered.map(m => (
              <div key={m.id}
                className={`bg-white rounded-2xl border overflow-hidden group relative cursor-pointer ${selectedIds.includes(m.id) ? 'border-[#F97316] ring-2 ring-[#F97316]/30' : 'border-gray-200'}`}
                onClick={() => toggleSelect(m.id)}>
                <div className="relative aspect-square overflow-hidden">
                  {m.type === 'Video' ? (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                      <Film size={24} className="text-white" />
                    </div>
                  ) : (
                    <img src={m.url} alt={m.title} className="w-full h-full object-contain p-1 bg-gray-100 group-hover:scale-105 transition-transform duration-300" />
                  )}
                  {!m.visible && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><EyeOff size={20} className="text-white/70" /></div>}
                  {m.featured && <div className="absolute top-2 left-2"><Star size={14} className="text-[#F97316] fill-[#F97316]" /></div>}
                  {selectedIds.includes(m.id) && <div className="absolute top-2 right-2 bg-[#F97316] rounded-full p-0.5"><Check size={12} className="text-white" /></div>}
                </div>
                <div className="p-2 space-y-1">
                  <p className="text-[10px] font-bold text-[#111111] truncate">{m.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-gray-400">{m.category}</span>
                    <div className="flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); toggleFeature(m.id); }} className="p-0.5 hover:text-[#F97316] transition-colors cursor-pointer" title="Feature">
                        <Star size={11} className={m.featured ? 'text-[#F97316] fill-[#F97316]' : 'text-gray-300'} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); toggleVisible(m.id); }} className="p-0.5 hover:text-blue-500 transition-colors cursor-pointer" title="Visibility">
                        {m.visible ? <Eye size={11} className="text-blue-400" /> : <EyeOff size={11} className="text-gray-300" />}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setPreviewItem(m); }} className="p-0.5 hover:text-purple-500 transition-colors cursor-pointer" title="Preview">
                        <Eye size={11} className="text-gray-400" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteItem(m.id); }} className="p-0.5 hover:text-red-500 transition-colors cursor-pointer" title="Delete">
                        <Trash2 size={11} className="text-gray-300" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-sans">
                <thead>
                  <tr className="bg-[#111111] text-white font-heading uppercase text-[10px]">
                    <th className="p-3 w-8"></th>
                    <th className="p-3 text-left">Media</th>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-left">Tags</th>
                    <th className="p-3 text-center">Featured</th>
                    <th className="p-3 text-center">Visible</th>
                    <th className="p-3 text-left">Uploaded</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(m => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="p-3">
                        <input type="checkbox" checked={selectedIds.includes(m.id)} onChange={() => toggleSelect(m.id)} className="rounded cursor-pointer" />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <img src={m.url} alt={m.title} className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0" />
                          <div>
                            <span className="font-bold text-[#111111] block">{m.title}</span>
                            <span className="text-[10px] font-mono text-gray-400">{m.type} • {m.size}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-gray-500">{m.category}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {m.tags.slice(0, 2).map(t => <span key={t} className="bg-gray-100 text-gray-600 text-[9px] font-mono px-1.5 py-0.5 rounded-full">{t}</span>)}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <button onClick={() => toggleFeature(m.id)} className="cursor-pointer">
                          <Star size={14} className={m.featured ? 'text-[#F97316] fill-[#F97316]' : 'text-gray-300'} />
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button onClick={() => toggleVisible(m.id)} className="cursor-pointer">
                          {m.visible ? <Eye size={14} className="text-blue-500" /> : <EyeOff size={14} className="text-gray-300" />}
                        </button>
                      </td>
                      <td className="p-3 font-mono text-gray-400">{m.uploadedAt}</td>
                      <td className="p-3">
                        <div className="flex justify-end gap-1.5">
                          <button onClick={() => deleteItem(m.id)} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer"><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewItem(null)}>
          <div className="max-w-2xl w-full space-y-3" onClick={e => e.stopPropagation()}>
            <img src={previewItem.url} alt={previewItem.title} className="w-full rounded-2xl object-contain max-h-[70vh]" />
            <div className="bg-white rounded-2xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-heading font-black text-base">{previewItem.title}</h3>
                  <span className="text-xs text-gray-400">{previewItem.category} • {previewItem.uploadedAt}</span>
                </div>
                <button onClick={() => setPreviewItem(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer"><X size={20} /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirm */}
      {confirmBulkDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
            <AlertTriangle size={36} className="mx-auto text-red-500" />
            <h3 className="font-heading font-black text-lg">Delete {selectedIds.length} Items?</h3>
            <div className="flex gap-3">
              <button onClick={() => setConfirmBulkDelete(false)} className="flex-1 py-2.5 bg-gray-100 font-bold rounded-xl cursor-pointer text-xs">Cancel</button>
              <button onClick={bulkDelete} className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl cursor-pointer text-xs">Delete All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMediaGalleryPage;
