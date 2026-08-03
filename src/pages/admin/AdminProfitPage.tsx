import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import { useProducts } from '../../context/ProductContext';
import { useRefunds } from '../../context/RefundContext';
import { Order, OrderItem, getProductSellingPrice, NormalizedProfitTransaction, NormalizedProfitItem } from '../../types';
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  Hammer,
  Search,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Eye,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  Layers,
  Award,
  Sparkles,
  ChevronDown,
  ChevronRight,
  User,
  Phone,
  BarChart3,
  CreditCard,
  RotateCcw,
  Zap,
  Globe,
  Receipt
} from 'lucide-react';

export const AdminProfitPage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, refreshOrders, loading: ordersLoading } = useOrders();
  const { products } = useProducts();
  const { refunds } = useRefunds();

  // Active Main Channel Tab State ('ALL' | 'Online' | 'Offline / Fabrication' | 'POS / Walk-in')
  const [activeChannelTab, setActiveChannelTab] = useState<'ALL' | 'Online' | 'Offline / Fabrication' | 'POS / Walk-in'>('ALL');

  // Date Filter State
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | '7days' | '30days' | 'this_month' | 'last_month' | 'this_year' | 'custom'>('this_month');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Expandable Inline Table Rows State (Array of order IDs)
  const [expandedRowIds, setExpandedRowIds] = useState<string[]>([]);

  // Selected Transaction for Detail Modal / Drawer
  const [selectedTxn, setSelectedTxn] = useState<NormalizedProfitTransaction | null>(null);

  // Trend Chart View Mode
  const [trendViewMode, setTrendViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Last Refreshed Timestamp
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(
    new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  const handleRefresh = async () => {
    await refreshOrders();
    setLastRefreshedAt(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  const toggleRowExpand = (id: string) => {
    setExpandedRowIds(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  // ─── 1. NORMALIZE LIVE DATABASE TRANSACTIONS ───
  const normalizedTransactions = useMemo<NormalizedProfitTransaction[]>(() => {
    if (!orders || orders.length === 0) return [];

    const prodMap = new Map(products.map(p => [p.id, p]));

    return orders
      .filter((order) => {
        if (order.status === 'REJECTED') return false;
        if (order.notes && order.notes.toLowerCase().includes('cancelled')) return false;
        return true;
      })
      .map((order) => {
        const isPos = Boolean(
          order.orderType === 'Quick Order' ||
          order.orderType === 'Walk-in Order' ||
          order.orderNumber.startsWith('POS') ||
          (order.notes && order.notes.toLowerCase().includes('pos'))
        );

        const isOffline = Boolean(
          order.isOfflineOrder ||
          order.orderType === 'Custom Fabrication' ||
          order.orderType === 'Lathe Turning' ||
          order.orderType === 'Repair Order' ||
          order.orderNumber.startsWith('FAB') ||
          order.orderNumber.startsWith('OFF')
        );

        let channel: 'Online' | 'Offline / Fabrication' | 'POS / Walk-in' = 'Online';
        if (isPos) {
          channel = 'POS / Walk-in';
        } else if (isOffline) {
          channel = 'Offline / Fabrication';
        }

        const createdAtDate = order.createdAt ? new Date(order.createdAt) : new Date();
        const dateStr = createdAtDate.toISOString().split('T')[0];
        const timestamp = createdAtDate.getTime();

        const mappedItems: NormalizedProfitItem[] = (order.items || []).map((item) => {
          const catProd = prodMap.get(item.productId);
          const qty = Math.max(1, item.quantity || 1);

          const originalUnitPrice = item.originalPriceAtOrder ?? (catProd?.originalPrice || catProd?.price || item.unitPrice);
          const unitSellingPrice = item.unitSellingPriceAtOrder ?? item.unitPrice;
          const productDiscount = Math.max(0, originalUnitPrice - unitSellingPrice);
          const lineSellingTotal = item.lineTotal ?? (unitSellingPrice * qty);
          const costUnitPrice = item.costPriceAtOrder ?? (catProd?.costPrice !== undefined ? catProd.costPrice : Math.round(unitSellingPrice * 0.65));
          const lineCostTotal = costUnitPrice * qty;

          const basePriceTotal = order.basePrice || (order.items || []).reduce((s, i) => s + (i.unitPrice * i.quantity), 0);
          const orderDiscountShare = basePriceTotal > 0 ? (order.reducedAmount * lineSellingTotal) / basePriceTotal : 0;
          const actualNetRevenue = Math.max(0, lineSellingTotal - orderDiscountShare);
          const itemGrossProfit = actualNetRevenue - lineCostTotal;
          const marginPercentage = actualNetRevenue > 0 ? (itemGrossProfit / actualNetRevenue) * 100 : 0;

          return {
            productId: item.productId,
            productName: item.productName || catProd?.name || 'Custom Metal Fabrication Work',
            quantity: qty,
            originalUnitPrice,
            productDiscount,
            unitSellingPrice,
            lineSellingTotal,
            costUnitPrice,
            lineCostTotal,
            orderDiscountShare,
            actualNetRevenue,
            grossProfit: itemGrossProfit,
            marginPercentage
          };
        });

        const grossRevenue = mappedItems.reduce((sum, i) => sum + i.lineSellingTotal, 0);
        const totalProductDiscount = mappedItems.reduce((sum, i) => sum + (i.productDiscount * i.quantity), 0);
        const totalOrderDiscount = order.reducedAmount || 0;

        const orderRefunds = refunds.filter(r => r.orderId === order.id || r.orderNumber === order.orderNumber);
        const refundAmount = orderRefunds.reduce((sum, r) => sum + (r.status === 'Completed' ? r.refundAmount : 0), 0);

        const netSalesRevenue = Math.max(0, grossRevenue - totalOrderDiscount - refundAmount);
        const totalCost = mappedItems.reduce((sum, i) => sum + i.lineCostTotal, 0);
        const grossProfit = netSalesRevenue - totalCost;
        const marginPercentage = netSalesRevenue > 0 ? (grossProfit / netSalesRevenue) * 100 : 0;

        const amountCollected = (order.paymentHistory || [])
          .filter(p => p.paymentStatus === 'SUCCESS' || !p.paymentStatus)
          .reduce((sum, p) => sum + p.amount, 0);

        const balanceReceivable = Math.max(0, order.finalPrice - amountCollected);

        let paymentStatus: NormalizedProfitTransaction['paymentStatus'] = 'UNPAID';
        if (refundAmount >= netSalesRevenue && refundAmount > 0) {
          paymentStatus = 'REFUNDED';
        } else if (refundAmount > 0) {
          paymentStatus = 'PARTIALLY REFUNDED';
        } else if (amountCollected >= order.finalPrice && order.finalPrice > 0) {
          paymentStatus = 'PAID';
        } else if (amountCollected > 0) {
          paymentStatus = 'PARTIALLY PAID';
        }

        return {
          id: order.id,
          orderId: order.id,
          orderNumber: order.orderNumber,
          date: dateStr,
          timestamp,
          channel,
          customerName: order.customerName || 'Counter Customer',
          customerPhone: order.customerPhone || 'Walk-in',
          status: order.status,
          items: mappedItems,
          grossRevenue,
          totalProductDiscount,
          totalOrderDiscount,
          refundAmount,
          netSalesRevenue,
          totalCost,
          grossProfit,
          marginPercentage,
          amountCollected,
          balanceReceivable,
          paymentStatus
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [orders, products, refunds]);

  // ─── 2. APPLY DATE & CHANNEL & SEARCH FILTERS ───
  const filteredTransactions = useMemo(() => {
    const now = new Date();

    return normalizedTransactions.filter((txn) => {
      const txnDate = new Date(txn.timestamp);

      // Date Filtering
      let matchesDate = true;
      if (dateFilter === 'today') {
        matchesDate = txnDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'yesterday') {
        const yest = new Date(now);
        yest.setDate(yest.getDate() - 1);
        matchesDate = txnDate.toDateString() === yest.toDateString();
      } else if (dateFilter === '7days') {
        const d7 = new Date(now);
        d7.setDate(d7.getDate() - 7);
        matchesDate = txnDate >= d7;
      } else if (dateFilter === '30days') {
        const d30 = new Date(now);
        d30.setDate(d30.getDate() - 30);
        matchesDate = txnDate >= d30;
      } else if (dateFilter === 'this_month') {
        matchesDate = txnDate.getMonth() === now.getMonth() && txnDate.getFullYear() === now.getFullYear();
      } else if (dateFilter === 'last_month') {
        const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        matchesDate = txnDate.getMonth() === lm.getMonth() && txnDate.getFullYear() === lm.getFullYear();
      } else if (dateFilter === 'this_year') {
        matchesDate = txnDate.getFullYear() === now.getFullYear();
      } else if (dateFilter === 'custom') {
        if (fromDate) {
          const fDate = new Date(fromDate);
          fDate.setHours(0, 0, 0, 0);
          if (txnDate < fDate) matchesDate = false;
        }
        if (toDate) {
          const tDate = new Date(toDate);
          tDate.setHours(23, 59, 59, 999);
          if (txnDate > tDate) matchesDate = false;
        }
      }

      // Channel Tab Filtering
      let matchesChannel = true;
      if (activeChannelTab !== 'ALL') {
        matchesChannel = txn.channel === activeChannelTab;
      }

      // Global Search
      let matchesSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesOrderNum = txn.orderNumber.toLowerCase().includes(q);
        const matchesCustName = txn.customerName.toLowerCase().includes(q);
        const matchesCustPhone = txn.customerPhone.includes(q);
        const matchesProdName = txn.items.some(i => i.productName.toLowerCase().includes(q));

        matchesSearch = matchesOrderNum || matchesCustName || matchesCustPhone || matchesProdName;
      }

      return matchesDate && matchesChannel && matchesSearch;
    });
  }, [normalizedTransactions, dateFilter, fromDate, toDate, activeChannelTab, searchQuery]);

  // ─── 3. FINANCIAL AGGREGATIONS FOR ACTIVE CHANNEL TAB ───
  const totalSalesRevenue = filteredTransactions.reduce((s, t) => s + t.netSalesRevenue, 0);
  const totalProductCost = filteredTransactions.reduce((s, t) => s + t.totalCost, 0);
  const grossProfit = totalSalesRevenue - totalProductCost;
  const overallMargin = totalSalesRevenue > 0 ? (grossProfit / totalSalesRevenue) * 100 : 0;

  // Channel Profit Breakdown for Second Level Cards
  const onlineTxns = normalizedTransactions.filter(t => t.channel === 'Online');
  const offlineTxns = normalizedTransactions.filter(t => t.channel === 'Offline / Fabrication');
  const posTxns = normalizedTransactions.filter(t => t.channel === 'POS / Walk-in');

  const onlineProfit = onlineTxns.reduce((s, t) => s + t.grossProfit, 0);
  const offlineProfit = offlineTxns.reduce((s, t) => s + t.grossProfit, 0);
  const posProfit = posTxns.reduce((s, t) => s + t.grossProfit, 0);

  // Discount Breakdown
  const totalOriginalValue = filteredTransactions.reduce((s, t) => s + t.grossRevenue + t.totalProductDiscount, 0);
  const totalProductDiscounts = filteredTransactions.reduce((s, t) => s + t.totalProductDiscount, 0);
  const totalOrderDiscounts = filteredTransactions.reduce((s, t) => s + t.totalOrderDiscount, 0);
  const totalDiscountsGiven = totalProductDiscounts + totalOrderDiscounts;

  // Aggregated Product Profitability Matrix
  const productProfitabilityMap = useMemo(() => {
    const map = new Map<string, {
      name: string;
      unitsSold: number;
      revenue: number;
      discounts: number;
      cost: number;
      profit: number;
    }>();

    filteredTransactions.forEach((txn) => {
      txn.items.forEach((item) => {
        const key = item.productId || item.productName;
        const existing = map.get(key) || {
          name: item.productName,
          unitsSold: 0,
          revenue: 0,
          discounts: 0,
          cost: 0,
          profit: 0
        };

        existing.unitsSold += item.quantity;
        existing.revenue += item.actualNetRevenue;
        existing.discounts += (item.productDiscount * item.quantity) + item.orderDiscountShare;
        existing.cost += item.lineCostTotal;
        existing.profit += item.grossProfit;

        map.set(key, existing);
      });
    });

    return Array.from(map.values()).sort((a, b) => b.profit - a.profit);
  }, [filteredTransactions]);

  const topProfitableProducts = useMemo(() => {
    return productProfitabilityMap.slice(0, 5);
  }, [productProfitabilityMap]);

  const lowMarginOrLossSales = useMemo(() => {
    return filteredTransactions.filter(t => t.marginPercentage < 15 || t.grossProfit < 0);
  }, [filteredTransactions]);

  // Trend Chart Data Grouping
  const trendData = useMemo(() => {
    const map = new Map<string, { dateLabel: string; revenue: number; cost: number; profit: number }>();
    const sorted = [...filteredTransactions].sort((a, b) => a.timestamp - b.timestamp);

    sorted.forEach((txn) => {
      let key = txn.date;
      if (trendViewMode === 'weekly') {
        const d = new Date(txn.timestamp);
        const weekNum = Math.ceil(d.getDate() / 7);
        key = `${d.toLocaleString('en-IN', { month: 'short' })} W${weekNum}`;
      } else if (trendViewMode === 'monthly') {
        const d = new Date(txn.timestamp);
        key = `${d.toLocaleString('en-IN', { month: 'short' })} ${d.getFullYear()}`;
      }

      const existing = map.get(key) || { dateLabel: key, revenue: 0, cost: 0, profit: 0 };
      existing.revenue += txn.netSalesRevenue;
      existing.cost += txn.totalCost;
      existing.profit += txn.grossProfit;
      map.set(key, existing);
    });

    return Array.from(map.values());
  }, [filteredTransactions, trendViewMode]);

  const maxTrendVal = Math.max(...trendData.map(t => Math.max(t.revenue, t.cost, Math.abs(t.profit))), 10000);

  // Export CSV Report
  const handleExportCSV = () => {
    let csv = 'Date,Channel,Order/Bill ID,Customer,Mobile,Product(s),Qty,Original Price,Product Discount,Selling Price,Cost Price,Net Revenue,Total Cost,Gross Profit,Margin %,Payment Status\n';

    filteredTransactions.forEach((txn) => {
      txn.items.forEach((item) => {
        const prodNameClean = item.productName.replace(/"/g, '""');
        const custNameClean = txn.customerName.replace(/"/g, '""');

        csv += `"${txn.date}","${txn.channel}","${txn.orderNumber}","${custNameClean}","${txn.customerPhone}","${prodNameClean}",${item.quantity},${item.originalUnitPrice},${item.productDiscount * item.quantity},${item.unitSellingPrice},${item.costUnitPrice},${item.actualNetRevenue},${item.lineCostTotal},${item.grossProfit},${item.marginPercentage.toFixed(2)}%,"${txn.paymentStatus}"\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `MANIKANDAN_LATHE_${activeChannelTab.replace(/[^a-zA-Z0-9]/g, '_')}_PROFIT_REPORT_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] font-sans antialiased pb-24 selection:bg-[#F97316] selection:text-white">
      
      {/* ── 1. LUXURY PAGE HEADER BANNER ── */}
      <div className="bg-[#111111] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#F97316] text-white text-[10px] font-mono font-black px-2.5 py-0.5 rounded uppercase tracking-wider">
                FINANCIAL MANAGEMENT PORTAL
              </span>
              <span className="text-xs text-gray-400 font-mono">Last updated: {lastRefreshedAt}</span>
            </div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-white mt-1 flex items-center gap-2">
              PROFIT & MARGIN ANALYTICS
            </h1>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Live profitability across Online, Offline & POS Sales (Traceable Sale-Time Snapshots)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="bg-gray-800 hover:bg-gray-700 text-white font-heading font-black text-xs px-4 py-3 rounded-xl flex items-center gap-2 transition-all cursor-pointer active:scale-95 border border-gray-700"
              title="Refresh Data"
            >
              <RefreshCw size={15} className={ordersLoading ? 'animate-spin text-[#F97316]' : ''} /> Refresh Live Data
            </button>

            <button
              onClick={handleExportCSV}
              className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Download size={15} /> Export Profit Report
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── 2. DATE FILTER & SEARCH CONTROL BAR ── */}
        <div className="bg-white p-4 sm:p-5 rounded-[24px] border border-gray-200 shadow-xs space-y-4">
          
          {/* Date Filter Chips Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Calendar size={14} className="text-[#F97316]" /> Period:
              </span>

              {[
                { id: 'today', label: 'Today' },
                { id: 'yesterday', label: 'Yesterday' },
                { id: '7days', label: '7 Days' },
                { id: '30days', label: '30 Days' },
                { id: 'this_month', label: 'This Month' },
                { id: 'last_month', label: 'Last Month' },
                { id: 'this_year', label: 'This Year' },
                { id: 'custom', label: 'Custom Range' },
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => setDateFilter(b.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold transition-all shrink-0 cursor-pointer border ${
                    dateFilter === b.id
                      ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range & Global Search Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-gray-100 items-center">
            {dateFilter === 'custom' && (
              <div className="md:col-span-6 flex items-center gap-2">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="bg-gray-50 text-xs text-[#111111] p-2.5 rounded-xl border border-gray-300 outline-none font-bold"
                />
                <span className="text-xs text-gray-400 font-bold">to</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="bg-gray-50 text-xs text-[#111111] p-2.5 rounded-xl border border-gray-300 outline-none font-bold"
                />
              </div>
            )}

            <div className={dateFilter === 'custom' ? 'md:col-span-6 relative' : 'md:col-span-12 relative'}>
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F97316]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Order ID, POS Bill No, Product Name, Customer Name, Mobile Number..."
                className="w-full bg-gray-50 text-xs text-[#111111] pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 outline-none focus:border-[#F97316] font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── 3. TOP SUMMARY KPI CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Sales Revenue */}
          <div className="bg-white p-5 rounded-[22px] border border-gray-200 shadow-xs space-y-2 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 font-mono font-bold uppercase">TOTAL SALES REVENUE</span>
              <div className="p-2 bg-orange-50 text-[#F97316] rounded-xl">
                <DollarSign size={18} />
              </div>
            </div>
            <div className="font-heading font-black text-2xl sm:text-3xl text-[#111111]">
              ₹{totalSalesRevenue.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-gray-400 font-mono block">
              Net revenue after product & order discounts
            </span>
          </div>

          {/* Card 2: Total Product Cost */}
          <div className="bg-white p-5 rounded-[22px] border border-gray-200 shadow-xs space-y-2 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 font-mono font-bold uppercase">TOTAL PRODUCT COST (COGS)</span>
              <div className="p-2 bg-gray-100 text-gray-700 rounded-xl">
                <Package size={18} />
              </div>
            </div>
            <div className="font-heading font-black text-2xl sm:text-3xl text-gray-800">
              ₹{totalProductCost.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-gray-400 font-mono block">
              Sum of cost prices at time of sale
            </span>
          </div>

          {/* Card 3: Gross Profit */}
          <div className={`p-5 rounded-[22px] border shadow-xs space-y-2 relative overflow-hidden ${
            grossProfit >= 0 ? 'bg-emerald-50/70 border-emerald-200' : 'bg-red-50/70 border-red-200'
          }`}>
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono font-bold uppercase text-gray-700">GROSS PROFIT</span>
              <div className={`p-2 rounded-xl ${grossProfit >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                {grossProfit >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
              </div>
            </div>
            <div className={`font-heading font-black text-2xl sm:text-3xl ${grossProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
              {grossProfit >= 0 ? `+₹${grossProfit.toLocaleString('en-IN')}` : `-₹${Math.abs(grossProfit).toLocaleString('en-IN')}`}
            </div>
            <span className="text-[11px] font-mono block text-gray-600">
              {grossProfit >= 0 ? 'Net Sales Revenue - Total Cost' : 'Loss incurred on sales'}
            </span>
          </div>

          {/* Card 4: Profit Margin */}
          <div className="bg-white p-5 rounded-[22px] border border-gray-200 shadow-xs space-y-2 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 font-mono font-bold uppercase">PROFIT MARGIN %</span>
              <div className="p-2 bg-orange-50 text-[#F97316] rounded-xl">
                <Percent size={18} />
              </div>
            </div>
            <div className="font-heading font-black text-2xl sm:text-3xl text-[#F97316]">
              {overallMargin.toFixed(2)}%
            </div>
            <span className="text-[11px] text-gray-400 font-mono block">
              Gross Profit / Net Revenue × 100
            </span>
          </div>
        </div>

        {/* ── SECOND LEVEL CHANNEL BREAKDOWN CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => setActiveChannelTab('Online')}
            className={`p-4.5 rounded-2xl border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
              activeChannelTab === 'Online' ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300' : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-gray-400 block">ONLINE PROFIT</span>
              <span className={`font-heading font-black text-xl ${onlineProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                {onlineProfit >= 0 ? `+₹${onlineProfit.toLocaleString('en-IN')}` : `-₹${Math.abs(onlineProfit).toLocaleString('en-IN')}`}
              </span>
              <span className="text-[10px] text-gray-400 font-mono block mt-0.5">{onlineTxns.length} Online Orders</span>
            </div>
            <span className="bg-blue-50 text-blue-700 text-xs font-mono font-bold px-2.5 py-1 rounded-full border border-blue-200">
              ONLINE
            </span>
          </div>

          <div
            onClick={() => setActiveChannelTab('Offline / Fabrication')}
            className={`p-4.5 rounded-2xl border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
              activeChannelTab === 'Offline / Fabrication' ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-300' : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-gray-400 block">OFFLINE / FABRICATION PROFIT</span>
              <span className={`font-heading font-black text-xl ${offlineProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                {offlineProfit >= 0 ? `+₹${offlineProfit.toLocaleString('en-IN')}` : `-₹${Math.abs(offlineProfit).toLocaleString('en-IN')}`}
              </span>
              <span className="text-[10px] text-gray-400 font-mono block mt-0.5">{offlineTxns.length} Fabrication Orders</span>
            </div>
            <span className="bg-purple-50 text-purple-700 text-xs font-mono font-bold px-2.5 py-1 rounded-full border border-purple-200">
              OFFLINE
            </span>
          </div>

          <div
            onClick={() => setActiveChannelTab('POS / Walk-in')}
            className={`p-4.5 rounded-2xl border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
              activeChannelTab === 'POS / Walk-in' ? 'bg-orange-50 border-orange-400 ring-2 ring-orange-300' : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-gray-400 block">POS / WALK-IN PROFIT</span>
              <span className={`font-heading font-black text-xl ${posProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                {posProfit >= 0 ? `+₹${posProfit.toLocaleString('en-IN')}` : `-₹${Math.abs(posProfit).toLocaleString('en-IN')}`}
              </span>
              <span className="text-[10px] text-gray-400 font-mono block mt-0.5">{posTxns.length} POS Counter Bills</span>
            </div>
            <span className="bg-orange-50 text-[#F97316] text-xs font-mono font-bold px-2.5 py-1 rounded-full border border-orange-200">
              POS
            </span>
          </div>
        </div>

        {/* ── 4. PROFIT TREND CHART (SVG) ── */}
        <div className="bg-white p-6 rounded-[26px] border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-heading font-black text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2">
                <BarChart3 size={18} className="text-[#F97316]" /> PROFIT & REVENUE TREND CHART ({activeChannelTab})
              </h3>
              <p className="text-xs text-gray-500 font-mono">Comparing Revenue, Cost of Goods Sold, and Gross Profit</p>
            </div>

            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              {(['daily', 'weekly', 'monthly'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setTrendViewMode(m)}
                  className={`px-3 py-1 rounded-lg text-xs font-heading font-bold capitalize transition-all cursor-pointer ${
                    trendViewMode === m ? 'bg-[#111111] text-white shadow-xs' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {trendData.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400 font-mono">
              No profit trend data available for the selected period.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-end gap-4 text-xs font-mono font-bold">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#F97316]" /> Revenue</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-gray-400" /> Cost</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Profit</span>
              </div>

              <div className="h-56 flex items-end gap-3 pt-6 border-b border-gray-200 overflow-x-auto no-scrollbar pb-2">
                {trendData.map((d, idx) => {
                  const revHeightPct = Math.min(100, Math.round((d.revenue / maxTrendVal) * 100));
                  const costHeightPct = Math.min(100, Math.round((d.cost / maxTrendVal) * 100));
                  const profitHeightPct = Math.min(100, Math.round((Math.max(0, d.profit) / maxTrendVal) * 100));

                  return (
                    <div key={idx} className="flex-1 min-w-[50px] flex flex-col items-center gap-1 group relative">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-16 bg-black/90 text-white text-[10px] font-mono p-2 rounded-xl shadow-xl z-20 pointer-events-none whitespace-nowrap">
                        <div className="font-bold text-[#F97316]">{d.dateLabel}</div>
                        <div>Revenue: ₹{d.revenue.toLocaleString('en-IN')}</div>
                        <div>Cost: ₹{d.cost.toLocaleString('en-IN')}</div>
                        <div className={d.profit >= 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                          Profit: {d.profit >= 0 ? `+₹${d.profit.toLocaleString('en-IN')}` : `-₹${Math.abs(d.profit).toLocaleString('en-IN')}`}
                        </div>
                      </div>

                      <div className="w-full flex items-end justify-center gap-1 h-44">
                        <div
                          style={{ height: `${Math.max(4, revHeightPct)}%` }}
                          className="w-3.5 bg-[#F97316] rounded-t-md transition-all group-hover:brightness-110"
                        />
                        <div
                          style={{ height: `${Math.max(4, costHeightPct)}%` }}
                          className="w-3.5 bg-gray-300 rounded-t-md transition-all group-hover:brightness-110"
                        />
                        <div
                          style={{ height: `${Math.max(4, profitHeightPct)}%` }}
                          className={`w-3.5 rounded-t-md transition-all group-hover:brightness-110 ${
                            d.profit >= 0 ? 'bg-emerald-500' : 'bg-red-500'
                          }`}
                        />
                      </div>

                      <span className="text-[10px] font-mono font-bold text-gray-500 truncate w-full text-center mt-1">
                        {d.dateLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── 5. MAIN TABBED CHANNEL TRANSACTIONS TABLE ── */}
        <div className="bg-white rounded-[26px] border border-gray-200 shadow-xs overflow-hidden space-y-4 p-5 sm:p-6">
          
          {/* TOP CHANNEL TABS BAR */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {[
                { id: 'ALL', label: 'All Sales (Combined)', icon: Layers, count: normalizedTransactions.length },
                { id: 'Online', label: 'Online Orders', icon: Globe, count: onlineTxns.length },
                { id: 'Offline / Fabrication', label: 'Offline Fabrication', icon: Hammer, count: offlineTxns.length },
                { id: 'POS / Walk-in', label: 'POS Walk-in Bills', icon: Receipt, count: posTxns.length },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeChannelTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveChannelTab(tab.id as any)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-heading font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap border ${
                      active
                        ? 'bg-[#111111] text-white border-[#111111] shadow-md'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:text-black'
                    }`}
                  >
                    <Icon size={16} className={active ? 'text-[#F97316]' : 'text-gray-500'} />
                    <span>{tab.label}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      active ? 'bg-[#F97316] text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <span className="text-xs font-mono font-bold text-gray-500">
              Showing <strong className="text-[#111111]">{filteredTransactions.length}</strong> sales transactions
            </span>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Search size={40} className="mx-auto text-gray-300" />
              <h4 className="font-heading font-bold text-sm text-[#111111]">
                No sales transactions found for {activeChannelTab === 'ALL' ? 'this period' : activeChannelTab}.
              </h4>
              <p className="text-xs text-gray-500">Try adjusting your date range, search query, or selecting another tab.</p>
            </div>
          ) : (
            <>
              {/* DESKTOP / TABLET PERFECTLY ALIGNED DATAGRID */}
              <div className="hidden md:block overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse text-xs font-mono min-w-[1300px]">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 uppercase text-[11px] font-bold">
                      <th className="py-3.5 px-2.5 w-10 text-center">EXPAND</th>
                      <th className="py-3.5 px-3 w-24">DATE</th>
                      <th className="py-3.5 px-3 w-20 text-center">SOURCE</th>
                      <th className="py-3.5 px-3 w-32">ORDER / BILL ID</th>
                      <th className="py-3.5 px-3 w-40">CUSTOMER</th>
                      <th className="py-3.5 px-3">PRODUCTS & QTY</th>
                      <th className="py-3.5 px-3 text-right w-24">ORIGINAL</th>
                      <th className="py-3.5 px-3 text-right w-24">DISCOUNT</th>
                      <th className="py-3.5 px-3 text-right w-28">NET REVENUE</th>
                      <th className="py-3.5 px-3 text-right w-24">TOTAL COST</th>
                      <th className="py-3.5 px-3 text-right w-28">GROSS PROFIT</th>
                      <th className="py-3.5 px-3 text-right w-20">MARGIN</th>
                      <th className="py-3.5 px-3 text-center w-28">PAYMENT</th>
                      <th className="py-3.5 px-3 text-right w-20">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTransactions.map((txn) => {
                      const isExpanded = expandedRowIds.includes(txn.id);
                      const primaryItem = txn.items[0] || {
                        productName: 'Custom Lathe Job',
                        quantity: 1,
                        originalUnitPrice: txn.grossRevenue,
                        productDiscount: 0,
                        unitSellingPrice: txn.grossRevenue,
                        costUnitPrice: txn.totalCost
                      };

                      const totalQty = txn.items.reduce((s, i) => s + i.quantity, 0);

                      return (
                        <React.Fragment key={txn.id}>
                          <tr className={`hover:bg-gray-50 transition-colors ${isExpanded ? 'bg-orange-50/50' : ''}`}>
                            {/* Expand Row Toggle Button (>) */}
                            <td className="py-3.5 px-2.5 text-center">
                              <button
                                onClick={() => toggleRowExpand(txn.id)}
                                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                  isExpanded
                                    ? 'bg-[#F97316] text-white border-[#F97316]'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300'
                                }`}
                                title={isExpanded ? 'Collapse Product Details' : 'Expand Product Details'}
                              >
                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              </button>
                            </td>

                            <td className="py-3.5 px-3 font-bold text-gray-700 whitespace-nowrap">
                              {txn.date}
                            </td>

                            {/* Source Badge */}
                            <td className="py-3.5 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                txn.channel === 'Online'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : txn.channel === 'Offline / Fabrication'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : 'bg-orange-50 text-[#F97316] border border-orange-200'
                              }`}>
                                {txn.channel === 'Online' ? 'ONLINE' : txn.channel === 'Offline / Fabrication' ? 'OFFLINE' : 'POS'}
                              </span>
                            </td>

                            <td className="py-3.5 px-3 font-bold text-[#111111] whitespace-nowrap">
                              {txn.orderNumber}
                            </td>

                            <td className="py-3.5 px-3">
                              <span className="font-bold text-[#111111] block truncate max-w-[150px]">{txn.customerName}</span>
                              <span className="text-[10px] text-gray-400 block">{txn.customerPhone}</span>
                            </td>

                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-gray-800 truncate max-w-[180px]">{primaryItem.productName}</span>
                                {txn.items.length > 1 && (
                                  <span className="bg-orange-100 text-[#F97316] text-[9px] font-black px-1.5 py-0.5 rounded shrink-0">
                                    +{txn.items.length - 1} more ({totalQty} Qty)
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3.5 px-3 text-right text-gray-500">
                              ₹{(txn.grossRevenue + txn.totalProductDiscount).toLocaleString('en-IN')}
                            </td>

                            <td className="py-3.5 px-3 text-right text-[#F97316]">
                              {txn.totalProductDiscount + txn.totalOrderDiscount > 0 ? (
                                `-₹${(txn.totalProductDiscount + txn.totalOrderDiscount).toLocaleString('en-IN')}`
                              ) : (
                                '-'
                              )}
                            </td>

                            <td className="py-3.5 px-3 text-right font-black text-gray-900">
                              ₹{txn.netSalesRevenue.toLocaleString('en-IN')}
                            </td>

                            <td className="py-3.5 px-3 text-right text-gray-600">
                              ₹{txn.totalCost.toLocaleString('en-IN')}
                            </td>

                            {/* Profit / Loss */}
                            <td className="py-3.5 px-3 text-right font-black">
                              <span className={txn.grossProfit >= 0 ? 'text-emerald-700' : 'text-red-600 font-black'}>
                                {txn.grossProfit >= 0 ? `+₹${txn.grossProfit.toLocaleString('en-IN')}` : `-₹${Math.abs(txn.grossProfit).toLocaleString('en-IN')}`}
                              </span>
                              {txn.grossProfit < 0 && (
                                <span className="bg-red-100 text-red-800 text-[8px] font-black px-1 rounded uppercase block w-fit ml-auto">
                                  LOSS
                                </span>
                              )}
                            </td>

                            {/* Margin % */}
                            <td className="py-3.5 px-3 text-right font-bold">
                              <span className={txn.marginPercentage >= 0 ? 'text-emerald-700' : 'text-red-600'}>
                                {txn.marginPercentage.toFixed(1)}%
                              </span>
                            </td>

                            {/* Payment Status Badge */}
                            <td className="py-3.5 px-3 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                txn.paymentStatus === 'PAID'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : txn.paymentStatus === 'PARTIALLY PAID'
                                  ? 'bg-amber-100 text-amber-900'
                                  : txn.paymentStatus === 'REFUNDED'
                                  ? 'bg-purple-100 text-purple-900'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {txn.paymentStatus}
                              </span>
                            </td>

                            {/* Action Buttons */}
                            <td className="py-3.5 px-3 text-right">
                              <button
                                onClick={() => setSelectedTxn(txn)}
                                className="bg-[#111111] hover:bg-[#F97316] text-white text-[11px] font-heading font-black px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                              >
                                View
                              </button>
                            </td>
                          </tr>

                          {/* ── EXPANDABLE INLINE PRODUCT SUB-TABLE ── */}
                          {isExpanded && (
                            <tr className="bg-orange-50/40 border-b border-orange-200">
                              <td colSpan={14} className="p-4 space-y-3">
                                <div className="flex items-center justify-between border-b border-orange-200 pb-2">
                                  <div className="flex items-center gap-2 font-heading font-black text-xs text-[#F97316] uppercase tracking-wider">
                                    <Layers size={15} /> ITEMIZED PRODUCT BREAKDOWN ({txn.items.length} Products)
                                  </div>
                                  <span className="text-[11px] text-gray-600 font-mono">
                                    Order Net Revenue: <strong className="text-gray-900">₹{txn.netSalesRevenue.toLocaleString('en-IN')}</strong> | Gross Profit: <strong className="text-emerald-700">+₹{txn.grossProfit.toLocaleString('en-IN')} ({txn.marginPercentage.toFixed(1)}%)</strong>
                                  </span>
                                </div>

                                <div className="bg-white rounded-xl border border-orange-200 overflow-hidden shadow-xs">
                                  <table className="w-full text-left border-collapse text-xs font-mono">
                                    <thead>
                                      <tr className="bg-orange-100/60 text-orange-950 uppercase font-bold text-[10px]">
                                        <th className="py-2.5 px-3">#</th>
                                        <th className="py-2.5 px-3">PRODUCT ITEM</th>
                                        <th className="py-2.5 px-3 text-center">QTY</th>
                                        <th className="py-2.5 px-3 text-right">ORIGINAL UNIT PRICE</th>
                                        <th className="py-2.5 px-3 text-right">PRODUCT DISCOUNT</th>
                                        <th className="py-2.5 px-3 text-right">SELLING UNIT PRICE</th>
                                        <th className="py-2.5 px-3 text-right">COST UNIT PRICE</th>
                                        <th className="py-2.5 px-3 text-right">LINE NET REVENUE</th>
                                        <th className="py-2.5 px-3 text-right">ITEM PROFIT</th>
                                        <th className="py-2.5 px-3 text-right">MARGIN %</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                      {txn.items.map((sub, sIdx) => (
                                        <tr key={sIdx} className="hover:bg-gray-50">
                                          <td className="py-2.5 px-3 text-gray-400 font-bold">{sIdx + 1}</td>
                                          <td className="py-2.5 px-3 font-bold text-[#111111]">{sub.productName}</td>
                                          <td className="py-2.5 px-3 text-center font-bold">{sub.quantity}</td>
                                          <td className="py-2.5 px-3 text-right text-gray-500">₹{sub.originalUnitPrice.toLocaleString('en-IN')}</td>
                                          <td className="py-2.5 px-3 text-right text-[#F97316]">
                                            {sub.productDiscount > 0 ? `-₹${(sub.productDiscount * sub.quantity).toLocaleString('en-IN')}` : '-'}
                                          </td>
                                          <td className="py-2.5 px-3 text-right font-bold text-[#111111]">₹{sub.unitSellingPrice.toLocaleString('en-IN')}</td>
                                          <td className="py-2.5 px-3 text-right text-gray-600">₹{sub.costUnitPrice.toLocaleString('en-IN')}</td>
                                          <td className="py-2.5 px-3 text-right font-black text-gray-900">₹{sub.actualNetRevenue.toLocaleString('en-IN')}</td>
                                          <td className="py-2.5 px-3 text-right font-black">
                                            <span className={sub.grossProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}>
                                              {sub.grossProfit >= 0 ? `+₹${sub.grossProfit.toLocaleString('en-IN')}` : `-₹${Math.abs(sub.grossProfit).toLocaleString('en-IN')}`}
                                            </span>
                                          </td>
                                          <td className="py-2.5 px-3 text-right font-bold text-[#F97316]">
                                            {sub.marginPercentage.toFixed(1)}%
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE COMPACT PROFIT CARDS */}
              <div className="block md:hidden space-y-3">
                {filteredTransactions.map((txn) => (
                  <div key={txn.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3 font-sans">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-black text-sm text-[#111111]">{txn.orderNumber}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          txn.channel === 'Online' ? 'bg-blue-100 text-blue-800' : txn.channel === 'Offline / Fabrication' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-900'
                        }`}>
                          {txn.channel === 'Online' ? 'ONLINE' : txn.channel === 'Offline / Fabrication' ? 'OFFLINE' : 'POS'}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-gray-500">{txn.date}</span>
                    </div>

                    <div>
                      <span className="font-bold text-xs text-[#111111] block">{txn.items[0]?.productName || 'Custom Work'}</span>
                      <span className="text-[11px] text-gray-500 block">Customer: {txn.customerName} ({txn.customerPhone})</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <div>
                        <span className="text-[10px] text-gray-400 block">Revenue</span>
                        <span className="font-bold text-[#111111]">₹{txn.netSalesRevenue.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block">Cost</span>
                        <span className="font-bold text-gray-700">₹{txn.totalCost.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block">Profit</span>
                        <span className={`font-black ${txn.grossProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                          {txn.grossProfit >= 0 ? `+₹${txn.grossProfit.toLocaleString('en-IN')}` : `-₹${Math.abs(txn.grossProfit).toLocaleString('en-IN')}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block">Margin</span>
                        <span className="font-bold text-[#F97316]">{txn.marginPercentage.toFixed(1)}%</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedTxn(txn)}
                      className="w-full bg-[#111111] hover:bg-[#F97316] text-white text-xs font-heading font-black py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      View Breakdown
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── 6. PROFIT BY SALES CHANNEL & PRODUCT PROFITABILITY MATRIX ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* PROFIT BY SALES CHANNEL */}
          <div className="lg:col-span-5 bg-white p-6 rounded-[26px] border border-gray-200 shadow-xs space-y-4">
            <h3 className="font-heading font-black text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
              <Zap size={18} className="text-[#F97316]" /> PROFIT BY SALES CHANNEL
            </h3>

            <div className="space-y-3 font-sans">
              {[
                { id: 'Online', name: 'Online Orders', txns: onlineTxns },
                { id: 'Offline / Fabrication', name: 'Offline / Fabrication', txns: offlineTxns },
                { id: 'POS / Walk-in', name: 'POS / Walk-in', txns: posTxns },
              ].map((ch) => {
                const rev = ch.txns.reduce((s, t) => s + t.netSalesRevenue, 0);
                const cost = ch.txns.reduce((s, t) => s + t.totalCost, 0);
                const profit = rev - cost;
                const margin = rev > 0 ? (profit / rev) * 100 : 0;

                return (
                  <div
                    key={ch.id}
                    onClick={() => setActiveChannelTab(ch.id as any)}
                    className="p-4 rounded-2xl border border-gray-200 space-y-2 bg-gray-50/50 hover:border-[#F97316] transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-heading font-black text-xs text-[#111111]">{ch.name}</span>
                      <span className="text-xs font-mono font-bold text-gray-500">{ch.txns.length} Transactions</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-xs font-mono pt-1">
                      <div>
                        <span className="text-[9px] text-gray-400 block uppercase">Revenue</span>
                        <span className="font-bold text-[#111111]">₹{rev.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 block uppercase">Cost</span>
                        <span className="font-bold text-gray-600">₹{cost.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 block uppercase">Profit</span>
                        <span className={`font-black ${profit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                          {profit >= 0 ? `+₹${profit.toLocaleString('en-IN')}` : `-₹${Math.abs(profit).toLocaleString('en-IN')}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 block uppercase">Margin</span>
                        <span className="font-bold text-[#F97316]">{margin.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TOP PROFITABLE PRODUCTS */}
          <div className="lg:col-span-7 bg-white p-6 rounded-[26px] border border-gray-200 shadow-xs space-y-4">
            <h3 className="font-heading font-black text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
              <Award size={18} className="text-[#F97316]" /> TOP PROFITABLE PRODUCTS ({activeChannelTab})
            </h3>

            {topProfitableProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400 font-mono">No product profitability records found.</div>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 uppercase">
                      <th className="py-2.5 px-3">RANK</th>
                      <th className="py-2.5 px-3">PRODUCT</th>
                      <th className="py-2.5 px-3 text-center">UNITS</th>
                      <th className="py-2.5 px-3 text-right">REVENUE</th>
                      <th className="py-2.5 px-3 text-right">PROFIT</th>
                      <th className="py-2.5 px-3 text-right">MARGIN %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {topProfitableProducts.map((p, idx) => {
                      const margin = p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0;
                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="py-2.5 px-3 font-black text-[#F97316]">#{idx + 1}</td>
                          <td className="py-2.5 px-3 font-bold text-[#111111]">{p.name}</td>
                          <td className="py-2.5 px-3 text-center font-bold">{p.unitsSold}</td>
                          <td className="py-2.5 px-3 text-right text-gray-800">₹{p.revenue.toLocaleString('en-IN')}</td>
                          <td className="py-2.5 px-3 text-right font-black text-emerald-700">+₹{p.profit.toLocaleString('en-IN')}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#F97316]">{margin.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* ── 7. LOW MARGIN / LOSS SALES & DISCOUNT IMPACT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LOW MARGIN / LOSS SALES */}
          <div className="lg:col-span-6 bg-white p-6 rounded-[26px] border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="font-heading font-black text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-600" /> LOW MARGIN / LOSS SALES
              </h3>
              <span className="text-[10px] text-gray-500 font-mono">Flagged (Margin &lt; 15% or Loss)</span>
            </div>

            {lowMarginOrLossSales.length === 0 ? (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs font-mono text-emerald-950 font-bold flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-700" />
                <span>All current sales maintain healthy profit margins above 15%! No loss sales detected.</span>
              </div>
            ) : (
              <div className="space-y-2.5 font-mono text-xs">
                {lowMarginOrLossSales.slice(0, 5).map((txn) => (
                  <div key={txn.id} className="p-3 bg-red-50/60 border border-red-200 rounded-2xl flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#111111]">{txn.orderNumber}</span>
                        <span className="text-[10px] font-black bg-red-200 text-red-900 px-1.5 py-0.5 rounded uppercase">
                          {txn.grossProfit < 0 ? 'LOSS' : 'LOW MARGIN'}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-600 block">{txn.items[0]?.productName || 'Custom Fabrication'} ({txn.customerName})</span>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-red-600 block">
                        {txn.grossProfit >= 0 ? `+₹${txn.grossProfit.toLocaleString('en-IN')}` : `-₹${Math.abs(txn.grossProfit).toLocaleString('en-IN')}`}
                      </span>
                      <span className="text-[10px] text-gray-500 block">Margin: {txn.marginPercentage.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DISCOUNT IMPACT ANALYSIS */}
          <div className="lg:col-span-6 bg-white p-6 rounded-[26px] border border-gray-200 shadow-xs space-y-4">
            <h3 className="font-heading font-black text-sm text-[#111111] uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
              <Percent size={18} className="text-[#F97316]" /> DISCOUNT IMPACT ANALYSIS
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Total Original Catalog Value</span>
                <span className="font-bold text-gray-900">₹{totalOriginalValue.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Product-Level Discounts</span>
                <span className="font-bold text-[#F97316]">-₹{totalProductDiscounts.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">POS / Manual Order Discounts</span>
                <span className="font-bold text-[#F97316]">-₹{totalOrderDiscounts.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100 bg-orange-50/60 px-3 rounded-xl">
                <span className="font-bold text-[#111111]">Total Discounts Given</span>
                <span className="font-black text-base text-[#F97316]">-₹{totalDiscountsGiven.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-center py-2 bg-emerald-50/70 px-3 rounded-xl border border-emerald-200">
                <span className="font-bold text-emerald-950 uppercase">Actual Net Revenue Collected</span>
                <span className="font-black text-base text-emerald-700">₹{totalSalesRevenue.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ── 8. PROFIT BREAKDOWN DRAWER / MODAL ── */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[26px] max-w-xl w-full p-6 space-y-6 shadow-2xl border border-gray-200 font-sans max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <span className="text-[#F97316] font-mono text-[10px] font-black uppercase tracking-wider block">
                  PROFIT BREAKDOWN AUDIT
                </span>
                <h3 className="font-heading font-black text-xl text-[#111111]">
                  Order #{selectedTxn.orderNumber}
                </h3>
              </div>

              <button
                onClick={() => setSelectedTxn(null)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* General Details */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Sales Channel</span>
                <span className="font-bold text-[#111111]">{selectedTxn.channel}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Date & Time</span>
                <span className="font-bold text-[#111111]">{selectedTxn.date}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Customer Name</span>
                <span className="font-bold text-[#111111]">{selectedTxn.customerName}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase">Mobile Number</span>
                <span className="font-bold text-[#111111]">{selectedTxn.customerPhone}</span>
              </div>
            </div>

            {/* Itemized Economics */}
            <div className="space-y-3">
              <h4 className="font-heading font-black text-xs text-[#111111] uppercase tracking-wider border-b border-gray-100 pb-1">
                Itemized Product Economics
              </h4>

              {selectedTxn.items.map((item, idx) => (
                <div key={idx} className="bg-white p-3.5 rounded-2xl border border-gray-200 space-y-2 text-xs font-mono">
                  <div className="font-bold text-[#111111] flex justify-between">
                    <span>{item.productName}</span>
                    <span className="text-gray-500 font-normal">Qty: {item.quantity}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-gray-100">
                    <div>Original Unit Price: <strong className="text-gray-900">₹{item.originalUnitPrice.toLocaleString('en-IN')}</strong></div>
                    <div>Product Discount: <strong className="text-[#F97316]">-₹{(item.productDiscount * item.quantity).toLocaleString('en-IN')}</strong></div>
                    <div>Selling Unit Price: <strong className="text-gray-900">₹{item.unitSellingPrice.toLocaleString('en-IN')}</strong></div>
                    <div>Cost Price per Unit: <strong className="text-gray-700">₹{item.costUnitPrice.toLocaleString('en-IN')}</strong></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Calculations Audit */}
            <div className="bg-orange-50/70 border border-orange-200 p-4 rounded-2xl space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span>Gross Selling Value:</span>
                <span className="font-bold">₹{selectedTxn.grossRevenue.toLocaleString('en-IN')}</span>
              </div>
              {selectedTxn.totalOrderDiscount > 0 && (
                <div className="flex justify-between text-[#F97316]">
                  <span>Additional Order/POS Discount:</span>
                  <span className="font-bold">-₹{selectedTxn.totalOrderDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {selectedTxn.refundAmount > 0 && (
                <div className="flex justify-between text-purple-700">
                  <span>Refunded Amount:</span>
                  <span className="font-bold">-₹{selectedTxn.refundAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm text-[#111111] pt-1 border-t border-orange-200">
                <span>Actual Net Revenue:</span>
                <span>₹{selectedTxn.netSalesRevenue.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between pt-1 text-gray-700">
                <span>Total Product Cost:</span>
                <span className="font-bold">₹{selectedTxn.totalCost.toLocaleString('en-IN')}</span>
              </div>

              <div className={`flex justify-between font-black text-base pt-2 border-t border-orange-200 ${
                selectedTxn.grossProfit >= 0 ? 'text-emerald-700' : 'text-red-600'
              }`}>
                <span>Gross Profit:</span>
                <span>{selectedTxn.grossProfit >= 0 ? `+₹${selectedTxn.grossProfit.toLocaleString('en-IN')}` : `-₹${Math.abs(selectedTxn.grossProfit).toLocaleString('en-IN')}`} ({selectedTxn.marginPercentage.toFixed(1)}%)</span>
              </div>
            </div>

            {/* Cash vs Receivable */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
              <div>
                <span className="text-gray-500 text-[10px] uppercase block">Cash Collected</span>
                <span className="font-black text-emerald-700 text-sm">₹{selectedTxn.amountCollected.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] uppercase block">Balance Receivable</span>
                <span className="font-black text-[#F97316] text-sm">₹{selectedTxn.balanceReceivable.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Action Link to View Full Order */}
            <button
              onClick={() => {
                setSelectedTxn(null);
                if (selectedTxn.channel === 'Online') {
                  navigate(`/admin/orders/${selectedTxn.orderId}`);
                } else {
                  navigate(`/admin/offline-orders/${selectedTxn.orderId}`);
                }
              }}
              className="w-full bg-[#111111] hover:bg-[#F97316] text-white font-heading font-black text-xs py-3 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText size={16} /> View Full Transaction Order Details
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
