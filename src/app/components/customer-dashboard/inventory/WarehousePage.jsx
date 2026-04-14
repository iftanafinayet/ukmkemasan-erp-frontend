import React from 'react';
import {
  Edit3,
  Loader2,
  Plus,
  Trash2,
  Warehouse,
} from 'lucide-react';
import { EmptyState } from '../shared';

export default function WarehousePage({
  currentWarehouseType,
  deletingWarehouseId,
  onCreateWarehouse,
  onDeleteWarehouse,
  onEditWarehouse,
  warehouses,
}) {
  const filteredWarehouses = warehouses.filter((warehouse) => warehouse.type === currentWarehouseType);
  const activeWarehouses = filteredWarehouses.filter((warehouse) => warehouse.isActive !== false);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-xl font-black text-slate-800">Manajemen Gudang</h3>
          <p className="text-slate-500 text-sm">Kelola lokasi penyimpanan barang {currentWarehouseType === 'Retail' ? 'Retail' : 'Pusat'}.</p>
        </div>
        <button
          type="button"
          onClick={onCreateWarehouse}
          className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary/30"
        >
          <Plus size={16} />
          Tambah Gudang
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Gudang</p>
          <p className="text-3xl font-black text-slate-800 mt-2">{filteredWarehouses.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gudang Aktif</p>
          <p className="text-3xl font-black text-emerald-600 mt-2">{activeWarehouses.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipe</p>
          <p className="text-3xl font-black text-primary mt-2">{currentWarehouseType}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredWarehouses.map((warehouse) => (
          <div key={warehouse._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-4 rounded-2xl ${warehouse.isActive !== false ? 'bg-blue-50' : 'bg-slate-100'}`}>
                  <Warehouse className={warehouse.isActive !== false ? 'text-blue-500' : 'text-slate-400'} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-slate-800">{warehouse.name}</p>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${warehouse.isActive !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                      {warehouse.isActive !== false ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{warehouse.location || 'Lokasi belum diisi'}</p>
                  <p className="text-[10px] text-primary font-black mt-3 uppercase tracking-widest">{warehouse.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => onEditWarehouse(warehouse)} className="p-2 hover:bg-blue-50 rounded-xl text-blue-500 transition-colors" title="Edit gudang">
                  <Edit3 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteWarehouse(warehouse._id)}
                  disabled={deletingWarehouseId === warehouse._id}
                  className="p-2 hover:bg-red-50 rounded-xl text-red-500 transition-colors disabled:opacity-50"
                  title="Hapus gudang"
                >
                  {deletingWarehouseId === warehouse._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredWarehouses.length === 0 && (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 px-6 py-16">
          <EmptyState text={`Belum ada gudang ${currentWarehouseType.toLowerCase()} terdaftar.`} />
        </div>
      )}
    </div>
  );
}
