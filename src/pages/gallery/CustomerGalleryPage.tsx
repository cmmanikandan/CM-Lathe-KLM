import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageViewerModal } from '../../components/common/ImageViewerModal';
import { fetchGallery } from '../../services/supabaseService';
import { ArrowLeft, Search, Share2, Eye, Sparkles, Loader2 } from 'lucide-react';

interface CustomerGalleryItem {
  id: string | number;
  title: string;
  category: string;
  image: string;
  date: string;
}

export const CustomerGalleryPage: React.FC = () => {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [customerGalleryItems, setCustomerGalleryItems] = useState<CustomerGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Workshop Progress', 'Completed Orders', 'Factory Machinery', 'Gate Installations', 'Steel Gates', 'Kalappai', 'Lathe Works'];

  const loadGallery = async () => {
    setLoading(true);
    try {
      const items = await fetchGallery();
      if (items && items.length > 0) {
        setCustomerGalleryItems(
          items.map((i) => ({
            id: i.id,
            title: i.title,
            category: i.category,
            image: i.mediaUrl,
            date: i.createdAt ? i.createdAt.split('T')[0] : '2026-07-25',
          }))
        );
      } else {
        setCustomerGalleryItems([
          { id: 1, title: '9-Tine Kalappai Assembly Line', category: 'Workshop Progress', image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80', date: '2026-07-25' },
          { id: 2, title: 'Completed SS 304 Main Gate Delivery', category: 'Completed Orders', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', date: '2026-07-23' },
          { id: 3, title: 'High Precision Lathe Shaft Machining', category: 'Factory Machinery', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80', date: '2026-07-20' },
          { id: 4, title: 'Decorative Window Grill Fitting', category: 'Gate Installations', image: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=800&q=80', date: '2026-07-18' },
          { id: 5, title: 'Custom 5-Tine Cultivator Tines Forging', category: 'Workshop Progress', image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80', date: '2026-07-15' },
          { id: 6, title: 'Finished Structural Steel Security Door', category: 'Completed Orders', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', date: '2026-07-12' }
        ]);
      }
    } catch (err) {
      console.error('CustomerGallery load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const filteredItems = customerGalleryItems.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  const allImages = filteredItems.map((i) => i.image);

  const handleShare = (e: React.MouseEvent, title: string, url: string) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title, url });
    } else {
      navigator.clipboard.writeText(url);
      alert('Photo link copied!');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 font-sans max-w-7xl mx-auto">
      
      {/* Back Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-1 rounded-lg hover:bg-gray-100">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-heading font-black text-lg text-[#111111] flex items-center gap-1.5">
              <Sparkles size={18} className="text-[#F97316]" /> Customer Workshop Gallery
            </h1>
            <p className="text-xs text-gray-500">Live manufacturing progress, finished customer orders & workshop updates</p>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-heading font-extrabold shrink-0 transition-all border ${
              selectedCategory === cat
                ? 'bg-[#111111] text-white border-[#111111]'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Responsive Grid (4 cols Desktop, 3 Laptop, 2 Tablet, 2 Mobile) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {filteredItems.map((item, idx) => (
          <div
            key={item.id}
            onClick={() => {
              setViewerIndex(idx);
              setViewerOpen(true);
            }}
            className="bg-white rounded-[22px] border border-gray-200/80 overflow-hidden shadow-xs hover:border-[#F97316] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="relative aspect-square bg-gray-100 overflow-hidden flex items-center justify-center">
              <img src={item.image} alt={item.title} className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300" />
              <span className="absolute top-2 left-2 bg-[#111111]/80 backdrop-blur-md text-white text-[8px] sm:text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                {item.category}
              </span>
              <button
                onClick={(e) => handleShare(e, item.title, item.image)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-md text-gray-700 hover:text-[#F97316] active:scale-95 transition-transform"
              >
                <Share2 size={12} />
              </button>
            </div>

            <div className="p-2.5 space-y-0.5">
              <h3 className="font-heading font-bold text-xs text-[#111111] line-clamp-1">{item.title}</h3>
              <span className="text-[10px] text-gray-400 font-mono block">{item.date}</span>
            </div>
          </div>
        ))}
      </div>

      {/* LIGHTBOX VIEWER */}
      <ImageViewerModal
        images={allImages}
        initialIndex={viewerIndex}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        title={filteredItems[viewerIndex]?.title}
      />

    </div>
  );
};
