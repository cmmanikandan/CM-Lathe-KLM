import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../common/BrandLogo';
import { MapPin, Phone, Mail, Clock, MessageCircle, User } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-[#111111] text-white pt-12 pb-8 border-t border-gray-800 font-sans antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Owner Info */}
          <div className="space-y-4">
            <BrandLogo size="navbar" variant="light" />
            <div className="text-xs text-gray-300 space-y-1">
              <p className="font-heading font-black text-white flex items-center gap-1.5">
                <User size={14} className="text-[#F97316]" /> Owner: Chellamuthu K
              </p>
              <p className="text-[#F97316] font-mono font-bold text-[11px]">25+ Years Industrial Lathe Experience</p>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              MANIKANDAN LATHE is Kallimandhayam's pioneer lathe turning, tractor kalappai & architectural CNC laser gate fabrication shop in Dindigul District, Tamil Nadu.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://wa.me/919659286268"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] text-white text-xs font-heading font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <MessageCircle size={14} /> WhatsApp Support
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3 font-heading">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#F97316]">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs font-medium text-gray-300">
              <li><Link to="/" className="hover:text-white transition-colors">Home Landing</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Product Catalog</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Services Provided</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Shop & Owner</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Workshop</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Customer Portal Login</Link></li>
            </ul>
          </div>

          {/* Col 3: Services Provided */}
          <div className="space-y-3 font-heading">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#F97316]">
              Core Services
            </h4>
            <ul className="space-y-2 text-xs font-medium text-gray-300">
              <li>Tractor Kalappai & Cultivator Tines</li>
              <li>Rust-Proof Stainless Steel Main Safety Gates</li>
              <li>Heavy Shaft Turning & Lathe Grinding</li>
              <li>Custom Steel Security Windows Grill</li>
              <li>Roofing Sheet Fitting & Truss Works</li>
              <li>Electric Welding & Emergency Repairs</li>
            </ul>
          </div>

          {/* Col 4: Contact Details */}
          <div className="space-y-3">
            <h4 className="font-heading font-extrabold text-xs uppercase tracking-wider text-[#F97316]">
              Workshop Contact & Hours
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-300">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-[#F97316] shrink-0 mt-0.5" />
                <span>K. Keeranur Road, Kallimandhayam - 624616, Dindigul District, Tamil Nadu.</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-[#F97316] shrink-0" />
                <a href="tel:+919659286268" className="hover:underline font-mono font-bold">+91 96592 86268</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-[#F97316] shrink-0" />
                <a href="mailto:manikandanlatheklm@gmail.com" className="hover:underline font-mono text-[11px]">manikandanlatheklm@gmail.com</a>
              </li>
              <li className="flex items-center gap-2">
                <Clock size={16} className="text-[#F97316] shrink-0" />
                <span>Mon – Sat: 8:00 AM – 8:00 PM</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© {new Date().getFullYear()} MANIKANDAN LATHE. Owner: Chellamuthu K. All rights reserved.</p>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Kallimandhayam, Dindigul - 624616</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
