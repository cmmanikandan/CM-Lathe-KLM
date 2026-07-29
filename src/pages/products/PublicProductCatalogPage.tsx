import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { LoginRequiredModal } from '../../components/common/LoginRequiredModal';
import { createProductInquiryWhatsApp } from '../../services/whatsappService';
import {
  Search,
  Mic,
  Phone,
  MessageCircle,
  Eye,
  Send,
  ShoppingBag,
  Star,
  CheckCircle2,
  Lock
} from 'lucide-react';

export const PublicProductCatalogPage: React.FC = () => {
  const { products, categories, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, filteredProducts } = useProducts();
  const navigate = useNavigate();

  const [isListening, setIsListening] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [selectedProductName, setSelectedProductName] = useState('');
  
  // Enquiry Modal State
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [enquiryProduct, setEnquiryProduct] = useState<string>('');
  const [enquiryName, setEnquiryName] = useState('');
  const [enquiryPhone, setEnquiryPhone] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [enquirySent, setEnquirySent] = useState(false);

  const handleVoiceSearch = () => {
    setIsListening(true);
    setTimeout(() => {
      setSearchQuery('Kalappai');
      setIsListening(false);
    }, 1500);
  };

  const handleOrderClick = (productName: string) => {
    setSelectedProductName(productName);
    setLoginModalOpen(true);
  };

  const handleOpenEnquiry = (productName: string) => {
    setEnquiryProduct(productName);
    setEnquiryModalOpen(true);
  };

  const handleSendEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    setEnquirySent(true);
    setTimeout(() => {
      setEnquirySent(false);
      setEnquiryModalOpen(false);
      setEnquiryName('');
      setEnquiryPhone('');
      setEnquiryMessage('');
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111] font-sans antialiased">
      <PublicNavbar />

      {/* Hero Header Banner */}
      <section className="bg-[#111111] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-7xl mx-auto space-y-3">
          <span className="text-[#F97316] font-mono text-xs font-bold uppercase tracking-widest block">
            Public Machinery Showcase & Quotation Catalog
          </span>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white">
            OUR PRODUCT CATALOG
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Browse heavy tractor cultivators, CNC laser cut main safety gates, window grills, and precision lathe turning products.
          </p>
        </div>
      </section>

      {/* Main Catalog Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Search & Category Action Bar (Full-Width Search Bar Row 1, Category Chips Row 2) */}
        <div className="bg-white p-4 rounded-[22px] border border-gray-200 shadow-xs space-y-3">
          {/* ROW 1: Full-Width Search Bar */}
          <div className="relative w-full">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F97316]" />
            <input
              type="text"
              placeholder="Search Gates, Windows Grill, Kalappai, Steel Doors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[56px] bg-gray-100 focus:bg-white text-xs sm:text-sm text-[#111111] pl-11 pr-12 rounded-[18px] border border-gray-200 focus:border-[#F97316] outline-none font-medium transition-all"
            />
            <button
              onClick={handleVoiceSearch}
              className={`absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${
                isListening ? 'text-[#F97316] animate-ping' : 'text-gray-400 hover:text-[#111111]'
              }`}
              title="Voice Search"
            >
              <Mic size={18} />
            </button>
          </div>

          {/* ROW 2: Category Selector Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-heading font-extrabold shrink-0 transition-all ${
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

        {/* Product Count Header */}
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-gray-500">
            Showing <strong className="text-[#111111] font-bold">{filteredProducts.length}</strong> products
          </span>
          {selectedCategory !== 'All' && (
            <span className="text-[#F97316] font-bold uppercase">{selectedCategory}</span>
          )}
        </div>

        {/* Public Product Grid (1 to 4 Columns) */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-[22px] p-8 text-center border border-gray-200 my-4 shadow-xs">
            <Search size={40} className="mx-auto text-gray-300 mb-2" />
            <h3 className="font-heading font-bold text-sm text-[#111111]">No matching products found</h3>
            <p className="text-gray-500 text-xs mt-1">Try clearing search terms or category filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(`/products/${product.id}`)}
                className="bg-white rounded-[22px] border border-gray-200/80 p-3 shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#F97316] transition-all group"
              >
                <div>
                  <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-square flex items-center justify-center">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 bg-[#F97316] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                      {product.badgeText || 'Custom Forged'}
                    </span>
                    <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      ★ {product.rating}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1">
                    <h3 className="font-heading font-black text-sm text-[#111111] line-clamp-1 group-hover:text-[#F97316] transition-colors">
                      {product.name}
                    </h3>

                    <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>

                    <div className="pt-2 flex items-baseline justify-between border-t border-gray-100">
                      <div>
                        <span className="text-[10px] text-gray-400 font-mono uppercase block">Starting Price</span>
                        <span className="font-heading font-black text-base text-[#F97316]">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#111111] group-hover:text-[#F97316] flex items-center gap-0.5">
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons Row for Public Visitors */}
                <div className="pt-3 space-y-2 border-t border-gray-100 mt-3" onClick={(e) => e.stopPropagation()}>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={createProductInquiryWhatsApp(product.name, product.category)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-heading font-black text-[11px] py-2 rounded-xl flex items-center justify-center gap-1 shadow-xs"
                    >
                      <MessageCircle size={14} /> WhatsApp
                    </a>

                    <button
                      onClick={() => handleOpenEnquiry(product.name)}
                      className="bg-gray-100 hover:bg-gray-200 text-[#111111] font-heading font-black text-[11px] py-2 rounded-xl flex items-center justify-center gap-1"
                    >
                      <Send size={14} /> Send Enquiry
                    </button>
                  </div>

                  <button
                    onClick={() => handleOrderClick(product.name)}
                    className="w-full bg-[#111111] hover:bg-[#F97316] text-white font-heading font-black text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <Lock size={14} className="text-[#F97316]" /> Order Now (Login Required)
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* LOGIN REQUIRED MODAL DIALOG */}
      <LoginRequiredModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        productName={selectedProductName}
      />

      {/* ENQUIRY MODAL FORM */}
      {enquiryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] max-w-md w-full p-5 space-y-4 shadow-2xl border border-gray-200">
            {enquirySent ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 size={40} className="mx-auto text-green-600" />
                <h3 className="font-heading font-black text-lg text-[#111111]">Enquiry Dispatched!</h3>
                <p className="text-xs text-gray-500">Our engineering workshop team will contact you shortly.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <div>
                    <h3 className="font-heading font-black text-sm text-[#111111]">SEND PRODUCT INQUIRY</h3>
                    <p className="text-[11px] text-[#F97316] font-bold line-clamp-1">{enquiryProduct}</p>
                  </div>
                  <button onClick={() => setEnquiryModalOpen(false)} className="text-gray-400 hover:text-black">✕</button>
                </div>

                <form onSubmit={handleSendEnquiry} className="space-y-3 text-xs font-sans">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={enquiryName}
                      onChange={(e) => setEnquiryName(e.target.value)}
                      placeholder="Senthil Kumar"
                      className="w-full bg-gray-100 p-2.5 rounded-xl border border-gray-300 font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Mobile / WhatsApp Number *</label>
                    <input
                      type="tel"
                      required
                      value={enquiryPhone}
                      onChange={(e) => setEnquiryPhone(e.target.value)}
                      placeholder="+91 96592 86268"
                      className="w-full bg-gray-100 p-2.5 rounded-xl border border-gray-300 font-mono font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Custom Requirement Details</label>
                    <textarea
                      rows={3}
                      value={enquiryMessage}
                      onChange={(e) => setEnquiryMessage(e.target.value)}
                      placeholder="Specify required size, dimensions, material grade..."
                      className="w-full bg-gray-100 p-2.5 rounded-xl border border-gray-300 text-xs outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs py-3 rounded-xl shadow-md mt-1"
                  >
                    Submit Quotation Inquiry
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <PublicFooter />
    </div>
  );
};
