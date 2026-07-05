import React, { useEffect, useState } from 'react';
import { Truck, Search, Save, Loader2, Wallet, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { FormInput } from '../shared';
import api from '../../../utils/api';

const VEHICLES = ['Motor', 'Mobil', 'Truk'];
const LABEL_FORMATS = [
  { value: 'page_1', label: 'A4 — 1 label/halaman' },
  { value: 'page_2', label: 'A4 — 2 label/halaman' },
  { value: 'page_4', label: 'A4 — 4 label (A6)' },
  { value: 'page_5', label: 'Thermal 10x10 cm' },
  { value: 'page_6', label: 'Thermal 10x15 cm' },
];

const formatIDR = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

export default function ShippingSettingsSection() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [keyword, setKeyword] = useState('');
  const [searching, setSearching] = useState(false);
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    api.get('/settings')
      .then((res) => setSettings(res.data?.data || res.data))
      .catch(() => toast.error('Gagal memuat pengaturan pengiriman.'))
      .finally(() => setLoading(false));
  }, []);

  const setOrigin = (field, value) =>
    setSettings((prev) => ({ ...prev, origin: { ...(prev.origin || {}), [field]: value } }));
  const setField = (field, value) => setSettings((prev) => ({ ...prev, [field]: value }));

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setSearching(true);
    try {
      const res = await api.get('/settings/shipping/destinations', { params: { keyword } });
      setDestinations(res.data?.data || res.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mencari lokasi.');
    } finally {
      setSearching(false);
    }
  };

  const pickDestination = (dest) => {
    setField('originDestinationId', dest.id);
    if (!settings.origin?.address) setOrigin('address', dest.label);
    setDestinations([]);
    setKeyword(dest.label);
    toast.success(`Origin diset: ${dest.label}`);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        origin: settings.origin,
        originDestinationId: settings.originDestinationId,
        originPinPoint: settings.originPinPoint,
        defaultVehicle: settings.defaultVehicle,
        labelPageFormat: settings.labelPageFormat,
        lowBalanceThreshold: settings.lowBalanceThreshold,
      };
      const res = await api.put('/settings', payload);
      setSettings(res.data?.data || res.data);
      toast.success('Pengaturan pengiriman disimpan.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-3xl border border-slate-100 bg-white p-8 text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" /> Memuat pengaturan pengiriman...
      </div>
    );
  }
  if (!settings) return null;

  const lowBalance = Number(settings.shippingDepositBalance || 0) < Number(settings.lowBalanceThreshold || 0);

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100">
      <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
        <Truck className="w-5 h-5 text-primary" />
        Pengaturan Pengiriman (Komship)
      </h3>

      {/* Status API & Saldo */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status API Key</p>
          {settings.komshipApiKeyConfigured ? (
            <p className="flex items-center gap-1.5 text-sm font-bold text-green-600"><CheckCircle2 className="h-4 w-4" /> Terkonfigurasi</p>
          ) : (
            <p className="flex items-center gap-1.5 text-sm font-bold text-red-500"><AlertTriangle className="h-4 w-4" /> Belum diatur (KOMSHIP_API_KEY)</p>
          )}
        </div>
        <div className={`rounded-2xl border p-4 ${lowBalance ? 'border-red-200 bg-red-50' : 'border-slate-100 bg-slate-50'}`}>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1"><Wallet className="h-3.5 w-3.5" /> Saldo Deposit</p>
          <p className={`text-sm font-black ${lowBalance ? 'text-red-600' : 'text-slate-800'}`}>{formatIDR(settings.shippingDepositBalance)}</p>
          {lowBalance && <p className="mt-1 text-[11px] font-medium text-red-500">Saldo di bawah ambang batas — segera top-up.</p>}
        </div>
      </div>

      {/* Pencarian lokasi origin */}
      <div className="mb-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Cari Lokasi Gudang Asal (Origin)</p>
        <div className="flex gap-2">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
            placeholder="Kecamatan / kota / kode pos..."
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Cari
          </button>
        </div>
        {destinations.length > 0 && (
          <div className="mt-3 max-h-52 space-y-1 overflow-y-auto">
            {destinations.map((dest) => (
              <button
                key={dest.id}
                type="button"
                onClick={() => pickDestination(dest)}
                className="block w-full rounded-xl border border-slate-100 bg-white px-3 py-2 text-left text-xs font-medium text-slate-600 transition hover:border-primary hover:bg-primary/5"
              >
                {dest.label} <span className="text-slate-400">#{dest.id}</span>
              </button>
            ))}
          </div>
        )}
        <p className="mt-2 text-[11px] font-medium text-slate-400">
          Origin Destination ID saat ini: <span className="font-bold text-slate-600">{settings.originDestinationId || 'belum diatur'}</span>
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormInput label="Nama Pengirim" value={settings.origin?.name || ''} onChange={(v) => setOrigin('name', v)} placeholder="UKM Kemasan" />
          <FormInput label="No. Telepon Pengirim" value={settings.origin?.phone || ''} onChange={(v) => setOrigin('phone', v)} placeholder="0812xxxx (bukan +62)" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormInput label="Email Pengirim" type="email" value={settings.origin?.email || ''} onChange={(v) => setOrigin('email', v)} />
          <FormInput label="Pin Point (lat,long)" value={settings.originPinPoint || ''} onChange={(v) => setField('originPinPoint', v)} placeholder="-7.27, 109.20" />
        </div>
        <FormInput label="Alamat Lengkap Gudang" value={settings.origin?.address || ''} onChange={(v) => setOrigin('address', v)} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kendaraan Default</label>
            <select
              value={settings.defaultVehicle || 'Motor'}
              onChange={(e) => setField('defaultVehicle', e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary text-slate-800 font-bold"
            >
              {VEHICLES.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Format Label</label>
            <select
              value={settings.labelPageFormat || 'page_5'}
              onChange={(e) => setField('labelPageFormat', e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary text-slate-800 font-bold"
            >
              {LABEL_FORMATS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <FormInput
            label="Ambang Saldo Rendah"
            type="number"
            value={settings.lowBalanceThreshold ?? 50000}
            onChange={(v) => setField('lowBalanceThreshold', Number(v))}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50 sm:w-auto"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Simpan Pengaturan Pengiriman
        </button>
      </form>
    </div>
  );
}
