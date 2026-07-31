import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { useStatus } from '../../context/StatusContext';
import { fetchGallery, GalleryItem as DBGalleryItem } from '../../services/supabaseService';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { GoogleMapEmbed } from '../../components/common/GoogleMapEmbed';
import {
  Phone,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Wrench,
  Star,
  CheckCircle2,
  MapPin,
  Sparkles,
  Zap,
  Award,
  User,
  Clock,
  Heart,
  LogIn,
  Flame
} from 'lucide-react';

export const PublicLandingPage: React.FC = () => {
  const { products } = useProducts();
  const { activeStories } = useStatus();
  const navigate = useNavigate();

  const [liveGallery, setLiveGallery] = useState<{ title: string; tag: string; image: string }[]>([]);

  useEffect(() => {
    fetchGallery().then((items) => {
      if (items && items.length > 0) {
        setLiveGallery(
          items.slice(0, 8).map((i) => ({
            title: i.title,
            tag: i.category,
            image: i.mediaUrl,
          }))
        );
      } else {
        setLiveGallery([]);
      }
    });
  }, []);

  const featuredProducts = (() => {
    const recommended = products.filter((p) => p.isRecommended || p.isBestSelling);
    if (recommended.length >= 3) return recommended.slice(0, 5);
    // Fallback: show any published products
    return products.filter((p) => p.status === 'Published' || !p.status).slice(0, 5);
  })();

  const services = [
    {
      title: "Tractor Kalappai Making & Forging",
      desc: "Custom 5-tine, 7-tine & 9-tine Kalappai cultivators with lathe-hardened steel tines for tough soil.",
      image: "/assets/service_kalappai.png"
    },
    {
      title: "Custom Security Windows Grill",
      desc: "Heavy MS & SS window grills built to exact house blueprints with anti-rust primer & decorative patterns.",
      image: "/assets/service_window_grill.png"
    },
    {
      title: "Architectural Main Safety Gates",
      desc: "Custom laser-cut stainless steel main gates with smooth bearing hinges, built to any size.",
      image: "/assets/service_main_gate.png"
    },
    {
      title: "Roofing Sheet Fitting & Truss Works",
      desc: "Cooling sheets, cement sheets, fiber sheets & Mud Ode tiles — complete roofing & steel truss frame works.",
      image: "/assets/service_roofing.png"
    },
    {
      title: "Electric Welding & Lathe Machining",
      desc: "Precision shaft turning, CO2 MIG welding, gunmetal bush fitting & emergency 4-hour breakdown repairs.",
      image: "/assets/service_welding.png"
    }
  ];

  const testimonials = [
    { name: "Senthil Kumar", location: "Kallimandhayam", text: "Ordered a 9-tine kalappai for my tractor. The hardened lathe tines penetrate heavy red soil smoothly. Exceptional quality by Chellamuthu K!" },
    { name: "Muruganandam", location: "Dindigul", text: "Got a laser-cut Rust-Proof Stainless Steel main gate fabricated for our new home. Outstanding finish, smooth bearing movement, and delivered right on time." },
    { name: "Palanisamy", location: "Palani", text: "Emergency lathe turning repair done for our borewell compressor shaft within 4 hours. MANIKANDAN LATHE is the best in Kallimandhayam!" },
    { name: "Karthik Raja", location: "Ottanchatram", text: "Extremely durable steel security doors and window grills. Workshop team handled installation cleanly in 2 hours." },
    { name: "Venkatesan", location: "Madurai Road", text: "Precision shaft turning and gunmetal bush fitting done accurately to micrometer tolerances. Very trustworthy workshop!" }
  ];

  // Duplicate testimonials for smooth infinite marquee looping
  const marqueeItems = [...testimonials, ...testimonials];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111] font-sans antialiased">
      
      {/* 1. PUBLIC WEBSITE NAVBAR */}
      <PublicNavbar />

      {/* 2. HERO SECTION */}
      <section className="relative bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white py-16 sm:py-24 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 opacity-40">
          <img
            src="/assets/hero_shop.png"
            alt="Manikandan Lathe Workshop Shop - Kallimandhayam"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#F97316]/20 border border-[#F97316]/50 text-[#F97316] font-mono text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-md">
            <Award size={14} /> 25+ Years Experience • Owner: Chellamuthu K
          </div>

          <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight max-w-4xl">
            PRECISION LATHE WORKS & CUSTOM STEEL FABRICATION
          </h1>

          <p className="text-slate-300 text-sm sm:text-lg max-w-2xl leading-relaxed">
            Specialist in tractor cultivator kalappai, CNC laser cut main safety gates, stainless steel grills & heavy lathe turning machine works in Kallimandhayam, Dindigul District.
          </p>

          {/* Action CTA Buttons */}
          <div className="pt-4 flex flex-wrap items-center gap-3">
            <Link
              to="/products"
              className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs sm:text-sm px-7 py-4 rounded-2xl shadow-xl shadow-orange-500/20 flex items-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              Explore Products Catalog <ArrowRight size={16} />
            </Link>

            <button
              onClick={() => navigate('/login')}
              className="bg-white hover:bg-slate-100 text-slate-900 font-heading font-black text-xs sm:text-sm px-7 py-4 rounded-2xl shadow-lg flex items-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <LogIn size={16} className="text-[#F97316]" /> Open Customer App
            </button>

            <a
              href="https://wa.me/919659286268"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-heading font-black text-xs sm:text-sm px-7 py-4 rounded-2xl shadow-lg flex items-center gap-2 transition-all active:scale-98"
            >
              <MessageCircle size={16} /> WhatsApp Quote
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800 text-xs text-slate-300 font-heading font-bold">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#F97316]" />
              <span>25+ Years Experience</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#F97316]" />
              <span>Owner: Chellamuthu K</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#F97316]" />
              <span>Hardened Lathe Tines</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-[#F97316]" />
              <span>Fast Shop Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK CATEGORY PILLS BAR (FLIPKART STYLE) */}
      <section className="bg-white border-b border-slate-200/80 py-4 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 text-xs font-heading font-bold">
            <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider shrink-0 pr-2 border-r border-slate-200">
              Categories:
            </span>
            {[
              { name: 'All Products', icon: '⚡', path: '/products' },
              { name: 'Tractor Kalappai', icon: '🚜', path: '/products?cat=Tractor%20Kalappai' },
              { name: 'Windows Grill', icon: '🪟', path: '/products?cat=Windows%20Grill' },
              { name: 'Gates', icon: '🚪', path: '/products?cat=Gates' },
              { name: 'Steel Furniture', icon: '🪑', path: '/products?cat=Steel%20Furniture' },
              { name: 'Machine Works', icon: '⚙️', path: '/products?cat=Machine%20Works' },
              { name: 'Custom Fabrication', icon: '🔧', path: '/products?cat=Custom%20Fabrication' },
            ].map((cat) => (
              <Link
                key={cat.name}
                to={cat.path}
                className="bg-slate-100 hover:bg-[#F97316] hover:text-white text-slate-700 px-4 py-2 rounded-full shrink-0 transition-all shadow-2xs flex items-center gap-1.5 active:scale-95"
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. OUR FABRICATION SERVICES */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[#F97316] font-mono text-xs font-bold uppercase tracking-widest block">
            What We Manufacture & Fabricate
          </span>
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-slate-900">
            OUR FABRICATION SERVICES
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            Expert lathe machining, kalappai forging, window grills, gates, roofing & welding — all under one roof in Kallimandhayam.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {services.map((srv, idx) => (
            <Link
              key={idx}
              to="/services"
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:border-[#F97316] hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1"
            >
              <div className="aspect-square bg-slate-50 overflow-hidden flex items-center justify-center p-3 border-b border-slate-100">
                <img src={srv.image} alt={srv.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 rounded-2xl" />
              </div>
              <div className="p-4 space-y-1 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-heading font-black text-xs text-slate-900 group-hover:text-[#F97316] transition-colors leading-tight">{srv.title}</h3>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-1 line-clamp-3">{srv.desc}</p>
                </div>
                <span className="pt-2.5 text-[10px] font-heading font-black text-[#F97316] flex items-center gap-1">
                  Enquire Now <ArrowRight size={11} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS */}
      <section className="py-12 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[#F97316] font-mono text-xs font-bold uppercase tracking-widest block">Top Rated Workshop Catalog</span>
              <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900">Featured Products Showcase</h2>
            </div>
            <Link
              to="/products"
              className="bg-[#111111] hover:bg-[#F97316] text-white text-xs font-heading font-black px-5 py-3 rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Browse Entire Catalog →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
            {featuredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/products/${p.id}`)}
                className="bg-white rounded-3xl border border-slate-200/90 p-3.5 shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#F97316] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="relative rounded-2xl overflow-hidden bg-slate-50 aspect-square flex items-center justify-center border border-slate-100">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute top-2 left-2 bg-[#F97316] text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase shadow-xs">
                    {p.badgeText || 'Best Seller'}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5">
                  <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider block">{p.category}</span>
                  <h3 className="font-heading font-black text-xs text-slate-900 line-clamp-2 leading-tight group-hover:text-[#F97316] transition-colors">
                    {p.name}
                  </h3>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="font-heading font-black text-sm text-[#F97316]">
                      ₹{p.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] font-heading font-black text-slate-900 group-hover:text-[#F97316]">
                      View Details →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* 6. WHY CHOOSE US & SLOW CONTINUOUS MOVING FEEDBACK CARD MARQUEE */}
      <section className="py-16 bg-gray-100 border-y border-gray-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-white p-6 rounded-[22px] border border-gray-200 shadow-xs space-y-2">
              <Award size={36} className="mx-auto text-[#F97316]" />
              <h3 className="font-heading font-black text-base text-[#111111]">25+ Years Experience</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Pioneer lathe turning and tractor kalappai cultivator shop operated by Chellamuthu K.</p>
            </div>

            <div className="bg-white p-6 rounded-[22px] border border-gray-200 shadow-xs space-y-2">
              <Wrench size={36} className="mx-auto text-[#F97316]" />
              <h3 className="font-heading font-black text-base text-[#111111]">Precision Turning Lathes</h3>
              <p className="text-xs text-gray-600 leading-relaxed">High precision turning lathes, shaper machines & laser cut fabrication setup.</p>
            </div>

            <div className="bg-white p-6 rounded-[22px] border border-gray-200 shadow-xs space-y-2">
              <ShieldCheck size={36} className="mx-auto text-[#F97316]" />
              <h3 className="font-heading font-black text-base text-[#111111]">100% Quality Guaranteed</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Heavy grade raw materials, Rust-Proof Heavy Steel, hardened tines & durable anti-rust coatings.</p>
            </div>
          </div>

          {/* CONTINUOUS SLOW RIGHT-TO-LEFT MOVING TESTIMONIAL MARQUEE */}
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="font-heading font-black text-2xl text-[#111111] uppercase">
                CUSTOMER REVIEWS & FEEDBACK
              </h2>
              <p className="text-xs text-gray-500 font-mono">Hover card to pause moving feedback ticker</p>
            </div>

            <div className="relative overflow-hidden w-full py-2">
              <div className="animate-marquee-slow flex gap-6">
                {marqueeItems.map((t, idx) => (
                  <div
                    key={idx}
                    className="w-80 sm:w-96 shrink-0 bg-white p-6 rounded-[22px] border border-gray-200 shadow-xs space-y-3 hover:border-[#F97316] transition-colors"
                  >
                    <div className="flex text-amber-500 gap-1 text-sm">
                      {'★'.repeat(5)}
                    </div>
                    <p className="text-xs text-gray-700 italic leading-relaxed">"{t.text}"</p>
                    <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
                      <span className="font-heading font-black text-xs text-[#111111]">{t.name}</span>
                      <span className="text-[10px] font-mono text-gray-400">{t.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. GOOGLE MAPS LOCATION */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <GoogleMapEmbed />
      </section>

      {/* 8. PUBLIC FOOTER */}
      <PublicFooter />

    </div>
  );
};
