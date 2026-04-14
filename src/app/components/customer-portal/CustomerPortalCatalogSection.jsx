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
              className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/30 scale-105'
                  : 'bg-surface-container-low text-on-surface/60 hover:bg-surface-container hover:text-on-surface border border-outline-variant/10'
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
            className="group flex flex-col bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0_12px_32px_-4px_rgba(0,106,98,0.08)] hover:translate-y-[-4px] transition-all duration-500 cursor-pointer"
            onClick={() => onViewProduct(catalog.productId)}
          >
            <div className="relative h-72 overflow-hidden bg-surface-container">
              {catalog.images?.length > 0 ? (
                 <img src={catalog.images[0].url} alt={catalog.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
              ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center text-on-secondary-container opacity-50">
                   <span className="material-symbols-outlined !text-4xl mb-2">image</span>
                   <span className="text-sm font-semibold">No Image</span>
                 </div>
              )}
              {index === 0 && (
                 <div className="absolute top-4 left-4">
                   <span className="px-3 py-1 bg-primary/90 backdrop-blur-md text-on-primary text-[10px] font-bold uppercase tracking-widest rounded-full">New</span>
                 </div>
              )}
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1 font-label">{catalog.category}</span>
                  <h3 className="text-2xl font-extrabold text-on-surface tracking-tight font-headline">{catalog.name}</h3>
                </div>
                <span className="text-lg font-bold text-primary text-right pl-2 shrink-0">
                  {formatCurrency(catalog.priceB2B)} <span className="text-[10px] block opacity-70">/ pcs</span>
                </span>
              </div>
              <div className="text-on-secondary-container text-sm leading-relaxed mb-6 flex-grow font-body">
                {(() => {
                  const desc = catalog.description || `${catalog.materialLabel} - Tersedia dalam ${catalog.variants.length} varian dan ${catalog.availableSizes.length} ukuran.`;
                  const parts = desc.split('. ').map(p => p.trim()).filter(Boolean);
                  
                  const uniqueParts = parts.reduce((acc, current) => {
                    if (current.startsWith('Varian ukuran:')) {
                      const sizes = current.replace('Varian ukuran:', '').split(',').map(s => s.trim());
                      const uniqueSizes = [...new Set(sizes)].filter(Boolean);
                      acc.push(`Varian ukuran: ${uniqueSizes.join(', ')}`);
                    } else if (!acc.includes(current)) {
                      acc.push(current);
                    }
                    return acc;
                  }, []);

                  return uniqueParts.map((part, i) => (
                    <p key={i} className="mb-1 last:mb-0 text-xs text-on-secondary-container/70 font-medium">
                      {part.split(':').length === 2 ? (
                        <>
                          <span className="font-bold text-on-surface/80">{part.split(':')[0]}:</span>
                          {part.split(':')[1]}
                        </>
                      ) : part}
                    </p>
                  ));
                })()}
              </div>
              <div className="mt-auto flex gap-3">
                <button className="flex-grow bg-primary text-on-primary font-bold py-3 px-6 rounded-full text-sm hover:bg-primary-container transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">shopping_cart</span>
                  Pesan Sekarang
                </button>
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
