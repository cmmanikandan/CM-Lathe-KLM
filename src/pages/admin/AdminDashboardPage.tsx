import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { useProducts } from '../../context/ProductContext';
import { useStatus } from '../../context/StatusContext';
import {
  IndianRupee,
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertTriangle,
  PlusCircle,
  Flame,
  UserCheck,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { orders } = useOrders();
  const { products } = useProducts();
  const { activeStories } = useStatus();
  const navigate = useNavigate();

  // Metrics Calculations
  const onlineOrders = orders.filter((o) => !o.isOfflineOrder);
  const offlineOrders = orders.filter((o) => Boolean(o.isOfflineOrder));

  const totalRevenue = orders.reduce((sum, o) => {
    const paid = o.paymentHistory.reduce((s, p) => s + p.amount, 0);
    return sum + paid;
  }, 0);

  const onlineRevenue = onlineOrders.reduce((sum, o) => sum + o.paymentHistory.reduce((s, p) => s + p.amount, 0), 0);
  const offlineRevenue = offlineOrders.reduce((sum, o) => sum + o.paymentHistory.reduce((s, p) => s + p.amount, 0), 0);

  const pendingBalanceTotal = orders.reduce((sum, o) => sum + o.remainingBalance, 0);
  const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString()).length;

  // Inventory & Sales Metrics
  const lowStockProducts = products.filter((p) => (p.stock || 0) <= 5);
  const totalProductsCount = products.length;
  const totalQuantitySold = orders.reduce((sum, o) => sum + o.items.reduce((isum, item) => isum + item.quantity, 0), 0);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] pb-24">
      
      {/* Header Banner */}
      <div className="bg-[#111111] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[#F97316] font-heading font-extrabold text-xs uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck size={16} /> OFFICIAL MANAGEMENT PORTAL
            </span>
            <h1 className="font-heading font-black text-3xl text-white mt-1">
              MANIKANDAN LATHE DASHBOARD
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/offline-order"
              className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
            >
              <PlusCircle size={16} /> New Walk-in Offline Order
            </Link>

            <Link
              to="/admin/customers"
              className="bg-white/10 hover:bg-white/20 text-white font-heading font-bold text-xs px-3.5 py-2.5 rounded-xl border border-white/20 flex items-center gap-1.5 cursor-pointer"
            >
              <UserCheck size={16} className="text-[#F97316]" /> Customers
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Revenue Collected */}
          <div className="card-industrial p-6 bg-white border-l-4 border-l-[#F97316]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-500 font-bold uppercase">Total Revenue Collected</span>
              <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 text-[#F97316] flex items-center justify-center font-bold">
                <IndianRupee size={20} />
              </div>
            </div>
            <h3 className="font-heading font-black text-3xl text-[#111111] mt-3">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-green-600 font-bold mt-1 flex items-center gap-1">
              <TrendingUp size={12} /> Received across all transactions
            </p>
          </div>

          {/* Pending Customer Balances */}
          <div className="card-industrial p-6 bg-white border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-500 font-bold uppercase">Pending Balance Due</span>
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <AlertTriangle size={20} />
              </div>
            </div>
            <h3 className="font-heading font-black text-3xl text-amber-900 mt-3">
              ₹{pendingBalanceTotal.toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-amber-700 font-medium mt-1">
              Outstanding across active orders
            </p>
          </div>

          {/* Online vs Offline Orders Count */}
          <div className="card-industrial p-6 bg-white border-l-4 border-l-blue-600">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-500 font-bold uppercase">🌐 Online App Orders</span>
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <ShoppingBag size={20} />
              </div>
            </div>
            <h3 className="font-heading font-black text-3xl text-blue-600 mt-3">
              {onlineOrders.length}
            </h3>
            <p className="text-[11px] text-blue-700 font-bold mt-1">
              ₹{onlineRevenue.toLocaleString('en-IN')} total revenue
            </p>
          </div>

          {/* Offline Walk-in Shop Count */}
          <div className="card-industrial p-6 bg-white border-l-4 border-l-emerald-600">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-500 font-bold uppercase">🏪 Offline Walk-in</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle size={20} />
              </div>
            </div>
            <h3 className="font-heading font-black text-3xl text-emerald-600 mt-3">
              {offlineOrders.length}
            </h3>
            <p className="text-[11px] text-emerald-700 font-bold mt-1">
              ₹{offlineRevenue.toLocaleString('en-IN')} shop counter
            </p>
          </div>

        </div>

        {/* ── LOW STOCK ALERT BANNER & INVENTORY METRICS ── */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs border-l-4 border-l-purple-600">
              <span className="text-xs font-mono text-purple-700 font-bold uppercase block">Total Catalog Products</span>
              <h3 className="font-heading font-black text-2xl text-purple-900 mt-1">{totalProductsCount}</h3>
              <p className="text-[11px] text-gray-500 font-mono">Active machinery & gates in shop</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs border-l-4 border-l-teal-600">
              <span className="text-xs font-mono text-teal-700 font-bold uppercase block">Total Units Sold</span>
              <h3 className="font-heading font-black text-2xl text-teal-900 mt-1">{totalQuantitySold} Units</h3>
              <p className="text-[11px] text-gray-500 font-mono">Cumulative quantity sales</p>
            </div>

            <div className={`p-5 rounded-2xl border shadow-xs border-l-4 ${lowStockProducts.length > 0 ? 'bg-amber-50 border-amber-300 border-l-red-600' : 'bg-white border-gray-200 border-l-emerald-600'}`}>
              <span className="text-xs font-mono text-amber-900 font-bold uppercase block flex items-center gap-1">
                <AlertTriangle size={14} className={lowStockProducts.length > 0 ? 'text-red-600' : 'text-gray-400'} /> Low Stock Warning
              </span>
              <h3 className={`font-heading font-black text-2xl mt-1 ${lowStockProducts.length > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                {lowStockProducts.length > 0 ? `${lowStockProducts.length} Items Low Stock` : 'All Products In Stock'}
              </h3>
              <p className="text-[11px] text-gray-500 font-mono">Stock threshold &le; 5 units</p>
            </div>

          </div>

          {/* Low Stock Items Detail List */}
          {lowStockProducts.length > 0 && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-black text-sm text-red-700 flex items-center gap-2 uppercase tracking-wider">
                  <AlertTriangle size={18} className="text-red-600" /> Low Stock Inventory Alert ({lowStockProducts.length} Items)
                </h4>
                <Link to="/admin/products" className="text-xs font-bold text-[#F97316] hover:underline font-mono">
                  Manage Catalog Stock &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="bg-white p-3 rounded-xl border border-amber-200 flex items-center gap-3">
                    <img src={p.images[0]} alt={p.name} className="w-12 h-12 rounded-lg object-contain bg-gray-50 border shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h5 className="font-heading font-bold text-xs text-[#111111] truncate">{p.name}</h5>
                      <div className="flex items-center justify-between text-[11px] mt-0.5">
                        <span className="font-mono text-gray-500">₹{p.price.toLocaleString('en-IN')}</span>
                        <span className="bg-red-100 text-red-700 font-mono font-black text-[10px] px-2 py-0.5 rounded-full border border-red-200">
                          {p.stock} left
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Shortcuts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <Link
            to="/admin/orders"
            className="card-industrial p-6 bg-[#111111] text-white hover:bg-[#232323] transition-colors flex items-center justify-between group"
          >
            <div>
              <span className="text-[#F97316] font-mono text-xs font-bold uppercase">ORDER MANAGEMENT</span>
              <h4 className="font-heading font-extrabold text-lg text-white mt-1">Online & Offline Orders</h4>
              <p className="text-gray-400 text-xs mt-1">Filter, edit prices & record payments</p>
            </div>
            <ArrowRight size={24} className="text-[#F97316] group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/admin/customers"
            className="card-industrial p-6 bg-[#111111] text-white hover:bg-[#232323] transition-colors flex items-center justify-between group"
          >
            <div>
              <span className="text-[#F97316] font-mono text-xs font-bold uppercase">CUSTOMER DIRECTORY</span>
              <h4 className="font-heading font-extrabold text-lg text-white mt-1">Manage Customer Profiles</h4>
              <p className="text-gray-400 text-xs mt-1">View buyers, history & WhatsApp chat</p>
            </div>
            <ArrowRight size={24} className="text-[#F97316] group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/admin/products"
            className="card-industrial p-6 bg-[#111111] text-white hover:bg-[#232323] transition-colors flex items-center justify-between group"
          >
            <div>
              <span className="text-[#F97316] font-mono text-xs font-bold uppercase">CATALOG CONTROL</span>
              <h4 className="font-heading font-extrabold text-lg text-white mt-1">Machinery Products</h4>
              <p className="text-gray-400 text-xs mt-1">Manage Kalappai, Gates & stock</p>
            </div>
            <ArrowRight size={24} className="text-[#F97316] group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/admin/payments"
            className="card-industrial p-6 bg-[#111111] text-white hover:bg-[#232323] transition-colors flex items-center justify-between group"
          >
            <div>
              <span className="text-[#F97316] font-mono text-xs font-bold uppercase">FINANCIAL LEDGER</span>
              <h4 className="font-heading font-extrabold text-lg text-white mt-1">Payment Receipts</h4>
              <p className="text-gray-400 text-xs mt-1">View cash, UPI & Razorpay receipts</p>
            </div>
            <ArrowRight size={24} className="text-[#F97316] group-hover:translate-x-1 transition-transform" />
          </Link>

        </div>

        {/* Latest Customer Orders Feed */}
        <div className="card-industrial p-6 bg-white space-y-4">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4">
            <h3 className="font-heading font-black text-lg text-[#111111]">LATEST CUSTOMER ORDERS</h3>
            <Link to="/admin/orders" className="text-xs font-bold text-[#F97316] hover:underline flex items-center gap-1">
              View All Orders ({orders.length}) <ArrowRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-bold uppercase">
                  <th className="p-3">Order No</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Final Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Balance</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-mono">
                {orders.slice(0, 5).map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="p-3 font-bold text-[#111111]">{o.orderNumber}</td>
                    <td className="p-3 font-sans">
                      {o.isOfflineOrder ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          🏪 OFFLINE
                        </span>
                      ) : (
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          🌐 ONLINE
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-gray-900 block font-sans">{o.customerName}</span>
                      <span className="text-gray-500 text-[11px]">{o.customerPhone}</span>
                    </td>
                    <td className="p-3 text-gray-700 max-w-xs truncate font-sans">
                      {o.items.map((i) => i.productName).join(', ')}
                    </td>
                    <td className="p-3 font-bold text-[#F97316]">₹{o.finalPrice.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-bold">
                      <span className="bg-gray-100 text-[#111111] px-2 py-0.5 rounded text-[10px]">
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3 font-bold">
                      <span className={o.remainingBalance > 0 ? "text-red-600" : "text-green-600"}>
                        ₹{o.remainingBalance.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => navigate('/admin/orders')}
                        className="bg-[#111111] hover:bg-[#F97316] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Manage
                      </button>
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

export default AdminDashboardPage;
