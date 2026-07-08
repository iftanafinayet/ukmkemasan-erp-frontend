import React from 'react';
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

  const countFor = (cat) => catalogGroups.filter((c) => cat === 'All' ? true : c.category === cat).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-primary font-bold text-[11px] uppercase tracking-[0.2em] mb-1 block">Jelajahi Katalog</span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-on-surface font-headline">
            Katalog <span className="text-primary italic">Produk</span>
          </h1>
        </div>
        <button
          type="button"
          onClick={onNavigateToCreateOrder}
          className="flex items-center justify-center gap-2 bg-primary px-5 py-3 rounded-xl text-on-primary text-sm font-bold shadow-card-hover shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span> Buat Pesanan
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Filter Sidebar */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-28 lg:self-start">
          <div className="bg-surface-container-lowest rounded-[20px] shadow-card border border-outline-variant/20 overflow-hidden">
            <h3 className="px-5 pt-5 pb-2 text-[10px] font-black uppercase tracking-widest text-muted">Kategori Produk</h3>
            <div className="flex flex-col p-2">
              {categories.map((category) => {
                const isActive = category === selectedCategory;
                return (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                      isActive ? 'bg-primary text-white shadow-card shadow-primary/20' : 'text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                  >
                    {category}
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-surface-container-high text-on-surface-variant'}`}>
                      {countFor(category)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-[20px] shadow-card border border-outline-variant/20 p-5 hidden lg:block">
            <h3 className="font-headline text-[15px] font-bold text-on-surface mb-1">Pesanan Custom</h3>
            <p className="text-[13px] text-on-surface-variant mb-4 leading-relaxed">Butuh kemasan dengan spesifikasi khusus? Konsultasikan langsung dengan tim kami.</p>
            <a
              href="https://wa.me/62817345168?text=Halo%2C%20saya%20mau%20buat%20pesanan%20custom%20kemasan."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary/15 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              Pesanan Custom
            </a>
          </div>

          {/* Mobile custom order CTA */}
          <a
            href="https://wa.me/62817345168?text=Halo%2C%20saya%20mau%20buat%20pesanan%20custom%20kemasan."
            target="_blank"
            rel="noopener noreferrer"
            className="flex lg:hidden items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary/15 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            Pesanan Custom
          </a>

          {/* Mobile quick category filter pills */}
          <div className="flex lg:hidden items-center gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
            {categories.map((category) => {
              const isActive = category === selectedCategory;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${
                    isActive
                      ? 'bg-primary text-white border-primary shadow-card shadow-primary/20'
                      : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/20 hover:border-primary/40 hover:text-primary'
                  }`}
                >
                  {category}
                  <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-surface-container-high'}`}>
                    {countFor(category)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-8 space-y-4">
          {filteredCatalogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCatalogs.map((catalog) => (
                <div
                  key={catalog.key}
                  className="group flex flex-col bg-surface-container-lowest rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer border border-outline-variant/60"
                  onClick={() => onViewProduct(catalog.productId)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-surface-container">
                    {catalog.images?.length > 0 ? (
                      <img src={catalog.images[0].url} alt={catalog.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted">
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
                  <div className="p-3">
                    <span className="text-[9px] font-bold text-primary uppercase tracking-widest font-label">{catalog.category}</span>
                    <h3 className="text-sm font-bold text-on-surface mt-1 leading-tight line-clamp-2">{catalog.displayName || catalog.name}</h3>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-outline-variant">
                      <div>
                        <span className="text-base font-black text-primary">{formatCurrency(catalog.priceB2B)}</span>
                        <span className="text-[9px] font-bold text-on-surface-variant ml-0.5">/pcs</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-on-surface-variant font-medium">
                        <span className="material-symbols-outlined !text-[14px]">inventory_2</span>
                        {catalog.stockPolos?.toLocaleString() || 0} stok
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text={`Tidak ada katalog untuk kategori ${selectedCategory}.`} />
          )}
        </div>
      </div>
    </div>
  );
}
