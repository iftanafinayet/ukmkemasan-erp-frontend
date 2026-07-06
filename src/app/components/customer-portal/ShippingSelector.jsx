import React, { useState, useEffect } from 'react';
import { Search, Loader2, MapPin, Truck, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';
import { storage } from '../../config/environment';

const defaultFormat = (v) => `Rp ${Number(v || 0).toLocaleString('id-ID')}`;

export default function ShippingSelector({ items = [], itemValue = 0, value, onChange, formatCurrency = defaultFormat }) {
  const user = storage.getUser();
  const [recipient, setRecipient] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [keyword, setKeyword] = useState('');
  const [searching, setSearching] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [dest, setDest] = useState(null);
  const [calc, setCalc] = useState({ loading: false, options: [], weightGram: 0 });

  const selectedKey = value ? `${value.courierCode}-${value.courierService}` : '';

  useEffect(() => {
    onChange(null);
    setCalc({ loading: false, options: [], weightGram: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dest?.id, recipient.name, recipient.phone, recipient.address]);

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setSearching(true);
    try {
      const res = await api.get('/shipping/destinations', { params: { keyword } });
      setDestinations(res.data?.data || res.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal mencari lokasi.');
    } finally {
      setSearching(false);
    }
  };

  const pickDest = (d) => {
    setDest({ id: d.id, label: d.label });
    setDestinations([]);
    setKeyword(d.label);
  };

  const composedAddress = (() => {
    const base = (recipient.address || '').trim();
    const label = dest?.label || '';
    if (label && base && !base.includes(label)) return `${base}, ${label}`;
    return base || label;
  })();

  const handleCalc = async () => {
    if (!dest?.id) return toast.error('Pilih alamat tujuan terlebih dahulu.');
    setCalc((c) => ({ ...c, loading: true }));
    try {
      const res = await api.post('/shipping/calculate', {
        destinationId: dest.id,
        items: items.map((it) => ({ productId: it.productId, variantId: it.variantId, quantity: it.quantity })),
        itemValue,
      });
      const data = res.data?.data || res.data;
      setCalc({ loading: false, options: data.options || [], weightGram: data.weightGram || 0 });
    } catch (e) {
      setCalc((c) => ({ ...c, loading: false }));
      toast.error(e.response?.data?.message || 'Gagal menghitung ongkir.');
    }
  };

  const selectCourier = (opt) => {
    onChange({
      destinationId: dest.id,
      destinationLabel: dest?.label || '',
      recipient: { ...recipient, address: composedAddress },
      courierCode: opt.code,
      courierService: opt.service,
      cost: opt.cost,
      cashback: 0,
      serviceName: `${(opt.code || '').toUpperCase()} · ${opt.service}`,
      etd: opt.etd,
    });
  };

  const options = calc.options || [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Penerima</span>
          <input value={recipient.name} onChange={(e) => setRecipient({ ...recipient, name: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-primary" />
        </label>
        <label className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">No. Telepon</span>
          <input value={recipient.phone} onChange={(e) => setRecipient({ ...recipient, phone: e.target.value })}
            placeholder="0812xxxx" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-primary" />
        </label>
      </div>
      <label className="block space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alamat Lengkap</span>
        <textarea value={recipient.address} onChange={(e) => setRecipient({ ...recipient, address: e.target.value })} rows={2}
          placeholder="Cukup tulis nama jalan & no. bangunan"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-primary" />
        <span className="text-[10px] font-medium text-slate-400">Kota/kecamatan otomatis ditambahkan dari tujuan ekspedisi di bawah.</span>
      </label>

      {dest && composedAddress && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Alamat Pengiriman Lengkap</p>
          <p className="text-xs font-medium leading-relaxed text-slate-700">{composedAddress}</p>
        </div>
      )}

      <div>
        <span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">Kota / Kecamatan / Kode Pos Tujuan</span>
        <div className="flex gap-2">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
            placeholder="cth: Purwokerto atau 53131"
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-primary"
          />
          <button type="button" onClick={handleSearch} disabled={searching}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700 disabled:opacity-50">
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Cari
          </button>
        </div>
        {destinations.length > 0 && (
          <div className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-xl border border-slate-100 p-1">
            {destinations.map((d) => (
              <button key={d.id} type="button" onClick={() => pickDest(d)}
                className="block w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-600 transition hover:bg-primary/5">
                <MapPin className="mr-1 inline h-3 w-3 text-primary" /> {d.label}
              </button>
            ))}
          </div>
        )}
        {dest && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-primary">
            <CheckCircle2 className="h-3.5 w-3.5" /> {dest.label}
          </p>
        )}
      </div>

      <button type="button" onClick={handleCalc} disabled={!dest?.id || calc.loading}
        className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-50">
        {calc.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />} Cek Ongkir
      </button>

      {options.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-slate-50/60">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Pilih Kurir · berat {(calc.weightGram / 1000).toFixed(1)} kg
            </p>
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-slate-500">{options.length} layanan</span>
          </div>
          <div className="max-h-72 space-y-2 overflow-y-auto p-2">
            {options.map((opt) => {
              const key = `${opt.code}-${opt.service}`;
              const active = key === selectedKey;
              return (
                <button key={key} type="button" onClick={() => selectCourier(opt)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${active ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white hover:border-primary/40'}`}>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-800">{(opt.code || '').toUpperCase()} <span className="font-medium text-slate-500">{opt.service}</span></p>
                    <p className="truncate text-[11px] font-medium text-slate-400">{opt.description || ''}{opt.etd ? ` · Estimasi ${opt.etd}` : ''}</p>
                  </div>
                  <div className="ml-3 shrink-0 text-right">
                    <p className="text-sm font-black text-primary">{formatCurrency(opt.cost)}</p>
                    {active && <span className="text-[10px] font-black uppercase text-primary">Dipilih</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {value && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 text-sm">
          <span className="font-bold text-slate-700">Ongkir dipilih:</span>{' '}
          <span className="font-black text-primary">{value.serviceName} — {formatCurrency(value.cost)}</span>
        </div>
      )}
    </div>
  );
}
