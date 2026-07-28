import React from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

export const GoogleMapEmbed: React.FC = () => {
  const shopLocationUrl = "https://www.google.com/maps?cid=15013936322112296044&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNlEAMYASAF&hl=en-US&source=embed";

  return (
    <div className="bg-white rounded-[22px] border border-gray-200/80 p-5 sm:p-6 shadow-xs relative overflow-hidden space-y-4">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[#F97316] font-mono text-xs font-extrabold uppercase tracking-widest flex items-center gap-1.5">
            <MapPin size={16} /> Official Workshop & Factory Location
          </span>
          <h3 className="font-heading font-black text-xl sm:text-2xl text-[#111111] mt-1">
            MANIKANDAN LATHE WORKSHOP
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm mt-0.5">
            K. Keeranur Road, Kallimandhayam, Dindigul District - 624616, Tamil Nadu.
          </p>
        </div>

        {/* Click to Open Shop Location Button */}
        <a
          href={shopLocationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#111111] hover:bg-[#F97316] text-white text-xs font-heading font-black px-5 py-3 rounded-xl transition-all shadow-md group shrink-0 active:scale-95"
        >
          <Navigation size={16} className="text-[#F97316] group-hover:text-white transition-colors" />
          Open Workshop Location in Google Maps <ExternalLink size={14} />
        </a>
      </div>

      {/* Embed Map Frame (Clicking frame opens Google Maps shop location) */}
      <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-gray-200 shadow-inner group">
        <iframe
          title="MANIKANDAN LATHE Official Workshop Location"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          src="https://maps.google.com/maps?q=MANIKANDAN%20LATHE,%20K.Keeranur%20Road,%20Kallimandhayam&t=&z=16&ie=UTF8&iwloc=&output=embed"
        />
        
        {/* Click Overlay Banner */}
        <a
          href={shopLocationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 left-4 right-4 sm:right-auto bg-[#111111]/90 backdrop-blur-md text-white p-3.5 rounded-xl border border-white/20 shadow-2xl flex items-center justify-between gap-4 hover:bg-[#111111] transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#F97316] animate-ping shrink-0" />
            <div>
              <span className="font-heading font-black text-xs text-white block">MANIKANDAN LATHE SHOP</span>
              <span className="text-[10px] text-gray-300">Tap to open exact shop coordinates & directions</span>
            </div>
          </div>
          <ExternalLink size={16} className="text-[#F97316] shrink-0" />
        </a>
      </div>

    </div>
  );
};
