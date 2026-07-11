import React, { useRef } from 'react';
import {
  Edit3,
  Eye,
  ImagePlus,
  Plus,
  Trash2,
  FileDown,
  FileSpreadsheet,
  Upload,
} from 'lucide-react';
import { getInventoryPagination } from '../utils';
import { EmptyState, SearchBar } from '../shared';
import { exportToFile } from '../../../utils/api';
import { ENDPOINTS } from '../../../config/environment';
import { Skeleton, SkeletonCircle } from '../../ui/Skeleton';
import {
  downloadProductImportTemplate,
  exportProductsToCsv,
} from '../../../utils/phase2';

export default function InventoryPage({
  filteredProducts,
  formatCurrency,
  invPage,
  invPerPage,
  isAdmin,
  onDeleteProduct,
  onEditProduct,
  onOpenProductModal,
  onImportProducts,
  onSearchChange,
  onSetInvPage,
  onSetInvPerPage,
  onViewProduct,
  searchTerm,
  loading = false,
}) {
  const importInputRef = useRef(null);
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
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex-1">
          <SearchBar value={searchTerm} onChange={onSearchChange} placeholder="Cari produk, kategori, material..." />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={onOpenProductModal}
                data-testid="add-product-btn"
                className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-primary px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-on-primary shadow-lg shadow-primary/30 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:px-6 sm:py-3 sm:text-xs sm:gap-2"
              >
                <Plus size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Tambah Produk</span>
                <span className="sm:hidden">Tambah</span>
              </button>
              <button
                type="button"
                onClick={() => importInputRef.current?.click()}
                className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-success/20 bg-success-container px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-on-success-container shadow-card transition-all duration-200 hover:bg-success-container/70 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:px-5 sm:py-3 sm:text-xs sm:gap-2"
              >
                <Upload size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Import CSV</span>
                <span className="sm:hidden">Import</span>
              </button>
              <button
                type="button"
                onClick={downloadProductImportTemplate}
                className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-on-surface shadow-card transition-all duration-200 hover:bg-surface-container-low active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:px-5 sm:py-3 sm:text-xs sm:gap-2"
              >
                <FileSpreadsheet size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Template CSV</span>
                <span className="sm:hidden">Template</span>
              </button>
              <input
                ref={importInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(event) => {
                  const [file] = Array.from(event.target.files || []);
                  if (file) onImportProducts?.(file);
                  event.target.value = '';
                }}
              />
            </>
          )}
          <button
            type="button"
            onClick={() => exportToFile(ENDPOINTS.EXPORT_PRODUCTS, 'products.xlsx')}
            className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-surface-container-lowest border border-outline-variant px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-on-surface shadow-card transition-all duration-200 hover:bg-surface-container-low active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:px-6 sm:py-3 sm:text-xs sm:gap-2"
          >
            <FileDown size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Export XLSX</span>
            <span className="sm:hidden">XLSX</span>
          </button>
          <button
            type="button"
            onClick={() => exportProductsToCsv(filteredProducts)}
            className="flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-surface-container-lowest border border-outline-variant px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-on-surface shadow-card transition-all duration-200 hover:bg-surface-container-low active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:px-6 sm:py-3 sm:text-xs sm:gap-2"
          >
            <FileSpreadsheet size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">CSV</span>
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
          <thead className="bg-surface-container-low border-b border-outline-variant">
            <tr>
              <th className="p-3 text-[9px] font-black text-muted uppercase tracking-widest">Gambar</th>
              <th className="p-3 text-[9px] font-black text-muted uppercase tracking-widest">SKU</th>
              <th className="p-3 text-[9px] font-black text-muted uppercase tracking-widest">Produk</th>
              <th className="p-3 text-[9px] font-black text-muted uppercase tracking-widest">Kategori</th>
              <th className="p-3 text-[9px] font-black text-muted uppercase tracking-widest">Material</th>
              <th className="p-3 text-[9px] font-black text-muted uppercase tracking-widest text-center">Stok</th>
              <th className="p-3 text-[9px] font-black text-muted uppercase tracking-widest text-right">B2C</th>
              <th className="p-3 text-[9px] font-black text-muted uppercase tracking-widest text-right">B2B</th>
              {isAdmin && <th className="p-3 text-[9px] font-black text-muted uppercase tracking-widest text-center">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="hover:bg-surface-container-low/50 transition-all duration-200">
                  <td className="p-3"><SkeletonCircle className="w-9 h-9" /></td>
                  <td className="p-3"><Skeleton className="w-16 h-3.5" /></td>
                  <td className="p-3"><Skeleton className="w-32 h-3.5" /></td>
                  <td className="p-3"><Skeleton className="w-20 h-3.5" /></td>
                  <td className="p-3"><Skeleton className="w-20 h-3.5" /></td>
                  <td className="p-3"><Skeleton className="w-14 h-5 mx-auto" /></td>
                  <td className="p-3"><Skeleton className="w-16 h-3.5 ml-auto" /></td>
                  <td className="p-3"><Skeleton className="w-16 h-3.5 ml-auto" /></td>
                  {isAdmin && <td className="p-3"><Skeleton className="w-20 h-7 mx-auto" /></td>}
                </tr>
              ))
            ) : (
               paginated.map((product) => (
                 <tr key={product._id} className="hover:bg-surface-container-low/50 transition-all duration-200">
                   <td className="p-3">
                     {product.images?.length > 0 ? (
                       <img src={product.images[0].url} alt={product.images[0].alt || product.name} className="w-9 h-9 rounded-lg object-cover border border-outline-variant" />
                     ) : (
                       <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center">
                         <ImagePlus className="w-4 h-4 text-muted" />
                       </div>
                     )}
                   </td>
                   <td className="p-3 text-xs text-on-surface-variant font-bold">{product.sku || '-'}</td>
                   <td className="p-3 font-bold text-on-surface text-xs">
                     <button type="button" onClick={() => onViewProduct(product._id)} className="hover:text-primary transition-all duration-200 text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                       {product.name}
                     </button>
                   </td>
                   <td className="p-3 text-[10px] text-on-surface-variant font-medium">{product.category}</td>
                   <td className="p-3 text-[10px] text-on-surface-variant font-medium">{product.material || '-'}</td>
                   <td className="p-3 text-center">
                     <span className={`inline-block px-2 py-0.5 rounded-md font-black text-[10px] ${product.stockPolos < 500 ? 'bg-error-container text-error' : 'bg-surface-container-high text-on-surface-variant'}`}>
                       {product.stockPolos?.toLocaleString()} pcs
                     </span>
                   </td>
                   <td className="p-3 font-bold text-primary text-right text-xs">{formatCurrency(product.priceB2C)}</td>
                   <td className="p-3 font-bold text-on-surface-variant text-right text-xs">{formatCurrency(product.priceB2B)}</td>
                   {isAdmin && (
                     <td className="p-3 text-center">
                       <div className="flex items-center justify-center gap-1.5">
                         <button type="button" onClick={() => onViewProduct(product._id)} className="p-1.5 hover:bg-surface-container-high rounded-lg text-on-surface-variant transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" title="Detail">
                           <Eye size={14} />
                         </button>
                         <button type="button" data-testid={`edit-product-${product._id}`} onClick={() => onEditProduct(product)} className="p-1.5 hover:bg-info-container rounded-lg text-info transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" title="Edit">
                           <Edit3 size={14} />
                         </button>
                         <button type="button" data-testid={`delete-product-${product._id}`} onClick={() => onDeleteProduct(product._id)} className="p-1.5 hover:bg-error-container rounded-lg text-error transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" title="Hapus">
                           <Trash2 size={14} />
                         </button>
                       </div>
                     </td>
                   )}
                 </tr>
               ))
            )}
          </tbody>
          </table>
        </div>

        {total > 0 && (
          <div className="flex flex-col gap-3 border-t border-outline-variant bg-surface-container-low/50 px-4 py-3 xl:flex-row xl:items-center xl:justify-between">
            <span className="text-xs text-on-surface-variant font-medium">
              <span className="font-black text-on-surface">{startIdx + 1}</span>-<span className="font-black text-on-surface">{endIdx}</span> dari <span className="font-black text-on-surface">{total}</span>
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={invPerPage}
                onChange={(event) => {
                  onSetInvPerPage(Number(event.target.value));
                  onSetInvPage(1);
                }}
                className="appearance-none border border-outline-variant rounded-lg px-2.5 py-1 text-xs font-bold text-on-surface-variant bg-surface-container-lowest focus:outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all duration-200 cursor-pointer"
              >
                {[25, 50, 100].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => onSetInvPage((currentPage) => Math.max(1, currentPage - 1))}
                disabled={safePage === 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 transition-all duration-200 text-xs font-bold cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {'<'}
              </button>

              {pageNumbers.map((pageNumber, index) => (
                pageNumber === '...' ? (
                  <span key={`ellipsis-${index}`} className="w-7 h-7 flex items-center justify-center text-muted text-xs">...</span>
                ) : (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => onSetInvPage(pageNumber)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-black transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                      pageNumber === safePage
                        ? 'bg-primary text-on-primary shadow-md shadow-primary/30'
                        : 'border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'
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
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 transition-all duration-200 text-xs font-bold cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {'>'}
              </button>
            </div>
          </div>
        )}

        {total === 0 && (
          <div className="px-4 py-12">
            <EmptyState text="Tidak ada data packaging ditemukan." />
          </div>
        )}
      </div>
    </div>
  );
}
