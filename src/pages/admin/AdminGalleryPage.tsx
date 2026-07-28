import React, { useState } from 'react';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import {
  Image as ImageIcon,
  Video,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Upload,
  CheckCircle2,
  Sparkles,
  Layers,
  HardDrive
} from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  description: string;
  isFeatured: boolean;
  isHidden: boolean;
  uploadDate: string;
}

export const AdminGalleryPage: React.FC = () => {
  const [galleryList, setGalleryList] = useState<GalleryItem[]>([
    { id: 'gal-1', title: '9-Tine Hardened Kalappai Assembly', category: 'Kalappai', mediaType: 'image', mediaUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80', description: 'Lathe machined cultivator tines forged for red soil.', isFeatured: true, isHidden: false, uploadDate: '2026-07-25' },
    { id: 'gal-2', title: 'CNC Laser Cut SS 304 Main Safety Gate', category: 'Steel Gates', mediaType: 'image', mediaUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', description: 'Architectural safety gate with heavy bearing hinges.', isFeatured: true, isHidden: false, uploadDate: '2026-07-22' },
    { id: 'gal-3', title: 'Precision Lathe Turning Machine Shafts', category: 'Lathe Works', mediaType: 'image', mediaUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80', description: 'Shaft grinding and bearing bush fitting.', isFeatured: false, isHidden: false, uploadDate: '2026-07-18' }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Steel Gates');
  const [newMediaType, setNewMediaType] = useState<'image' | 'video'>('image');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const categories = ['All', 'Steel Gates', 'Windows Grill', 'Steel Doors', 'Kalappai', 'Lathe Works', 'Fabrication', 'Machine Works'];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setNewMediaUrl(url);
    } catch (err) {
      console.error(err);
      alert('Upload failed. Using preview URL.');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newMediaUrl) {
      alert('Title and Media File/URL are required.');
      return;
    }

    const item: GalleryItem = {
      id: `gal-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      mediaType: newMediaType,
      mediaUrl: newMediaUrl,
      description: newDescription,
      isFeatured,
      isHidden: false,
      uploadDate: new Date().toISOString().split('T')[0]
    };

    setGalleryList([item, ...galleryList]);
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      setShowUploadModal(false);
      setNewTitle('');
      setNewMediaUrl('');
      setNewDescription('');
    }, 1500);
  };

  const toggleHide = (id: string) => {
    setGalleryList((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isHidden: !i.isHidden } : i))
    );
  };

  const deleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this gallery item?')) {
      setGalleryList((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const filteredItems = galleryList.filter((item) => {
    const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 font-sans max-w-7xl mx-auto">
      
      {/* Header & Stats Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-[#111111] flex items-center gap-2">
            <ImageIcon size={24} className="text-[#F97316]" /> GALLERY MANAGEMENT
          </h1>
          <p className="text-xs text-gray-500">Upload photos/videos of completed works, manage categories & homepage showcase</p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-5 py-3 rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 shrink-0"
        >
          <Plus size={16} /> Upload New Gallery Work
        </button>
      </div>

      {/* Analytics Statistics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-gray-400 text-[11px] font-heading font-bold uppercase block">Total Gallery Media</span>
          <p className="font-heading font-black text-2xl text-[#111111]">{galleryList.length}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-gray-400 text-[11px] font-heading font-bold uppercase block">Featured Showcase</span>
          <p className="font-heading font-black text-2xl text-[#F97316]">
            {galleryList.filter((i) => i.isFeatured).length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-gray-400 text-[11px] font-heading font-bold uppercase block">Cloud Storage</span>
          <p className="font-heading font-black text-2xl text-green-600">Cloudinary</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-gray-400 text-[11px] font-heading font-bold uppercase block">Categories</span>
          <p className="font-heading font-black text-2xl text-purple-600">{categories.length - 1}</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search gallery..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 text-xs pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none font-bold"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-heading font-extrabold shrink-0 border ${
                categoryFilter === cat ? 'bg-[#111111] text-white border-[#111111]' : 'bg-gray-50 text-gray-700 border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-2xl border overflow-hidden shadow-xs space-y-3 p-3 transition-all ${
              item.isHidden ? 'opacity-50 border-dashed border-gray-300' : 'border-gray-200'
            }`}
          >
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
              <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover" />
              
              <div className="absolute top-2 left-2 flex gap-1">
                <span className="bg-black/70 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                  {item.category}
                </span>
                {item.isFeatured && (
                  <span className="bg-[#F97316] text-white text-[9px] font-black px-2 py-0.5 rounded">
                    FEATURED
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-heading font-extrabold text-xs text-[#111111] line-clamp-1">{item.title}</h3>
              <p className="text-[11px] text-gray-500 line-clamp-2">{item.description}</p>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-xs">
              <button
                onClick={() => toggleHide(item.id)}
                className="text-gray-600 hover:text-black font-bold flex items-center gap-1"
              >
                {item.isHidden ? <EyeOff size={14} className="text-amber-600" /> : <Eye size={14} className="text-green-600" />}
                {item.isHidden ? 'Hidden' : 'Visible'}
              </button>

              <button
                onClick={() => deleteItem(item.id)}
                className="text-red-600 hover:text-red-800 font-bold flex items-center gap-1"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* UPLOAD GALLERY ITEM MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] max-w-lg w-full p-6 space-y-4 shadow-2xl border border-gray-200">
            {successMsg ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 size={40} className="mx-auto text-green-600" />
                <h3 className="font-heading font-black text-lg text-[#111111]">Gallery Work Published!</h3>
                <p className="text-xs text-gray-500">Live on public website and customer gallery.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <h3 className="font-heading font-black text-base text-[#111111]">UPLOAD GALLERY MEDIA</h3>
                  <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-black">✕</button>
                </div>

                <form onSubmit={handleCreateGalleryItem} className="space-y-3 text-xs font-sans">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Work Title *</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. 9-Tine Kalappai for Kallimandhayam Farmer"
                      className="w-full bg-gray-100 p-2.5 rounded-xl border border-gray-300 font-bold outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Category *</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full bg-gray-100 p-2.5 rounded-xl border border-gray-300 font-bold outline-none"
                      >
                        {categories.filter((c) => c !== 'All').map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1">Media Type</label>
                      <select
                        value={newMediaType}
                        onChange={(e: any) => setNewMediaType(e.target.value)}
                        className="w-full bg-gray-100 p-2.5 rounded-xl border border-gray-300 font-bold outline-none"
                      >
                        <option value="image">Photo Image</option>
                        <option value="video">Short Video</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Upload File (Cloudinary) *</label>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="w-full bg-gray-100 p-2 rounded-xl border border-gray-300 text-xs"
                    />
                    {uploading && <p className="text-[#F97316] font-bold text-[11px] animate-pulse mt-1">Uploading to Cloudinary...</p>}
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Direct Image URL (Alternative)</label>
                    <input
                      type="url"
                      value={newMediaUrl}
                      onChange={(e) => setNewMediaUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-gray-100 p-2.5 rounded-xl border border-gray-300 font-mono text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Work Description</label>
                    <textarea
                      rows={2}
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Details about fabrication materials, bearings & dimensions..."
                      className="w-full bg-gray-100 p-2.5 rounded-xl border border-gray-300 text-xs outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded accent-[#F97316]"
                    />
                    <label htmlFor="featured" className="font-bold text-gray-700">Feature on Homepage Gallery Preview</label>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs py-3 rounded-xl shadow-md mt-2"
                  >
                    Publish Gallery Media
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
