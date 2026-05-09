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
    <div className="lg:hidden bg-[#faf8ff] min-h-screen">

      <main className="px-4 pt-4 pb-4">
        {/* Result Stats */}
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-[11px] font-bold text-[#6c7a77] uppercase tracking-wider">
            {filteredProducts.length} Produk ditemukan
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {paginated.map((catalog) => (
            <div
              key={catalog._id}
              className="group flex flex-col bg-white rounded-[1rem] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-[#e2e7ff]/60"
              onClick={() => onViewProduct(catalog._id)}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-[#f8f9ff]">
                {catalog.images?.length > 0 ? (
                  <img src={catalog.images[0].url} alt={catalog.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#3c4947] opacity-40">
                    <span className="material-symbols-outlined text-2xl mb-1">image</span>
                  </div>
                )}
              </div>
              <div className="p-3 flex flex-col flex-grow">
                <span className="text-[9px] font-bold text-[#4dbace] uppercase tracking-widest block mb-0.5 font-label">{catalog.category}</span>
                <h3 className="text-[13px] font-bold text-[#131b2e] tracking-tight font-headline line-clamp-2 leading-tight mb-2">{catalog.name}</h3>
                <div className="mt-auto flex flex-col gap-2">
                  <div className="text-[14px] font-bold text-[#4dbace] flex items-baseline gap-1">
                    {formatCurrency(catalog.priceB2B)} <span className="text-[9px] font-normal text-[#3c4947]">/ pcs</span>
                  </div>
                  <div className="text-[#3c4947] text-[10px] leading-tight font-medium">
                    Varian: {catalog.variants?.length || 0} opsi
                  </div>
                  <button className="w-full mt-1 bg-[#4dbace] text-white font-bold py-2 rounded-full text-[11px] hover:bg-[#3ea0b5] transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                    <span className="material-symbols-outlined text-[14px]">shopping_cart</span>
                    Pesan
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-[#f2f3ff] rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-[#6c7a77]/40">search_off</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#131b2e]">Produk tidak ditemukan</h3>
              <p className="text-[11px] text-[#6c7a77] max-w-[200px]">Coba ubah kata kunci atau reset filter Anda.</p>
            </div>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2 bg-[#4dbace] text-white text-[12px] font-bold rounded-full shadow-lg shadow-[#4dbace]/20"
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
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#bbc9c7]/30 bg-white text-[#3c4947] disabled:opacity-30 active:scale-90 transition-all"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>

            {pageNumbers.map((num, idx) => (
              num === '...' ? (
                <span key={`dots-${idx}`} className="px-1 text-[#bbc9c7]">...</span>
              ) : (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-bold transition-all active:scale-90 ${safePage === num
                    ? 'bg-[#4dbace] text-white shadow-md'
                    : 'bg-white border border-[#bbc9c7]/30 text-[#3c4947]'
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
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#bbc9c7]/30 bg-white text-[#3c4947] disabled:opacity-30 active:scale-90 transition-all"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        )}

        {/* CTA Get in Touch - Bright Version */}
        <section className="mt-4 mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-primary p-8 shadow-xl shadow-primary/20">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

            <div className="relative flex flex-col items-center text-center space-y-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-inner">
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
                className="flex items-center justify-center gap-3 w-full py-3.5 bg-white text-primary text-[12px] font-black rounded-2xl shadow-lg active:scale-[0.98] transition-all uppercase tracking-widest border border-white/10"
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
    <div className="flex items-center gap-1.5 bg-[#4dbace]/10 text-[#4dbace] px-2.5 py-1.5 rounded-lg border border-[#4dbace]/20 whitespace-nowrap">
      <span className="text-[11px] font-bold">{label}</span>
      <button onClick={onClear} className="flex items-center justify-center hover:opacity-70 transition-opacity">
        <span className="material-symbols-outlined text-sm font-bold">close</span>
      </button>
    </div>
  );
}
