import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { ENDPOINTS, storage } from '../config/environment';
import CustomerSidebar from './CustomerSidebar';
import {
    ArrowLeft, Loader2, ShoppingCart, Info, Package, DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

export default function CreateOrderPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialProductId = searchParams.get('productId') || '';

    const user = storage.getUser();

    // Redirect admin if they accidentally land here
    useEffect(() => {
        if (user?.role === 'admin') {
            navigate('/admin');
        }
    }, [user, navigate]);

    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [creatingOrder, setCreatingOrder] = useState(false);

    const [orderForm, setOrderForm] = useState({
        productId: initialProductId,
        quantity: 100,
        useValve: false
    });

    const fetchProducts = useCallback(async () => {
        setLoadingProducts(true);
        try {
            const res = await api.get(ENDPOINTS.PRODUCTS);
            setProducts(res.data);

            // Auto-select first product if non provided from URL
            if (!initialProductId && res.data.length > 0) {
                setOrderForm(prev => ({ ...prev, productId: res.data[0]._id }));
            }
        } catch {
            toast.error('Gagal memuat daftar produk.');
        } finally {
            setLoadingProducts(false);
        }
    }, [initialProductId]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        if (!orderForm.productId) {
            return toast.error('Silakan pilih produk terlebih dahulu.');
        }

        setCreatingOrder(true);
        try {
            await api.post(ENDPOINTS.ORDERS, orderForm);
            toast.success('Pesanan berhasil dibuat!');

            // Ensure the portal dashboard refreshes after redirecting
            setTimeout(() => navigate('/portal'), 500);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Gagal membuat pesanan.');
        } finally {
            setCreatingOrder(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    // Calculate currently selected product pricing
    const selectedProduct = products.find(p => p._id === orderForm.productId);
    const qty = orderForm.quantity;
    const basePrice = selectedProduct ? (qty >= 1000 ? selectedProduct.priceB2B : selectedProduct.priceB2C) : 0;
    const valvePrice = (orderForm.useValve && selectedProduct?.addons?.valvePrice) ? selectedProduct.addons.valvePrice : 0;
    const totalPrice = (basePrice + valvePrice) * qty;

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-primary/20 lg:h-screen">
            <CustomerSidebar activeMenu="" onMenuChange={() => navigate('/portal')} />

            <main className="flex-1 overflow-y-auto overflow-x-hidden">
                <div className="mx-auto max-w-4xl px-4 pb-6 pt-20 sm:px-6 sm:pb-8 lg:px-12 lg:py-8">
                    {/* Top Bar */}
                    <div className="flex items-center mb-10">
                        <button onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-slate-500 hover:text-primary font-bold text-sm transition-colors group">
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            Kembali
                        </button>
                    </div>

                    <div className="mb-10">
                        <h1 className="flex items-center gap-3 text-3xl font-black tracking-tighter text-slate-900 capitalize sm:gap-4 sm:text-4xl">
                            <ShoppingCart className="w-10 h-10 text-primary" />
                            Buat Pesanan Baru
                        </h1>
                        <p className="text-slate-500 font-medium mt-2">Pilih jenis kemasan, jumlah pesanan, dan opsi tambahan.</p>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 sm:p-8 lg:p-10">
                            {loadingProducts ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Memuat katalog...</p>
                                </div>
                            ) : (
                                <form onSubmit={handleCreateOrder} className="space-y-8">
                                    {/* Product Selection */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Package size={16} /> Pilih Kemasan
                                        </label>
                                        <select
                                            required
                                            disabled={products.length === 0}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 font-bold appearance-none cursor-pointer"
                                            value={orderForm.productId}
                                            onChange={(e) => setOrderForm({ ...orderForm, productId: e.target.value })}
                                        >
                                            <option value="" disabled>Pilih Produk...</option>
                                            {products.map(p => (
                                                <option key={p._id} value={p._id}>
                                                    {p.name} ({p.category}) — Mulai {formatCurrency(p.priceB2B)}/pcs
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Quantity */}
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <span className="w-4 h-4 bg-primary/10 rounded-full flex items-center justify-center text-primary text-[10px]">#</span>
                                                Kuantitas (pcs)
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    required
                                                    min={100}
                                                    step={100}
                                                    className="w-full pl-6 pr-16 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 font-black text-xl"
                                                    value={orderForm.quantity}
                                                    onChange={(e) => setOrderForm({ ...orderForm, quantity: Number(e.target.value) })}
                                                />
                                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">pcs</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                <Info size={12} /> Minimal order 100 pcs. Harga lebih murah (B2B) untuk order ≥1000 pcs.
                                            </p>
                                        </div>

                                        {/* Addons */}
                                        <div className="space-y-3">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Tambahan Valve</label>
                                            <div className="flex gap-4 p-1">
                                                <label className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${orderForm.useValve ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`}>
                                                    <input type="radio" name="valve" checked={orderForm.useValve}
                                                        onChange={() => setOrderForm({ ...orderForm, useValve: true })} className="sr-only" />
                                                    <span className="font-black">Ya, Pakai</span>
                                                </label>
                                                <label className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${!orderForm.useValve ? 'border-primary bg-primary text-white' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`}>
                                                    <input type="radio" name="valve" checked={!orderForm.useValve}
                                                        onChange={() => setOrderForm({ ...orderForm, useValve: false })} className="sr-only" />
                                                    <span className="font-black">Tidak</span>
                                                </label>
                                            </div>
                                            {selectedProduct?.addons?.valvePrice > 0 && orderForm.useValve && (
                                                <p className="text-[10px] font-bold text-primary flex items-center gap-1">
                                                    + Tambahan biaya {formatCurrency(selectedProduct.addons.valvePrice)}/pcs
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Realtime Pricing Preview */}
                                    {selectedProduct && (
                                        <div className="bg-gradient-to-r from-primary to-primary p-6 rounded-3xl text-white shadow-xl shadow-primary/20 mt-10 sm:p-8">
                                            <div className="flex items-center gap-3 mb-6">
                                                <DollarSign className="w-6 h-6 text-white/90" />
                                                <p className="text-sm font-black uppercase tracking-widest text-white/90">Estimasi Biaya</p>
                                            </div>

                                            <div className="space-y-4 mb-6">
                                                <div className="flex justify-between items-end border-b border-white/20 pb-4">
                                                    <div>
                                                        <p className="text-white/80 text-xs font-bold mb-1">Harga Kemasan ({qty >= 1000 ? 'B2B/Grosir' : 'B2C/Retail'})</p>
                                                        <p className="text-white font-medium">{formatCurrency(basePrice)} <span className="text-xs text-white/60">× {qty} pcs</span></p>
                                                    </div>
                                                    <p className="font-bold text-white">{formatCurrency(basePrice * qty)}</p>
                                                </div>

                                                {orderForm.useValve && (
                                                    <div className="flex justify-between items-end border-b border-white/20 pb-4">
                                                        <div>
                                                            <p className="text-white/80 text-xs font-bold mb-1">Pemasangan Valve</p>
                                                            <p className="text-white font-medium">{formatCurrency(valvePrice)} <span className="text-xs text-white/60">× {qty} pcs</span></p>
                                                        </div>
                                                        <p className="font-bold text-white">{formatCurrency(valvePrice * qty)}</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
                                                <p className="text-white/90 text-sm font-bold">Total Harga</p>
                                                <p className="text-3xl font-black text-white tracking-tight sm:text-4xl">{formatCurrency(totalPrice)}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <button type="submit" disabled={creatingOrder || products.length === 0}
                                        className="w-full py-5 bg-primary text-white font-black text-lg rounded-3xl shadow-xl shadow-primary/30 hover:bg-primary/90 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:translate-y-0 mt-8">
                                        {creatingOrder ? <><Loader2 className="w-6 h-6 animate-spin" /> Memproses Pesanan...</> : 'Konfirmasi & Buat Pesanan'}
                                    </button>

                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
