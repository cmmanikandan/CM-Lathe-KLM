import React from 'react';
import { Order } from '../../types';

interface InvoiceFooterProps {
  order: Order;
}

export const InvoiceFooter: React.FC<InvoiceFooterProps> = ({ order }) => {
  return (
    <div className="space-y-4 font-sans avoid-break pt-4 border-t border-gray-200">
      
      {/* Terms & Signatures Row */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 text-xs">
        
        {/* Terms & Conditions */}
        <div className="flex-1 space-y-1.5 text-[10px] text-gray-500 font-mono">
          <span className="font-bold uppercase text-gray-700 block text-[10px]">
            TERMS & CONDITIONS & WARRANTY
          </span>
          <ol className="list-decimal list-inside space-y-0.5 leading-relaxed">
            <li>5-Year Guarantee on all heavy steel lathe turning & structural welds.</li>
            <li>On-site measurements verified prior to final cutting. Goods once fabricated cannot be returned.</li>
            <li>Balance payment must be settled before transport loading or final installation.</li>
            <li>Subject to Oddanchatram / Dindigul Jurisdiction only.</li>
          </ol>
        </div>

        {/* Authorized Signature & Seal */}
        <div className="w-full md:w-64 text-center space-y-2 border-t md:border-t-0 md:border-l border-gray-200 md:pl-6 pt-3 md:pt-0 shrink-0">
          <div className="relative inline-block">
            {/* Digital Workshop Stamp / Seal Badge */}
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#FF6A00] flex items-center justify-center p-1 text-[8px] font-mono text-[#FF6A00] font-black uppercase text-center mx-auto opacity-80">
              MANIKANDAN LATHE<br />KALLIMANDHAYAM<br />★ VERIFIED SEAL ★
            </div>
            <div className="font-script text-[#111111] font-bold text-base -mt-6">
              Chellamuthu K
            </div>
          </div>

          <div className="border-t border-gray-900 pt-1 font-mono text-[10px] text-gray-800">
            <strong>For MANIKANDAN LATHE</strong>
            <span className="block text-[9px] text-gray-500 uppercase">Proprietor / Authorized Signatory</span>
          </div>
        </div>

      </div>

      {/* Bottom Disclaimer */}
      <div className="bg-gray-100 p-2.5 rounded-xl text-center text-[10px] text-gray-500 font-mono flex items-center justify-between">
        <span>Thank you for choosing MANIKANDAN LATHE Workshop!</span>
        <span>This is a computer-generated tax invoice.</span>
      </div>

    </div>
  );
};
