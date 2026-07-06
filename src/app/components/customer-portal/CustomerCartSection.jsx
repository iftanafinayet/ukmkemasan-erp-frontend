import React, { useState, useMemo } from 'react';
import { Loader2, Pencil, CheckSquare, Square } from 'lucide-react';
import { updateCartItem } from '../../utils/cart';

export default function CustomerCartSection({
    cartItems = [],
    cartTotal = 0,
    cartQuantity = 0,
    checkingOutCart = false,
    formatCurrency,
    products = [],
    onAddItem,
    onClearCart,
    onRemoveItem,
    onCheckout,
    onToggleSelect,
    onSelectAll,
    selectedCount = 0,
    allSelected = false,
}) {
    const [editingId, setEditingId] = useState(null);
    const [editSize, setEditSize] = useState('');
    const [editColor, setEditColor] = useState('');
    const [editQty, setEditQty] = useState(0);

    const editingItem = useMemo(() => {
        if (editingId === null) return null;
        return cartItems[editingId] || null;
    }, [editingId, cartItems]);

    const editingProduct = useMemo(() => {
        if (!editingItem) return null;
        return products.find((p) => p._id === editingItem.productId) || null;
    }, [editingItem, products]);

    const editVariants = editingProduct?.variants || [];
    const editSizeOptions = [...new Set(editVariants.map((v) => v.size))];
    const editColorOptions = [...new Set(editVariants.map((v) => v.color))];

    const matchedVariant = editVariants.find((v) => v.size === editSize && v.color === editColor);

    const startEdit = (idx, item) => {
        setEditingId(idx);
        setEditSize(item.selectedSize || '');
        setEditColor(item.selectedColor || '');
        setEditQty(item.quantity || 0);
    };

    const saveEdit = () => {
        if (editingId === null || !matchedVariant) return;
        const unitPrice = editQty >= 1000 ? matchedVariant.priceB2B : matchedVariant.priceB2C;
        updateCartItem(
            (_, i) => i === editingId,
            {
                variantId: matchedVariant._id,
                selectedSize: matchedVariant.size,
                selectedColor: matchedVariant.color,
                sku: matchedVariant.sku,
                quantity: editQty,
                unitPrice,
                totalPrice: unitPrice * editQty,
                useValve: editingItem?.useValve || false,
            }
        );
        setEditingId(null);
    };

    const cancelEdit = () => setEditingId(null);

    const summaryCards = [
        { label: 'Total Item', value: String(cartItems.length).padStart(2, '0'), sub: 'Produk unik di keranjang', icon: 'inventory_2' },
        { label: 'Total Kuantitas', value: String(cartQuantity).padStart(2, '0'), sub: 'Total unit dipesan', icon: 'package_2' },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-36">
            <header>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-on-surface mb-1 font-headline">Keranjang Belanja</h1>
                <p className="text-on-surface-variant text-sm">Review pesanan Anda sebelum memproses ke pembayaran.</p>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {summaryCards.map((card) => (
                    <div key={card.label} className="bg-surface-container-lowest p-5 rounded-[20px] shadow-card border border-outline-variant/20 flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-primary text-[22px]">{card.icon}</span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-2xl font-black text-on-surface leading-none font-headline">{card.value}</p>
                            <p className="text-[10px] text-muted mt-1.5 uppercase tracking-wider font-bold">{card.label}</p>
                        </div>
                    </div>
                ))}
                <div className="relative overflow-hidden bg-primary p-5 rounded-[20px] shadow-card shadow-primary/20">
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                    <div className="relative">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/80 mb-1">Estimasi Total</p>
                        <p className="text-2xl font-black text-white font-headline">{formatCurrency(cartTotal)}</p>
                        <p className="text-[11px] text-white/70 mt-1.5">Termasuk biaya dasar produksi</p>
                    </div>
                </div>
            </div>

            {/* Select All */}
            {cartItems.length > 0 && (
                <div className="flex items-center justify-between px-1">
                    <button
                        onClick={onSelectAll}
                        className="flex items-center gap-2 text-sm font-bold text-primary hover:bg-primary/5 px-3 py-1.5 rounded-full transition-colors"
                    >
                        {allSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                        {allSelected ? 'Semua Terpilih' : 'Pilih Semua'}
                    </button>
                    <p className="text-sm text-on-surface-variant">
                        <span className="font-bold text-on-surface">{selectedCount}</span> dari {cartItems.length} produk dipilih
                    </p>
                </div>
            )}

            {/* Items */}
            <div className="space-y-4">
                {cartItems.length === 0 && (
                    <div className="rounded-[20px] border border-outline-variant/20 bg-surface-container-lowest shadow-card px-8 py-16 text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined !text-3xl text-primary">shopping_cart</span>
                        </div>
                        <p className="text-sm font-bold text-on-surface mb-1">Keranjang masih kosong</p>
                        <p className="text-xs text-muted mb-6">Yuk, cari produk kemasan terbaik untuk bisnis Anda!</p>
                        <button onClick={onAddItem} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-card-hover shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95">Mulai Belanja</button>
                    </div>
                )}

                {cartItems.map((item, index) => {
                    const isEditing = editingId === index;
                    return (
                        <div key={`${item.productId}-${item.variantId}-${item.useValve}-${index}`} className={`bg-surface-container-lowest p-4 md:p-5 rounded-[20px] shadow-card border transition-all ${item.selected !== false ? 'border-outline-variant/20 hover:shadow-card-hover' : 'border-error/30 opacity-60'}`}>
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-on-surface font-headline">Edit Item</h4>
                                        <div className="flex gap-2">
                                            <button onClick={cancelEdit} className="px-4 py-1.5 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors">Batal</button>
                                            <button onClick={saveEdit} disabled={!matchedVariant} className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50">Simpan</button>
                                        </div>
                                    </div>
                                    {editingProduct && (
                                        <div className="flex items-center gap-4 p-3 bg-surface-container-low rounded-xl">
                                            {editingProduct.images?.[0] && <img src={editingProduct.images[0].url} alt={editingProduct.name} className="w-12 h-12 rounded-lg object-cover" />}
                                            <div>
                                                <p className="text-sm font-bold text-on-surface">{editingProduct.name}</p>
                                                <p className="text-xs text-muted">{editingProduct.category}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Ukuran</label>
                                            <select value={editSize} onChange={(e) => setEditSize(e.target.value)} className="w-full rounded-xl bg-surface-container-low border-none px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary">
                                                <option value="">Pilih ukuran</option>
                                                {editSizeOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Warna</label>
                                            <select value={editColor} onChange={(e) => setEditColor(e.target.value)} className="w-full rounded-xl bg-surface-container-low border-none px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary">
                                                <option value="">Pilih warna</option>
                                                {editColorOptions.filter((c) => !editSize || editVariants.some((v) => v.size === editSize && v.color === c)).map((c) => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Jumlah (pcs)</label>
                                        <input type="number" value={editQty} onChange={(e) => setEditQty(Number(e.target.value) || 0)} min={editingProduct?.minOrder || 1} step={editingProduct?.minOrder || 1}
                                            className="w-full rounded-xl bg-surface-container-low border-none px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
                                    </div>
                                    {matchedVariant && (
                                        <div className="flex items-center justify-between text-sm bg-primary/10 rounded-xl p-3">
                                            <span className="text-primary font-medium">{matchedVariant.size} • {matchedVariant.color}</span>
                                            <span className="text-primary font-bold">{formatCurrency(editQty >= 1000 ? matchedVariant.priceB2B : matchedVariant.priceB2C)}/pcs</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => onToggleSelect?.(index)}
                                        className="shrink-0 self-center p-1 text-outline-variant hover:text-primary transition-colors"
                                        title={item.selected !== false ? 'Batalkan pilihan' : 'Pilih item'}
                                    >
                                        {item.selected !== false
                                            ? <CheckSquare size={20} className="text-primary" />
                                            : <Square size={20} />}
                                    </button>
                                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-surface-container-low border border-outline-variant/20 shrink-0">
                                        {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                            : <div className="flex h-full w-full items-center justify-center"><span className="material-symbols-outlined !text-3xl text-muted">image</span></div>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="min-w-0">
                                                <span className="text-[9px] font-black tracking-widest uppercase text-primary px-2 py-0.5 rounded bg-primary/10 mb-1.5 inline-block">{item.productCategory || 'Custom'}</span>
                                                <h4 className="text-[16px] font-bold text-on-surface font-headline leading-tight line-clamp-1">{item.name}</h4>
                                                <p className="text-[12px] text-on-surface-variant mt-0.5">{item.selectedSize || 'Standard'} • {item.selectedColor || 'Mix'} {item.sku ? `• ${item.sku}` : ''}</p>
                                                <p className="mt-1 text-[11px] font-bold text-primary">{item.quantity} pcs {item.useValve ? '• Dengan valve' : ''}</p>
                                                {item.failureMessage && <p className="mt-2 text-xs font-bold text-error">{item.failureMessage}</p>}
                                            </div>
                                            <p className="text-lg font-black text-primary font-headline shrink-0">{formatCurrency(item.totalPrice)}</p>
                                        </div>
                                        <div className="flex items-center gap-2 mt-3">
                                            <button onClick={() => startEdit(index, item)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:bg-primary/5 px-3 py-1.5 rounded-full transition-colors">
                                                <Pencil size={14} /> Edit
                                            </button>
                                            <button onClick={() => onRemoveItem?.(item)} className="flex items-center gap-1.5 text-error font-semibold text-sm hover:bg-error/5 px-3 py-1.5 rounded-full transition-colors">
                                                <span className="material-symbols-outlined text-[18px]">delete</span> Hapus
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Sticky Bottom Bar */}
            {cartItems.length > 0 && (
                <div className="fixed bottom-0 left-0 w-full bg-surface-container-lowest/90 backdrop-blur-xl border-t border-outline-variant/20 z-40">
                    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-6 sm:gap-8 w-full sm:w-auto">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-wider text-muted mb-0.5">Dipilih</p>
                                <p className="text-on-surface font-bold text-sm">{selectedCount} Produk <span className="text-outline-variant mx-1">|</span> {cartQuantity} pcs</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-wider text-muted mb-0.5">Total Dibayar</p>
                                <p className="text-xl font-black text-primary font-headline truncate">{formatCurrency(cartTotal)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button onClick={onClearCart} disabled={cartItems.length === 0} className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl border border-outline-variant text-on-surface-variant font-bold hover:bg-surface-container-low transition-all active:scale-95 text-sm whitespace-nowrap disabled:opacity-50">Hapus Semua</button>
                            <button onClick={onCheckout} disabled={selectedCount === 0 || checkingOutCart} className="flex-1 sm:flex-none px-8 py-3.5 rounded-xl bg-primary text-on-primary font-bold shadow-card-hover shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm whitespace-nowrap disabled:opacity-50">
                                {checkingOutCart ? <Loader2 className="h-5 w-5 animate-spin" /> : `Checkout ${selectedCount} Item`}
                                {!checkingOutCart && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
