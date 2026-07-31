export interface ProductVariant {
  id: string;
  name: string;
  code: string;
  image?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  weight?: string;
  dimensions?: string;
  material?: string;
  color?: string;
  finish?: string;
}

export interface ProductSpecificationDetail {
  material: string;
  grade?: string;
  thickness?: string;
  length?: string;
  width?: string;
  height?: string;
  weight?: string;
  color: string;
  size: string;
  finish?: string;
  coating?: string;
  isRustResistant?: boolean;
  isWeatherResistant?: boolean;
  isWaterproof?: boolean;
  isHeatResistant?: boolean;
  warranty?: string;
  expectedLife?: string;
}

export interface ProductInventory {
  currentStock: number;
  minStock: number;
  maxStock: number;
  reservedStock: number;
  availableStock: number;
  barcode?: string;
  lowStockAlert: boolean;
}

export interface ProductSEO {
  title?: string;
  description?: string;
  keywords?: string;
  slug?: string;
  ogImage?: string;
}

export interface ProductVideo {
  title: string;
  url: string;
  type: 'Workshop' | 'Installation' | 'YouTube';
}

export interface ProductDocument {
  title: string;
  url: string;
  fileType: 'PDF' | 'CAD' | 'Drawing' | 'Manual';
}

export interface ProductCustomOrderConfig {
  enabled: boolean;
  allowNotes: boolean;
  allowDrawingUpload: boolean;
  allowMeasurementUpload: boolean;
  allowReferenceImages: boolean;
}

export interface ProductCustomerOptions {
  wishlistEnabled: boolean;
  reviewsEnabled: boolean;
  ratingsEnabled: boolean;
  shareEnabled: boolean;
  whatsappEnabled: boolean;
  inquiryEnabled: boolean;
  orderEnabled: boolean;
}

export interface Product {
  id: string;
  name: string;
  shortName?: string;
  productCode?: string;
  sku?: string;
  slug?: string;
  category: string;
  subCategory?: string;
  brand?: string;
  productType?: 'Ready Stock' | 'Made To Order' | 'Custom Fabrication';
  status?: 'Draft' | 'Published' | 'Hidden' | 'Archived';
  
  price: number;
  discountPrice?: number;
  costPrice?: number;
  profitMargin?: number;
  gstPercent?: number;
  isTaxIncluded?: boolean;
  unit: string;
  stock: number;
  isReadyStock: boolean;
  isMadeToOrder: boolean;
  images: string[];
  
  description: string;
  shortDescription?: string;
  technicalDescription?: string;
  featuresList?: string[];
  advantagesList?: string[];
  applicationsList?: string[];
  maintenanceInstructions?: string;
  warrantyDetails?: string;
  installationDetails?: string;
  packingDetails?: string;
  deliveryDetailsText?: string;
  
  specifications: ProductSpecificationDetail;
  variants?: ProductVariant[];
  videos?: ProductVideo[];
  models3d?: string[];
  documents?: ProductDocument[];
  seo?: ProductSEO;
  inventory?: ProductInventory;
  customOrderConfig?: ProductCustomOrderConfig;
  customerOptions?: ProductCustomerOptions;
  relatedProductIds?: string[];
  
  rating: number;
  reviewCount: number;
  views: number;
  wishlistCount?: number;
  totalOrdersCount?: number;
  totalRevenueGenerated?: number;
  createdAt?: string;

  isRecommended?: boolean;
  isBestSelling?: boolean;
  isTrending?: boolean;
  isPremium?: boolean;
  isBudgetFriendly?: boolean;
  isFestivalOffer?: boolean;
  isIndustrial?: boolean;
  isNewArrival?: boolean;
  badgeText?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  image: string;
  variant: {
    material?: string;
    color?: string;
    size: string;
    finish?: string;
    thickness?: string;
    length?: string;
    width?: string;
    height?: string;
  };

  customMeasurements?: string;
  drawingUrl?: string;
  referenceNotes?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PaymentTransaction {
  id: string;
  orderId?: string;
  date: string;
  time: string;
  amount: number;
  mode: 'Razorpay' | 'UPI' | 'Card' | 'NetBanking' | 'Cash' | 'Bank Transfer' | 'Cheque' | 'Online';
  paymentType?: 'Advance' | 'Partial' | 'Full' | 'Refund';
  paymentStatus?: 'SUCCESS' | 'PENDING' | 'FAILED';
  collectedBy: string;
  remainingBalanceAfter: number;
  receiptNumber: string;
  referenceId?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  bankName?: string;
  txnReference?: string;
  proofUrl?: string;
  notes?: string;
}


export interface DeliveryDetails {
  personName: string;
  mobileNumber: string;
  deliveryCharge: number;
  expectedDate: string;
  expectedTime: string;
  status: 'Assigned' | 'Out for Delivery' | 'Delivered' | 'Installed';
  vehicleNumber?: string;
  deliveryType?: 'Pickup' | 'Home Delivery' | 'Installation';
  specialNotes?: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'MATERIAL_READY'
  | 'IN_PRODUCTION'
  | 'QUALITY_CHECK'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'INSTALLED'
  | 'COMPLETED'
  | 'REJECTED';

export interface OrderActivityLog {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  details?: string;
}

export interface PaymentRequest {
  id: string;
  orderId: string;
  customerId?: string;
  amount: number;
  reason: 'Advance' | 'Balance' | 'Material Cost' | 'Transport' | 'Installation' | 'Custom';
  message?: string;
  dueDate?: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
  paymentLink?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdBy: string;
  createdAt: string;
  paidAt?: string;
  expiresAt?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerGstin?: string;
  items: OrderItem[];
  basePrice: number;
  labourCharge?: number;
  fabricationCharge?: number;
  installationCharge?: number;
  transportCharge?: number;
  reducedAmount: number; // Discount
  gstAmount?: number;
  finalPrice: number;
  advanceRequired: number;
  advancePaid: number;
  remainingBalance: number;
  status: OrderStatus;
  orderType?: 'Quick Order' | 'Walk-in Order' | 'Custom Fabrication' | 'Repair Order' | 'Lathe Turning' | 'Installation Order' | 'Enquiry Order' | 'Customer Order';
  priority?: 'Normal' | 'High' | 'Urgent';
  assignedMachine?: string;
  assignedWorker?: string;
  paymentHistory: PaymentTransaction[];
  paymentRequests?: PaymentRequest[];
  deliveryDetails?: DeliveryDetails;
  createdAt: string;
  updatedAt?: string;
  expectedDate?: string;
  isOfflineOrder?: boolean;
  completedImages?: string[];
  notes?: string;
  activityLog?: OrderActivityLog[];
}




export interface StatusStory {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  title: string;
  subtitle?: string;
  tag: 'Offer' | 'Work Progress' | 'Festival Wishes' | 'New Product';
  createdAt: string;
  expiresAt: string;
  seenCount: number;
}

export interface HomeBanner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  image: string;
  linkUrl?: string;
  createdAt?: string;
}

export interface CustomerAddress {
  houseNo: string;
  street: string;
  area: string;
  village: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  landmark?: string;
  addressType: 'Home' | 'Office' | 'Farm' | 'Workshop';
  isDefault: boolean;
}

export interface CustomerUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  avatarUrl?: string;
  role: 'customer' | 'admin';

  // Google Auth Fields
  googleUID?: string;
  googlePhotoURL?: string;
  googleName?: string;
  googleEmail?: string;

  // Profile Status
  profileCompleted?: boolean;
  phoneVerified?: boolean;
  customerId?: string;       // e.g. MLC-000123
  memberSince?: string;      // e.g. "2026"

  // Extended Profile & Management
  customerType?: 'Online' | 'Offline Walk-in' | 'VIP';
  notes?: string;
  district?: string;
  state?: string;
  pincode?: string;
  addressDetails?: CustomerAddress;

  // Management Stats
  totalOrdersCount?: number;
  totalSpent?: number;
  createdAt?: string;

  // Preferences
  language?: 'Tamil' | 'English';
  notificationPrefs?: {
    push: boolean;
    email: boolean;
    whatsapp: boolean;
    sms: boolean;
  };
  darkMode?: boolean;
}

// ─── ENQUIRY & WORKFLOW TYPES ───────────────────────────────────────────────

export type EnquiryStatus =
  | 'ENQUIRY_RECEIVED'
  | 'UNDER_REVIEW'
  | 'INFO_REQUESTED'
  | 'QUOTATION_SENT'
  | 'ORDER_ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED';

export interface EnquiryTimelineEvent {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  details?: string;
}

export interface CustomerEnquiry {
  id: string;
  enquiryNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress: string;
  location?: string;
  productId: string;
  productName: string;
  productImage: string;
  variantName?: string;
  measurements?: string;
  referenceImages?: string[];
  notes?: string;
  quantity: number;
  estimatedPrice: number;
  adjustedPrice?: number;
  paymentOption: 'Pay Later' | 'Pay Advance Online';
  advancePaid: number;
  advancePaymentDetails?: PaymentTransaction;
  deliveryType: 'Pickup' | 'Home Delivery' | 'Installation';
  status: EnquiryStatus;
  rejectionReason?: string;
  infoRequestedMessage?: string;
  suggestedVariant?: string;
  quotationUrl?: string;
  orderId?: string;
  createdAt: string;
  updatedAt?: string;
  timeline: EnquiryTimelineEvent[];
}

// ─── REFUND MANAGEMENT TYPES ───────────────────────────────────────────────

export type RefundReason =
  | 'Customer Cancelled'
  | 'Admin Cancelled'
  | 'Product Unavailable'
  | 'Duplicate Payment'
  | 'Wrong Amount'
  | 'Order Rejected'
  | 'Quality Issue'
  | 'Custom';

export type RefundType = 'Full Refund' | 'Partial Refund';

export type RefundStatus =
  | 'Requested'
  | 'Pending Approval'
  | 'Approved'
  | 'Processing'
  | 'Completed'
  | 'Failed' | 'Cancelled';

export interface RefundTimelineEvent {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  details?: string;
}

export interface RefundLedgerEntry {
  id: string;
  timestamp: string;
  account: 'Customer Ledger' | 'Sales Ledger' | 'Payment Ledger' | 'Analytics' | 'Profit Reports' | 'GST Reports';
  debitCredit: 'DEBIT' | 'CREDIT';
  amount: number;
  notes?: string;
}

export interface Refund {
  id: string;
  refundNumber: string;
  orderId?: string;
  enquiryId?: string;
  orderNumber?: string;
  customerName: string;
  customerPhone: string;
  originalPaymentAmount: number;
  originalPaymentMode: string;
  originalPaymentTxnId?: string;
  refundAmount: number;
  refundType: RefundType;
  reason: RefundReason;
  customReason?: string;
  status: RefundStatus;
  refundMethod: 'Razorpay' | 'Cash' | 'Bank Transfer' | 'UPI';
  razorpayRefundId?: string;
  razorpayPaymentId?: string;
  cashVoucherNo?: string;
  staffName?: string;
  staffSignature?: string;
  createdBy: string;
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: string;
  completedAt?: string;
  expectedCompletionDate?: string;
  timeline: RefundTimelineEvent[];
  ledgerEntries?: RefundLedgerEntry[];
}

