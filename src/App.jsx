import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './app/components/LoginPage';
import RegisterPage from './app/components/RegisterPage';
import CustomerDashboard from './app/components/CustomerDashboard';
import CustomerPortal from './app/components/CustomerPortal';
import CreateOrderPage from './app/components/CreateOrderPage';
import ProductDetailPage from './app/components/ProductDetailPage';
import AuthWrapper from './app/components/AuthWrapper';
import { storage } from './app/config/environment';
import { Toaster } from 'sonner';

/**
 * RoleRedirect: redirect ke portal yang sesuai berdasarkan role user
 */
function RoleRedirect() {
  const user = storage.getUser();
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return <Navigate to="/portal" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Rute publik */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin Dashboard — khusus admin */}
        <Route
          path="/admin"
          element={
            <AuthWrapper>
              <CustomerDashboard />
            </AuthWrapper>
          }
        />

        {/* Admin Product Detail */}
        <Route
          path="/admin/products/:id"
          element={
            <AuthWrapper>
              <ProductDetailPage />
            </AuthWrapper>
          }
        />

        {/* Customer Create Order */}
        <Route
          path="/portal/orders/create"
          element={
            <AuthWrapper>
              <CreateOrderPage />
            </AuthWrapper>
          }
        />

        {/* Customer Portal — khusus customer */}
        <Route
          path="/portal"
          element={
            <AuthWrapper>
              <CustomerPortal />
            </AuthWrapper>
          }
        />

        {/* Customer Product Detail */}
        <Route
          path="/portal/products/:id"
          element={
            <AuthWrapper>
              <ProductDetailPage />
            </AuthWrapper>
          }
        />

        {/* Legacy /dashboard redirect berdasarkan role */}
        <Route
          path="/dashboard"
          element={
            <AuthWrapper>
              <RoleRedirect />
            </AuthWrapper>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;