/**
 * High-Precision Standalone Invoice & Thermal Receipt Printing Engine
 * Opens an isolated document context containing ONLY the invoice HTML and self-contained styles.
 * Guarantees zero blank pages, zero web UI, and crisp A4 / 80mm printer output.
 */
export const printInvoiceElement = (element: HTMLElement | null, isThermal: boolean = false) => {
  if (!element) {
    window.print();
    return;
  }

  // Clone element outer HTML
  const invoiceHtml = element.outerHTML;

  // Extract Tailwind CSS & styles from main document
  const parentStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((el) => el.outerHTML)
    .join('\n');

  // Create temporary in-memory iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>MANIKANDAN LATHE - Print</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        ${parentStyles}
        <style>
          @page {
            size: ${isThermal ? '80mm auto' : 'A4 portrait'};
            margin: 0;
          }
          *, *::before, *::after {
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #111111 !important;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            width: ${isThermal ? '80mm' : '210mm'} !important;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
          .invoice-a4-container {
            width: 210mm !important;
            min-height: 297mm !important;
            max-width: 210mm !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 auto !important;
            padding: 8mm 10mm !important;
            background: #ffffff !important;
            transform: none !important;
            display: block !important;
            visibility: visible !important;
          }
          .invoice-thermal-container {
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: none !important;
            padding: 3mm !important;
            background: #ffffff !important;
            transform: none !important;
            display: block !important;
            visibility: visible !important;
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

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error('Print iframe error:', e);
      window.print();
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }
  }, 450);
};
