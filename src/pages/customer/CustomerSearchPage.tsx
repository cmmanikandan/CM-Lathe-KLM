import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import {
  Search,
  Mic,
  X,
  ChevronRight,
  Package,
  ArrowLeft,
  Star
} from 'lucide-react';

export const CustomerSearchPage: React.FC = () => {
  const { products, searchQuery, setSearchQuery, setSelectedCategory } = useProducts();
  const navigate = useNavigate();

  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus search input on page mount for instant mobile keyboard opening
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const query = (searchQuery || '').trim().toLowerCase();

  // Categories matching search query
  const allCategories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  const matchingCategories = query
    ? allCategories.filter((c) => c.toLowerCase().includes(query))
    : [];

  // Products matching search query
  const matchingProducts = query
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          (p.specifications?.material && p.specifications.material.toLowerCase().includes(query))
      )
    : products.slice(0, 10); // Show products list when query is empty

  const voiceSearchHandler = () => {
    setIsListening(true);
    setTimeout(() => {
      setSearchQuery('Kalappai');
      setIsListening(false);
    }, 1200);
  };

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setSearchQuery('');
    navigate('/customer/products');
  };

  const handleSelectProductItem = (productId: string) => {
    navigate(`/customer/products/${productId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigate('/customer/products');
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#F8F9FA] flex flex-col font-sans">
      
      {/* 1. TOP STICKY SEARCH HEADER (NO BOTTOM NAV) */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-xs flex items-center gap-3 shrink-0 sticky top-0 z-30">
        <button
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/customer/home');
            }
          }}
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
            placeholder="Search Gates, Kalappai, Windows Grill, Lathe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-gray-100 text-xs sm:text-sm text-[#111111] pl-10 pr-16 py-2.5 rounded-2xl border border-gray-300 focus:border-[#F97316] focus:bg-white outline-none font-medium transition-colors"
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 rounded-full text-gray-400 hover:text-black transition-colors"
                title="Clear"
              >
                <X size={16} />
              </button>
            )}

            <button
              onClick={voiceSearchHandler}
              className={`p-1.5 rounded-lg ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}
              title="Voice Search"
            >
              <Mic size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. SCROLLABLE SEARCH RESULTS BODY (NO BOTTOM NAV) */}
      <div className="flex-1 overflow-y-auto max-w-4xl w-full mx-auto p-4 space-y-3 pb-12">
        
        {/* Matching Category Badges (Shown when typing) */}
        {matchingCategories.length > 0 && query && (
          <div className="flex flex-wrap gap-2 pb-1 shrink-0">
            {matchingCategories.map((cat) => {
              const count = products.filter((p) => p.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => handleSelectCategory(cat)}
                  className="bg-orange-50 hover:bg-[#F97316] text-orange-950 hover:text-white text-xs font-bold px-3 py-1.5 rounded-full border border-orange-200 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>{cat}</span>
                  <span className="text-[10px] font-mono opacity-80">({count})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Direct Product Result Cards (No Header Titles) */}
        <div className="bg-white rounded-[22px] border border-gray-200 shadow-xs overflow-hidden divide-y divide-gray-100">
          {matchingProducts.length > 0 ? (
            matchingProducts.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectProductItem(item.id)}
                className="p-3.5 hover:bg-orange-50/60 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={item.images?.[0] || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=200&q=80'}
                    alt={item.name}
                    className="w-14 h-14 rounded-2xl object-contain bg-white border border-gray-200 p-1 shrink-0 group-hover:scale-105 transition-transform shadow-xs"
                  />
                  
                  <div className="min-w-0 space-y-0.5">
                    <span className="text-[10px] font-mono font-bold text-[#F97316] uppercase block truncate">
                      {item.category}
                    </span>

                    <h4 className="font-heading font-extrabold text-xs sm:text-sm text-[#111111] group-hover:text-[#F97316] transition-colors truncate">
                      {item.name}
                    </h4>

                    <div className="flex items-center gap-2.5">
                      <span className="font-heading font-black text-xs text-[#111111]">
                        ₹{(item.variants?.[0]?.price || item.price || 0).toLocaleString('en-IN')}
                      </span>

                      <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Star size={11} className="fill-amber-400 text-amber-400" />
                        <span>{(item.rating || 5.0).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <ChevronRight size={18} className="text-gray-400 group-hover:text-[#F97316] shrink-0" />
              </div>
            ))
          ) : (
            <div className="p-8 text-center space-y-2">
              <Package size={32} className="mx-auto text-gray-300" />
              <h4 className="font-heading font-black text-xs text-[#111111]">No matching products found</h4>
              <p className="text-[11px] text-gray-500">Try typing another product name or category.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
