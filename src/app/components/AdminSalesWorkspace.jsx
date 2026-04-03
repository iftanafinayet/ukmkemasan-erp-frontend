import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { ENDPOINTS } from '../config/environment';
import { StatusBadge } from './StatusBadge';
import {
  Search,
  Plus,
  Loader2,
  Receipt,
  DollarSign,
  ArrowRightLeft,
  Eye,
  CalendarDays,
  Package,
  AlertCircle,
  Users,
  ClipboardList,
  X,
  Save
} from 'lucide-react';
import { toast } from 'sonner';

const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'QRIS', 'Giro', 'Other'];

const toNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const getTodayInput = () => new Date().toISOString().slice(0, 10);

const getFutureDateInput = (days) => {
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate.toISOString().slice(0, 10);
};

const getInvoiceOutstanding = (invoice) => {
  return Math.max(toNumber(invoice?.totalAmount) - toNumber(invoice?.paidAmount), 0);
};

const getInvoiceStatusClasses = (status) => {
  switch (String(status || '').toLowerCase()) {
    case 'paid':
      return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'partially paid':
      return 'bg-amber-50 text-amber-600 border-amber-100';
    case 'overdue':
      return 'bg-rose-50 text-rose-600 border-rose-100';
    case 'draft':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    default:
      return 'bg-sky-50 text-sky-600 border-sky-100';
  }
};

export default function AdminSalesWorkspace({
  activeMenu,
  overview,
  searchTerm,
  setSearchTerm,
  onRefresh,
  onViewOrder,
  onUpdateOrderStatus,
  updatingStatus,
  formatCurrency,
  formatDate,
  formatDateTime
}) {
  const processing = Array.isArray(overview?.processing) ? overview.processing : [];
  const invoices = Array.isArray(overview?.invoices) ? overview.invoices : [];
  const payments = Array.isArray(overview?.payments) ? overview.payments : [];
  const returns = Array.isArray(overview?.returns) ? overview.returns : [];
  const warehouses = Array.isArray(overview?.warehouses) ? overview.warehouses : [];
  const summary = overview?.summary || {};

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [savingInvoice, setSavingInvoice] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [savingReturn, setSavingReturn] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    orderId: '',
    dueDate: getFutureDateInput(14),
    notes: ''
  });
  const [paymentForm, setPaymentForm] = useState({
    invoiceId: '',
    amount: '',
    paymentDate: getTodayInput(),
    method: 'Bank Transfer',
    referenceNo: '',
    notes: ''
  });
  const [returnForm, setReturnForm] = useState({
    orderId: '',
    invoiceId: '',
    warehouseId: '',
    quantity: '',
    returnDate: getTodayInput(),
    reason: '',
    notes: '',
    restocked: true
  });

  useEffect(() => {
    setIsInvoiceModalOpen(false);
    setIsPaymentModalOpen(false);
    setIsReturnModalOpen(false);
  }, [activeMenu]);

  const eligibleOrdersForInvoice = processing.filter((order) => !order.invoice);
  const unpaidInvoices = invoices.filter((invoice) => getInvoiceOutstanding(invoice) > 0);
  const returnableOrders = processing.filter((order) => {
    const maxReturnable = Math.max(toNumber(order?.details?.quantity) - toNumber(order?.returnQuantity), 0);
    return maxReturnable > 0;
  });

  const selectedInvoiceForPayment = invoices.find((invoice) => invoice._id === paymentForm.invoiceId);
  const selectedOrderForReturn = processing.find((order) => order._id === returnForm.orderId);
  const selectedOrderForInvoice = processing.find((order) => order._id === invoiceForm.orderId);
  const maxReturnableQuantity = Math.max(
    toNumber(selectedOrderForReturn?.details?.quantity) - toNumber(selectedOrderForReturn?.returnQuantity),
    0
  );

  const resetInvoiceForm = (orderId = eligibleOrdersForInvoice[0]?._id || '') => {
    setInvoiceForm({
      orderId,
      dueDate: getFutureDateInput(14),
      notes: ''
    });
  };

  const resetPaymentForm = (invoiceId = unpaidInvoices[0]?._id || '') => {
    const invoice = invoices.find((entry) => entry._id === invoiceId) || unpaidInvoices[0];
    setPaymentForm({
      invoiceId: invoice?._id || '',
      amount: invoice ? String(getInvoiceOutstanding(invoice)) : '',
      paymentDate: getTodayInput(),
      method: 'Bank Transfer',
      referenceNo: '',
      notes: ''
    });
  };

  const resetReturnForm = (orderId = returnableOrders[0]?._id || '') => {
    const order = processing.find((entry) => entry._id === orderId) || returnableOrders[0];
    setReturnForm({
      orderId: order?._id || '',
      invoiceId: order?.invoice?._id || '',
      warehouseId: warehouses[0]?._id || '',
      quantity: '',
      returnDate: getTodayInput(),
      reason: '',
      notes: '',
      restocked: true
    });
  };

  const openInvoiceModal = (orderId = '') => {
    if (eligibleOrdersForInvoice.length === 0) {
      toast.info('Semua order sudah memiliki invoice.');
      return;
    }

    resetInvoiceForm(orderId || eligibleOrdersForInvoice[0]?._id || '');
    setIsInvoiceModalOpen(true);
  };

  const openPaymentModal = (invoiceId = '') => {
    if (unpaidInvoices.length === 0) {
      toast.info('Tidak ada invoice dengan sisa tagihan.');
      return;
    }

    resetPaymentForm(invoiceId || unpaidInvoices[0]?._id || '');
    setIsPaymentModalOpen(true);
  };

  const openReturnModal = (orderId = '') => {
    if (returnableOrders.length === 0) {
      toast.info('Tidak ada order yang masih bisa diretur.');
      return;
    }

    resetReturnForm(orderId || returnableOrders[0]?._id || '');
    setIsReturnModalOpen(true);
  };

  const handleCreateInvoice = async (event) => {
    event.preventDefault();
    if (!invoiceForm.orderId) {
      toast.error('Pilih order terlebih dahulu.');
      return;
    }

    setSavingInvoice(true);
    try {
      await api.post(ENDPOINTS.SALES_INVOICES, {
        orderId: invoiceForm.orderId,
        dueDate: invoiceForm.dueDate,
        notes: invoiceForm.notes
      });
      toast.success('Invoice berhasil diterbitkan.');
      setIsInvoiceModalOpen(false);
      resetInvoiceForm();
      await onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal membuat invoice.');
    } finally {
      setSavingInvoice(false);
    }
  };

  const handleCreatePayment = async (event) => {
    event.preventDefault();
    if (!paymentForm.invoiceId) {
      toast.error('Pilih invoice terlebih dahulu.');
      return;
    }

    setSavingPayment(true);
    try {
      await api.post(ENDPOINTS.SALES_PAYMENTS, {
        invoiceId: paymentForm.invoiceId,
        amount: Number(paymentForm.amount),
        paymentDate: paymentForm.paymentDate,
        method: paymentForm.method,
        referenceNo: paymentForm.referenceNo,
        notes: paymentForm.notes
      });
      toast.success('Pembayaran berhasil dicatat.');
      setIsPaymentModalOpen(false);
      resetPaymentForm();
      await onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mencatat pembayaran.');
    } finally {
      setSavingPayment(false);
    }
  };

  const handleCreateReturn = async (event) => {
    event.preventDefault();
    if (!returnForm.orderId) {
      toast.error('Pilih order terlebih dahulu.');
      return;
    }

    setSavingReturn(true);
    try {
      await api.post(ENDPOINTS.SALES_RETURNS, {
        orderId: returnForm.orderId,
        invoiceId: returnForm.invoiceId || undefined,
        warehouseId: returnForm.restocked ? (returnForm.warehouseId || undefined) : undefined,
        quantity: Number(returnForm.quantity),
        returnDate: returnForm.returnDate,
        reason: returnForm.reason,
        notes: returnForm.notes,
        restocked: returnForm.restocked
      });
      toast.success('Retur penjualan berhasil diproses.');
      setIsReturnModalOpen(false);
      resetReturnForm();
      await onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memproses retur penjualan.');
    } finally {
      setSavingReturn(false);
    }
  };

  const filteredProcessing = processing.filter((order) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;

    return (
      order.orderNumber?.toLowerCase().includes(term) ||
      order.customer?.name?.toLowerCase().includes(term) ||
      order.product?.name?.toLowerCase().includes(term) ||
      order.invoice?.invoiceNumber?.toLowerCase().includes(term)
    );
  });

  const filteredInvoices = invoices.filter((invoice) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;

    return (
      invoice.invoiceNumber?.toLowerCase().includes(term) ||
      invoice.order?.orderNumber?.toLowerCase().includes(term) ||
      invoice.customer?.name?.toLowerCase().includes(term)
    );
  });

  const filteredPayments = payments.filter((payment) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;

    return (
      payment.paymentNumber?.toLowerCase().includes(term) ||
      payment.invoice?.invoiceNumber?.toLowerCase().includes(term) ||
      payment.customer?.name?.toLowerCase().includes(term) ||
      payment.referenceNo?.toLowerCase().includes(term)
    );
  });

  const filteredReturns = returns.filter((entry) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;

    return (
      entry.returnNumber?.toLowerCase().includes(term) ||
      entry.order?.orderNumber?.toLowerCase().includes(term) ||
      entry.customer?.name?.toLowerCase().includes(term) ||
      entry.product?.name?.toLowerCase().includes(term) ||
      entry.reason?.toLowerCase().includes(term)
    );
  });

  const renderSearchBar = (placeholder, actionLabel, onAction) => (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 text-sm"
        />
      </div>
      <button
        type="button"
        onClick={onAction}
        className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
      >
        <Plus size={16} />
        {actionLabel}
      </button>
    </div>
  );

  const renderSummaryCards = (items) => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.label} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{item.label}</p>
              <p className="text-2xl font-black text-slate-900 mt-2">{item.value}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
              <item.icon className="w-5 h-5 text-primary" />
            </div>
          </div>
          {item.helper && <p className="text-xs text-slate-500 font-medium mt-3">{item.helper}</p>}
        </div>
      ))}
    </div>
  );

  const renderSalesProcessing = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      {renderSummaryCards([
        {
          label: 'Total Order',
          value: summary.totalOrders || processing.length,
          helper: 'Seluruh order yang masuk ke pipeline penjualan.',
          icon: ClipboardList
        },
        {
          label: 'Siap Diinvoice',
          value: summary.readyToInvoice || eligibleOrdersForInvoice.length,
          helper: 'Order tanpa invoice yang masih menunggu tagihan.',
          icon: Receipt
        },
        {
          label: 'Piutang Aktif',
          value: formatCurrency(summary.totalReceivable || 0),
          helper: `${summary.outstandingInvoices || unpaidInvoices.length} invoice belum lunas`,
          icon: DollarSign
        },
        {
          label: 'Nilai Retur',
          value: formatCurrency(summary.totalReturns || 0),
          helper: `${returns.length} retur penjualan tercatat`,
          icon: ArrowRightLeft
        }
      ])}

      {renderSearchBar('Cari order, customer, produk, atau invoice...', 'Terbitkan Invoice', () => openInvoiceModal())}

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
                        {['Quotation', 'Payment', 'Production', 'Quality Control', 'Shipping', 'Completed'].map((status) => (
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
                        onClick={() => openInvoiceModal(order._id)}
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
                    <p className="text-xs text-slate-500 mt-1">
                      Sisa {formatCurrency(order.outstandingAmount)}
                    </p>
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
                        <ActionButton onClick={() => openPaymentModal(order.invoice._id)}>
                          <DollarSign className="w-3.5 h-3.5" />
                          Bayar
                        </ActionButton>
                      )}
                      {Math.max(toNumber(order.details?.quantity) - toNumber(order.returnQuantity), 0) > 0 && (
                        <ActionButton onClick={() => openReturnModal(order._id)}>
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

  const renderInvoices = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      {renderSummaryCards([
        {
          label: 'Jumlah Invoice',
          value: invoices.length,
          helper: 'Seluruh invoice yang sudah diterbitkan.',
          icon: Receipt
        },
        {
          label: 'Belum Lunas',
          value: unpaidInvoices.length,
          helper: 'Invoice yang masih memiliki outstanding.',
          icon: DollarSign
        },
        {
          label: 'Total Tagihan',
          value: formatCurrency(invoices.reduce((sum, invoice) => sum + toNumber(invoice.totalAmount), 0)),
          helper: 'Akumulasi nilai seluruh invoice.',
          icon: ClipboardList
        },
        {
          label: 'Piutang Berjalan',
          value: formatCurrency(summary.totalReceivable || 0),
          helper: 'Nilai sisa tagihan yang belum diterima.',
          icon: Users
        }
      ])}

      {renderSearchBar('Cari nomor invoice, order, atau customer...', 'Buat Invoice', () => openInvoiceModal())}

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
                        <ActionButton onClick={() => openPaymentModal(invoice._id)}>
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

  const renderPayments = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      {renderSummaryCards([
        {
          label: 'Jumlah Penerimaan',
          value: payments.length,
          helper: 'Seluruh transaksi payment receive yang tercatat.',
          icon: DollarSign
        },
        {
          label: 'Dana Diterima',
          value: formatCurrency(summary.totalPayments || 0),
          helper: 'Akumulasi uang yang sudah masuk dari customer.',
          icon: Receipt
        },
        {
          label: 'Invoice Terbuka',
          value: unpaidInvoices.length,
          helper: 'Invoice yang masih menunggu pembayaran.',
          icon: ClipboardList
        },
        {
          label: 'Outstanding',
          value: formatCurrency(summary.totalReceivable || 0),
          helper: 'Sisa nilai piutang yang belum tertagih.',
          icon: Users
        }
      ])}

      {renderSearchBar('Cari payment no, invoice, customer, atau referensi...', 'Terima Pembayaran', () => openPaymentModal())}

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

  const renderReturns = () => {
    const totalReturnQty = returns.reduce((sum, entry) => sum + toNumber(entry.quantity), 0);

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        {renderSummaryCards([
          {
            label: 'Jumlah Retur',
            value: returns.length,
            helper: 'Transaksi sales return yang sudah diproses.',
            icon: ArrowRightLeft
          },
          {
            label: 'Qty Diretur',
            value: `${totalReturnQty.toLocaleString()} pcs`,
            helper: 'Total quantity barang yang kembali dari customer.',
            icon: Package
          },
          {
            label: 'Nilai Retur',
            value: formatCurrency(summary.totalReturns || 0),
            helper: 'Akumulasi nominal retur penjualan.',
            icon: DollarSign
          },
          {
            label: 'Gudang Aktif',
            value: warehouses.length,
            helper: 'Pilihan gudang yang dapat dipakai saat restock retur.',
            icon: CalendarDays
          }
        ])}

        {renderSearchBar('Cari nomor retur, order, customer, atau produk...', 'Buat Retur', () => openReturnModal())}

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
  };

  return (
    <>
      {activeMenu === 'sales-processing' && renderSalesProcessing()}
      {activeMenu === 'invoice' && renderInvoices()}
      {activeMenu === 'payment-received' && renderPayments()}
      {activeMenu === 'sales-return' && renderReturns()}

      {isInvoiceModalOpen && (
        <ModalWrapper onClose={() => setIsInvoiceModalOpen(false)}>
          <div className="mb-8">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Terbitkan Invoice</h3>
            <p className="text-slate-500 text-sm font-medium">Pilih order yang siap ditagihkan ke customer.</p>
          </div>
          <form onSubmit={handleCreateInvoice} className="space-y-5">
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
                <div className="grid grid-cols-2 gap-4 mt-4">
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
      )}

      {isPaymentModalOpen && (
        <ModalWrapper onClose={() => setIsPaymentModalOpen(false)}>
          <div className="mb-8">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Payment Receive</h3>
            <p className="text-slate-500 text-sm font-medium">Catat pembayaran yang masuk dari customer.</p>
          </div>
          <form onSubmit={handleCreatePayment} className="space-y-5">
            <Field label="Invoice">
              <select
                required
                value={paymentForm.invoiceId}
                onChange={(event) => {
                  const nextInvoice = invoices.find((invoice) => invoice._id === event.target.value);
                  setPaymentForm((current) => ({
                    ...current,
                    invoiceId: event.target.value,
                    amount: nextInvoice ? String(getInvoiceOutstanding(nextInvoice)) : ''
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
                <div className="grid grid-cols-2 gap-4 mt-4">
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
      )}

      {isReturnModalOpen && (
        <ModalWrapper onClose={() => setIsReturnModalOpen(false)}>
          <div className="mb-8">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Sales Return</h3>
            <p className="text-slate-500 text-sm font-medium">Catat barang yang dikembalikan customer dan restock jika perlu.</p>
          </div>
          <form onSubmit={handleCreateReturn} className="space-y-5">
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
                    quantity: ''
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
                <div className="grid grid-cols-2 gap-4 mt-4">
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
      )}
    </>
  );
}

const TableHead = ({ children }) => (
  <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.22em]">
    {children}
  </th>
);

const ActionButton = ({ children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-black uppercase tracking-[0.14em] hover:bg-slate-200 transition-colors"
  >
    {children}
  </button>
);

const Field = ({ label, children }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    {children}
  </div>
);

const SummaryLine = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
    <p className="font-bold text-slate-800 text-sm mt-1">{value}</p>
  </div>
);

const SubmitButton = ({ loading, label }) => (
  <button
    type="submit"
    disabled={loading}
    className="w-full py-5 bg-primary text-white font-black rounded-3xl shadow-xl shadow-primary/30 hover:bg-primary/90 hover:-translate-y-1 active:scale-95 transition-all mt-4 disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-3"
  >
    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4" />}
    {label}
  </button>
);

const ModalWrapper = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
    <div className="bg-white rounded-[40px] p-10 w-full max-w-xl shadow-2xl relative border border-white/20 max-h-[90vh] overflow-y-auto">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
      >
        <X size={20} />
      </button>
      {children}
    </div>
  </div>
);

const EmptyState = ({ text }) => (
  <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-40 text-slate-900">
    <AlertCircle size={60} strokeWidth={1} className="mb-4" />
    <p className="font-black uppercase tracking-[0.28em] text-[10px] text-center">{text}</p>
  </div>
);
