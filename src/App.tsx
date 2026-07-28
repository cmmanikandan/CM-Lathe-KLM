import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { OrderProvider } from './context/OrderContext';
import { StatusProvider } from './context/StatusContext';
import { EnquiryProvider } from './context/EnquiryContext';
import { RefundProvider } from './context/RefundContext';

// Layouts
import { CustomerLayout } from './components/layout/CustomerLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { InstallPWAPrompt } from './components/common/InstallPWAPrompt';
import { SplashScreen } from './components/common/SplashScreen';

// Public Marketing Website Pages
import { PublicLandingPage } from './pages/landing/PublicLandingPage';
import { PublicAboutPage } from './pages/about/PublicAboutPage';
import { PublicServicesPage } from './pages/services/PublicServicesPage';
import { PublicGalleryPage } from './pages/gallery/PublicGalleryPage';
import { PublicContactPage } from './pages/contact/PublicContactPage';
import { PublicProductCatalogPage } from './pages/products/PublicProductCatalogPage';
import { PublicProductDetailPage } from './pages/products/PublicProductDetailPage';
import { PwaDemoPage } from './pages/pwa/PwaDemoPage';
import { PublicInvoicePage } from './pages/invoice/PublicInvoicePage';
import { PublicThermalReceiptPage } from './pages/invoice/PublicThermalReceiptPage';

// Customer Panel Application Pages (/customer/*)
import { CustomerHomePage } from './pages/customer/CustomerHomePage';
import { CustomerProductsPage } from './pages/customer/CustomerProductsPage';
import { ProductDetailPage } from './pages/products/ProductDetailPage';
import { CustomerOrdersPage } from './pages/customer/CustomerOrdersPage';
import { CustomerEnquiriesPage } from './pages/customer/CustomerEnquiriesPage';
import { CustomerRefundsPage } from './pages/customer/CustomerRefundsPage';
import { CustomerStatusPage } from './pages/customer/CustomerStatusPage';
import { CustomerProfilePage } from './pages/customer/CustomerProfilePage';
import { CustomerNotificationsPage } from './pages/customer/CustomerNotificationsPage';
import { CustomerGalleryPage } from './pages/gallery/CustomerGalleryPage';
import { CustomerWishlistPage } from './pages/customer/CustomerWishlistPage';
import { OrderDetailPage } from './pages/customer/OrderDetailPage';

// Clean Authentication Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { ProfileCompletionWizard } from './pages/auth/ProfileCompletionWizard';

// Admin Portal Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminEnquiriesPage } from './pages/admin/AdminEnquiriesPage';
import { AdminRefundsPage } from './pages/admin/AdminRefundsPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminOfflineOrderPage } from './pages/admin/AdminOfflineOrderPage';
import { AdminStatusPage } from './pages/admin/AdminStatusPage';
import { AdminGalleryPage } from './pages/admin/AdminGalleryPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminQuickOrderPage } from './pages/admin/AdminQuickOrderPage';
import { AdminDraftOrdersPage } from './pages/admin/AdminDraftOrdersPage';
import { AdminTodayOfflineOrdersPage } from './pages/admin/AdminTodayOfflineOrdersPage';
import { AdminOfflineOrderDetailPage } from './pages/admin/AdminOfflineOrderDetailPage';
import { AdminOrderDetailPage } from './pages/admin/AdminOrderDetailPage';

// Product Catalog Sub-pages
import { AdminCategoriesPage } from './pages/admin/catalog/AdminCategoriesPage';
import { AdminMaterialsPage } from './pages/admin/catalog/AdminMaterialsPage';
import { AdminVariantsPage } from './pages/admin/catalog/AdminVariantsPage';
import { AdminInventoryPage } from './pages/admin/catalog/AdminInventoryPage';
import { AdminReviewsPage } from './pages/admin/catalog/AdminReviewsPage';
import { AdminWishlistPage } from './pages/admin/catalog/AdminWishlistPage';
import { AdminMediaGalleryPage } from './pages/admin/catalog/AdminMediaGalleryPage';
import { AdminImportExportPage } from './pages/admin/catalog/AdminImportExportPage';




// Protected Admin Guard
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role, isLoggedIn } = useAuth();
  if (!isLoggedIn || role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }
  return <AdminLayout>{children}</AdminLayout>;
};

// Protected Customer Auth Guard Wrapper (/customer/*)
const ProtectedCustomerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <CustomerLayout>{children}</CustomerLayout>;
};

const AppContent: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Routes>
        {/* 1. PUBLIC MARKETING WEBSITE ROUTES (No Login Required) */}
        <Route path="/" element={<PublicLandingPage />} />
        <Route path="/about" element={<PublicAboutPage />} />
        <Route path="/services" element={<PublicServicesPage />} />
        <Route path="/products" element={<PublicProductCatalogPage />} />
        <Route path="/products/:id" element={<PublicProductDetailPage />} />
        <Route path="/gallery" element={<PublicGalleryPage />} />
        <Route path="/contact" element={<PublicContactPage />} />

        {/* PUBLIC SECURE INVOICE & RECEIPT ROUTES */}
        <Route path="/invoice/:id" element={<PublicInvoicePage />} />
        <Route path="/r/:id" element={<PublicThermalReceiptPage />} />
        <Route path="/pwa-demo" element={<PwaDemoPage />} />
        <Route path="/pwa" element={<Navigate to="/pwa-demo" replace />} />
        <Route path="/download" element={<Navigate to="/pwa-demo" replace />} />
        <Route path="/app" element={<Navigate to="/pwa-demo" replace />} />
        <Route path="/demo-pwa" element={<Navigate to="/pwa-demo" replace />} />

        {/* 2. CLEAN AUTHENTICATION PAGES */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/profile-setup" element={<ProfileCompletionWizard />} />

        {/* 3. PRIVATE CUSTOMER PANEL ROUTES (/customer/*) (Requires Auth Guard) */}
        <Route path="/customer" element={<ProtectedCustomerRoute><CustomerHomePage /></ProtectedCustomerRoute>} />
        <Route path="/customer/home" element={<ProtectedCustomerRoute><CustomerHomePage /></ProtectedCustomerRoute>} />
        <Route path="/customer/products" element={<ProtectedCustomerRoute><CustomerProductsPage /></ProtectedCustomerRoute>} />
        <Route path="/customer/products/:id" element={<ProtectedCustomerRoute><ProductDetailPage /></ProtectedCustomerRoute>} />
        <Route path="/customer/orders" element={<ProtectedCustomerRoute><CustomerOrdersPage /></ProtectedCustomerRoute>} />
        <Route path="/customer/orders/:id" element={<ProtectedCustomerRoute><OrderDetailPage /></ProtectedCustomerRoute>} />
        <Route path="/customer/enquiries" element={<ProtectedCustomerRoute><CustomerEnquiriesPage /></ProtectedCustomerRoute>} />
        <Route path="/customer/refunds" element={<ProtectedCustomerRoute><CustomerRefundsPage /></ProtectedCustomerRoute>} />
        <Route path="/customer/status" element={<ProtectedCustomerRoute><CustomerStatusPage /></ProtectedCustomerRoute>} />
        <Route path="/customer/gallery" element={<ProtectedCustomerRoute><CustomerGalleryPage /></ProtectedCustomerRoute>} />
        <Route path="/customer/wishlist" element={<ProtectedCustomerRoute><CustomerWishlistPage /></ProtectedCustomerRoute>} />
        <Route path="/customer/notifications" element={<ProtectedCustomerRoute><CustomerNotificationsPage /></ProtectedCustomerRoute>} />
        <Route path="/customer/profile" element={<ProtectedCustomerRoute><CustomerProfilePage /></ProtectedCustomerRoute>} />

        {/* LEGACY COMPATIBILITY REDIRECTS */}
        <Route path="/my-orders" element={<Navigate to="/customer/orders" replace />} />
        <Route path="/order/:id" element={<Navigate to="/customer/orders" replace />} />
        <Route path="/status" element={<Navigate to="/customer/status" replace />} />
        <Route path="/profile" element={<Navigate to="/customer/profile" replace />} />

        {/* 4. ADMIN PORTAL ROUTES */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboardPage /></ProtectedAdminRoute>} />
        <Route path="/admin/enquiries" element={<ProtectedAdminRoute><AdminEnquiriesPage /></ProtectedAdminRoute>} />
        <Route path="/admin/orders" element={<ProtectedAdminRoute><AdminOrdersPage /></ProtectedAdminRoute>} />
        <Route path="/admin/orders/:orderId" element={<ProtectedAdminRoute><AdminOrderDetailPage /></ProtectedAdminRoute>} />
        <Route path="/admin/refunds" element={<ProtectedAdminRoute><AdminRefundsPage /></ProtectedAdminRoute>} />

        <Route path="/admin/customers" element={<ProtectedAdminRoute><AdminCustomersPage /></ProtectedAdminRoute>} />
        <Route path="/admin/products" element={<ProtectedAdminRoute><AdminProductsPage /></ProtectedAdminRoute>} />
        <Route path="/admin/categories" element={<ProtectedAdminRoute><AdminCategoriesPage /></ProtectedAdminRoute>} />
        <Route path="/admin/materials" element={<ProtectedAdminRoute><AdminMaterialsPage /></ProtectedAdminRoute>} />
        <Route path="/admin/variants" element={<ProtectedAdminRoute><AdminVariantsPage /></ProtectedAdminRoute>} />
        <Route path="/admin/inventory" element={<ProtectedAdminRoute><AdminInventoryPage /></ProtectedAdminRoute>} />
        <Route path="/admin/reviews" element={<ProtectedAdminRoute><AdminReviewsPage /></ProtectedAdminRoute>} />
        <Route path="/admin/wishlist" element={<ProtectedAdminRoute><AdminWishlistPage /></ProtectedAdminRoute>} />
        <Route path="/admin/media-gallery" element={<ProtectedAdminRoute><AdminMediaGalleryPage /></ProtectedAdminRoute>} />
        <Route path="/admin/import-export" element={<ProtectedAdminRoute><AdminImportExportPage /></ProtectedAdminRoute>} />

        <Route path="/admin/offline-order" element={<Navigate to="/admin/offline-orders/advanced" replace />} />
        <Route path="/admin/offline-orders" element={<Navigate to="/admin/offline-orders/today" replace />} />
        <Route path="/admin/offline-orders/quick" element={<ProtectedAdminRoute><AdminQuickOrderPage /></ProtectedAdminRoute>} />
        <Route path="/admin/offline-orders/advanced" element={<ProtectedAdminRoute><AdminOfflineOrderPage /></ProtectedAdminRoute>} />
        <Route path="/admin/offline-orders/today" element={<ProtectedAdminRoute><AdminTodayOfflineOrdersPage /></ProtectedAdminRoute>} />
        <Route path="/admin/offline-orders/all" element={<ProtectedAdminRoute><AdminTodayOfflineOrdersPage showAllSources={true} /></ProtectedAdminRoute>} />
        <Route path="/admin/offline-orders/drafts" element={<ProtectedAdminRoute><AdminDraftOrdersPage /></ProtectedAdminRoute>} />
        <Route path="/admin/offline-orders/:id" element={<ProtectedAdminRoute><AdminOfflineOrderDetailPage /></ProtectedAdminRoute>} />

        <Route path="/admin/status" element={<ProtectedAdminRoute><AdminStatusPage /></ProtectedAdminRoute>} />
        <Route path="/admin/gallery" element={<ProtectedAdminRoute><AdminGalleryPage /></ProtectedAdminRoute>} />
        <Route path="/admin/reports" element={<ProtectedAdminRoute><AdminReportsPage /></ProtectedAdminRoute>} />
        <Route path="/admin/payments" element={<ProtectedAdminRoute><AdminPaymentsPage /></ProtectedAdminRoute>} />


        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <InstallPWAPrompt />
    </>
  );
};

export function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <OrderProvider>
          <RefundProvider>
            <EnquiryProvider>
              <StatusProvider>
                <Router>
                  <SplashScreen />
                  <AppContent />
                </Router>
              </StatusProvider>
            </EnquiryProvider>
          </RefundProvider>
        </OrderProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;
