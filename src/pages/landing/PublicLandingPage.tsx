import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
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
  Heart
} from 'lucide-react';

export const PublicLandingPage: React.FC = () => {
  const { products } = useProducts();
  const navigate = useNavigate();

  const featuredProducts = products.filter((p) => p.isRecommended || p.isBestSelling).slice(0, 4);

  const services = [
    {
      title: "Tractor Kalappai & Cultivators",
      desc: "Hardened lathe-machined 5-tine, 9-tine & 11-tine agricultural cultivators forged for tough Tamil Nadu soil.",
      image: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Stainless Steel & MS Main Gates",
      desc: "Custom architectural gates crafted with CNC laser cut panels, heavy-duty ball bearings & safety locks.",
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Precision Shaft Turning & Lathe Grinding",
      desc: "Industrial lathe machining, shaft grinding, bush fitting, thread cutting & emergency machine repairs.",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Custom Security Windows Grill",
      desc: "Elegant MS & SS window safety grills built to exact architectural blueprints and custom dimensions.",
      image: "https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=600&q=80"
    }
  ];

  const galleryWorks = [
    { title: "Heavy Duty 9-Tine Kalappai", tag: "Agricultural Machinery", image: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=500&q=80" },
    { title: "CNC Laser Cut Main Safety Gate", tag: "Architectural Gates", image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=500&q=80" },
    { title: "Precision Lathe Machine Shafts", tag: "Lathe Machining", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=500&q=80" },
    { title: "Decorative Security Window Grill", tag: "Residential Window Grill", image: "https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=500&q=80" }
  ];

  const testimonials = [
    { name: "Senthil Kumar", location: "Kallimandhayam", text: "Ordered a 9-tine kalappai for my tractor. The hardened lathe tines penetrate heavy red soil smoothly. Exceptional quality by Chellamuthu K!" },
    { name: "Muruganandam", location: "Dindigul", text: "Got a laser-cut SS 304 main gate fabricated for our new home. Outstanding finish, smooth bearing movement, and delivered right on time." },
    { name: "Palanisamy", location: "Palani", text: "Emergency lathe turning repair done for our borewell compressor shaft within 4 hours. MANIKANDAN LATHE is the best in Kallimandhayam!" }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111] font-sans antialiased">
      
      {/* 1. PUBLIC WEBSITE NAVBAR */}
      <PublicNavbar />

      {/* 2. HERO SECTION */}
      <section className="relative bg-gradient-to-r from-[#111111] via-[#1A1A1A] to-[#232323] text-white py-16 sm:py-24 overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80"
            alt="Lathe Machine Workshop"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#F97316]/20 border border-[#F97316]/50 text-[#F97316] font-mono text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-widest">
            <Award size={14} /> 25+ Years Experience • Owner: Chellamuthu K
          </div>

          <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight max-w-4xl">
            PRECISION LATHE WORKS & CUSTOM STEEL FABRICATION
          </h1>

          <p className="text-gray-300 text-sm sm:text-lg max-w-2xl leading-relaxed">
            Specialist in tractor cultivator kalappai, CNC laser cut main safety gates, stainless steel grills & heavy lathe turning machine works in Kallimandhayam, Dindigul District.
          </p>

          {/* Action CTA Buttons */}
          <div className="pt-4 flex flex-wrap items-center gap-3">
            <Link
              to="/products"
              className="bg-[#F97316] hover:bg-[#EA580C] text-white font-heading font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95"
            >
              Explore Products Catalog <ArrowRight size={16} />
            </Link>

            <a
              href="tel:+919659286268"
              className="bg-white hover:bg-gray-100 text-[#111111] font-heading font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95"
            >
              <Phone size={16} className="text-[#F97316]" /> Call Chellamuthu K
            </a>

            <a
              href="https://wa.me/919659286268"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-heading font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95"
            >
              <MessageCircle size={16} /> WhatsApp Quote
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/10 text-xs text-gray-300 font-heading font-bold">
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
              <span>Fast Factory Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OUR FABRICATIONS AND SERVICES SECTION */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[#F97316] font-mono text-xs font-bold uppercase tracking-widest block">
            What We Manufacture & Fabricate
          </span>
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#111111]">
            OUR FABRICATIONS AND SERVICES
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm">
            High quality steel machinery and architectural fabrication engineered at our Kallimandhayam factory under Chellamuthu K's supervision.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((srv, idx) => (
            <div
              key={idx}
              className="bg-white rounded-[22px] border border-gray-200/80 overflow-hidden shadow-xs hover:border-[#F97316] transition-all flex flex-col justify-between"
            >
              <div className="h-44 bg-gray-100 overflow-hidden">
                <img src={srv.image} alt={srv.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-heading font-black text-base text-[#111111]">{srv.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed mt-1">{srv.desc}</p>
                </div>
                <Link
                  to="/products"
                  className="pt-2 text-xs font-heading font-black text-[#F97316] flex items-center gap-1 hover:underline"
                >
                  View Catalog <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FEATURED MACHINERY & GATES (COMPACT PROPORTIONAL CARDS ON WEB & MOBILE) */}
      <section className="py-12 bg-white border-y border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[#F97316] font-mono text-xs font-bold uppercase tracking-widest block">
                Top Quality Products
              </span>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#111111]">
                FEATURED MACHINERY & GATES
              </h2>
            </div>
            <Link
              to="/products"
              className="bg-[#111111] hover:bg-[#F97316] text-white text-xs font-heading font-black px-5 py-2.5 rounded-xl transition-all self-start sm:self-auto shadow-sm"
            >
              Browse Entire Catalog →
            </Link>
          </div>

          {/* Compact Product Grid: 2 Cols Mobile, 3 Cols Laptop, 4 Cols Desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
            {featuredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/products/${p.id}`)}
                className="bg-white rounded-[22px] border border-gray-200/80 p-3 shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#F97316] transition-all group"
              >
                <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-square max-h-48 sm:max-h-52">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute top-2 left-2 bg-[#F97316] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                    {p.badgeText || 'Best Seller'}
                  </span>
                </div>

                <div className="mt-2.5 space-y-1">
                  <h3 className="font-heading font-black text-xs sm:text-sm text-[#111111] line-clamp-1 group-hover:text-[#F97316] transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-[10px] text-gray-500 font-mono line-clamp-1">{p.specifications.material}</p>
                  <div className="flex items-center justify-between pt-1.5 border-t border-gray-100">
                    <span className="font-heading font-black text-sm sm:text-base text-[#F97316]">
                      ₹{p.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] font-bold text-[#111111] group-hover:text-[#F97316]">
                      Details →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. LATEST COMPLETED FABRICATION WORKS */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[#F97316] font-mono text-xs font-bold uppercase tracking-widest block">
              Craftsmanship Showcase
            </span>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#111111]">
              LATEST COMPLETED FABRICATION WORKS
            </h2>
          </div>
          <Link
            to="/gallery"
            className="text-xs font-heading font-black text-[#F97316] flex items-center gap-1 hover:underline"
          >
            View All Gallery Works →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {galleryWorks.map((work, idx) => (
            <div key={idx} className="relative rounded-[22px] overflow-hidden group aspect-square shadow-sm bg-gray-100">
              <img src={work.image} alt={work.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 sm:p-4 flex flex-col justify-end">
                <span className="text-[#F97316] text-[9px] font-mono font-bold uppercase">{work.tag}</span>
                <h4 className="font-heading font-black text-xs sm:text-sm text-white line-clamp-1">{work.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. WHY CHOOSE US & REVIEWS */}
      <section className="py-16 bg-gray-100 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-white p-6 rounded-[22px] border border-gray-200 shadow-xs space-y-2">
              <Award size={36} className="mx-auto text-[#F97316]" />
              <h3 className="font-heading font-black text-base text-[#111111]">25+ Years Experience</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Pioneer lathe turning and tractor kalappai cultivator workshop operated by Chellamuthu K.</p>
            </div>

            <div className="bg-white p-6 rounded-[22px] border border-gray-200 shadow-xs space-y-2">
              <Wrench size={36} className="mx-auto text-[#F97316]" />
              <h3 className="font-heading font-black text-base text-[#111111]">Precision Turning Lathes</h3>
              <p className="text-xs text-gray-600 leading-relaxed">High precision turning lathes, shaper machines & laser cut fabrication setup.</p>
            </div>

            <div className="bg-white p-6 rounded-[22px] border border-gray-200 shadow-xs space-y-2">
              <ShieldCheck size={36} className="mx-auto text-[#F97316]" />
              <h3 className="font-heading font-black text-base text-[#111111]">100% Quality Guaranteed</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Heavy grade raw materials, MS/SS 304, hardened tines & durable anti-rust coatings.</p>
            </div>
          </div>

          {/* Testimonials Grid */}
          <div className="space-y-6">
            <h2 className="font-heading font-black text-2xl text-[#111111] text-center uppercase">
              CUSTOMER REVIEWS & FEEDBACK
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[22px] border border-gray-200 shadow-xs space-y-3">
                  <div className="flex text-amber-500 gap-1">
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
