import React from 'react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { Award, Wrench, ShieldCheck, User, CheckCircle2, Phone, MessageCircle } from 'lucide-react';

export const PublicAboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111] font-sans antialiased">
      <PublicNavbar />

      {/* Hero Banner */}
      <section className="bg-[#111111] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <span className="text-[#F97316] font-mono text-xs font-bold uppercase tracking-widest block">
            Our 25+ Years Story & Craftsmanship
          </span>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white">
            MANIKANDAN LATHE WORKS
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Founded and operated by Chellamuthu K, MANIKANDAN LATHE is Kallimandhayam’s trusted heavy lathe machining and custom steel fabrication workshop in Dindigul District.
          </p>
        </div>
      </section>

      {/* Factory & Owner Story */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-[#F97316] font-mono text-xs font-bold px-3 py-1 rounded-full">
              <User size={14} /> Proprietor: Chellamuthu K
            </div>

            <h2 className="font-heading font-black text-2xl text-[#111111]">
              25+ YEARS OF PRECISION ENGINEERING & TRUST
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              With over a quarter century of hands-on expertise in lathe turning, gear cutting, and structural steel fabrication, Chellamuthu K has established MANIKANDAN LATHE as an indispensable partner for agricultural farmers and home builders across Tamil Nadu.
            </p>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Our workshop in Kallimandhayam manufactures hardened cultivator kalappai tines built for tough red soil, as well as CNC laser cut architectural stainless steel safety gates, window grills, and structural steel doors.
            </p>

            <div className="pt-2 space-y-2 text-xs font-heading font-bold text-gray-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#F97316]" />
                <span>Heavy Turning Lathes & Precision Shaft Grinding</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#F97316]" />
                <span>Certified Anti-Rust Heavy Duty Steel Raw Materials</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#F97316]" />
                <span>Personal Supervision by Master Craftsman Chellamuthu K</span>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <a
                href="tel:+919659286268"
                className="bg-[#111111] hover:bg-[#F97316] text-white text-xs font-heading font-black px-5 py-3 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-95"
              >
                <Phone size={14} /> Call Chellamuthu K
              </a>
              <a
                href="https://wa.me/919659286268"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-heading font-black px-5 py-3 rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-95"
              >
                <MessageCircle size={14} /> WhatsApp Inquiry
              </a>
            </div>
          </div>

          <div className="rounded-[22px] overflow-hidden shadow-lg border border-gray-200 aspect-video">
            <img
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=80"
              alt="Chellamuthu K Lathe Workshop"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
