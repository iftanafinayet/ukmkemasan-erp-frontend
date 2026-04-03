import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Sidebar from './Sidebar';
import CustomerSidebar from './CustomerSidebar';
import { ENDPOINTS, storage } from '../config/environment';
import {
    ArrowLeft, Loader2, Package, Edit3, Trash2,
    ShoppingCart, Layers, Ruler, Box, ImagePlus,
    RefreshCw, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import {
    Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext
} from './ui/carousel';

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = storage.getUser();
    const isAdmin = user?.role === 'admin';

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImageIdx, setActiveImageIdx] = useState(0);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const res = await api.get(ENDPOINTS.PRODUCT_BY_ID(id));
            setProduct(res.data);
        } catch (err) {
            if (err.response?.status === 401) {
                storage.clear();
                window.location.href = '/login';
                return;
            }
            toast.error('Gagal memuat detail produk.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Yakin ingin menghapus produk ini?')) return;
        try {
            await api.delete(ENDPOINTS.PRODUCT_BY_ID(id));
            toast.success('Produk berhasil dihapus!');
            navigate(isAdmin ? '/admin' : '/portal');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal menghapus produk.');
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateString));
    };

    const goBack = () => navigate(isAdmin ? '/admin' : '/portal');

    // Sidebar menu handler — navigate back to portal with the right section
    const handleMenuChange = (menuId) => {
        if (isAdmin) {
            navigate('/admin');
        } else {
            navigate('/portal');
        }
    };

    const SidebarComponent = isAdmin ? Sidebar : CustomerSidebar;

    return (
        <div className="flex h-screen bg-slate-50 font-sans selection:bg-primary/20">
            <SidebarComponent activeMenu="inventory" onMenuChange={handleMenuChange} />
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-5xl mx-auto p-8">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between mb-8">
                        <button onClick={goBack}
                            className="flex items-center gap-2 text-slate-500 hover:text-primary font-bold text-sm transition-colors group">
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            Kembali
                        </button>
                        <button onClick={fetchProduct}
                            className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-100 hover:rotate-180 transition-all duration-500 shadow-sm text-slate-600">
                            <RefreshCw size={20} className={loading ? 'animate-spin text-primary' : ''} />
                        </button>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-32">
                            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Memuat detail produk...</p>
                        </div>
                    )}

                    {/* Not Found State */}
                    {!loading && !product && (
                        <div className="flex flex-col items-center justify-center py-32 opacity-40">
                            <AlertCircle size={60} strokeWidth={1} className="mb-4 text-slate-600" />
                            <p className="font-black uppercase tracking-[0.3em] text-[10px] text-slate-600">Produk tidak ditemukan</p>
                        </div>
                    )}

                    {/* Product Detail Content */}
                    {!loading && product && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Image Carousel */}
                            <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm mb-8">
                                {product.images?.length > 0 ? (
                                    <div className="relative">
                                        <Carousel className="w-full" opts={{ loop: true, startIndex: activeImageIdx }}>
                                            <CarouselContent>
                                                {product.images.map((img, idx) => (
                                                    <CarouselItem key={idx}>
                                                        <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-slate-100">
                                                            <img
                                                                src={img.url}
                                                                alt={img.alt || product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            {/* Overlay */}
                                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-8 pt-20">
                                                                <p className="text-white/60 text-xs font-black uppercase tracking-widest">{product.category}</p>
                                                                <h1 className="text-white text-3xl md:text-4xl font-black tracking-tight mt-1">{product.name}</h1>
                                                            </div>
                                                        </div>
                                                    </CarouselItem>
                                                ))}
                                            </CarouselContent>
                                            {product.images.length > 1 && (
                                                <>
                                                    <CarouselPrevious className="left-4 w-10 h-10 bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:bg-white" />
                                                    <CarouselNext className="right-4 w-10 h-10 bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:bg-white" />
                                                </>
                                            )}
                                        </Carousel>
                                        {/* Image count */}
                                        {product.images.length > 1 && (
                                            <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-xl text-white text-xs font-bold z-10">
                                                {product.images.length} foto
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="aspect-[21/9] bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 flex flex-col items-center justify-center">
                                        <ImagePlus className="w-16 h-16 text-primary/15 mb-3" />
                                        <p className="text-primary/25 font-bold uppercase tracking-widest text-sm">Belum ada foto</p>
                                    </div>
                                )}

                                {/* Thumbnail strip */}
                                {product.images?.length > 1 && (
                                    <div className="p-4 flex gap-3 overflow-x-auto">
                                        {product.images.map((img, idx) => (
                                            <button key={idx}
                                                onClick={() => setActiveImageIdx(idx)}
                                                className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${activeImageIdx === idx ? 'border-primary shadow-lg shadow-primary/20 scale-105' : 'border-slate-200 opacity-60 hover:opacity-100'}`}>
                                                <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Title (shown when no images) */}
                            {(!product.images || product.images.length === 0) && (
                                <div className="mb-6">
                                    <p className="text-primary text-xs font-black uppercase tracking-widest">{product.category}</p>
                                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mt-1">{product.name}</h1>
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column — Details */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Description */}
                                    {product.description && (
                                        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Deskripsi</h3>
                                            <p className="text-slate-600 leading-relaxed">{product.description}</p>
                                        </div>
                                    )}

                                    {/* Specifications */}
                                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Spesifikasi</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
                                            <SpecCard icon={Package} label="SKU" value={product.sku || '-'} />
                                            <SpecCard icon={Layers} label="Kategori" value={product.category} />
                                            <SpecCard icon={Ruler} label="Material" value={product.material || '-'} />
                                            <SpecCard icon={Box} label="Min. Order" value={`${product.minOrder?.toLocaleString() || '100'} pcs`} />
                                            <SpecCard icon={Package} label="Stok Polos"
                                                value={`${product.stockPolos?.toLocaleString()} pcs`}
                                                highlight={product.stockPolos < 500} />
                                        </div>
                                    </div>

                                    {/* Timestamps */}
                                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                        <div className="flex flex-wrap gap-6 text-xs text-slate-400">
                                            {product.createdAt && (
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">Dibuat</p>
                                                    <p className="font-bold text-slate-600">{formatDate(product.createdAt)}</p>
                                                </div>
                                            )}
                                            {product.updatedAt && (
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">Terakhir Diupdate</p>
                                                    <p className="font-bold text-slate-600">{formatDate(product.updatedAt)}</p>
                                                </div>
                                            )}
                                            {product.images && (
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">Jumlah Foto</p>
                                                    <p className="font-bold text-slate-600">{product.images.length} gambar</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column — Pricing & Actions */}
                                <div className="space-y-6">
                                    {/* Pricing Card */}
                                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                                        <div className="bg-gradient-to-r from-primary to-primary p-6">
                                            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Mulai dari</p>
                                            <p className="text-white text-3xl font-black mt-1">{formatCurrency(product.priceB2B)}</p>
                                            <p className="text-white/50 text-xs font-bold mt-1">per pcs (B2B)</p>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <PriceRow label="Harga Base" value={formatCurrency(product.priceBase)} />
                                            <PriceRow label="B2C (Retail)" value={formatCurrency(product.priceB2C)} highlight />
                                            <PriceRow label="B2B (≥1000 pcs)" value={formatCurrency(product.priceB2B)} />
                                            {product.addons?.valvePrice > 0 && (
                                                <div className="pt-4 border-t border-slate-100">
                                                    <PriceRow label="+ Valve" value={formatCurrency(product.addons.valvePrice) + '/pcs'} accent />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {!isAdmin && (
                                        <button onClick={() => navigate(`/portal/orders/create?productId=${product._id}`)}
                                            className="w-full py-5 bg-primary text-white font-black rounded-3xl shadow-xl shadow-primary/30 hover:bg-primary/90 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 text-sm">
                                            <ShoppingCart size={20} /> Pesan Sekarang
                                        </button>
                                    )}

                                    {isAdmin && (
                                        <div className="space-y-3">
                                            <button onClick={() => navigate('/admin')}
                                                className="w-full py-4 bg-blue-500 text-white font-black rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm">
                                                <Edit3 size={18} /> Edit di Dashboard
                                            </button>
                                            <button onClick={handleDelete}
                                                className="w-full py-4 bg-red-50 text-red-500 font-black rounded-2xl hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm">
                                                <Trash2 size={18} /> Hapus Produk
                                            </button>
                                        </div>
                                    )}

                                    {/* Stock Status */}
                                    <div className={`p-5 rounded-2xl border text-center ${product.stockPolos < 500
                                        ? 'bg-red-50 border-red-200'
                                        : 'bg-green-50 border-green-200'
                                        }`}>
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${product.stockPolos < 500 ? 'text-red-400' : 'text-green-500'}`}>
                                            {product.stockPolos < 500 ? 'Stok Menipis' : 'Stok Tersedia'}
                                        </p>
                                        <p className={`text-2xl font-black mt-1 ${product.stockPolos < 500 ? 'text-red-600' : 'text-green-700'}`}>
                                            {product.stockPolos?.toLocaleString()} pcs
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

// === SUB-COMPONENTS ===
const SpecCard = ({ icon: Icon, label, value, highlight }) => (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
        <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className={`text-sm font-bold mt-1 ${highlight ? 'text-red-500' : 'text-slate-800'}`}>{value}</p>
    </div>
);

const PriceRow = ({ label, value, highlight, accent }) => (
    <div className="flex justify-between items-center">
        <p className="text-xs text-slate-400 font-bold">{label}</p>
        <p className={`text-sm font-black ${accent ? 'text-primary' : highlight ? 'text-primary' : 'text-slate-700'}`}>{value}</p>
    </div>
);
