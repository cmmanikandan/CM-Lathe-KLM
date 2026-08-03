import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { Search, Mic, X, ChevronRight, Sparkles, Tag, Package } from 'lucide-react';

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
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const query = (searchQuery || '').trim().toLowerCase();

  // Categories matching search query
  const allCategories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  const matchingCategories = query
    ? allCategories.filter((c) => c.toLowerCase().includes(query))
    : allCategories.slice(0, 4);

  // Products matching search query
  const matchingProducts = query
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          (p.specifications?.material && p.specifications.material.toLowerCase().includes(query))
      )
    : [];

  // Popular / Trending Search Suggestions
  const popularSearches = ['Tractor Kalappai', 'Main Gates', 'Window Grills', 'Steel Furniture', 'Lathe Shaft'];

  const voiceSearchHandler = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsListening(true);
    setTimeout(() => {
      setSearchQuery('Kalappai');
      setIsListening(false);
      setIsOpen(true);
    }, 1200);
  };

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setSearchQuery('');
    setIsOpen(false);
    navigate('/customer/products');
  };

  const handleSelectProductItem = (productId: string) => {
    setIsOpen(false);
    if (onSelectProduct) {
      onSelectProduct(productId);
    } else {
      navigate(`/customer/products/${productId}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsOpen(false);
      navigate('/customer/products');
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F97316]" />
        
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="w-full bg-white text-xs sm:text-sm text-[#111111] pl-10 pr-16 py-3 rounded-2xl border border-gray-200 focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none shadow-xs font-medium transition-all"
        />

        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
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

      {/* Flipkart-Style Auto-Suggest Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden animate-in fade-in duration-150 font-sans">
          
          {/* Section 1: Empty Query - Popular Trending Searches */}
          {!query && (
            <div className="p-3.5 space-y-2 border-b border-gray-100">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-gray-500 font-bold uppercase tracking-wider">
                <Sparkles size={13} className="text-[#F97316]" /> Popular Factory Searches
              </div>
              <div className="flex flex-wrap gap-1.5">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      setIsOpen(true);
                    }}
                    className="bg-gray-50 hover:bg-orange-50 hover:text-[#F97316] text-gray-700 text-xs font-medium px-3 py-1 rounded-full border border-gray-200 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Tag size={12} className="text-gray-400" /> {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Matching Categories */}
          {matchingCategories.length > 0 && (
            <div className="p-3 space-y-1.5 border-b border-gray-100">
              <div className="text-[10px] font-mono text-gray-400 uppercase font-bold tracking-wider px-1">
                Categories
              </div>
              <div className="flex flex-wrap gap-1.5">
                {matchingCategories.map((cat) => {
                  const count = products.filter((p) => p.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => handleSelectCategory(cat)}
                      className="bg-orange-50 hover:bg-[#F97316] text-orange-950 hover:text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-orange-200 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{cat}</span>
                      <span className="text-[10px] font-mono opacity-80">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 3: Product Matches */}
          {query && (
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
              {matchingProducts.length > 0 ? (
                matchingProducts.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectProductItem(item.id)}
                    className="p-3 hover:bg-orange-50/70 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=150&q=80'}
                        alt={item.name}
                        className="w-11 h-11 rounded-xl object-contain bg-white border border-gray-200 p-1 shrink-0 group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono text-[#F97316] uppercase font-bold block truncate">
                          {item.category}
                        </span>
                        <h4 className="font-heading font-extrabold text-xs text-[#111111] truncate group-hover:text-[#F97316] transition-colors">
                          {item.name}
                        </h4>
                        <span className="text-[11px] font-mono font-black text-gray-900 block">
                          ₹{(item.variants?.[0]?.price || item.price || 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <ChevronRight size={16} className="text-gray-400 group-hover:text-[#F97316] shrink-0" />
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-gray-500 space-y-2">
                  <Package size={24} className="mx-auto text-gray-300" />
                  <p>No products found for "{searchQuery}".</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                      navigate('/customer/products');
                    }}
                    className="text-[11px] text-[#F97316] font-bold hover:underline"
                  >
                    View All Factory Products →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer View All Search Results */}
          {query && matchingProducts.length > 0 && (
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/customer/products');
              }}
              className="w-full bg-gray-50 hover:bg-gray-100 text-[#111111] text-xs font-heading font-black py-2.5 px-4 text-center border-t border-gray-200 transition-colors flex items-center justify-center gap-1"
            >
              See All ({matchingProducts.length}) Results for "{searchQuery}" <ChevronRight size={14} className="text-[#F97316]" />
            </button>
          )}

        </div>
      )}

    </div>
  );
};
