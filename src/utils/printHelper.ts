/**
 * Isolated Invoice & Thermal Bill Print Helper
 * Prints ONLY the invoice/receipt HTML document via an isolated iframe,
 * avoiding any webpage layout, sidebars, header/footer, or background elements.
 */
export const printInvoiceElement = (element: HTMLElement | null, isThermal: boolean = false) => {
  if (!element) {
    window.print();
    return;
  }

  // Create temporary in-memory iframe for isolated document printing
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  // Clone element HTML
  const invoiceHtml = element.outerHTML;

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>MANIKANDAN LATHE - Print Document</title>
        <meta charset="utf-8" />
        <style>
          @page {
            size: ${isThermal ? '80mm auto' : 'A4 portrait'};
            margin: ${isThermal ? '0' : '6mm'};
          }
          *, *::before, *::after {
            box-sizing: border-box;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff !important;
            color: #111111 !important;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .invoice-a4-container {
            box-shadow: none !important;
            border: none !important;
            margin: 0 auto !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            border-radius: 0 !important;
          }
          .invoice-thermal-container {
            width: 80mm !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: none !important;
            padding: 2mm !important;
          }
          .no-print, button, nav, header, footer {
            display: none !important;
          }
        </style>
      </head>
      <body>
        ${invoiceHtml}
      </body>
    </html>
  `);
  doc.close();

  // Focus and trigger iframe printing
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error('Iframe print error:', e);
      window.print();
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }
  }, 350);
};
