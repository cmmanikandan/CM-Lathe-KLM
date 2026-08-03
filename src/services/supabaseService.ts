import { supabase } from './supabase';
import { Order, OrderItem, PaymentTransaction, Product, StatusStory, CustomerUser, PaymentRequest, CustomerEnquiry, Refund, EnquiryTimelineEvent, RefundTimelineEvent, RefundLedgerEntry } from '../types';


// ─── TYPE MAPPERS ───────────────────────────────────────────────────────────

const mapOrder = (row: Record<string, unknown>, items: OrderItem[] = [], payments: PaymentTransaction[] = []): Order => ({
  id: row.id as string,
  orderNumber: row.order_number as string,
  customerName: row.customer_name as string,
  customerPhone: row.customer_phone as string,
  customerAddress: row.customer_address as string,
  basePrice: Number(row.base_price),
  labourCharge: Number(row.labour_charge || 0),
  fabricationCharge: Number(row.fabrication_charge || 0),
  installationCharge: Number(row.installation_charge || 0),
  transportCharge: Number(row.transport_charge || 0),
  reducedAmount: Number(row.reduced_amount),
  gstAmount: Number(row.gst_amount || 0),
  finalPrice: Number(row.final_price),
  advanceRequired: Number(row.advance_required),
  advancePaid: Number(row.advance_paid),
  remainingBalance: Number(row.remaining_balance),
  status: row.status as Order['status'],
  orderType: (row.order_type as Order['orderType']) || (row.is_offline_order ? 'Walk-in Order' : 'Customer Order'),
  priority: (row.priority as Order['priority']) || 'Normal',
  assignedMachine: row.assigned_machine as string | undefined,
  assignedWorker: (row.delivery_details as any)?.personName as string | undefined,
  deliveryDetails: row.delivery_details as Order['deliveryDetails'],
  expectedDate: row.expected_date as string | undefined,
  isOfflineOrder: Boolean(row.is_offline_order),
  createdAt: row.created_at as string,
  updatedAt: (row.updated_at as string) || (row.created_at as string),
  notes: row.notes as string | undefined,
  completedImages: (row.completed_images as string[]) || [],
  activityLog: (row.activity_log as Order['activityLog']) || [],
  items,
  paymentHistory: payments,
});


export const mapCustomerProfile = (row: Record<string, unknown>): CustomerUser => ({
  id: row.id as string,
  name: row.name as string,
  phone: row.phone as string,
  email: row.email as string,
  address: row.address as string,
  avatarUrl: row.avatar_url as string | undefined,
  role: row.role as CustomerUser['role'],
  customerType: (row.customer_type as CustomerUser['customerType']) || 'Online',
  notes: row.notes as string | undefined,
  district: row.district as string | undefined,
  state: row.state as string | undefined,
  pincode: row.pincode as string | undefined,
  createdAt: row.created_at as string | undefined,
});

const mapOrderItem = (row: Record<string, unknown>): OrderItem => {
  const unitPrice = Number(row.unit_price || 0);
  const qty = Number(row.quantity || 1);
  const totalPrice = Number(row.total_price || unitPrice * qty);

  return {
    productId: row.product_id as string,
    productName: row.product_name as string,
    image: row.image as string,
    variant: row.variant as OrderItem['variant'],
    customMeasurements: row.custom_measurements as string | undefined,
    drawingUrl: row.drawing_url as string | undefined,
    referenceNotes: row.reference_notes as string | undefined,
    quantity: qty,
    unitPrice: unitPrice,
    totalPrice: totalPrice,
    originalPriceAtOrder: row.original_price_at_order !== undefined && row.original_price_at_order !== null ? Number(row.original_price_at_order) : (row.original_price !== undefined ? Number(row.original_price) : unitPrice),
    productDiscountAtOrder: row.product_discount_at_order !== undefined && row.product_discount_at_order !== null ? Number(row.product_discount_at_order) : (row.discount_amount !== undefined ? Number(row.discount_amount) : 0),
    unitSellingPriceAtOrder: row.unit_selling_price_at_order !== undefined && row.unit_selling_price_at_order !== null ? Number(row.unit_selling_price_at_order) : unitPrice,
    costPriceAtOrder: row.cost_price_at_order !== undefined && row.cost_price_at_order !== null ? Number(row.cost_price_at_order) : (row.cost_price !== undefined ? Number(row.cost_price) : undefined),
    lineTotal: row.line_total !== undefined && row.line_total !== null ? Number(row.line_total) : totalPrice,
  };
};

const mapPayment = (row: Record<string, unknown>): PaymentTransaction => ({
  id: row.id as string,
  orderId: row.order_id as string | undefined,
  date: row.date as string,
  time: row.time as string,
  amount: Number(row.amount),
  mode: row.mode as PaymentTransaction['mode'],
  paymentType: (row.payment_type as PaymentTransaction['paymentType']) || 'Advance',
  paymentStatus: (row.payment_status as PaymentTransaction['paymentStatus']) || 'SUCCESS',
  collectedBy: row.collected_by as string,
  remainingBalanceAfter: Number(row.remaining_balance_after),
  receiptNumber: row.receipt_number as string,
  referenceId: row.reference_id as string | undefined,
  razorpayPaymentId: row.razorpay_payment_id as string | undefined,
  razorpayOrderId: row.razorpay_order_id as string | undefined,
  razorpaySignature: row.razorpay_signature as string | undefined,
  bankName: row.bank_name as string | undefined,
  txnReference: row.txn_reference as string | undefined,
  proofUrl: row.proof_url as string | undefined,
  notes: row.notes as string | undefined,
});


const mapProduct = (row: Record<string, unknown>): Product => {
  const price = Number(row.price || 0);
  const discountPrice = row.discount_price ? Number(row.discount_price) : undefined;
  const originalPrice = row.original_price !== undefined && row.original_price !== null ? Number(row.original_price) : price;
  
  let discountType: Product['discountType'] = 'none';
  if (row.discount_type) {
    discountType = row.discount_type as Product['discountType'];
  } else if (discountPrice && discountPrice < originalPrice) {
    discountType = 'amount';
  }

  let discountAmount = 0;
  if (row.discount_amount !== undefined && row.discount_amount !== null) {
    discountAmount = Number(row.discount_amount);
  } else if (discountPrice && discountPrice < originalPrice) {
    discountAmount = originalPrice - discountPrice;
  }

  let discountValue = 0;
  if (row.discount_value !== undefined && row.discount_value !== null) {
    discountValue = Number(row.discount_value);
  } else {
    discountValue = discountAmount;
  }

  let finalSellingPrice = originalPrice;
  if (row.final_selling_price !== undefined && row.final_selling_price !== null) {
    finalSellingPrice = Number(row.final_selling_price);
  } else if (discountPrice) {
    finalSellingPrice = discountPrice;
  } else if (discountAmount > 0) {
    finalSellingPrice = originalPrice - discountAmount;
  }

  const costPrice = row.cost_price !== undefined && row.cost_price !== null ? Number(row.cost_price) : 0;
  const profit = finalSellingPrice - costPrice;
  const calculatedMargin = finalSellingPrice > 0 ? Number(((profit / finalSellingPrice) * 100).toFixed(1)) : 0;
  const profitMargin = row.profit_margin !== undefined && row.profit_margin !== null ? Number(row.profit_margin) : calculatedMargin;

  const tags = (row.tags as string[]) || (row.features_tags as string[]) || [];

  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as string,
    subCategory: row.sub_category as string | undefined,
    price: originalPrice,
    originalPrice,
    discountType,
    discountValue,
    discountAmount,
    finalSellingPrice,
    discountPrice: discountAmount > 0 ? finalSellingPrice : undefined,
    costPrice,
    profitMargin,
    tags,
    unit: row.unit as string,
    stock: Number(row.stock),
    isReadyStock: row.is_ready_stock as boolean,
    isMadeToOrder: row.is_made_to_order as boolean,
    images: (row.images as string[]) || [],
    description: row.description as string,
    specifications: row.specifications as Product['specifications'],
    rating: Number(row.rating),
    reviewCount: Number(row.review_count),
    isRecommended: row.is_recommended as boolean | undefined,
    isBestSelling: row.is_best_selling as boolean | undefined,
    isTrending: row.is_trending as boolean | undefined,
    isPremium: row.is_premium as boolean | undefined,
    isBudgetFriendly: row.is_budget_friendly as boolean | undefined,
    isFestivalOffer: row.is_festival_offer as boolean | undefined,
    views: Number(row.views),
    badgeText: row.badge_text as string | undefined,
  };
};

const mapStory = (row: Record<string, unknown>): StatusStory => ({
  id: row.id as string,
  mediaUrl: row.media_url as string,
  mediaType: row.media_type as 'image' | 'video',
  title: row.title as string,
  subtitle: row.subtitle as string | undefined,
  tag: row.tag as StatusStory['tag'],
  createdAt: row.created_at as string,
  expiresAt: row.expires_at as string,
  seenCount: Number(row.seen_count),
});

// ─── ORDERS ─────────────────────────────────────────────────────────────────

/** Fetch all orders for a given customer phone number */
export const fetchCustomerOrders = async (phone: string): Promise<Order[]> => {
  const normalised = phone.replace(/\D/g, '');
  if (!normalised) return [];

  // Match last 10 digits to handle +91 prefix variants
  const last10 = normalised.slice(-10);

  const { data: orderRows, error } = await supabase
    .from('orders')
    .select('*')
    .or(`customer_phone.eq.${last10},customer_phone.eq.+91${last10},customer_phone.eq.91${last10}`)
    .order('created_at', { ascending: false });

  if (error || !orderRows) return [];

  const orders: Order[] = [];

  for (const row of orderRows) {
    const [itemsRes, paymentsRes] = await Promise.all([
      supabase.from('order_items').select('*').eq('order_id', row.id),
      supabase.from('payment_transactions').select('*').eq('order_id', row.id).order('date', { ascending: true }),
    ]);

    const items = (itemsRes.data || []).map((r) => mapOrderItem(r as Record<string, unknown>));
    const payments = (paymentsRes.data || []).map((r) => mapPayment(r as Record<string, unknown>));
    orders.push(mapOrder(row as Record<string, unknown>, items, payments));
  }

  return orders;
};

/** Fetch a single order with items + payments (by UUID or Order Number) */
export const fetchOrderById = async (orderId: string): Promise<Order | null> => {
  if (!orderId) return null;
  const cleanId = orderId.replace(/^#/, '').trim();

  let { data: row } = await supabase.from('orders').select('*').eq('id', cleanId).maybeSingle();
  if (!row) {
    const { data: rowNum } = await supabase
      .from('orders')
      .select('*')
      .or(`order_number.eq.${cleanId},order_number.eq.#${cleanId}`)
      .maybeSingle();
    row = rowNum;
  }
  if (!row) return null;

  const targetId = row.id;
  const [itemsRes, paymentsRes] = await Promise.all([
    supabase.from('order_items').select('*').eq('order_id', targetId),
    supabase.from('payment_transactions').select('*').eq('order_id', targetId).order('date', { ascending: true }),
  ]);

  const items = (itemsRes.data || []).map((r) => mapOrderItem(r as Record<string, unknown>));
  const payments = (paymentsRes.data || []).map((r) => mapPayment(r as Record<string, unknown>));
  return mapOrder(row as Record<string, unknown>, items, payments);
};

/** Fetch all orders (admin use) */
export const fetchAllOrders = async (): Promise<Order[]> => {
  const { data: orderRows, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !orderRows) return [];

  const orders: Order[] = [];
  for (const row of orderRows) {
    const [itemsRes, paymentsRes] = await Promise.all([
      supabase.from('order_items').select('*').eq('order_id', row.id),
      supabase.from('payment_transactions').select('*').eq('order_id', row.id).order('date', { ascending: true }),
    ]);
    const items = (itemsRes.data || []).map((r) => mapOrderItem(r as Record<string, unknown>));
    const payments = (paymentsRes.data || []).map((r) => mapPayment(r as Record<string, unknown>));
    orders.push(mapOrder(row as Record<string, unknown>, items, payments));
  }
  return orders;
};

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

export const fetchAllProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((r) => mapProduct(r as Record<string, unknown>));
};

// ─── STATUS STORIES ──────────────────────────────────────────────────────────

const STATUS_STORIES_STORAGE_KEY = 'cmlathe_status_stories_v1';
const GALLERY_STORAGE_KEY = 'cmlathe_gallery_v1';

export const getLocalStories = (): StatusStory[] => {
  try {
    const saved = localStorage.getItem(STATUS_STORIES_STORAGE_KEY);
    if (saved) {
      const parsed: StatusStory[] = JSON.parse(saved);
      return parsed.filter((s) => new Date(s.expiresAt).getTime() > Date.now());
    }
  } catch (e) {}
  return [];
};

export const saveStoryToLocal = (story: StatusStory): void => {
  try {
    const existing = getLocalStories();
    const updated = [story, ...existing.filter((s) => s.id !== story.id)];
    localStorage.setItem(STATUS_STORIES_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {}
};

export const deleteStoryFromLocal = (id: string): void => {
  try {
    const existing = getLocalStories();
    const updated = existing.filter((s) => s.id !== id);
    localStorage.setItem(STATUS_STORIES_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {}
};

export const fetchActiveStories = async (): Promise<StatusStory[]> => {
  const localStories = getLocalStories();
  try {
    const { data, error } = await supabase
      .from('status_stories')
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      const remote = data.map((r) => mapStory(r as Record<string, unknown>));
      // Merge remote and local (avoiding duplicates)
      const remoteIds = new Set(remote.map((r) => r.id));
      const combined = [...remote, ...localStories.filter((s) => !remoteIds.has(s.id))];
      localStorage.setItem(STATUS_STORIES_STORAGE_KEY, JSON.stringify(combined));
      return combined;
    }
  } catch (e) {}
  return localStories;
};

// ─── GALLERY ─────────────────────────────────────────────────────────────────

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  description?: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  isFeatured: boolean;
  createdAt: string;
}

export const getLocalGallery = (): GalleryItem[] => {
  try {
    const saved = localStorage.getItem(GALLERY_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return [];
};

export const saveGalleryToLocal = (item: GalleryItem): void => {
  try {
    const existing = getLocalGallery();
    const idx = existing.findIndex((g) => g.id === item.id);
    let updated: GalleryItem[];
    if (idx >= 0) {
      updated = [...existing];
      updated[idx] = item;
    } else {
      updated = [item, ...existing];
    }
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {}
};

export const deleteGalleryFromLocal = (id: string): void => {
  try {
    const existing = getLocalGallery();
    const updated = existing.filter((g) => g.id !== id);
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {}
};

export const fetchGallery = async (): Promise<GalleryItem[]> => {
  const localItems = getLocalGallery();
  try {
    const { data, error } = await supabase
      .from('admin_gallery')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      const remote = data.map((r) => ({
        id: r.id as string,
        title: r.title as string,
        category: r.category as string,
        description: r.description as string | undefined,
        mediaUrl: r.media_url as string,
        mediaType: r.media_type as 'image' | 'video',
        isFeatured: Boolean(r.is_featured),
        createdAt: r.created_at as string,
      }));
      const remoteIds = new Set(remote.map((r) => r.id));
      const combined = [...remote, ...localItems.filter((g) => !remoteIds.has(g.id))];
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(combined));
      return combined;
    }
  } catch (e) {}
  return localItems;
};

export const insertGalleryItem = async (item: GalleryItem): Promise<GalleryItem | null> => {
  saveGalleryToLocal(item);
  try {
    const { data, error } = await supabase
      .from('admin_gallery')
      .upsert({
        id: item.id || `gal-${Date.now()}`,
        title: item.title,
        category: item.category,
        description: item.description || null,
        media_url: item.mediaUrl,
        media_type: item.mediaType || 'image',
        is_featured: item.isFeatured || false,
        created_at: item.createdAt || new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !data) {
      console.warn('insertGalleryItem DB fallback to local:', error);
      return item;
    }
    const savedItem: GalleryItem = {
      id: data.id as string,
      title: data.title as string,
      category: data.category as string,
      description: data.description as string | undefined,
      mediaUrl: data.media_url as string,
      mediaType: data.media_type as 'image' | 'video',
      isFeatured: Boolean(data.is_featured),
      createdAt: data.created_at as string,
    };
    saveGalleryToLocal(savedItem);
    return savedItem;
  } catch (e) {
    return item;
  }
};

export const deleteGalleryItem = async (id: string): Promise<boolean> => {
  deleteGalleryFromLocal(id);
  try {
    await supabase.from('admin_gallery').delete().eq('id', id);
  } catch (e) {}
  return true;
};

// ─── HERO BANNERS ─────────────────────────────────────────────────────────────

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  image: string;
  ctaText?: string;
  ctaLink?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
}

const HERO_BANNERS_STORAGE_KEY = 'cmlathe_hero_banners_v1';

export const DEFAULT_HERO_BANNERS: HeroBanner[] = [
  {
    id: 'banner-1',
    title: 'TRACTOR KALAPPAI & CULTIVATORS',
    subtitle: 'Precision forged lathe-machined tines engineered for tough agricultural soil.',
    tag: 'AGRICULTURAL MACHINERY',
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1000&q=80',
    ctaText: 'Explore Kalappai',
    ctaLink: '/products',
    isActive: true,
    displayOrder: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'banner-2',
    title: 'HEAVY DUTY STEEL SAFETY GATES',
    subtitle: 'Custom laser cut architectural main gates with lifetime anti-rust warranty.',
    tag: 'HOME ARCHITECTURAL STEEL',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
    ctaText: 'View Steel Gates',
    ctaLink: '/products',
    isActive: true,
    displayOrder: 2,
    createdAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 'banner-3',
    title: 'PRECISION LATHE TURNING & REPAIRS',
    subtitle: 'Shaft turning, gear welding, tractor axle re-facing & heavy industrial turning.',
    tag: 'WORKSHOP LATHE SERVICES',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80',
    ctaText: 'Custom Order',
    ctaLink: '/quick-order',
    isActive: true,
    displayOrder: 3,
    createdAt: '2026-01-03T00:00:00.000Z',
  },
];

export const fetchHeroBanners = async (): Promise<HeroBanner[]> => {
  try {
    const { data, error } = await supabase
      .from('hero_banners')
      .select('*')
      .order('display_order', { ascending: true });

    if (!error && data) {
      const mapped = data.map((r) => ({
        id: r.id as string,
        title: r.title as string,
        subtitle: r.subtitle as string,
        tag: r.tag as string,
        image: r.image_url || r.image as string,
        ctaText: r.cta_text as string | undefined,
        ctaLink: r.cta_link as string | undefined,
        isActive: r.is_active !== false,
        displayOrder: Number(r.display_order || 1),
        createdAt: r.created_at as string,
      }));
      localStorage.setItem(HERO_BANNERS_STORAGE_KEY, JSON.stringify(mapped));
      return mapped;
    }
  } catch (e) {
    console.warn('Supabase hero_banners query offline, loading stored banners.', e);
  }

  try {
    const local = localStorage.getItem(HERO_BANNERS_STORAGE_KEY);
    if (local !== null) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}

  localStorage.setItem(HERO_BANNERS_STORAGE_KEY, JSON.stringify(DEFAULT_HERO_BANNERS));
  return DEFAULT_HERO_BANNERS;
};

export const insertHeroBanner = async (banner: HeroBanner): Promise<HeroBanner> => {
  const newBanner: HeroBanner = {
    ...banner,
    id: banner.id || `banner-${Date.now()}`,
    createdAt: banner.createdAt || new Date().toISOString(),
  };

  try {
    await supabase.from('hero_banners').upsert({
      id: newBanner.id,
      title: newBanner.title,
      subtitle: newBanner.subtitle,
      tag: newBanner.tag,
      image_url: newBanner.image,
      cta_text: newBanner.ctaText || null,
      cta_link: newBanner.ctaLink || null,
      is_active: newBanner.isActive,
      display_order: newBanner.displayOrder,
      created_at: newBanner.createdAt,
    });
  } catch (e) {
    console.warn('Supabase upsert hero_banners failed, storing locally', e);
  }

  try {
    const existing = await fetchHeroBanners();
    const idx = existing.findIndex((b) => b.id === newBanner.id);
    let updated: HeroBanner[];
    if (idx >= 0) {
      updated = [...existing];
      updated[idx] = newBanner;
    } else {
      updated = [...existing, newBanner];
    }
    localStorage.setItem(HERO_BANNERS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {}

  return newBanner;
};

export const deleteHeroBanner = async (id: string): Promise<boolean> => {
  try {
    await supabase.from('hero_banners').delete().eq('id', id);
  } catch (e) {}

  try {
    const local = localStorage.getItem(HERO_BANNERS_STORAGE_KEY);
    let existing: HeroBanner[] = [];
    if (local !== null) {
      existing = JSON.parse(local);
    } else {
      existing = DEFAULT_HERO_BANNERS;
    }
    const filtered = existing.filter((b) => b.id !== id);
    localStorage.setItem(HERO_BANNERS_STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {}

  return true;
};

// ─── WRITE: BANNERS ─────────────────────────────────────────────────────────

export interface DBBanner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  image: string;
  createdAt?: string;
}

export const fetchBanners = async (): Promise<DBBanner[]> => {
  const { data, error } = await supabase
    .from('admin_banners')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id as string,
    title: r.title as string,
    subtitle: r.subtitle as string,
    tag: r.tag as string,
    image: r.image as string,
    createdAt: r.created_at as string,
  }));
};

export const insertBanner = async (banner: DBBanner): Promise<DBBanner | null> => {
  const { data, error } = await supabase
    .from('admin_banners')
    .insert({
      id: banner.id || `b-${Date.now()}`,
      title: banner.title,
      subtitle: banner.subtitle,
      tag: banner.tag || 'AGRICULTURAL MACHINERY',
      image: banner.image,
      created_at: banner.createdAt || new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !data) {
    console.error('insertBanner DB error:', error);
    return banner;
  }
  return {
    id: data.id as string,
    title: data.title as string,
    subtitle: data.subtitle as string,
    tag: data.tag as string,
    image: data.image as string,
    createdAt: data.created_at as string,
  };
};

export const deleteBannerItem = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('admin_banners').delete().eq('id', id);
  if (error) {
    console.error('deleteBannerItem error:', error);
    return false;
  }
  return true;
};

// ─── WRITE: ORDERS ───────────────────────────────────────────────────────────

export const insertOrder = async (order: Order): Promise<void> => {
  const { error } = await supabase.from('orders').insert({
    id: order.id,
    order_number: order.orderNumber,
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    customer_address: order.customerAddress,
    base_price: order.basePrice,
    labour_charge: order.labourCharge || 0,
    fabrication_charge: order.fabricationCharge || 0,
    installation_charge: order.installationCharge || 0,
    transport_charge: order.transportCharge || 0,
    reduced_amount: order.reducedAmount || 0,
    gst_amount: order.gstAmount || 0,
    final_price: order.finalPrice,
    advance_required: order.advanceRequired,
    advance_paid: order.advancePaid,
    remaining_balance: order.remainingBalance,
    status: order.status,
    order_type: order.orderType || (order.isOfflineOrder ? 'Walk-in Order' : 'Quick Order'),
    priority: order.priority || 'Normal',
    assigned_machine: order.assignedMachine || null,
    notes: order.notes,
    delivery_details: order.deliveryDetails,
    expected_date: order.expectedDate,
    is_offline_order: Boolean(order.isOfflineOrder),
    activity_log: order.activityLog || [],
  });

  if (error) console.error('insertOrder error:', error);

  // Insert items
  if (order.items.length) {
    await supabase.from('order_items').insert(
      order.items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.productName,
        image: item.image,
        variant: item.variant,
        custom_measurements: item.customMeasurements || null,
        drawing_url: item.drawingUrl || null,
        reference_notes: item.referenceNotes || null,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
      }))
    );
  }
};


export const updateOrderStatus = async (orderId: string, status: string, extraFields?: Record<string, unknown>): Promise<void> => {
  const { error } = await supabase.from('orders').update({ status, ...extraFields }).eq('id', orderId);
  if (error) console.error('updateOrderStatus error:', error);
};

export const deleteOrderFromDb = async (orderId: string): Promise<void> => {
  await supabase.from('order_items').delete().eq('order_id', orderId);
  await supabase.from('payment_transactions').delete().eq('order_id', orderId);
  await supabase.from('payment_requests').delete().eq('order_id', orderId);
  await supabase.from('enquiries').update({ order_id: null, status: 'ENQUIRY_RECEIVED' }).eq('order_id', orderId);
  const { error } = await supabase.from('orders').delete().eq('id', orderId);
  if (error) console.error('deleteOrderFromDb error:', error);
};

export const deleteOrdersFromDb = async (orderIds: string[]): Promise<void> => {
  await supabase.from('order_items').delete().in('order_id', orderIds);
  await supabase.from('payment_transactions').delete().in('order_id', orderIds);
  await supabase.from('payment_requests').delete().in('order_id', orderIds);
  await supabase.from('enquiries').update({ order_id: null, status: 'ENQUIRY_RECEIVED' }).in('order_id', orderIds);
  const { error } = await supabase.from('orders').delete().in('id', orderIds);
  if (error) console.error('deleteOrdersFromDb error:', error);
};

export const insertPayment = async (orderId: string, payment: PaymentTransaction): Promise<void> => {
  const { error } = await supabase.from('payment_transactions').insert({
    id: payment.id,
    order_id: orderId,
    date: payment.date,
    time: payment.time,
    amount: payment.amount,
    mode: payment.mode,
    payment_type: payment.paymentType || 'Advance',
    payment_status: payment.paymentStatus || 'SUCCESS',
    collected_by: payment.collectedBy,
    remaining_balance_after: payment.remainingBalanceAfter,
    receipt_number: payment.receiptNumber,
    reference_id: payment.referenceId || null,
    razorpay_payment_id: payment.razorpayPaymentId || null,
    razorpay_order_id: payment.razorpayOrderId || null,
    razorpay_signature: payment.razorpaySignature || null,
    bank_name: payment.bankName || null,
    txn_reference: payment.txnReference || null,
    proof_url: payment.proofUrl || null,
    notes: payment.notes || null,
  });
  if (error) console.error('insertPayment error:', error);
};


// ─── WRITE: STORIES ──────────────────────────────────────────────────────────

export const insertStory = async (story: StatusStory): Promise<void> => {
  const { error } = await supabase.from('status_stories').insert({
    id: story.id,
    media_url: story.mediaUrl,
    media_type: story.mediaType,
    title: story.title,
    subtitle: story.subtitle,
    tag: story.tag,
    created_at: story.createdAt,
    expires_at: story.expiresAt,
    seen_count: story.seenCount,
  });
  if (error) console.error('insertStory error:', error);
};

export const deleteStoryById = async (id: string): Promise<void> => {
  await supabase.from('status_stories').delete().eq('id', id);
};

export const incrementStorySeen = async (id: string): Promise<void> => {
  const { data } = await supabase.from('status_stories').select('seen_count').eq('id', id).single();
  if (data) {
    await supabase.from('status_stories').update({ seen_count: (data.seen_count as number) + 1 }).eq('id', id);
  }
};

// ─── CUSTOMER PROFILES ────────────────────────────────────────────────────────

export const fetchAllCustomerProfiles = async (): Promise<CustomerUser[]> => {
  const { data, error } = await supabase
    .from('customer_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map((r) => mapCustomerProfile(r as Record<string, unknown>));
};

export const fetchCustomerProfileByPhone = async (phone: string): Promise<CustomerUser | null> => {
  const last10 = phone.replace(/\D/g, '').slice(-10);
  const { data, error } = await supabase
    .from('customer_profiles')
    .select('*')
    .or(`phone.eq.${last10},phone.eq.+91${last10},phone.eq.91${last10}`)
    .maybeSingle();

  if (error || !data) return null;
  return mapCustomerProfile(data as Record<string, unknown>);
};

export const upsertCustomerProfile = async (profile: Partial<CustomerUser> & { name: string; phone: string; address: string }): Promise<CustomerUser | null> => {
  const payload = {
    id: profile.id || `cust-${Date.now()}`,
    name: profile.name,
    phone: profile.phone,
    email: profile.email || null,
    address: profile.address,
    district: profile.district || null,
    state: profile.state || 'Tamil Nadu',
    pincode: profile.pincode || null,
    customer_type: profile.customerType || 'Online',
    notes: profile.notes || null,
    role: profile.role || 'customer',
  };

  const { data, error } = await supabase
    .from('customer_profiles')
    .upsert(payload, { onConflict: 'phone' })
    .select()
    .single();

  if (error || !data) {
    console.error('upsertCustomerProfile error:', error);
    return null;
  }
  return mapCustomerProfile(data as Record<string, unknown>);
};

export const deleteCustomerProfile = async (id: string): Promise<void> => {
  const { error } = await supabase.from('customer_profiles').delete().eq('id', id);
  if (error) console.error('deleteCustomerProfile error:', error);
};

/* ====================================================================
   PAYMENT REQUESTS (ADMIN & CUSTOMER LIVE WORKFLOW)
   ==================================================================== */
export const mapPaymentRequest = (row: Record<string, unknown>): PaymentRequest => {
  return {
    id: (row.id as string) || '',
    orderId: (row.order_id as string) || '',
    customerId: (row.customer_id as string) || undefined,
    amount: Number(row.amount || 0),
    reason: (row.reason as PaymentRequest['reason']) || 'Advance',
    message: (row.message as string) || undefined,
    dueDate: (row.due_date as string) || undefined,
    status: (row.status as PaymentRequest['status']) || 'PENDING',
    paymentLink: (row.payment_link as string) || undefined,
    razorpayOrderId: (row.razorpay_order_id as string) || undefined,
    razorpayPaymentId: (row.razorpay_payment_id as string) || undefined,
    createdBy: (row.created_by as string) || 'Chellamuthu K (Admin)',
    createdAt: (row.created_at as string) || new Date().toISOString(),
    paidAt: (row.paid_at as string) || undefined,
    expiresAt: (row.expires_at as string) || undefined,
  };
};

export const insertPaymentRequest = async (req: PaymentRequest): Promise<PaymentRequest | null> => {
  const payload = {
    id: req.id,
    order_id: req.orderId,
    customer_id: req.customerId || null,
    amount: req.amount,
    reason: req.reason,
    message: req.message || null,
    due_date: req.dueDate || null,
    status: req.status || 'PENDING',
    payment_link: req.paymentLink || null,
    razorpay_order_id: req.razorpayOrderId || null,
    created_by: req.createdBy,
  };

  const { data, error } = await supabase.from('payment_requests').insert(payload).select().single();
  if (error || !data) {
    console.error('insertPaymentRequest error:', error);
    return null;
  }
  return mapPaymentRequest(data as Record<string, unknown>);
};

export const fetchPaymentRequestsForOrder = async (orderId: string): Promise<PaymentRequest[]> => {
  const { data, error } = await supabase
    .from('payment_requests')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map((r) => mapPaymentRequest(r as Record<string, unknown>));
};

export const fetchPendingPaymentRequestForCustomer = async (phone: string): Promise<PaymentRequest | null> => {
  if (!phone) return null;
  const last10 = phone.replace(/\D/g, '').slice(-10);
  
  // Find customer's orders first
  const { data: orders } = await supabase
    .from('orders')
    .select('id')
    .or(`customer_phone.eq.${last10},customer_phone.eq.+91${last10}`);

  if (!orders || orders.length === 0) return null;

  const orderIds = orders.map((o) => o.id);
  const { data, error } = await supabase
    .from('payment_requests')
    .select('*')
    .in('order_id', orderIds)
    .eq('status', 'PENDING')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return mapPaymentRequest(data as Record<string, unknown>);
};

export const markPaymentRequestPaid = async (requestId: string, razorpayPaymentId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('payment_requests')
    .update({
      status: 'PAID',
      razorpay_payment_id: razorpayPaymentId,
      paid_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  if (error) {
    console.error('markPaymentRequestPaid error:', error);
    return false;
  }
  return true;
};

export const cancelPaymentRequest = async (requestId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('payment_requests')
    .update({ status: 'CANCELLED' })
    .eq('id', requestId);

  if (error) {
    console.error('cancelPaymentRequest error:', error);
    return false;
  }
  return true;
};

export const mapEnquiry = (row: Record<string, unknown>): CustomerEnquiry => {
  let statusVal = (row.status as CustomerEnquiry['status']) || 'ENQUIRY_RECEIVED';
  if ((statusVal as string) === 'ACCEPTED_CONVERTED') statusVal = 'ORDER_ACCEPTED';
  if ((statusVal as string) === 'REJECTED_BY_ADMIN') statusVal = 'REJECTED';

  return {
    id: row.id as string,
    enquiryNumber: (row.enquiry_number as string) || `ENQ-${row.id}`,
    customerName: row.customer_name as string,
    customerPhone: row.customer_phone as string,
    customerEmail: row.customer_email as string | undefined,
    customerAddress: (row.customer_address as string) || '',
    productId: row.product_id as string,
    productName: row.product_name as string,
    productImage: (row.product_image as string) || '',
    variantName: row.variant_name as string | undefined,
    measurements: row.measurements as string | undefined,
    referenceImages: (row.reference_images as string[]) || [],
    notes: row.notes as string | undefined,
    quantity: Number(row.quantity || 1),
    estimatedPrice: Number(row.estimated_price || 0),
    adjustedPrice: row.adjusted_price ? Number(row.adjusted_price) : undefined,
    paymentOption: (row.payment_option as CustomerEnquiry['paymentOption']) || 'Pay Later',
    advancePaid: Number(row.advance_paid || 0),
    advancePaymentDetails: row.advance_payment_details as PaymentTransaction | undefined,
    deliveryType: (row.delivery_type as CustomerEnquiry['deliveryType']) || 'Pickup',
    status: statusVal,
    rejectionReason: row.rejection_reason as string | undefined,
    infoRequestedMessage: row.info_requested_message as string | undefined,
    suggestedVariant: row.suggested_variant as string | undefined,
    quotationUrl: row.quotation_url as string | undefined,
    orderId: row.order_id as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: (row.updated_at as string) || (row.created_at as string),
    timeline: (row.timeline as EnquiryTimelineEvent[]) || [],
  };
};

export const insertEnquiry = async (enquiry: CustomerEnquiry): Promise<CustomerEnquiry | null> => {
  const payload = {
    id: enquiry.id,
    enquiry_number: enquiry.enquiryNumber,
    customer_name: enquiry.customerName,
    customer_phone: enquiry.customerPhone,
    customer_email: enquiry.customerEmail || null,
    customer_address: enquiry.customerAddress,
    product_id: enquiry.productId,
    product_name: enquiry.productName,
    product_image: enquiry.productImage,
    variant_name: enquiry.variantName || null,
    measurements: enquiry.measurements || null,
    reference_images: enquiry.referenceImages || [],
    notes: enquiry.notes || null,
    quantity: enquiry.quantity,
    estimated_price: enquiry.estimatedPrice,
    adjusted_price: enquiry.adjustedPrice || null,
    payment_option: enquiry.paymentOption,
    advance_paid: enquiry.advancePaid,
    advance_payment_details: enquiry.advancePaymentDetails || null,
    delivery_type: enquiry.deliveryType,
    status: enquiry.status || 'ENQUIRY_RECEIVED',
    timeline: enquiry.timeline || [],
  };

  const { data, error } = await supabase.from('enquiries').insert(payload).select().single();
  if (error || !data) {
    console.error('insertEnquiry DB error:', error);
    // Return optimistic object if offline / table missing
    return enquiry;
  }
  return mapEnquiry(data as Record<string, unknown>);
};

export const fetchAllEnquiries = async (): Promise<CustomerEnquiry[]> => {
  const { data, error } = await supabase
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map((r) => mapEnquiry(r as Record<string, unknown>));
};

export const fetchCustomerEnquiries = async (phone: string): Promise<CustomerEnquiry[]> => {
  if (!phone) return [];
  const last10 = phone.replace(/\D/g, '').slice(-10);

  const { data, error } = await supabase
    .from('enquiries')
    .select('*')
    .or(`customer_phone.eq.${last10},customer_phone.eq.+91${last10},customer_phone.eq.91${last10}`)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map((r) => mapEnquiry(r as Record<string, unknown>));
};

export const updateEnquiryStatusInDb = async (
  enquiryId: string,
  status: CustomerEnquiry['status'],
  extraFields: Record<string, unknown> = {}
): Promise<boolean> => {
  const { error } = await supabase
    .from('enquiries')
    .update({ status, updated_at: new Date().toISOString(), ...extraFields })
    .eq('id', enquiryId);

  if (error) {
    console.error('updateEnquiryStatusInDb error:', error);
    return false;
  }
  return true;
};

export const appendEnquiryTimelineInDb = async (
  enquiryId: string,
  event: EnquiryTimelineEvent
): Promise<void> => {
  const { data } = await supabase.from('enquiries').select('timeline').eq('id', enquiryId).single();
  if (data) {
    const timeline = (data.timeline as EnquiryTimelineEvent[]) || [];
    timeline.push(event);
    await supabase.from('enquiries').update({ timeline }).eq('id', enquiryId);
  }
};

/* ====================================================================
   REFUNDS MANAGEMENT SYSTEM
   ==================================================================== */
export const mapRefund = (row: Record<string, unknown>): Refund => ({
  id: row.id as string,
  refundNumber: (row.refund_number as string) || `RFD-${row.id}`,
  orderId: row.order_id as string | undefined,
  enquiryId: row.enquiry_id as string | undefined,
  orderNumber: row.order_number as string | undefined,
  customerName: row.customer_name as string,
  customerPhone: row.customer_phone as string,
  originalPaymentAmount: Number(row.original_payment_amount || 0),
  originalPaymentMode: (row.original_payment_mode as string) || 'Razorpay',
  originalPaymentTxnId: row.original_payment_txn_id as string | undefined,
  refundAmount: Number(row.refund_amount || 0),
  refundType: (row.refund_type as Refund['refundType']) || 'Full Refund',
  reason: (row.reason as Refund['reason']) || 'Customer Cancelled',
  customReason: row.custom_reason as string | undefined,
  status: (row.status as Refund['status']) || 'Requested',
  refundMethod: (row.refund_method as Refund['refundMethod']) || 'Razorpay',
  razorpayRefundId: row.razorpay_refund_id as string | undefined,
  razorpayPaymentId: row.razorpay_payment_id as string | undefined,
  cashVoucherNo: row.cash_voucher_no as string | undefined,
  staffName: row.staff_name as string | undefined,
  staffSignature: row.staff_signature as string | undefined,
  createdBy: (row.created_by as string) || 'System',
  approvedBy: row.approved_by as string | undefined,
  rejectionReason: row.rejection_reason as string | undefined,
  createdAt: row.created_at as string,
  completedAt: row.completed_at as string | undefined,
  expectedCompletionDate: row.expected_completion_date as string | undefined,
  timeline: (row.timeline as RefundTimelineEvent[]) || [],
  ledgerEntries: (row.ledger_entries as RefundLedgerEntry[]) || [],
});

export const insertRefundInDb = async (refund: Refund): Promise<Refund | null> => {
  const payload = {
    id: refund.id,
    refund_number: refund.refundNumber,
    order_id: refund.orderId || null,
    enquiry_id: refund.enquiryId || null,
    order_number: refund.orderNumber || null,
    customer_name: refund.customerName,
    customer_phone: refund.customerPhone,
    original_payment_amount: refund.originalPaymentAmount,
    original_payment_mode: refund.originalPaymentMode,
    original_payment_txn_id: refund.originalPaymentTxnId || null,
    refund_amount: refund.refundAmount,
    refund_type: refund.refundType,
    reason: refund.reason,
    custom_reason: refund.customReason || null,
    status: refund.status || 'Requested',
    refund_method: refund.refundMethod,
    razorpay_refund_id: refund.razorpayRefundId || null,
    razorpay_payment_id: refund.razorpayPaymentId || null,
    cash_voucher_no: refund.cashVoucherNo || null,
    staff_name: refund.staffName || null,
    staff_signature: refund.staffSignature || null,
    created_by: refund.createdBy,
    expected_completion_date: refund.expectedCompletionDate || null,
    timeline: refund.timeline || [],
    ledger_entries: refund.ledgerEntries || [],
  };

  const { data, error } = await supabase.from('refunds').insert(payload).select().single();
  if (error || !data) {
    console.error('insertRefundInDb error:', error);
    return refund;
  }
  return mapRefund(data as Record<string, unknown>);
};

export const fetchAllRefundsFromDb = async (): Promise<Refund[]> => {
  const { data, error } = await supabase
    .from('refunds')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map((r) => mapRefund(r as Record<string, unknown>));
};

export const fetchCustomerRefundsFromDb = async (phone: string): Promise<Refund[]> => {
  if (!phone) return [];
  const last10 = phone.replace(/\D/g, '').slice(-10);

  const { data, error } = await supabase
    .from('refunds')
    .select('*')
    .or(`customer_phone.eq.${last10},customer_phone.eq.+91${last10},customer_phone.eq.91${last10}`)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map((r) => mapRefund(r as Record<string, unknown>));
};

export const updateRefundStatusInDb = async (
  refundId: string,
  status: Refund['status'],
  extraFields: Record<string, unknown> = {}
): Promise<boolean> => {
  const { error } = await supabase
    .from('refunds')
    .update({ status, ...extraFields })
    .eq('id', refundId);

  if (error) {
    console.error('updateRefundStatusInDb error:', error);
    return false;
  }
  return true;
};

