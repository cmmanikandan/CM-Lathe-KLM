import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../types';
import { X, CheckCircle2, ShoppingBag, Star, ShieldCheck, Scale, Award, ArrowRight } from 'lucide-react';

interface ProductCompareModalProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveProduct: (productId: string) => void;
}

export const ProductCompareModal: React.FC<ProductCompareModalProps> = ({
  products,
  isOpen,
  onClose,
  onRemoveProduct,
}) => {
  const navigate = useNavigate();

  if (!isOpen || products.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
      <div className="bg-white rounded-[26px] max-w-5xl w-full overflow-hidden shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="bg-[#111111] text-white p-4 sm:p-5 flex items-center justify-between border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F97316]/20 text-[#F97316] flex items-center justify-center border border-[#F97316]/30 font-black">
              <Scale size={18} />
            </div>
            <div>
              <h2 className="font-heading font-black text-base sm:text-lg text-white">
                Side-by-Side Product Comparison ({products.length}/3)
              </h2>
              <span className="text-[11px] text-gray-400 font-mono">
                MANIKANDAN LATHE WORKS • Kallimandhayam Factory Direct
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Comparison Table */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-4 sm:p-6">
          <table className="w-full text-left border-collapse font-sans min-w-[600px]">
            <thead>
              <tr>
                <th className="p-3 bg-gray-50 border-b border-gray-200 text-xs font-mono font-bold uppercase text-gray-500 w-1/4">
                  Feature / Product
                </th>
                {products.map((item) => (
                  <th key={item.id} className="p-3 border-b border-gray-200 w-1/3 relative text-center bg-gray-50/50">
                    <button
                      onClick={() => onRemoveProduct(item.id)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-gray-200 hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors"
                      title="Remove from comparison"
                    >
                      <X size={14} />
                    </button>

                    <div className="space-y-2 text-center pt-2">
                      <img
                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=200&q=80'}
                        alt={item.name}
                        className="w-24 h-24 rounded-2xl object-contain bg-white border border-gray-200 p-1.5 mx-auto shadow-xs"
                      />
                      <span className="text-[10px] font-mono font-bold text-[#F97316] uppercase block">
                        {item.category}
                      </span>
                      <h3 className="font-heading font-black text-sm text-[#111111] leading-tight">
                        {item.name}
                      </h3>
                      <button
                        onClick={() => {
                          onClose();
                          navigate(`/customer/enquiry/new?productId=${item.id}`);
                        }}
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
                {products.map((item) => (
                  <td key={item.id} className="p-3.5 text-center font-heading font-black text-base text-[#F97316]">
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
                {products.map((item) => (
                  <td key={item.id} className="p-3.5 text-center">
                    <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-full font-bold">
                      <Star size={13} className="fill-amber-400 text-amber-400" />
                      <span>{(item.rating || 5.0).toFixed(1)} / 5.0</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 3: Stock Status */}
              <tr>
                <td className="p-3.5 font-bold text-gray-700 bg-gray-50/70 font-mono">Workshop Availability</td>
                {products.map((item) => (
                  <td key={item.id} className="p-3.5 text-center font-bold">
                    {item.stock > 0 ? (
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-mono">
                        ✓ In Stock ({item.stock} units)
                      </span>
                    ) : (
                      <span className="text-orange-950 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full font-mono">
                        ⚙ Custom Made to Order
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Row 4: Material & Specifications */}
              <tr>
                <td className="p-3.5 font-bold text-gray-700 bg-gray-50/70 font-mono">Steel & Forging Material</td>
                {products.map((item) => (
                  <td key={item.id} className="p-3.5 text-center font-medium">
                    {item.specifications?.material || 'Heavy Gauge Structural Steel'}
                  </td>
                ))}
              </tr>

              {/* Row 5: Dimensions / Sizes */}
              <tr>
                <td className="p-3.5 font-bold text-gray-700 bg-gray-50/70 font-mono">Available Dimensions</td>
                {products.map((item) => (
                  <td key={item.id} className="p-3.5 text-center font-mono">
                    {item.variants && item.variants.length > 0 ? (
                      <div className="space-y-1">
                        {item.variants.map((v) => (
                          <span key={v.id} className="block text-[11px] bg-gray-100 py-0.5 px-2 rounded">
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
                {products.map((item) => (
                  <td key={item.id} className="p-3.5 text-center text-emerald-800 font-bold">
                    <span className="flex items-center justify-center gap-1">
                      <ShieldCheck size={14} className="text-emerald-600" /> Factory Certified
                    </span>
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 shrink-0 flex items-center justify-between text-xs">
          <span className="text-gray-500 font-mono">
            * All prices include GST invoice and workshop quality check.
          </span>
          <button
            onClick={onClose}
            className="bg-[#111111] hover:bg-gray-800 text-white font-heading font-black px-5 py-2 rounded-xl shadow-xs transition-colors"
          >
            Close Comparison
          </button>
        </div>

      </div>
    </div>
  );
};
