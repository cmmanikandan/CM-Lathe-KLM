import { supabase } from './supabase';

/**
 * Fetches the next sequential integer for a given counter key from Supabase.
 * The `counters` table + `get_next_id(key TEXT)` RPC must be set up in Supabase.
 * Falls back to a timestamp-based number if the RPC is unavailable.
 */
const getNextSeqNum = async (key: string): Promise<number> => {
  try {
    const { data, error } = await supabase.rpc('get_next_id', { counter_key: key });
    if (error || !data) throw new Error(error?.message || 'No data');
    return Number(data);
  } catch (err) {
    console.warn(`getNextSeqNum fallback for "${key}":`, err);
    // Fallback: use last 4 digits of current timestamp (not guaranteed unique but prevents crash)
    return Math.floor(Date.now() / 1000) % 9999 + 1;
  }
};

/**
 * 1. ONLINE WEBSITE ORDERS: ORD-1, ORD-2, ...
 */
export const generateOnlineOrderNumber = async (): Promise<string> => {
  const seq = await getNextSeqNum('ORD');
  return `ORD-${seq}`;
};

/**
 * 2. ENQUIRY ID: ENQ-1, ENQ-2, ...
 */
export const generateEnquiryNumber = async (): Promise<string> => {
  const seq = await getNextSeqNum('ENQ');
  return `ENQ-${seq}`;
};

/**
 * 3. OFFLINE ADVANCED FABRICATION ORDERS: FAB-1, FAB-2, ...
 */
export const generateFabricationOrderNumber = async (): Promise<string> => {
  const seq = await getNextSeqNum('FAB');
  return `FAB-${seq}`;
};

/**
 * 4. POS QUICK BILL: POS-1, POS-2, ...
 */
export const generatePosBillNumber = async (): Promise<string> => {
  const seq = await getNextSeqNum('POS');
  return `POS-${seq}`;
};

/**
 * 5. TAX INVOICE NUMBER: INV-1, INV-2, ...
 */
export const generateTaxInvoiceNumber = async (): Promise<string> => {
  const seq = await getNextSeqNum('INV');
  return `INV-${seq}`;
};

/**
 * 6. THERMAL RECEIPT NUMBER: RCP-1, RCP-2, ...
 */
export const generateThermalReceiptNumber = async (): Promise<string> => {
  const seq = await getNextSeqNum('RCP');
  return `RCP-${seq}`;
};

/**
 * 7. PAYMENT RECEIPT NUMBER: PAY-202607-1
 */
export const generatePaymentReceiptNumber = async (): Promise<string> => {
  const now = new Date();
  const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const seq = await getNextSeqNum('PAY');
  return `PAY-${yyyymm}-${seq}`;
};

/**
 * 8. REFUND NUMBER: REF-202607-1
 */
export const generateRefundNumber = async (): Promise<string> => {
  const now = new Date();
  const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const seq = await getNextSeqNum('REF');
  return `REF-${yyyymm}-${seq}`;
};

/**
 * 9. PAYMENT REQUEST NUMBER: REQ-202607-1
 */
export const generatePaymentRequestNumber = async (): Promise<string> => {
  const now = new Date();
  const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const seq = await getNextSeqNum('REQ');
  return `REQ-${yyyymm}-${seq}`;
};

/**
 * 10. CUSTOMER ID: CUS-1
 */
export const generateCustomerId = async (): Promise<string> => {
  const seq = await getNextSeqNum('CUS');
  return `CUS-${seq}`;
};

/**
 * 11. PRODUCT SKU: ML-CAT-1
 */
export const generateProductSku = async (categoryName?: string): Promise<string> => {
  const catClean = (categoryName || 'LAT').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'LAT';
  const seq = await getNextSeqNum(`SKU-${catClean}`);
  return `ML-${catClean}-${seq}`;
};

