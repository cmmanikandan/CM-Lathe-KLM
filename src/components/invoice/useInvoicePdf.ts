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
    if (!element || !order) return;

    try {
      setIsGeneratingPdf(true);

      // Render high resolution canvas from invoice element with CORS resilience
      const canvas = await html2canvas(element, {
        scale: 2, // 2x resolution for sharp text and barcode/QR rendering
        useCORS: true,
        allowTaint: false, // Must be false to prevent SecurityError on toDataURL
        logging: false,
        backgroundColor: '#FFFFFF',
        imageTimeout: 8000,
        onclone: (clonedDoc) => {
          const imgs = clonedDoc.querySelectorAll('img');
          imgs.forEach((img) => {
            img.crossOrigin = 'anonymous';
          });
        },
      });

      const imgData = canvas.toDataURL('image/png');

      if (mode === 'THERMAL') {
        // 80mm Thermal Receipt PDF Format
        const receiptWidthMm = 80;
        const receiptHeightMm = Math.max(100, (canvas.height * receiptWidthMm) / canvas.width);

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [receiptWidthMm, receiptHeightMm],
        });

        pdf.addImage(imgData, 'PNG', 0, 0, receiptWidthMm, receiptHeightMm);
        const filename = `POS_Receipt_${order.orderNumber || 'ML-POS-01'}.pdf`;
        pdf.save(filename);
      } else {
        // Standard A4 Tax Invoice Format (210mm x 297mm)
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
        const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pdfHeight));

        // Multi-page handling if content exceeds 1 page
        let heightLeft = imgHeight - pdfHeight;
        let position = -pdfHeight;

        while (heightLeft > 5) {
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
          position -= pdfHeight;
        }

        const filename = `Tax_Invoice_${order.orderNumber || 'ML-2026-0481'}.pdf`;
        pdf.save(filename);
      }
    } catch (err) {
      console.error('PDF Generation Error:', err);
      // Clean fallback print
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return { downloadPdf, isGeneratingPdf };
};
