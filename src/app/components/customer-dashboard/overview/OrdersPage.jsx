import React from 'react';
import { Plus } from 'lucide-react';
import { OrderCard } from '../../OrderCard';
import { SearchBar, EmptyState } from '../shared';

export default function OrdersPage({
  filteredOrders,
  isAdmin,
  onCreateOrder,
  onSearchChange,
  onSortChange,
  onStatusFilterChange,
  onViewOrder,
  orderStatuses,
  orderSort,
  searchTerm,
  statusFilter,
}) {
  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Cari order, produk, customer..."
            showStatusFilter
            showSortFilter
            statusFilter={statusFilter}
            onStatusFilterChange={onStatusFilterChange}
            statusOptions={orderStatuses}
            sortValue={orderSort}
            onSortChange={onSortChange}
            sortOptions={[
              { value: 'newest', label: 'Pesanan Terbaru' },
              { value: 'oldest', label: 'Pesanan Terlama' },
            ]}
          />
        </div>
        {!isAdmin && (
          <button
            type="button"
            onClick={onCreateOrder}
            className="bg-primary text-on-primary px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Plus size={16} />
            Buat Pesanan
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.isArray(filteredOrders) && filteredOrders.map((order) => (
          <div key={order._id} onClick={() => onViewOrder(order._id)} className="cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            <OrderCard order={order} />
          </div>
        ))}
      </div>

      {(!Array.isArray(filteredOrders) || filteredOrders.length === 0) && (
        <EmptyState text="Tidak ada pesanan ditemukan." />
      )}
    </div>
  );
}
