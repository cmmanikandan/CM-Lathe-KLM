import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BrandLogo } from '../common/BrandLogo';
import { Phone, Mail, MapPin, ShieldCheck, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  // Remove footer for admin panel and customer panel routes
  const isHiddenRoute = 
    path.startsWith('/admin') ||
    path.startsWith('/my-orders') ||
    path.startsWith('/order') ||
    path.startsWith('/status') ||
    path.startsWith('/profile') ||
    path === '/login' ||
    path === '/register' ||
    path === '/forgot-password';

  if (isHiddenRoute) {
    return null;
  }
  return (
    <footer className="bg-[#111111] text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand & Address Column */}
          <div className="space-y-4 md:col-span-2">
            <BrandLogo size="splash" variant="light" showTagline={true} />
            <p className="text-gray-400 text-xs leading-relaxed max-w-md">
              MANIKANDAN LATHE is Dindigul district’s premier heavy lathe machining, agricultural equipment manufacturing & architectural gate fabrication workshop.
            </p>
            <div className="space-y-2 text-xs text-gray-300 pt-2 font-mono">
              <p className="flex items-start gap-2">
                <MapPin size={16} className="text-[#F97316] shrink-0 mt-0.5" />
                <span>K. Keeranur Road, Kallimandhayam, Dindigul District - 624616, Tamil Nadu</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone size={16} className="text-[#F97316] shrink-0" />
                <span>+91 96592 86268</span>
              </p>
            </div>
          </div>

          {/* Manufacturing Services Column */}
          <div className="space-y-3">
            <h4 className="font-heading font-extrabold text-sm uppercase text-[#F97316] tracking-wider">
              Core Services
            </h4>
            <ul className="space-y-2 text-xs text-gray-400 font-medium">
              <li><Link to="/products" className="hover:text-white transition-colors">Tractor Kalappai & Cultivators</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Stainless Steel & MS Main Gates</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">CNC Laser Cut Safety Grills</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Steel Security Doors & Furniture</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Industrial Lathe Turning & Bush Works</Link></li>
              <li><Link to="/pwa-demo" className="text-[#F97316] font-bold hover:underline">📱 PWA App Demo & Features</Link></li>
            </ul>
          </div>

          {/* Workshop Hours & Admin Access Column */}
          <div className="space-y-3">
            <h4 className="font-heading font-extrabold text-sm uppercase text-[#F97316] tracking-wider">
              Workshop Hours
            </h4>
            <div className="text-xs text-gray-400 space-y-1 font-mono">
              <p><strong className="text-white">Monday - Saturday:</strong> 8:00 AM - 8:30 PM</p>
              <p><strong className="text-white">Sunday:</strong> Emergency Machinery Service</p>
            </div>
            
            <div className="pt-4 border-t border-gray-800">
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-[#F97316] text-white text-xs font-bold px-3.5 py-2 rounded-xl border border-gray-700 transition-colors"
              >
                <ShieldCheck size={14} className="text-[#F97316]" /> Admin Portal Sign In
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center text-[11px] text-gray-500 font-mono gap-4">
          <p>© {new Date().getFullYear()} MANIKANDAN LATHE. All Rights Reserved.</p>
          <div className="flex items-center gap-3">
            <Link to="/pwa-demo" className="text-[#F97316] font-bold hover:underline">📱 PWA App Demo</Link>
            <span>•</span>
            <p className="text-gray-400">Kallimandhayam, Dindigul District, Tamil Nadu</p>
          </div>
        </div>

      </div>
    </footer>
  );
};
