import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import CustomerSidebar from './CustomerSidebar';
import { ENDPOINTS, storage } from '../config/environment';
import {
    RefreshCw, Loader2, AlertCircle, Plus, X,
    ShoppingCart, Clock, Package, ChevronRight, Eye,
    User, Mail, Phone, MapPin, Lock, Save, ImagePlus,
    Layers, Ruler, Tag, Box, ArrowRight, BadgeCheck, Sparkles,
    Newspaper, CalendarDays, Camera
} from 'lucide-react';
import { toast } from 'sonner';
import {
    Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext
} from './ui/carousel';
import { buildCatalogGroups } from '../utils/catalog';
import { clearCart, getCartItems, removeCartItem, setCartItems as persistCartItems, subscribeCart } from '../utils/cart';
import CustomerCartSection from './customer-portal/CustomerCartSection';

const ARTICLE_HIGHLIGHTS = [
    {
        category: 'Artikel Baru',
        title: 'Tren desain kemasan 2026 untuk brand UMKM yang ingin naik kelas.',
        date: '10 April 2026',
        excerpt: 'Insight singkat tentang kombinasi warna, finishing, dan struktur kemasan yang lebih menarik di rak maupun marketplace.'
    },
    {
        category: 'Business Insight',
        title: 'Kapan saat yang tepat beralih dari kemasan polos ke kemasan custom?',
        date: '8 April 2026',
        excerpt: 'Panduan memilih momentum upgrade packaging agar biaya tetap terkontrol tetapi persepsi brand meningkat.'
    },
    {
        category: 'Packaging Tips',
        title: 'Cara memilih ukuran pouch yang pas untuk kopi, snack, dan produk frozen.',
        date: '5 April 2026',
        excerpt: 'Ukuran yang tepat membantu efisiensi produksi, tampilan display, dan pengalaman customer saat menerima produk.'
    }
];

const ACTIVITY_GALLERY = [
    {
        label: 'Pameran',
        title: 'Booth UKM Kemasan di expo kemasan dan printing regional.',
        date: 'April 2026',
        location: 'Surabaya',
        summary: 'Menampilkan sampel standing pouch, diskusi kebutuhan brand, dan konsultasi langsung dengan calon client.',
        accent: 'from-slate-900 via-slate-800 to-cyan-900'
    },
    {
        label: 'Workshop',
        title: 'Sesi edukasi packaging branding untuk pelaku UMKM kuliner.',
        date: 'Maret 2026',
        location: 'Malang',
        summary: 'Berbagi insight tentang struktur kemasan, visual shelf impact, dan strategi upgrade kemasan bertahap.',
        accent: 'from-primary via-cyan-700 to-emerald-700'
    },
    {
        label: 'Production Visit',
        title: 'Dokumentasi review material dan approval sample bersama client.',
        date: 'Maret 2026',
        location: 'Sidoarjo',
        summary: 'Aktivitas quality checking dan finalisasi spesifikasi sebelum masuk tahap order berjalan.',
        accent: 'from-amber-500 via-orange-500 to-rose-500'
    }
];

export default function CustomerPortal() {
    const user = storage.getUser();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const menuFromQuery = searchParams.get('menu') || 'dashboard';

    // State
    const [activeMenu, setActiveMenu] = useState(menuFromQuery);
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [checkingOutCart, setCheckingOutCart] = useState(false);
    const [stats, setStats] = useState({ total: 0, production: 0, completed: 0 });
    const [selectedCategory, setSelectedCategory] = useState('All');


    // Order Detail
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Profile
    const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '' });
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    // Fetch
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            switch (activeMenu) {
                case 'dashboard': {
                    const res = await api.get(ENDPOINTS.MY_ORDERS);
                    const allOrders = res.data || [];
                    setOrders(allOrders);
                    setStats({
                        total: allOrders.length,
                        production: allOrders.filter(o => o.status === 'Production').length,
                        completed: allOrders.filter(o => o.status === 'Completed').length
                    });
                    break;
                }
                case 'catalog': {
                    const res = await api.get(ENDPOINTS.PRODUCTS);
                    setProducts(res.data || []);
                    break;
                }
                case 'orders': {
                    const res = await api.get(ENDPOINTS.MY_ORDERS);
                    setOrders(res.data || []);
                    break;
                }
                case 'cart': {
                    setCartItems(getCartItems());
                    break;
                }
                case 'profile':
                case 'settings': {
                    try {
                        const res = await api.get(ENDPOINTS.PROFILE);
                        setProfile({
                            name: res.data.name || '', email: res.data.email || '',
                            phone: res.data.phone || '', address: res.data.address || ''
                        });
                    } catch { /* keep existing */ }
                    break;
                }
            }
        } catch (err) {
            if (err.response?.status === 401) {
                storage.clear();
                window.location.href = '/login';
                return;
            }
            toast.error('Gagal memuat data.');
        } finally {
            setLoading(false);
        }
    }, [activeMenu]);

    useEffect(() => { fetchData(); }, [fetchData]);

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

    // Helpers
    const formatCurrency = (amt) => {
        if (!amt) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amt);
    };
    const formatDate = (d) => {
        if (!d) return '-';
        return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d));
    };

    const getStatusColor = (status) => {
        const map = {
            'Quotation': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'Payment': 'bg-orange-100 text-orange-700 border-orange-200',
            'Production': 'bg-blue-100 text-blue-700 border-blue-200',
            'Quality Control': 'bg-indigo-100 text-indigo-700 border-indigo-200',
            'Shipping': 'bg-purple-100 text-purple-700 border-purple-200',
            'Completed': 'bg-primary/10 text-primary/90 border-primary/20'
        };
        return map[status] || 'bg-slate-100 text-slate-600 border-slate-200';
    };

    const getStatusLabel = (status) => {
        const map = {
            'Quotation': 'Penawaran', 'Payment': 'Pembayaran', 'Production': 'Produksi',
            'Quality Control': 'Quality Control', 'Shipping': 'Pengiriman', 'Completed': 'Selesai'
        };
        return map[status] || status;
    };

    // Handlers
    const handleViewOrder = async (orderId) => {
        try {
            const res = await api.get(ENDPOINTS.ORDER_BY_ID(orderId));
            setSelectedOrder(res.data);
            setIsDetailOpen(true);
        } catch { toast.error('Gagal memuat detail pesanan.'); }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const res = await api.put(ENDPOINTS.PROFILE, profile);
            storage.setUser({ _id: res.data._id, name: res.data.name, role: res.data.role });
            toast.success('Profil diperbarui!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menyimpan profil.');
        } finally { setSavingProfile(false); }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) return toast.error('Password baru tidak cocok.');
        setSavingPassword(true);
        try {
            await api.put(ENDPOINTS.CHANGE_PASSWORD, { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
            toast.success('Password diubah!');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal mengubah password.');
        } finally { setSavingPassword(false); }
    };

    const handleClearCart = () => {
        clearCart();
        toast.success('Keranjang dikosongkan.');
    };

    const handleRemoveCartItem = (item) => {
        removeCartItem((cartItem) =>
            cartItem.productId === item.productId
            && cartItem.variantId === item.variantId
            && cartItem.useValve === item.useValve
        );
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
                        useValve: Boolean(item.useValve)
                    });
                    successCount += 1;
                } catch (error) {
                    failedItems.push({
                        ...item,
                        failureMessage: error.response?.data?.message || 'Gagal membuat order untuk item ini.'
                    });
                }
            }

            persistCartItems(failedItems);
            setCartItems(failedItems);
            setActiveMenu(successCount > 0 ? 'orders' : 'cart');

            if (successCount > 0 && failedItems.length === 0) {
                toast.success('Checkout berhasil. ' + successCount + ' order dibuat.');
            } else if (successCount > 0) {
                toast.warning(successCount + ' order berhasil dibuat, ' + failedItems.length + ' item tetap di keranjang.');
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

    // === PAGES ===
    const renderPage = () => {
        if (loading) return (
            <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Memuat...</p>
            </div>
        );

        switch (activeMenu) {
            case 'dashboard': return renderDashboard();
            case 'catalog': return renderCatalog();
            case 'orders': return renderOrders();
            case 'cart': return renderCart();
            case 'profile':
            case 'settings': return renderProfile();
            default: return <EmptyState text="Halaman sedang dikembangkan." />;
        }
    };

    // Dashboard Customer
    const renderDashboard = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome */}
            <section className="relative overflow-hidden rounded-[2rem] border border-primary/10 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.35),_transparent_35%),linear-gradient(135deg,_#4dbace_0%,_#256f80_50%,_#133c46_100%)] p-6 text-white shadow-2xl shadow-cyan-900/20 sm:p-8 lg:p-10">
                <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.18),_transparent_62%)] lg:block" />
                <div className="absolute -right-10 top-10 h-40 w-40 rounded-full border border-white/15 bg-white/5 blur-2xl" />
                <div className="absolute -bottom-16 left-10 h-36 w-36 rounded-full border border-white/10 bg-white/10 blur-2xl" />

                <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.9fr)] lg:items-center">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-white/90 backdrop-blur-sm">
                            <Sparkles className="h-4 w-4" />
                            Official Packaging Partner
                        </span>
                        <h2 className="mt-5 max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-[2.8rem]">
                            UKM Kemasan membantu brand tampil lebih siap jual lewat solusi kemasan yang rapi, fleksibel, dan mudah dipesan.
                        </h2>
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
                            Di dashboard ini Anda bisa mengenal layanan UKM Kemasan, melihat progres pesanan, lalu langsung lanjut ke proses purchase tanpa berpindah alur.
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                            {[
                                'Standing pouch & roll stock',
                                'MOQ fleksibel kelipatan 100 pcs',
                                'Alur order sampai pengiriman terpantau'
                            ].map((item) => (
                                <span
                                    key={item}
                                    className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-bold text-white/85 backdrop-blur-sm"
                                >
                                    {item}
                                </span>
                            ))}
                        </div>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <button
                                onClick={() => navigate('/portal/orders/create')}
                                className="flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-primary shadow-lg transition-all hover:scale-[1.02] active:scale-95"
                            >
                                <Plus size={18} />
                                Purchase Sekarang
                                <ArrowRight size={16} />
                            </button>
                            <button
                                onClick={() => setActiveMenu('catalog')}
                                className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-black text-white backdrop-blur-sm transition-all hover:bg-white/15 active:scale-95"
                            >
                                Lihat Katalog
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="relative rounded-[1.75rem] border border-white/15 bg-slate-950/20 p-5 backdrop-blur-md">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/60">Profile Snapshot</p>
                                <h3 className="mt-2 text-2xl font-black">UKM Kemasan</h3>
                            </div>
                            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-emerald-100">
                                <BadgeCheck className="h-4 w-4" />
                                Active Service
                            </span>
                        </div>

                        <div className="mt-6 space-y-4">
                            {[
                                {
                                    icon: Layers,
                                    title: 'Solusi kemasan terkurasi',
                                    description: 'Pilihan produk disusun untuk kebutuhan UKM, reseller, sampai brand yang sedang scale up.'
                                },
                                {
                                    icon: Ruler,
                                    title: 'Varian ukuran dan material',
                                    description: 'Pilih format kemasan yang sesuai kebutuhan produk, kuantitas, dan positioning brand Anda.'
                                },
                                {
                                    icon: Tag,
                                    title: 'Purchase lebih cepat',
                                    description: 'Masuk ke katalog atau langsung ke form order untuk memulai permintaan pembelian.'
                                }
                            ].map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-black text-white">{item.title}</p>
                                            <p className="mt-1 text-sm leading-6 text-white/70">{item.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/55">Pesanan Anda</p>
                                <p className="mt-2 text-3xl font-black">{stats.total}</p>
                                <p className="mt-1 text-xs text-white/60">Total order yang sudah tercatat</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/55">Produksi Aktif</p>
                                <p className="mt-2 text-3xl font-black">{stats.production}</p>
                                <p className="mt-1 text-xs text-white/60">Pesanan yang sedang berjalan</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-50 rounded-xl"><ShoppingCart className="w-5 h-5 text-blue-500" /></div>
                        <p className="text-blue-500 text-[10px] font-black uppercase">Total Pesanan</p>
                    </div>
                    <h3 className="text-3xl font-black text-slate-800">{stats.total}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm border-l-4 border-l-amber-400">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-amber-50 rounded-xl"><Clock className="w-5 h-5 text-amber-500" /></div>
                        <p className="text-amber-500 text-[10px] font-black uppercase">Dalam Produksi</p>
                    </div>
                    <h3 className="text-3xl font-black text-slate-800">{stats.production}</h3>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm border-l-4 border-l-primary">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-primary/5 rounded-xl"><Package className="w-5 h-5 text-primary" /></div>
                        <p className="text-primary text-[10px] font-black uppercase">Selesai</p>
                    </div>
                    <h3 className="text-3xl font-black text-slate-800">{stats.completed}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.8fr)]">
                <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary/70">Tentang UKM Kemasan</p>
                            <h3 className="mt-2 text-2xl font-black text-slate-900">Partner kemasan untuk produk yang ingin tampil lebih profesional.</h3>
                        </div>
                        <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:flex">
                            <Box className="h-6 w-6" />
                        </div>
                    </div>
                    <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500">
                        UKM Kemasan memudahkan proses pemesanan kemasan dari eksplorasi katalog, input detail order, sampai monitoring status produksi. Section ini sengaja ditempatkan di homepage agar customer baru langsung paham layanan yang tersedia dan customer lama bisa langsung lanjut purchase.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <button
                            onClick={() => navigate('/portal/orders/create')}
                            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition-all hover:bg-slate-800 active:scale-95"
                        >
                            Direct To Purchase
                            <ArrowRight className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setActiveMenu('catalog')}
                            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-700 transition-all hover:border-primary/30 hover:text-primary active:scale-95"
                        >
                            Jelajahi Produk
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-[linear-gradient(180deg,_#ffffff_0%,_#f4fbfc_100%)] p-6 sm:p-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Kenapa di dashboard</p>
                    <div className="mt-5 space-y-4">
                        {[
                            'Customer langsung memahami positioning UKM Kemasan saat pertama masuk.',
                            'CTA purchase selalu terlihat tanpa harus membuka menu lain lebih dulu.',
                            'Dashboard tetap berfungsi sebagai ringkasan order, bukan sekadar halaman statistik.'
                        ].map((point, index) => (
                            <div key={point} className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-black text-primary">
                                    0{index + 1}
                                </div>
                                <p className="text-sm leading-6 text-slate-600">{point}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1.2fr)]">
                <section className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary/70">Artikel & Insight</p>
                            <h3 className="mt-2 text-2xl font-black text-slate-900">Informasi menarik dan update artikel terbaru dari UKM Kemasan.</h3>
                        </div>
                        <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 sm:flex">
                            <Newspaper className="h-6 w-6" />
                        </div>
                    </div>

                    <div className="mt-6 space-y-4">
                        {ARTICLE_HIGHLIGHTS.map((article, index) => (
                            <article
                                key={article.title}
                                className={`rounded-3xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${index === 0 ? 'border-primary/20 bg-[linear-gradient(180deg,_#f4fbfc_0%,_#ffffff_100%)]' : 'border-slate-100 bg-slate-50/60'}`}
                            >
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                                        {article.category}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400">
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        {article.date}
                                    </span>
                                </div>
                                <h4 className="mt-4 text-lg font-black leading-snug text-slate-900">
                                    {article.title}
                                </h4>
                                <p className="mt-3 text-sm leading-6 text-slate-500">
                                    {article.excerpt}
                                </p>
                                {index === 0 && (
                                    <div className="mt-5 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                                        Highlight Minggu Ini
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                </section>

                <section className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary/70">Galeri Kegiatan</p>
                            <h3 className="mt-2 text-2xl font-black text-slate-900">Update aktivitas UKM Kemasan seperti pameran, workshop, dan kunjungan produksi.</h3>
                        </div>
                        <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 sm:flex">
                            <Camera className="h-6 w-6" />
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                        {ACTIVITY_GALLERY.map((activity) => (
                            <article key={activity.title} className="overflow-hidden rounded-[1.75rem] border border-slate-100 bg-slate-50">
                                <div className={`relative min-h-52 bg-gradient-to-br ${activity.accent} p-5 text-white`}>
                                    <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full border border-white/15 bg-white/10" />
                                    <div className="absolute bottom-4 right-4 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
                                        <Camera className="h-5 w-5" />
                                    </div>
                                    <div className="relative flex h-full flex-col justify-between">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                                                {activity.label}
                                            </span>
                                            <span className="text-[11px] font-bold text-white/75">{activity.date}</span>
                                        </div>
                                        <div className="mt-12">
                                            <h4 className="max-w-xs text-xl font-black leading-snug">
                                                {activity.title}
                                            </h4>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3 p-5">
                                    <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-400">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        {activity.location}
                                    </div>
                                    <p className="text-sm leading-6 text-slate-500">
                                        {activity.summary}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>

            {/* Recent Orders */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 sm:p-8">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="font-black text-slate-800 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" /> Pesanan Terbaru
                    </h3>
                    <button onClick={() => setActiveMenu('orders')} className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
                        Lihat Semua <ChevronRight size={14} />
                    </button>
                </div>
                <div className="space-y-3">
                    {orders.slice(0, 5).map(order => (
                        <div key={order._id} onClick={() => handleViewOrder(order._id)}
                            className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all cursor-pointer group hover:border-primary/20 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="font-black text-slate-800 text-sm">#{order.orderNumber || order._id.slice(-6)}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{order.product?.name || 'Produk'} · {order.details?.quantity} pcs</p>
                            </div>
                            <div className="flex items-center gap-3 self-start sm:self-auto">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${getStatusColor(order.status)}`}>
                                    {getStatusLabel(order.status)}
                                </span>
                                <Eye size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                            </div>
                        </div>
                    ))}
                    {orders.length === 0 && <EmptyState text="Belum ada pesanan. Mulai pesan sekarang!" />}
                </div>
            </div>
        </div>
    );

    // Katalog Produk
    const renderCatalog = () => {
        const catalogGroups = buildCatalogGroups(products);
        const categories = ['All', ...new Set(catalogGroups.map(catalog => catalog.category).filter(Boolean))];
        const filteredCatalogs = selectedCategory === 'All'
            ? catalogGroups
            : catalogGroups.filter(catalog => catalog.category === selectedCategory);

        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-slate-400 text-sm font-medium">{filteredCatalogs.length} katalog tersedia</p>
                    <button onClick={() => navigate('/portal/orders/create')}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                        <Plus size={16} /> Pesan Sekarang
                    </button>
                </div>

                {/* Category Filters */}
                {categories.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === cat
                                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                                    : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-100'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCatalogs.map(catalog => (
                        <div
                            key={catalog.key}
                            className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-100 bg-white transition-shadow hover:shadow-lg"
                            onClick={() => navigate(`/portal/orders/create?catalog=${encodeURIComponent(catalog.key)}`)}
                        >
                            {/* Image Carousel or Placeholder */}
                            {catalog.images?.length > 0 ? (
                                <div className="relative">
                                    <Carousel className="w-full" opts={{ loop: true }}>
                                        <CarouselContent>
                                            {catalog.images.map((img, idx) => (
                                                <CarouselItem key={idx}>
                                                    <div className="relative aspect-[4/3] overflow-hidden">
                                                        <img
                                                            src={img.url}
                                                            alt={img.alt || catalog.name}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                            loading="lazy"
                                                        />
                                                        {/* Detail Overlay */}
                                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 pt-12">
                                                            <p className="text-white text-[10px] font-black uppercase tracking-widest opacity-80">{catalog.category}</p>
                                                            <p className="text-white/70 text-[9px] font-bold mt-0.5">{catalog.materialLabel}</p>
                                                        </div>
                                                    </div>
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                        {catalog.images.length > 1 && (
                                            <>
                                                <CarouselPrevious className="left-2 w-7 h-7 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:bg-white" />
                                                <CarouselNext className="right-2 w-7 h-7 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:bg-white" />
                                            </>
                                        )}
                                    </Carousel>
                                    {/* Image count badge */}
                                    {catalog.images.length > 1 && (
                                        <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-white text-[10px] font-bold z-10">
                                            {catalog.images.length} foto
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="aspect-[4/3] bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 flex flex-col items-center justify-center">
                                    <ImagePlus className="w-10 h-10 text-primary/20 mb-2" />
                                    <p className="text-[10px] text-primary/30 font-bold uppercase tracking-widest">Belum ada foto</p>
                                </div>
                            )}

                            <div className="p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="text-[9px] font-black text-primary/70 uppercase tracking-widest mb-1">Katalog Varian</p>
                                        <h4 className="font-black text-slate-800 leading-tight">{catalog.name}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{catalog.category}</p>
                                    </div>
                                    <span className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500">{catalog.materialLabel}</span>
                                </div>
                                {catalog.description && (
                                    <p className="text-xs text-slate-400 mb-4 line-clamp-2">{catalog.description}</p>
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
                                <div className="flex items-end justify-between pt-3 border-t border-slate-100">
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold">Mulai dari</p>
                                        <p className="text-lg font-black text-primary">{formatCurrency(catalog.priceB2B)}<span className="text-[10px] text-slate-400 font-bold">/pcs</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-400 font-bold">Varian</p>
                                        <p className="text-sm font-black text-slate-600">
                                            {catalog.variants.length} opsi
                                        </p>
                                    </div>
                                </div>
                                {catalog.addons?.valvePrice > 0 && (
                                    <p className="text-[10px] text-primary font-bold mt-2">+ Valve tersedia ({formatCurrency(catalog.addons.valvePrice)}/pcs)</p>
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

    // Pesanan Saya
    const renderOrders = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-slate-400 text-sm font-medium">{orders.length} pesanan</p>
                <button onClick={() => navigate('/portal/orders/create')}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                    <Plus size={16} /> Pesan Baru
                </button>
            </div>

            {/* Status Pipeline */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm sm:p-8">
                <div className="overflow-x-auto">
                    <div className="flex min-w-[720px] items-center justify-between">
                    {['Quotation', 'Payment', 'Production', 'Quality Control', 'Shipping', 'Completed'].map((status, idx, arr) => {
                        const count = orders.filter(o => o.status === status).length;
                        const isActive = count > 0;
                        return (
                            <React.Fragment key={status}>
                                <div className="flex flex-col items-center flex-1">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm transition-all ${isActive ? 'bg-primary text-white scale-110 shadow-primary/30' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                                        {count}
                                    </div>
                                    <p className={`text-[10px] uppercase tracking-widest font-black mt-3 text-center ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                                        {getStatusLabel(status)}
                                    </p>
                                </div>
                                {idx < arr.length - 1 && (
                                    <div className="flex-1 h-0.5 bg-slate-100 mx-2 relative">
                                        <div className="absolute inset-0 bg-primary/20 opacity-0 transition-opacity" />
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                    </div>
                </div>
            </div>

            {/* Order List */}
            <div className="space-y-4">
                {orders.map(order => (
                    <div key={order._id} onClick={() => handleViewOrder(order._id)}
                        className="bg-white p-6 rounded-3xl border border-slate-100 hover:border-primary/20 hover:shadow-md transition-all cursor-pointer group">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                    <h4 className="font-black text-slate-800">#{order.orderNumber || order._id.slice(-6)}</h4>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${getStatusColor(order.status)}`}>
                                        {getStatusLabel(order.status)}
                                    </span>
                                    {order.isPaid && <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-black">✓ Lunas</span>}
                                </div>
                                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                                    <span className="font-bold">{order.product?.name}</span>
                                    <span>{order.details?.quantity?.toLocaleString()} pcs</span>
                                    <span>{formatDate(order.createdAt)}</span>
                                </div>
                            </div>
                            <div className="text-left sm:text-right">
                                <p className="font-black text-primary text-lg">{formatCurrency(order.totalPrice)}</p>
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
            onRemoveItem={handleRemoveCartItem}
            onCheckout={handleCheckoutCart}
        />
    );

    // Profil & Settings
    const renderProfile = () => (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl">
            {/* Profile Card */}
            <div className="bg-gradient-to-r from-primary to-primary p-6 text-white shadow-xl shadow-primary/20 sm:p-8 rounded-3xl">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
                    <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-black backdrop-blur-sm">
                        {user?.name?.charAt(0) || 'C'}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black">{profile.name || user?.name}</h2>
                        <p className="text-primary/10 font-medium">{profile.email}</p>
                        <span className="inline-block mt-1 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase backdrop-blur-sm">Customer Account</span>
                    </div>
                </div>
            </div>

            {/* Edit Profile */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100">
                <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Edit Profil</h3>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FieldInput icon={User} label="Nama" value={profile.name} onChange={(v) => setProfile({ ...profile, name: v })} required />
                        <FieldInput icon={Mail} label="Email" type="email" value={profile.email} onChange={(v) => setProfile({ ...profile, email: v })} required />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FieldInput icon={Phone} label="No. Telepon" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} />
                        <FieldInput icon={MapPin} label="Alamat" value={profile.address} onChange={(v) => setProfile({ ...profile, address: v })} />
                    </div>
                    <button type="submit" disabled={savingProfile}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50 sm:w-auto">
                        {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Simpan Profil
                    </button>
                </form>
            </div>

            {/* Change Password */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100">
                <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2"><Lock className="w-5 h-5 text-primary" /> Ganti Password</h3>
                <form onSubmit={handleChangePassword} className="space-y-4">
                    <FieldInput icon={Lock} label="Password Lama" type="password" value={passwords.currentPassword}
                        onChange={(v) => setPasswords({ ...passwords, currentPassword: v })} required />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FieldInput icon={Lock} label="Password Baru" type="password" value={passwords.newPassword}
                            onChange={(v) => setPasswords({ ...passwords, newPassword: v })} required placeholder="Min. 6 karakter" />
                        <FieldInput icon={Lock} label="Konfirmasi" type="password" value={passwords.confirmPassword}
                            onChange={(v) => setPasswords({ ...passwords, confirmPassword: v })} required />
                    </div>
                    <button type="submit" disabled={savingPassword}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-slate-700 active:scale-95 disabled:opacity-50 sm:w-auto">
                        {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                        Ubah Password
                    </button>
                </form>
            </div>
        </div>
    );

    // === MAIN RETURN ===
    return (
        <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-primary/20 lg:h-screen">
            <CustomerSidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />
            <main className="flex-1 overflow-y-auto overflow-x-hidden">
                <div className="mx-auto max-w-7xl px-4 pb-6 pt-20 sm:px-6 sm:pb-8 lg:p-8">
                    <header className="mb-8 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tighter capitalize sm:text-4xl">
                                {activeMenu === 'catalog' ? 'Katalog Produk' : activeMenu === 'orders' ? 'Pesanan Saya' : activeMenu === 'cart' ? 'Keranjang' : activeMenu === 'profile' || activeMenu === 'settings' ? 'Profil' : 'Dashboard'}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                <p className="text-slate-500 text-sm font-medium italic">Customer Portal · UKM Kemasan</p>
                            </div>
                        </div>
                        <button onClick={fetchData}
                            className="self-end rounded-2xl border border-slate-200 bg-white p-4 text-slate-600 shadow-sm transition-all duration-500 hover:rotate-180 hover:bg-slate-100 sm:self-auto">
                            <RefreshCw size={24} className={loading ? 'animate-spin text-primary' : ''} />
                        </button>
                    </header>
                    {renderPage()}
                </div>
            </main>

            {/* ====== MODALS ====== */}

            {/* Order Detail Modal */}
            {isDetailOpen && selectedOrder && (
                <Modal onClose={() => setIsDetailOpen(false)} wide>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Pesanan #{selectedOrder.orderNumber}</h3>
                    <p className="text-slate-500 text-sm font-medium mb-8">{formatDate(selectedOrder.createdAt)}</p>

                    {/* Progress Track */}
                    <div className="mb-8 rounded-2xl border border-slate-100 bg-slate-50 p-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Progress Pesanan</p>
                        <div className="overflow-x-auto">
                            <div className="flex min-w-[640px] items-center justify-between">
                            {['Quotation', 'Payment', 'Production', 'Quality Control', 'Shipping', 'Completed'].map((status, idx, arr) => {
                                const currentIdx = arr.indexOf(selectedOrder.status);
                                const isDone = idx <= currentIdx;
                                return (
                                    <React.Fragment key={status}>
                                        <div className="text-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${isDone ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'}`}>
                                                {isDone ? '✓' : idx + 1}
                                            </div>
                                            <p className="text-[8px] font-bold text-slate-400 mt-1 max-w-12 leading-tight">{getStatusLabel(status)}</p>
                                        </div>
                                        {idx < arr.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${idx < currentIdx ? 'bg-primary' : 'bg-slate-200'}`} />}
                                    </React.Fragment>
                                );
                            })}
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="space-y-4">
                            <InfoLine label="Produk" value={selectedOrder.product?.name} />
                            <InfoLine label="Kategori" value={selectedOrder.product?.category} />
                            <InfoLine label="Kuantitas" value={`${selectedOrder.details?.quantity?.toLocaleString()} pcs`} />
                        </div>
                        <div className="space-y-4">
                            <InfoLine label="Valve" value={selectedOrder.details?.useValve ? 'Ya' : 'Tidak'} />
                            <InfoLine label="Pembayaran" value={selectedOrder.isPaid ? '✓ Lunas' : '✗ Belum Bayar'} color={selectedOrder.isPaid ? 'text-primary' : 'text-red-500'} />
                            <InfoLine label="Total" value={formatCurrency(selectedOrder.totalPrice)} color="text-primary text-xl" />
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

// === SUB-COMPONENTS ===
const EmptyState = ({ text }) => (
    <div className="col-span-full py-16 flex flex-col items-center justify-center opacity-30 text-slate-900">
        <AlertCircle size={48} strokeWidth={1} className="mb-3" />
        <p className="font-black uppercase tracking-[0.3em] text-[10px]">{text}</p>
    </div>
);

const Modal = ({ children, onClose, wide }) => (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 p-3 backdrop-blur-md animate-in fade-in duration-300 sm:items-center sm:p-4">
        <div className={`relative max-h-[90vh] w-full overflow-y-auto rounded-[28px] border border-white/20 bg-white p-5 pt-14 shadow-2xl sm:rounded-[40px] sm:p-10 ${wide ? 'max-w-2xl' : 'max-w-lg'}`}>
            <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 sm:right-6 sm:top-6">
                <X size={20} />
            </button>
            {children}
        </div>
    </div>
);

const FieldInput = ({ icon, label, value, onChange, type = 'text', required, placeholder }) => {
    const Icon = icon;

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <div className="relative">
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={type} required={required} placeholder={placeholder || ''}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 font-bold"
                    value={value} onChange={(e) => onChange(e.target.value)} />
            </div>
        </div>
    );
};

const InfoLine = ({ label, value, color }) => (
    <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className={`font-bold ${color || 'text-slate-800'}`}>{value || '-'}</p>
    </div>
);
