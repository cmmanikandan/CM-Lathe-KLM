import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import {
  Search,
  Mic,
  X,
  ChevronRight,
  Sparkles,
  Tag,
  Package,
  ArrowLeft,
  Star,
  CheckCircle2,
  TrendingUp,
  SlidersHorizontal
} from 'lucide-react';

interface FlipkartAutoSuggestSearchProps {
  placeholder?: string;
  className?: string;
  onSelectProduct?: (productId: string) => void;
}

export const FlipkartAutoSuggestSearch: React.FC<FlipkartAutoSuggestSearchProps> = ({
  placeholder = 'Search Gates, Kalappai, Windows Grill, Lathe...',
  className = '',
  onSelectProduct
}) => {
  const { products, searchQuery, setSearchQuery, setSelectedCategory } = useProducts();
  const navigate = useNavigate();
  
  const [isFullScreenModal, setIsFullScreenModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const query = (searchQuery || '').trim().toLowerCase();

  // Categories matching search query
  const allCategories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  const matchingCategories = query
    ? allCategories.filter((c) => c.toLowerCase().includes(query))
    : allCategories;

  // Products matching search query
  const matchingProducts = query
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          (p.specifications?.material && p.specifications.material.toLowerCase().includes(query))
      )
    : products.slice(0, 6); // Show top featured products when query is empty

  // Trending Search Suggestions
  const popularSearches = [
    'Tractor Kalappai',
    'Heavy Main Gates',
    'Windows Grill',
    'Steel Furniture',
    'Lathe Shaft',
    'Stainless Steel Doors',
    'Custom CNC Fittings'
  ];

  const voiceSearchHandler = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsListening(true);
    setTimeout(() => {
      setSearchQuery('Kalappai');
      setIsListening(false);
      setIsFullScreenModal(true);
    }, 1200);
  };

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setSearchQuery('');
    setIsFullScreenModal(false);
    navigate('/customer/products');
  };

  const handleSelectProductItem = (productId: string) => {
    setIsFullScreenModal(false);
    if (onSelectProduct) {
      onSelectProduct(productId);
    } else {
      navigate(`/customer/products/${productId}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsFullScreenModal(false);
      navigate('/customer/products');
    } else if (e.key === 'Escape') {
      setIsFullScreenModal(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      
      {/* 1. COMPACT TRIGGER SEARCH BAR (Shown on Home / Products page) */}
      <div
        onClick={() => setIsFullScreenModal(true)}
        className="relative flex items-center cursor-pointer group"
      >
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F97316]" />
        
        <input
          type="text"
          readOnly
          placeholder={placeholder}
          value={searchQuery}
          className="w-full bg-white text-xs sm:text-sm text-[#111111] pl-10 pr-16 py-3 rounded-2xl border border-gray-200 group-hover:border-[#F97316] outline-none shadow-xs font-medium cursor-pointer transition-all"
        />

        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searchQuery && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSearchQuery('');
              }}
              className="p-1 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
              title="Clear Search"
            >
              <X size={14} />
            </button>
          )}

          <button
            onClick={voiceSearchHandler}
            className={`p-1.5 rounded-lg transition-colors ${
              isListening ? 'text-red-500 animate-pulse bg-red-50' : 'text-gray-400 hover:text-[#F97316] hover:bg-orange-50'
            }`}
            title="Voice Search"
          >
            <Mic size={16} />
          </button>
        </div>
      </div>

      {/* 2. FULL-SCREEN FLIPKART-STYLE SEARCH TAKEOVER MODAL PAGE */}
      {isFullScreenModal && (
        <div className="fixed inset-0 z-50 bg-[#F8F9FA] flex flex-col font-sans animate-in fade-in duration-200">
          
          {/* Top Sticky Search Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-xs flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsFullScreenModal(false)}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#111111] transition-colors cursor-pointer shrink-0"
              title="Back"
            >
              <ArrowLeft size={20} className="text-[#F97316]" />
            </button>

            <div className="relative flex-1 flex items-center">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F97316]" />
              
              <input
                ref={inputRef}
                type="text"
                autoFocus
                placeholder="Search Gates, Kalappai, Windows Grill, Lathe..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-gray-50 text-sm text-[#111111] pl-10 pr-16 py-2.5 rounded-2xl border border-gray-300 focus:border-[#F97316] focus:bg-white outline-none font-medium"
              />

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 rounded-full text-gray-400 hover:text-black transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}

                <button
                  onClick={voiceSearchHandler}
                  className={`p-1 rounded-lg ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}
                >
                  <Mic size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Scrollable Search Content Body */}
          <div className="flex-1 overflow-y-auto max-w-4xl w-full mx-auto p-4 space-y-6">
            
            {/* Section 1: Popular & Trending Searches */}
            <div className="bg-white p-4 rounded-[22px] border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-600 uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-[#F97316]">
                  <TrendingUp size={15} /> Trending Factory Searches
                </span>
                <span className="text-[10px] text-gray-400">Flipkart Live Sync</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                    }}
                    className="bg-orange-50/80 hover:bg-[#F97316] text-orange-950 hover:text-white text-xs font-heading font-extrabold px-3.5 py-1.5 rounded-full border border-orange-200 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Tag size={13} className="opacity-70" /> {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 2: Matching Categories */}
            {matchingCategories.length > 0 && (
              <div className="bg-white p-4 rounded-[22px] border border-gray-200 shadow-xs space-y-3">
                <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block">
                  Product Categories ({matchingCategories.length})
                </span>

                <div className="flex flex-wrap gap-2">
                  {matchingCategories.map((cat) => {
                    const count = products.filter((p) => p.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => handleSelectCategory(cat)}
                        className="bg-gray-100 hover:bg-[#111111] text-gray-800 hover:text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-gray-200 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                      >
                        <span>{cat}</span>
                        <span className="text-[10px] font-mono opacity-60">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section 3: Flipkart Product Result Cards */}
            <div className="bg-white rounded-[26px] border border-gray-200 shadow-xs overflow-hidden divide-y divide-gray-100 space-y-1">
              <div className="p-4 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Package size={16} className="text-[#F97316]" /> Matching Products ({matchingProducts.length})
                </span>
                {query && (
                  <button
                    onClick={() => {
                      setIsFullScreenModal(false);
                      navigate('/customer/products');
                    }}
                    className="text-xs font-heading font-black text-[#F97316] hover:underline"
                  >
                    See All in Catalog →
                  </button>
                )}
              </div>

              {matchingProducts.length > 0 ? (
                matchingProducts.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectProductItem(item.id)}
                    className="p-4 hover:bg-orange-50/60 transition-colors flex items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <img
                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=200&q=80'}
                        alt={item.name}
                        className="w-16 h-16 rounded-2xl object-contain bg-white border border-gray-200 p-1.5 shrink-0 group-hover:scale-105 transition-transform shadow-xs"
                      />
                      
                      <div className="min-w-0 space-y-0.5">
                        <span className="text-[10px] font-mono font-bold text-[#F97316] uppercase block truncate">
                          {item.category} • Kallimandhayam Factory
                        </span>

                        <h4 className="font-heading font-extrabold text-sm text-[#111111] group-hover:text-[#F97316] transition-colors truncate">
                          {item.name}
                        </h4>

                        <div className="flex items-center gap-3">
                          <span className="font-heading font-black text-sm text-[#111111]">
                            ₹{(item.variants?.[0]?.price || item.price || 0).toLocaleString('en-IN')}
                          </span>

                          <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            <Star size={12} className="fill-amber-400 text-amber-400" />
                            <span>{(item.rating || 5.0).toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden sm:inline text-xs font-heading font-black bg-[#111111] text-white px-3 py-1.5 rounded-xl group-hover:bg-[#F97316] transition-colors">
                        View Product
                      </span>
                      <ChevronRight size={18} className="text-gray-400 group-hover:text-[#F97316]" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center space-y-3">
                  <Package size={36} className="mx-auto text-gray-300" />
                  <h4 className="font-heading font-black text-sm text-[#111111]">No matching products found</h4>
                  <p className="text-xs text-gray-500">Try searching for "Kalappai", "Gate", "Grill", or "Lathe".</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                      setIsFullScreenModal(false);
                      navigate('/customer/products');
                    }}
                    className="bg-[#F97316] text-white font-heading font-black text-xs px-5 py-2.5 rounded-xl shadow-md"
                  >
                    Explore Entire Product Catalog
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
