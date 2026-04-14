import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Sidebar from './Sidebar';
import CustomerNavbar from './customer-portal/CustomerNavbar';
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
import { getCartItems, upsertCartItem } from '../utils/cart';
import VariantSelectorSection from './customer-order/VariantSelectorSection';

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = storage.getUser();
    const isAdmin = user?.role === 'admin';

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImageIdx, setActiveImageIdx] = useState(0);
    const [selectedVariantId, setSelectedVariantId] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(100);
    const [useValve, setUseValve] = useState(false);

    const fetchProduct = useCallback(async () => {
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
    }, [id]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    useEffect(() => {
        if (!product) return;

        const firstAvailableVariant = product.variants?.find((variant) => variant.stock > 0)
            || product.variants?.[0]
            || null;

        setSelectedVariantId(firstAvailableVariant?._id || '');
        setSelectedSize(firstAvailableVariant?.size || '');
        setSelectedColor(firstAvailableVariant?.color || '');
        setQuantity(product.minOrder || 100);
        setUseValve(false);
    }, [product]);

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

    const handleMenuChange = (menuId) => {
        if (isAdmin) {
            navigate('/admin');
        } else {
            navigate(`/portal?menu=${menuId}`);
        }
    };

    const variants = product?.variants || [];
    const minimumOrder = product?.minOrder || 100;
    const safeQuantity = Math.max(minimumOrder, Number(quantity) || minimumOrder);
    const sizeOptions = [...new Set(variants.map((variant) => variant.size))];
    const colorOptions = [...new Set(variants.map((variant) => variant.color))];
    const selectedVariant = variants.find((variant) => String(variant._id) === String(selectedVariantId))
        || variants.find((variant) => variant.size === selectedSize && variant.color === selectedColor)
        || null;
    const priceTierLabel = safeQuantity >= 1000 ? 'B2B (>=1000 pcs)' : 'B2C';
    const baseVariantPrice = selectedVariant
        ? (safeQuantity >= 1000 ? selectedVariant.priceB2B : selectedVariant.priceB2C)
        : 0;
    const valvePrice = useValve ? product?.addons?.valvePrice || 0 : 0;
    const unitPrice = baseVariantPrice + valvePrice;
    const totalPrice = unitPrice * safeQuantity;
    const displayedStock = selectedVariant?.stock ?? product?.stockPolos ?? 0;
    const variantCount = variants.length;

    const isSizeDisabled = (size) => !variants.some((variant) =>
        variant.size === size
        && (!selectedColor || variant.color === selectedColor)
        && variant.stock > 0
    );

    const isColorDisabled = (color) => !variants.some((variant) =>
        variant.color === color
        && (!selectedSize || variant.size === selectedSize)
        && variant.stock > 0
    );

    const handleSelectSize = (size) => {
        const nextVariant = variants.find((variant) =>
            variant.size === size
            && variant.color === selectedColor
            && variant.stock > 0
        ) || variants.find((variant) =>
            variant.size === size
            && variant.stock > 0
        ) || variants.find((variant) => variant.size === size);

        setSelectedSize(size);
        setSelectedColor(nextVariant?.color || '');
        setSelectedVariantId(nextVariant?._id || '');
    };

    const handleSelectColor = (color) => {
        const nextVariant = variants.find((variant) =>
            variant.color === color
            && variant.size === selectedSize
            && variant.stock > 0
        ) || variants.find((variant) =>
            variant.color === color
            && variant.stock > 0
        ) || variants.find((variant) => variant.color === color);

        setSelectedColor(color);
        setSelectedSize(nextVariant?.size || '');
        setSelectedVariantId(nextVariant?._id || '');
    };

    const handleSelectVariant = (variant) => {
        setSelectedVariantId(variant?._id || '');
        setSelectedSize(variant?.size || '');
        setSelectedColor(variant?.color || '');
    };

    const handleAddToCart = () => {
        if (!product || !selectedVariant) {
            toast.error('Pilih ukuran dan warna terlebih dahulu.');
            return;
        }

        if (selectedVariant.stock <= 0) {
            toast.error('Varian ini sedang habis.');
            return;
        }

        if (safeQuantity > selectedVariant.stock) {
            toast.error(`Stok varian hanya tersedia ${selectedVariant.stock} pcs.`);
            return;
        }

        const cartItem = {
            productId: product._id,
            variantId: selectedVariant._id,
            quantity: safeQuantity,
            totalPrice,
            name: product.name,
            sku: selectedVariant.sku,
            selectedColor: selectedVariant.color,
            selectedSize: selectedVariant.size,
            useValve,
            unitPrice,
            imageUrl: product.images?.[0]?.url || '',
            productCategory: product.category || '',
        };

        const existingItem = getCartItems().find((item) =>
            item.productId === cartItem.productId
            && item.variantId === cartItem.variantId
            && item.useValve === cartItem.useValve
        );
        const nextQuantity = (Number(existingItem?.quantity) || 0) + safeQuantity;

        if (nextQuantity > selectedVariant.stock) {
            toast.error(`Total item di keranjang melebihi stok ${selectedVariant.stock} pcs.`);
            return;
        }

        upsertCartItem(cartItem);
        toast.success('Varian produk ditambahkan ke keranjang.');
    };

    return (
        <div className={isAdmin ? "flex min-h-screen bg-slate-50 font-sans selection:bg-primary/20 lg:h-screen" : "min-h-screen bg-surface-bright font-sans text-on-surface"}>
            {isAdmin ? (
                <Sidebar activeMenu="inventory" onMenuChange={handleMenuChange} />
            ) : (
                <CustomerNavbar activeMenu="catalog" onMenuChange={(menu) => navigate('/portal?menu=' + menu)} />
            )}
            <main className={isAdmin ? "flex-1 overflow-y-auto overflow-x-hidden" : "pt-32 pb-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-12"}>
                <div className={isAdmin ? "mx-auto max-w-5xl px-4 pb-6 pt-20 sm:px-6 sm:pb-8 lg:p-8" : "mx-auto max-w-5xl"}>
                    <div className="mb-8 flex items-center justify-between gap-4">
                        <button
                            onClick={goBack}
                            className="group flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-primary"
                        >
                            <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
                            Kembali
                        </button>
                        <button
                            onClick={fetchProduct}
                            className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-600 shadow-sm transition-all duration-500 hover:rotate-180 hover:bg-slate-100"
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin text-primary' : ''} />
                        </button>
                    </div>

                    {loading && (
                        <div className="flex flex-col items-center justify-center py-32">
                            <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Memuat detail produk...</p>
                        </div>
                    )}

                    {!loading && !product && (
                        <div className="flex flex-col items-center justify-center py-32 opacity-40">
                            <AlertCircle size={60} strokeWidth={1} className="mb-4 text-slate-600" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Produk tidak ditemukan</p>
                        </div>
                    )}

                    {!loading && product && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.2fr_0.8fr]">
                                {/* Column 1: Media & Secondary Info */}
                                <div className="space-y-8">
                                    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                                        {product.images?.length > 0 ? (
                                            <div className="relative">
                                                <Carousel className="w-full" opts={{ loop: true, startIndex: activeImageIdx }}>
                                                    <CarouselContent>
                                                        {product.images.map((img, idx) => (
                                                            <CarouselItem key={idx}>
                                                                <div className="relative aspect-square overflow-hidden bg-white">
                                                                    <img
                                                                        src={img.url}
                                                                        alt={img.alt || product.name}
                                                                        className="h-full w-full object-contain"
                                                                    />
                                                                </div>
                                                            </CarouselItem>
                                                        ))}
                                                    </CarouselContent>
                                                    {product.images.length > 1 && (
                                                        <>
                                                            <CarouselPrevious className="left-4 h-10 w-10 border-0 bg-white/80 shadow-xl backdrop-blur-sm hover:bg-white" />
                                                            <CarouselNext className="right-4 h-10 w-10 border-0 bg-white/80 shadow-xl backdrop-blur-sm hover:bg-white" />
                                                        </>
                                                    )}
                                                </Carousel>
                                                {product.images.length > 1 && (
                                                    <div className="absolute right-4 top-4 z-10 rounded-xl bg-black/50 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
                                                        {product.images.length} foto
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex aspect-square flex-col items-center justify-center bg-primary/10">
                                                <ImagePlus className="mb-3 h-16 w-16 text-primary/15" />
                                                <p className="text-sm font-bold uppercase tracking-widest text-primary/25">Belum ada foto</p>
                                            </div>
                                        )}

                                        {product.images?.length > 1 && (
                                            <div className="flex gap-3 overflow-x-auto p-4 no-scrollbar">
                                                {product.images.map((img, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setActiveImageIdx(idx)}
                                                        className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${activeImageIdx === idx
                                                            ? 'scale-105 border-primary shadow-lg shadow-primary/20'
                                                            : 'border-slate-200 opacity-60 hover:opacity-100'
                                                            }`}
                                                    >
                                                        <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
                                        <h3 className="mb-6 text-xs font-black uppercase tracking-widest text-slate-400">Spesifikasi</h3>
                                        <div className="grid grid-cols-2 gap-5 sm:grid-cols-2">
                                            <SpecCard icon={Layers} label="Kategori" value={product.category} />
                                            <SpecCard icon={Ruler} label="Material" value={product.material || '-'} />
                                            <SpecCard icon={Package} label="Varian" value={`${variants.length} opsi`} />
                                            <SpecCard icon={Box} label="Min. Order" value={`${minimumOrder.toLocaleString()} pcs`} />
                                        </div>
                                    </div>

                                    {product.description && (
                                        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
                                            <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">Deskripsi</h3>
                                            <p className="leading-relaxed text-slate-600 font-body text-sm">{product.description}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Column 2: Selection & Configuration */}
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                                                {product.category}
                                            </span>
                                            {product.isNew && (
                                                <span className="rounded-full bg-orange-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                                                    Terbaru
                                                </span>
                                            )}
                                        </div>
                                        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl font-headline">
                                            {product.name}
                                        </h1>
                                    </div>

                                    <VariantSelectorSection
                                        title="Pilih Variant"
                                        activeVariantLabel={selectedVariant ? `${selectedVariant.size} • ${selectedVariant.color}` : 'Belum dipilih'}
                                        variants={variants}
                                        selectedVariantId={selectedVariant?._id || selectedVariantId}
                                        sizeOptions={sizeOptions}
                                        colorOptions={colorOptions}
                                        selectedSize={selectedSize}
                                        selectedColor={selectedColor}
                                        isSizeDisabled={isSizeDisabled}
                                        isColorDisabled={isColorDisabled}
                                        onSelectVariant={handleSelectVariant}
                                        onSelectSize={handleSelectSize}
                                        onSelectColor={handleSelectColor}
                                        showDirectVariants={false}
                                        getVariantId={(variant) => variant._id}
                                        getVariantSku={(variant) => variant.sku || product.sku || '-'}
                                    />

                                    {!isAdmin && (
                                        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8 space-y-8">
                                            <div>
                                                <h3 className="mb-6 text-xs font-black uppercase tracking-widest text-slate-400">Konfigurasi Belanja</h3>
                                                <div className="space-y-8">
                                                    <div>
                                                        <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Jumlah Pesanan</p>
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                min={minimumOrder}
                                                                step={minimumOrder}
                                                                max={selectedVariant?.stock || undefined}
                                                                value={safeQuantity}
                                                                onChange={(e) => setQuantity(Number(e.target.value) || minimumOrder)}
                                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 pr-16 text-2xl font-black text-slate-800 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                                                            />
                                                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">pcs</span>
                                                        </div>
                                                        <p className="mt-2 text-[10px] font-bold text-slate-400">
                                                            Minimal order {minimumOrder.toLocaleString()} pcs. (Kelipatan {minimumOrder.toLocaleString()})
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Add-ons: Valve</p>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => setUseValve(true)}
                                                                disabled={(product.addons?.valvePrice || 0) <= 0}
                                                                className={`rounded-2xl border-2 px-4 py-4 text-sm font-black transition-all ${useValve
                                                                    ? 'border-primary bg-primary/5 text-primary'
                                                                    : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                                                                    } disabled:cursor-not-allowed disabled:opacity-40`}
                                                            >
                                                                Pakai Valve
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setUseValve(false)}
                                                                className={`rounded-2xl border-2 px-4 py-4 text-sm font-black transition-all ${!useValve
                                                                    ? 'border-primary bg-primary text-white'
                                                                    : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                                                                    }`}
                                                            >
                                                                Tanpa Valve
                                                            </button>
                                                        </div>
                                                        {useValve && product.addons?.valvePrice > 0 && (
                                                            <p className="mt-2 text-[10px] font-bold text-primary">
                                                                + {formatCurrency(product.addons.valvePrice)}/pcs
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {isAdmin && (
                                        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm space-y-4">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Admin Actions</h3>
                                            <button
                                                onClick={() => navigate('/admin')}
                                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-500 py-4 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-600 active:scale-95"
                                            >
                                                <Edit3 size={18} /> Edit di Dashboard
                                            </button>
                                            <button
                                                onClick={handleDelete}
                                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 py-4 text-sm font-black text-red-500 transition-all hover:bg-red-100 active:scale-95"
                                            >
                                                <Trash2 size={18} /> Hapus Produk
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Column 3: Order Summary (Sticky) */}
                                <div>
                                    <div className="sticky top-32 space-y-6">
                                        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/50">
                                            <div className="bg-primary p-6 lg:p-8">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Harga Per Produk</p>
                                                <p className="mt-1 text-4xl font-black text-white">
                                                    {selectedVariant ? formatCurrency(baseVariantPrice) : 'Pilih varian'}
                                                </p>
                                                <p className="mt-1 text-xs font-bold text-white/60">{priceTierLabel}</p>
                                            </div>
                                            <div className="space-y-5 p-6 lg:p-8">
                                                <SummaryRow label="Varian" value={selectedVariant ? `${selectedVariant.size} • ${selectedVariant.color}` : '-'} />
                                                <SummaryRow label="Stock" value={displayedStock <= 0 ? 'Habis' : `${displayedStock.toLocaleString()} pcs`} danger={displayedStock < minimumOrder} />
                                                <div className="grid grid-cols-2 gap-4 border-y border-slate-100 py-4">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Retail</p>
                                                        <p className="text-xs font-bold text-slate-700">{formatCurrency(selectedVariant?.priceB2C || 0)}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Grosir</p>
                                                        <p className="text-xs font-bold text-primary">{formatCurrency(selectedVariant?.priceB2B || 0)}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <SummaryRow label="Unit Price" value={formatCurrency(unitPrice)} />
                                                    <SummaryRow label="Quantity" value={`${safeQuantity.toLocaleString()} pcs`} />
                                                    {useValve && <SummaryRow label="Valve" value={formatCurrency(product.addons?.valvePrice * safeQuantity)} />}
                                                </div>
                                                <div className="pt-4 border-t border-slate-100">
                                                    <div className="flex items-center justify-between mb-6">
                                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Total</p>
                                                        <p className="text-2xl font-black text-slate-900">{formatCurrency(totalPrice)}</p>
                                                    </div>
                                                    <button
                                                        onClick={handleAddToCart}
                                                        disabled={isAdmin || !selectedVariant || displayedStock <= 0}
                                                        className="w-full h-16 rounded-2xl bg-primary text-white flex items-center justify-center gap-3 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary/20"
                                                    >
                                                        <ShoppingCart size={22} />
                                                        <span className="text-lg font-black">{isAdmin ? 'Mode Admin' : 'Checkout Sekarang'}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="rounded-3xl bg-slate-50 p-6 border border-slate-100">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 text-center">Informasi Pengiriman</p>
                                            <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                                                Estimasi pengerjaan 3-5 hari kerja setelah pembayaran dikonfirmasi.
                                            </p>
                                        </div>
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

const SpecCard = ({ icon, label, value, highlight }) => {
    const Icon = icon;

    return (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
            <Icon className="mx-auto mb-2 h-5 w-5 text-primary" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
            <p className={`mt-1 text-sm font-bold ${highlight ? 'text-red-500' : 'text-slate-800'}`}>{value}</p>
        </div>
    );
};

const SummaryRow = ({ label, value, danger }) => (
    <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold text-slate-400">{label}</p>
        <p className={`text-xs font-black ${danger ? 'text-red-500' : 'text-slate-800'}`}>{value}</p>
    </div>
);

const PriceRow = ({ label, value, highlight, accent, dark }) => (
    <div className="flex items-center justify-between gap-3">
        <p className={`text-xs font-bold ${dark ? 'text-white/60' : 'text-slate-400'}`}>{label}</p>
        <p className={`text-sm font-black ${dark
            ? 'text-white'
            : accent
                ? 'text-primary'
                : highlight
                    ? 'text-red-500'
                    : 'text-slate-700'
            }`}>
            {value}
        </p>
    </div>
);
