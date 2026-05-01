import {
  ArrowRightLeft,
  CalendarDays,
  ClipboardList,
  DollarSign,
  Eye,
  Package,
  Receipt,
  Users,
  FileDown,
} from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import {
  ActionButton,
  EmptyState,
  SearchActionBar,
  SummaryCards,
  TableHead,
} from './shared';
import { exportToFile } from '../../utils/api';
import {
  getInvoiceOutstanding,
  getInvoiceStatusClasses,
  SALES_ORDER_STATUSES,
  toNumber,
} from './utils';

export function SalesProcessingSection({
  eligibleOrdersForInvoice,
  filteredProcessing,
  formatCurrency,
  formatDate,
  onOpenInvoiceModal,
  onOpenPaymentModal,
  onOpenReturnModal,
  onSearchChange,
  onUpdateOrderStatus,
  onViewOrder,
  processing,
  returns,
  searchTerm,
  summary,
  unpaidInvoices,
  updatingStatus,
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <SummaryCards
        items={[
          {
            label: 'Total Order',
            value: summary.totalOrders || processing.length,
            helper: 'Seluruh order yang masuk ke pipeline penjualan.',
            icon: ClipboardList,
          },
          {
            label: 'Siap Diinvoice',
            value: summary.readyToInvoice || eligibleOrdersForInvoice.length,
            helper: 'Order tanpa invoice yang masih menunggu tagihan.',
            icon: Receipt,
          },
          {
            label: 'Piutang Aktif',
            value: formatCurrency(summary.totalReceivable || 0),
            helper: `${summary.outstandingInvoices || unpaidInvoices.length} invoice belum lunas`,
            icon: DollarSign,
          },
          {
            label: 'Nilai Retur',
            value: formatCurrency(summary.totalReturns || 0),
            helper: `${returns.length} retur penjualan tercatat`,
            icon: ArrowRightLeft,
          },
        ]}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <SearchActionBar
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Cari order, customer, produk, atau invoice..."
          actionLabel="Terbitkan Invoice"
          onAction={() => onOpenInvoiceModal()}
        />
        <button
          type="button"
          onClick={() => exportToFile('/api/sales/overview/export', 'sales-overview.xlsx')}
          className="bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <FileDown size={16} />
          Export
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Pembayaran</TableHead>
                <TableHead>Retur</TableHead>
                <TableHead>Aksi</TableHead>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProcessing.map((order) => (
                <tr key={order._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-black text-slate-900 text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">{order.product?.name || 'Produk tidak ditemukan'}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{toNumber(order.details?.quantity).toLocaleString()} pcs</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-800 text-sm">{order.customer?.name || '-'}</p>
                    <p className="text-xs text-slate-400">{order.customer?.email || '-'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-3">
                      <StatusBadge status={order.status} />
                      <select
                        value={order.status}
                        onChange={(event) => onUpdateOrderStatus(order._id, event.target.value)}
                        disabled={updatingStatus}
                        className="w-full max-w-[180px] px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary disabled:opacity-50"
                      >
                        {SALES_ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {order.invoice ? (
                      <div>
                        <span className={`inline-flex px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] ${getInvoiceStatusClasses(order.invoice.status)}`}>
                          {order.invoice.status}
                        </span>
                        <p className="font-bold text-slate-800 text-sm mt-3">{order.invoice.invoiceNumber}</p>
                        <p className="text-xs text-slate-400">Jatuh tempo {formatDate(order.invoice.dueDate)}</p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onOpenInvoiceModal(order._id)}
                        className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-black"
                      >
                        Buat Invoice
                      </button>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-black text-slate-900 text-sm">
                      {formatCurrency(order.paymentTotal)} / {formatCurrency(order.invoice?.totalAmount || order.totalPrice)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Sisa {formatCurrency(order.outstandingAmount)}</p>
                    <p className={`text-[11px] font-black mt-2 ${order.isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {order.isPaid ? 'Lunas' : 'Belum Lunas'}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-black text-slate-900 text-sm">{toNumber(order.returnQuantity).toLocaleString()} pcs</p>
                    <p className="text-xs text-slate-500 mt-1">{formatCurrency(order.returnAmount)}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <ActionButton onClick={() => onViewOrder(order._id)}>
                        <Eye className="w-3.5 h-3.5" />
                        Detail
                      </ActionButton>
                      {order.invoice && order.outstandingAmount > 0 && (
                        <ActionButton onClick={() => onOpenPaymentModal(order.invoice._id)}>
                          <DollarSign className="w-3.5 h-3.5" />
                          Bayar
                        </ActionButton>
                      )}
                      {Math.max(toNumber(order.details?.quantity) - toNumber(order.returnQuantity), 0) > 0 && (
                        <ActionButton onClick={() => onOpenReturnModal(order._id)}>
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          Retur
                        </ActionButton>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredProcessing.length === 0 && (
          <div className="px-6 py-16">
            <EmptyState text="Tidak ada order sales yang cocok dengan pencarian." />
          </div>
        )}
      </div>
    </div>
  );
}

export function InvoicesSection({
  filteredInvoices,
  formatCurrency,
  formatDate,
  invoices,
  onOpenInvoiceModal,
  onOpenPaymentModal,
  onSearchChange,
  searchTerm,
  summary,
  unpaidInvoices,
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <SummaryCards
        items={[
          {
            label: 'Jumlah Invoice',
            value: invoices.length,
            helper: 'Seluruh invoice yang sudah diterbitkan.',
            icon: Receipt,
          },
          {
            label: 'Belum Lunas',
            value: unpaidInvoices.length,
            helper: 'Invoice yang masih memiliki outstanding.',
            icon: DollarSign,
          },
          {
            label: 'Total Tagihan',
            value: formatCurrency(invoices.reduce((sum, invoice) => sum + toNumber(invoice.totalAmount), 0)),
            helper: 'Akumulasi nilai seluruh invoice.',
            icon: ClipboardList,
          },
          {
            label: 'Piutang Berjalan',
            value: formatCurrency(summary.totalReceivable || 0),
            helper: 'Nilai sisa tagihan yang belum diterima.',
            icon: Users,
          },
        ]}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <SearchActionBar
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Cari nomor invoice, order, atau customer..."
          actionLabel="Buat Invoice"
          onAction={() => onOpenInvoiceModal()}
        />
        <button
          type="button"
          onClick={() => exportToFile('/api/sales/invoices/export', 'invoices.xlsx')}
          className="bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <FileDown size={16} />
          Export
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <TableHead>Invoice</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Dibayar</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-black text-slate-900 text-sm">{invoice.invoiceNumber}</p>
                    <p className="text-xs text-slate-500 mt-1">{invoice.product?.name || '-'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-800 text-sm">{invoice.order?.orderNumber || '-'}</p>
                    <p className="text-xs text-slate-400 mt-1">{toNumber(invoice.quantity).toLocaleString()} pcs</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-800 text-sm">{invoice.customer?.name || '-'}</p>
                    <p className="text-xs text-slate-400">{invoice.customer?.email || '-'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-800 text-sm">{formatDate(invoice.issuedDate)}</p>
                    <p className="text-xs text-slate-400">Due {formatDate(invoice.dueDate)}</p>
                  </td>
                  <td className="px-5 py-4 font-black text-slate-900 text-sm">{formatCurrency(invoice.totalAmount)}</td>
                  <td className="px-5 py-4">
                    <p className="font-black text-slate-900 text-sm">{formatCurrency(invoice.paidAmount)}</p>
                    <p className="text-xs text-slate-500">Sisa {formatCurrency(getInvoiceOutstanding(invoice))}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] ${getInvoiceStatusClasses(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      {getInvoiceOutstanding(invoice) > 0 && (
                        <ActionButton onClick={() => onOpenPaymentModal(invoice._id)}>
                          <DollarSign className="w-3.5 h-3.5" />
                          Bayar
                        </ActionButton>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredInvoices.length === 0 && (
          <div className="px-6 py-16">
            <EmptyState text="Belum ada invoice yang cocok dengan pencarian." />
          </div>
        )}
      </div>
    </div>
  );
}

export function PaymentsSection({
  filteredPayments,
  formatCurrency,
  formatDate,
  formatDateTime,
  onOpenPaymentModal,
  onSearchChange,
  payments,
  searchTerm,
  summary,
  unpaidInvoices,
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <SummaryCards
        items={[
          {
            label: 'Jumlah Penerimaan',
            value: payments.length,
            helper: 'Seluruh transaksi payment receive yang tercatat.',
            icon: DollarSign,
          },
          {
            label: 'Dana Diterima',
            value: formatCurrency(summary.totalPayments || 0),
            helper: 'Akumulasi uang yang sudah masuk dari customer.',
            icon: Receipt,
          },
          {
            label: 'Invoice Terbuka',
            value: unpaidInvoices.length,
            helper: 'Invoice yang masih menunggu pembayaran.',
            icon: ClipboardList,
          },
          {
            label: 'Outstanding',
            value: formatCurrency(summary.totalReceivable || 0),
            helper: 'Sisa nilai piutang yang belum tertagih.',
            icon: Users,
          },
        ]}
      />

      <SearchActionBar
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="Cari payment no, invoice, customer, atau referensi..."
        actionLabel="Terima Pembayaran"
        onAction={() => onOpenPaymentModal()}
      />

      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <TableHead>No. Payment</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Nominal</TableHead>
                <TableHead>Referensi</TableHead>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((payment) => (
                <tr key={payment._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-black text-slate-900 text-sm">{payment.paymentNumber}</p>
                    <p className="text-xs text-slate-500 mt-1">{payment.order?.orderNumber || '-'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-800 text-sm">{payment.invoice?.invoiceNumber || '-'}</p>
                    <p className="text-xs text-slate-400 mt-1">{payment.invoice?.status || '-'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-800 text-sm">{payment.customer?.name || '-'}</p>
                    <p className="text-xs text-slate-400">{payment.customer?.email || '-'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-800 text-sm">{formatDate(payment.paymentDate)}</p>
                    <p className="text-xs text-slate-400">{formatDateTime(payment.paymentDate)}</p>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-slate-700">{payment.method || '-'}</td>
                  <td className="px-5 py-4 font-black text-emerald-600 text-sm">{formatCurrency(payment.amount)}</td>
                  <td className="px-5 py-4 text-sm text-slate-500 font-medium">{payment.referenceNo || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPayments.length === 0 && (
          <div className="px-6 py-16">
            <EmptyState text="Belum ada payment receive yang cocok dengan pencarian." />
          </div>
        )}
      </div>
    </div>
  );
}

export function ReturnsSection({
  filteredReturns,
  formatCurrency,
  formatDate,
  formatDateTime,
  onOpenReturnModal,
  onSearchChange,
  returns,
  searchTerm,
  summary,
  warehouses,
}) {
  const totalReturnQty = returns.reduce((sum, entry) => sum + toNumber(entry.quantity), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <SummaryCards
        items={[
          {
            label: 'Jumlah Retur',
            value: returns.length,
            helper: 'Transaksi sales return yang sudah diproses.',
            icon: ArrowRightLeft,
          },
          {
            label: 'Qty Diretur',
            value: `${totalReturnQty.toLocaleString()} pcs`,
            helper: 'Total quantity barang yang kembali dari customer.',
            icon: Package,
          },
          {
            label: 'Nilai Retur',
            value: formatCurrency(summary.totalReturns || 0),
            helper: 'Akumulasi nominal retur penjualan.',
            icon: DollarSign,
          },
          {
            label: 'Gudang Aktif',
            value: warehouses.length,
            helper: 'Pilihan gudang yang dapat dipakai saat restock retur.',
            icon: CalendarDays,
          },
        ]}
      />

      <SearchActionBar
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="Cari nomor retur, order, customer, atau produk..."
        actionLabel="Buat Retur"
        onAction={() => onOpenReturnModal()}
      />

      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <TableHead>No. Retur</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Nilai</TableHead>
                <TableHead>Gudang</TableHead>
                <TableHead>Tanggal</TableHead>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReturns.map((entry) => (
                <tr key={entry._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-black text-slate-900 text-sm">{entry.returnNumber}</p>
                    <p className="text-xs text-slate-500 mt-1">{entry.reason}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-800 text-sm">{entry.order?.orderNumber || '-'}</p>
                    <p className="text-xs text-slate-400 mt-1">{entry.invoice?.invoiceNumber || 'Tanpa invoice'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-800 text-sm">{entry.customer?.name || '-'}</p>
                    <p className="text-xs text-slate-400">{entry.customer?.email || '-'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-800 text-sm">{entry.product?.name || '-'}</p>
                    <p className="text-xs text-slate-400 mt-1">{entry.product?.sku || '-'}</p>
                  </td>
                  <td className="px-5 py-4 font-black text-slate-900 text-sm">{toNumber(entry.quantity).toLocaleString()} pcs</td>
                  <td className="px-5 py-4 font-black text-rose-600 text-sm">{formatCurrency(entry.totalAmount)}</td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-800 text-sm">{entry.warehouse?.name || '-'}</p>
                    <p className={`text-xs font-black mt-1 ${entry.restocked ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {entry.restocked ? 'Restock ke inventory' : 'Tanpa restock'}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-800 text-sm">{formatDate(entry.returnDate)}</p>
                    <p className="text-xs text-slate-400">{formatDateTime(entry.returnDate)}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredReturns.length === 0 && (
          <div className="px-6 py-16">
            <EmptyState text="Belum ada sales return yang cocok dengan pencarian." />
          </div>
        )}
      </div>
    </div>
  );
}
