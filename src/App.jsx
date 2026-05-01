import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import LoginPage from './app/components/LoginPage';
import RegisterPage from './app/components/RegisterPage';
import CustomerDashboard from './app/components/CustomerDashboard';
import CustomerPortal from './app/components/CustomerPortal';
import CreateOrderPage from './app/components/CreateOrderPage';
import ProductDetailPage from './app/components/ProductDetailPage';
import CustomerPaymentPage from './app/components/customer-portal/CustomerPaymentPage';
import AuthWrapper from './app/components/AuthWrapper';
import SplashScreen from './app/components/SplashScreen';
import { storage } from './app/config/environment';
import { Toaster, toast } from 'sonner';

/**
 * RoleRedirect: redirect ke portal yang sesuai berdasarkan role user
 */
function RoleRedirect() {
  const user = storage.getUser();
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  // Default ke portal (bisa untuk guest)
  return <Navigate to="/portal" replace />;
}

const AUTH_ROUTE_ORDER = {
  '/login': 0,
  '/register': 1,
};

const authPageVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '6%' : '-6%',
  }),
  center: {
    x: 0,
  },
  exit: (direction) => ({
    x: direction > 0 ? '-4%' : '4%',
  }),
};

const authPageTransition = {
  x: {
    type: 'tween',
    duration: 0.92,
    ease: [0.16, 1, 0.3, 1],
  },
};

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const previousAuthIndex = useRef(AUTH_ROUTE_ORDER[location.pathname] ?? 0);
  const isAuthRoute = Object.prototype.hasOwnProperty.call(AUTH_ROUTE_ORDER, location.pathname);
  const currentAuthIndex = AUTH_ROUTE_ORDER[location.pathname] ?? previousAuthIndex.current;
  const direction = currentAuthIndex >= previousAuthIndex.current ? 1 : -1;

  useEffect(() => {
    if (Object.prototype.hasOwnProperty.call(AUTH_ROUTE_ORDER, location.pathname)) {
      previousAuthIndex.current = AUTH_ROUTE_ORDER[location.pathname];
    }
  }, [location.pathname]);

  useEffect(() => {
    const expiry = storage.getTokenExpiry();

    if (!expiry) {
      return undefined;
    }

    const remainingTime = expiry - Date.now();

    if (remainingTime <= 0) {
      storage.clear();
      if (!isAuthRoute) {
        toast.error('Your session has expired. Please sign in again.');
        navigate('/login', { replace: true });
      }
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      storage.clear();
      toast.error('Your session has expired. Please sign in again.');
      navigate('/login', { replace: true });
    }, remainingTime);

    return () => window.clearTimeout(timeoutId);
  }, [isAuthRoute, location.pathname, navigate]);

  const routes = (
    <Routes location={location}>
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

      <Route
        path="/portal/orders/:id/payment"
        element={
          <AuthWrapper>
            <CustomerPaymentPage />
          </AuthWrapper>
        }
      />

      {/* Customer Portal — khusus customer */}
      <Route
        path="/portal"
        element={<CustomerPortal />}
      />

      {/* Customer Product Detail */}
      <Route
        path="/portal/products/:id"
        element={<ProductDetailPage />}
      />

      {/* Legacy /dashboard redirect berdasarkan role */}
      <Route
        path="/dashboard"
        element={<RoleRedirect />}
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/portal" replace />} />
      <Route path="*" element={<Navigate to="/portal" replace />} />
    </Routes>
  );

  if (!isAuthRoute) {
    return routes;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        <motion.div
          key={location.pathname}
          custom={direction}
          variants={authPageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={authPageTransition}
          className="absolute inset-0 overflow-y-auto will-change-transform"
        >
          {routes}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <AnimatePresence>
        {isLoading && <SplashScreen key="splash" />}
      </AnimatePresence>
      {!isLoading && <AppRoutes />}
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
