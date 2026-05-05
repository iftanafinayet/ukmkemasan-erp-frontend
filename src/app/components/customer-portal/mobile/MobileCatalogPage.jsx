import React, { useState } from 'react';
import { formatCurrency } from '../../../utils/formatters';
import FilterOverlay from '../../FilterOverlay';

export default function MobileCatalogPage({ 
  products, 
  selectedCategory, 
  setSelectedCategory,
  selectedSize,
  setSelectedSize,
  selectedColor,
  setSelectedColor,
  onViewProduct 
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
  
  // Extract unique sizes and colors for the filter
  const sizeOptions = [...new Set(products.flatMap(p => p.variants?.map(v => v.size) || []))].filter(Boolean);
  const colorOptions = [...new Set(products.flatMap(p => p.variants?.map(v => v.color) || []))].filter(Boolean);

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSize = !selectedSize || p.variants?.some(v => v.size === selectedSize);
    const matchColor = !selectedColor || p.variants?.some(v => v.color === selectedColor);
    return matchCat && matchSize && matchColor;
  });

  return (
    <div className="lg:hidden bg-[#faf8ff] min-h-screen">
      {/* Filter Row */}
      <div className="px-4 pb-3 pt-2 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-[#eaedff]">
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-1 bg-white border border-[#bbc9c7] px-3 py-1.5 rounded-lg text-[12px] font-semibold whitespace-nowrap active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[18px]">filter_list</span>
          Filter
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat 
                ? 'bg-[#d3e1f6] text-[#4dbace]' 
                : 'bg-[#f2f3ff] text-[#3c4947]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <main className="px-4 pt-4 pb-24">
        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-3 mb-10">
          {filteredProducts.map((catalog) => (
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
