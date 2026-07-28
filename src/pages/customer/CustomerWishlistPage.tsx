import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductContext';
import { Product } from '../../types';
import { Heart, ShoppingBag, ArrowLeft, Trash2, ImageIcon, Flame, Package, Eye, Plus } from 'lucide-react';

export const CustomerWishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { products } = useProducts();

  const [activeTab, setActiveTab] = useState<'products' | 'gallery'>('products');

  // Persistent wishlist stored in localStorage keyed by user ID
  const storageKey = `ml_wishlist_${user?.id || 'guest'}`;

  const [productWishlist, setProductWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey + '_products');
      if (saved) {
        const ids: string[] = JSON.parse(saved);
        return ids.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[];
      }
    } catch {}
    return [];
  });

  const [galleryWishlist, setGalleryWishlist] = useState<{ id: string; title: string; category: string; image: string; dateAdded: string }[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey + '_gallery');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Persist changes
  useEffect(() => {
    localStorage.setItem(storageKey + '_products', JSON.stringify(productWishlist.map(p => p.id)));
  }, [productWishlist, storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey + '_gallery', JSON.stringify(galleryWishlist));
  }, [galleryWishlist, storageKey]);

  const totalSavedCount = productWishlist.length + galleryWishlist.length;

  const removeProduct = (id: string) => {
    setProductWishlist((prev) => prev.filter((p) => p.id !== id));
  };

  const removeGalleryItem = (id: string) => {
    setGalleryWishlist((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 font-sans max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-4 gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#111111] transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-heading font-black text-xl sm:text-2xl text-[#111111] flex items-center gap-2">
              <Heart size={22} className="text-red-500 fill-red-500" /> MY SAVED WISHLIST
            </h1>
            <p className="text-xs text-gray-500">Saved machinery products & gallery completed works</p>
          </div>
        </div>

        <span className="bg-red-100 text-red-600 font-mono font-black text-xs px-3 py-1 rounded-full border border-red-200 self-start sm:self-auto">
          {totalSavedCount} Saved Items
        </span>
      </div>

      {/* 2 WISHLIST TAB HEADERS */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-heading font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'products'
              ? 'bg-[#111111] text-white shadow-xs'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
          }`}
        >
          <Package size={14} className={activeTab === 'products' ? 'text-[#F97316]' : 'text-gray-400'} />
          Products ({productWishlist.length})
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-4 py-2 rounded-xl text-xs font-heading font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'gallery'
              ? 'bg-[#111111] text-white shadow-xs'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
          }`}
        >
          <ImageIcon size={14} className={activeTab === 'gallery' ? 'text-[#F97316]' : 'text-gray-400'} />
          Gallery Works ({galleryWishlist.length})
        </button>
      </div>

      {/* TAB 1: PRODUCT WISHLIST */}
      {activeTab === 'products' && (
        productWishlist.length === 0 ? (
          <div className="bg-white rounded-[22px] p-12 text-center border border-gray-200 shadow-xs space-y-3">
            <Heart size={48} className="mx-auto text-gray-300" />
            <h3 className="font-heading font-bold text-base text-[#111111]">No Saved Products</h3>
            <p className="text-xs text-gray-500">Tap the heart icon on any product to save it here for later.</p>
            <button
              onClick={() => navigate('/customer/products')}
              className="bg-[#F97316] text-white font-heading font-black text-xs px-5 py-2.5 rounded-xl shadow-md"
            >
              Explore Catalog →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {productWishlist.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/customer/products/${p.id}`)}
                className="bg-white rounded-[22px] border border-gray-200 p-3 shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#F97316] transition-all relative group"
              >
                <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-square">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeProduct(p.id);
                    }}
                    title="Remove"
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 backdrop-blur-md text-red-500 hover:bg-white shadow-xs"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="mt-3 space-y-1">
                  <h3 className="font-heading font-extrabold text-xs text-[#111111] line-clamp-1">{p.name}</h3>
                  <p className="text-[10px] text-gray-500 font-mono">{p.specifications.material}</p>
                  <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                    <span className="font-heading font-black text-sm text-[#F97316]">₹{p.price.toLocaleString('en-IN')}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/customer/products/${p.id}`);
                      }}
                      className="px-3 py-1.5 bg-[#111111] hover:bg-[#F97316] text-white text-xs font-heading font-black rounded-xl flex items-center gap-1 shadow-xs"
                    >
                      <ShoppingBag size={12} /> Order Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* TAB 2: GALLERY WISHLIST */}
      {activeTab === 'gallery' && (
        galleryWishlist.length === 0 ? (
          <div className="bg-white rounded-[22px] p-12 text-center border border-gray-200 shadow-xs space-y-3">
            <ImageIcon size={48} className="mx-auto text-gray-300" />
            <h3 className="font-heading font-bold text-base text-[#111111]">No Favourites in Gallery</h3>
            <p className="text-xs text-gray-500">Save completed gates & machinery photos from the Gallery.</p>
            <button
              onClick={() => navigate('/customer/gallery')}
              className="bg-[#111111] text-white font-heading font-black text-xs px-5 py-2.5 rounded-xl shadow-md"
            >
              Open Factory Gallery →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {galleryWishlist.map((g) => (
              <div
                key={g.id}
                onClick={() => navigate('/customer/gallery')}
                className="bg-white rounded-[22px] border border-gray-200 p-3 shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#F97316] transition-all group"
              >
                <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-video">
                  <img src={g.image} alt={g.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeGalleryItem(g.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-red-500 hover:bg-white shadow-xs"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="mt-3 space-y-1">
                  <span className="text-[9px] font-bold text-[#F97316] font-mono uppercase">{g.category}</span>
                  <h3 className="font-heading font-black text-xs text-[#111111] line-clamp-1">{g.title}</h3>
                  <p className="text-[10px] text-gray-400 font-mono pt-1 border-t border-gray-100">Saved: {g.dateAdded}</p>
                </div>
              </div>
            ))}
          </div>
        )
      )}

    </div>
  );
};
