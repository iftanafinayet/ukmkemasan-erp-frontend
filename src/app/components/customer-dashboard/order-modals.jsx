import { Loader2 } from 'lucide-react';
import { FormInput, InfoBlock, ModalWrapper } from './shared';

export function CreateOrderModal({
  creatingOrder,
  formatCurrency,
  isOpen,
  onClose,
  onSubmit,
  orderForm,
  products,
  setOrderForm,
}) {
  if (!isOpen) return null;

  const selectedProduct = products.find((product) => product._id === orderForm.productId);
  const quantity = Number(orderForm.quantity) || 0;
  const basePrice = selectedProduct ? (quantity >= 1000 ? selectedProduct.priceB2B : selectedProduct.priceB2C) : 0;
  const valvePrice = orderForm.useValve ? (selectedProduct?.addons?.valvePrice || 600) : 0;
  const totalPrice = (basePrice + valvePrice) * quantity;

  return (
    <ModalWrapper onClose={onClose}>
      <div className="mb-8">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Buat Pesanan Baru</h3>
        <p className="text-slate-500 text-sm font-medium">Pilih produk kemasan dan jumlah pesanan.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Produk</label>
          <select
            required
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 font-bold"
            value={orderForm.productId}
            onChange={(event) => setOrderForm({ ...orderForm, productId: event.target.value })}
          >
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.name} - {formatCurrency(product.priceB2C)}/pcs (Stok: {product.stockPolos})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <FormInput
            label="Jumlah (kelipatan 100)"
            type="number"
            value={orderForm.quantity}
            onChange={(value) => setOrderForm({ ...orderForm, quantity: Number(value) })}
            required
            placeholder="100"
          />
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pakai Valve?</label>
            <div className="flex gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="valve" checked={orderForm.useValve} onChange={() => setOrderForm({ ...orderForm, useValve: true })} className="accent-primary w-4 h-4" />
                <span className="font-bold text-slate-700">Ya</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="valve" checked={!orderForm.useValve} onChange={() => setOrderForm({ ...orderForm, useValve: false })} className="accent-primary w-4 h-4" />
                <span className="font-bold text-slate-700">Tidak</span>
              </label>
            </div>
          </div>
        </div>

        {selectedProduct && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Estimasi Harga</p>
            <div className="space-y-1 text-sm">
              <p className="text-slate-600">Tipe: <span className="font-bold">{quantity >= 1000 ? 'B2B (Wholesale)' : 'B2C (Retail)'}</span></p>
              <p className="text-slate-600">Harga satuan: <span className="font-bold">{formatCurrency(basePrice)}</span>{valvePrice > 0 && ` + valve ${formatCurrency(valvePrice)}`}</p>
              <p className="text-lg font-black text-primary mt-2">Total: {formatCurrency(totalPrice)}</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={creatingOrder}
          className="w-full py-5 bg-primary text-white font-black rounded-3xl shadow-xl shadow-primary/30 hover:bg-primary/90 hover:-translate-y-1 active:scale-95 transition-all mt-4 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {creatingOrder ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Memproses...
            </>
          ) : (
            'Pesan Sekarang'
          )}
        </button>
      </form>
    </ModalWrapper>
  );
}

export function OrderDetailModal({
  formatCurrency,
  formatDate,
  isAdmin,
  isOpen,
  onClose,
  onTogglePaid,
  onUpdateOrderStatus,
  orderStatuses,
  selectedOrder,
  updatingStatus,
}) {
  if (!isOpen || !selectedOrder) return null;

  return (
    <ModalWrapper onClose={onClose} wide>
      <div className="mb-8">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Detail Order #{selectedOrder.orderNumber}</h3>
        <p className="text-slate-500 text-sm font-medium">{formatDate(selectedOrder.createdAt)}</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <InfoBlock label="Pelanggan" value={selectedOrder.customer?.name} sub={selectedOrder.customer?.email} />
          <InfoBlock label="Produk" value={selectedOrder.product?.name} sub={selectedOrder.product?.category} />
        </div>
        <div className="space-y-4">
          <InfoBlock label="Kuantitas" value={`${selectedOrder.details?.quantity?.toLocaleString()} pcs`} />
          <InfoBlock label="Total Harga" value={formatCurrency(selectedOrder.totalPrice)} highlight />
          <InfoBlock label="Valve" value={selectedOrder.details?.useValve ? 'Ya' : 'Tidak'} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status Produksi</p>
          <span className="px-4 py-2 bg-primary/10 rounded-full text-sm font-black text-primary">{selectedOrder.status}</span>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pembayaran</p>
          <span className={`px-4 py-2 rounded-full text-sm font-black ${selectedOrder.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
            {selectedOrder.isPaid ? 'Lunas' : 'Belum Bayar'}
          </span>
        </div>
      </div>

      {isAdmin && (
        <div className="space-y-4 border-t border-slate-100 pt-6">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aksi Admin</p>
          <div>
            <label className="text-xs font-bold text-slate-600 mb-2 block">Ubah Status Produksi</label>
            <div className="flex flex-wrap gap-2">
              {orderStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => onUpdateOrderStatus(selectedOrder._id, status)}
                  disabled={updatingStatus || selectedOrder.status === status}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedOrder.status === status ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} disabled:opacity-50`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onTogglePaid(selectedOrder._id, !selectedOrder.isPaid)}
            className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all ${selectedOrder.isPaid ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-500 text-white hover:bg-green-600 shadow-lg'}`}
          >
            {selectedOrder.isPaid ? 'Tandai Belum Bayar' : 'Tandai Sudah Bayar'}
          </button>
        </div>
      )}
    </ModalWrapper>
  );
}
