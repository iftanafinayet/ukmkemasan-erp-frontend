import React from 'react';
import { Loader2, CheckSquare, Square } from 'lucide-react';
import { storage } from '../../../config/environment';
import { useNavigate } from 'react-router-dom';

export default function MobileCartPage({
    cartItems = [],
    cartTotal = 0,
    cartQuantity = 0,
    checkingOutCart = false,
    formatCurrency,
    onAddItem,
    onClearCart,
    onRemoveItem,
    onCheckout,
    onBack,
    onToggleSelect,
    onSelectAll,
    selectedCount = 0,
    allSelected = false,
}) {
    const navigate = useNavigate();
    const isLoggedIn = !!storage.getToken();

    if (!isLoggedIn) {
      return (
        <div className="lg:hidden bg-background min-h-[calc(100vh-112px)] flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-primary text-4xl">shopping_cart</span>
          </div>
          <h2 className="text-xl font-bold text-on-surface mb-2 font-headline">Login Diperlukan</h2>
          <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
            Silakan login terlebih dahulu untuk melihat isi keranjang belanja dan memproses pesanan Anda.
          </p>
          <button 
            onClick={() => navigate('/login?redirect=/portal?menu=cart')}
            className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold text-sm shadow-card-hover shadow-primary/20 active:scale-95 transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Masuk Sekarang
          </button>
        </div>
      );
    }

    return (
        <div className="lg:hidden bg-background min-h-screen pb-40">
            <header className="px-4 h-14 flex items-center gap-3 border-b border-outline-variant/20 sticky top-0 bg-surface-container-lowest z-10">
              <button onClick={onBack} className="p-1">
                <span className="material-symbols-outlined text-on-surface">arrow_back</span>
              </button>
              <h2 className="text-[18px] font-bold text-on-surface font-headline">Keranjang Belanja</h2>
              {cartItems.length > 0 && (
                <button onClick={onClearCart} className="ml-auto text-[12px] font-bold text-error">Hapus Semua</button>
              )}
            </header>

            <main className="p-4">
                {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center mb-6">
                          <span className="material-symbols-outlined text-muted text-5xl">shopping_cart</span>
                        </div>
                        <p className="text-on-surface font-bold text-lg mb-2">Keranjang Anda Kosong</p>
                        <p className="text-muted text-sm mb-8">Yuk, cari produk kemasan terbaik untuk bisnis Anda!</p>
                        <button
                          onClick={onAddItem}
                          className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold text-sm shadow-card-hover shadow-primary/20 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                           Mulai Belanja
                        </button>
                    </div>
                ) : (
                    <div className="w-full">
                    <div className="flex items-center justify-between px-1 py-2">
                        <button onClick={onSelectAll} className="flex items-center gap-1.5 text-[12px] font-bold text-primary">
                            {allSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                            {allSelected ? 'Semua Terpilih' : 'Pilih Semua'}
                        </button>
                        <span className="text-[11px] text-muted">{selectedCount} dipilih</span>
                    </div>
                    <div className="space-y-4">
                        {cartItems.map((item, index) => (
                            <div key={`${item.productId}-${item.variantId}-${item.useValve}-${index}`} className={`bg-surface-container-lowest p-4 rounded-2xl flex gap-4 shadow-card border ${item.selected !== false ? 'border-outline-variant/10' : 'border-error/40 opacity-60'}`}>
                                <button onClick={() => onToggleSelect?.(index)} className="shrink-0 self-center p-1">
                                    {item.selected !== false
                                        ? <CheckSquare size={18} className="text-primary" />
                                        : <Square size={18} className="text-muted" />}
                                </button>
                                <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-container-low shrink-0 border border-outline-variant/20">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <span className="material-symbols-outlined text-muted">image</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <h4 className="text-[14px] font-bold text-on-surface line-clamp-2 leading-tight font-headline">{item.name}</h4>
                                        <button onClick={() => onRemoveItem?.(item)} className="p-1 text-muted active:text-error">
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-muted mt-1 font-medium">
                                      {item.selectedSize} • {item.selectedColor} {item.useValve ? '• Valve' : ''}
                                    </p>
                                    <div className="flex justify-between items-end mt-2">
                                        <p className="text-[14px] font-bold text-primary font-headline">{formatCurrency(item.totalPrice)}</p>
                                        <div className="flex items-center bg-surface-container-low rounded-lg px-2 py-1 gap-3">
                                            <span className="font-bold text-[12px] text-on-surface">{item.quantity.toLocaleString()} pcs</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    </div>
                )}
            </main>

            {/* Bottom Sticky Action */}
            {cartItems.length > 0 && (
                <div className="fixed bottom-14 left-0 w-full bg-surface-container-lowest border-t border-outline-variant/20 p-4 z-40 lg:hidden shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)]">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Estimasi Total</p>
                            <p className="text-[18px] font-bold text-primary font-headline">{formatCurrency(cartTotal)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-muted font-bold uppercase tracking-wider">{selectedCount} Produk Dipilih</p>
                            <p className="text-[14px] font-bold text-on-surface">{cartQuantity.toLocaleString()} pcs</p>
                        </div>
                    </div>
                    <button 
                        onClick={onCheckout} 
                        disabled={selectedCount === 0 || checkingOutCart} 
                        className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 shadow-card-hover shadow-primary/20 active:scale-95 transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                        {checkingOutCart ? <Loader2 className="h-5 w-5 animate-spin" /> : `Checkout ${selectedCount} Item`}
                    </button>
                </div>
            )}
        </div>
    );
}
