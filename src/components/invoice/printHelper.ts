/**
 * High-Precision Standalone Invoice & Thermal Receipt Printing Engine
 * Uses window.open() to create an isolated print window with all Tailwind styles embedded inline.
 * Fixes blank-page issue caused by broken relative CSS URLs inside hidden iframes.
 */
export const printInvoiceElement = (element: HTMLElement | null, isThermal: boolean = false) => {
  if (!element) {
    console.warn('printInvoiceElement: No element provided');
    return;
  }

  // ── 1. Capture all <style> tag content (Tailwind JIT generates inline <style> tags)
  const allStyles = Array.from(document.querySelectorAll('style'))
    .map((s) => s.textContent || '')
    .join('\n');

  // ── 2. Clone invoice HTML, strip non-printable elements
  const clone = element.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('.no-print, .invoice-toolbar, button').forEach((el) => el.remove());
  const invoiceHtml = clone.outerHTML;

  // ── 3. Build complete self-contained print document
  const printDocument = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>MANIKANDAN LATHE &ndash; ${isThermal ? 'Thermal Receipt' : 'Tax Invoice'}</title>
  <style>
    ${allStyles}
    @page { size: ${isThermal ? '80mm auto' : 'A4 portrait'}; margin: 0; }
    *, *::before, *::after {
      box-sizing: border-box !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0 !important; padding: 0 !important;
      background: #ffffff !important; color: #111111 !important;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
      width: ${isThermal ? '80mm' : '210mm'} !important;
      display: block !important; visibility: visible !important; opacity: 1 !important;
    }
    .invoice-a4-container {
      width: 210mm !important; min-height: 297mm !important; max-width: 210mm !important;
      box-shadow: none !important; border: none !important;
      margin: 0 auto !important; padding: 8mm 10mm !important;
      background: #ffffff !important; transform: none !important;
      display: block !important; visibility: visible !important;
    }
    .invoice-thermal-container {
      width: 80mm !important; max-width: 80mm !important;
      margin: 0 auto !important; box-shadow: none !important; border: none !important;
      padding: 3mm !important; background: #ffffff !important; transform: none !important;
      display: block !important; visibility: visible !important;
    }
    .no-print, button, nav, header, footer, .invoice-toolbar { display: none !important; }
    tr, .avoid-break { page-break-inside: avoid !important; break-inside: avoid !important; }
  </style>
</head>
<body>
  ${invoiceHtml}
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        setTimeout(function() { window.close(); }, 600);
      }, 350);
    };
  </script>
</body>
</html>`;

  // ── 4. Open new browser tab with the fully self-contained print document
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    alert('Pop-up blocked! Please allow pop-ups for this site to enable printing, then try again.');
    return;
  }
  printWindow.document.open();
  printWindow.document.write(printDocument);
  printWindow.document.close();
};

