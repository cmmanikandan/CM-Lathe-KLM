import React, { useState } from 'react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { ImageViewerModal } from '../../components/common/ImageViewerModal';
import { Search, Filter, Share2, Eye, Play, Sparkles } from 'lucide-react';

export const PublicGalleryPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const categories = [
    'All',
    'Latest Works',
    'Steel Gates',
    'Windows Grill',
    'Steel Doors',
    'Kalappai',
    'Lathe Works',
    'Fabrication',
    'Machine Works',
    'Completed Projects',
    'New Installations'
  ];

  const galleryItems = [
    { id: 1, title: '9-Tine Hardened Tractor Kalappai', category: 'Kalappai', type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80', date: '2026-07-20' },
    { id: 2, title: 'CNC Laser Cut SS 304 Main Safety Gate', category: 'Steel Gates', type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', date: '2026-07-22' },
    { id: 3, title: 'Precision Lathe Turning Machine Shafts', category: 'Lathe Works', type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80', date: '2026-07-18' },
    { id: 4, title: 'Decorative Security Window Grill', category: 'Windows Grill', type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=800&q=80', date: '2026-07-15' },
    { id: 5, title: 'Heavy Duty Structural Steel Door', category: 'Steel Doors', type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', date: '2026-07-10' },
    { id: 6, title: '5-Tine Compact Cultivator Assembly', category: 'Kalappai', type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80', date: '2026-07-08' },
    { id: 7, title: 'Industrial Lathe Bush & Bearing Fitting', category: 'Machine Works', type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80', date: '2026-07-05' },
    { id: 8, title: 'Kallimandhayam Factory Gate Installation', category: 'New Installations', type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', date: '2026-07-01' }
  ];

  const filteredItems = galleryItems.filter((item, idx) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory || (selectedCategory === 'Latest Works' && idx < 4);
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const allImages = filteredItems.map((item) => item.mediaUrl);

  const handleShare = (e: React.MouseEvent, title: string, url: string) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: `MANIKANDAN LATHE - ${title}`, url });
    } else {
      navigator.clipboard.writeText(url);
      alert('Photo link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111] font-sans antialiased">
      <PublicNavbar />

      {/* Header Banner */}
      <section className="bg-[#111111] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-3">
          <span className="text-[#F97316] font-mono text-xs font-bold uppercase tracking-widest block">
            Craftsmanship Portfolio
          </span>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white">
            COMPLETED WORKS & GALLERY
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Explore photos of finished tractor kalappai, CNC laser main gates, window grills & lathe machine works fabricated at our Kallimandhayam factory.
          </p>
        </div>
      </section>

      {/* Gallery Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Search & Category Filter Chips */}
        <div className="bg-white p-4 rounded-[22px] border border-gray-200 shadow-xs space-y-3">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F97316]" />
            <input
              type="text"
              placeholder="Search gallery by title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 focus:bg-white text-xs sm:text-sm text-[#111111] pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#F97316] outline-none font-medium"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-heading font-extrabold shrink-0 transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#111111] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid (Responsive Breakpoints: 4 cols Desktop, 3 Laptop, 2 Tablet, 1 Mobile) */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-[22px] p-8 text-center border border-gray-200 my-4 shadow-xs">
            <Search size={40} className="mx-auto text-gray-300 mb-2" />
            <h3 className="font-heading font-bold text-sm text-[#111111]">No gallery items found</h3>
            <p className="text-gray-500 text-xs mt-1">Try selecting another filter category or search keyword.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => {
                  setViewerIndex(idx);
                  setViewerOpen(true);
                }}
                onContextMenu={(e) => e.preventDefault()} // Disable right-click download
                className="bg-white rounded-[22px] border border-gray-200/80 overflow-hidden shadow-xs hover:border-[#F97316] transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={item.mediaUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  <span className="absolute top-2 left-2 bg-[#111111]/80 backdrop-blur-md text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                    {item.category}
                  </span>

                  <button
                    onClick={(e) => handleShare(e, item.title, item.mediaUrl)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-md text-gray-700 hover:text-[#F97316] shadow-xs active:scale-95 transition-transform"
                    title="Share Photo"
                  >
                    <Share2 size={14} />
                  </button>

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-[#F97316] text-white text-xs font-heading font-black px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                      <Eye size={14} /> Full View
                    </span>
                  </div>
                </div>

                <div className="p-3 space-y-1">
                  <h3 className="font-heading font-black text-xs text-[#111111] line-clamp-1">{item.title}</h3>
                  <p className="text-[10px] text-gray-400 font-mono">Uploaded: {item.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* LIGHTBOX IMAGE VIEWER MODAL */}
      <ImageViewerModal
        images={allImages}
        initialIndex={viewerIndex}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        title={filteredItems[viewerIndex]?.title}
      />

      <PublicFooter />
    </div>
  );
};
