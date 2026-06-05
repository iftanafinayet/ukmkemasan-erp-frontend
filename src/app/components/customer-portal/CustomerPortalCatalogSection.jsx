import React from 'react';
import { Plus } from 'lucide-react';
import { buildCatalogGroups } from '../../utils/catalog';
import { EmptyState } from '../customer-dashboard/shared';

export default function CustomerPortalCatalogSection({
  products,
  selectedCategory,
  setSelectedCategory,
  formatCurrency,
  onNavigateToCreateOrder,
  onViewProduct
}) {
  const catalogGroups = buildCatalogGroups(products);
  const categories = ['All', ...new Set(catalogGroups.map((catalog) => catalog.category).filter(Boolean))];
  const filteredCatalogs = selectedCategory === 'All'
    ? catalogGroups
    : catalogGroups.filter((catalog) => catalog.category === selectedCategory);

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <header className="mb-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">
          Katalog <span className="text-primary italic">Produk</span>
        </h1>
        <p className="text-on-secondary-container max-w-2xl text-base font-medium leading-relaxed font-body">
          Eksplorasi pilihan kemasan kami. Temukan yang paling sesuai dengan kebutuhan produk Anda.
        </p>
      </header>

      <div className="flex flex-col gap-6 mb-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">category</span>
            <span className="text-sm font-bold text-on-surface/60 uppercase tracking-widest font-label">Kategori Produk</span>
          </div>
          <button 
              onClick={onNavigateToCreateOrder}
              className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-full text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              Buat Pesanan Custom
          </button>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border-2 ${
                selectedCategory === category
                  ? 'border-primary/40 bg-primary/5 text-primary'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-primary'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <button 
            onClick={onNavigateToCreateOrder}
            className="flex md:hidden items-center justify-center gap-2 px-6 py-4 bg-primary text-on-primary rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 transition-all w-full"
          >
            <Plus className="w-5 h-5" />
            Buat Pesanan Custom
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCatalogs.map((catalog, index) => (
          <div
            key={catalog.key}
            className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-slate-200/60"
            onClick={() => onViewProduct(catalog.productId)}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
              {catalog.images?.length > 0 ? (
                 <img src={catalog.images[0].url} alt={catalog.name} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                   <span className="material-symbols-outlined !text-3xl mb-1">image</span>
                   <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                 </div>
              )}
              {catalog.isNew && (
                 <div className="absolute top-3 left-3">
                   <span className="px-2 py-0.5 bg-primary/90 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest rounded-full">New</span>
                 </div>
              )}
            </div>
            <div className="p-4">
              <span className="text-[9px] font-bold text-primary uppercase tracking-widest font-label">{catalog.category}</span>
              <h3 className="text-sm font-bold text-slate-800 mt-1 leading-snug line-clamp-2">{catalog.name}</h3>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                <div>
                  <span className="text-base font-black text-primary">{formatCurrency(catalog.priceB2B)}</span>
                  <span className="text-[9px] font-bold text-slate-400 ml-0.5">/pcs</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                  <span className="material-symbols-outlined !text-[14px]">inventory_2</span>
                  {catalog.stockPolos?.toLocaleString() || 0} stok
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCatalogs.length === 0 && (
        <EmptyState text={`Tidak ada katalog untuk kategori ${selectedCategory}.`} />
      )}
    </div>
  );
}
