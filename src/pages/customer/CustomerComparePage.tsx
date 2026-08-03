import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { Product } from '../../types';
import {
  ArrowLeft,
  X,
  ShoppingBag,
  Star,
  ShieldCheck,
  Scale,
  Package,
  CheckCircle2
} from 'lucide-react';

export const CustomerComparePage: React.FC = () => {
  const { products } = useProducts();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract selected compare IDs from query params: ?ids=p1,p2,p3
  const idsParam = searchParams.get('ids') || '';
  const selectedIds = idsParam ? idsParam.split(',').filter(Boolean) : [];

  const comparedProducts: Product[] = selectedIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  const handleRemoveProduct = (id: string) => {
    const updatedIds = selectedIds.filter((item) => item !== id);
    if (updatedIds.length > 0) {
      setSearchParams({ ids: updatedIds.join(',') });
    } else {
      navigate('/customer/products');
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#F8F9FA] flex flex-col font-sans">
      
      {/* 1. TOP STICKY HEADER */}
      <div className="bg-[#111111] text-white px-4 py-3 shadow-xs flex items-center justify-between gap-3 shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/customer/products');
              }
            }}
            className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white transition-colors cursor-pointer shrink-0"
            title="Back"
          >
            <ArrowLeft size={20} className="text-[#F97316]" />
          </button>

          <div>
            <h1 className="font-heading font-black text-sm sm:text-base text-white flex items-center gap-2">
              <Scale size={18} className="text-[#F97316]" /> Product Specification Comparison
            </h1>
            <p className="text-[10px] text-gray-400 font-mono">
              MANIKANDAN LATHE WORKS • Kallimandhayam Factory Direct
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/customer/products')}
          className="bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-heading font-black px-3.5 py-1.5 rounded-xl shadow-xs"
        >
          Catalog →
        </button>
      </div>

      {/* 2. SCROLLABLE COMPARISON TABLE CONTENT (Mobile & Desktop Responsive) */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-6 space-y-4 overflow-x-auto">
        {comparedProducts.length === 0 ? (
          <div className="bg-white rounded-[26px] p-10 text-center border border-gray-200 shadow-xs space-y-4 my-8">
            <Package size={40} className="mx-auto text-gray-300" />
            <h3 className="font-heading font-black text-base text-[#111111]">No products selected for comparison</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Please select products from the product catalog to compare specifications, dimensions, and prices side-by-side.
            </p>
            <button
              onClick={() => navigate('/customer/products')}
              className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-6 py-3 rounded-xl shadow-md"
            >
              Browse Products Catalog →
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-[26px] border border-gray-200 shadow-xs overflow-hidden">
            
            {/* COMPARISON CARDS / TABLE GRID */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans min-w-[550px]">
                <thead>
                  <tr>
                    <th className="p-4 bg-gray-50 border-b border-gray-200 text-xs font-mono font-bold uppercase text-gray-500 w-1/4">
                      Specification
                    </th>
                    {comparedProducts.map((item) => (
                      <th key={item.id} className="p-4 border-b border-gray-200 w-1/3 relative text-center bg-gray-50/50">
                        {comparedProducts.length > 1 && (
                          <button
                            onClick={() => handleRemoveProduct(item.id)}
                            className="absolute top-2 right-2 p-1 rounded-full bg-gray-200 hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                            title="Remove from comparison"
                          >
                            <X size={14} />
                          </button>
                        )}

                        <div className="space-y-2 text-center pt-2">
                          <img
                            src={item.images?.[0] || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=200&q=80'}
                            alt={item.name}
                            className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-contain bg-white border border-gray-200 p-2 mx-auto shadow-xs"
                          />
                          <span className="text-[10px] font-mono font-bold text-[#F97316] uppercase block truncate">
                            {item.category}
                          </span>
                          <h3 className="font-heading font-black text-xs sm:text-sm text-[#111111] leading-tight line-clamp-2">
                            {item.name}
                          </h3>
                          
                          <button
                            onClick={() => navigate(`/customer/enquiry/new?productId=${item.id}`)}
                            className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs py-2 px-3 rounded-xl shadow-xs flex items-center justify-center gap-1 active:scale-95 transition-transform"
                          >
                            <ShoppingBag size={13} /> Order Enquiry
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-xs text-gray-800">
                  
                  {/* Row 1: Factory Price */}
                  <tr>
                    <td className="p-3.5 font-bold text-gray-700 bg-gray-50/70 font-mono">Special Factory Price</td>
                    {comparedProducts.map((item) => (
                      <td key={item.id} className="p-3.5 text-center font-heading font-black text-sm sm:text-base text-[#F97316]">
                        ₹{(item.variants?.[0]?.price || item.price || 0).toLocaleString('en-IN')}
                        {item.discountPrice && (
                          <span className="text-[11px] text-gray-400 line-through font-mono block">
                            ₹{item.discountPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Row 2: Customer Rating */}
                  <tr>
                    <td className="p-3.5 font-bold text-gray-700 bg-gray-50/70 font-mono">Customer Rating</td>
                    {comparedProducts.map((item) => (
                      <td key={item.id} className="p-3.5 text-center">
                        <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-full font-bold text-[11px]">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          <span>{(item.rating || 5.0).toFixed(1)} / 5.0</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Row 3: Stock Status */}
                  <tr>
                    <td className="p-3.5 font-bold text-gray-700 bg-gray-50/70 font-mono">Stock Availability</td>
                    {comparedProducts.map((item) => (
                      <td key={item.id} className="p-3.5 text-center font-bold">
                        {item.stock > 0 ? (
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-mono text-[10px]">
                            ✓ Ready Stock ({item.stock} units)
                          </span>
                        ) : (
                          <span className="text-orange-950 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full font-mono text-[10px]">
                            ⚙ Made to Order
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Row 4: Material & Specifications */}
                  <tr>
                    <td className="p-3.5 font-bold text-gray-700 bg-gray-50/70 font-mono">Steel & Forging Material</td>
                    {comparedProducts.map((item) => (
                      <td key={item.id} className="p-3.5 text-center font-medium text-xs">
                        {item.specifications?.material || 'Heavy Gauge Structural Steel'}
                      </td>
                    ))}
                  </tr>

                  {/* Row 5: Dimensions / Sizes */}
                  <tr>
                    <td className="p-3.5 font-bold text-gray-700 bg-gray-50/70 font-mono">Available Dimensions</td>
                    {comparedProducts.map((item) => (
                      <td key={item.id} className="p-3.5 text-center font-mono text-[11px]">
                        {item.variants && item.variants.length > 0 ? (
                          <div className="space-y-1">
                            {item.variants.map((v) => (
                              <span key={v.id} className="block bg-gray-100 py-0.5 px-2 rounded">
                                {v.name}: ₹{v.price.toLocaleString('en-IN')}
                              </span>
                            ))}
                          </div>
                        ) : (
                          item.specifications?.size || 'Custom Dimensions Available'
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Row 6: Quality Guarantee */}
                  <tr>
                    <td className="p-3.5 font-bold text-gray-700 bg-gray-50/70 font-mono">Workshop Warranty</td>
                    {comparedProducts.map((item) => (
                      <td key={item.id} className="p-3.5 text-center text-emerald-800 font-bold text-xs">
                        <span className="inline-flex items-center gap-1">
                          <ShieldCheck size={14} className="text-emerald-600" /> Factory Certified
                        </span>
                      </td>
                    ))}
                  </tr>

                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 p-4 text-xs font-mono text-gray-500 text-center">
              * All prices include GST invoice and workshop quality check at Kallimandhayam factory.
            </div>

          </div>
        )}
      </div>

    </div>
  );
};
