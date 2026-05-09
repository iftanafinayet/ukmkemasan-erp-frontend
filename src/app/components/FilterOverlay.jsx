import React, { useState, useEffect } from 'react';
import { X, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FilterOverlay({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  onCategoryChange,
  selectedSize,
  onSizeChange,
  colors = [],
  selectedColor,
  onColorChange,
}) {
  const [localCategory, setLocalCategory] = useState(selectedCategory);
  const [localSize, setLocalSize] = useState(selectedSize);
  const [localColor, setLocalColor] = useState(selectedColor);

  // Sync local state when overlay opens
  useEffect(() => {
    if (isOpen) {
      setLocalCategory(selectedCategory);
      setLocalSize(selectedSize);
      setLocalColor(selectedColor);
    }
  }, [isOpen, selectedCategory, selectedSize, selectedColor]);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Filter Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300, duration: 0.4 }}
            className="fixed bottom-0 left-0 right-0 z-[101] bg-white rounded-t-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 bg-white border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#4dbace]" />
                <h2 className="text-lg font-bold text-[#131b2e] font-headline">Filter Katalog</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Filter Content */}
            <div className="p-5 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
              {/* Kategori Filter */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.15em] font-label">
                  Kategori Produk
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setLocalCategory(category)}
                      className={`text-center py-2.5 px-2 rounded-xl text-[12px] font-bold transition-all border ${localCategory === category
                        ? 'bg-[#4dbace] text-white border-[#4dbace] shadow-md shadow-[#4dbace]/20'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Warna Filter */}
              {colors.length > 0 && (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.15em] font-label">
                    Warna
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setLocalColor(localColor === color ? '' : color)}
                        className={`text-center py-2 rounded-lg text-[11px] font-bold transition-all border ${localColor === color
                          ? 'bg-[#4dbace] text-white border-[#4dbace] shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200'
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
            <div className="flex gap-3 p-5 bg-slate-50/50 border-t border-slate-100 pb-10">
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-600 text-[12px] font-bold rounded-xl active:scale-95 transition-all"
              >
                Reset
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex-1 px-4 py-3 bg-[#4dbace] text-white text-[12px] font-bold rounded-xl shadow-lg shadow-[#4dbace]/20 active:scale-95 transition-all"
              >
                Terapkan
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
