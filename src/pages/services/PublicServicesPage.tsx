import React from 'react';

import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { Phone, MessageCircle, CheckCircle2, Clock, ShieldCheck, Wrench } from 'lucide-react';

export const PublicServicesPage: React.FC = () => {

  const servicesList = [
    {
      id: "kalappai",
      title: "Tractor Kalappai Making & Forging",
      desc: "Custom 5-tine, 7-tine & 9-tine tractor Kalappai cultivators with lathe-hardened steel tines built for tough soil.",
      image: "/assets/service_kalappai.png",
      bullets: [
        "Hardened lathe steel tines for red & clay soil",
        "Heavy angle iron main frame forging",
        "5-Tine, 7-Tine & 9-Tine custom tractor sizes"
      ],
      startingPrice: "₹24,500",
      deliveryTime: "3–5 Days"
    },
    {
      id: "grill",
      title: "Custom Security Windows Grill",
      desc: "Heavy-duty MS & Stainless Steel window safety grills built to exact house blueprints and custom dimensions.",
      image: "/assets/service_window_grill.png",
      bullets: [
        "Heavy square rod & flat bar options",
        "Geometric & decorative architectural patterns",
        "Anti-rust primer coating & glossy finish"
      ],
      startingPrice: "₹12,000",
      deliveryTime: "4–6 Days"
    },
    {
      id: "main_gate",
      title: "Architectural Main Safety Gates",
      desc: "Custom Stainless Steel laser cut main gates & heavy MS safety gates crafted with smooth bearing hinges.",
      image: "/assets/service_main_gate.png",
      bullets: [
        "Rust-Proof Stainless Steel laser cut panels",
        "Heavy ball bearing hinges for effortless gliding",
        "Built to custom architectural width & height"
      ],
      startingPrice: "₹38,000",
      deliveryTime: "7–10 Days"
    },
    {
      id: "roofing",
      title: "Roofing Sheet Fitting & Truss Works",
      desc: "Complete roofing sheet installation for houses & factory sheds: Cooling sheets, Cement sheets, Fiber sheets & Mud Ode tiles.",
      image: "/assets/service_roofing.png",
      bullets: [
        "Cooling sheets, Cement sheets & Fiber sheets",
        "Terracotta Clay Mud Ode roof tile fitting",
        "Heavy structural steel truss frame erection"
      ],
      startingPrice: "₹28,000",
      deliveryTime: "5–8 Days"
    },
    {
      id: "welding_lathe",
      title: "Electric Welding & Lathe Machining",
      desc: "Professional electric arc welding, CO2 MIG welding, lathe shaft turning, gunmetal bush fitting & emergency breakdown repairs.",
      image: "/assets/service_welding.png",
      bullets: [
        "Precision micrometer shaft turning & grinding",
        "Heavy electric arc & CO2 metal MIG welding",
        "Emergency 4-hour machine breakdown repair"
      ],
      startingPrice: "₹1,500",
      deliveryTime: "Same Day / 24 Hours"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111] font-sans antialiased">
      <PublicNavbar />

      {/* Header Banner */}
      <section className="bg-[#111111] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-[#F97316]/20 border border-[#F97316]/40 text-[#F97316] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            <Wrench size={12} /> Master Workshop Fabrication
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white">
            OUR FABRICATION SERVICES
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Expert lathe machining, tractor kalappai making, window grills, main gates, roofing sheet fitting & heavy arc welding setup in Kallimandhayam.
          </p>
        </div>
      </section>

      {/* Services Grid (Clean 3 & 2 Column Layout) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesList.map((srv) => (
            <div
              key={srv.id}
              className="bg-white rounded-[22px] border border-gray-200 overflow-hidden shadow-xs hover:border-[#F97316] hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* 16:9 Image Stage */}
                <div className="aspect-video bg-gray-50 overflow-hidden relative flex items-center justify-center border-b border-gray-100 p-2">
                  <img
                    src={srv.image}
                    alt={srv.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 rounded-xl"
                  />
                  <span className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-md">
                    <Clock size={12} className="text-[#F97316]" /> {srv.deliveryTime}
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="font-heading font-black text-lg text-[#111111] group-hover:text-[#F97316] transition-colors leading-tight">
                      {srv.title}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-3 mt-1.5 leading-relaxed">
                      {srv.desc}
                    </p>
                  </div>

                  {/* Bullet Points */}
                  <ul className="space-y-1.5 text-xs text-gray-700 font-sans border-t border-gray-100 pt-3">
                    {srv.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <CheckCircle2 size={14} className="text-[#F97316] shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-5 pt-0 space-y-2 border-t border-gray-100 mt-3 pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="https://wa.me/919659286268"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-heading font-black py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <MessageCircle size={14} /> WhatsApp
                  </a>

                  <a
                    href="tel:+919659286268"
                    className="bg-[#111111] hover:bg-[#F97316] text-white text-xs font-heading font-black py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Phone size={14} /> Call Workshop
                  </a>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Master Quality Guarantee Banner */}
        <div className="bg-white rounded-[26px] border border-gray-200 p-6 sm:p-8 space-y-4 shadow-xs text-center max-w-4xl mx-auto">
          <ShieldCheck size={40} className="mx-auto text-[#F97316]" />
          <h2 className="font-heading font-black text-xl sm:text-2xl text-[#111111]">
            DIRECT FACTORY QUALITY GUARANTEED
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
            All fabrication work is personally supervised by Master Craftsman <strong>Chellamuthu K</strong> with 25+ years of experience in Kallimandhayam. We use heavy anti-rust steel, precision lathe machinery, and structural welding.
          </p>
        </div>

      </div>

      <PublicFooter />
    </div>
  );
};
