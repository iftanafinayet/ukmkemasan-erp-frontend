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
        <section className="overflow-hidden rounded-[32px] bg-[radial-gradient(circle_at_top_left,_rgba(13,148,136,0.18),_transparent_42%),linear-gradient(135deg,_#0f172a,_#1f2937)] px-6 py-8 text-white sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <button
                type="button"
                onClick={() => navigate('/portal?menu=orders')}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white/90 transition hover:bg-white/15"
              >
                <ArrowLeft size={16} />
                Kembali ke pesanan
              </button>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-teal-200">Midtrans Checkout</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight">Bayar Pesanan #{order?.orderNumber || orderId}</h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-200">
                Halaman ini membuat transaksi Midtrans Snap untuk sisa tagihan order Anda. Pembayaran akan diverifikasi dari notifikasi Midtrans ke backend.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-300">Customer</p>
                <p className="mt-2 text-lg font-bold text-white">{user?.name || order?.customer?.name || '-'}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-300">Status Order</p>
                <p className="mt-2 text-lg font-bold text-white">{order?.status || '-'}</p>
              </div>
            </div>
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
          <div className="grid gap-8 lg:grid-cols-[1.35fr_0.9fr]">
            <section className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <SummaryCard label="Total Tagihan" value={formatCurrency(summary?.totalAmount)} />
                <SummaryCard label="Sudah Dibayar" value={formatCurrency(summary?.paidAmount)} />
                <SummaryCard label="Sisa Tagihan" value={formatCurrency(outstandingAmount)} accent />
              </div>

              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Invoice</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">{invoice?.invoiceNumber || 'Draft'}</h2>
                    <p className="mt-2 text-sm text-slate-500">
                      Diterbitkan {formatDate(invoice?.issuedDate)} • Jatuh tempo {formatDate(invoice?.dueDate)}
                    </p>
                  </div>
                  <div className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-black ${
                    isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {isPaid ? 'Lunas' : invoice?.status || 'Menunggu'}
                  </div>
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Ringkasan Pesanan</p>
                    <div className="mt-4 space-y-3 text-sm text-slate-600">
                      <div className="flex justify-between gap-4">
                        <span>Produk</span>
                        <span className="font-bold text-slate-900">{order?.product?.name || '-'}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Jumlah</span>
                        <span className="font-bold text-slate-900">{order?.details?.quantity?.toLocaleString?.() || 0} pcs</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Material</span>
                        <span className="font-bold text-slate-900">{order?.details?.material || order?.product?.material || '-'}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Valve</span>
                        <span className="font-bold text-slate-900">{order?.details?.useValve ? 'Ya' : 'Tidak'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Informasi Midtrans</p>
                    <div className="mt-4 space-y-3 text-sm text-slate-600">
                      <div className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3">
                        <ShieldCheck className="mt-0.5 text-emerald-600" size={18} />
                        <div>
                          <p className="font-bold text-slate-900">Pembayaran diproses di Midtrans Snap</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Status invoice akan berubah setelah backend menerima notifikasi resmi dari Midtrans.
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Client key frontend</span>
                        <span className={`font-bold ${resolvedClientKey ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {resolvedClientKey ? 'Configured' : 'Missing'}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Backend Midtrans</span>
                        <span className={`font-bold ${paymentData?.midtrans?.clientKeyConfigured ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {paymentData?.midtrans?.clientKeyConfigured ? 'Configured' : 'Missing'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handlePayNow}
                    disabled={creatingToken || isPaid || outstandingAmount <= 0}
                    className="inline-flex items-center justify-center gap-3 rounded-full bg-primary px-6 py-4 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                  >
                    {creatingToken ? <LoaderCircle className="animate-spin" size={18} /> : <CreditCard size={18} />}
                    {isPaid ? 'Pesanan Sudah Lunas' : 'Bayar dengan Midtrans'}
                  </button>
                  <button
                    type="button"
                    onClick={fetchPaymentData}
                    className="inline-flex items-center justify-center gap-3 rounded-full border border-slate-200 bg-white px-6 py-4 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                  >
                    <RefreshCw size={18} />
                    Muat Ulang Status
                  </button>
                </div>
              </div>

              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Riwayat Pembayaran</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Payment Ledger</h2>
                  </div>
                </div>

                {payments.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm font-medium text-slate-500">
                    Belum ada pembayaran yang tercatat untuk invoice ini.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div key={payment._id || payment.paymentNumber} className="rounded-3xl border border-slate-100 bg-slate-50 px-5 py-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-sm font-black text-slate-900">{payment.paymentNumber}</p>
                            <p className="mt-1 text-xs font-medium text-slate-500">
                              {formatDateTime(payment.paymentDate || payment.createdAt)}
                            </p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-lg font-black text-primary">{formatCurrency(payment.amount)}</p>
                            <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{payment.method || 'Payment'}</p>
                          </div>
                        </div>
                        {(payment.referenceNo || payment.notes) && (
                          <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                            <p>Ref: <span className="font-bold text-slate-700">{payment.referenceNo || '-'}</span></p>
                            <p>Catatan: <span className="font-bold text-slate-700">{payment.notes || '-'}</span></p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Checklist</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Sebelum Membayar</h2>
                <div className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
                  <p>Pastikan order yang dibayar sudah sesuai dengan produk dan kuantitas yang Anda pesan.</p>
                  <p>Midtrans akan menampilkan kanal pembayaran yang tersedia berdasarkan konfigurasi merchant Anda.</p>
                  <p>Jika popup tertutup sebelum selesai, buka kembali halaman ini dan klik bayar ulang. Backend hanya akan mencatat settlement resmi dari Midtrans.</p>
                </div>
              </div>

              <div className="rounded-[32px] border border-slate-200 bg-[#0f766e] p-6 text-white shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-teal-100">Butuh Bantuan</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight">Konfirmasi Pembayaran</h2>
                <p className="mt-4 text-sm leading-6 text-teal-50">
                  Jika status belum berubah beberapa menit setelah pembayaran selesai, cek webhook Midtrans di backend lalu muat ulang halaman ini.
                </p>
                <div className="mt-6 rounded-3xl bg-white/10 px-4 py-4 text-sm">
                  <p className="font-black">Order dibuat</p>
                  <p className="mt-1 text-teal-50">{formatDate(order?.createdAt)}</p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
      <CustomerFooter />
    </div>
  );
}
