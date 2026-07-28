import React from 'react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { GoogleMapEmbed } from '../../components/common/GoogleMapEmbed';
import { MapPin, Phone, Mail, Clock, MessageCircle, User, ShieldCheck } from 'lucide-react';

export const PublicContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111111] font-sans antialiased">
      <PublicNavbar />

      <section className="bg-[#111111] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <span className="text-[#F97316] font-mono text-xs font-bold uppercase tracking-widest block">
            Direct Contact & Workshop Location
          </span>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white">
            CONTACT MANIKANDAN LATHE
          </h1>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Contact Owner Chellamuthu K or visit our heavy lathe workshop in Kallimandhayam for price quotes and custom fabrication.
          </p>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-white p-6 sm:p-8 rounded-[22px] border border-gray-200 shadow-xs space-y-6">
            <div className="space-y-1 border-b border-gray-100 pb-4">
              <span className="text-[#F97316] font-mono font-bold text-xs uppercase">Official Factory Info</span>
              <h2 className="font-heading font-black text-2xl text-[#111111]">CHELLAMUTHU K</h2>
              <p className="text-gray-500 text-xs font-extrabold">Proprietor & Master Lathe Craftsman (25+ Years Experience)</p>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-[#F97316] shrink-0 mt-1" />
                <div>
                  <strong className="font-heading font-bold text-sm block">Factory Address:</strong>
                  <p className="text-gray-600">K. Keeranur Road, Kallimandhayam, Dindigul District - 624616, Tamil Nadu.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={20} className="text-[#F97316] shrink-0 mt-1" />
                <div>
                  <strong className="font-heading font-bold text-sm block">Mobile & WhatsApp Phone Line:</strong>
                  <a href="tel:+919659286268" className="text-[#111111] hover:text-[#F97316] block font-mono font-bold text-sm">+91 96592 86268</a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={20} className="text-[#F97316] shrink-0 mt-1" />
                <div>
                  <strong className="font-heading font-bold text-sm block">Official Email Address:</strong>
                  <a href="mailto:manikandanlatheklm@gmail.com" className="text-gray-700 hover:text-[#F97316] font-mono">manikandanlatheklm@gmail.com</a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={20} className="text-[#F97316] shrink-0 mt-1" />
                <div>
                  <strong className="font-heading font-bold text-sm block">Working Hours:</strong>
                  <p className="text-gray-600">Monday – Saturday: 8:00 AM – 8:00 PM (Emergency Lathe Turning Available)</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <a
                href="tel:+919659286268"
                className="flex-1 bg-[#111111] hover:bg-[#F97316] text-white font-heading font-black text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <Phone size={16} /> Call Chellamuthu K
              </a>
              <a
                href="https://wa.me/919659286268"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#25D366] hover:bg-[#20ba5a] text-white font-heading font-black text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <MessageCircle size={16} /> WhatsApp Inquiry
              </a>
            </div>
          </div>

          <div className="rounded-[22px] overflow-hidden border border-gray-200 shadow-sm">
            <GoogleMapEmbed />
          </div>

        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
