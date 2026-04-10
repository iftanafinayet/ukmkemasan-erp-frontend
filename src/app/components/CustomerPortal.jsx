import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, ImagePlus, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import CustomerSidebar from './CustomerSidebar';
import CustomerCartSection from './customer-portal/CustomerCartSection';
import CustomerPortalHomePage from './customer-portal/CustomerPortalHomePage';
import CustomerPortalOrderDetailModal from './customer-portal/CustomerPortalOrderDetailModal';
import CustomerPortalProfileSection from './customer-portal/CustomerPortalProfileSection';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { ENDPOINTS, storage } from '../config/environment';
import api from '../utils/api';
import { buildCatalogGroups } from '../utils/catalog';
import { clearCart, getCartItems, removeCartItem, setCartItems as persistCartItems, subscribeCart } from '../utils/cart';
import { createEmptyLandingContent, normalizeLandingContent } from '../utils/landingContent';
import { EmptyState, LoadingState } from './customer-dashboard/shared';

export default function CustomerPortal() {
  const user = storage.getUser();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const menuFromQuery = searchParams.get('menu') || 'dashboard';

  const [activeMenu, setActiveMenu] = useState(menuFromQuery);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [checkingOutCart, setCheckingOutCart] = useState(false);
  const [stats, setStats] = useState({ total: 0, production: 0, completed: 0 });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [landingContent, setLandingContent] = useState(createEmptyLandingContent);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      switch (activeMenu) {
        case 'dashboard': {
          const [ordersResponse, landingContentResponse] = await Promise.all([
            api.get(ENDPOINTS.MY_ORDERS),
            api.get(ENDPOINTS.LANDING_CONTENT),
          ]);
          const allOrders = ordersResponse.data || [];
          setOrders(allOrders);
          setLandingContent(normalizeLandingContent(landingContentResponse.data));
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
          const response = await api.get(ENDPOINTS.MY_ORDERS);
          setOrders(response.data || []);
          break;
        }
        case 'cart':
          setCartItems(getCartItems());
          break;
        case 'profile':
        case 'settings': {
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
        window.location.href = '/login';
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

  useEffect(() => subscribeCart((items) => setCartItems(items)), []);

  useEffect(() => {
    if (menuFromQuery === activeMenu) return;

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('menu', activeMenu);
    setSearchParams(nextParams, { replace: true });
  }, [activeMenu, menuFromQuery, searchParams, setSearchParams]);

  const formatCurrency = (amount) => {
    if (!amount) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateValue));
  };

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
      onViewAllOrders={() => setActiveMenu('orders')}
      onViewOrder={handleViewOrder}
      orders={orders}
      stats={stats}
    />
  );

  const renderCatalog = () => {
    const catalogGroups = buildCatalogGroups(products);
    const categories = ['All', ...new Set(catalogGroups.map((catalog) => catalog.category).filter(Boolean))];
    const filteredCatalogs = selectedCategory === 'All'
      ? catalogGroups
      : catalogGroups.filter((catalog) => catalog.category === selectedCategory);

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-slate-400">{filteredCatalogs.length} katalog tersedia</p>
          <button
            type="button"
            onClick={() => navigate('/portal/orders/create')}
            className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={16} /> Pesan Sekarang
          </button>
        </div>

        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap rounded-2xl px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all ${
                  selectedCategory === category
                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                    : 'border border-slate-100 bg-white text-slate-500 hover:bg-slate-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCatalogs.map((catalog) => (
            <div
              key={catalog.key}
              className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-100 bg-white transition-shadow hover:shadow-lg"
              onClick={() => navigate(`/portal/orders/create?catalog=${encodeURIComponent(catalog.key)}`)}
            >
              {catalog.images?.length > 0 ? (
                <div className="relative">
                  <Carousel className="w-full" opts={{ loop: true }}>
                    <CarouselContent>
                      {catalog.images.map((image, index) => (
                        <CarouselItem key={index}>
                          <div className="relative aspect-[4/3] overflow-hidden">
                            <img
                              src={image.url}
                              alt={image.alt || catalog.name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 pt-12">
                              <p className="text-[10px] font-black uppercase tracking-widest text-white opacity-80">{catalog.category}</p>
                              <p className="mt-0.5 text-[9px] font-bold text-white/70">{catalog.materialLabel}</p>
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {catalog.images.length > 1 && (
                      <>
                        <CarouselPrevious className="left-2 h-7 w-7 border-0 bg-white/80 shadow-lg backdrop-blur-sm hover:bg-white" />
                        <CarouselNext className="right-2 h-7 w-7 border-0 bg-white/80 shadow-lg backdrop-blur-sm hover:bg-white" />
                      </>
                    )}
                  </Carousel>
                  {catalog.images.length > 1 && (
                    <div className="absolute right-3 top-3 z-10 rounded-lg bg-black/50 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                      {catalog.images.length} foto
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex aspect-[4/3] flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
                  <ImagePlus className="mb-2 h-10 w-10 text-primary/20" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/30">Belum ada foto</p>
                </div>
              )}

              <div className="p-6">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-primary/70">Katalog Varian</p>
                    <h4 className="font-black leading-tight text-slate-800">{catalog.name}</h4>
                    <p className="mt-1 text-[10px] font-bold uppercase text-slate-400">{catalog.category}</p>
                  </div>
                  <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">{catalog.materialLabel}</span>
                </div>
                {catalog.description && (
                  <p className="mb-4 line-clamp-2 text-xs text-slate-400">{catalog.description}</p>
                )}
                <div className="mb-4 flex flex-wrap gap-2">
                  {catalog.availableSizes.slice(0, 4).map((size) => (
                    <span key={size} className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">
                      {size}
                    </span>
                  ))}
                  {catalog.availableSizes.length > 4 && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">
                      +{catalog.availableSizes.length - 4} ukuran
                    </span>
                  )}
                </div>
                <div className="flex items-end justify-between border-t border-slate-100 pt-3">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400">Mulai dari</p>
                    <p className="text-lg font-black text-primary">
                      {formatCurrency(catalog.priceB2B)}
                      <span className="text-[10px] font-bold text-slate-400">/pcs</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400">Varian</p>
                    <p className="text-sm font-black text-slate-600">{catalog.variants.length} opsi</p>
                  </div>
                </div>
                {catalog.addons?.valvePrice > 0 && (
                  <p className="mt-2 text-[10px] font-bold text-primary">+ Valve tersedia ({formatCurrency(catalog.addons.valvePrice)}/pcs)</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredCatalogs.length === 0 && (
          <EmptyState text={`Tidak ada katalog untuk kategori ${selectedCategory}.`} />
        )}
      </div>
    );
  };

  const renderOrders = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-slate-400">{orders.length} pesanan</p>
        <button
          type="button"
          onClick={() => navigate('/portal/orders/create')}
          className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={16} /> Pesan Baru
        </button>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="overflow-x-auto">
          <div className="flex min-w-[720px] items-center justify-between">
            {['Quotation', 'Payment', 'Production', 'Quality Control', 'Shipping', 'Completed'].map((status, index, arr) => {
              const count = orders.filter((order) => order.status === status).length;
              const isActive = count > 0;
              return (
                <React.Fragment key={status}>
                  <div className="flex flex-1 flex-col items-center">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black shadow-sm transition-all ${isActive ? 'scale-110 bg-primary text-white shadow-primary/30' : 'border border-slate-100 bg-slate-50 text-slate-400'}`}>
                      {count}
                    </div>
                    <p className={`mt-3 text-center text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                      {getStatusLabel(status)}
                    </p>
                  </div>
                  {index < arr.length - 1 && (
                    <div className="relative mx-2 h-0.5 flex-1 bg-slate-100">
                      <div className="absolute inset-0 bg-primary/20 opacity-0 transition-opacity" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order._id}
            onClick={() => handleViewOrder(order._id)}
            className="group cursor-pointer rounded-3xl border border-slate-100 bg-white p-6 transition-all hover:border-primary/20 hover:shadow-md"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h4 className="font-black text-slate-800">#{order.orderNumber || order._id.slice(-6)}</h4>
                  <span className={`rounded-full border px-3 py-1 text-[10px] font-black ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                  {order.isPaid && <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-black text-green-600">✓ Lunas</span>}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                  <span className="font-bold">{order.product?.name}</span>
                  <span>{order.details?.quantity?.toLocaleString()} pcs</span>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-lg font-black text-primary">{formatCurrency(order.totalPrice)}</p>
                <ChevronRight size={18} className="mt-1 text-slate-300 transition-colors group-hover:text-primary sm:ml-auto" />
              </div>
            </div>
          </div>
        ))}
        {orders.length === 0 && <EmptyState text="Belum ada pesanan." />}
      </div>
    </div>
  );

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

  const renderProfile = () => (
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

  const renderPage = () => {
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
      default:
        return <EmptyState text="Halaman sedang dikembangkan." />;
    }
  };

  const pageTitle = activeMenu === 'catalog'
    ? 'Katalog Produk'
    : activeMenu === 'orders'
      ? 'Pesanan Saya'
      : activeMenu === 'cart'
        ? 'Keranjang'
        : activeMenu === 'profile' || activeMenu === 'settings'
          ? 'Profil'
          : 'Dashboard';

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-primary/20 lg:h-screen">
      <CustomerSidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="mx-auto max-w-7xl px-4 pb-6 pt-20 sm:px-6 sm:pb-8 lg:p-8">
          <header className="mb-8 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-slate-900 capitalize sm:text-4xl">{pageTitle}</h1>
              <div className="mt-1 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <p className="text-sm font-medium italic text-slate-500">Customer Portal · UKM Kemasan</p>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchData}
              className="self-end rounded-2xl border border-slate-200 bg-white p-4 text-slate-600 shadow-sm transition-all duration-500 hover:rotate-180 hover:bg-slate-100 sm:self-auto"
            >
              <RefreshCw size={24} className={loading ? 'animate-spin text-primary' : ''} />
            </button>
          </header>

          {renderPage()}
        </div>
      </main>

      {isDetailOpen && selectedOrder && (
        <CustomerPortalOrderDetailModal
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          getStatusLabel={getStatusLabel}
          onClose={() => setIsDetailOpen(false)}
          order={selectedOrder}
        />
      )}
    </div>
  );
}
