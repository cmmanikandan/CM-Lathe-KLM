import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { useEnquiries } from '../../context/EnquiryContext';
import { useRefunds } from '../../context/RefundContext';
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Hammer,
  ClipboardList,
  Users,
  Package,
  Wallet,
  BarChart3,
  Flame,
  Image as ImageIcon,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Tag,
  Wrench,
  Layers,
  Box,
  Star,
  Heart,
  Camera,
  FileInput,
  Bell,
  Truck,
  FileText,
  RotateCcw,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  TrendingUp,
} from 'lucide-react';
import { GlobalSearchModal } from '../common/GlobalSearchModal';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { logout } = useAuth();
  const { orders } = useOrders();
  const { enquiries } = useEnquiries();
  const { refunds } = useRefunds();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('ml_admin_sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('ml_admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Keyboard shortcut Ctrl+K to open search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [catalogExpanded, setCatalogExpanded] = useState(
    location.pathname.startsWith('/admin/products') ||
    location.pathname.startsWith('/admin/categories') ||
    location.pathname.startsWith('/admin/materials') ||
    location.pathname.startsWith('/admin/variants') ||
    location.pathname.startsWith('/admin/inventory') ||
    location.pathname.startsWith('/admin/reviews') ||
    location.pathname.startsWith('/admin/wishlist') ||
    location.pathname.startsWith('/admin/media-gallery') ||
    location.pathname.startsWith('/admin/import-export')
  );

  const onlineOrdersCount = orders.filter(
    (o) => !o.isOfflineOrder && (o.orderType as string) !== 'POS' && o.orderType !== 'Quick Order'
  ).length;

  const pendingEnquiriesCount = enquiries.filter(
    (e) => e.status === 'ENQUIRY_RECEIVED' || e.status === 'UNDER_REVIEW'
  ).length;

  const pendingRefundsCount = refunds.filter(
    (r) => r.status === 'Requested' || r.status === 'Pending Approval'
  ).length;

  const isActive = (path: string) => location.pathname === path;

  // Top-level nav items (before catalog)
  const topNavItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Enquiries', path: '/admin/enquiries', icon: FileText, badge: pendingEnquiriesCount },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag, badge: onlineOrdersCount },
    { name: 'Customer Directory', path: '/admin/customers', icon: Users },
  ];

  // Offline Orders group
  const offlineNavItems = [
    { name: 'Quick Order (POS)', path: '/admin/offline-orders/quick', icon: ShoppingCart },
    { name: 'Advanced Fabrication', path: '/admin/offline-orders/advanced', icon: Hammer },
    { name: 'Offline Order', path: '/admin/offline-orders/today', icon: ClipboardList },
  ];

  // Catalog sub-items
  const catalogSubItems = [
    { name: 'All Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: Tag },
    { name: 'Materials & Brands', path: '/admin/materials', icon: Wrench },
    { name: 'Variants Matrix', path: '/admin/variants', icon: Layers },
    { name: 'Inventory & Stock', path: '/admin/inventory', icon: Box },
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
    { name: 'Wishlist Analytics', path: '/admin/wishlist', icon: Heart },
    { name: 'Media Gallery', path: '/admin/media-gallery', icon: Camera },
    { name: 'Import / Export', path: '/admin/import-export', icon: FileInput },
  ];

  // Bottom nav items (after catalog)
  const bottomNavItems = [
    { name: 'Profit & Margin', path: '/admin/profit', icon: TrendingUp },
    { name: 'Refund Management', path: '/admin/refunds', icon: RotateCcw, badge: pendingRefundsCount },
    { name: 'Payment Ledger', path: '/admin/payments', icon: Wallet },
    { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    { name: 'Status Stories', path: '/admin/status', icon: Flame },
    { name: 'Gallery Management', path: '/admin/gallery', icon: ImageIcon },
  ];

  const NavLink: React.FC<{ name: string; path: string; icon: React.FC<any>; badge?: number; exact?: boolean }> = ({ name, path, icon: Icon, badge, exact }) => {
    const active = exact ? isActive(path) : isActive(path);
    return (
      <Link
        to={path}
        onClick={() => setMobileSidebarOpen(false)}
        title={sidebarCollapsed ? name : undefined}
        className={`flex items-center ${
          sidebarCollapsed ? 'justify-between px-3 py-2.5 md:justify-center md:p-3' : 'justify-between px-3 py-2.5'
        } rounded-xl transition-all font-bold relative group ${
          active ? 'bg-[#F97316] text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/10'
        }`}
      >
        <div className={`flex items-center ${sidebarCollapsed ? 'gap-3 truncate md:justify-center md:gap-0' : 'gap-3 truncate'}`}>
          <Icon size={20} className={active ? 'text-white shrink-0' : 'text-gray-400 group-hover:text-white shrink-0'} />
          <span className={`truncate text-xs ${sidebarCollapsed ? 'inline md:hidden' : 'inline'}`}>{name}</span>
        </div>
        {badge ? (
          <>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 ${
              sidebarCollapsed ? 'inline md:hidden' : 'inline'
            } ${active ? 'bg-white text-[#F97316]' : 'bg-[#F97316] text-white'}`}>
              {badge}
            </span>
            {sidebarCollapsed && (
              <span className="hidden md:block absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#F97316] border-2 border-[#111111]" />
            )}
          </>
        ) : null}
      </Link>
    );
  };

  const isCatalogActive = catalogSubItems.some(item => isActive(item.path));

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col md:flex-row text-[#111111]">
      
      {/* Mobile Top Admin Header Bar */}
      <div className="md:hidden bg-[#111111] text-white p-4 flex items-center justify-between border-b border-gray-800 sticky top-0 z-40">
        <BrandLogo size="mobile" theme="dark" />
        <div className="flex items-center gap-3">
          <span className="bg-[#F97316] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">ADMIN</span>
          <button onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} className="text-white p-1 cursor-pointer">
            {mobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Clean ERP Admin Left Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen bg-[#111111] text-white flex flex-col justify-between border-r border-gray-800 transition-all duration-300 w-64 ${
          sidebarCollapsed ? 'md:w-20' : 'md:w-64'
        } ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >

        {/* FIXED TOP: Brand Header with Logo & Toggle */}
        <div className={`p-3.5 border-b border-gray-800 shrink-0 ${
          sidebarCollapsed ? 'md:p-3 md:flex md:flex-col md:items-center md:gap-3 space-y-2 md:space-y-0' : 'space-y-2'
        }`}>
          <div className="flex items-center justify-between gap-1.5 w-full min-w-0">
            <BrandLogo 
              size="sidebar" 
              theme="dark" 
              showTagline={true} 
              hideText={false}
              className={`min-w-0 flex-1 overflow-hidden ${sidebarCollapsed ? 'md:hidden' : 'flex'}`}
            />
            {sidebarCollapsed && (
              <BrandLogo 
                size="sidebar" 
                theme="dark" 
                showTagline={false} 
                hideText={true}
                className="hidden md:flex shrink-0"
              />
            )}
            {!sidebarCollapsed && (
              <button
                onClick={toggleSidebar}
                className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 hover:bg-[#F97316] text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
                title="Collapse Sidebar"
              >
                <PanelLeftClose size={18} />
              </button>
            )}
          </div>
          
          {sidebarCollapsed ? (
            <>
              <button
                onClick={toggleSidebar}
                className="hidden md:flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 hover:bg-[#F97316] text-gray-300 hover:text-white transition-colors cursor-pointer"
                title="Expand Sidebar"
              >
                <PanelLeftOpen size={18} />
              </button>
              <div className="pt-0.5 flex md:hidden items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F97316] animate-pulse shrink-0" />
                <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider truncate">
                  Owner Admin Portal
                </span>
              </div>
            </>
          ) : (
            <div className="pt-0.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F97316] animate-pulse shrink-0" />
              <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider truncate">
                Owner Admin Portal
              </span>
            </div>
          )}
        </div>

        {/* MIDDLE SCROLLABLE MENU */}
        <div className={`flex-1 overflow-y-auto ${
          sidebarCollapsed ? 'px-3 py-4 space-y-1 md:px-2 md:space-y-2' : 'p-4 space-y-1'
        } font-heading custom-scrollbar`}>

          {/* Top nav items */}
          {topNavItems.map(item => (
            <NavLink key={item.path} {...item} />
          ))}

          {/* Offline Orders section */}
          <div className="pt-2 pb-1">
            <span className={`text-[9px] font-mono font-bold uppercase text-gray-600 tracking-widest px-3 ${
              sidebarCollapsed ? 'block md:hidden' : 'block'
            }`}>
              Walk-in Orders
            </span>
            {sidebarCollapsed && (
              <div className="hidden md:block border-t border-gray-800/80 my-1" />
            )}
          </div>
          {offlineNavItems.map(item => (
            <NavLink key={item.path} {...item} />
          ))}

          {/* Product Catalog Collapsible Section */}
          <div className="pt-2 pb-1">
            <span className={`text-[9px] font-mono font-bold uppercase text-gray-600 tracking-widest px-3 ${
              sidebarCollapsed ? 'block md:hidden' : 'block'
            }`}>
              Product Catalog
            </span>
            {sidebarCollapsed && (
              <div className="hidden md:block border-t border-gray-800/80 my-1" />
            )}
          </div>
          
          <button
            onClick={() => setCatalogExpanded(!catalogExpanded)}
            title={sidebarCollapsed ? 'Product Catalog' : undefined}
            className={`w-full flex items-center ${
              sidebarCollapsed ? 'justify-between px-3 py-2.5 md:justify-center md:p-3' : 'justify-between px-3 py-2.5'
            } rounded-xl transition-all font-bold cursor-pointer relative ${
              isCatalogActive ? 'bg-[#F97316]/20 text-[#F97316]' : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <div className={`flex items-center ${sidebarCollapsed ? 'gap-3 md:gap-0 md:justify-center' : 'gap-3'}`}>
              <Package size={20} className="shrink-0" />
              <span className={`text-xs ${sidebarCollapsed ? 'inline md:hidden' : 'inline'}`}>Product Catalog</span>
            </div>
            <div className={sidebarCollapsed ? 'block md:hidden' : 'block'}>
              {catalogExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
            {sidebarCollapsed && isCatalogActive && (
              <span className="hidden md:block absolute top-2 right-2 w-2 h-2 rounded-full bg-[#F97316]" />
            )}
          </button>

          {catalogExpanded && (
            <div className={sidebarCollapsed ? 'pl-4 space-y-0.5 border-l border-gray-700/50 ml-4 md:pl-0 md:border-0 md:ml-0 md:space-y-1 md:py-1' : 'pl-4 space-y-0.5 border-l border-gray-700/50 ml-4'}>
              {catalogSubItems.map(item => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileSidebarOpen(false)}
                    title={sidebarCollapsed ? item.name : undefined}
                    className={`flex items-center ${
                      sidebarCollapsed ? 'gap-2.5 px-3 py-2 md:justify-center md:p-2.5' : 'gap-2.5 px-3 py-2'
                    } rounded-xl transition-all text-xs font-bold ${
                      active
                        ? 'bg-[#F97316] text-white shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon size={16} className="shrink-0" />
                    <span className={`truncate ${sidebarCollapsed ? 'inline md:hidden' : 'inline'}`}>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Other nav items */}
          <div className="pt-2 pb-1">
            <span className={`text-[9px] font-mono font-bold uppercase text-gray-600 tracking-widest px-3 ${
              sidebarCollapsed ? 'block md:hidden' : 'block'
            }`}>
              Management
            </span>
            {sidebarCollapsed && (
              <div className="hidden md:block border-t border-gray-800/80 my-1" />
            )}
          </div>
          {bottomNavItems.map(item => (
            <NavLink key={item.path} {...item} />
          ))}
        </div>

        {/* FIXED BOTTOM: Footer Shortcuts */}
        <div className={`p-4 border-t border-gray-800 ${
          sidebarCollapsed ? 'space-y-2.5 p-4 md:p-2 md:flex md:flex-col md:items-center' : 'space-y-2.5'
        } shrink-0 bg-[#111111]`}>
          <Link
            to="/customer/home"
            onClick={() => setMobileSidebarOpen(false)}
            className={`bg-white/10 hover:bg-[#F97316] text-gray-300 hover:text-white text-xs font-bold ${
              sidebarCollapsed ? 'px-3.5 py-2.5 justify-between w-full md:p-3 md:justify-center' : 'px-3.5 py-2.5 justify-between w-full'
            } rounded-xl flex items-center transition-colors shadow-xs`}
            title="Browse Customer Panel without signing out"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={16} className="text-[#F97316]" /> 
              <span className={sidebarCollapsed ? 'inline md:hidden' : 'inline'}>View Live Website</span>
            </span>
            <ChevronRight size={14} className={sidebarCollapsed ? 'inline md:hidden' : 'inline'} />
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            title="Sign Out Admin"
            className={`bg-red-950/60 hover:bg-red-900/80 text-red-300 font-bold text-xs ${
              sidebarCollapsed ? 'px-3.5 py-2.5 justify-center w-full md:p-3' : 'px-3.5 py-2.5 justify-center w-full'
            } rounded-xl border border-red-800/60 flex items-center gap-2 transition-colors cursor-pointer`}
          >
            <LogOut size={16} /> 
            <span className={sidebarCollapsed ? 'inline md:hidden' : 'inline'}>Sign Out Admin</span>
          </button>
        </div>

      </aside>

      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* Main Admin Page Content */}
      <div className="flex-1 min-w-0 overflow-y-auto relative">
        {children}



        <GlobalSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      </div>

    </div>
  );
};

export default AdminLayout;
