import React, { useState, useEffect, useCallback } from 'react';
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

    const SidebarComponent = isAdmin ? Sidebar : CustomerSidebar;
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
        <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-primary/20 lg:h-screen">
            <SidebarComponent activeMenu={isAdmin ? 'inventory' : 'catalog'} onMenuChange={isAdmin ? handleMenuChange : undefined} />
            <main className="flex-1 overflow-y-auto overflow-x-hidden">
                <div className="mx-auto max-w-5xl px-4 pb-6 pt-20 sm:px-6 sm:pb-8 lg:p-8">
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
                            <div className="mb-8 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                                {product.images?.length > 0 ? (
                                    <div className="relative">
                                        <Carousel className="w-full" opts={{ loop: true, startIndex: activeImageIdx }}>
                                            <CarouselContent>
                                                {product.images.map((img, idx) => (
                                                    <CarouselItem key={idx}>
                                                        <div className="relative aspect-[16/9] overflow-hidden bg-slate-100 md:aspect-[21/9]">
                                                            <img
                                                                src={img.url}
                                                                alt={img.alt || product.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-6 pt-16 sm:p-8 sm:pt-20">
                                                                <p className="text-xs font-black uppercase tracking-widest text-white/60">{product.category}</p>
                                                                <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl md:text-4xl">{product.name}</h1>
                                                            </div>
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
                                    <div className="flex aspect-[21/9] flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
                                        <ImagePlus className="mb-3 h-16 w-16 text-primary/15" />
                                        <p className="text-sm font-bold uppercase tracking-widest text-primary/25">Belum ada foto</p>
                                    </div>
                                )}

                                {product.images?.length > 1 && (
                                    <div className="flex gap-3 overflow-x-auto p-4">
                                        {product.images.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setActiveImageIdx(idx)}
                                                className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                                                    activeImageIdx === idx
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

                            {(!product.images || product.images.length === 0) && (
                                <div className="mb-6">
                                    <p className="text-xs font-black uppercase tracking-widest text-primary">{product.category}</p>
                                    <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{product.name}</h1>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                                <div className="space-y-6 lg:col-span-2">
                                    {product.description && (
                                        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
                                            <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">Deskripsi</h3>
                                            <p className="leading-relaxed text-slate-600">{product.description}</p>
                                        </div>
                                    )}

                                    <VariantSelectorSection
                                        title="Pilih Varian"
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
                                        getVariantId={(variant) => variant._id}
                                        getVariantSku={(variant) => variant.sku || product.sku || '-'}
                                    />

                                    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
                                        <h3 className="mb-6 text-xs font-black uppercase tracking-widest text-slate-400">Spesifikasi</h3>
                                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
                                            <SpecCard icon={Layers} label="Kategori" value={product.category} />
                                            <SpecCard icon={Ruler} label="Material" value={product.material || '-'} />
                                            <SpecCard icon={Package} label="Jumlah Varian" value={`${variantCount} opsi`} />
                                            <SpecCard icon={Box} label="Min. Order" value={`${minimumOrder.toLocaleString()} pcs`} />
                                            <SpecCard
                                                icon={Package}
                                                label="Stok Varian"
                                                value={`${displayedStock.toLocaleString()} pcs`}
                                                highlight={displayedStock < minimumOrder}
                                            />
                                        </div>
                                    </div>

                                    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                                        <div className="flex flex-wrap gap-6 text-xs text-slate-400">
                                            {product.createdAt && (
                                                <div>
                                                    <p className="mb-1 text-[10px] font-black uppercase tracking-widest">Dibuat</p>
                                                    <p className="font-bold text-slate-600">{formatDate(product.createdAt)}</p>
                                                </div>
                                            )}
                                            {product.updatedAt && (
                                                <div>
                                                    <p className="mb-1 text-[10px] font-black uppercase tracking-widest">Terakhir Diupdate</p>
                                                    <p className="font-bold text-slate-600">{formatDate(product.updatedAt)}</p>
                                                </div>
                                            )}
                                            {product.images && (
                                                <div>
                                                    <p className="mb-1 text-[10px] font-black uppercase tracking-widest">Jumlah Foto</p>
                                                    <p className="font-bold text-slate-600">{product.images.length} gambar</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                                        <div className="bg-primary p-6">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Harga Varian</p>
                                            <p className="mt-1 text-3xl font-black text-white">
                                                {selectedVariant ? formatCurrency(baseVariantPrice) : 'Pilih varian'}
                                            </p>
                                            <p className="mt-1 text-xs font-bold text-white/60">{priceTierLabel} per pcs</p>
                                        </div>
                                        <div className="space-y-4 p-6">
                                            <PriceRow label="Ukuran" value={selectedVariant?.size || '-'} />
                                            <PriceRow label="Warna" value={selectedVariant?.color || '-'} />
                                            <PriceRow label="Stok Tersedia" value={`${displayedStock.toLocaleString()} pcs`} highlight={displayedStock < minimumOrder} />
                                            <PriceRow label="B2C (Retail)" value={formatCurrency(selectedVariant?.priceB2C || 0)} />
                                            <PriceRow label="B2B (>=1000 pcs)" value={formatCurrency(selectedVariant?.priceB2B || 0)} />
                                            {product.addons?.valvePrice > 0 && (
                                                <div className="border-t border-slate-100 pt-4">
                                                    <PriceRow label="+ Valve" value={`${formatCurrency(product.addons.valvePrice)}/pcs`} accent />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {!isAdmin && (
                                        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                                            <h3 className="mb-5 text-xs font-black uppercase tracking-widest text-slate-400">Konfigurasi Belanja</h3>

                                            <div className="space-y-5">
                                                <div>
                                                    <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Jumlah</p>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            min={minimumOrder}
                                                            step={minimumOrder}
                                                            max={selectedVariant?.stock || undefined}
                                                            value={safeQuantity}
                                                            onChange={(e) => setQuantity(Number(e.target.value) || minimumOrder)}
                                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 pr-16 text-xl font-black text-slate-800 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                                                        />
                                                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">pcs</span>
                                                    </div>
                                                    <p className="mt-2 text-[10px] font-bold text-slate-400">
                                                        Minimal order {minimumOrder.toLocaleString()} pcs. Gunakan kelipatan {minimumOrder.toLocaleString()} untuk alur order saat ini.
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Add-ons Valve</p>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => setUseValve(true)}
                                                            disabled={(product.addons?.valvePrice || 0) <= 0}
                                                            className={`rounded-2xl border-2 px-4 py-4 text-sm font-black transition-all ${
                                                                useValve
                                                                    ? 'border-primary bg-primary/5 text-primary'
                                                                    : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                                                            } disabled:cursor-not-allowed disabled:opacity-40`}
                                                        >
                                                            Pakai Valve
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setUseValve(false)}
                                                            className={`rounded-2xl border-2 px-4 py-4 text-sm font-black transition-all ${
                                                                !useValve
                                                                    ? 'border-primary bg-primary text-white'
                                                                    : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                                                            }`}
                                                        >
                                                            Tanpa Valve
                                                        </button>
                                                    </div>
                                                    {useValve && product.addons?.valvePrice > 0 && (
                                                        <p className="mt-2 text-[10px] font-bold text-primary">
                                                            Tambahan {formatCurrency(product.addons.valvePrice)}/pcs
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-6 rounded-3xl bg-slate-900 p-5 text-white">
                                                <div className="space-y-3 border-b border-white/10 pb-4">
                                                    <PriceRow label="Harga Kemasan" value={formatCurrency(baseVariantPrice)} dark />
                                                    <PriceRow label="Add-ons Valve" value={formatCurrency(valvePrice)} dark />
                                                    <PriceRow label="Quantity" value={`${safeQuantity.toLocaleString()} pcs`} dark />
                                                </div>
                                                <div className="mt-4 flex items-center justify-between">
                                                    <p className="text-sm font-bold text-white/70">Total Harga</p>
                                                    <p className="text-3xl font-black">{formatCurrency(totalPrice)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {!isAdmin && (
                                        <button
                                            onClick={handleAddToCart}
                                            disabled={!selectedVariant || displayedStock <= 0}
                                            className="flex w-full items-center justify-center gap-3 rounded-3xl bg-primary py-5 text-sm font-black text-white shadow-xl shadow-primary/30 transition-all hover:-translate-y-1 hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                                        >
                                            <ShoppingCart size={20} /> Tambah ke Keranjang
                                        </button>
                                    )}

                                    {isAdmin && (
                                        <div className="space-y-3">
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

                                    <div className={`rounded-2xl border p-5 text-center ${
                                        displayedStock < minimumOrder
                                            ? 'border-red-200 bg-red-50'
                                            : 'border-green-200 bg-green-50'
                                    }`}>
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${
                                            displayedStock < minimumOrder ? 'text-red-400' : 'text-green-500'
                                        }`}>
                                            {displayedStock <= 0 ? 'Stok Habis' : displayedStock < minimumOrder ? 'Stok Menipis' : 'Stok Tersedia'}
                                        </p>
                                        <p className={`mt-1 text-2xl font-black ${
                                            displayedStock < minimumOrder ? 'text-red-600' : 'text-green-700'
                                        }`}>
                                            {displayedStock.toLocaleString()} pcs
                                        </p>
                                        {selectedVariant && (
                                            <p className="mt-2 text-xs font-bold text-slate-500">
                                                {selectedVariant.size} • {selectedVariant.color}
                                            </p>
                                        )}
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

const PriceRow = ({ label, value, highlight, accent, dark }) => (
    <div className="flex items-center justify-between gap-3">
        <p className={`text-xs font-bold ${dark ? 'text-white/60' : 'text-slate-400'}`}>{label}</p>
        <p className={`text-sm font-black ${
            dark
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
