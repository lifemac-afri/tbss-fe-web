import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './components/Toast';
import { AdminProvider } from './context/AdminContext';
import { RealtimeProvider } from './context/RealtimeContext';
import ErrorBoundary from './components/ErrorBoundary';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';

import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import ShopPage from './pages/shop/ShopPage';
import BestsellersPage from './pages/BestsellersPage';
import CommunityPage from './pages/community/CommunityPage';
import BlogPage from './pages/blog/BlogPage';
import BlogArticlePage from './pages/blog/BlogArticlePage';
import ClubDetailPage from './pages/community/ClubDetailPage';
import ReadingPlanPage from './pages/services/ReadingPlanPage';
import BookDetailPage from './pages/book/BookDetailPage';
import WishlistPage from './pages/WishlistPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import GoogleCallbackPage from './pages/auth/GoogleCallbackPage';

import DashboardPage from './pages/dashboard/DashboardPage';
import OrdersPage from './pages/dashboard/OrdersPage';
import WishlistDashPage from './pages/dashboard/WishlistDashPage';
import BookClubsDashPage from './pages/dashboard/BookClubsDashPage';
import ReadingPlansDashPage from './pages/dashboard/ReadingPlansDashPage';
import NotificationsPage from './pages/dashboard/NotificationsPage';
import AddressesPage from './pages/dashboard/AddressesPage';
import AccountSettingsPage from './pages/dashboard/AccountSettingsPage';

import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import ProductsAdminPage from './pages/admin/ProductsAdminPage';
import CategoriesAdminPage from './pages/admin/CategoriesAdminPage';
import OrdersAdminPage from './pages/admin/OrdersAdminPage';
import UsersAdminPage from './pages/admin/UsersAdminPage';
import AdminStaffPage from './pages/admin/AdminStaffPage';
import AdminAuditLogPage from './pages/admin/AdminAuditLogPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import BlogAdminPage from './pages/admin/BlogAdminPage';
import ReadingPlansAdminPage from './pages/admin/ReadingPlansAdminPage';
import BookClubsAdminPage from './pages/admin/BookClubsAdminPage';
import SectionsAdminPage from './pages/admin/SectionsAdminPage';
import ReviewsAdminPage from './pages/admin/ReviewsAdminPage';
import DealsAdminPage from './pages/admin/DealsAdminPage';
import NewsletterAdminPage from './pages/admin/NewsletterAdminPage';
import AcceptInvitePage from './pages/auth/AcceptInvitePage';
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage';
import TermsPage from './pages/legal/TermsPage';

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ToastProvider>
                <RealtimeProvider>
                <BrowserRouter>
                  <ScrollToTop />
                  <Routes>
                    {/* Public Routes — Main Layout */}
                    <Route element={<MainLayout />}>
                      <Route index element={<HomePage />} />
                      <Route path="shop" element={<ShopPage />} />
                      <Route path="search" element={<ShopPage />} />
                      <Route path="bestsellers" element={<BestsellersPage />} />
                      <Route path="community" element={<CommunityPage />} />
                      <Route path="community/book-clubs/:slug" element={<ClubDetailPage />} />
                      <Route path="blog" element={<BlogPage />} />
                      <Route path="blog/:slug" element={<BlogArticlePage />} />
                      <Route path="books/:id" element={<BookDetailPage />} />
                      <Route path="services/reading-plan" element={<ReadingPlanPage />} />
                      <Route path="wishlist" element={<WishlistPage />} />
                      <Route path="cart" element={<CartPage />} />
                      <Route path="privacy" element={<PrivacyPolicyPage />} />
                      <Route path="terms" element={<TermsPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Route>

                    {/* Checkout — standalone (no nav/footer) */}
                    <Route path="checkout" element={<CheckoutPage />} />

                    {/* Google OAuth callback — no layout wrapper needed */}
                    <Route path="auth/callback" element={<GoogleCallbackPage />} />

                    {/* Auth Routes — Auth Layout */}
                    <Route element={<AuthLayout />}>
                      <Route path="login" element={<LoginPage />} />
                      <Route path="register" element={<RegisterPage />} />
                      <Route path="verify-email" element={<VerifyEmailPage />} />
                      <Route path="forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="reset-password" element={<ResetPasswordPage />} />
                    </Route>

                    {/* Dashboard Routes — Protected */}
                    <Route
                      path="dashboard"
                      element={
                        <ProtectedRoute>
                          <DashboardLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<DashboardPage />} />
                      <Route path="orders" element={<OrdersPage />} />
                      <Route path="wishlist" element={<WishlistDashPage />} />
                      <Route path="book-clubs" element={<BookClubsDashPage />} />
                      <Route path="reading-plans" element={<ReadingPlansDashPage />} />
                      <Route path="notifications" element={<NotificationsPage />} />
                      <Route path="addresses" element={<AddressesPage />} />
                      <Route path="account" element={<AccountSettingsPage />} />
                    </Route>

                    {/* Admin Routes — Admin Only */}
                    <Route
                      path="admin"
                      element={
                        <AdminRoute>
                          <AdminProvider>
                            <AdminLayout />
                          </AdminProvider>
                        </AdminRoute>
                      }
                    >
                      <Route index element={<AdminOverviewPage />} />
                      <Route path="products" element={<ProductsAdminPage />} />
                      <Route path="reviews" element={<ReviewsAdminPage />} />
                      <Route path="categories" element={<CategoriesAdminPage />} />
                      <Route path="orders" element={<OrdersAdminPage />} />
                      <Route path="customers" element={<UsersAdminPage />} />
                      <Route path="users" element={<UsersAdminPage />} />
                      <Route path="staff" element={<AdminStaffPage />} />
                      <Route path="audit-log" element={<AdminAuditLogPage />} />
                      <Route path="settings" element={<AdminSettingsPage />} />
                      <Route path="blog" element={<BlogAdminPage />} />
                      <Route path="reading-plans" element={<ReadingPlansAdminPage />} />
                      <Route path="book-clubs" element={<BookClubsAdminPage />} />
                      <Route path="sections" element={<SectionsAdminPage />} />
                      <Route path="deals" element={<DealsAdminPage />} />
                      <Route path="newsletter" element={<NewsletterAdminPage />} />
                    </Route>

                    {/* Staff invite accept — outside admin layout, no auth required */}
                    <Route path="accept-invite" element={<AcceptInvitePage />} />
                  </Routes>
                </BrowserRouter>
                </RealtimeProvider>
              </ToastProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
