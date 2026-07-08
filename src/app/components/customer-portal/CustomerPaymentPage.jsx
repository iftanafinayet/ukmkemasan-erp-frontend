import React, { useEffect, useState } from 'react';
import { ArrowLeft, CreditCard, LoaderCircle, RefreshCw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import CustomerNavbar from './CustomerNavbar';
import api from '../../utils/api';
import { ENDPOINTS, storage } from '../../config/environment';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import MobilePaymentPage from './mobile/MobilePaymentPage';

const SANDBOX_SNAP_URL = 'https://app.sandbox.midtrans.com/snap/snap.js';
const PRODUCTION_SNAP_URL = 'https://app.midtrans.com/snap/snap.js';

let snapScriptPromise = null;

const loadMidtransSnapScript = ({ clientKey, isProduction = false }) => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Browser environment tidak tersedia'));
  }

  if (window.snap && window.__midtransClientKey === clientKey) {
    return Promise.resolve(window.snap);
  }

  if (!clientKey) {
    return Promise.reject(new Error('Midtrans client key belum tersedia'));
  }

  snapScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-midtrans-snap="true"]');
    if (existingScript) {
      existingScript.remove();
      window.snap = undefined;
    }

    const script = document.createElement('script');
    script.src = import.meta.env.VITE_MIDTRANS_SNAP_URL || (isProduction ? PRODUCTION_SNAP_URL : SANDBOX_SNAP_URL);
    script.async = true;
    script.dataset.clientKey = clientKey;
    script.dataset.midtransSnap = 'true';
    script.onload = () => {
      window.__midtransClientKey = clientKey;
      resolve(window.snap);
    };
    script.onerror = () => reject(new Error('Gagal memuat Midtrans Snap'));
    document.body.appendChild(script);
  });

  return snapScriptPromise;
};
export default function CustomerPaymentPage() {
  const navigate = useNavigate();
  const { id: orderId } = useParams();
  const [loading, setLoading] = useState(true);
  const [creatingToken, setCreatingToken] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const fetchPaymentData = async () => {
    setLoading(true);
    try {
      const response = await api.get(ENDPOINTS.PAYMENT_ORDER(orderId));
      setPaymentData(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memuat halaman pembayaran.');
      navigate('/portal?menu=orders', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const handlePayNow = async () => {
    const midtransClientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || paymentData?.midtrans?.clientKey || '';

    if (!midtransClientKey) {
      toast.error('Midtrans client key belum tersedia di frontend maupun backend.');
      return;
    }

    setCreatingToken(true);
    try {
      await loadMidtransSnapScript({
        clientKey: midtransClientKey,
        isProduction: Boolean(paymentData?.midtrans?.isProduction),
      });
      const response = await api.post(ENDPOINTS.MIDTRANS_SNAP_TOKEN(orderId));

      if (!window.snap?.pay) {
        throw new Error('Midtrans Snap belum tersedia di browser');
      }

      window.snap.pay(response.data.token, {
        onSuccess: async () => {
          toast.success('Pembayaran berhasil. Status akan diperbarui setelah verifikasi Midtrans.');
          await fetchPaymentData();
        },
        onPending: async () => {
          toast.info('Transaksi dibuat. Selesaikan pembayaran Anda di kanal yang dipilih.');
          await fetchPaymentData();
        },
        onError: () => {
          toast.error('Pembayaran gagal diproses oleh Midtrans.');
        },
        onClose: () => {
          toast.message('Popup pembayaran ditutup sebelum transaksi selesai.');
        },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Gagal memulai pembayaran Midtrans.');
    } finally {
      setCreatingToken(false);
    }
  };

  const user = storage.getUser();
  const order = paymentData?.order;
  const invoice = paymentData?.invoice;
  const payments = paymentData?.payments || [];
  const summary = paymentData?.paymentSummary;
  const outstandingAmount = Number(summary?.outstandingAmount || 0);
  const isPaid = Boolean(summary?.isPaid);

  return (
    <>
      <div className="lg:hidden">
        <MobilePaymentPage
          loading={loading}
          creatingToken={creatingToken}
          paymentData={paymentData}
          onPayNow={handlePayNow}
          onRefresh={fetchPaymentData}
          onBack={() => navigate('/portal?menu=orders')}
        />
      </div>
      <div className="hidden lg:flex min-h-screen bg-transparent text-on-surface flex-col">
        <div
          className="fixed inset-0 -z-10 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "url('/background/bg.svg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
          }}
        />
        <CustomerNavbar activeMenu="orders" />

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 pb-20 pt-24 sm:px-8">
          {/* Header Style matching Catalog/Cart */}
          <section className="relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-primary font-bold text-[11px] uppercase tracking-[0.2em] mb-1 block">Portal Pembayaran</p>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-on-surface font-headline">Pembayaran</h1>
              </div>
              <button
                onClick={fetchPaymentData}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-outline-variant/20 bg-surface-container-lowest shadow-card transition hover:bg-surface-container-low focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <RefreshCw className={loading ? 'animate-spin' : ''} size={20} />
              </button>
            </div>

            <div className="mt-2">
              <p className="mt-2 text-on-surface-variant">Selesaikan transaksi pembayaran untuk pesanan Anda.</p>
            </div>
          </section>

          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center rounded-[20px] border border-dashed border-outline-variant bg-surface-container-lowest">
              <div className="flex items-center gap-3 text-on-surface-variant">
                <LoaderCircle className="animate-spin" />
                Memuat data pembayaran...
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="bg-surface-container-lowest p-5 rounded-[20px] shadow-card border border-outline-variant/20 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-[22px]">receipt_long</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted">Total Tagihan</p>
                    <p className="text-2xl font-black text-on-surface leading-none">{formatCurrency(summary?.totalAmount)}</p>
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-5 rounded-[20px] shadow-card border border-outline-variant/20 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-[22px]">payments</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted">Sudah Dibayar</p>
                    <p className="text-2xl font-black text-on-surface leading-none">{formatCurrency(summary?.paidAmount)}</p>
                  </div>
                </div>

                <div className="relative overflow-hidden bg-primary p-5 rounded-[20px] shadow-card shadow-primary/20 flex items-center gap-4">
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                  <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0 relative z-10">
                    <span className="material-symbols-outlined text-white text-[22px]">pending</span>
                  </div>
                  <div className="min-w-0 relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-wider text-white/60">Sisa Tagihan</p>
                    <p className="text-2xl font-black text-on-primary leading-none">{formatCurrency(outstandingAmount)}</p>
                  </div>
                </div>
              </div>

              {/* Middle Section - 2 Grid: Invoice Left, Konfirmasi Right */}
              <div className="grid gap-8 lg:grid-cols-[1fr_0.4fr]">
                <div className="rounded-[20px] border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-card h-fit">
                  <div className="flex flex-col gap-4 border-b border-outline-variant/20 pb-8 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-muted">Invoice</p>
                      <h2 className="mt-2 text-3xl font-black tracking-tight text-on-surface">{invoice?.invoiceNumber || 'Draft'}</h2>
                      <p className="mt-2 text-sm text-on-surface-variant">
                        Diterbitkan {formatDate(invoice?.issuedDate)} • Jatuh tempo {formatDate(invoice?.dueDate)}
                      </p>
                    </div>
                    <div className={`inline-flex items-center rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-widest ${isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                      {isPaid ? 'Lunas' : invoice?.status || 'Menunggu'}
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="rounded-2xl bg-surface-container-low p-8">
                      <p className="text-[10px] font-black uppercase tracking-wider text-muted">Ringkasan Pesanan</p>
                      <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2 text-sm">
                        <div className="flex justify-between gap-4 border-b border-outline-variant/20 pb-4 sm:border-0 sm:pb-0">
                          <span className="text-on-surface-variant">Produk</span>
                          <span className="font-bold text-on-surface">{order?.product?.name || '-'}</span>
                        </div>
                        <div className="flex justify-between gap-4 border-b border-outline-variant/20 pb-4 sm:border-0 sm:pb-0">
                          <span className="text-on-surface-variant">Jumlah</span>
                          <span className="font-bold text-on-surface">{order?.details?.quantity?.toLocaleString?.() || 0} pcs</span>
                        </div>
                        <div className="flex justify-between gap-4 border-b border-outline-variant/20 pb-4 sm:border-0 sm:pb-0">
                          <span className="text-on-surface-variant">Material</span>
                          <span className="font-bold text-on-surface">{order?.details?.material || order?.product?.material || '-'}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-on-surface-variant">Valve</span>
                          <span className="font-bold text-on-surface">{order?.details?.useValve ? 'Ya' : 'Tidak'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={handlePayNow}
                      disabled={creatingToken || isPaid || outstandingAmount <= 0}
                      className="flex-1 inline-flex items-center justify-center gap-3 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-on-primary shadow-card-hover shadow-primary/20 transition cursor-pointer hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      {creatingToken ? <LoaderCircle className="animate-spin" size={20} /> : <CreditCard size={20} />}
                      {isPaid ? 'Pesanan Sudah Lunas' : 'Bayar Sekarang'}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/portal?menu=orders')}
                      className="inline-flex items-center justify-center gap-3 rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-6 py-3.5 text-sm font-bold text-on-surface-variant transition cursor-pointer hover:bg-surface-container-low active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      <ArrowLeft size={20} />
                      Kembali
                    </button>
                  </div>
                </div>

                {/* Help/Konfirmasi Card - Right Side */}
                <div className="space-y-6">
                  <div className="rounded-[20px] bg-primary/5 border border-primary/10 p-6 shadow-card">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-primary text-[22px]">support_agent</span>
                    </div>
                    <h3 className="text-lg font-black font-headline text-on-surface">Butuh Bantuan?</h3>
                    <p className="mt-2 text-[13px] leading-6 text-on-surface-variant">
                      Jika status belum berubah beberapa menit setelah pembayaran selesai, silakan hubungi admin kami.
                    </p>
                    <div className="mt-6 space-y-3 border-t border-outline-variant/20 pt-6">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Order ID</p>
                        <p className="mt-1 text-sm font-bold text-on-surface">{order?.orderNumber || orderId}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Customer</p>
                        <p className="mt-1 text-sm font-bold text-on-surface">{user?.name || order?.customer?.name}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Ledger Section - Full Width Bottom */}
              {payments.length > 0 && (
                <div className="rounded-[20px] border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-card">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-muted">Riwayat Pembayaran</p>
                  <h3 className="mt-3 text-2xl font-black text-on-surface mb-8">Payment Ledger</h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {payments.map((payment) => (
                      <div key={payment._id || payment.paymentNumber} className="rounded-[20px] border border-outline-variant/20 bg-surface-container-low p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-black text-on-surface">{payment.paymentNumber}</p>
                            <p className="mt-1 text-xs font-medium text-on-surface-variant">
                              {formatDateTime(payment.paymentDate || payment.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black text-primary">{formatCurrency(payment.amount)}</p>
                            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted">{payment.method || 'Payment'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}
