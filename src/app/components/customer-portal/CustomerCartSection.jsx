import React from 'react';
import { Loader2 } from 'lucide-react';

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
        <div className="space-y-12 animate-in fade-in duration-500 pb-32">
            {/* Editorial Header */}
            <header className="mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">Keranjang Belanja</h1>
                <p className="text-on-secondary-container font-medium opacity-80 font-body">Review pesanan Anda sebelum memproses ke pembayaran.</p>
            </header>

            {/* Bento Grid Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/15 relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-1 font-label">Total Item</p>
                        <h3 className="text-3xl font-extrabold text-primary font-headline">{String(cartItems.length).padStart(2, '0')}</h3>
                        <p className="text-sm text-on-secondary-container mt-2 font-body">Produk unik di keranjang</p>
                    </div>
                    <span className="material-symbols-outlined absolute -bottom-4 -right-4 !text-8xl text-primary/5 transition-transform group-hover:scale-110">inventory_2</span>
                </div>
                
                <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/15 relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-1 font-label">Total Kuantitas</p>
                        <h3 className="text-3xl font-extrabold text-primary font-headline">{String(cartQuantity).padStart(2, '0')}</h3>
                        <p className="text-sm text-on-secondary-container mt-2 font-body">Total unit dipesan</p>
                    </div>
                    <span className="material-symbols-outlined absolute -bottom-4 -right-4 !text-8xl text-primary/5 transition-transform group-hover:scale-110">package_2</span>
                </div>

                <div className="bg-primary p-6 rounded-xl shadow-[0_12px_32px_-4px_rgba(0,106,98,0.15)] relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-xs font-bold uppercase tracking-widest text-primary-fixed mb-1 font-label">Estimasi Total</p>
                        <h3 className="text-3xl font-extrabold text-on-primary font-headline">{formatCurrency(cartTotal)}</h3>
                        <p className="text-sm text-primary-fixed/80 mt-2 font-body">Termasuk biaya dasar produksi</p>
                    </div>
                    <span className="material-symbols-outlined absolute -bottom-4 -right-4 !text-8xl text-white/10 transition-transform group-hover:scale-110">payments</span>
                </div>
            </div>

            {/* Cart Items List */}
            <div className="space-y-6">
                {cartItems.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-outline-variant/30 bg-surface-container-lowest px-8 py-16 text-center">
                        <span className="material-symbols-outlined mx-auto mb-4 !text-5xl text-outline-variant/50">shopping_cart</span>
                        <p className="text-sm font-bold uppercase tracking-widest text-on-secondary-container">Keranjang masih kosong.</p>
                        <button
                          onClick={onAddItem}
                          className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-black text-white shadow-md transition-all hover:scale-105 active:scale-95"
                        >
                           Mulai Belanja
                        </button>
                    </div>
                )}
                
                {cartItems.map((item, index) => (
                    <div key={`${item.productId}-${item.variantId}-${item.useValve}-${index}`} className="bg-surface-container-lowest p-6 rounded-xl flex flex-col md:flex-row md:items-center gap-6 shadow-sm border border-outline-variant/10 hover:shadow-md transition-shadow">
                        <div className="w-32 h-32 rounded-lg overflow-hidden bg-surface-container shrink-0">
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-primary/30">
                                    <span className="material-symbols-outlined !text-4xl text-outline-variant">image</span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2 gap-4">
                                <div>
                                    <span className="text-[10px] font-bold tracking-widest uppercase text-tertiary px-2 py-0.5 rounded bg-tertiary-fixed mb-2 inline-block font-label">{item.productCategory || 'Custom'}</span>
                                    <h4 className="text-xl font-bold text-on-surface font-headline">{item.name}</h4>
                                    <p className="text-sm text-secondary font-body">{item.selectedSize || 'Standard'} • {item.selectedColor || 'Mix'} {item.sku ? `• ${item.sku}` : ''}</p>
                                    <p className="mt-1 text-xs font-bold text-tertiary">{item.quantity} pcs {item.useValve ? '• Dengan valve' : ''}</p>
                                    {item.failureMessage && (
                                        <p className="mt-2 text-xs font-bold text-error">{item.failureMessage}</p>
                                    )}
                                </div>
                                <p className="text-lg font-bold text-primary font-headline shrink-0">{formatCurrency(item.totalPrice)}</p>
                            </div>
                            <div className="flex items-center justify-between mt-4 md:mt-6">
                                <div className="flex items-center bg-surface-container-low rounded-full px-4 py-2 gap-4">
                                    <button disabled className="text-outline hover:text-primary transition-colors disabled:opacity-50"><span className="material-symbols-outlined text-sm">remove</span></button>
                                    <span className="font-bold text-sm w-8 text-center font-headline">{item.quantity}</span>
                                    <button disabled className="text-outline hover:text-primary transition-colors disabled:opacity-50"><span className="material-symbols-outlined text-sm">add</span></button>
                                </div>
                                <button onClick={() => onRemoveItem?.(item)} className="flex items-center gap-2 text-error font-semibold text-sm hover:bg-error-container/20 px-4 py-2 rounded-full transition-colors font-body">
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Checkout Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-slate-100 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-6 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
                    <div className="flex items-center gap-4 sm:gap-8 w-full md:w-auto overflow-hidden">
                        <div>
                            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-secondary mb-1 font-label">Items Selected</p>
                            <p className="text-on-surface font-bold text-sm sm:text-base font-body">{cartItems.length} Products <span className="text-outline-variant mx-1 sm:mx-2">|</span> {cartQuantity} Units</p>
                        </div>
                        <div>
                            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-secondary mb-1 font-label">Total Payable</p>
                            <p className="text-xl sm:text-2xl font-extrabold text-primary font-headline truncate">{formatCurrency(cartTotal)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button onClick={onClearCart} disabled={cartItems.length === 0} className="flex-1 md:flex-none px-6 sm:px-8 py-3 sm:py-4 rounded-full border border-outline text-secondary font-bold hover:bg-surface-container transition-all active:scale-95 text-xs sm:text-sm whitespace-nowrap disabled:opacity-50">
                            Hapus Semua
                        </button>
                        <button onClick={onCheckout} disabled={cartItems.length === 0 || checkingOutCart} className="flex-1 md:flex-none px-8 sm:px-12 py-3 sm:py-4 rounded-full bg-primary text-on-primary font-bold shadow-[0_8px_24px_-4px_rgba(0,106,98,0.3)] hover:bg-primary-container transition-all active:scale-95 flex items-center justify-center gap-2 text-xs sm:text-sm whitespace-nowrap disabled:opacity-50">
                            {checkingOutCart ? <Loader2 className="h-4 sm:h-5 w-4 sm:w-5 animate-spin" /> : 'Checkout Keranjang'}
                            {!checkingOutCart && <span className="material-symbols-outlined text-sm sm:text-base">arrow_forward</span>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
