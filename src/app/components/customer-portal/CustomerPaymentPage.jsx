import React, { useEffect, useState } from 'react';
import { ArrowLeft, CreditCard, LoaderCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import CustomerNavbar from './CustomerNavbar';
import CustomerFooter from '../CustomerFooter';
import api from '../../utils/api';
import { ENDPOINTS, storage } from '../../config/environment';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';

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

const SummaryCard = ({ label, value, accent = false }) => (
  <div className={`rounded-3xl border p-5 ${accent ? 'border-primary/20 bg-primary/[0.06]' : 'border-slate-200 bg-white'}`}>
    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">{label}</p>
    <p className={`mt-3 text-2xl font-black tracking-tight ${accent ? 'text-primary' : 'text-slate-900'}`}>{value}</p>
  </div>
);

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
  const resolvedClientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || paymentData?.midtrans?.clientKey || '';

  return (
    <div className="min-h-screen bg-[#f6f3ed] text-slate-900">
      <CustomerNavbar activeMenu="orders" />
      
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 pb-20 pt-32 sm:px-8">
        {/* Header Style matching Catalog/Cart */}
        <section className="relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-primary">The Payment Portal</p>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">Pembayaran</h1>
            </div>
            <button
              onClick={fetchPaymentData}
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:bg-slate-50"
            >
              <RefreshCw className={loading ? 'animate-spin' : ''} size={20} />
            </button>
          </div>
          
          <div className="mt-12">
            <h2 className="text-4xl font-black text-slate-900">Pembayaran Pesanan</h2>
            <p className="mt-2 text-slate-500">Selesaikan transaksi pembayaran untuk pesanan Anda.</p>
          </div>
        </section>

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-[32px] border border-dashed border-slate-300 bg-white">
            <div className="flex items-center gap-3 text-slate-500">
              <LoaderCircle className="animate-spin" />
              Memuat data pembayaran...
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="relative overflow-hidden rounded-[32px] bg-white p-8 shadow-sm border border-slate-100/50">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Tagihan</p>
                <p className="mt-3 text-3xl font-black text-slate-900">{formatCurrency(summary?.totalAmount)}</p>
                <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-slate-50 opacity-50"></div>
              </div>
              
              <div className="relative overflow-hidden rounded-[32px] bg-white p-8 shadow-sm border border-slate-100/50">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sudah Dibayar</p>
                <p className="mt-3 text-3xl font-black text-slate-900">{formatCurrency(summary?.paidAmount)}</p>
                <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-slate-50 opacity-50"></div>
              </div>

              <div className="relative overflow-hidden rounded-[32px] bg-primary p-8 shadow-lg shadow-primary/20 text-white">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Sisa Tagihan</p>
                <p className="mt-3 text-3xl font-black">{formatCurrency(outstandingAmount)}</p>
                <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/10"></div>
              </div>
            </div>

            {/* Middle Section - 2 Grid: Invoice Left, Konfirmasi Right */}
            <div className="grid gap-8 lg:grid-cols-[1fr_0.4fr]">
              <div className="rounded-[40px] border border-slate-200 bg-white p-8 shadow-sm h-fit">
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-8 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Invoice</p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">{invoice?.invoiceNumber || 'Draft'}</h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Diterbitkan {formatDate(invoice?.issuedDate)} • Jatuh tempo {formatDate(invoice?.dueDate)}
                    </p>
                  </div>
                  <div className={`inline-flex items-center rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-widest ${
                    isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {isPaid ? 'Lunas' : invoice?.status || 'Menunggu'}
                  </div>
                </div>

                <div className="mt-8">
                  <div className="rounded-[32px] bg-slate-50 p-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Ringkasan Pesanan</p>
                    <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2 text-sm">
                      <div className="flex justify-between gap-4 border-b border-slate-200/60 pb-4 sm:border-0 sm:pb-0">
                        <span className="text-slate-500">Produk</span>
                        <span className="font-bold text-slate-900">{order?.product?.name || '-'}</span>
                      </div>
                      <div className="flex justify-between gap-4 border-b border-slate-200/60 pb-4 sm:border-0 sm:pb-0">
                        <span className="text-slate-500">Jumlah</span>
                        <span className="font-bold text-slate-900">{order?.details?.quantity?.toLocaleString?.() || 0} pcs</span>
                      </div>
                      <div className="flex justify-between gap-4 border-b border-slate-200/60 pb-4 sm:border-0 sm:pb-0">
                        <span className="text-slate-500">Material</span>
                        <span className="font-bold text-slate-900">{order?.details?.material || order?.product?.material || '-'}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Valve</span>
                        <span className="font-bold text-slate-900">{order?.details?.useValve ? 'Ya' : 'Tidak'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={handlePayNow}
                    disabled={creatingToken || isPaid || outstandingAmount <= 0}
                    className="flex-1 inline-flex items-center justify-center gap-3 rounded-3xl bg-primary px-8 py-5 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                  >
                    {creatingToken ? <LoaderCircle className="animate-spin" size={20} /> : <CreditCard size={20} />}
                    {isPaid ? 'Pesanan Sudah Lunas' : 'Bayar Sekarang'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/portal?menu=orders')}
                    className="inline-flex items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white px-8 py-5 text-sm font-black text-slate-600 transition hover:bg-slate-50 active:scale-[0.98]"
                  >
                    <ArrowLeft size={20} />
                    Kembali
                  </button>
                </div>
              </div>

              {/* Help/Konfirmasi Card - Right Side */}
              <div className="space-y-6">
                <div className="rounded-[40px] bg-emerald-50 border border-emerald-100 p-8 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Konfirmasi Pembayaran</p>
                  <h3 className="mt-3 text-2xl font-black text-slate-900 leading-tight">Butuh Bantuan?</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Jika status belum berubah beberapa menit setelah pembayaran selesai, silakan hubungi admin kami.
                  </p>
                  <div className="mt-8 space-y-4 border-t border-emerald-200/50 pt-8">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Order ID</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{order?.orderNumber || orderId}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Customer</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{user?.name || order?.customer?.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Ledger Section - Full Width Bottom */}
            {payments.length > 0 && (
              <div className="rounded-[40px] border border-slate-200 bg-white p-8 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Riwayat Pembayaran</p>
                <h3 className="mt-3 text-2xl font-black text-slate-900 mb-8">Payment Ledger</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {payments.map((payment) => (
                    <div key={payment._id || payment.paymentNumber} className="rounded-[32px] border border-slate-100 bg-slate-50 p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-black text-slate-900">{payment.paymentNumber}</p>
                          <p className="mt-1 text-xs font-medium text-slate-500">
                            {formatDateTime(payment.paymentDate || payment.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-primary">{formatCurrency(payment.amount)}</p>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">{payment.method || 'Payment'}</p>
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
      <CustomerFooter />
    </div>
  );
}
