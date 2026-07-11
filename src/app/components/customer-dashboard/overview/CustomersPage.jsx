import React from 'react';
import { FileDown } from 'lucide-react';
import { SearchBar, EmptyState } from '../shared';
import { exportToFile } from '../../../utils/api';
import { ENDPOINTS } from '../../../config/environment';

export default function CustomersPage({
  filteredCustomers,
  onSearchChange,
  searchTerm,
}) {
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar value={searchTerm} onChange={onSearchChange} placeholder="Cari pelanggan..." />
        <button
          type="button"
          onClick={() => exportToFile(ENDPOINTS.EXPORT_CUSTOMERS, 'customers.xlsx')}
          className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-surface-container-lowest border border-outline-variant px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-on-surface shadow-card transition-all duration-200 hover:bg-surface-container-low active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <FileDown size={14} />
          Export
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.isArray(filteredCustomers) && filteredCustomers.map((customer) => (
          <div key={customer._id} className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant flex items-center gap-3 shadow-card hover:shadow-card-hover transition-all duration-200">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary text-base font-black shadow-md shadow-primary/20 flex-shrink-0">
              {customer.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <h4 className="font-black text-on-surface text-sm leading-tight truncate">{customer.name}</h4>
              <p className="text-[10px] text-muted font-medium truncate">{customer.email}</p>
              {customer.phone && <p className="text-[9px] text-muted mt-0.5">{customer.phone}</p>}
              <p className="text-[9px] text-primary font-bold mt-0.5 uppercase tracking-tighter">Verified Client</p>
            </div>
          </div>
        ))}
      </div>
      {(!Array.isArray(filteredCustomers) || filteredCustomers.length === 0) && (
        <EmptyState text="Tidak ada pelanggan ditemukan." />
      )}
    </div>
  );
}
