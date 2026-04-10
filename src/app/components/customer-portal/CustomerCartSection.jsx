import React from 'react';
import { Loader2, Package, Plus, ShoppingCart } from 'lucide-react';

export default function CustomerCartSection({
    cartItems = [],
    cartTotal = 0,
    cartQuantity = 0,
    checkingOutCart = false,
    formatCurrency,
    onAddItem,
    onClearCart,
    onRemoveItem,
    onCheckout
}) {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-400">{cartItems.length} item tersimpan di keranjang</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-300">Keranjang lokal perangkat ini</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onAddItem}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus size={16} /> Tambah Item
                    </button>
                    <button
                        onClick={onClearCart}
                        disabled={cartItems.length === 0}
                        className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-slate-50 disabled:opacity-40"
                    >
                        Kosongkan
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <CartSummaryCard label="Total Item" value={cartItems.length} />
                <CartSummaryCard label="Total Kuantitas" value={`${cartQuantity.toLocaleString()} pcs`} />
                <CartSummaryCard label="Estimasi Total" value={formatCurrency(cartTotal)} accent />
            </div>

            {cartItems.length === 0 && (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-8 py-16 text-center">
                    <Package className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                    <p className="text-sm font-black uppercase tracking-widest text-slate-400">Keranjang masih kosong.</p>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {cartItems.map((item, index) => (
                    <CartItemCard
                        key={`${item.productId}-${item.variantId}-${item.useValve}-${index}`}
                        item={item}
                        formatCurrency={formatCurrency}
                        onRemove={() => onRemoveItem?.(item)}
                    />
                ))}
            </div>

            <div className="rounded-3xl border border-slate-100 bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/10">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Checkout Keranjang</p>
                        <p className="mt-2 text-lg font-black">Buat order dari semua item yang ada di keranjang.</p>
                        <p className="mt-1 text-sm font-medium text-white/60">Item yang gagal akan tetap tersimpan di keranjang.</p>
                    </div>
                    <button
                        onClick={onCheckout}
                        disabled={cartItems.length === 0 || checkingOutCart}
                        className="flex items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 text-sm font-black uppercase tracking-widest text-slate-900 transition-all hover:-translate-y-1 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                        {checkingOutCart ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShoppingCart className="h-5 w-5" />}
                        {checkingOutCart ? 'Memproses Checkout...' : 'Checkout Keranjang'}
                    </button>
                </div>
            </div>
        </div>
    );
}

const CartSummaryCard = ({ label, value, accent = false }) => (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <p className={`mt-2 font-black ${accent ? 'text-2xl text-primary' : 'text-3xl text-slate-800'}`}>{value}</p>
    </div>
);

const CartItemCard = ({ item, formatCurrency, onRemove }) => (
    <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-2xl bg-slate-100">
                {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                        <Package size={22} />
                    </div>
                )}
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">{item.productCategory || 'Produk'}</p>
                <p className="font-black text-slate-800">{item.name}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">{item.selectedSize} • {item.selectedColor} • {item.sku || '-'}</p>
                <p className="mt-1 text-xs font-bold text-slate-400">{item.quantity} pcs {item.useValve ? '• Dengan valve' : '• Tanpa valve'}</p>
                {item.failureMessage && (
                    <p className="mt-2 text-xs font-bold text-red-500">{item.failureMessage}</p>
                )}
            </div>
        </div>
        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
            <p className="text-lg font-black text-primary">{formatCurrency(item.totalPrice)}</p>
            <button
                onClick={onRemove}
                className="rounded-2xl bg-red-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-red-500 transition-all hover:bg-red-100"
            >
                Hapus
            </button>
        </div>
    </div>
);
