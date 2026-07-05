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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar value={searchTerm} onChange={onSearchChange} placeholder="Cari pelanggan..." />
        <button
          type="button"
          onClick={() => exportToFile(ENDPOINTS.EXPORT_CUSTOMERS, 'customers.xlsx')}
          className="flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-surface-container-lowest border border-outline-variant px-6 py-3 text-xs font-black uppercase tracking-widest text-on-surface shadow-card transition-all duration-200 hover:bg-surface-container-low active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <FileDown size={16} />
          Export
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.isArray(filteredCustomers) && filteredCustomers.map((customer) => (
          <div key={customer._id} className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant flex items-center gap-5 shadow-card hover:shadow-card-hover transition-all duration-200">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-on-primary text-xl font-black shadow-lg shadow-primary/20">
              {customer.name?.charAt(0)}
            </div>
            <div>
              <h4 className="font-black text-on-surface leading-tight">{customer.name}</h4>
              <p className="text-xs text-muted font-medium">{customer.email}</p>
              {customer.phone && <p className="text-[10px] text-muted mt-0.5">{customer.phone}</p>}
              <p className="text-[10px] text-primary font-bold mt-1 uppercase tracking-tighter">Verified Client</p>
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
