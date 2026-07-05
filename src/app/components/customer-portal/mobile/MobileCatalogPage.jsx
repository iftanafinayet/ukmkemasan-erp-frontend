import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { formatCurrency } from '../../../utils/formatters';
import FilterOverlay from '../../FilterOverlay';
import { getInventoryPagination } from '../../customer-dashboard/utils';

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
  const [searchParams] = useSearchParams();
  const urlSearchTerm = searchParams.get('search') || '';

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  // Extract unique sizes and colors for the filter
  const sizeOptions = [...new Set(products.flatMap(p => p.variants?.map(v => v.size) || []))].filter(Boolean);
  const colorOptions = [...new Set(products.flatMap(p => p.variants?.map(v => v.color) || []))].filter(Boolean);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const term = urlSearchTerm.toLowerCase();
      const matchSearch = !urlSearchTerm ||
        p.name.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term) ||
        p.material?.toLowerCase().includes(term);

      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchSize = !selectedSize || p.variants?.some(v => v.size === selectedSize);
      const matchColor = !selectedColor || p.variants?.some(v => v.color === selectedColor);
      return matchSearch && matchCat && matchSize && matchColor;
    });
  }, [products, urlSearchTerm, selectedCategory, selectedSize, selectedColor]);

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

  return (
    <div className="lg:hidden bg-background min-h-screen">

      <main className="px-4 pt-4 pb-4">
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
                  </div>
                </div>

                <button className="w-full bg-primary text-on-primary font-bold py-2 rounded-lg text-[10px] hover:bg-primary/80 transition-all duration-200 flex items-center justify-center gap-1.5 shadow-card shadow-primary/10 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                  <span className="material-symbols-outlined text-[13px]">shopping_cart</span>
                  Pesan
                </button>
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
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                  onClick={() => setCurrentPage(num)}
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

function FilterChip({ label, onClear }) {
  return (
    <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1.5 rounded-lg border border-primary/20 whitespace-nowrap">
      <span className="text-[11px] font-bold">{label}</span>
      <button onClick={onClear} className="flex items-center justify-center hover:opacity-70 transition-all duration-200">
        <span className="material-symbols-outlined text-sm font-bold">close</span>
      </button>
    </div>
  );
}
