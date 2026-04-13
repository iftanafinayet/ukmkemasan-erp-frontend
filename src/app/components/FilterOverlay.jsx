import React, { useState } from 'react';
import { X, Filter, ChevronDown } from 'lucide-react';

export default function FilterOverlay({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  onCategoryChange,
  sizes = [],
  selectedSize,
  onSizeChange,
  colors = [],
  selectedColor,
  onColorChange,
  priceRange = { min: 0, max: 10000000 },
  onPriceChange,
}) {
  const [localCategory, setLocalCategory] = useState(selectedCategory);
  const [localSize, setLocalSize] = useState(selectedSize);
  const [localColor, setLocalColor] = useState(selectedColor);

  const handleApplyFilters = () => {
    onCategoryChange(localCategory);
    onSizeChange?.(localSize);
    onColorChange?.(localColor);
    onClose();
  };

  const handleReset = () => {
    setLocalCategory('All');
    setLocalSize('');
    setLocalColor('');
    onCategoryChange('All');
    onSizeChange?.('');
    onColorChange?.('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Filter Panel */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 bg-white border-b border-slate-100 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-slate-800">Filter Katalog</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Filter Content */}
        <div className="p-6 space-y-6">
          {/* Kategori Filter */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">
              Kategori Produk
            </label>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setLocalCategory(category)}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                    localCategory === category
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{category}</span>
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      localCategory === category
                        ? 'border-white'
                        : 'border-slate-300'
                    }`}>
                      {localCategory === category && (
                        <span className="w-2.5 h-2.5 bg-white rounded-full" />
                      )}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Ukuran Filter */}
          {sizes.length > 0 && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">
                Ukuran
              </label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setLocalSize(localSize === size ? '' : size)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      localSize === size
                        ? 'bg-primary text-white shadow-lg'
                        : 'bg-slate-50 text-slate-700 border border-slate-200 hover:border-primary/30'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Warna Filter */}
          {colors.length > 0 && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">
                Warna
              </label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setLocalColor(localColor === color ? '' : color)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      localColor === color
                        ? 'bg-primary text-white shadow-lg'
                        : 'bg-slate-50 text-slate-700 border border-slate-200 hover:border-primary/30'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 flex gap-3 p-6 bg-white border-t border-slate-100">
          <button
            onClick={handleReset}
            className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 font-bold rounded-full hover:bg-slate-50 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleApplyFilters}
            className="flex-1 px-6 py-3 bg-primary text-white font-bold rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all"
          >
            Terapkan Filter
          </button>
        </div>
      </div>
    </>
  );
}
