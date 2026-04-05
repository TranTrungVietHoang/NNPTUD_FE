import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Layouts
import UserLayout from '../components/Layout/UserLayout';
import AdminLayout from '../components/Layout/AdminLayout';
import ProtectedRoute from '../components/ProtectedRoute';

// Auth pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Customer pages
import HomePage from '../pages/customer/HomePage';
import ProductListPage from '../pages/customer/ProductListPage';
import ProductDetailPage from '../pages/customer/ProductDetailPage';
import CartPage from '../pages/customer/CartPage';
import CheckoutPage from '../pages/customer/CheckoutPage';
import OrderHistoryPage from '../pages/customer/OrderHistoryPage';
import NotificationsPage from '../pages/customer/NotificationsPage';
import ReservationPage from '../pages/customer/ReservationPage';
import ChatPage from '../pages/customer/ChatPage';
import ProfilePage from '../pages/customer/ProfilePage';

// Admin pages
import DashboardPage from '../pages/admin/DashboardPage';
import UserManagementPage from '../pages/admin/UserManagementPage';
import CategoryManagementPage from '../pages/admin/CategoryManagementPage';
import ProductManagementPage from '../pages/admin/ProductManagementPage';
import InventoryPage from '../pages/admin/InventoryPage';
import VoucherManagementPage from '../pages/admin/VoucherManagementPage';
import OrderManagementPage from '../pages/admin/OrderManagementPage';
import PaymentManagementPage from '../pages/admin/PaymentManagementPage';
import SupplierManagementPage from '../pages/admin/SupplierManagementPage';
import UploadExcelPage from '../pages/admin/UploadExcelPage';
import ChatManagementPage from '../pages/admin/ChatManagementPage';
import ReviewManagementPage from '../pages/admin/ReviewManagementPage';

const AdminRedirect = () => {
  const { isAdminOrMod } = useAuth();
  return isAdminOrMod() ? <Navigate to="/admin" replace /> : <Navigate to="/" replace />;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Customer routes */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/reservation" element={<ProtectedRoute><ReservationPage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        </Route>

        {/* Admin routes */}
        <Route element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/categories" element={<CategoryManagementPage />} />
          <Route path="/admin/products" element={<ProductManagementPage />} />
          <Route path="/admin/inventory" element={<InventoryPage />} />
          <Route path="/admin/vouchers" element={<VoucherManagementPage />} />
          <Route path="/admin/orders" element={<OrderManagementPage />} />
          <Route path="/admin/payments" element={<PaymentManagementPage />} />
          <Route path="/admin/suppliers" element={<SupplierManagementPage />} />
          <Route path="/admin/upload-excel" element={<UploadExcelPage />} />
          <Route path="/admin/chat" element={<ChatManagementPage />} />
          <Route path="/admin/reviews" element={<ReviewManagementPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
