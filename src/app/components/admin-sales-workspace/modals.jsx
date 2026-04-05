import { Field, ModalWrapper, SubmitButton, SummaryLine } from './shared';
import { getInvoiceOutstanding, PAYMENT_METHODS, toNumber } from './utils';

export function InvoiceModal({
  eligibleOrdersForInvoice,
  formatCurrency,
  invoiceForm,
  isOpen,
  onClose,
  onSubmit,
  savingInvoice,
  selectedOrderForInvoice,
  setInvoiceForm,
}) {
  if (!isOpen) return null;

  return (
    <ModalWrapper onClose={onClose}>
      <div className="mb-8">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Terbitkan Invoice</h3>
        <p className="text-slate-500 text-sm font-medium">Pilih order yang siap ditagihkan ke customer.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-5">
        <Field label="Order">
          <select
            required
            value={invoiceForm.orderId}
            onChange={(event) => setInvoiceForm((current) => ({ ...current, orderId: event.target.value }))}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 font-bold"
          >
            {eligibleOrdersForInvoice.map((order) => (
              <option key={order._id} value={order._id}>
                {order.orderNumber} - {order.customer?.name} - {order.product?.name}
              </option>
            ))}
          </select>
        </Field>
        {selectedOrderForInvoice && (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Ringkasan Order</p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SummaryLine label="Customer" value={selectedOrderForInvoice.customer?.name || '-'} />
              <SummaryLine label="Produk" value={selectedOrderForInvoice.product?.name || '-'} />
              <SummaryLine label="Qty" value={`${toNumber(selectedOrderForInvoice.details?.quantity).toLocaleString()} pcs`} />
              <SummaryLine label="Total" value={formatCurrency(selectedOrderForInvoice.totalPrice)} />
            </div>
          </div>
        )}
        <Field label="Jatuh Tempo">
          <input
            type="date"
            required
            value={invoiceForm.dueDate}
            onChange={(event) => setInvoiceForm((current) => ({ ...current, dueDate: event.target.value }))}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 font-bold"
          />
        </Field>
        <Field label="Catatan">
          <textarea
            rows="3"
            value={invoiceForm.notes}
            onChange={(event) => setInvoiceForm((current) => ({ ...current, notes: event.target.value }))}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 font-bold resize-none"
            placeholder="Opsional..."
          />
        </Field>
        <SubmitButton loading={savingInvoice} label="Terbitkan Invoice" />
      </form>
    </ModalWrapper>
  );
}

export function PaymentModal({
  formatCurrency,
  invoices,
  isOpen,
  onClose,
  onSubmit,
  paymentForm,
  savingPayment,
  selectedInvoiceForPayment,
  setPaymentForm,
  unpaidInvoices,
}) {
  if (!isOpen) return null;

  return (
    <ModalWrapper onClose={onClose}>
      <div className="mb-8">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Payment Receive</h3>
        <p className="text-slate-500 text-sm font-medium">Catat pembayaran yang masuk dari customer.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-5">
        <Field label="Invoice">
          <select
            required
            value={paymentForm.invoiceId}
            onChange={(event) => {
              const nextInvoice = invoices.find((invoice) => invoice._id === event.target.value);
              setPaymentForm((current) => ({
                ...current,
                invoiceId: event.target.value,
                amount: nextInvoice ? String(getInvoiceOutstanding(nextInvoice)) : '',
              }));
            }}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 font-bold"
          >
            {unpaidInvoices.map((invoice) => (
              <option key={invoice._id} value={invoice._id}>
                {invoice.invoiceNumber} - {invoice.customer?.name} - Sisa {formatCurrency(getInvoiceOutstanding(invoice))}
              </option>
            ))}
          </select>
        </Field>
        {selectedInvoiceForPayment && (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Ringkasan Invoice</p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SummaryLine label="Customer" value={selectedInvoiceForPayment.customer?.name || '-'} />
              <SummaryLine label="Order" value={selectedInvoiceForPayment.order?.orderNumber || '-'} />
              <SummaryLine label="Total" value={formatCurrency(selectedInvoiceForPayment.totalAmount)} />
              <SummaryLine label="Outstanding" value={formatCurrency(getInvoiceOutstanding(selectedInvoiceForPayment))} />
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Nominal Pembayaran">
            <input
              type="number"
              min="1"
              required
              value={paymentForm.amount}
              onChange={(event) => setPaymentForm((current) => ({ ...current, amount: event.target.value }))}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 font-bold"
            />
          </Field>
          <Field label="Tanggal Bayar">
            <input
              type="date"
              required
              value={paymentForm.paymentDate}
              onChange={(event) => setPaymentForm((current) => ({ ...current, paymentDate: event.target.value }))}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 font-bold"
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Metode">
            <select
              value={paymentForm.method}
              onChange={(event) => setPaymentForm((current) => ({ ...current, method: event.target.value }))}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 font-bold"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </Field>
          <Field label="No. Referensi">
            <input
              type="text"
              value={paymentForm.referenceNo}
              onChange={(event) => setPaymentForm((current) => ({ ...current, referenceNo: event.target.value }))}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 font-bold"
              placeholder="Transfer ref / mutasi / giro..."
            />
          </Field>
        </div>
        <Field label="Catatan">
          <textarea
            rows="3"
            value={paymentForm.notes}
            onChange={(event) => setPaymentForm((current) => ({ ...current, notes: event.target.value }))}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 font-bold resize-none"
            placeholder="Opsional..."
          />
        </Field>
        <SubmitButton loading={savingPayment} label="Simpan Payment Receive" />
      </form>
    </ModalWrapper>
  );
}

export function ReturnModal({
  isOpen,
  maxReturnableQuantity,
  onClose,
  onSubmit,
  processing,
  returnForm,
  returnableOrders,
  savingReturn,
  selectedOrderForReturn,
  setReturnForm,
  warehouses,
}) {
  if (!isOpen) return null;

  return (
    <ModalWrapper onClose={onClose}>
      <div className="mb-8">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Sales Return</h3>
        <p className="text-slate-500 text-sm font-medium">Catat barang yang dikembalikan customer dan restock jika perlu.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-5">
        <Field label="Order">
          <select
            required
            value={returnForm.orderId}
            onChange={(event) => {
              const nextOrder = processing.find((order) => order._id === event.target.value);
              setReturnForm((current) => ({
                ...current,
                orderId: event.target.value,
                invoiceId: nextOrder?.invoice?._id || '',
                quantity: '',
              }));
            }}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 font-bold"
          >
            {returnableOrders.map((order) => (
              <option key={order._id} value={order._id}>
                {order.orderNumber} - {order.customer?.name} - Sisa retur {Math.max(toNumber(order.details?.quantity) - toNumber(order.returnQuantity), 0)} pcs
              </option>
            ))}
          </select>
        </Field>
        {selectedOrderForReturn && (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Ringkasan Order</p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SummaryLine label="Produk" value={selectedOrderForReturn.product?.name || '-'} />
              <SummaryLine label="Order Qty" value={`${toNumber(selectedOrderForReturn.details?.quantity).toLocaleString()} pcs`} />
              <SummaryLine label="Sudah Diretur" value={`${toNumber(selectedOrderForReturn.returnQuantity).toLocaleString()} pcs`} />
              <SummaryLine label="Maks. Retur" value={`${maxReturnableQuantity.toLocaleString()} pcs`} />
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Jumlah Retur">
            <input
              type="number"
              min="1"
              max={maxReturnableQuantity || undefined}
              required
              value={returnForm.quantity}
              onChange={(event) => setReturnForm((current) => ({ ...current, quantity: event.target.value }))}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 font-bold"
            />
          </Field>
          <Field label="Tanggal Retur">
            <input
              type="date"
              required
              value={returnForm.returnDate}
              onChange={(event) => setReturnForm((current) => ({ ...current, returnDate: event.target.value }))}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 font-bold"
            />
          </Field>
        </div>
        <div className="rounded-2xl border border-slate-200 px-5 py-4 bg-slate-50 space-y-4">
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <p className="font-black text-slate-800 text-sm">Kembalikan ke inventory</p>
              <p className="text-xs text-slate-500">Aktifkan jika stok retur perlu ditambahkan kembali ke gudang.</p>
            </div>
            <input
              type="checkbox"
              checked={returnForm.restocked}
              onChange={(event) => setReturnForm((current) => ({ ...current, restocked: event.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            />
          </label>
          {returnForm.restocked && (
            <Field label="Gudang Tujuan">
              <select
                value={returnForm.warehouseId}
                onChange={(event) => setReturnForm((current) => ({ ...current, warehouseId: event.target.value }))}
                className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 font-bold"
              >
                <option value="">Pilih gudang...</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse._id} value={warehouse._id}>
                    {warehouse.name} ({warehouse.type})
                  </option>
                ))}
              </select>
            </Field>
          )}
        </div>
        <Field label="Alasan Retur">
          <input
            type="text"
            required
            value={returnForm.reason}
            onChange={(event) => setReturnForm((current) => ({ ...current, reason: event.target.value }))}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 font-bold"
            placeholder="Barang cacat, salah spesifikasi, dll."
          />
        </Field>
        <Field label="Catatan">
          <textarea
            rows="3"
            value={returnForm.notes}
            onChange={(event) => setReturnForm((current) => ({ ...current, notes: event.target.value }))}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 font-bold resize-none"
            placeholder="Opsional..."
          />
        </Field>
        <SubmitButton loading={savingReturn} label="Simpan Sales Return" />
      </form>
    </ModalWrapper>
  );
}
