import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { Search, Mic, Filter, Eye, MessageCircle, Heart, Star, CheckCircle2 } from 'lucide-react';

export const ProductCatalogPage: React.FC = () => {
  const {
    products,
    categories,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedFilter,
    setSelectedFilter,
    filteredProducts
  } = useProducts();

  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const filterOptions = [
    'All',
    'Ready Stock',
    'Made To Order',
    'Best Selling',
    'Trending',
    'Premium Collection',
    'Budget Friendly'
  ];

  const handleVoiceSearch = () => {
    setIsListening(true);
    setTimeout(() => {
      setSearchQuery('Kalappai');
      setIsListening(false);
    }, 1500);
  };

  const toggleWishlist = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setWishlist((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <div className="p-4 space-y-4 font-sans">
      
      {/* 1. STICKY MOBILE SEARCH & FILTER BAR */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F97316]" />
            <input
              type="text"
              placeholder="Search Gates, Kalappai, Windows Grill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-xs text-[#111111] pl-10 pr-10 py-3 rounded-2xl border border-gray-200 focus:border-[#F97316] outline-none shadow-xs font-medium"
            />
            <button
              onClick={handleVoiceSearch}
              title="Voice Search"
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full ${
                isListening ? 'text-[#F97316] animate-ping' : 'text-gray-400 hover:text-[#111111]'
              }`}
            >
              <Mic size={16} />
            </button>
          </div>

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-[#F97316] px-2 py-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-heading font-extrabold shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filters Tag Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[11px] font-bold text-gray-400 shrink-0 uppercase tracking-wider">Filter:</span>
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setSelectedFilter(opt)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all border ${
                selectedFilter === opt
                  ? 'bg-[#F97316] text-white border-[#F97316]'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* 2. PRODUCT COUNT & HEADER */}
      <div className="flex justify-between items-center text-xs font-mono pt-1">
        <span className="text-gray-500">
          Showing <strong className="text-[#111111] font-bold">{filteredProducts.length}</strong> items
        </span>
        {selectedCategory !== 'All' && (
          <span className="text-[#F97316] font-bold uppercase">{selectedCategory}</span>
        )}
      </div>

      {/* 3. 2-COLUMN FLIPKART MOBILE PRODUCT GRID */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-[22px] p-8 text-center border border-gray-200 my-4 shadow-xs">
          <Search size={40} className="mx-auto text-gray-300 mb-2" />
          <h3 className="font-heading font-bold text-sm text-[#111111]">No matching products found</h3>
          <p className="text-gray-500 text-xs mt-1">Try clearing search terms or category filters.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedFilter('All');
            }}
            className="mt-3 bg-[#111111] text-white font-bold text-xs px-4 py-2 rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => {
            const isLiked = wishlist.includes(product.id);
            return (
              <div
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                className="bg-white rounded-[22px] border border-gray-200/80 p-2.5 shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#F97316] transition-all relative group"
              >
                {/* Wishlist Button */}
                <button
                  onClick={(e) => toggleWishlist(e, product.id)}
                  className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-white/80 backdrop-blur-md shadow-xs text-gray-400 hover:text-red-500 active:scale-90 transition-transform"
                >
                  <Heart size={14} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
                </button>

                {/* Product Image */}
                <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-square flex items-center justify-center">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Stock Badge */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.isReadyStock && (
                      <span className="bg-green-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                        Stock
                      </span>
                    )}
                    {product.isMadeToOrder && (
                      <span className="bg-purple-700 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                        Custom
                      </span>
                    )}
                  </div>

                  {/* Rating Tag */}
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    ★ {product.rating}
                  </div>
                </div>

                {/* Info Content */}
                <div className="mt-2 space-y-1">
                  <h3 className="font-heading font-extrabold text-xs text-[#111111] line-clamp-2 leading-tight">
                    {product.name}
                  </h3>

                  <p className="text-[10px] text-gray-500 line-clamp-1">
                    {product.specifications.material}
                  </p>

                  <div className="pt-1 flex items-center justify-between border-t border-gray-100">
                    <div>
                      <span className="font-heading font-black text-sm text-[#F97316] block leading-none">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      {product.discountPrice && (
                        <span className="text-[9px] text-gray-400 line-through">
                          ₹{product.discountPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <a
                      href={`https://wa.me/919942012345?text=Hi%20Manikandan%20Lathe,%20I%20want%20to%20order%20${encodeURIComponent(product.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 bg-[#25D366] text-white rounded-xl hover:bg-[#20ba5a] active:scale-95 transition-all shadow-xs"
                      title="Quick WhatsApp Order"
                    >
                      <MessageCircle size={14} />
                    </a>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
