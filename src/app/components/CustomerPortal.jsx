import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, ImagePlus, Plus, RefreshCw, Filter } from 'lucide-react';
import { toast } from 'sonner';
import CustomerNavbar from './customer-portal/CustomerNavbar';
import CustomerCartSection from './customer-portal/CustomerCartSection';
import CustomerPortalHomePage from './customer-portal/CustomerPortalHomePage';
import CustomerPortalOrderDetailModal from './customer-portal/CustomerPortalOrderDetailModal';
import CustomerPortalProfileSection from './customer-portal/CustomerPortalProfileSection';
import CustomerFooter from './CustomerFooter';
import FilterOverlay from './FilterOverlay';
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [landingContent, setLandingContent] = useState(createEmptyLandingContent);
  const [popularProducts, setPopularProducts] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      switch (activeMenu) {
        case 'dashboard': {
          const [ordersResponse, landingContentResponse, popularResponse] = await Promise.all([
            api.get(ENDPOINTS.MY_ORDERS),
            api.get(ENDPOINTS.LANDING_CONTENT),
            api.get(ENDPOINTS.POPULAR_PRODUCTS),
          ]);
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
      popularProducts={popularProducts}
    />
  );

  const renderCatalog = () => {
    const catalogGroups = buildCatalogGroups(products);
    const categories = ['All', ...new Set(catalogGroups.map((catalog) => catalog.category).filter(Boolean))];
    const filteredCatalogs = selectedCategory === 'All'
      ? catalogGroups
      : catalogGroups.filter((catalog) => catalog.category === selectedCategory);

    return (
      <div className="space-y-12 animate-in fade-in duration-500">
        <header className="mb-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">
            Katalog <span className="text-primary italic">Produk</span>
          </h1>
          <p className="text-on-secondary-container max-w-2xl text-base font-medium leading-relaxed font-body">
            Eksplorasi pilihan kemasan kami. Temukan yang paling sesuai dengan kebutuhan produk Anda.
          </p>
        </header>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-600">
              Kategori: <span className="font-bold text-slate-900">{selectedCategory}</span>
            </span>
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex md:hidden items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-full text-sm font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm font-semibold transition-colors"
            >
              <Filter className="w-4 h-4" />
              Semua Filter
            </button>
            <button 
              onClick={() => navigate('/portal/orders/create')}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-full text-sm font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              Pesan Baru
            </button>
          </div>
          <div className="flex md:hidden">
            <button 
              onClick={() => navigate('/portal/orders/create')}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-full text-sm font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              Pesan Baru
            </button>
          </div>
        </div>

        <FilterOverlay
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCatalogs.map((catalog, index) => (
            <div
              key={catalog.key}
              className={`group flex flex-col bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_12px_32px_-4px_rgba(0,106,98,0.08)] hover:translate-y-[-4px] transition-all duration-500 cursor-pointer ${
                index % 3 === 2 ? 'lg:col-span-1' : ''
              }`}
              onClick={() => navigate(`/portal/orders/create?catalog=${encodeURIComponent(catalog.key)}`)}
            >
              <div className="relative h-72 overflow-hidden bg-surface-container">
                {catalog.images?.length > 0 ? (
                   <img src={catalog.images[0].url} alt={catalog.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                ) : (
                   <div className="w-full h-full flex flex-col items-center justify-center text-on-secondary-container opacity-50">
                     <span className="material-symbols-outlined !text-4xl mb-2">image</span>
                     <span className="text-sm font-semibold">No Image</span>
                   </div>
                )}
                {index === 0 && (
                   <div className="absolute top-4 left-4">
                     <span className="px-3 py-1 bg-primary/90 backdrop-blur-md text-on-primary text-[10px] font-bold uppercase tracking-widest rounded-full">New</span>
                   </div>
                )}
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1 font-label">{catalog.category}</span>
                    <h3 className="text-2xl font-extrabold text-on-surface tracking-tight font-headline">{catalog.name}</h3>
                  </div>
                  <span className="text-lg font-bold text-primary text-right pl-2 shrink-0">
                    {formatCurrency(catalog.priceB2B)} <span className="text-[10px] block opacity-70">/ pcs</span>
                  </span>
                </div>
                <p className="text-on-secondary-container text-sm leading-relaxed mb-6 line-clamp-3 font-body">
                  {catalog.description || `${catalog.materialLabel} - Tersedia dalam ${catalog.variants.length} varian dan ${catalog.availableSizes.length} ukuran.`}
                </p>
                <div className="mt-auto flex gap-3">
                  <button className="flex-grow bg-primary text-on-primary font-bold py-3 px-6 rounded-full text-sm hover:bg-primary-container transition-colors flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-sm">shopping_cart</span>
                    Pesan Sekarang
                  </button>
                </div>
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

  const renderOrders = () => {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <header className="mb-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-2 block font-label">Track Your Progress</span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface font-headline">Pesanan Saya</h1>
          </div>
          <div className="flex gap-3">
            <div className="bg-surface-container-low px-4 py-2 rounded-lg flex items-center gap-2">
              <span className="text-on-secondary-container text-sm font-medium">Total Pesanan:</span>
              <span className="bg-primary text-white px-2 py-0.5 rounded-full text-xs font-bold">{orders.length}</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/portal/orders/create')}
              className="flex items-center gap-2 bg-primary px-4 py-2 rounded-lg text-white text-sm font-bold shadow-md hover:scale-105 transition-transform"
            >
              <span className="material-symbols-outlined text-sm">add</span> Buat
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_12px_32px_-4px_rgba(0,106,98,0.08)]">
              <h3 className="font-bold text-lg mb-4 text-on-surface font-headline">Tracker App</h3>
              <div className="space-y-2">
                {[
                  { id: 'all', label: 'Semua Pesanan' },
                  { id: 'payment', label: 'Payment' },
                  { id: 'production', label: 'Production' },
                  { id: 'completed', label: 'Completed' }
                ].map(statusBtn => {
                  const isActive = statusBtn.id === 'all';
                  return (
                    <button key={statusBtn.id} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-primary-container text-on-primary-container font-semibold' : 'text-on-secondary-container hover:bg-surface-container'}`}>
                      {statusBtn.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="bg-primary p-6 rounded-xl text-white relative overflow-hidden group hidden lg:block">
              <div className="relative z-10">
                <h3 className="font-bold text-xl mb-2 font-headline">Butuh Bantuan?</h3>
                <p className="text-primary-fixed text-sm mb-4 leading-relaxed font-body">Hubungi admin untuk pertanyaan mengenai produksi.</p>
                <button className="bg-white text-primary px-6 py-2 rounded-full text-sm font-bold hover:scale-105 transition-transform">WhatsApp Admin</button>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined !text-9xl">support_agent</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-9 space-y-8">
            {orders.map((order) => {
              const isCompleted = order.status === 'Completed';
              const isPending = order.status === 'Quotation' || order.status === 'Payment';
              const orderDate = new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

              return (
                <article key={order._id} onClick={() => handleViewOrder(order._id)} className={`cursor-pointer group bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_12px_32px_-4px_rgba(0,106,98,0.08)] transition-opacity ${isCompleted ? 'opacity-80 hover:opacity-100' : ''}`}>
                  <div className="bg-surface-container-high px-6 py-4 flex flex-col md:flex-row justify-between md:items-center gap-3">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-primary tracking-wider">#{order.orderNumber || order._id.slice(-6)}</span>
                      <span className="text-xs text-on-secondary-container bg-surface-container-highest px-3 py-1 rounded-full font-bold">{orderDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className={`material-symbols-outlined text-sm ${isCompleted ? 'text-green-600' : 'text-primary'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                         {isCompleted ? 'check_circle' : 'schedule'}
                       </span>
                       <span className={`text-sm font-bold ${isCompleted ? 'text-green-600' : 'text-primary'}`}>Status: {getStatusLabel(order.status)}</span>
                    </div>
                  </div>
                  <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 cursor-pointer">
                      <div className={`w-24 h-24 rounded-lg bg-surface-container overflow-hidden shrink-0 shadow-sm border border-outline-variant/10 ${isCompleted ? 'grayscale opacity-80' : ''}`}>
                        {order.product?.images?.[0] ? (
                          <img src={order.product.images[0].url} alt={order.product.name} className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-primary/30"><span className="material-symbols-outlined">image</span></div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <h2 className="text-xl md:text-2xl font-bold mb-1 text-on-surface font-headline">{order.product?.name || 'Produk Custom'}</h2>
                        <p className="text-on-secondary-container text-sm mb-4">{order.details?.quantity?.toLocaleString()} pcs {order.product?.material && `• ${order.product.material}`}</p>
                        <div className="flex flex-wrap gap-8">
                          <div>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-on-secondary-container mb-1 font-label">Total</p>
                            <p className="text-lg font-extrabold text-on-surface font-headline">{formatCurrency(order.totalPrice)}</p>
                          </div>
                          {order.isPaid && (
                            <div>
                              <p className="text-[10px] uppercase font-bold tracking-widest text-on-secondary-container mb-1 font-label">Payment</p>
                              <p className="text-sm font-bold text-green-600 flex items-center gap-1 font-body"><span className="material-symbols-outlined text-xs">check</span> Lunas</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-end shrink-0">
                         {isPending ? (
                           <button onClick={(e) => { e.stopPropagation(); handleViewOrder(order._id); }} className="px-6 py-2.5 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary-container transition-colors shadow-lg shadow-primary/20">Panduan Bayar</button>
                         ) : isCompleted ? (
                           <button onClick={(e) => { e.stopPropagation(); navigate('/portal/orders/create'); }} className="px-6 py-2.5 rounded-full bg-surface-container-high text-on-secondary-container text-sm font-bold hover:bg-surface-container-highest transition-colors">Pesan Lagi</button>
                         ) : (
                           <button onClick={(e) => { e.stopPropagation(); handleViewOrder(order._id); }} className="px-6 py-2.5 rounded-full border-2 border-primary text-primary text-sm font-bold hover:bg-primary/5 transition-colors group-hover:bg-primary group-hover:text-white">Detail Progress</button>
                         )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
            {orders.length === 0 && <EmptyState text="Belum ada pesanan." />}
          </div>
        </div>
      </div>
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
    <div className="min-h-screen bg-white font-sans text-on-surface flex flex-col">
      <CustomerNavbar activeMenu={activeMenu} onMenuChange={setActiveMenu} />
      <main className="pt-32 pb-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-12 flex-1 w-full">
        {!['dashboard', 'catalog', 'orders'].includes(activeMenu) && (
          <header className="mb-8 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest font-label">The Archive Portal</span>
              <h1 className="text-3xl font-black tracking-tighter text-slate-900 capitalize sm:text-4xl mt-2 font-headline">{pageTitle}</h1>
            </div>
            <button
              type="button"
              onClick={fetchData}
              className="self-end rounded-xl border border-outline-variant/15 bg-white p-4 text-on-secondary-container shadow-sm transition-all duration-500 hover:rotate-180 hover:bg-surface-container-low sm:self-auto"
            >
              <RefreshCw size={24} className={loading ? 'animate-spin text-primary' : ''} />
            </button>
          </header>
        )}

        {renderPage()}
      </main>

      <CustomerFooter />

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

