import React, { useState } from 'react';
import { Truck, Package, Printer, XCircle, RefreshCw, Loader2, ExternalLink, MapPin, Save, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../utils/api';

const STATUS_LABELS = {
  NotCreated: 'Belum Diproses',
  OrderCreated: 'Order Dibuat',
  PickupScheduled: 'Pickup Dijadwalkan',
  LabelGenerated: 'Resi Terbit',
  PickedUp: 'Dijemput Kurir',
  InTransit: 'Dalam Perjalanan',
  Delivered: 'Terkirim',
  Cancelled: 'Dibatalkan',
  Problem: 'Bermasalah',
};

const STATUS_STYLES = {
  NotCreated: 'bg-slate-100 text-slate-600',
  OrderCreated: 'bg-blue-100 text-blue-700',
  PickupScheduled: 'bg-indigo-100 text-indigo-700',
  LabelGenerated: 'bg-violet-100 text-violet-700',
  PickedUp: 'bg-amber-100 text-amber-700',
  InTransit: 'bg-cyan-100 text-cyan-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-600',
  Problem: 'bg-red-100 text-red-600',
};

const VEHICLES = ['Motor', 'Mobil', 'Truk'];
const CREATE_ALLOWED = ['Quality Control', 'Shipping', 'Completed'];
const CANCELABLE = ['OrderCreated', 'PickupScheduled', 'LabelGenerated'];

const defaultPickupDate = () => new Date().toISOString().slice(0, 10);
const defaultPickupTime = () => {
  const d = new Date(Date.now() + 2 * 60 * 60 * 1000);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export default function AdminShippingSection({ order, formatDateTime, onRefreshOrder }) {
  const sp = order.shippingProvider || {};
  const status = sp.status || 'NotCreated';
  const history = sp.statusHistory || [];

  const [busy, setBusy] = useState('');
  const [pickup, setPickup] = useState({ date: defaultPickupDate(), time: defaultPickupTime(), vehicle: 'Motor' });
  const [tracking, setTracking] = useState(null);
  const [awbInput, setAwbInput] = useState(sp.awb || '');
  const [editingAwb, setEditingAwb] = useState(false);

  const canCreate = CREATE_ALLOWED.includes(order.status);

  const handleSaveAwb = async () => {
    const trimmed = awbInput.trim();
    if (!trimmed) return toast.error('No. Resi tidak boleh kosong.');
    setBusy('awb');
    try {
      await api.put(`/orders/${order._id}/status`, { awb: trimmed });
      toast.success('No. Resi disimpan');
      setEditingAwb(false);
      await refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan resi.');
    } finally {
      setBusy('');
    }
  };

  const refresh = async () => {
    if (onRefreshOrder) await onRefreshOrder(order._id);
  };

  const run = async (action, fn, successMsg) => {
    setBusy(action);
    try {
      const res = await fn();
      toast.success(successMsg);
      await refresh();
      return res;
    } catch (error) {
      const data = error.response?.data;
      const detail = Array.isArray(data?.details) ? ` (${data.details.join(', ')})` : '';
      toast.error(`${data?.message || 'Gagal memproses pengiriman.'}${detail}`);
      return null;
    } finally {
      setBusy('');
    }
  };

  const handleCreate = () => run('create', () => api.post(`/shipping/orders/${order._id}/create`), 'Order pengiriman dibuat');
  const handlePickup = () => {
    if (!pickup.date || !pickup.time) return toast.error('Tanggal & jam pickup wajib diisi.');
    return run('pickup', () => api.post(`/shipping/orders/${order._id}/pickup`, {
      pickupDate: pickup.date, pickupTime: pickup.time, vehicle: pickup.vehicle,
    }), 'Pickup dijadwalkan');
  };
  const handleLabel = () => run('label', () => api.post(`/shipping/orders/${order._id}/label`), 'Resi berhasil dibuat');
  const handleCancel = () => {
    if (!window.confirm('Batalkan order pengiriman ini?')) return;
    return run('cancel', () => api.post(`/shipping/orders/${order._id}/cancel`), 'Order pengiriman dibatalkan');
  };
  const handleTracking = async () => {
    setBusy('tracking');
    try {
      const res = await api.get(`/shipping/orders/${order._id}/tracking`);
      setTracking(res.data?.data || res.data);
      toast.success('Status terbaru dimuat');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengambil status.');
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="mb-8 rounded-3xl border border-slate-100 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
          <Truck className="h-4 w-4" /> Pengiriman
        </p>
        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${STATUS_STYLES[status]}`}>
          {STATUS_LABELS[status]}
        </span>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order No (Komship)</p>
          <p className="font-bold text-slate-800">{sp.orderNo || '-'}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No. Resi (AWB)</p>
          {editingAwb ? (
            <div className="mt-1 flex items-center gap-2">
              <input
                type="text"
                value={awbInput}
                onChange={(e) => setAwbInput(e.target.value)}
                placeholder="Masukkan no resi..."
                className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-bold text-slate-800 outline-none focus:border-primary"
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveAwb(); }}
              />
              <button
                type="button"
                onClick={handleSaveAwb}
                disabled={busy === 'awb'}
                className="rounded-xl bg-primary p-1.5 text-white transition-all hover:bg-primary/90 disabled:opacity-50"
              >
                {busy === 'awb' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="font-bold text-slate-800">{sp.awb || '-'}</p>
              <button
                type="button"
                onClick={() => { setAwbInput(sp.awb || ''); setEditingAwb(true); }}
                className="rounded-lg p-1 text-slate-400 transition-all hover:bg-slate-200 hover:text-slate-600"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Aksi berurutan mengikuti state machine */}
      <div className="flex flex-wrap items-center gap-2">
        {status === 'NotCreated' && (
          <button
            type="button"
            onClick={handleCreate}
            disabled={busy === 'create' || !canCreate}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {busy === 'create' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
            Proses Pengiriman
          </button>
        )}

        {status === 'PickupScheduled' && (
          <button
            type="button"
            onClick={handleLabel}
            disabled={busy === 'label'}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {busy === 'label' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
            Cetak Resi
          </button>
        )}

        {sp.labelUrl && (
          <a
            href={sp.labelUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50"
          >
            <ExternalLink className="h-4 w-4" /> Unduh Label
          </a>
        )}

        {sp.awb && (
          <button
            type="button"
            onClick={handleTracking}
            disabled={busy === 'tracking'}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-50"
          >
            {busy === 'tracking' ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Cek Status Terbaru
          </button>
        )}

        {CANCELABLE.includes(status) && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={busy === 'cancel'}
            className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-600 transition-all hover:bg-red-50 disabled:opacity-50"
          >
            {busy === 'cancel' ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            Batalkan
          </button>
        )}
      </div>

      {status === 'NotCreated' && !canCreate && (
        <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-amber-600">
          <MapPin className="h-3.5 w-3.5" /> Order harus lolos Quality Control sebelum diproses pengiriman.
        </p>
      )}

      {/* Form pickup muncul setelah order dibuat */}
      {status === 'OrderCreated' && (
        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Jadwalkan Pickup</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500">Tanggal</span>
              <input type="date" value={pickup.date} onChange={(e) => setPickup({ ...pickup, date: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-primary" />
            </label>
            <label className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500">Jam (min. +90 menit)</span>
              <input type="time" value={pickup.time} onChange={(e) => setPickup({ ...pickup, time: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-primary" />
            </label>
            <label className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500">Kendaraan</span>
              <select value={pickup.vehicle} onChange={(e) => setPickup({ ...pickup, vehicle: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-primary">
                {VEHICLES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </label>
          </div>
          <button
            type="button"
            onClick={handlePickup}
            disabled={busy === 'pickup'}
            className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {busy === 'pickup' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
            Jadwalkan Pickup
          </button>
        </div>
      )}

      {/* Riwayat status */}
      {history.length > 0 && (
        <div className="mt-5 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Riwayat Pengiriman</p>
          {[...history].reverse().map((h, idx) => (
            <div key={idx} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">{STATUS_LABELS[h.status] || h.status}</p>
                {h.description && <p className="text-xs text-slate-500">{h.description}</p>}
                <p className="text-[11px] font-medium text-slate-400">{h.timestamp ? formatDateTime(h.timestamp) : ''}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hasil cek status manual (fallback) */}
      {tracking && (
        <div className="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50/50 p-4">
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-cyan-600">
            Tracking Kurir · {tracking.last_status || '-'}
          </p>
          <div className="space-y-1">
            {(tracking.history || []).map((ev, idx) => (
              <p key={idx} className="text-xs text-slate-600">
                <span className="font-bold">{ev.date}</span> — {ev.desc || ev.status}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
