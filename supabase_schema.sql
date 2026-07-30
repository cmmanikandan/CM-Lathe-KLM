-- ====================================================================
-- MANIKANDAN LATHE - PRODUCTION SUPABASE POSTGRESQL DATABASE SCHEMA
-- Shop Owner: Chellamuthu K (25+ Years Lathe Machinery & Fabrication Master)
-- Phone / WhatsApp: +91 96592 86268 (9659286268)
-- Location: K. Keeranur Road, Kallimandhayam - 624616, Dindigul, Tamil Nadu
-- Target Database: Supabase PostgreSQL (https://lcxbnhwtvmnvbolsmtzh.supabase.co)
-- ====================================================================

-- 1. Enable Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Clean Drop Existing Tables (Order safe for foreign key relationships)
DROP TABLE IF EXISTS refunds CASCADE;
DROP TABLE IF EXISTS enquiries CASCADE;
DROP TABLE IF EXISTS payment_requests CASCADE;
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS wishlist_items CASCADE;
DROP TABLE IF EXISTS status_stories CASCADE;
DROP TABLE IF EXISTS admin_gallery CASCADE;
DROP TABLE IF EXISTS hero_banners CASCADE;
DROP TABLE IF EXISTS admin_banners CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customer_profiles CASCADE;

-- --------------------------------------------------------------------
-- TABLE 1: PRODUCTS (STORE CATALOG & INVENTORY)
-- --------------------------------------------------------------------
CREATE TABLE products (
  id VARCHAR(64) PRIMARY KEY DEFAULT ('prod-' || extract(epoch from now())::bigint || trunc(random()*1000)::text),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  sub_category TEXT,
  price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  discount_price NUMERIC(12,2),
  unit TEXT NOT NULL DEFAULT 'Set',
  stock INT NOT NULL DEFAULT 10,
  is_ready_stock BOOLEAN NOT NULL DEFAULT true,
  is_made_to_order BOOLEAN NOT NULL DEFAULT true,
  images TEXT[] NOT NULL DEFAULT '{}',
  description TEXT NOT NULL,
  specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
  rating NUMERIC(3,2) NOT NULL DEFAULT 4.90,
  review_count INT NOT NULL DEFAULT 1,
  is_recommended BOOLEAN DEFAULT false,
  is_best_selling BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  is_budget_friendly BOOLEAN DEFAULT false,
  is_festival_offer BOOLEAN DEFAULT false,
  views INT NOT NULL DEFAULT 0,
  badge_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------
-- TABLE 2: CUSTOMER PROFILES (USERS & SHOP ADMIN ACCOUNTS)
-- --------------------------------------------------------------------
CREATE TABLE customer_profiles (
  id VARCHAR(64) PRIMARY KEY DEFAULT ('cust-' || extract(epoch from now())::bigint),
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  address TEXT NOT NULL,
  district TEXT,
  state TEXT DEFAULT 'Tamil Nadu',
  pincode TEXT,
  avatar_url TEXT,
  customer_type TEXT NOT NULL DEFAULT 'Online' CHECK (customer_type IN ('Online', 'Offline Walk-in', 'VIP')),
  notes TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------
-- TABLE 3: ORDERS (ONLINE & POS WORKSHOP COUNTER ORDERS)
-- --------------------------------------------------------------------
CREATE TABLE orders (
  id VARCHAR(64) PRIMARY KEY DEFAULT ('ord-' || extract(epoch from now())::bigint),
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  base_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  labour_charge NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  fabrication_charge NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  installation_charge NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  transport_charge NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  reduced_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00, -- Admin discount applied to order
  gst_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  final_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,   -- Net total payable amount
  advance_required NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  advance_paid NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  remaining_balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'MATERIAL_READY', 'IN_PRODUCTION', 'QUALITY_CHECK', 'READY', 'OUT_FOR_DELIVERY', 'INSTALLED', 'COMPLETED', 'REJECTED')),
  order_type TEXT DEFAULT 'Walk-in Order',
  priority TEXT DEFAULT 'Normal' CHECK (priority IN ('Normal', 'High', 'Urgent')),
  assigned_machine TEXT,
  delivery_details JSONB,
  expected_date DATE,
  is_offline_order BOOLEAN NOT NULL DEFAULT false,
  completed_images TEXT[] DEFAULT '{}',
  notes TEXT,
  activity_log JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------
-- TABLE 4: ORDER ITEMS (PRODUCTS & CUSTOM LATHE WORK SPECIFICATIONS)
-- --------------------------------------------------------------------
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id VARCHAR(64) REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR(64) REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  image TEXT NOT NULL,
  variant JSONB NOT NULL DEFAULT '{}'::jsonb,
  custom_measurements TEXT,
  drawing_url TEXT,
  reference_notes TEXT,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  total_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------
-- TABLE 5: PAYMENT TRANSACTIONS (CENTRAL AUDIT FINANCIAL LEDGER)
-- --------------------------------------------------------------------
CREATE TABLE payment_transactions (
  id VARCHAR(64) PRIMARY KEY DEFAULT ('pay-' || extract(epoch from now())::bigint || trunc(random()*100)::text),
  order_id VARCHAR(64) REFERENCES orders(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time TEXT NOT NULL DEFAULT to_char(now(), 'HH12:MI AM'),
  amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  mode TEXT NOT NULL CHECK (mode IN ('Razorpay', 'UPI', 'Card', 'NetBanking', 'Cash', 'Bank Transfer', 'Cheque', 'Online')),
  payment_type TEXT DEFAULT 'Advance' CHECK (payment_type IN ('Advance', 'Partial', 'Full', 'Refund')),
  payment_status TEXT NOT NULL DEFAULT 'SUCCESS' CHECK (payment_status IN ('SUCCESS', 'PENDING', 'FAILED')),
  collected_by TEXT NOT NULL DEFAULT 'Chellamuthu K (Admin)',
  remaining_balance_after NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  receipt_number TEXT NOT NULL,
  reference_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  razorpay_signature TEXT,
  bank_name TEXT,
  txn_reference TEXT,
  proof_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------
-- TABLE 6: PAYMENT REQUESTS (ADMIN WORKFLOW & ONLINE ADVANCE COLLECT)
-- --------------------------------------------------------------------
CREATE TABLE payment_requests (
  id VARCHAR(64) PRIMARY KEY DEFAULT ('req-' || extract(epoch from now())::bigint),
  order_id VARCHAR(64) REFERENCES orders(id) ON DELETE CASCADE,
  customer_id VARCHAR(64),
  amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  reason TEXT NOT NULL CHECK (reason IN ('Advance', 'Balance', 'Material Cost', 'Transport', 'Installation', 'Custom')),
  message TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'EXPIRED', 'CANCELLED')),
  payment_link TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  created_by TEXT NOT NULL DEFAULT 'Chellamuthu K (Admin)',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- --------------------------------------------------------------------
-- TABLE 7: WISHLIST ITEMS
-- --------------------------------------------------------------------
CREATE TABLE wishlist_items (
  id VARCHAR(64) PRIMARY KEY DEFAULT ('wsh-' || extract(epoch from now())::bigint || trunc(random()*1000)::text),
  customer_phone TEXT NOT NULL,
  product_id VARCHAR(64) REFERENCES products(id) ON DELETE CASCADE,
  added_to_cart BOOLEAN DEFAULT false,
  converted_to_order BOOLEAN DEFAULT false,
  order_id VARCHAR(64) REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(customer_phone, product_id)
);

-- --------------------------------------------------------------------
-- TABLE 8: STATUS STORIES (EXPIRING WORKSHOP PROGRESS STORIES)
-- --------------------------------------------------------------------
CREATE TABLE status_stories (
  id VARCHAR(64) PRIMARY KEY DEFAULT ('st-' || extract(epoch from now())::bigint),
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  title TEXT NOT NULL,
  subtitle TEXT,
  tag TEXT NOT NULL DEFAULT 'Work Progress' CHECK (tag IN ('Offer', 'Work Progress', 'Festival Wishes', 'New Product')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  seen_count INT NOT NULL DEFAULT 1
);

-- --------------------------------------------------------------------
-- TABLE 9: ADMIN GALLERY (PORTFOLIO WORKSHOP SHOWCASE)
-- --------------------------------------------------------------------
CREATE TABLE admin_gallery (
  id VARCHAR(64) PRIMARY KEY DEFAULT ('gal-' || extract(epoch from now())::bigint),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------
-- TABLE 10: ADMIN BANNERS (PROMOTIONAL BANNERS)
-- --------------------------------------------------------------------
CREATE TABLE admin_banners (
  id VARCHAR(64) PRIMARY KEY DEFAULT ('b-' || extract(epoch from now())::bigint),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  tag TEXT NOT NULL DEFAULT 'AGRICULTURAL MACHINERY',
  image TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------
-- TABLE 11: HERO BANNERS (HOMEPAGE SLIDER BANNERS WITH CTAS)
-- --------------------------------------------------------------------
CREATE TABLE hero_banners (
  id VARCHAR(64) PRIMARY KEY DEFAULT ('banner-' || extract(epoch from now())::bigint),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  tag TEXT NOT NULL DEFAULT 'AGRICULTURAL MACHINERY',
  image_url TEXT NOT NULL,
  cta_text TEXT,
  cta_link TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------
-- TABLE 12: CUSTOMER ENQUIRIES (CUSTOM ESTIMATION & QUOTATIONS)
-- --------------------------------------------------------------------
CREATE TABLE enquiries (
  id VARCHAR(64) PRIMARY KEY DEFAULT ('enq-' || extract(epoch from now())::bigint),
  enquiry_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_address TEXT NOT NULL,
  product_id VARCHAR(64) REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT NOT NULL,
  variant_name TEXT,
  measurements TEXT,
  reference_images TEXT[] DEFAULT '{}',
  notes TEXT,
  quantity INT NOT NULL DEFAULT 1,
  estimated_price NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  adjusted_price NUMERIC(12,2),
  payment_option TEXT DEFAULT 'Pay Later' CHECK (payment_option IN ('Pay Now (Full)', 'Pay Advance Only', 'Pay Later')),
  advance_paid NUMERIC(12,2) DEFAULT 0.00,
  advance_payment_details JSONB,
  delivery_type TEXT DEFAULT 'Pickup' CHECK (delivery_type IN ('Pickup', 'Home Delivery', 'Installation Included')),
  status TEXT NOT NULL DEFAULT 'ENQUIRY_RECEIVED' CHECK (status IN ('ENQUIRY_RECEIVED', 'UNDER_REVIEW', 'QUOTATION_SENT', 'INFO_REQUESTED', 'ACCEPTED_CONVERTED', 'REJECTED_BY_ADMIN', 'CANCELLED_BY_CUSTOMER')),
  rejection_reason TEXT,
  info_requested_message TEXT,
  suggested_variant TEXT,
  quotation_url TEXT,
  order_id VARCHAR(64) REFERENCES orders(id) ON DELETE SET NULL,
  timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------
-- TABLE 13: REFUNDS MANAGEMENT (RETURNS, CANCELLATION LEDGER)
-- --------------------------------------------------------------------
CREATE TABLE refunds (
  id VARCHAR(64) PRIMARY KEY DEFAULT ('rfd-' || extract(epoch from now())::bigint),
  refund_number TEXT NOT NULL UNIQUE,
  order_id VARCHAR(64) REFERENCES orders(id) ON DELETE SET NULL,
  enquiry_id VARCHAR(64) REFERENCES enquiries(id) ON DELETE SET NULL,
  order_number TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  original_payment_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  original_payment_mode TEXT NOT NULL DEFAULT 'Razorpay',
  original_payment_txn_id TEXT,
  refund_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  refund_type TEXT NOT NULL DEFAULT 'Full Refund' CHECK (refund_type IN ('Full Refund', 'Partial Refund', 'Advance Refund', 'Custom Refund')),
  reason TEXT NOT NULL DEFAULT 'Customer Cancelled' CHECK (reason IN ('Customer Cancelled', 'Duplicate Order', 'Defective Product', 'Production Delay', 'Customer Change Request', 'Other')),
  custom_reason TEXT,
  status TEXT NOT NULL DEFAULT 'Requested' CHECK (status IN ('Requested', 'Approved', 'Processing', 'Completed', 'Rejected', 'Failed')),
  refund_method TEXT NOT NULL DEFAULT 'Razorpay' CHECK (refund_method IN ('Razorpay', 'UPI', 'Bank Transfer', 'Cash Voucher')),
  razorpay_refund_id TEXT,
  razorpay_payment_id TEXT,
  cash_voucher_no TEXT,
  staff_name TEXT,
  staff_signature TEXT,
  created_by TEXT NOT NULL DEFAULT 'System',
  approved_by TEXT,
  rejection_reason TEXT,
  expected_completion_date DATE,
  completed_at TIMESTAMPTZ,
  timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
  ledger_entries JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------------
-- PERFORMANCE INDEXES
-- --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_is_offline ON orders(is_offline_order);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_razorpay_id ON payment_transactions(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_phone ON customer_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_payment_requests_order_id ON payment_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_product ON wishlist_items(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_phone ON wishlist_items(customer_phone);
CREATE INDEX IF NOT EXISTS idx_hero_banners_active ON hero_banners(is_active);
CREATE INDEX IF NOT EXISTS idx_enquiries_phone ON enquiries(customer_phone);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_refunds_phone ON refunds(customer_phone);
CREATE INDEX IF NOT EXISTS idx_refunds_order ON refunds(order_id);

-- --------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES (FULL UNRESTRICTED ANONYMOUS/CLIENT ACCESS)
-- --------------------------------------------------------------------
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Products Access" ON products;
DROP POLICY IF EXISTS "Public Profiles Access" ON customer_profiles;
DROP POLICY IF EXISTS "Public Orders Access" ON orders;
DROP POLICY IF EXISTS "Public Order Items Access" ON order_items;
DROP POLICY IF EXISTS "Public Payments Access" ON payment_transactions;
DROP POLICY IF EXISTS "Public Payment Requests Access" ON payment_requests;
DROP POLICY IF EXISTS "Public Wishlist Access" ON wishlist_items;
DROP POLICY IF EXISTS "Public Stories Access" ON status_stories;
DROP POLICY IF EXISTS "Public Gallery Access" ON admin_gallery;
DROP POLICY IF EXISTS "Public Banners Access" ON admin_banners;
DROP POLICY IF EXISTS "Public Hero Banners Access" ON hero_banners;
DROP POLICY IF EXISTS "Public Enquiries Access" ON enquiries;
DROP POLICY IF EXISTS "Public Refunds Access" ON refunds;

CREATE POLICY "Public Products Access" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Profiles Access" ON customer_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Orders Access" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Order Items Access" ON order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Payments Access" ON payment_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Payment Requests Access" ON payment_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Wishlist Access" ON wishlist_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Stories Access" ON status_stories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Gallery Access" ON admin_gallery FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Banners Access" ON admin_banners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Hero Banners Access" ON hero_banners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Enquiries Access" ON enquiries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Refunds Access" ON refunds FOR ALL USING (true) WITH CHECK (true);

-- --------------------------------------------------------------------
-- REAL SEED INITIAL DATA (MANIKANDAN LATHE STORE & POS COUNTER)
-- --------------------------------------------------------------------

-- 1. Seed Customer Profiles (Admin & Verified Customers)
INSERT INTO customer_profiles (id, name, phone, email, address, district, state, customer_type, notes, role)
VALUES
('cust-admin', 'Chellamuthu K', '9659286268', 'manikandanlatheklm@gmail.com', 'K. Keeranur Road, Kallimandhayam - 624616, Tamil Nadu', 'Dindigul', 'Tamil Nadu', 'VIP', 'Workshop Owner / Master Machinist', 'admin'),
('cust-001', 'Senthil Kumar', '9842188412', 'senthil@example.com', 'Near Bus Stand, Kallimandhayam, Dindigul Dist - 624616', 'Dindigul', 'Tamil Nadu', 'Online', 'Regular agricultural implement customer', 'customer'),
('cust-002', 'Muruganandam P', '9443155120', 'murugan@example.com', 'Ottanchatram Main Road, Dindigul', 'Dindigul', 'Tamil Nadu', 'Offline Walk-in', 'Walk-in shop customer for lathe machine turning works', 'customer');

-- 2. Seed Products
INSERT INTO products (id, name, category, sub_category, price, discount_price, unit, stock, is_ready_stock, is_made_to_order, images, description, specifications, rating, review_count, is_recommended, is_best_selling, is_trending, is_premium, views, badge_text)
VALUES
('prod-1', 'HEAVY DUTY TRACTOR KALAPPAI (5-TINE & 9-TINE)', 'Tractor Kalappai', 'Agricultural Machinery', 48000.00, 45000.00, 'Set', 12, true, true, ARRAY['https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'], 'Precision engineered high-tensile carbon steel Tractor Cultivator (Kalappai) built with forged lathe-machined tines by Chellamuthu K.', '{"material": "Forged Carbon Steel & High Tensile Alloy", "color": "Industrial Black / Safety Orange", "size": "9-Tine Standard (7ft Width)", "weight": "320 kg", "finish": "Rust-Resistant Powder Coat"}'::jsonb, 4.90, 48, true, true, true, true, 1420, 'BEST SELLER'),
('prod-2', 'LUXURY STAINLESS STEEL MAIN SAFETY GATE', 'Gates', 'Architectural Steel', 65000.00, 59000.00, 'Square Foot', 5, false, true, ARRAY['https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'], 'Custom fabricated 304-grade Stainless Steel main entrance gate with laser-cut geometric panels.', '{"material": "SS 304 Grade Heavy Gauge", "color": "Matte Black & Brushed Steel Accent", "size": "12ft x 7ft Custom Fit", "weight": "240 kg", "finish": "Anti-Tarnish Protective Sealant"}'::jsonb, 4.95, 32, true, true, false, true, 980, 'PREMIUM CHOICE'),
('prod-3', 'MODERN LASER-CUT WINDOW SAFETY GRILL', 'Windows Grill', 'Home Security', 8500.00, 7600.00, 'Window Set', 25, true, true, ARRAY['https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'], 'Elegantly styled window security grills fabricated from solid square iron bars.', '{"material": "Solid Wrought Iron 12mm", "color": "Jet Black / Bronze Tint", "size": "4ft x 4ft Standard", "weight": "28 kg", "finish": "Epoxy Anti-Rust Coating"}'::jsonb, 4.80, 64, true, false, false, false, 2100, 'POPULAR'),
('prod-4', 'INDUSTRIAL HEAVY LATHE MACHINE BUSH & SHAFT WORKS', 'Machine Works', 'Precision Turning', 3500.00, 3200.00, 'Piece / Job', 50, true, true, ARRAY['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80'], 'High-precision lathe turned brass & steel bushes, drive shafts, and custom machine components.', '{"material": "Gunmetal / EN8 Carbon Steel / Brass", "color": "Metallic Polished", "size": "Custom Diameter up to 450mm", "weight": "Varies by Job", "finish": "Micro-inch Ground Finish"}'::jsonb, 5.00, 95, false, true, true, false, 3400, 'INDUSTRIAL GRADE');

-- 3. Seed Orders (Online Website Order & Offline Walk-in Counter Order)
INSERT INTO orders (id, order_number, customer_name, customer_phone, customer_address, base_price, reduced_amount, final_price, advance_required, advance_paid, remaining_balance, status, expected_date, is_offline_order)
VALUES
('ord-101', 'ML-2026-0481', 'Senthil Kumar', '9842188412', 'Near Bus Stand, Kallimandhayam, Dindigul Dist - 624616', 48000.00, 3000.00, 45000.00, 5000.00, 5000.00, 15000.00, 'IN_PRODUCTION', '2026-07-30', false),
('ord-102', 'ML-2026-0899', 'Muruganandam P', '9443155120', 'Ottanchatram Main Road, Dindigul', 3500.00, 300.00, 3200.00, 1000.00, 1000.00, 2200.00, 'ACCEPTED', '2026-07-29', true);

-- 4. Seed Order Items
INSERT INTO order_items (order_id, product_id, product_name, image, variant, quantity, unit_price, total_price)
VALUES
('ord-101', 'prod-1', 'HEAVY DUTY TRACTOR KALAPPAI (5-TINE & 9-TINE)', 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80', '{"material": "Forged Carbon Steel", "color": "Safety Orange", "size": "9-Tine"}'::jsonb, 1, 48000.00, 48000.00),
('ord-102', 'prod-4', 'INDUSTRIAL HEAVY LATHE MACHINE BUSH & SHAFT WORKS', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80', '{"material": "Gunmetal", "color": "Metallic Polished", "size": "Custom Shaft"}'::jsonb, 1, 3500.00, 3500.00);

-- 5. Seed Payment Transactions Ledger
INSERT INTO payment_transactions (id, order_id, date, time, amount, mode, collected_by, remaining_balance_after, receipt_number, reference_id)
VALUES
('pay-01', 'ord-101', '2026-07-20', '11:30 AM', 5000.00, 'UPI', 'Chellamuthu K (Admin)', 40000.00, 'RCP-8801', 'UPI/620199481'),
('pay-02', 'ord-101', '2026-07-24', '04:15 PM', 15000.00, 'Cash', 'Chellamuthu K (Admin)', 25000.00, 'RCP-8842', NULL),
('pay-03', 'ord-101', '2026-07-26', '02:00 PM', 10000.00, 'Online', 'Razorpay Gateway', 15000.00, 'RCP-8903', 'pay_P19x82kL90'),
('pay-04', 'ord-102', '2026-07-27', '10:00 AM', 1000.00, 'Cash', 'Chellamuthu K (Admin)', 22000.00, 'RCP-8910', NULL);

-- 6. Seed Status Stories
INSERT INTO status_stories (id, media_url, media_type, title, subtitle, tag, seen_count)
VALUES
('st-1', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80', 'image', '🔥 New Heavy Duty Lathe Turning Work Completed!', 'Custom 450mm precision shaft for industrial customer', 'Work Progress', 84),
('st-2', 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80', 'image', '🚜 Special Tractor Kalappai Ready for Delivery', 'High tensile forged tines with lifetime warranty', 'New Product', 142);

-- 7. Seed Admin Gallery
INSERT INTO admin_gallery (id, title, category, description, media_url, is_featured)
VALUES
('gal-1', 'CNC Laser Cut Stainless Steel Gate Installation', 'Main Gates', 'SS 304 grade safety entrance gate fitted at Kallimandhayam villa.', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', true),
('gal-2', '9-Tine Forged Tractor Kalappai Fabrication', 'Tractor Kalappai', 'Heavy duty cultivator tines forged in Chellamuthu K lathe workshop.', 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80', true);

-- 8. Seed Hero Banners
INSERT INTO hero_banners (id, title, subtitle, tag, image_url, cta_text, cta_link, is_active, display_order)
VALUES
('banner-1', 'TRACTOR KALAPPAI & CULTIVATORS', 'Precision forged lathe-machined tines engineered for tough agricultural soil.', 'AGRICULTURAL MACHINERY', 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1000&q=80', 'Explore Kalappai', '/products', true, 1),
('banner-2', 'HEAVY DUTY STEEL SAFETY GATES', 'Custom laser cut architectural main gates with lifetime anti-rust warranty.', 'HOME ARCHITECTURAL STEEL', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80', 'View Steel Gates', '/products', true, 2),
('banner-3', 'PRECISION LATHE TURNING & REPAIRS', 'Shaft turning, gear welding, tractor axle re-facing & heavy industrial turning.', 'WORKSHOP LATHE SERVICES', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80', 'Custom Order', '/quick-order', true, 3);

-- 9. Seed Admin Promotional Banners
INSERT INTO admin_banners (id, title, subtitle, tag, image)
VALUES
('b-1', 'MANIKANDAN LATHE WORKSHOP', 'Quality lathe machine turning & fabrication services since 25+ years in Kallimandhayam', 'LATHE SPECIALIST', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80');

-- ====================================================================
-- LIVE PRODUCTION & TESTING CRUD REFERENCE QUERIES
-- ====================================================================

-- 1. Fetch All Customer Profiles (Admin Portal)
-- SELECT * FROM customer_profiles ORDER BY created_at DESC;

-- 2. Fetch Customer Profile by Phone Number
-- SELECT * FROM customer_profiles WHERE phone = '9842188412';

-- 3. Upsert Customer Profile
-- INSERT INTO customer_profiles (id, name, phone, email, address, district, state, customer_type, notes)
-- VALUES ('cust-003', 'Kannan V', '9876543210', 'kannan@example.com', 'Kallimandhayam', 'Dindigul', 'Tamil Nadu', 'Offline Walk-in', 'Lathe repair customer')
-- ON CONFLICT (phone) DO UPDATE SET
--   name = EXCLUDED.name,
--   address = EXCLUDED.address,
--   customer_type = EXCLUDED.customer_type,
--   notes = EXCLUDED.notes;

-- 4. Fetch Online Website Orders
-- SELECT * FROM orders WHERE is_offline_order = false ORDER BY created_at DESC;

-- 5. Fetch Offline POS Counter Orders
-- SELECT * FROM orders WHERE is_offline_order = true ORDER BY created_at DESC;

-- 6. Insert New POS Offline Walk-in Counter Order
-- INSERT INTO orders (id, order_number, customer_name, customer_phone, customer_address, base_price, reduced_amount, final_price, advance_required, advance_paid, remaining_balance, status, is_offline_order)
-- VALUES ('ord-999', 'ML-2026-9999', 'Ramesh', '9988776655', 'Dindigul Road', 10000.00, 500.00, 9500.00, 2000.00, 2000.00, 7500.00, 'ACCEPTED', true);

-- 7. Query Total Workshop Revenue Summary (Combined Online + Offline Cash Ledger)
-- SELECT 
--   COUNT(id) AS total_orders,
--   SUM(final_price) AS total_order_value,
--   SUM(advance_paid) AS total_collected_advance,
--   SUM(remaining_balance) AS total_pending_receivables
-- FROM orders;

-- 8. Query Active Enquiries & Quotations
-- SELECT * FROM enquiries WHERE status IN ('ENQUIRY_RECEIVED', 'UNDER_REVIEW', 'QUOTATION_SENT') ORDER BY created_at DESC;

-- 9. Query Active Refunds Ledger
-- SELECT * FROM refunds WHERE status IN ('Requested', 'Approved', 'Processing') ORDER BY created_at DESC;
