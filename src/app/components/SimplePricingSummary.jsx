import React from 'react';
import { Package, Droplet, Palette, TrendingUp } from 'lucide-react';

/**
 * SimplePricingSummary - Ringkasan varian dan harga dengan design minimal
 * Menggunakan warna dasar saja (slate/white + primary accent)
 */
export default function SimplePricingSummary({
  catalog = {},
  variant = {},
  quantity = 0,
  useValve = false,
  basePrice = 0,
  totalPrice = 0,
  priceType = 'B2C',
  formatCurrency = (val) => `Rp ${val.toLocaleString('id-ID')}`,
}) {
  const summaryItems = [
    {
      icon: Package,
      label: 'Katalog',
      value: catalog.name || '-',
      color: 'slate'
    },
    {
      icon: TrendingUp,
      label: 'Ukuran',
      value: variant?.size || '-',
      color: 'slate'
    },
    {
      icon: Palette,
      label: 'Warna',
      value: variant?.color || '-',
      color: 'slate'
    },
    {
      icon: Droplet,
      label: 'Valve',
      value: useValve ? 'Ya' : 'Tidak',
      color: 'slate'
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-white p-5 border-b border-slate-200">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Ringkasan Varian</p>
        <h3 className="text-lg font-bold text-slate-900">Detail Pesanan Anda</h3>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Summary Items */}
        <div className="space-y-3">
          {summaryItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-white transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-slate-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-600">{item.label}</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{item.value}</span>
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-200 pt-4 space-y-3">
          {/* Stock Info */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <span className="text-sm font-medium text-slate-600">Stok Tersedia</span>
            <span className="text-sm font-bold text-slate-900">{(variant?.stock || 0).toLocaleString()} pcs</span>
          </div>

          {/* Price Type */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <span className="text-sm font-medium text-slate-600">Tipe Harga</span>
            <span className="text-xs font-bold px-2.5 py-1 bg-white border border-slate-200 rounded-full text-slate-700">
              {priceType}
            </span>
          </div>
        </div>
      </div>

      {/* Price Section */}
      <div className="bg-gradient-to-r from-primary/5 to-transparent px-5 py-4 border-t border-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-0.5">Harga Satuan</p>
            <p className="text-2xl font-black text-slate-900">{formatCurrency(basePrice)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-slate-500 mb-0.5">Jumlah Pesanan</p>
            <p className="text-lg font-bold text-primary">{quantity.toLocaleString()} pcs</p>
          </div>
        </div>

        {/* Total Price Highlight */}
        <div className="pt-2 mt-3 border-t border-primary/20">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Harga</p>
          <p className="text-3xl font-black text-primary">{formatCurrency(totalPrice)}</p>
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-slate-50 px-5 py-3 border-t border-slate-200">
        <p className="text-xs text-slate-500 leading-relaxed">
          💡 Harga di atas sudah termasuk diskon otomatis untuk pembelian dalam jumlah banyak. Konsultasikan kebutuhan khusus dengan tim kami.
        </p>
      </div>
    </div>
  );
}
