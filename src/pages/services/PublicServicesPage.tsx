import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { Phone, MessageCircle, ArrowRight, CheckCircle2, Clock, Send, ShieldCheck, Wrench } from 'lucide-react';

export const PublicServicesPage: React.FC = () => {
  const navigate = useNavigate();

  const servicesList = [
    {
      id: "kalappai",
      title: "Tractor Kalappai & Cultivators",
      desc: "Hardened lathe-machined 5-tine, 9-tine & 11-tine cultivator tines forged for tough Tamil Nadu soil.",
      image: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80",
      bullets: ["Hardened steel tines built for red soil", "Heavy angle iron main frame forging", "1-Year workshop structural warranty"],
      startingPrice: "₹24,500",
      deliveryTime: "3–5 Days"
    },
    {
      id: "gates",
      title: "Stainless Steel & MS Main Gates",
      desc: "Custom architectural gates crafted with CNC laser cut panels, heavy-duty ball bearings & safety locks.",
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
      bullets: ["SS 304 anti-rust grade material", "CNC laser precision cut patterns", "Heavy bearing hinges for smooth operation"],
      startingPrice: "₹38,000",
      deliveryTime: "7–10 Days"
    },
    {
      id: "lathe",
      title: "Precision Shaft Turning & Grinding",
      desc: "Industrial lathe machining, shaft grinding, bush fitting, thread cutting & emergency machine repairs.",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
      bullets: ["Micrometer tolerance precision turning", "Shaft grinding & bearing bush fitting", "Emergency 4-hour breakdown repair"],
      startingPrice: "₹1,500",
      deliveryTime: "Same Day / 24 Hours"
    },
    {
      id: "grill",
      title: "Custom Security Windows Grill",
      desc: "Elegant MS & SS window safety grills built to exact architectural blueprints and custom dimensions.",
      image: "https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=600&q=80",
      bullets: ["Heavy square rod & flat bar options", "Durable anti-rust primer coating", "Custom architectural design blueprints"],
      startingPrice: "₹12,000",
      deliveryTime: "4–6 Days"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111] font-sans antialiased">
      <PublicNavbar />

      {/* Header Banner */}
      <section className="bg-[#111111] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-3">
          <span className="text-[#F97316] font-mono text-xs font-bold uppercase tracking-widest block">
            Custom Machinery & Steel Works
          </span>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white">
            OUR FABRICATION SERVICES
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Pioneer heavy lathe machining, tractor cultivator forging & SS 304 architectural gate fabrication setup in Kallimandhayam.
          </p>
        </div>
      </section>

      {/* Services Grid (4 Cards Desktop, 2 Tablet, 1 Mobile) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {servicesList.map((srv) => (
            <div
              key={srv.id}
              className="bg-white rounded-[22px] border border-gray-200 overflow-hidden shadow-xs hover:border-[#F97316] hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* 16:9 Ratio Image */}
                <div className="aspect-video bg-gray-100 overflow-hidden relative">
                  <img
                    src={srv.image}
                    alt={srv.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <Clock size={12} className="text-[#F97316]" /> {srv.deliveryTime}
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-heading font-black text-base text-[#111111] group-hover:text-[#F97316] transition-colors leading-tight">
                      {srv.title}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-1 leading-relaxed">
                      {srv.desc}
                    </p>
                  </div>

                  {/* 3 Bullet Points */}
                  <ul className="space-y-1 text-xs text-gray-700 font-sans border-t border-gray-100 pt-2">
                    {srv.bullets.map((b, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-[11px]">
                        <CheckCircle2 size={13} className="text-[#F97316] shrink-0" />
                        <span className="line-clamp-1">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Price & Actions Footer */}
              <div className="p-4 pt-0 space-y-2 border-t border-gray-100 mt-2">
                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-[10px] text-gray-400 font-mono uppercase font-bold">Starting Price</span>
                  <span className="font-heading font-black text-base text-[#F97316]">{srv.startingPrice}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="https://wa.me/919659286268"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#25D366] hover:bg-[#20ba5a] text-white text-[11px] font-heading font-black py-2 rounded-xl flex items-center justify-center gap-1 shadow-xs"
                  >
                    <MessageCircle size={12} /> WhatsApp
                  </a>

                  <a
                    href="tel:+919659286268"
                    className="bg-gray-100 hover:bg-gray-200 text-[#111111] text-[11px] font-heading font-black py-2 rounded-xl flex items-center justify-center gap-1"
                  >
                    <Phone size={12} className="text-[#F97316]" /> Call
                  </a>
                </div>

                <Link
                  to="/products"
                  className="w-full bg-[#111111] hover:bg-[#F97316] text-white text-xs font-heading font-black py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  View Related Products <ArrowRight size={14} />
                </Link>
              </div>

            </div>
          ))}
        </div>
      </div>

      <PublicFooter />
    </div>
  );
};
