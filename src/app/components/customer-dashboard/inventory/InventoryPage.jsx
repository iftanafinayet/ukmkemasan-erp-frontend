import React from 'react';
import {
  Edit3,
  Eye,
  ImagePlus,
  Plus,
  Trash2,
  FileDown,
} from 'lucide-react';
import { getInventoryPagination } from '../utils';
import { EmptyState, SearchBar } from '../shared';
import { exportToFile } from '../../../utils/api';

export default function InventoryPage({
  filteredProducts,
  formatCurrency,
  invPage,
  invPerPage,
  isAdmin,
  onDeleteProduct,
  onEditProduct,
  onOpenProductModal,
  onSearchChange,
  onSetInvPage,
  onSetInvPerPage,
  onViewProduct,
  searchTerm,
}) {
  const {
    total,
    totalPages,
    safePage,
    startIdx,
    endIdx,
    paginated,
    pageNumbers,
  } = getInventoryPagination(filteredProducts, invPage, invPerPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex-1">
          <SearchBar value={searchTerm} onChange={onSearchChange} placeholder="Cari produk, kategori, material..." />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <button
              type="button"
              onClick={onOpenProductModal}
              className="flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-primary px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={16} />
              Tambah Produk
            </button>
          )}
          <button
            type="button"
            onClick={() => exportToFile('/api/products/export', 'products.xlsx')}
            className="flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-white border border-slate-200 px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
          >
            <FileDown size={16} />
            Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gambar</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produk</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Material</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Stok</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">B2C</th>
              <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">B2B</th>
              {isAdmin && <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.map((product) => (
              <tr key={product._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-5">
                  {product.images?.length > 0 ? (
                    <img src={product.images[0].url} alt={product.images[0].alt || product.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                      <ImagePlus className="w-5 h-5 text-slate-300" />
                    </div>
                  )}
                </td>
                <td className="p-5 text-sm text-slate-500 font-bold">{product.sku || '-'}</td>
                <td className="p-5 font-bold text-slate-800">
                  <button type="button" onClick={() => onViewProduct(product._id)} className="hover:text-primary transition-colors text-left">
                    {product.name}
                  </button>
                </td>
                <td className="p-5 text-xs text-slate-500 font-medium">{product.category}</td>
                <td className="p-5 text-xs text-slate-500 font-medium">{product.material || '-'}</td>
                <td className="p-5 text-center">
                  <span className={`inline-block px-3 py-1 rounded-lg font-black text-xs ${product.stockPolos < 500 ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-600'}`}>
                    {product.stockPolos?.toLocaleString()} pcs
                  </span>
                </td>
                <td className="p-5 font-bold text-primary text-right">{formatCurrency(product.priceB2C)}</td>
                <td className="p-5 font-bold text-slate-600 text-right">{formatCurrency(product.priceB2B)}</td>
                {isAdmin && (
                  <td className="p-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button type="button" onClick={() => onViewProduct(product._id)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors" title="Detail">
                        <Eye size={16} />
                      </button>
                      <button type="button" onClick={() => onEditProduct(product)} className="p-2 hover:bg-blue-50 rounded-xl text-blue-500 transition-colors" title="Edit">
                        <Edit3 size={16} />
                      </button>
                      <button type="button" onClick={() => onDeleteProduct(product._id)} className="p-2 hover:bg-red-50 rounded-xl text-red-500 transition-colors" title="Hapus">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          </table>
        </div>

        {total > 0 && (
          <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/50 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
            <span className="text-sm text-slate-500 font-medium">
              Showing <span className="font-black text-slate-700">{startIdx + 1}</span> - <span className="font-black text-slate-700">{endIdx}</span> of <span className="font-black text-slate-700">{total}</span> entries
            </span>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={invPerPage}
                onChange={(event) => {
                  onSetInvPerPage(Number(event.target.value));
                  onSetInvPage(1);
                }}
                className="appearance-none border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
              >
                {[25, 50, 100].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => onSetInvPage((currentPage) => Math.max(1, currentPage - 1))}
                disabled={safePage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-all text-sm font-bold"
              >
                {'<'}
              </button>

              {pageNumbers.map((pageNumber, index) => (
                pageNumber === '...' ? (
                  <span key={`ellipsis-${index}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm">...</span>
                ) : (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => onSetInvPage(pageNumber)}
                    className={`w-8 h-8 flex items-center justify-center rounded-xl text-sm font-black transition-all ${
                      pageNumber === safePage
                        ? 'bg-primary text-white shadow-md shadow-primary/30'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                )
              ))}

              <button
                type="button"
                onClick={() => onSetInvPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                disabled={safePage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-all text-sm font-bold"
              >
                {'>'}
              </button>
            </div>
          </div>
        )}

        {total === 0 && (
          <div className="px-6 py-16">
            <EmptyState text="Tidak ada data packaging ditemukan." />
          </div>
        )}
      </div>
    </div>
  );
}
