import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';
import { ENDPOINTS, storage } from '../config/environment';
import { formatCurrency } from '../utils/formatters';
import { getCartItems, getSelectedCartItems, setCartItems as persistCartItems } from '../utils/cart';
import CustomerNavbar from './customer-portal/CustomerNavbar';
import ShippingSelector from './customer-portal/ShippingSelector';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [shipping, setShipping] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!storage.getToken()) {
      toast.info('Silahkan login terlebih dahulu untuk melakukan checkout.');
      navigate('/login?redirect=/portal?menu=cart');
      return;
    }
    const selected = getSelectedCartItems();
    if (selected.length === 0) {
      toast.error('Tidak ada item yang dipilih untuk checkout.');
      navigate('/portal?menu=cart');
      return;
    }
    setItems(selected);
  }, [navigate]);

  const subtotal = items.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
  const shippingCost = shipping?.cost || 0;
  const total = subtotal + shippingCost;

  const handleConfirm = async () => {
    if (!shipping) {
      toast.error('Pilih alamat tujuan & kurir (ongkir) terlebih dahulu.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId || undefined,
          quantity: Number(item.quantity) || 0,
          useValve: Boolean(item.useValve),
        })),
        shipping: {
          destinationId: shipping.destinationId,
          courierCode: shipping.courierCode,
          courierService: shipping.courierService,
          cost: shipping.cost,
          cashback: shipping.cashback,
          recipient: shipping.recipient,
        },
      };
      await api.post(ENDPOINTS.ORDERS, payload);
      const remaining = getCartItems().filter((item) => item.selected === false);
      persistCartItems(remaining);
      toast.success(`Checkout berhasil! ${items.length} item dalam 1 pesanan.`);
      setTimeout(() => navigate('/portal?menu=orders'), 400);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Checkout gagal. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-bright font-sans text-on-surface selection:bg-primary/20">
      <CustomerNavbar activeMenu="cart" onMenuChange={(menu) => navigate('/portal?menu=' + menu)} />

      <main className="mx-auto max-w-5xl px-4 pt-32 pb-24 sm:px-8">
        <button
          onClick={() => navigate('/portal?menu=cart')}
          className="group mb-8 flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-primary"
        >
          <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
          Kembali ke Keranjang
        </button>

        <div className="mb-10 flex items-center gap-3">
          <ShoppingBag className="h-9 w-9 text-primary" />
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 sm:text-4xl">Checkout Pesanan</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Kiri: alamat & pengiriman */}
          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
              <p className="mb-5 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Alamat & Pengiriman</p>
              <ShippingSelector
                items={items.map((it) => ({ productId: it.productId, variantId: it.variantId, quantity: it.quantity }))}
                itemValue={subtotal}
                value={shipping}
                onChange={setShipping}
                formatCurrency={formatCurrency}
              />
            </div>
          </div>

          {/* Kanan: ringkasan */}
          <div className="lg:col-span-2">
            <div className="sticky top-28 space-y-6">
              <div className="rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Item Pesanan</p>
                </div>
                <div className="divide-y divide-slate-50">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 px-5 py-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-400">{item.quantity} pcs @ {formatCurrency(item.unitPrice)}</p>
                      </div>
                      <p className="shrink-0 text-sm font-black text-primary">{formatCurrency(item.totalPrice)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-500">Subtotal Produk</span>
                  <span className="font-bold text-slate-800">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-500">Ongkir {shipping ? `(${shipping.serviceName})` : ''}</span>
                  <span className="font-bold text-slate-800">{shipping ? formatCurrency(shippingCost) : '—'}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-base">
                  <span className="font-black text-slate-700">Total</span>
                  <span className="font-black text-primary">{formatCurrency(total)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={!shipping || submitting}
                className="flex w-full items-center justify-center gap-2 rounded-3xl bg-primary py-4 text-base font-black text-white shadow-xl shadow-primary/30 transition-all hover:-translate-y-0.5 hover:bg-primary/90 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                Buat Pesanan
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
