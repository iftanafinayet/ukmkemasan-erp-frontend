import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QrCode, Loader2, Camera, ChevronDown, AlertTriangle, CheckCircle2, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../utils/api';
import { ENDPOINTS } from '../config/environment';

const SCANNABLE_STATUSES = ['Quality Control', 'Shipping', 'Completed'];

export default function BarcodeScanner() {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [manualResi, setManualResi] = useState('');
  const [cameraError, setCameraError] = useState(null);

  const scannerRef = useRef(null);
  const dropdownRef = useRef(null);
  const resumeTimerRef = useRef(null);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const response = await api.get(ENDPOINTS.ALL_ORDERS);
      const allOrders = response.data || [];
      setOrders(allOrders.filter((o) => SCANNABLE_STATUSES.includes(o.status) || !o.scannedAt));
    } catch { toast.error('Gagal memuat daftar order.'); }
    finally { setLoadingOrders(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch { /* already stopped */ }
      try { await scannerRef.current.clear(); } catch { /* already cleared */ }
      scannerRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const submitResi = useCallback(async (resiValue) => {
    if (!selectedOrderId || sending) return;
    setSending(true);
    await stopScanner().catch(() => {});
    setScanResult({ resi: resiValue, status: 'processing' });

    try {
      const response = await api.post(ENDPOINTS.SCAN_RESI(selectedOrderId), { nomor_resi: resiValue });
      if (response.data?.success) {
        setScanResult({ resi: resiValue, status: 'success' });
        toast.success(`Resi ${resiValue} tersimpan. Email terkirim.`);
        setSelectedOrderId('');
        setSearchTerm('');
      } else {
        setScanResult({ resi: resiValue, status: 'error', message: response.data?.message || 'Gagal memproses.' });
        toast.error(response.data?.message || 'Gagal memproses resi.');
      }
    } catch (error) {
      setScanResult({ resi: resiValue, status: 'error', message: error.response?.data?.message || 'Terjadi kesalahan koneksi.' });
      toast.error(error.response?.data?.message || 'Terjadi kesalahan koneksi.');
    }

    resumeTimerRef.current = setTimeout(() => {
      setScanResult(null);
      setSending(false);
    }, 2500);
  }, [selectedOrderId, sending, stopScanner]);

  const startScanner = useCallback(async () => {
    if (!selectedOrderId) return;
    setCameraError(null);

    try {
      scannerRef.current = new Html5Qrcode('reader', { verbose: false });
      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 5 },
        (decodedText) => {
          const text = decodedText?.trim();
          if (text && !sending) submitResi(text);
        },
        () => {}
      );
      setIsScanning(true);
    } catch (err) {
      const msg = err?.message || err?.toString() || '';
      setIsScanning(false);
      if (msg.includes('NotAllowed') || err?.name === 'NotAllowedError') {
        setCameraError({ title: 'Izin kamera ditolak', text: 'Silakan izinkan akses kamera di pengaturan browser lalu refresh halaman.' });
      } else {
        setCameraError({ title: 'Kamera tidak tersedia', text: `Error: ${msg}` });
      }
    }
  }, [selectedOrderId, sending, submitResi]);

  useEffect(() => {
    if (selectedOrderId && !isScanning && !sending) startScanner();
    return () => { if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current); };
  }, [selectedOrderId, sending, isScanning, startScanner]);

  useEffect(() => {
    return () => { stopScanner(); if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current); };
  }, [stopScanner]);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const trimmed = manualResi.trim();
    if (!trimmed) return toast.error('Masukkan nomor resi.');
    if (!selectedOrderId) return toast.error('Pilih order terlebih dahulu.');
    submitResi(trimmed);
  };

  const selectedOrder = orders.find((o) => o._id === selectedOrderId);
  const filteredOrders = orders.filter((o) => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (o.orderNumber && o.orderNumber.toLowerCase().includes(t))
      || (o.customer?.name && o.customer.name.toLowerCase().includes(t))
      || (o.customer?.email && o.customer.email.toLowerCase().includes(t));
  });

  return (
    <div className="mx-auto max-w-lg px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10"><QrCode className="h-5 w-5 text-primary" /></div>
        <div>
          <h2 className="text-lg font-extrabold text-slate-800">Scan Resi</h2>
          <p className="text-xs font-medium text-slate-400">Arahkan kamera ke barcode resi pada label fisik</p>
        </div>
      </div>

      <div className="mb-5">
        <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Pilih Order</label>
        <div ref={dropdownRef} className="relative">
          <button type="button" onClick={() => { if (!sending) setShowDropdown(!showDropdown); }}
            disabled={loadingOrders || sending}
            className="flex w-full items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 transition-all hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50">
            {loadingOrders ? (
              <span className="flex items-center gap-2 text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /> Memuat order...</span>
            ) : selectedOrder ? (
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-bold text-slate-800">{selectedOrder.orderNumber}</span>
                <span className="text-[11px] font-medium text-slate-400">
                  {selectedOrder.customer?.name || selectedOrder.customer?.email || 'Pelanggan'} · {selectedOrder.status}
                </span>
              </div>
            ) : <span className="text-slate-400">Cari & pilih order...</span>}
            <ChevronDown className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showDropdown && !sending && (
            <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
              <div className="border-b border-slate-100 px-3 py-2">
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                  <Search className="h-3.5 w-3.5 text-slate-400" />
                  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari nomor order atau customer..." autoFocus
                    className="flex-1 bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 outline-none" />
                  {searchTerm && <button type="button" onClick={() => setSearchTerm('')} className="rounded-lg p-0.5 text-slate-400 hover:text-slate-600"><X className="h-3.5 w-3.5" /></button>}
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {filteredOrders.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-slate-400">
                    {orders.length === 0 ? 'Tidak ada order yang siap dikirim.' : 'Order tidak ditemukan.'}
                  </div>
                ) : filteredOrders.map((o) => (
                  <button key={o._id} type="button"
                    onClick={() => { setSelectedOrderId(o._id); setSearchTerm(''); setShowDropdown(false); }}
                    className={`flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-slate-50 ${o._id === selectedOrderId ? 'bg-primary/5' : ''}`}>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">{o.orderNumber}</span>
                      <span className="text-[11px] font-medium text-slate-400">{o.customer?.name || o.customer?.email || 'Pelanggan'}</span>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-500">{o.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 overflow-hidden rounded-3xl border border-slate-200 bg-black">
        {cameraError ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20"><AlertTriangle className="h-6 w-6 text-red-400" /></div>
            <p className="text-sm font-bold text-slate-300">{cameraError.title}</p>
            <p className="mt-1 text-xs text-slate-500">{cameraError.text}</p>
            <button type="button" onClick={() => { setCameraError(null); startScanner(); }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-white/20">
              <Camera className="h-4 w-4" /> Coba Lagi
            </button>
          </div>
        ) : !selectedOrderId ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10"><Camera className="h-6 w-6 text-slate-400" /></div>
            <p className="text-sm font-bold text-slate-300">Pilih Order Terlebih Dahulu</p>
            <p className="mt-1 text-xs text-slate-500">Kamera akan aktif setelah Anda memilih order dari daftar di atas</p>
          </div>
        ) : (
          <div id="reader" className="w-full" />
        )}
      </div>

      {scanResult && (
        <div className={`mb-4 rounded-2xl border p-4 ${
          scanResult.status === 'success' ? 'border-green-100 bg-green-50' : scanResult.status === 'processing' ? 'border-blue-100 bg-blue-50' : 'border-red-100 bg-red-50'
        }`}>
          <div className="flex items-center gap-3">
            {scanResult.status === 'success' ? <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
            : scanResult.status === 'processing' ? <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin text-blue-600" />
            : <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-500" />}
            <div>
              <p className={`text-sm font-bold ${scanResult.status === 'success' ? 'text-green-800' : scanResult.status === 'error' ? 'text-red-800' : 'text-blue-800'}`}>
                {scanResult.status === 'success' ? 'Berhasil!' : scanResult.status === 'processing' ? 'Memproses...' : 'Gagal'}
              </p>
              <p className="text-xs font-medium text-slate-600">
                {scanResult.status === 'success' ? `Resi ${scanResult.resi} tersimpan & email terkirim.`
                : scanResult.status === 'processing' ? `Mengirim resi ${scanResult.resi}...`
                : scanResult.message || 'Gagal memproses resi.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-slate-100 bg-white p-5">
        <p className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
          <Search className="h-3.5 w-3.5" /> Input Manual
        </p>
        <form onSubmit={handleManualSubmit} className="flex gap-3">
          <input type="text" value={manualResi} onChange={(e) => setManualResi(e.target.value)}
            placeholder="Ketik nomor resi..." disabled={sending}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-800 placeholder-slate-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50" />
          <button type="submit" disabled={!manualResi.trim() || !selectedOrderId || sending}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan'}
          </button>
        </form>
        <p className="mt-2 text-[11px] font-medium text-slate-400">Gunakan input manual jika barcode rusak atau kamera tidak tersedia.</p>
      </div>
    </div>
  );
}
