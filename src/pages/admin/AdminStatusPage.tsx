import React, { useState } from 'react';
import { useStatus } from '../../context/StatusContext';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import { Flame, Plus, Trash2, Eye, Upload, Image as ImageIcon, CheckCircle2, Sparkles, Layers, Sliders } from 'lucide-react';

export const AdminStatusPage: React.FC = () => {
  const { stories, addStory, deleteStory, banners, addBanner, deleteBanner } = useStatus();

  // Page Link Tab State
  const [activeTab, setActiveTab] = useState<'STORIES' | 'BANNERS'>('STORIES');

  // Story Form State
  const [mediaUrl, setMediaUrl] = useState('https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [tag, setTag] = useState<'Offer' | 'Work Progress' | 'Festival Wishes' | 'New Product'>('Work Progress');
  
  const [uploading, setUploading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // Banner Form State
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerTag, setBannerTag] = useState('SPECIAL OFFER');
  const [bannerImage, setBannerImage] = useState('https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1000&q=80');
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerSuccess, setBannerSuccess] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setMediaUrl(url);
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleBannerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setBannerImage(url);
    } catch (err) {
      console.error('Banner upload failed:', err);
    } finally {
      setBannerUploading(false);
    }
  };

  const handlePostStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    addStory(mediaUrl, 'image', title, tag, subtitle);
    setTitle('');
    setSubtitle('');
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleAddBannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle) return;
    addBanner(bannerTitle, bannerSubtitle, bannerTag, bannerImage);
    setBannerTitle('');
    setBannerSubtitle('');
    setBannerSuccess(true);
    setTimeout(() => setBannerSuccess(false), 2500);
  };

  const presetImages = [
    { name: 'Gate Welding', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80' },
    { name: 'Tractor Kalappai', url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80' },
    { name: 'Lathe Machine Turning', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80' },
    { name: 'SS Main Gate', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80' }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] pb-24 font-sans">
      <div className="bg-[#111111] text-white py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-[#F97316] font-heading font-extrabold text-xs uppercase tracking-widest flex items-center gap-1.5">
              <Flame size={16} /> BANNERS & STATUS MANAGEMENT
            </span>
            <h1 className="font-heading font-black text-3xl text-white mt-1">
              HOMEPAGE BANNERS & WORKSHOP STORIES
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* ── TOP TWO PAGE LINK TABS ── */}
        <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-center gap-2 font-heading">
          <button
            onClick={() => setActiveTab('STORIES')}
            className={`flex-1 max-w-xs py-3 px-5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'STORIES'
                ? 'bg-[#F97316] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-black'
            }`}
          >
            <Sparkles size={16} /> Status Stories ({stories.length})
          </button>

          <button
            onClick={() => setActiveTab('BANNERS')}
            className={`flex-1 max-w-xs py-3 px-5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'BANNERS'
                ? 'bg-[#111111] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-black'
            }`}
          >
            <Sliders size={16} className={activeTab === 'BANNERS' ? 'text-[#F97316]' : ''} /> Hero Banners ({banners.length})
          </button>
        </div>
        
        {/* ── TAB 1: STATUS STORIES ── */}
        {activeTab === 'STORIES' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            <div className="bg-white rounded-[26px] border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div>
                  <h3 className="font-heading font-black text-lg text-[#111111] flex items-center gap-2">
                    <Sparkles size={20} className="text-[#F97316]" /> POST NEW WORKSHOP STATUS STORY
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">Upload 24-hour workshop updates, progress photos & offers</p>
                </div>
                <span className="bg-[#F97316]/10 text-[#F97316] text-xs font-mono font-bold px-3 py-1 rounded-full border border-[#F97316]/30">
                  Live for 24 Hours
                </span>
              </div>

              <form onSubmit={handlePostStory} className="space-y-5 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <div className="relative h-40 rounded-xl overflow-hidden bg-white border-2 border-dashed border-gray-300 flex items-center justify-center group">
                    {mediaUrl ? (
                      <img src={mediaUrl} alt="Story Preview" className="w-full h-full object-contain p-2" />
                    ) : (
                      <ImageIcon size={32} className="text-gray-400" />
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-xs font-bold font-mono">
                        Uploading...
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2 space-y-3">
                    <label className="font-bold text-gray-800 block">Select Image File from Device *</label>
                    <div className="flex items-center gap-2">
                      <label className="bg-[#111111] hover:bg-[#F97316] text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-colors inline-flex items-center gap-2 shadow-sm">
                        <Upload size={16} /> Choose Image File
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                      </label>
                    </div>

                    <div className="space-y-1 pt-1">
                      <label className="text-[11px] text-gray-500 font-bold block">Or select factory preset image:</label>
                      <div className="flex flex-wrap gap-2">
                        {presetImages.map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => setMediaUrl(p.url)}
                            className="bg-white hover:bg-gray-100 text-gray-700 text-[10px] font-mono px-2.5 py-1 rounded-lg border border-gray-300 cursor-pointer"
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Story Headline / Announcement Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 🔥 New Heavy Lathe Turning Job Completed Today!"
                    className="w-full bg-gray-100 p-3 rounded-xl border border-gray-300 focus:border-[#F97316] outline-none font-bold text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Category Badge Tag</label>
                    <select
                      value={tag}
                      onChange={(e) => setTag(e.target.value as any)}
                      className="w-full bg-gray-100 p-3 rounded-xl border border-gray-300 outline-none font-bold text-[#F97316]"
                    >
                      <option value="Work Progress">Work Progress</option>
                      <option value="Offer">Offer</option>
                      <option value="Festival Wishes">Festival Wishes</option>
                      <option value="New Product">New Product</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Subtitle (Optional)</label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="Additional details..."
                      className="w-full bg-gray-100 p-3 rounded-xl border border-gray-300 outline-none text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={uploading || !title}
                    className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-6 py-3.5 rounded-xl shadow-lg flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Upload size={16} /> {uploading ? 'Uploading...' : 'Publish Status Story (24h Live)'}
                  </button>

                  {isAdded && <span className="text-xs text-green-600 font-bold flex items-center gap-1"><CheckCircle2 size={16} /> Story Published Live!</span>}
                </div>
              </form>
            </div>

            {/* Existing Active Stories */}
            <div className="space-y-4">
              <h3 className="font-heading font-black text-base text-[#111111]">LIVE ACTIVE STORIES ({stories.length})</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stories.map((s) => (
                  <div key={s.id} className="p-4 bg-white rounded-2xl flex items-center gap-4 border border-gray-200 shadow-xs">
                    <img src={s.mediaUrl} alt={s.title} className="w-16 h-16 object-contain p-1 bg-white rounded-xl shrink-0 border border-gray-300" />
                    <div className="flex-1 text-xs">
                      <span className="bg-[#F97316] text-white text-[9px] font-extrabold px-2 py-0.5 rounded uppercase font-mono">{s.tag}</span>
                      <h4 className="font-bold text-[#111111] mt-1 line-clamp-1">{s.title}</h4>
                      <p className="text-gray-500 font-mono text-[10px] mt-0.5 flex items-center gap-1">
                        <Eye size={12} className="text-[#F97316]" /> {s.seenCount} customer views
                      </p>
                    </div>
                    <button
                      onClick={() => deleteStory(s.id)}
                      className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl shrink-0 transition-colors cursor-pointer"
                      title="Delete story"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: HERO BANNERS ── */}
        {activeTab === 'BANNERS' && (
          <div className="bg-white rounded-[26px] border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <h3 className="font-heading font-black text-lg text-[#111111] flex items-center gap-2">
                  <Sliders size={20} className="text-[#F97316]" /> HOMEPAGE HERO BANNERS
                </h3>
                <p className="text-xs text-gray-500 font-mono">Manage carousel banners shown at top of customer homepage</p>
              </div>

              <span className="bg-orange-100 text-[#F97316] text-xs font-mono font-bold px-3 py-1 rounded-full border border-orange-200">
                {banners.length} Active Banners
              </span>
            </div>

            {/* Add Banner Form */}
            <form onSubmit={handleAddBannerSubmit} className="space-y-4 text-xs font-sans bg-gray-50 p-5 rounded-2xl border border-gray-200">
              <h4 className="font-heading font-black text-xs text-[#111111] uppercase tracking-wider">Add New Homepage Banner</h4>

              {bannerSuccess && (
                <div className="bg-green-100 text-green-800 p-3 rounded-xl font-bold flex items-center gap-2 border border-green-300">
                  <CheckCircle2 size={16} /> New Banner Published to Customer Homepage!
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Banner Headline Title *</label>
                  <input
                    type="text"
                    required
                    value={bannerTitle}
                    onChange={(e) => setBannerTitle(e.target.value)}
                    placeholder="e.g. 50% ADVANCE DISCOUNT ON HEAVY CULTIVATOR"
                    className="w-full bg-white p-2.5 rounded-xl border border-gray-300 font-bold outline-none focus:border-[#F97316]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Category / Offer Tag *</label>
                  <input
                    type="text"
                    required
                    value={bannerTag}
                    onChange={(e) => setBannerTag(e.target.value)}
                    placeholder="e.g. FESTIVAL OFFER, LATHE WORKS"
                    className="w-full bg-white p-2.5 rounded-xl border border-gray-300 font-mono font-bold outline-none focus:border-[#F97316]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Banner Description / Subtitle *</label>
                <input
                  type="text"
                  required
                  value={bannerSubtitle}
                  onChange={(e) => setBannerSubtitle(e.target.value)}
                  placeholder="Forged lathe-machined tines engineered for tough Tamil Nadu soil..."
                  className="w-full bg-white p-2.5 rounded-xl border border-gray-300 outline-none focus:border-[#F97316]"
                />
              </div>

              {/* Banner Image Selection */}
              <div>
                <label className="font-bold text-gray-700 block mb-1">Banner Background Image URL or Upload *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    required
                    value={bannerImage}
                    onChange={(e) => setBannerImage(e.target.value)}
                    className="flex-1 bg-white p-2.5 rounded-xl border border-gray-300 font-mono text-xs outline-none"
                  />
                  <label className="bg-[#111111] hover:bg-[#F97316] text-white font-bold text-xs px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors inline-flex items-center gap-1.5 shrink-0 shadow-xs">
                    <Upload size={14} /> Choose File
                    <input type="file" accept="image/*" onChange={handleBannerFileUpload} className="hidden" />
                  </label>
                </div>
                {bannerUploading && <span className="text-[11px] text-orange-600 font-mono font-bold mt-1 block">Uploading banner image to Cloudinary...</span>}
              </div>

              <button
                type="submit"
                disabled={bannerUploading || !bannerTitle}
                className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-5 py-3 rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Plus size={16} /> Publish Banner to Customer Homepage
              </button>
            </form>

            {/* Active Homepage Banners List */}
            <div className="space-y-3">
              <h4 className="font-heading font-black text-xs text-[#111111] uppercase tracking-wider">Currently Displayed Banners</h4>
              <div className="grid grid-cols-1 gap-3">
                {banners.map((b) => (
                  <div key={b.id} className="p-4 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={b.image} alt={b.title} className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-300" />
                      <div className="min-w-0">
                        <span className="bg-[#F97316] text-white text-[9px] font-black px-2 py-0.5 rounded font-mono uppercase">{b.tag}</span>
                        <h5 className="font-heading font-black text-xs text-[#111111] truncate mt-1">{b.title}</h5>
                        <p className="text-[11px] text-gray-500 font-mono truncate">{b.subtitle}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteBanner(b.id)}
                      className="p-2.5 text-red-600 hover:bg-red-100 rounded-xl shrink-0 transition-colors cursor-pointer"
                      title="Delete Banner"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
