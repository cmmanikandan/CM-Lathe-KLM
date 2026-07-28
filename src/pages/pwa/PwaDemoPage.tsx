import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import {
  Smartphone,
  Monitor,
  Download,
  WifiOff,
  Clock,
  FileText,
  Flame,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Phone,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Share2,
  ChevronRight,
  Laptop,
  Globe,
  Check,
  X,
  Info,
  Apple,
  ExternalLink,
  QrCode
} from 'lucide-react';

export const PwaDemoPage: React.FC = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeModal, setActiveModal] = useState<'mobile' | 'laptop' | null>(null);
  const [detectedDevice, setDetectedDevice] = useState<'mobile' | 'laptop'>('laptop');

  useEffect(() => {
    // Detect current platform
    const ua = navigator.userAgent.toLowerCase();
    const isMobileDevice = /android|iphone|ipad|ipod|blackberry|windows phone|mobile/i.test(ua);
    setDetectedDevice(isMobileDevice ? 'mobile' : 'laptop');

    // Listen for PWA beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already running in standalone mode (PWA installed)
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const triggerPwaInstall = async (targetDevice: 'mobile' | 'laptop') => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        setActiveModal(targetDevice);
      }
    } else {
      setActiveModal(targetDevice);
    }
  };

  const pwaFeatures = [
    {
      icon: Smartphone,
      color: 'bg-orange-50 text-[#F97316]',
      title: 'Mobile-First PWA Experience',
      description: 'Works as a native mobile application on Android and iOS without app store downloads.'
    },
    {
      icon: Laptop,
      color: 'bg-[#111111] text-white',
      title: 'Desktop & Laptop Windows App',
      description: 'Launch as a dedicated desktop software on Windows, Mac & ChromeOS with multi-window support.'
    },
    {
      icon: WifiOff,
      color: 'bg-blue-50 text-blue-600',
      title: 'Offline Support & Fast Cache',
      description: 'Access product catalog, saved quotes, and address details even with low agricultural network coverage.'
    },
    {
      icon: Clock,
      color: 'bg-amber-50 text-amber-600',
      title: 'Live Factory Order Ledger',
      description: 'Real-time production stage tracking: ACCEPTED ➔ IN_PRODUCTION ➔ READY ➔ COMPLETED.'
    },
    {
      icon: FileText,
      color: 'bg-green-50 text-green-600',
      title: 'Instant GST & Tax Invoices',
      description: 'Generate, preview, print, and download pixel-perfect A4 tax invoices directly on mobile & desktop.'
    },
    {
      icon: Flame,
      color: 'bg-red-50 text-red-600',
      title: '24h Live Workshop Stories',
      description: 'Watch factory video clips & photos of turning, welding, and gate installations posted daily.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111] font-sans antialiased flex flex-col selection:bg-[#F97316] selection:text-white">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 w-full">
        
        {/* 1. HERO BANNER */}
        <div className="bg-gradient-to-br from-[#111111] via-[#1A1A1A] to-[#242424] text-white rounded-[28px] p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#F97316]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#F97316]/20 border border-[#F97316] text-[#F97316] text-xs font-mono font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
              <Sparkles size={14} /> Official PWA Download Center
            </div>

            <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
              DOWNLOAD MANIKANDAN <span className="text-[#F97316]">LATHE</span> APP
            </h1>

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Install the official progressive app on your <strong>Mobile Phone</strong> or <strong>Laptop / PC</strong>. Zero app store fees, instant loading, offline catalog browsing, and live factory order updates.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs font-mono text-gray-400">Detected Device:</span>
              <span className="bg-white/10 text-white text-xs font-mono font-bold px-3 py-1 rounded-lg border border-white/15 flex items-center gap-1.5">
                {detectedDevice === 'mobile' ? (
                  <><Smartphone size={14} className="text-[#F97316]" /> Mobile Phone Detected</>
                ) : (
                  <><Laptop size={14} className="text-blue-400" /> Laptop / PC Detected</>
                )}
              </span>
              {isInstalled && (
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold px-3 py-1 rounded-lg flex items-center gap-1">
                  <CheckCircle2 size={14} /> App Installed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 2. DUAL DOWNLOAD CARDS: MOBILE vs LAPTOP */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <span className="text-[#F97316] font-mono text-xs font-bold uppercase tracking-widest block">
                Instant Installation
              </span>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#111111]">
                Choose Your Device Platform
              </h2>
            </div>
            <p className="text-xs text-gray-500 max-w-md">
              Download directly to your Android, iPhone, Windows Laptop, or Mac with 1 click.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 📱 MOBILE DOWNLOAD CARD */}
            <div className={`bg-white rounded-[26px] border-2 p-6 sm:p-8 shadow-md flex flex-col justify-between space-y-6 transition-all ${detectedDevice === 'mobile' ? 'border-[#F97316] ring-4 ring-[#F97316]/10' : 'border-gray-200'}`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-orange-100 text-[#F97316] flex items-center justify-center border border-orange-200">
                    <Smartphone size={30} />
                  </div>
                  <span className="bg-orange-50 text-[#F97316] border border-orange-200 text-[11px] font-mono font-extrabold px-3 py-1 rounded-full uppercase">
                    Android & iOS
                  </span>
                </div>

                <div>
                  <h3 className="font-heading font-black text-xl text-[#111111]">Download for Mobile Phone</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Install on your smartphone home screen. Fast touch controls, offline order status, and instant WhatsApp inquiry.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100 text-xs text-gray-700 font-medium">
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-emerald-600 shrink-0" />
                    <span>Works on Android (Chrome/Edge) & iPhone (Safari)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-emerald-600 shrink-0" />
                    <span>Adds direct app icon to your phone launcher</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-emerald-600 shrink-0" />
                    <span>Full offline access for farm & factory visits</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <button
                  onClick={() => triggerPwaInstall('mobile')}
                  className="w-full py-4 bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer"
                >
                  <Download size={18} />
                  {isInstalled ? 'Mobile App Installed ✓' : 'Download & Install Mobile App'}
                </button>
                <button
                  onClick={() => setActiveModal('mobile')}
                  className="w-full py-2.5 text-xs font-mono font-bold text-gray-600 hover:text-[#111111] text-center hover:underline cursor-pointer"
                >
                  View Mobile Installation Instructions →
                </button>
              </div>
            </div>

            {/* 💻 LAPTOP / PC DOWNLOAD CARD */}
            <div className={`bg-white rounded-[26px] border-2 p-6 sm:p-8 shadow-md flex flex-col justify-between space-y-6 transition-all ${detectedDevice === 'laptop' ? 'border-[#111111] ring-4 ring-black/5' : 'border-gray-200'}`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-[#111111] text-white flex items-center justify-center shadow-sm">
                    <Laptop size={30} />
                  </div>
                  <span className="bg-gray-100 text-gray-800 border border-gray-300 text-[11px] font-mono font-extrabold px-3 py-1 rounded-full uppercase">
                    Windows, Mac & Linux
                  </span>
                </div>

                <div>
                  <h3 className="font-heading font-black text-xl text-[#111111]">Download for Laptop & Desktop</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Install as a standalone PC desktop application. Perfect for counter sales, workshop invoice printing, and admin management.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100 text-xs text-gray-700 font-medium">
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-emerald-600 shrink-0" />
                    <span>Launches in an independent desktop app window</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-emerald-600 shrink-0" />
                    <span>Desktop taskbar icon & Windows Start menu shortcut</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-emerald-600 shrink-0" />
                    <span>High-speed keyboard navigation & thermal printing</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <button
                  onClick={() => triggerPwaInstall('laptop')}
                  className="w-full py-4 bg-[#111111] hover:bg-[#F97316] text-white font-heading font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer"
                >
                  <Monitor size={18} />
                  {isInstalled ? 'PC Desktop App Installed ✓' : 'Download & Install Laptop App'}
                </button>
                <button
                  onClick={() => setActiveModal('laptop')}
                  className="w-full py-2.5 text-xs font-mono font-bold text-gray-600 hover:text-[#111111] text-center hover:underline cursor-pointer"
                >
                  View Laptop Installation Instructions →
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* 3. PWA APP HIGHLIGHT FEATURES GRID */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[#F97316] font-mono text-xs font-bold uppercase tracking-widest block">
              Built For Performance
            </span>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#111111]">
              Why Use MANIKANDAN LATHE PWA?
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Built specifically for agricultural machinery owners, builders, and custom steel gate buyers across Tamil Nadu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pwaFeatures.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-[22px] border border-gray-200 p-6 shadow-xs space-y-3 hover:border-[#F97316] transition-all"
                >
                  <div className={`w-12 h-12 rounded-2xl ${feat.color} flex items-center justify-center`}>
                    <IconComp size={24} />
                  </div>
                  <h3 className="font-heading font-black text-base text-[#111111]">{feat.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">{feat.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 4. INTERACTIVE DIRECT APP MODULE LINKS */}
        <div className="bg-white rounded-[24px] border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-heading font-black text-xl text-[#111111]">Test Live App Modules</h3>
              <p className="text-xs text-gray-500 mt-0.5">Explore every section of the application directly in your browser.</p>
            </div>
            <span className="bg-green-100 text-green-800 text-xs font-mono font-bold px-3 py-1 rounded-full">
              Live Production Build
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => navigate('/customer/home')}
              className="bg-gray-50 hover:bg-orange-50/60 border border-gray-200 hover:border-[#F97316] p-4 rounded-2xl cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex justify-between items-center">
                <span className="font-heading font-black text-xs text-[#111111] group-hover:text-[#F97316]">Customer Dashboard</span>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-[#F97316]" />
              </div>
              <p className="text-[11px] text-gray-500 leading-tight">Welcome banner, active order tracker, category chips, and shortcuts.</p>
            </div>

            <div
              onClick={() => navigate('/customer/products')}
              className="bg-gray-50 hover:bg-orange-50/60 border border-gray-200 hover:border-[#F97316] p-4 rounded-2xl cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex justify-between items-center">
                <span className="font-heading font-black text-xs text-[#111111] group-hover:text-[#F97316]">Product Catalogue</span>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-[#F97316]" />
              </div>
              <p className="text-[11px] text-gray-500 leading-tight">Tractor Kalappai, Main Gates, Steel Doors, Grills with size filters.</p>
            </div>

            <div
              onClick={() => navigate('/customer/orders')}
              className="bg-gray-50 hover:bg-orange-50/60 border border-gray-200 hover:border-[#F97316] p-4 rounded-2xl cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex justify-between items-center">
                <span className="font-heading font-black text-xs text-[#111111] group-hover:text-[#F97316]">My Orders & Invoices</span>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-[#F97316]" />
              </div>
              <p className="text-[11px] text-gray-500 leading-tight">Order status tracking, remaining balance due, and tax invoice generator.</p>
            </div>

            <div
              onClick={() => navigate('/admin/login')}
              className="bg-gray-50 hover:bg-orange-50/60 border border-gray-200 hover:border-[#F97316] p-4 rounded-2xl cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex justify-between items-center">
                <span className="font-heading font-black text-xs text-[#111111] group-hover:text-[#F97316]">Admin Workshop Portal</span>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-[#F97316]" />
              </div>
              <p className="text-[11px] text-gray-500 leading-tight">Counter sales offline billing, status updates, payment logging, and stories.</p>
            </div>
          </div>
        </div>

      </main>

      {/* MOBILE INSTALL INSTRUCTIONS MODAL */}
      <AnimatePresence>
        {activeModal === 'mobile' && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[28px] max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-gray-100"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 text-[#F97316] rounded-2xl">
                    <Smartphone size={24} />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-lg text-[#111111]">Install on Mobile Phone</h3>
                    <p className="text-xs text-gray-500">Step-by-step installation for Android & iPhone</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-2 text-gray-400 hover:text-[#111111] rounded-xl hover:bg-gray-100 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 text-xs font-sans">
                {/* Android Steps */}
                <div className="bg-orange-50/60 border border-orange-200 rounded-2xl p-4 space-y-2">
                  <span className="font-heading font-bold text-[#F97316] text-xs uppercase flex items-center gap-1.5">
                    🤖 Android (Google Chrome / Edge)
                  </span>
                  <ol className="list-decimal list-inside text-gray-700 space-y-1.5 leading-relaxed font-medium">
                    <li>Open this website URL in <strong>Google Chrome</strong>.</li>
                    <li>Tap the <strong>⋮ (3-dots menu)</strong> in top-right corner.</li>
                    <li>Select <strong>'Add to Home screen'</strong> or <strong>'Install app'</strong>.</li>
                    <li>Confirm installation — app icon appears in your drawer!</li>
                  </ol>
                </div>

                {/* iPhone / iOS Steps */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2">
                  <span className="font-heading font-bold text-[#111111] text-xs uppercase flex items-center gap-1.5">
                     iPhone / iPad (Apple Safari)
                  </span>
                  <ol className="list-decimal list-inside text-gray-700 space-y-1.5 leading-relaxed font-medium">
                    <li>Open this website URL in <strong>Safari</strong> browser.</li>
                    <li>Tap the <strong>Share 📤 button</strong> at the bottom bar.</li>
                    <li>Scroll down and tap <strong>'Add to Home Screen'</strong>.</li>
                    <li>Tap <strong>'Add'</strong> in top right — app launches full screen!</li>
                  </ol>
                </div>
              </div>

              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-3 bg-[#111111] text-white font-heading font-bold text-xs rounded-xl cursor-pointer"
              >
                Got It, Close Guide
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LAPTOP / PC INSTALL INSTRUCTIONS MODAL */}
      <AnimatePresence>
        {activeModal === 'laptop' && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[28px] max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-gray-100"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#111111] text-white rounded-2xl">
                    <Laptop size={24} />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-lg text-[#111111]">Install on Laptop / PC</h3>
                    <p className="text-xs text-gray-500">Step-by-step desktop app installation</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-2 text-gray-400 hover:text-[#111111] rounded-xl hover:bg-gray-100 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 text-xs font-sans">
                <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 space-y-2">
                  <span className="font-heading font-bold text-blue-800 text-xs uppercase flex items-center gap-1.5">
                    💻 Google Chrome & Microsoft Edge (Windows / Mac)
                  </span>
                  <ol className="list-decimal list-inside text-gray-700 space-y-1.5 leading-relaxed font-medium">
                    <li>Look at the right end of browser's address bar (URL bar).</li>
                    <li>Click the <strong>Install ⊕</strong> icon or <strong>Desktop 💻 icon</strong>.</li>
                    <li>Alternatively, open browser menu ➔ <strong>'Install MANIKANDAN LATHE...'</strong>.</li>
                    <li>Click <strong>Install</strong> — app launches in standalone window with desktop shortcut!</li>
                  </ol>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-600 text-[11px] font-mono leading-relaxed">
                  💡 <strong>Pro-Tip for Workshop Admins:</strong> Pin the MANIKANDAN LATHE PWA app to your Windows taskbar for 1-click counter sales, offline order logging, and invoice thermal printing.
                </div>
              </div>

              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-3 bg-[#111111] text-white font-heading font-bold text-xs rounded-xl cursor-pointer"
              >
                Got It, Close Guide
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PublicFooter />
    </div>
  );
};

export default PwaDemoPage;
