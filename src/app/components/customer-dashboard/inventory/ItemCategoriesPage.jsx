import React from 'react';
import { Package } from 'lucide-react';
import { buildItemCategories } from '../utils';
import { EmptyState } from '../shared';

export default function ItemCategoriesPage({ formatCurrency, products }) {
  const categories = buildItemCategories(Array.isArray(products) ? products : []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/30">
        <h3 className="text-xl font-bold text-on-surface">Kategori Packaging</h3>
        <p className="text-on-surface-variant text-sm mt-1">Ringkasan kategori dari seluruh master packaging yang ada di inventory.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.name} className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-card space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black text-muted uppercase tracking-widest">Kategori</p>
                <h4 className="text-xl font-bold text-on-surface mt-2">{category.name}</h4>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Package size={20} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-surface-container-low p-4 border border-outline-variant/30">
                <p className="text-[10px] font-black text-muted uppercase tracking-widest">Items</p>
                <p className="text-2xl font-bold text-on-surface mt-2">{category.totalItems}</p>
              </div>
              <div className="rounded-2xl bg-surface-container-low p-4 border border-outline-variant/30">
                <p className="text-[10px] font-black text-muted uppercase tracking-widest">Stok</p>
                <p className="text-2xl font-bold text-on-surface mt-2">{category.totalStock.toLocaleString()}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-surface-container-low p-4 border border-outline-variant/30">
              <p className="text-[10px] font-black text-muted uppercase tracking-widest">Rentang Harga</p>
              <p className="font-bold text-primary mt-2">{formatCurrency(category.minPrice)}</p>
              <p className="text-sm text-on-surface-variant font-medium">sampai {formatCurrency(category.maxPrice)}</p>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && <EmptyState text="Belum ada kategori packaging." />}
    </div>
  );
}
