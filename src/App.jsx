import React, { useEffect, useState, lazy, Suspense } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthWrapper from './app/components/AuthWrapper';
import SplashScreen from './app/components/SplashScreen';
import { storage } from './app/config/environment';
import { Toaster, toast } from 'sonner';

const LoginPage = lazy(() => import('./app/components/LoginPage'));
const RegisterPage = lazy(() => import('./app/components/RegisterPage'));
const CustomerDashboard = lazy(() => import('./app/components/CustomerDashboard'));
const CustomerPortal = lazy(() => import('./app/components/CustomerPortal'));
const CreateOrderPage = lazy(() => import('./app/components/CreateOrderPage'));
const ProductDetailPage = lazy(() => import('./app/components/ProductDetailPage'));
const CustomerPaymentPage = lazy(() => import('./app/components/customer-portal/CustomerPaymentPage'));

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
  const isAuthRoute = Object.prototype.hasOwnProperty.call(AUTH_ROUTE_ORDER, location.pathname);
  const [direction, setDirection] = useState(1);
  const [prevPath, setPrevPath] = useState(location.pathname);

  if (location.pathname !== prevPath) {
    const isAuth = Object.prototype.hasOwnProperty.call(AUTH_ROUTE_ORDER, location.pathname);
    const wasAuth = Object.prototype.hasOwnProperty.call(AUTH_ROUTE_ORDER, prevPath);
    
    if (isAuth) {
      const currentAuthIndex = AUTH_ROUTE_ORDER[location.pathname];
      const previousAuthIndexValue = wasAuth ? AUTH_ROUTE_ORDER[prevPath] : 0;
      setDirection(currentAuthIndex >= previousAuthIndexValue ? 1 : -1);
    }
    setPrevPath(location.pathname);
  }

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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Loading Page...</p>
      </div>
    </div>}>
      <Routes location={location}>
        {/* Rute publik */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin Dashboard — khusus admin */}
        <Route
          path="/admin"
          element={
            <AuthWrapper adminOnly>
              <CustomerDashboard />
            </AuthWrapper>
          }
        />

        {/* Admin Product Detail */}
        <Route
          path="/admin/products/:id"
          element={
            <AuthWrapper adminOnly>
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
    </Suspense>
  );

  if (!isAuthRoute) {
    return routes;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        <Motion.div
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
        </Motion.div>
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
