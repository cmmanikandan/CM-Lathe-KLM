import { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Order } from '../../types';

export const useInvoicePdf = () => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const downloadPdf = async (element: HTMLElement | null, order: Order | null) => {
    if (!element || !order) return;

    try {
      setIsGeneratingPdf(true);

      // Render high resolution canvas from invoice element
      const canvas = await html2canvas(element, {
        scale: 2, // 2x resolution is clear and fast
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          // Ensure all images in cloned document are styled properly
          const imgs = clonedDoc.querySelectorAll('img');
          imgs.forEach((img) => {
            img.crossOrigin = 'anonymous';
          });
        },
      });

      const imgData = canvas.toDataURL('image/png');
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

      // Handle extra pages if content exceeds 1 page
      let heightLeft = imgHeight - pdfHeight;
      let position = -pdfHeight;

      while (heightLeft > 5) {
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
        position -= pdfHeight;
      }

      const filename = `Invoice_${order.orderNumber || 'ML-2026-0481'}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      // Clean fallback print without popup error alert
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return { downloadPdf, isGeneratingPdf };
};
