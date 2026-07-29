let globalCounter = Math.floor(Date.now() / 1000) % 1000 + 1;

/**
 * 1. ONLINE WEBSITE ORDERS: ORD-1
 */
export const generateOnlineOrderNumber = (sequenceNum?: number): string => {
  const seq = sequenceNum || (globalCounter++);
  return `ORD-${seq}`;
};

/**
 * 2. ENQUIRY ID: ENQ-1
 */
export const generateEnquiryNumber = (sequenceNum?: number): string => {
  const seq = sequenceNum || (globalCounter++);
  return `ENQ-${seq}`;
};

/**
 * 3. OFFLINE ADVANCED FABRICATION ORDERS: FAB-1
 */
export const generateFabricationOrderNumber = (sequenceNum?: number): string => {
  const seq = sequenceNum || (globalCounter++);
  return `FAB-${seq}`;
};

/**
 * 4. POS QUICK BILL: POS-1
 */
export const generatePosBillNumber = (sequenceNum?: number): string => {
  const seq = sequenceNum || (globalCounter++);
  return `POS-${seq}`;
};

/**
 * 5. TAX INVOICE NUMBER: INV-1
 */
export const generateTaxInvoiceNumber = (sequenceNum?: number): string => {
  const seq = sequenceNum || (globalCounter++);
  return `INV-${seq}`;
};

/**
 * 6. THERMAL RECEIPT NUMBER: RCP-1
 */
export const generateThermalReceiptNumber = (sequenceNum?: number): string => {
  const seq = sequenceNum || (globalCounter++);
  return `RCP-${seq}`;
};

/**
 * 7. PAYMENT RECEIPT NUMBER: PAY-YYYYMM-000001
 */
export const generatePaymentReceiptNumber = (sequenceNum?: number): string => {
  const now = new Date();
  const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const seq = String(sequenceNum || Math.floor(100000 + Math.random() * 899999)).padStart(6, '0');
  return `PAY-${yyyymm}-${seq}`;
};

/**
 * 8. REFUND NUMBER: REF-YYYYMM-000001
 */
export const generateRefundNumber = (sequenceNum?: number): string => {
  const now = new Date();
  const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const seq = String(sequenceNum || Math.floor(100000 + Math.random() * 899999)).padStart(6, '0');
  return `REF-${yyyymm}-${seq}`;
};

/**
 * 9. PAYMENT REQUEST NUMBER: REQ-YYYYMM-000001
 */
export const generatePaymentRequestNumber = (sequenceNum?: number): string => {
  const now = new Date();
  const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const seq = String(sequenceNum || Math.floor(100000 + Math.random() * 899999)).padStart(6, '0');
  return `REQ-${yyyymm}-${seq}`;
};

/**
 * 10. CUSTOMER ID: CUS-000001
 */
export const generateCustomerId = (sequenceNum?: number): string => {
  const seq = String(sequenceNum || Math.floor(100000 + Math.random() * 899999)).padStart(6, '0');
  return `CUS-${seq}`;
};

/**
 * 11. PRODUCT SKU: ML-CAT-000001 (e.g. ML-TRA-000001, ML-GAT-000002)
 */
export const generateProductSku = (categoryName?: string, sequenceNum?: number): string => {
  const catClean = (categoryName || 'LAT').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'LAT';
  const seq = String(sequenceNum || Math.floor(100000 + Math.random() * 899999)).padStart(6, '0');
  return `ML-${catClean}-${seq}`;
};
