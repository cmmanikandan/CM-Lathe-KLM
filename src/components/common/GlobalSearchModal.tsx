import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { useEnquiries } from '../../context/EnquiryContext';
import { useRefunds } from '../../context/RefundContext';
import { useProducts } from '../../context/ProductContext';
import {
  Search,
  X,
  FileText,
  Receipt,
  RotateCcw,
  User,
  ShoppingBag,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Package,
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { orders } = useOrders();
  const { enquiries } = useEnquiries();
  const { refunds } = useRefunds();
  const { products } = useProducts();

  const handleCopy = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { orders: [], enquiries: [], refunds: [], products: [] };

    const matchingOrders = orders.filter((o) => {
      const isMatch =
        o.orderNumber.toLowerCase().includes(q) ||
        (o.id && o.id.toLowerCase().includes(q)) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        (o.customerAddress && o.customerAddress.toLowerCase().includes(q)) ||
        o.paymentHistory.some((p) => p.receiptNumber.toLowerCase().includes(q));
      return isMatch;
    });

    const matchingEnquiries = enquiries.filter((e) => {
      return (
        e.enquiryNumber.toLowerCase().includes(q) ||
        e.customerName.toLowerCase().includes(q) ||
        e.customerPhone.includes(q) ||
        e.productName.toLowerCase().includes(q)
      );
    });

    const matchingRefunds = refunds.filter((r) => {
      return (
        r.refundNumber.toLowerCase().includes(q) ||
        r.orderNumber.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.customerPhone.includes(q)
      );
    });

    const matchingProducts = products.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.id && p.id.toLowerCase().includes(q))
      );
    });

    return {
      orders: matchingOrders.slice(0, 10),
      enquiries: matchingEnquiries.slice(0, 10),
      refunds: matchingRefunds.slice(0, 10),
      products: matchingProducts.slice(0, 10),
    };
  }, [query, orders, enquiries, refunds, products]);

  if (!isOpen) return null;

  const totalResultsCount =
    results.orders.length + results.enquiries.length + results.refunds.length + results.products.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 font-sans pt-12 overflow-y-auto">
      <div className="bg-white rounded-[24px] max-w-3xl w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col my-auto max-h-[85vh]">
        
        {/* Top Search Input Bar */}
        <div className="bg-[#111111] p-4 text-white flex items-center gap-3 border-b border-gray-800 shrink-0">
          <Search size={22} className="text-[#FF6A00] shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search by Order #, Invoice #, POS Bill #, Customer Name, Mobile, SKU, QR..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white font-sans text-sm outline-none placeholder-gray-500 font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-gray-400 hover:text-white p-1 text-xs font-mono"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 bg-gray-800 hover:bg-red-600 rounded-xl text-gray-400 hover:text-white transition-colors ml-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Results Display Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 bg-gray-50/80 custom-scrollbar">
          
          {!query.trim() && (
            <div className="text-center py-12 space-y-2 text-gray-500 font-mono text-xs">
              <Search size={36} className="mx-auto text-gray-300 mb-2" />
              <p className="font-bold text-gray-700">Global ERP Database Search</p>
              <p className="text-[11px] text-gray-400">
                Supports ORD-202607-000001, POS-20260728-000001, ENQ-202607-000231, INV-2026-000001, REF-202607-000021, CUS-000245, Mobile, Name.
              </p>
            </div>
          )}

          {query.trim() && totalResultsCount === 0 && (
            <div className="text-center py-12 text-gray-500 font-mono text-xs">
              No database records found matching "<span className="font-bold text-[#111111]">{query}</span>".
            </div>
          )}

          {/* Orders / POS Bills Section */}
          {results.orders.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-black text-gray-500 uppercase tracking-wider block">
                ORDERS & POS BILLS ({results.orders.length})
              </span>
              <div className="space-y-2">
                {results.orders.map((o) => (
                  <div
                    key={o.id}
                    onClick={() => {
                      onClose();
                      navigate(`/admin/orders/${o.id}`);
                    }}
                    className="bg-white p-3.5 rounded-2xl border border-gray-200 hover:border-[#FF6A00] shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6A00] flex items-center justify-center font-bold text-xs shrink-0 border border-orange-200">
                        {o.orderNumber.startsWith('POS') ? 'POS' : 'ORD'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-black text-xs text-[#111111] group-hover:text-[#FF6A00] transition-colors">
                            {o.orderNumber}
                          </span>
                          <button
                            onClick={(e) => handleCopy(e, o.orderNumber)}
                            className="text-gray-400 hover:text-gray-700 p-0.5"
                            title="Copy Order Number"
                          >
                            {copiedId === o.orderNumber ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                          </button>
                        </div>
                        <p className="text-[11px] text-gray-600 font-mono">
                          {o.customerName} · {o.customerPhone}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3 font-mono">
                      <div>
                        <strong className="text-xs text-green-700 block">₹{o.finalPrice.toLocaleString('en-IN')}</strong>
                        <span className="text-[9px] text-gray-400 uppercase">{o.status}</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400 group-hover:text-[#FF6A00]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enquiries Section */}
          {results.enquiries.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-black text-gray-500 uppercase tracking-wider block">
                CUSTOMER ENQUIRIES ({results.enquiries.length})
              </span>
              <div className="space-y-2">
                {results.enquiries.map((e) => (
                  <div
                    key={e.id}
                    onClick={() => {
                      onClose();
                      navigate('/admin/enquiries');
                    }}
                    className="bg-white p-3.5 rounded-2xl border border-gray-200 hover:border-amber-500 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-200">
                        ENQ
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-black text-xs text-[#111111] group-hover:text-amber-600 transition-colors">
                            {e.enquiryNumber}
                          </span>
                          <button
                            onClick={(evt) => handleCopy(evt, e.enquiryNumber)}
                            className="text-gray-400 hover:text-gray-700 p-0.5"
                            title="Copy Enquiry Number"
                          >
                            {copiedId === e.enquiryNumber ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                          </button>
                        </div>
                        <p className="text-[11px] text-gray-600 font-mono">
                          {e.customerName} · {e.productName}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3 font-mono">
                      <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {e.status}
                      </span>
                      <ChevronRight size={16} className="text-gray-400 group-hover:text-amber-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Refunds Section */}
          {results.refunds.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-black text-gray-500 uppercase tracking-wider block">
                REFUND RECORDS ({results.refunds.length})
              </span>
              <div className="space-y-2">
                {results.refunds.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => {
                      onClose();
                      navigate('/admin/refunds');
                    }}
                    className="bg-white p-3.5 rounded-2xl border border-gray-200 hover:border-red-500 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs shrink-0 border border-red-200">
                        REF
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-black text-xs text-[#111111] group-hover:text-red-600 transition-colors">
                            {r.refundNumber}
                          </span>
                          <button
                            onClick={(evt) => handleCopy(evt, r.refundNumber)}
                            className="text-gray-400 hover:text-gray-700 p-0.5"
                            title="Copy Refund Number"
                          >
                            {copiedId === r.refundNumber ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                          </button>
                        </div>
                        <p className="text-[11px] text-gray-600 font-mono">
                          {r.customerName} · Order #{r.orderNumber}
                        </p>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <strong className="text-xs text-red-600 block">₹{r.refundAmount.toLocaleString('en-IN')}</strong>
                      <span className="text-[9px] text-gray-400 uppercase">{r.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products Section */}
          {results.products.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-black text-gray-500 uppercase tracking-wider block">
                CATALOG PRODUCTS ({results.products.length})
              </span>
              <div className="space-y-2">
                {results.products.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onClose();
                      navigate(`/products/${p.id}`);
                    }}
                    className="bg-white p-3.5 rounded-2xl border border-gray-200 hover:border-gray-800 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-xl object-cover border shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold shrink-0">
                          <Package size={18} />
                        </div>
                      )}
                      <div>
                        <div className="font-heading font-black text-xs text-[#111111] group-hover:text-[#FF6A00]">
                          {p.name}
                        </div>
                        <p className="text-[11px] text-gray-500 font-mono">{p.category}</p>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <strong className="text-xs text-[#111111]">₹{p.price.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
