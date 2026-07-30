import { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Order } from '../../types';

export const useInvoicePdf = () => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const downloadPdf = async (
    element: HTMLElement | null,
    order: Order | null,
    mode: 'A4' | 'THERMAL' = 'A4'
  ) => {
    if (!element || !order) {
      alert('Invoice content not ready for PDF download.');
      return;
    }

    try {
      setIsGeneratingPdf(true);

      // Render high resolution canvas (scale 3 for 300 DPI vector-sharp PDF text)
      const canvas = await html2canvas(element, {
        scale: 3, // 300 DPI high resolution
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        imageTimeout: 10000,
        onclone: (clonedDoc) => {
          // Hide interactive non-printable UI buttons
          const noPrintEls = clonedDoc.querySelectorAll('.no-print, .invoice-toolbar');
          noPrintEls.forEach((el) => ((el as HTMLElement).style.display = 'none'));

          // Replace any dynamic oklch(...) colors in cloned stylesheets with standard HEX
          const styleTags = clonedDoc.querySelectorAll('style');
          styleTags.forEach((styleTag) => {
            try {
              if (styleTag.textContent && styleTag.textContent.includes('oklch')) {
                styleTag.textContent = styleTag.textContent.replace(/oklch\s*\([^)]+\)/gi, '#111111');
              }
            } catch (e) {
              // Ignore cross-origin style errors
            }
          });

          // Reset element transforms & enforce pure white background
          const target = clonedDoc.querySelector('.invoice-a4-container, .invoice-thermal-container') as HTMLElement;
          if (target) {
            target.style.transform = 'none';
            target.style.boxShadow = 'none';
            target.style.border = 'none';
            target.style.margin = '0 auto';
            target.style.backgroundColor = '#FFFFFF';
          }
        },
      });

      const imgData = canvas.toDataURL('image/png', 1.0);

      if (mode === 'THERMAL') {
        // 80mm Thermal Receipt Format
        const receiptWidthMm = 80;
        const receiptHeightMm = Math.max(100, Math.round((canvas.height * receiptWidthMm) / canvas.width));

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [receiptWidthMm, receiptHeightMm],
          compress: true,
        });

        pdf.addImage(imgData, 'PNG', 0, 0, receiptWidthMm, receiptHeightMm, undefined, 'FAST');
        const filename = `Thermal_Receipt_${order.orderNumber || 'POS-01'}.pdf`;
        pdf.save(filename);
      } else {
        // Standard A4 Tax Invoice Format (210mm x 297mm)
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true,
        });

        const pdfWidth = 210; // A4 width in mm
        const pdfHeight = 297; // A4 height in mm
        const imgHeightMm = (canvas.height * pdfWidth) / canvas.width;

        if (imgHeightMm <= pdfHeight + 2) {
          // Fits cleanly on single A4 page
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(imgHeightMm, pdfHeight), undefined, 'FAST');
        } else {
          // Multi-page A4 rendering
          let heightLeft = imgHeightMm;
          let position = 0;

          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightMm, undefined, 'FAST');
          heightLeft -= pdfHeight;

          while (heightLeft > 5) {
            position = position - pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightMm, undefined, 'FAST');
            heightLeft -= pdfHeight;
          }
        }

        const filename = `Tax_Invoice_${order.orderNumber || 'ML-2026'}.pdf`;
        pdf.save(filename);
      }
    } catch (err) {
      console.error('PDF Generation Error:', err);
      alert('Unable to generate PDF file. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return { downloadPdf, isGeneratingPdf };
};
