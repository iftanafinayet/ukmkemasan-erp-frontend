import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { formatCurrency } from '../../../utils/formatters';
import FilterOverlay from '../../FilterOverlay';
import { getInventoryPagination } from '../../customer-dashboard/utils';
import useScrollToTop from '../../../hooks/useScrollToTop';

export default function MobileCatalogPage({
  products,
  selectedCategory,
  setSelectedCategory,
  selectedSize,
  setSelectedSize,
  selectedColor,
  setSelectedColor,
  onViewProduct,
  isFilterOpen,
  setIsFilterOpen
}) {
  useScrollToTop();
  const [searchParams] = useSearchParams();
  const urlSearchTerm = searchParams.get('search') || '';

  const [searchText, setSearchText] = useState(urlSearchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  const sizeOptions = [...new Set(products.flatMap(p => p.variants?.map(v => v.size) || []))].filter(Boolean);
  const colorOptions = [...new Set(products.flatMap(p => p.variants?.map(v => v.color) || []))].filter(Boolean);

  const searchTerm = searchText || urlSearchTerm;

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const term = searchTerm.toLowerCase();
      const matchSearch = !searchTerm ||
        p.name.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term) ||
        p.material?.toLowerCase().includes(term);

      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchSize = !selectedSize || p.variants?.some(v => v.size === selectedSize);
      const matchColor = !selectedColor || p.variants?.some(v => v.color === selectedColor);
      return matchSearch && matchCat && matchSize && matchColor;
    });
  }, [products, searchTerm, selectedCategory, selectedSize, selectedColor]);

  const {
    totalPages,
    safePage,
    paginated,
    pageNumbers,
  } = getInventoryPagination(filteredProducts, currentPage, itemsPerPage);

  const hasActiveFilters = selectedCategory !== 'All' || selectedSize || selectedColor;

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedSize('');
    setSelectedColor('');
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="lg:hidden bg-background min-h-screen">

      <main className="pb-4">
        {/* Sticky Search + Filter */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md px-4 pt-4 pb-2 border-b border-outline-variant/20">
          {/* Search Bar */}
          <div className="relative mb-3">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted text-[20px]">search</span>
            <input
              type="text"
              value={searchText}
              onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
              placeholder="Cari kemasan..."
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-on-surface placeholder:text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                className={`shrink-0 px-4 py-2 rounded-full text-[12px] font-bold transition-all duration-200 cursor-pointer ${selectedCategory === cat
                    ? 'bg-primary text-on-primary shadow-card'
                    : 'bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 pt-4">
        {/* Result Stats */}
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-[11px] font-bold text-muted uppercase tracking-wider">
            {filteredProducts.length} Produk ditemukan
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {paginated.map((catalog) => (
            <div
              key={catalog._id}
              className="group flex flex-col bg-surface-container-lowest rounded-[1rem] overflow-hidden shadow-card hover:shadow-md transition-all duration-200 cursor-pointer border border-outline-variant/40"
              onClick={() => onViewProduct(catalog._id)}
            >
              <div className="relative aspect-square overflow-hidden bg-surface-container-low">
                {catalog.images?.length > 0 ? (
                  <img src={catalog.images[0].url} alt={catalog.name} className="w-full h-full object-cover transition-all duration-200 group-hover:scale-[1.05]" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant opacity-40">
                    <span className="material-symbols-outlined text-xl mb-1">image</span>
                  </div>
                )}
              </div>
              <div className="p-2.5 flex flex-col flex-grow">
                <span className="text-[8px] font-bold text-primary uppercase tracking-widest block mb-0.5 font-label">{catalog.category}</span>
                <h3 className="text-[12px] font-bold text-on-surface tracking-tight font-headline line-clamp-1 leading-tight mb-1.5">{catalog.name}</h3>

                <div className="space-y-1 mb-2.5 flex-grow">
                  <div className="text-[14px] font-black text-primary flex items-baseline gap-0.5">
                    {formatCurrency(catalog.priceB2B)} <span className="text-[8px] font-bold text-on-surface-variant/70 uppercase tracking-tighter">/ pcs</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <div className="px-1.5 py-0.5 bg-surface-container-high rounded-md text-[8px] font-bold text-on-surface/60">
                      {catalog.variants?.length || 0} Opsi
                    </div>
                    {(() => {
                      const totalStock = catalog.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
                      return (
                        <div className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold ${totalStock > 0 ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'}`}>
                          {totalStock > 0 ? `Stok ${totalStock.toLocaleString()}` : 'Stok habis'}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-muted/40">search_off</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-on-surface">Produk tidak ditemukan</h3>
              <p className="text-[11px] text-muted max-w-[200px]">Coba ubah kata kunci atau reset filter Anda.</p>
            </div>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2 bg-primary text-on-primary text-[12px] font-bold rounded-full shadow-card-hover shadow-primary/20 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* Numbered Pagination Control */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mb-10">
            <button
              type="button"
              onClick={() => goToPage(Math.max(1, safePage - 1))}
              disabled={safePage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 bg-surface-container-lowest text-on-surface-variant disabled:opacity-30 active:scale-90 transition-all duration-200"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>

            {pageNumbers.map((num, idx) => (
              num === '...' ? (
                <span key={`dots-${idx}`} className="px-1 text-outline-variant">...</span>
              ) : (
                <button
                  key={num}
                  onClick={() => goToPage(num)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-bold transition-all active:scale-90 ${safePage === num
                    ? 'bg-primary text-on-primary shadow-md'
                    : 'bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant'
                    }`}
                >
                  {num}
                </button>
              )
            ))}

            <button
              type="button"
              onClick={() => goToPage(Math.min(totalPages, safePage + 1))}
              disabled={safePage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 bg-surface-container-lowest text-on-surface-variant disabled:opacity-30 active:scale-90 transition-all duration-200"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        )}

        {/* CTA Get in Touch - Bright Version */}
        <section className="mt-4 mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-primary p-8 shadow-xl shadow-primary/20">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-surface-container-lowest/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-surface-container-lowest/10 rounded-full blur-2xl"></div>

            <div className="relative flex flex-col items-center text-center space-y-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-surface-container-lowest/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-inner">
                <span className="material-symbols-outlined text-white text-3xl">chat</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white font-headline leading-tight">
                  Tidak Menemukan Ukuran <br /> yang Pas?
                </h3>
                <p className="text-white/80 text-[12px] leading-relaxed max-w-[240px] mx-auto">
                  Tenang, kami melayani custom ukuran dan desain sesuai keinginan Anda.
                </p>
              </div>

              <a
                href="https://wa.me/6281226733221"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-3.5 bg-surface-container-lowest text-primary text-[12px] font-black rounded-2xl shadow-card-hover active:scale-[0.98] transition-all duration-200 uppercase tracking-widest border border-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
              >
                Konsultasi via WhatsApp
              </a>
            </div>
          </div>
        </section>
        </div>
      </main>

      <FilterOverlay
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sizes={sizeOptions}
        selectedSize={selectedSize}
        onSizeChange={setSelectedSize}
        colors={colorOptions}
        selectedColor={selectedColor}
        onColorChange={setSelectedColor}
      />
    </div>
  );
}

