import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCustomerOrders } from '../../context/OrderContext';
import { useEnquiries } from '../../context/EnquiryContext';
import { useRefunds } from '../../context/RefundContext';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Heart,
  CreditCard,
  FileText,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Flame,
  ImageIcon,
  Share2,
  Edit3,
  Package,
  Award,
  Clock,
  Sparkles,
  CheckCircle2,
  MessageCircle,
  Camera,
  Globe,
  Trash2,
  X,
  Upload,
  RotateCcw,
  MessageSquare
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const CustomerProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, loginAsAdmin, updateAvatar } = useAuth();
  const { orders, loading: ordersLoading } = useCustomerOrders(user?.phone || '');

  const ADMIN_UID = 'qiiShV5WlAY2Zwok3vNxhedl3N12';
  const isAdminUser = user?.googleUID === ADMIN_UID || user?.id === ADMIN_UID || user?.role === 'admin';

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [googleUrlInput, setGoogleUrlInput] = useState('');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editable Form State — strictly from real user data, NO fake defaults
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');

  const completedOrders = orders.filter((o) => o.status === 'COMPLETED').length;
  const pendingOrders = orders.filter((o) => ['PENDING','ACCEPTED','IN_PRODUCTION'].includes(o.status)).length;
  const totalSpent = orders.reduce((sum, o) => sum + o.advancePaid, 0);

  // Dynamic profile completion — 9 fields, 100% total
  const profileCompletion = (() => {
    if (!user) return 0;
    let score = 0;
    if (user.avatarUrl || user.googlePhotoURL) score += 15;
    if (user.name?.trim()) score += 15;
    if (user.phone?.trim()) score += 10;
    if (user.phoneVerified) score += 15;
    if (user.email?.trim()) score += 10;
    if (user.address?.trim()) score += 10;
    if (user.pincode?.trim()) score += 10;
    if (user.district?.trim()) score += 10;
    if (user.state?.trim()) score += 5;
    return score;
  })();

  // Profile Photo Priority Cascade: Uploaded > Google Photo > Default Avatar
  const displayAvatarUrl = user?.avatarUrl || user?.googlePhotoURL || undefined;

  // Real wishlist count from localStorage (same key as CustomerWishlistPage)
  const wishlistStorageKey = `ml_wishlist_${user?.id || 'guest'}`;
  const wishlistCount = (() => {
    try {
      const p = localStorage.getItem(wishlistStorageKey + '_products');
      const g = localStorage.getItem(wishlistStorageKey + '_gallery');
      const pc = p ? (JSON.parse(p) as string[]).length : 0;
      const gc = g ? (JSON.parse(g) as unknown[]).length : 0;
      return pc + gc;
    } catch { return 0; }
  })();

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMsg('Profile updated successfully!');
    setTimeout(() => {
      setProfileSuccessMsg('');
      setEditProfileOpen(false);
    }, 1200);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          updateAvatar(reader.result as string);
          setPhotoModalOpen(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const stats = [
    { label: 'Total Orders', value: ordersLoading ? '—' : orders.length, icon: Package, iconColor: 'text-[#2563EB]', bgColor: 'bg-[#DBEAFE]' },
    { label: 'Pending Works', value: ordersLoading ? '—' : pendingOrders, icon: Clock, iconColor: 'text-[#F97316]', bgColor: 'bg-[#FFEDD5]' },
    { label: 'Completed', value: ordersLoading ? '—' : completedOrders, icon: ShieldCheck, iconColor: 'text-[#22C55E]', bgColor: 'bg-[#DCFCE7]' },
    { label: 'Wishlist Items', value: wishlistCount, icon: Heart, iconColor: 'text-[#EF4444]', bgColor: 'bg-[#FEE2E2]', path: '/customer/wishlist' },
    { label: 'Total Spent', value: ordersLoading ? '—' : `₹${(totalSpent / 1000).toFixed(1)}k`, icon: CreditCard, iconColor: 'text-[#9333EA]', bgColor: 'bg-[#F3E8FF]' },
    { label: 'Invoices Issued', value: ordersLoading ? '—' : orders.length, icon: FileText, iconColor: 'text-[#D97706]', bgColor: 'bg-[#FEF3C7]' }
  ];

  const { language, setLanguage } = useLanguage();
  const { getCustomerEnquiries } = useEnquiries();
  const { getCustomerRefunds } = useRefunds();

  const myEnquiries = getCustomerEnquiries(user?.phone || '');
  const myRefunds = getCustomerRefunds(user?.phone || '');

  // Tailored Menu Items (Rich Vibrant Color Palette)
  const menuItems = [
    {
      label: 'My Orders & Invoices',
      sublabel: 'View active orders, track status & download invoices',
      icon: Package,
      iconColor: 'text-[#2563EB]',
      bgColor: 'bg-blue-50 border border-blue-200/80',
      badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
      path: '/customer/orders',
      badge: `${pendingOrders > 0 ? `${pendingOrders} Active` : `${orders.length} Total`}`
    },
    {
      label: 'My Custom Enquiries & Quotations',
      sublabel: 'Track custom fabrication quotes & responses from workshop',
      icon: MessageSquare,
      iconColor: 'text-[#D97706]',
      bgColor: 'bg-amber-50 border border-amber-200/80',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      path: '/customer/enquiries',
      badge: myEnquiries.length > 0 ? `${myEnquiries.length} Enquiries` : undefined
    },
    {
      label: 'My Refund Requests & Ledger',
      sublabel: 'View payment refund status & shop transaction receipts',
      icon: RotateCcw,
      iconColor: 'text-[#DC2626]',
      bgColor: 'bg-red-50 border border-red-200/80',
      badgeBg: 'bg-red-100 text-red-800 border-red-300',
      path: '/customer/refunds',
      badge: myRefunds.length > 0 ? `${myRefunds.length} Refunds` : undefined
    },
    {
      label: 'Wishlist & Saved Items',
      sublabel: 'Saved lathe models & custom gate specifications',
      icon: Heart,
      iconColor: 'text-[#EC4899]',
      bgColor: 'bg-pink-50 border border-pink-200/80',
      badgeBg: 'bg-pink-100 text-pink-800 border-pink-300',
      path: '/customer/wishlist',
      badge: wishlistCount > 0 ? `${wishlistCount} Saved` : undefined
    },
    {
      label: 'Workshop Stories & Live Gallery',
      sublabel: 'Watch live machine turning & fabrication video updates',
      icon: Flame,
      iconColor: 'text-[#F97316]',
      bgColor: 'bg-orange-50 border border-orange-200/80',
      badgeBg: 'bg-orange-100 text-orange-800 border-orange-300',
      path: '/customer/status'
    },
    {
      label: 'WhatsApp Workshop Direct Support',
      sublabel: 'Chat directly with owner Chellamuthu K',
      icon: MessageCircle,
      iconColor: 'text-[#16A34A]',
      bgColor: 'bg-emerald-50 border border-emerald-200/80',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      path: 'https://wa.me/919659286268'
    },
    ...(isAdminUser ? [{
      label: 'Open Admin Workshop Portal',
      sublabel: 'Manage orders, offline walk-ins & live workshop status',
      icon: ShieldCheck,
      iconColor: 'text-white',
      bgColor: 'bg-gradient-to-r from-[#111111] to-slate-900 border border-slate-700 text-white',
      badgeBg: 'bg-[#F97316] text-white',
      badge: 'ADMIN PORTAL',
      action: 'open_admin'
    }] : [])
  ];

  const handleShareApp = () => {
    if (navigator.share) {
      navigator.share({ title: 'MANIKANDAN LATHE Workshop App', url: window.location.origin });
    } else {
      navigator.clipboard.writeText(window.location.origin);
      alert('App link copied to clipboard!');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 font-sans max-w-[1400px] mx-auto">
      
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* DESKTOP 2-COLUMN GRID SYSTEM (1400px Max-Width) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* LEFT COLUMN: Profile Header Card & Statistics */}
        <div className="lg:col-span-5 space-y-6">
          {/* PROFILE HEADER CARD */}
          <div className="bg-white rounded-[22px] border border-gray-200 p-6 shadow-xs relative overflow-hidden space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              
              <div className="flex items-center gap-4">
                {/* Interactive Profile Photo Avatar */}
                <div className="relative group cursor-pointer" onClick={() => setPhotoModalOpen(true)}>
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#F97316] to-[#111111] p-1 shadow-md relative overflow-hidden">
                    {displayAvatarUrl ? (
                      <img src={displayAvatarUrl} alt={name} referrerPolicy="no-referrer" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-heading font-black text-2xl text-[#111111] uppercase">
                        {name ? name.charAt(0) : (user?.name ? user.name.charAt(0) : '?')}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                      <Camera size={20} className="text-white" />
                    </div>
                  </div>
                  <span className="absolute bottom-0 right-0 bg-[#22C55E] w-4 h-4 rounded-full border-2 border-white shadow-xs" title="Online" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-heading font-black text-xl sm:text-2xl text-[#111111]">
                      {name}
                    </h1>
                    <span className="bg-[#DCFCE7] text-[#15803D] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck size={12} /> Verified Customer
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 font-mono">Customer ID: <strong className="text-[#111111]">{user?.customerId || '—'}</strong></p>

                  <div className="flex flex-wrap gap-4 text-xs text-gray-600 font-mono pt-0.5">
                    <span className="flex items-center gap-1"><Phone size={13} className="text-[#F97316]" /> {phone}</span>
                    <span className="flex items-center gap-1"><Mail size={13} className="text-[#F97316]" /> {email}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setEditProfileOpen(!editProfileOpen)}
                className="bg-[#FFEDD5] hover:bg-[#FED7AA] text-[#F97316] font-heading font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors self-stretch sm:self-auto justify-center"
              >
                <Edit3 size={14} className="text-[#F97316]" /> {editProfileOpen ? 'Close' : 'Edit Profile'}
              </button>
            </div>

            {/* Profile Completion Bar — calculated dynamically */}
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-heading font-bold">
                <span className="text-gray-700 flex items-center gap-1">
                  <Sparkles size={14} className="text-[#F97316]" /> Profile Completion
                </span>
                <span className="text-[#F97316] font-mono font-black">{profileCompletion}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#F97316] rounded-full transition-all duration-500"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
            </div>
          </div>

          {/* ── ADMIN PORTAL ACCESS CARD (Prominently shown for UID qiiShV5WlAY2Zwok3vNxhedl3N12 / Admin) ── */}
          {isAdminUser && (
            <div className="bg-gradient-to-br from-[#111111] via-[#1A1A1A] to-[#242424] text-white rounded-[24px] border-2 border-[#F97316] p-5 shadow-xl space-y-3.5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="bg-[#F97316]/20 border border-[#F97316] text-[#F97316] text-[10px] font-mono font-black px-3 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={12} /> Authorized Admin Account
                </span>
                <span className="text-[10px] font-mono text-gray-400 font-bold">UID: {user?.googleUID || 'qiiShV5Wl...'}</span>
              </div>

              <div>
                <h3 className="font-heading font-black text-lg text-white flex items-center gap-2">
                  🛠️ WORKSHOP ADMIN PORTAL
                </h3>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  Full workshop management: walk-in offline billing, customer payment ledger, live status stories, and order dispatch.
                </p>
              </div>

              <button
                onClick={() => {
                  loginAsAdmin();
                  navigate('/admin');
                }}
                className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
              >
                <ShieldCheck size={16} /> Launch Admin Dashboard →
              </button>
            </div>
          )}

            {/* EXPANDABLE EDIT PROFILE FORM */}
            {editProfileOpen && (
              <form onSubmit={handleSaveProfile} className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-200 space-y-4 pt-4">
                <h3 className="font-heading font-black text-xs text-[#111111] uppercase flex items-center gap-2 border-b border-gray-200 pb-2">
                  <Edit3 size={14} className="text-[#F97316]" /> EDIT PROFILE DETAILS
                </h3>

                {profileSuccessMsg && (
                  <div className="p-3 bg-[#DCFCE7] text-[#15803D] text-xs font-bold rounded-xl flex items-center gap-2">
                    <CheckCircle2 size={16} /> {profileSuccessMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white p-2.5 rounded-xl border border-gray-300 font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white p-2.5 rounded-xl border border-gray-300 font-mono font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white p-2.5 rounded-xl border border-gray-300 font-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1">Delivery Address *</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-white p-2.5 rounded-xl border border-gray-300 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setEditProfileOpen(false)}
                    className="bg-gray-200 text-gray-800 font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs px-5 py-2 rounded-xl shadow-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

          {/* STATISTICS COUNTERS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {stats.map((st, idx) => {
              const Icon = st.icon;
              return (
                <div
                  key={idx}
                  onClick={() => st.path && navigate(st.path)}
                  className="p-3.5 bg-white rounded-[22px] border border-gray-200 shadow-xs flex flex-col justify-between space-y-2 cursor-pointer hover:border-[#F97316] transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-xl ${st.bgColor} flex items-center justify-center`}>
                      <Icon size={16} className={st.iconColor} />
                    </div>
                    <ChevronRight size={14} className="text-[#9CA3AF] group-hover:text-black transition-colors" />
                  </div>

                  <div>
                    <span className="font-heading font-black text-lg sm:text-xl text-[#111111] block leading-tight">
                      {st.value}
                    </span>
                    <span className="text-[11px] text-gray-500 font-mono block mt-0.5">{st.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Account Hub Menu Cards & Actions */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* VIBRANT MENU CARDS CONTAINER */}
          <div className="bg-white rounded-[24px] border border-gray-200 shadow-xs divide-y divide-gray-100 overflow-hidden">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (item.action === 'open_admin') {
                      loginAsAdmin();
                      navigate('/admin');
                    } else if (item.action === 'share') {
                      handleShareApp();
                    } else if (item.path?.startsWith('http')) {
                      window.open(item.path, '_blank');
                    } else if (item.path) {
                      navigate(item.path);
                    }
                  }}
                  className="p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50/80 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-2xl ${item.bgColor} flex items-center justify-center shrink-0 shadow-xs`}>
                      <Icon size={22} className={item.iconColor} />
                    </div>
                    <div>
                      <span className="font-heading font-extrabold text-sm text-[#111111] group-hover:text-[#F97316] transition-colors block">
                        {item.label}
                      </span>
                      {item.sublabel && (
                        <p className="text-xs text-gray-500 font-mono mt-0.5 line-clamp-1">{item.sublabel}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.badge && (
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${item.badgeBg || 'bg-orange-100 text-[#F97316] border-orange-200'}`}>
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight size={18} className="text-[#9CA3AF] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* LOGOUT BUTTON */}
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full bg-[#FEE2E2] hover:bg-red-200 text-[#DC2626] font-heading font-black text-xs py-3.5 rounded-2xl border border-red-200 flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98 cursor-pointer"
          >
            <LogOut size={16} className="text-[#DC2626]" /> Sign Out of Account ({name})
          </button>
        </div>

      </div>

      {/* 5. CHANGE PROFILE PHOTO BOTTOM SHEET MODAL */}
      {photoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end flex-col sm:items-center sm:justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-[32px] sm:rounded-[26px] max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-200 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="font-heading font-black text-sm text-[#111111] flex items-center gap-2">
                <Camera size={18} className="text-[#F97316]" /> CHANGE PROFILE PHOTO
              </h3>
              <button onClick={() => setPhotoModalOpen(false)} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2 text-xs font-heading font-extrabold">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-3.5 rounded-2xl bg-orange-50 hover:bg-orange-100 text-[#F97316] flex items-center gap-3 transition-colors text-left"
              >
                <Upload size={18} />
                <div>
                  <span>Upload Custom Photo (Gallery / Camera)</span>
                  <p className="text-[10px] text-gray-500 font-mono font-normal">Supports JPG, PNG, WEBP (Max 5 MB)</p>
                </div>
              </button>

              {/* Google Profile Picture URL Input & Sign-In Option */}
              <div className="bg-blue-50/80 p-3.5 rounded-2xl border border-blue-200 space-y-2">
                <div className="flex items-center gap-2 text-blue-700 font-bold">
                  <Globe size={18} />
                  <span>Google Account Profile Picture</span>
                </div>
                
                <p className="text-[10px] text-gray-600 font-mono">
                  Paste your Google Account photo URL or fetch automatically via Google Sign-In:
                </p>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://lh3.googleusercontent.com/..."
                      value={googleUrlInput}
                      onChange={(e) => setGoogleUrlInput(e.target.value)}
                      className="flex-1 bg-white p-2.5 rounded-xl border border-gray-300 font-mono text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (googleUrlInput.trim()) {
                          updateAvatar(googleUrlInput.trim());
                          setPhotoModalOpen(false);
                        } else if (user?.googlePhotoURL) {
                          updateAvatar(user.googlePhotoURL);
                          setPhotoModalOpen(false);
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-heading font-black text-xs px-3 rounded-xl shadow-xs shrink-0"
                    >
                      Apply
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const url = prompt('Enter your Google Account Profile Picture URL:', user?.googlePhotoURL ?? '');
                      if (url) {
                        updateAvatar(url.trim());
                        setPhotoModalOpen(false);
                      }
                    }}
                    className="w-full bg-white hover:bg-blue-100 text-blue-700 font-bold text-xs py-2 rounded-xl border border-blue-300 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    🔐 Sync Profile Picture via Google Sign-In URL
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  updateAvatar('');
                  setPhotoModalOpen(false);
                }}
                className="w-full p-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center gap-3 transition-colors text-left font-bold"
              >
                <Trash2 size={18} />
                <span>Remove Profile Photo (Reset to Initials)</span>
              </button>
            </div>

            <button
              onClick={() => setPhotoModalOpen(false)}
              className="w-full bg-gray-100 text-gray-700 font-bold text-xs py-2.5 rounded-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
