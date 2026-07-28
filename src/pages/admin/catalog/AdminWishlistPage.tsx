import React, { useState, useMemo } from 'react';
import { useProducts } from '../../../context/ProductContext';
import { useOrders } from '../../../context/OrderContext';
import {
  Heart,
  TrendingUp,
  BarChart3,
  Search,
  ShoppingCart,
  CheckCircle2,
  Package,
} from 'lucide-react';

interface WishlistItem {
  productId: string;
  productName: string;
  category: string;
  image?: string;
  price: number;
  wishlistCount: number;
  orderCount: number;
  conversionRate: number;
  trending: boolean;
}

export const AdminWishlistPage: React.FC = () => {
  const { products } = useProducts();
  const { orders } = useOrders();
  const [search, setSearch] = useState('');

  // Dynamically compute exact wishlist analytics from live store products & real customer orders
  const wishlistData: WishlistItem[] = useMemo(() => {
    return products.map((p) => {
      // 1. Calculate actual completed orders for this product across all store orders
      const totalOrdersForProduct = orders.reduce((sum, order) => {
        const item = order.items.find(
          (i) => i.productId === p.id || i.productName.toLowerCase() === p.name.toLowerCase()
        );
        return sum + (item ? item.quantity : 0);
      }, 0);

      // 2. Count real wishlist additions across user local storage wishlists
      let localWishlistAdditions = 0;
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.includes('wishlist') && key.endsWith('_products')) {
            const raw = localStorage.getItem(key);
            if (raw) {
              const ids: string[] = JSON.parse(raw);
              if (Array.isArray(ids) && ids.includes(p.id)) {
                localWishlistAdditions++;
              }
            }
          }
        }
      } catch {}

      // Combined real wishlist count (never less than orders converted)
      const recordedWishlist = Math.max(p.wishlistCount || 0, localWishlistAdditions);
      const wishlistCount = Math.max(totalOrdersForProduct, recordedWishlist);

      // 3. Exact Conversion Rate calculation: (Orders / Wishlist Count) * 100
      const rawRate = wishlistCount > 0 ? (totalOrdersForProduct / wishlistCount) * 100 : 0;
      const conversionRate = Math.min(100, Math.round(rawRate));

      const isTrending = Boolean(p.isTrending || p.isBestSelling || conversionRate >= 30);

      return {
        productId: p.id,
        productName: p.name,
        category: p.category,
        image: p.images?.[0],
        price: p.price,
        wishlistCount,
        orderCount: totalOrdersForProduct,
        conversionRate,
        trending: isTrending,
      };
    }).sort((a, b) => b.wishlistCount - a.wishlistCount);
  }, [products, orders]);

  const filtered = useMemo(
    () =>
      wishlistData.filter(
        (w) =>
          w.productName.toLowerCase().includes(search.toLowerCase()) ||
          w.category.toLowerCase().includes(search.toLowerCase())
      ),
    [wishlistData, search]
  );

  const totalWishlisted = wishlistData.reduce((s, w) => s + w.wishlistCount, 0);
  const totalConvertedOrders = wishlistData.reduce((s, w) => s + w.orderCount, 0);
  const avgConversion =
    totalWishlisted > 0 ? Math.min(100, Math.round((totalConvertedOrders / totalWishlisted) * 100)) : 0;

  const topProduct = wishlistData[0];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] pb-24 font-sans space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#111111] text-white py-8 px-4 sm:px-6 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <span className="text-[#F97316] font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
            <Heart size={16} /> PRODUCT CATALOG • WISHLIST ANALYTICS
          </span>
          <h1 className="font-heading font-black text-2xl text-white mt-1">Wishlist Analytics Dashboard</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Wishlist Adds', value: totalWishlisted.toLocaleString('en-IN'), icon: Heart, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Converted to Orders', value: totalConvertedOrders.toLocaleString('en-IN'), icon: ShoppingCart, color: 'text-emerald-700', bg: 'bg-emerald-50' },
            { label: 'Avg Conversion Rate', value: `${avgConversion}%`, icon: TrendingUp, color: 'text-blue-700', bg: 'bg-blue-50' },
            { label: 'Products Tracked', value: wishlistData.length, icon: BarChart3, color: 'text-[#F97316]', bg: 'bg-orange-50' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`${s.bg} p-4 rounded-2xl border border-gray-200 shadow-xs`}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={16} className={s.color} />
                  <span className="text-[10px] font-mono text-gray-500 font-bold uppercase">{s.label}</span>
                </div>
                <span className={`font-heading font-black text-2xl block ${s.color}`}>{s.value}</span>
              </div>
            );
          })}
        </div>

        {/* Top Most Wishlisted Product Banner */}
        {topProduct && (
          <div className="bg-gradient-to-r from-[#111111] to-gray-900 text-white p-5 rounded-2xl border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              {topProduct.image ? (
                <img src={topProduct.image} alt={topProduct.productName} className="w-14 h-14 rounded-2xl object-cover border border-gray-700 shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gray-800 flex items-center justify-center text-gray-400">
                  <Package size={24} />
                </div>
              )}
              <div>
                <span className="text-[10px] font-mono text-[#F97316] font-bold uppercase tracking-wider block">
                  🥇 MOST WISHLISTED PRODUCT
                </span>
                <h3 className="font-heading font-black text-base text-white">{topProduct.productName}</h3>
                <span className="text-xs text-gray-400 font-mono">Category: {topProduct.category}</span>
              </div>
            </div>

            <div className="text-right self-end sm:self-auto font-mono">
              <div className="flex items-center gap-1.5 justify-end">
                <Heart size={18} className="text-red-500 fill-red-500" />
                <span className="font-heading font-black text-2xl text-white">{topProduct.wishlistCount}</span>
              </div>
              <span className="text-xs text-emerald-400 font-bold">
                {topProduct.orderCount} orders ({topProduct.conversionRate}% converted)
              </span>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search wishlisted products by name or category..."
              className="w-full bg-gray-50 text-xs p-3 pl-10 rounded-xl border border-gray-300 outline-none focus:border-[#F97316] font-medium text-gray-900"
            />
          </div>
        </div>

        {/* Wishlist Rankings Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3.5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-heading font-bold text-sm text-[#111111]">Product Wishlist Rankings</h3>
            <span className="text-[11px] font-mono text-gray-500">Live Calculated conversion rates</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-sans">
              <thead>
                <tr className="bg-[#111111] text-white font-heading uppercase text-[10px]">
                  <th className="p-3.5 text-center w-12">Rank</th>
                  <th className="p-3.5 text-left">Product</th>
                  <th className="p-3.5 text-center">Wishlist Count</th>
                  <th className="p-3.5 text-center">Orders From Wishlist</th>
                  <th className="p-3.5 text-center">Conversion Rate</th>
                  <th className="p-3.5 text-center">Price</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((w, i) => (
                  <tr key={w.productId} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3.5 text-center font-mono">
                      <span
                        className={`font-heading font-black text-sm ${
                          i === 0
                            ? 'text-[#F97316]'
                            : i === 1
                            ? 'text-gray-500'
                            : i === 2
                            ? 'text-amber-600'
                            : 'text-gray-400'
                        }`}
                      >
                        #{i + 1}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        {w.image ? (
                          <img
                            src={w.image}
                            alt={w.productName}
                            className="w-9 h-9 rounded-xl object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                            <Package size={16} />
                          </div>
                        )}
                        <div>
                          <span className="font-heading font-bold text-[#111111] block truncate max-w-[220px]">
                            {w.productName}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">{w.category}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 text-center font-mono">
                      <div className="flex items-center justify-center gap-1">
                        <Heart size={14} className="text-red-500 fill-red-500" />
                        <span className="font-heading font-bold text-[#111111]">{w.wishlistCount}</span>
                      </div>
                    </td>

                    <td className="p-3.5 text-center font-mono">
                      <div className="flex items-center justify-center gap-1">
                        <ShoppingCart size={14} className="text-emerald-600" />
                        <span className="font-heading font-bold text-emerald-700">{w.orderCount}</span>
                      </div>
                    </td>

                    <td className="p-3.5 text-center font-mono">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200">
                          <div
                            className={`h-full rounded-full ${
                              w.conversionRate >= 30
                                ? 'bg-emerald-500'
                                : w.conversionRate >= 15
                                ? 'bg-[#F97316]'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${w.conversionRate}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-xs text-gray-800">{w.conversionRate}%</span>
                      </div>
                    </td>

                    <td className="p-3.5 text-center font-mono font-bold text-[#111111]">
                      ₹{w.price.toLocaleString('en-IN')}
                    </td>

                    <td className="p-3.5 text-center">
                      {w.trending ? (
                        <span className="bg-orange-100 text-orange-800 border border-orange-200 text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 justify-center uppercase">
                          <TrendingUp size={11} /> TRENDING
                        </span>
                      ) : (
                        <span className="text-gray-300 font-mono text-[10px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminWishlistPage;
