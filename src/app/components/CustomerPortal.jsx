import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ChevronRight, ImagePlus, Plus, RefreshCw, Filter } from 'lucide-react';
import { toast } from 'sonner';
import CustomerNavbar from './customer-portal/CustomerNavbar';
import CustomerCartSection from './customer-portal/CustomerCartSection';
import CustomerPortalHomePage from './customer-portal/CustomerPortalHomePage';
import CustomerPortalCatalogSection from './customer-portal/CustomerPortalCatalogSection';
import CustomerPortalOrdersSection from './customer-portal/CustomerPortalOrdersSection';
import CustomerPortalOrderDetailModal from './customer-portal/CustomerPortalOrderDetailModal';
import CustomerPortalProfileSection from './customer-portal/CustomerPortalProfileSection';
import CustomerInquiriesSection from './customer-portal/CustomerInquiriesSection';
import CustomerFooter from './CustomerFooter';

// Mobile Components
import MobileHeader from './customer-portal/mobile/MobileHeader';
import MobileBottomNav from './customer-portal/mobile/MobileBottomNav';
import MobileHomePage from './customer-portal/mobile/MobileHomePage';
import MobileCatalogPage from './customer-portal/mobile/MobileCatalogPage';
import MobileOrdersPage from './customer-portal/mobile/MobileOrdersPage';
import MobileOrderDetailPage from './customer-portal/mobile/MobileOrderDetailPage';
import MobileProfilePage from './customer-portal/mobile/MobileProfilePage';
import MobileCartPage from './customer-portal/mobile/MobileCartPage';
import MobilePageSkeleton from './customer-portal/mobile/MobilePageSkeleton';

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { ENDPOINTS, storage } from '../config/environment';
import api from '../utils/api';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import { clearCart, getCartItems, removeCartItem, setCartItems as persistCartItems, subscribeCart } from '../utils/cart';
import { createEmptyLandingContent, normalizeLandingContent } from '../utils/landingContent';
import { EmptyState, LoadingState } from './customer-dashboard/shared';
import useSocket from '../hooks/useSocket';

export default function CustomerPortal() {
  const user = storage.getUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const prefillProduct = location.state?.prefillProduct || null;
  const menuFromQuery = searchParams.get('menu') || 'dashboard';

  const [activeMenu, setActiveMenu] = useState(menuFromQuery);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [checkingOutCart, setCheckingOutCart] = useState(false);
  const [stats, setStats] = useState({ total: 0, production: 0, completed: 0 });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [landingContent, setLandingContent] = useState(createEmptyLandingContent());
  const [popularProducts, setPopularProducts] = useState([]);
  const [orderFilter, setOrderFilter] = useState('all');
  const [unreadCounts, setUnreadCounts] = useState({});
  const unreadHandler = useCallback((data) => {
    setUnreadCounts((prev) => ({ ...prev, [data.conversationId]: data.count }));
  }, []);
  useSocket({ onUnreadCount: unreadHandler });
  const inquiryBadge = Object.values(unreadCounts).reduce((sum, c) => sum + (c || 0), 0);

  const fetchData = useCallback(async () => {
    const token = storage.getToken();
    setLoading(true);
    try {
      switch (activeMenu) {
        case 'dashboard': {
          const promises = [
            api.get(ENDPOINTS.LANDING_CONTENT),
            api.get(ENDPOINTS.POPULAR_PRODUCTS),
          ];

          if (token) {
            promises.unshift(api.get(ENDPOINTS.MY_ORDERS));
          }

          const results = await Promise.all(promises);

          let ordersResponse = { data: [] };
          let landingContentResponse;
          let popularResponse;

          if (token) {
            [ordersResponse, landingContentResponse, popularResponse] = results;
          } else {
            [landingContentResponse, popularResponse] = results;
          }

          const allOrders = ordersResponse.data || [];
          setOrders(allOrders);
          setLandingContent(normalizeLandingContent(landingContentResponse.data));
          setPopularProducts(popularResponse.data || []);
          setStats({
            total: allOrders.length,
            production: allOrders.filter((order) => order.status === 'Production').length,
            completed: allOrders.filter((order) => order.status === 'Completed').length,
          });
          break;
        }
        case 'catalog': {
          const response = await api.get(ENDPOINTS.PRODUCTS);
          setProducts(response.data || []);
          break;
        }
        case 'orders': {
          if (!token) {
            setOrders([]);
            break;
          }
          const response = await api.get(ENDPOINTS.MY_ORDERS);
          setOrders(response.data || []);
          break;
        }
        case 'cart':
          setCartItems(getCartItems());
          break;
        case 'profile':
        case 'settings': {
          if (!token) {
            setProfile({ name: '', email: '', phone: '', address: '' });
            break;
          }
          const response = await api.get(ENDPOINTS.PROFILE);
          setProfile({
            name: response.data.name || '',
            email: response.data.email || '',
            phone: response.data.phone || '',
            address: response.data.address || '',
          });
          break;
        }
        default:
          break;
      }
    } catch (error) {
      if (error.response?.status === 401) {
        storage.clear();
        return;
      }
      toast.error('Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  }, [activeMenu]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setActiveMenu(menuFromQuery);
  }, [menuFromQuery]);

  useEffect(() => {
    if (prefillProduct) {
      window.history.replaceState({}, '');
    }
  }, [prefillProduct]);

  useEffect(() => subscribeCart((items) => setCartItems(items)), []);

  useEffect(() => {
    if (menuFromQuery === activeMenu) return;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('menu', activeMenu);
    setSearchParams(nextParams, { replace: true });
  }, [activeMenu, menuFromQuery, searchParams, setSearchParams]);



  const getStatusColor = (status) => ({
    Quotation: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Payment: 'bg-orange-100 text-orange-700 border-orange-200',
    Production: 'bg-blue-100 text-blue-700 border-blue-200',
    'Quality Control': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    Shipping: 'bg-purple-100 text-purple-700 border-purple-200',
    Completed: 'bg-primary/10 text-primary/90 border-primary/20',
  }[status] || 'bg-slate-100 text-slate-600 border-slate-200');

  const getStatusLabel = (status) => ({
    Quotation: 'Penawaran',
    Payment: 'Pembayaran',
    Production: 'Produksi',
    'Quality Control': 'Quality Control',
    Shipping: 'Pengiriman',
    Completed: 'Selesai',
  }[status] || status);

  const handleViewOrder = async (orderId) => {
    try {
      const response = await api.get(ENDPOINTS.ORDER_BY_ID(orderId));
      setSelectedOrder(response.data);
      setIsDetailOpen(true);
    } catch {
      toast.error('Gagal memuat detail pesanan.');
    }
  };

  const handleNavigateToPayment = (orderId) => {
    navigate(`/portal/orders/${orderId}/payment`);
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const response = await api.put(ENDPOINTS.PROFILE, profile);
      storage.setUser({ _id: response.data._id, name: response.data.name, role: response.data.role });
      toast.success('Profil diperbarui!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan profil.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Password baru tidak cocok.');
      return;
    }

    setSavingPassword(true);
    try {
      await api.put(ENDPOINTS.CHANGE_PASSWORD, {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password diubah!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengubah password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleClearCart = () => {
    clearCart();
    toast.success('Keranjang dikosongkan.');
  };

  const handleRemoveCartItem = (item) => {
    removeCartItem((cartItem) => (
      cartItem.productId === item.productId
      && cartItem.variantId === item.variantId
      && cartItem.useValve === item.useValve
    ));
    toast.success('Item dihapus dari keranjang.');
  };

  const handleCheckoutCart = async () => {
    const token = storage.getToken();
    if (!token) {
      toast.info('Silahkan login terlebih dahulu untuk melakukan checkout.');
      navigate('/login?redirect=/portal?menu=cart');
      return;
    }

    const items = getCartItems();
    if (items.length === 0) {
      toast.error('Keranjang masih kosong.');
      return;
    }

    setCheckingOutCart(true);
    const failedItems = [];
    let successCount = 0;

    try {
      for (const item of items) {
        try {
          await api.post(ENDPOINTS.ORDERS, {
            productId: item.productId,
            variantId: item.variantId || undefined,
            quantity: Number(item.quantity) || 0,
            useValve: Boolean(item.useValve),
          });
          successCount += 1;
        } catch (error) {
          failedItems.push({
            ...item,
            failureMessage: error.response?.data?.message || 'Gagal membuat order untuk item ini.',
          });
        }
      }

      persistCartItems(failedItems);
      setCartItems(failedItems);
      setActiveMenu(successCount > 0 ? 'orders' : 'cart');

      if (successCount > 0 && failedItems.length === 0) {
        toast.success(`Checkout berhasil. ${successCount} order dibuat.`);
      } else if (successCount > 0) {
        toast.warning(`${successCount} order berhasil dibuat, ${failedItems.length} item tetap di keranjang.`);
      } else {
        toast.error('Checkout gagal untuk semua item di keranjang.');
      }

      if (failedItems.length > 0) {
        toast.error(failedItems[0].failureMessage);
      }

      await fetchData();
    } finally {
      setCheckingOutCart(false);
    }
  };

  const renderDashboard = () => (
    <CustomerPortalHomePage
      getStatusColor={getStatusColor}
      getStatusLabel={getStatusLabel}
      landingContent={landingContent}
      onNavigateToCatalog={() => setActiveMenu('catalog')}
      onNavigateToCreateOrder={() => navigate('/portal/orders/create')}
      onNavigateToInquiries={() => setActiveMenu('inquiries')}
      onViewAllOrders={() => setActiveMenu('orders')}
      onViewOrder={handleViewOrder}
      orders={orders}
      stats={stats}
      onViewProduct={(productId) => navigate(`/portal/products/${productId}`)}
      popularProducts={popularProducts}
    />
  );

  const renderCatalog = () => (
    <CustomerPortalCatalogSection
      formatCurrency={formatCurrency}
      onNavigateToCreateOrder={() => navigate('/portal/orders/create')}
      onViewProduct={(productId) => navigate(`/portal/products/${productId}`)}
      products={products}
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
    />
  );

  const renderOrders = () => {
    if (!storage.getToken()) {
      return (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 px-6 py-20 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary">
            <RefreshCw size={40} />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">Login Required</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">Silahkan login untuk melihat riwayat pesanan Anda.</p>
          <button
            onClick={() => navigate('/login?redirect=/portal?menu=orders')}
            data-testid="portal-orders-login-btn"
            className="px-8 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            Masuk Sekarang
          </button>
        </div>
      );
    }

    return (
      <CustomerPortalOrdersSection
        formatCurrency={formatCurrency}
        getStatusLabel={getStatusLabel}
        onNavigateToCreateOrder={() => navigate('/portal/orders/create')}
        onNavigateToPayment={handleNavigateToPayment}
        onViewOrder={handleViewOrder}
        orderFilter={orderFilter}
        orders={orders}
        setOrderFilter={setOrderFilter}
      />
    );
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
  const cartQuantity = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  const renderCart = () => (
    <CustomerCartSection
      cartItems={cartItems}
      cartTotal={cartTotal}
      cartQuantity={cartQuantity}
      checkingOutCart={checkingOutCart}
      formatCurrency={formatCurrency}
      onAddItem={() => navigate('/portal/orders/create')}
      onClearCart={handleClearCart}
      onCheckout={handleCheckoutCart}
      onRemoveItem={handleRemoveCartItem}
    />
  );

  const renderProfile = () => {
    if (!storage.getToken()) {
      return (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 px-6 py-20 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary">
            <Plus size={40} />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">Akses Terbatas</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">Silahkan login untuk mengelola profil dan pengaturan akun Anda.</p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate('/login?redirect=/portal?menu=profile')}
              data-testid="portal-profile-login-btn"
              className="px-8 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              Masuk
            </button>
            <button
              onClick={() => navigate('/register')}
              data-testid="portal-profile-register-btn"
              className="px-8 py-3 bg-slate-100 text-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 active:scale-95 transition-all"
            >
              Daftar
            </button>
          </div>
        </div>
      );
    }

    return (
      <CustomerPortalProfileSection
        onChangePassword={handleChangePassword}
        onSaveProfile={handleSaveProfile}
        passwords={passwords}
        profile={profile}
        savingPassword={savingPassword}
        savingProfile={savingProfile}
        setPasswords={setPasswords}
        setProfile={setProfile}
        user={user}
      />
    );
  };

  const renderMobilePage = () => {
    if (loading) return <MobilePageSkeleton activeMenu={activeMenu} />;

    switch (activeMenu) {
      case 'dashboard':
        return (
          <MobileHomePage
            stats={stats}
            landingContent={landingContent}
            popularProducts={popularProducts}
            user={user || { name: 'Customer' }}
            onViewProduct={(productId) => navigate(`/portal/products/${productId}`)}
            onNavigateToCatalog={() => setActiveMenu('catalog')}
            onNavigateToCreateOrder={() => navigate('/portal/orders/create')}
            onNavigateToInquiries={() => setActiveMenu('inquiries')}
            onViewAllOrders={() => setActiveMenu('orders')}
          />
        );
      case 'catalog':
        return (
          <MobileCatalogPage
            products={products}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            onViewProduct={(productId) => navigate(`/portal/products/${productId}`)}
            isFilterOpen={isMobileFilterOpen}
            setIsFilterOpen={setIsMobileFilterOpen}
          />
        );
      case 'orders':
        return (
          <MobileOrdersPage
            orders={orders}
            orderFilter={orderFilter}
            setOrderFilter={setOrderFilter}
            onViewOrder={handleViewOrder}
            getStatusLabel={getStatusLabel}
          />
        );
      case 'cart':
        return (
          <MobileCartPage
            cartItems={cartItems}
            cartTotal={cartTotal}
            cartQuantity={cartQuantity}
            checkingOutCart={checkingOutCart}
            formatCurrency={formatCurrency}
            onAddItem={() => setActiveMenu('catalog')}
            onClearCart={handleClearCart}
            onRemoveItem={handleRemoveCartItem}
            onCheckout={handleCheckoutCart}
            onBack={() => setActiveMenu('dashboard')}
          />
        );
      case 'profile':
      case 'settings':
        return (
          <MobileProfilePage
            user={user || { name: 'Customer' }}
            profile={profile}
            stats={stats}
            onSaveProfile={handleSaveProfile}
            onChangePassword={handleChangePassword}
            savingProfile={savingProfile}
            savingPassword={savingPassword}
            passwords={passwords}
            setPasswords={setPasswords}
            setProfile={setProfile}
          />
        );
      case 'inquiries':
        return (
          <div className="p-4">
            <CustomerInquiriesSection />
          </div>
        );
      default:
        return <EmptyState text="Halaman sedang dikembangkan." />;
    }
  };

  const renderDesktopPage = () => {
    if (loading) return <LoadingState />;








    switch (activeMenu) {
      case 'dashboard':
        return renderDashboard();
      case 'catalog':
        return renderCatalog();
      case 'orders':
        return renderOrders();
      case 'cart':
        return renderCart();
      case 'profile':
      case 'settings':
        return renderProfile();
      case 'inquiries':
        return <CustomerInquiriesSection prefillProduct={prefillProduct} />;
      default:
        return <EmptyState text="Halaman sedang dikembangkan." />;
    }
  };

  const hasActiveFilters = selectedCategory !== 'All' || selectedSize || selectedColor;

  return (
    <div className="min-h-screen bg-transparent font-sans text-on-surface flex flex-col">
      {/* Desktop View */}
      <div className="hidden lg:flex flex-col flex-1 relative">
        <div
          className="fixed inset-0 -z-10 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "url('/background/bg.svg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
          }}
        />
        <CustomerNavbar activeMenu={activeMenu} onMenuChange={setActiveMenu} inquiryBadge={inquiryBadge} />
        <main className="pt-32 pb-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-12 flex-1 w-full">
          {!['dashboard', 'catalog', 'orders'].includes(activeMenu) && (
            <header className="mb-8 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-start sm:justify-between">
            </header>
          )}

          {renderDesktopPage()}
        </main>
        {['dashboard', 'catalog'].includes(activeMenu) && <CustomerFooter />}
      </div>

      {/* Mobile View */}
      <div className="lg:hidden flex flex-col flex-1 bg-[#faf8ff]">
        <MobileHeader
          onMenuChange={setActiveMenu}
          activeMenu={activeMenu}
          onToggleFilter={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          hasActiveFilters={hasActiveFilters}
        />
        <main className="pt-[52px] pb-[56px] flex-1">
          {renderMobilePage()}
        </main>
        <MobileBottomNav activeMenu={activeMenu} onMenuChange={setActiveMenu} />
      </div>
      {isDetailOpen && selectedOrder && (
        <>
          {/* Mobile Order Detail View */}
          <div className="lg:hidden">
            <MobileOrderDetailPage
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              getStatusLabel={getStatusLabel}
              onBack={() => setIsDetailOpen(false)}
              onOpenPayment={handleNavigateToPayment}
              order={selectedOrder}
            />
          </div>

          {/* Desktop Order Detail Modal */}
          <div className="hidden lg:block">
            <CustomerPortalOrderDetailModal
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              formatDateTime={formatDateTime}
              getStatusLabel={getStatusLabel}
              onClose={() => setIsDetailOpen(false)}
              onOpenPayment={handleNavigateToPayment}
              order={selectedOrder}
            />
          </div>
        </>
      )}
    </div>
  );
}
