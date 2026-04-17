/**
 * Environment Configuration
 * Konfigurasi untuk berbagai environment (development, production, demo)
 */

// Detect environment
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Environment modes
export const ENV_MODES = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  DEMO: 'demo'
};

// Current environment
export const CURRENT_ENV = isDevelopment
  ? ENV_MODES.DEVELOPMENT
  : ENV_MODES.PRODUCTION;

/**
 * API Configuration
 */
export const API_CONFIG = {
  // Development
  [ENV_MODES.DEVELOPMENT]: {
    baseURL: 'http://localhost:5000/api',
    timeout: 10000,
    withCredentials: false
  },

  // Production
  [ENV_MODES.PRODUCTION]: {
    baseURL: import.meta.env.VITE_API_URL || 'https://ukmkemasan-erp-backend-production.up.railway.app/api',
    timeout: 15000,
    withCredentials: true
  },

  // Demo (using mock data)
  [ENV_MODES.DEMO]: {
    baseURL: '',
    timeout: 1000,
    withCredentials: false
  }
};

/**
 * Get current API config
 */
export const getCurrentAPIConfig = () => {
  return API_CONFIG[CURRENT_ENV];
};

/**
 * Feature Flags
 * Enable/disable features based on environment
 */
export const FEATURES = {
  // Enable demo mode toggle in UI
  DEMO_MODE_TOGGLE: isDevelopment,

  // Enable debug logging
  DEBUG_LOGGING: isDevelopment,

  // Enable error details in UI
  SHOW_ERROR_DETAILS: isDevelopment,

  // Enable mock data
  USE_MOCK_DATA: false, // Set to true to always use mock data

  // Enable analytics
  ANALYTICS: isProduction,

  // Enable notifications
  NOTIFICATIONS: true,

  // Enable auto-refresh
  AUTO_REFRESH: false,
  AUTO_REFRESH_INTERVAL: 30000 // 30 seconds
};

/**
 * Application Constants
 */
export const APP_CONFIG = {
  // App information
  APP_NAME: 'ERP UKM Kemasan',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'Manajemen Produksi Kopi',

  // Branding
  PRIMARY_COLOR: '#4dbace',

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // Token
  TOKEN_KEY: 'token',
  USER_KEY: 'user',
  TOKEN_EXPIRY_KEY: 'tokenExpiry',

  // Session
  SESSION_TIMEOUT: 2 * 60 * 60 * 1000, // 2 hours in milliseconds

  // API retry
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,

  // UI
  TOAST_DURATION: 3000,
  SIDEBAR_WIDTH: 256,

  // Date format
  DATE_FORMAT: 'id-ID',
  CURRENCY_FORMAT: 'IDR'
};

/**
 * Endpoints
 */
export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  PROFILE: '/auth/profile',
  CHANGE_PASSWORD: '/auth/password',

  // Dashboard (Admin)
  DASHBOARD_STATS: '/dashboard/stats',
  DASHBOARD_CATEGORIES: '/dashboard/categories',

  // Orders
  ORDERS: '/orders',
  ALL_ORDERS: '/orders',
  MY_ORDERS: '/orders/myorders',
  ORDER_BY_ID: (id) => `/orders/${id}`,
  UPDATE_ORDER_STATUS: (id) => `/orders/${id}/status`,
  UPDATE_ORDER_DESIGN: (id) => `/orders/${id}/design`,

  // Sales
  SALES_OVERVIEW: '/sales/overview',
  SALES_INVOICES: '/sales/invoices',
  SALES_PAYMENTS: '/sales/payments',
  SALES_RETURNS: '/sales/returns',
  PAYMENT_ORDER: (orderId) => `/payments/orders/${orderId}`,
  MIDTRANS_SNAP_TOKEN: (orderId) => `/payments/orders/${orderId}/midtrans/token`,

  // Products
  PRODUCTS: '/products',
  POPULAR_PRODUCTS: '/products/popular',
  PRODUCT_BY_ID: (id) => `/products/${id}`,

  // Landing Content
  LANDING_CONTENT: '/landing-content',

  // Customers
  CUSTOMERS: '/customers',
  CUSTOMER_BY_ID: (id) => `/customers/${id}`,

  // Inventory logic
  INVENTORY_PRODUCTS: '/inventory/products',
  WAREHOUSES: '/inventory/warehouses',
  WAREHOUSE_BY_ID: (id) => `/inventory/warehouses/${id}`,
  ADJUSTMENTS: '/inventory/adjustments',
  STOCK_CARDS: (productId) => `/inventory/stock-cards/${productId}`
};

/**
 * Status Options
 */
export const ORDER_STATUS = {
  QUOTATION: 'Quotation',
  PAYMENT: 'Payment',
  PRODUCTION: 'Production',
  QUALITY_CONTROL: 'Quality Control',
  SHIPPING: 'Shipping',
  COMPLETED: 'Completed'
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.QUOTATION]: 'Penawaran',
  [ORDER_STATUS.PAYMENT]: 'Pembayaran',
  [ORDER_STATUS.PRODUCTION]: 'Produksi',
  [ORDER_STATUS.QUALITY_CONTROL]: 'Quality Control',
  [ORDER_STATUS.SHIPPING]: 'Pengiriman',
  [ORDER_STATUS.COMPLETED]: 'Selesai'
};

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.QUOTATION]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300'
  },
  [ORDER_STATUS.PAYMENT]: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-300'
  },
  [ORDER_STATUS.PRODUCTION]: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300'
  },
  [ORDER_STATUS.QUALITY_CONTROL]: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
    border: 'border-indigo-300'
  },
  [ORDER_STATUS.SHIPPING]: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300'
  },
  [ORDER_STATUS.COMPLETED]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300'
  }
};

/**
 * Debug logger
 */
export const debugLog = (...args) => {
  if (FEATURES.DEBUG_LOGGING) {
    console.log('[ERP Debug]', ...args);
  }
};

/**
 * Get full API URL
 */
export const getAPIUrl = (endpoint) => {
  const config = getCurrentAPIConfig();
  return `${config.baseURL}${endpoint}`;
};

/**
 * Storage helpers
 */
const getStoredTokenExpiry = () => {
  const expiry = localStorage.getItem(APP_CONFIG.TOKEN_EXPIRY_KEY);
  return expiry ? Number(expiry) : null;
};

const isSessionExpired = (expiry = getStoredTokenExpiry()) => {
  if (!expiry || Number.isNaN(expiry)) {
    return false;
  }

  return Date.now() >= expiry;
};

const clearStoredSession = () => {
  localStorage.removeItem(APP_CONFIG.TOKEN_KEY);
  localStorage.removeItem(APP_CONFIG.USER_KEY);
  localStorage.removeItem(APP_CONFIG.TOKEN_EXPIRY_KEY);
};

export const storage = {
  getToken: () => {
    const token = localStorage.getItem(APP_CONFIG.TOKEN_KEY);
    const expiry = getStoredTokenExpiry();

    if (!token) {
      return null;
    }

    // Backfill expiry for older sessions created before token expiry existed.
    if (!expiry) {
      const newExpiry = Date.now() + APP_CONFIG.SESSION_TIMEOUT;
      localStorage.setItem(APP_CONFIG.TOKEN_EXPIRY_KEY, String(newExpiry));
      return token;
    }

    if (isSessionExpired(expiry)) {
      clearStoredSession();
      return null;
    }

    return token;
  },
  setToken: (token) => {
    localStorage.setItem(APP_CONFIG.TOKEN_KEY, token);
    localStorage.setItem(
      APP_CONFIG.TOKEN_EXPIRY_KEY,
      String(Date.now() + APP_CONFIG.SESSION_TIMEOUT)
    );
  },
  removeToken: () => {
    localStorage.removeItem(APP_CONFIG.TOKEN_KEY);
    localStorage.removeItem(APP_CONFIG.TOKEN_EXPIRY_KEY);
  },
  getTokenExpiry: () => {
    const token = localStorage.getItem(APP_CONFIG.TOKEN_KEY);
    const expiry = getStoredTokenExpiry();

    if (!token || !expiry) {
      return null;
    }

    if (isSessionExpired(expiry)) {
      clearStoredSession();
      return null;
    }

    return expiry;
  },

  getUser: () => {
    const expiry = getStoredTokenExpiry();

    if (expiry && isSessionExpired(expiry)) {
      clearStoredSession();
      return null;
    }

    const user = localStorage.getItem(APP_CONFIG.USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  setUser: (user) => localStorage.setItem(APP_CONFIG.USER_KEY, JSON.stringify(user)),
  removeUser: () => localStorage.removeItem(APP_CONFIG.USER_KEY),

  clear: clearStoredSession
};

/**
 * Export all config as default
 */
export default {
  ENV_MODES,
  CURRENT_ENV,
  API_CONFIG,
  FEATURES,
  APP_CONFIG,
  ENDPOINTS,
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  getCurrentAPIConfig,
  debugLog,
  getAPIUrl,
  storage
};
