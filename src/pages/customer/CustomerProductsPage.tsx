import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import {
  Search,
  Mic,
  SlidersHorizontal,
  ArrowUpDown,
  Layers,
  Heart,
  ShoppingBag,
  Star,
  X,
  CheckCircle2,
  Sliders,
  Grid,
  List,
  Check
} from 'lucide-react';

export const CustomerProductsPage: React.FC = () => {
  const {
    products,
    categories,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredProducts
  } = useProducts();

  const navigate = useNavigate();

  const [isListening, setIsListening] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice search is supported on Google Chrome / mobile browsers. Please type your search query.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ta-IN'; // Tamil & Indian English voice recognition
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSearchQuery(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };
  
  // Bottom Sheet Controls
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);

  // Filter States
  const [sortOption, setSortOption] = useState<'default' | 'newest' | 'price-low' | 'price-high' | 'best-selling' | 'rating'>('default');
  const [filterStock, setFilterStock] = useState<'all' | 'ready' | 'made-to-order'>('all');
  const [maxPrice, setMaxPrice] = useState<number>(200000);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const categoryIcons: Record<string, string> = {
    'All': '✨',
    'Main Gates': '🚪',
    'Windows Grill': '🪟',
    'Tractor Kalappai': '🚜',
    'Steel Furniture': '🪑',
    'Lathe Turning': '⚙',
    'Steel Doors': '🚪',
    'Machine Works': '🛠'
  };

  const sortOptions = [
    { id: 'default', label: 'Recommended' },
    { id: 'newest', label: 'Newest Arrivals' },
    { id: 'price-low', label: 'Price: Low → High' },
    { id: 'price-high', label: 'Price: High → Low' },
    { id: 'best-selling', label: 'Best Selling' },
    { id: 'rating', label: 'Customer Rating' }
  ];

  const toggleWishlist = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setWishlist((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  // Filter and Sort Processing
  let processedProducts = filteredProducts.filter((p) => {
    if (filterStock === 'ready' && !p.isReadyStock) return false;
    if (filterStock === 'made-to-order' && !p.isMadeToOrder) return false;
    if (p.price > maxPrice) return false;
    return true;
  });

  if (sortOption === 'price-low') {
    processedProducts = [...processedProducts].sort((a, b) => a.price - b.price);
  } else if (sortOption === 'price-high') {
    processedProducts = [...processedProducts].sort((a, b) => b.price - a.price);
  } else if (sortOption === 'rating') {
    processedProducts = [...processedProducts].sort((a, b) => b.rating - a.rating);
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 font-sans max-w-7xl mx-auto relative">
      
      {/* STICKY SEARCH & ACTION CONTAINER */}
      <div className="sticky top-[68px] z-30 space-y-3 bg-[#F8F9FA]/90 backdrop-blur-xl py-2">
        
        {/* ROW 1: FULL-WIDTH SEARCH BAR (Height 56px, Radius 18px) */}
        <div className="relative w-full">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F97316]" />
          <input
            type="text"
            placeholder="Search Gates, Windows Grill, Kalappai, Steel Doors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[56px] bg-white text-xs sm:text-sm text-[#111111] pl-11 pr-12 rounded-[18px] border border-gray-200 focus:border-[#F97316] outline-none shadow-sm font-medium transition-all"
          />
          <button
            onClick={handleVoiceSearch}
            title="Voice Search"
            className={`absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${
              isListening ? 'text-[#F97316] animate-ping' : 'text-gray-400 hover:text-[#111111]'
            }`}
          >
            <Mic size={18} />
          </button>
        </div>

        {/* ROW 2: THREE EQUAL GLASS BUTTONS (Height 48px) [ Filter ] [ Sort ] [ Category ] */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setFilterSheetOpen(true)}
            className="h-[48px] bg-white hover:bg-gray-50 text-[#111111] font-heading font-extrabold text-xs rounded-[18px] border border-gray-200 shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <SlidersHorizontal size={16} className="text-[#F97316]" /> Filter
          </button>

          <button
            onClick={() => setSortSheetOpen(true)}
            className="h-[48px] bg-white hover:bg-gray-50 text-[#111111] font-heading font-extrabold text-xs rounded-[18px] border border-gray-200 shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <ArrowUpDown size={16} className="text-[#F97316]" /> Sort
          </button>

          <button
            onClick={() => setCategorySheetOpen(true)}
            className="h-[48px] bg-white hover:bg-gray-50 text-[#111111] font-heading font-extrabold text-xs rounded-[18px] border border-gray-200 shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 line-clamp-1"
          >
            <Layers size={16} className="text-[#F97316]" /> Category
          </button>
        </div>

        {/* ACTIVE REMOVABLE FILTER CHIPS */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {selectedCategory !== 'All' && (
            <span className="bg-black text-white text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1 shrink-0">
              {selectedCategory} <X size={12} className="cursor-pointer" onClick={() => setSelectedCategory('All')} />
            </span>
          )}

          {filterStock !== 'all' && (
            <span className="bg-[#F97316] text-white text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1 shrink-0 uppercase">
              {filterStock} <X size={12} className="cursor-pointer" onClick={() => setFilterStock('all')} />
            </span>
          )}

          {maxPrice < 200000 && (
            <span className="bg-orange-100 text-[#F97316] text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1 shrink-0 border border-orange-200">
              &lt; ₹{maxPrice.toLocaleString('en-IN')} <X size={12} className="cursor-pointer" onClick={() => setMaxPrice(200000)} />
            </span>
          )}
        </div>

      </div>

      {/* PRODUCT COUNT & HEADER */}
      <div className="flex justify-between items-center text-xs font-mono pt-1">
        <span className="text-gray-500">
          Showing <strong className="text-[#111111] font-bold">{processedProducts.length}</strong> products
        </span>
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#111111] text-white' : 'text-gray-400'}`}
          >
            <Grid size={14} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#111111] text-white' : 'text-gray-400'}`}
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* PRODUCTS DISPLAY */}
      {processedProducts.length === 0 ? (
        <div className="bg-white rounded-[22px] p-8 text-center border border-gray-200 my-4 shadow-xs">
          <Search size={40} className="mx-auto text-gray-300 mb-2" />
          <h3 className="font-heading font-bold text-sm text-[#111111]">No matching products found</h3>
          <p className="text-gray-500 text-xs mt-1">Try resetting category or filter parameters.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6" : "space-y-3"}>
          {processedProducts.map((product) => {
            const isLiked = wishlist.includes(product.id);
            return (
              <div
                key={product.id}
                onClick={() => navigate(`/customer/products/${product.id}`)}
                className={`bg-white rounded-[22px] border border-gray-200 p-3 shadow-xs cursor-pointer hover:border-[#F97316] transition-all relative group ${
                  viewMode === 'list' ? 'flex gap-4 items-center' : 'flex flex-col justify-between'
                }`}
              >
                {/* Wishlist Button */}
                <button
                  onClick={(e) => toggleWishlist(e, product.id)}
                  className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-white/80 backdrop-blur-md shadow-xs text-gray-400 hover:text-red-500 transition-transform active:scale-90"
                >
                  <Heart size={14} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
                </button>

                {/* Image */}
                <div className={`relative rounded-2xl overflow-hidden bg-gray-100 aspect-square ${viewMode === 'list' ? 'w-28 shrink-0' : 'w-full'}`}>
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    ★ {product.rating}
                  </span>
                </div>

                {/* Details */}
                <div className={`space-y-1 ${viewMode === 'list' ? 'flex-1' : 'mt-2'}`}>
                  <h3 className="font-heading font-extrabold text-xs sm:text-sm text-[#111111] line-clamp-1">{product.name}</h3>
                  <p className="text-[10px] text-gray-500 font-mono line-clamp-1">{product.specifications.material}</p>
                  
                  <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                    <span className="font-heading font-black text-sm sm:text-base text-[#F97316]">₹{product.price.toLocaleString('en-IN')}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/customer/products/${product.id}`);
                      }}
                      className="px-3 py-1.5 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-heading font-black rounded-xl shadow-xs flex items-center gap-1 active:scale-95"
                    >
                      <ShoppingBag size={12} /> Order
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 1. FILTER BOTTOM SHEET */}
      {filterSheetOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-sm h-full p-6 space-y-6 overflow-y-auto shadow-2xl animate-fade-in flex flex-col justify-between rounded-t-[32px] sm:rounded-none">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h3 className="font-heading font-black text-base text-[#111111] flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-[#F97316]" /> FILTER PRODUCTS
                </h3>
                <button onClick={() => setFilterSheetOpen(false)} className="text-gray-400 hover:text-black">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2">
                <label className="font-heading font-extrabold text-xs text-[#111111] uppercase block">Stock Availability</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    onClick={() => setFilterStock('all')}
                    className={`p-2 rounded-xl font-bold border ${filterStock === 'all' ? 'bg-[#F97316] text-white border-[#F97316]' : 'bg-gray-50 text-gray-700 border-gray-200'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterStock('ready')}
                    className={`p-2 rounded-xl font-bold border ${filterStock === 'ready' ? 'bg-[#F97316] text-white border-[#F97316]' : 'bg-gray-50 text-gray-700 border-gray-200'}`}
                  >
                    Ready Stock
                  </button>
                  <button
                    onClick={() => setFilterStock('made-to-order')}
                    className={`p-2 rounded-xl font-bold border ${filterStock === 'made-to-order' ? 'bg-[#F97316] text-white border-[#F97316]' : 'bg-gray-50 text-gray-700 border-gray-200'}`}
                  >
                    Made to Order
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span>Max Price Limit:</span>
                  <span className="text-[#F97316] font-mono font-black">₹{maxPrice.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="200000"
                  step="5000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#F97316]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 space-y-2">
              <button
                onClick={() => setFilterSheetOpen(false)}
                className="w-full bg-[#111111] hover:bg-[#F97316] text-white font-heading font-black text-xs py-3.5 rounded-xl shadow-md"
              >
                Apply Filters ({processedProducts.length} Results)
              </button>

              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setFilterStock('all');
                  setMaxPrice(200000);
                  setFilterSheetOpen(false);
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-2.5 rounded-xl"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. SORT BOTTOM SHEET */}
      {sortSheetOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-sm h-full p-6 space-y-6 overflow-y-auto shadow-2xl animate-fade-in flex flex-col justify-between rounded-t-[32px] sm:rounded-none">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h3 className="font-heading font-black text-base text-[#111111] flex items-center gap-2">
                  <ArrowUpDown size={18} className="text-[#F97316]" /> SORT PRODUCTS BY
                </h3>
                <button onClick={() => setSortSheetOpen(false)} className="text-gray-400 hover:text-black">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-1">
                {sortOptions.map((opt) => {
                  const isSelected = sortOption === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setSortOption(opt.id as any);
                        setSortSheetOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl text-xs font-heading font-extrabold flex items-center justify-between transition-colors ${
                        isSelected ? 'bg-orange-50 text-[#F97316] border border-orange-200' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check size={16} className="text-[#F97316]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CATEGORY BOTTOM SHEET WITH ICONS */}
      {categorySheetOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-sm h-full p-6 space-y-6 overflow-y-auto shadow-2xl animate-fade-in flex flex-col justify-between rounded-t-[32px] sm:rounded-none">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h3 className="font-heading font-black text-base text-[#111111] flex items-center gap-2">
                  <Layers size={18} className="text-[#F97316]" /> SELECT CATEGORY
                </h3>
                <button onClick={() => setCategorySheetOpen(false)} className="text-gray-400 hover:text-black">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  const icon = categoryIcons[cat] || '🛠';
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setCategorySheetOpen(false);
                      }}
                      className={`p-3 rounded-xl text-left text-xs font-heading font-extrabold flex items-center gap-2 border transition-all ${
                        isSelected ? 'bg-[#111111] text-white border-[#111111]' : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-lg">{icon}</span>
                      <span className="line-clamp-1">{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
