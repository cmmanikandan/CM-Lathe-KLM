import React from 'react';
import { Order } from '../../types';

interface InvoiceFooterProps {
  order: Order;
  isCompact?: boolean;
}

export const InvoiceFooter: React.FC<InvoiceFooterProps> = ({ order, isCompact = false }) => {
  return (
    <div className={`font-sans avoid-break border-t border-[#E5E7EB] ${isCompact ? 'space-y-1.5 pt-2' : 'space-y-3 pt-3'}`}>
      
      {/* Terms & Signatures Row */}
      <div className="flex flex-row justify-between items-end gap-4 text-xs">
        
        {/* Terms & Conditions */}
        <div className="flex-1 text-[9px] text-[#6B7280] font-mono space-y-0.5">
          <span className="font-bold uppercase text-[#374151] block text-[9px]">
            TERMS & CONDITIONS
          </span>
          <ol className="list-decimal list-inside space-y-0.5 leading-tight">
            <li>5-Year Guarantee on heavy steel lathe turning & structural welds.</li>
            <li>On-site measurements verified prior to final cutting.</li>
            <li>Subject to Oddanchatram / Dindigul Jurisdiction only.</li>
          </ol>
        </div>

        {/* Authorized Signature & Seal */}
        <div className="w-56 text-center border-l border-[#E5E7EB] pl-4 pt-1 shrink-0">
          <div className="relative inline-block">
            <div className="w-16 h-16 rounded-full border border-dashed border-[#FF6A00] flex items-center justify-center text-[7px] font-mono text-[#FF6A00] font-black uppercase text-center mx-auto opacity-80">
              MANIKANDAN LATHE<br />KALLIMANDHAYAM<br />VERIFIED SEAL
            </div>
            <div className="font-heading font-black text-[#111111] text-xs mt-0.5">
              Chellamuthu K
            </div>
          </div>

          <div className="border-t border-[#111111] pt-0.5 font-mono text-[9px] text-[#1F2937]">
            <strong>For MANIKANDAN LATHE</strong>
            <span className="block text-[8px] text-[#6B7280] uppercase">Proprietor / Authorized Signatory</span>
          </div>
        </div>

      </div>

      {/* Bottom Disclaimer */}
      <div className="bg-[#F3F4F6] p-1.5 rounded-lg text-center text-[9px] text-[#6B7280] font-mono flex items-center justify-between">
        <span>Thank you for choosing MANIKANDAN LATHE Workshop!</span>
        <span>Computer-generated official tax invoice.</span>
      </div>

    </div>
  );
};
