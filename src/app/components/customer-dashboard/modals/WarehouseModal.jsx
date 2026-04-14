import React from 'react';
import { Loader2 } from 'lucide-react';
import { FormInput, ModalWrapper } from '../shared';

export default function WarehouseModal({
  editingWarehouse,
  isOpen,
  onClose,
  onSubmit,
  savingWarehouse,
  setWarehouseForm,
  warehouseForm,
}) {
  if (!isOpen) return null;

  return (
    <ModalWrapper onClose={onClose}>
      <div className="mb-8">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">{editingWarehouse ? 'Edit Gudang' : 'Tambah Gudang'}</h3>
        <p className="text-slate-500 text-sm font-medium">{editingWarehouse ? 'Perbarui informasi gudang.' : 'Tambahkan lokasi gudang baru ke sistem.'}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <FormInput
          label="Nama Gudang"
          value={warehouseForm.name}
          onChange={(value) => setWarehouseForm({ ...warehouseForm, name: value })}
          required
          placeholder="Gudang Utama Bekasi"
        />
        <FormInput
          label="Lokasi"
          value={warehouseForm.location}
          onChange={(value) => setWarehouseForm({ ...warehouseForm, location: value })}
          placeholder="Jl. Industri No. 12, Bekasi"
        />
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipe Gudang</label>
          <select
            value={warehouseForm.type}
            onChange={(event) => setWarehouseForm({ ...warehouseForm, type: event.target.value })}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 font-bold"
          >
            <option value="Main">Main</option>
            <option value="Retail">Retail</option>
          </select>
        </div>
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-black text-slate-800 text-sm">Status Gudang</p>
            <p className="text-xs text-slate-500">Gudang nonaktif tetap tersimpan tapi tidak dipakai untuk operasional.</p>
          </div>
          <label className="inline-flex items-center gap-3 cursor-pointer">
            <span className={`text-xs font-black uppercase tracking-widest ${warehouseForm.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
              {warehouseForm.isActive ? 'Aktif' : 'Nonaktif'}
            </span>
            <input
              type="checkbox"
              checked={warehouseForm.isActive}
              onChange={(event) => setWarehouseForm({ ...warehouseForm, isActive: event.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={savingWarehouse}
          className="w-full py-5 bg-primary text-white font-black rounded-3xl shadow-xl shadow-primary/30 hover:bg-primary/90 hover:-translate-y-1 active:scale-95 transition-all mt-4 disabled:opacity-50 disabled:translate-y-0"
        >
          {savingWarehouse ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (editingWarehouse ? 'Update Gudang' : 'Simpan Gudang')}
        </button>
      </form>
    </ModalWrapper>
  );
}
