import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '../utils/api';
import { ENDPOINTS } from '../config/environment';
import {
  InvoiceModal,
  PaymentModal,
  ReturnModal,
} from './admin-sales-workspace/modals';
import {
  InvoicesSection,
  PaymentsSection,
  ReturnsSection,
  SalesProcessingSection,
} from './admin-sales-workspace/sections';
import {
  getFutureDateInput,
  getInvoiceOutstanding,
  getTodayInput,
  toNumber,
} from './admin-sales-workspace/utils';

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
  formatDateTime,
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
    notes: '',
  });
  const [paymentForm, setPaymentForm] = useState({
    invoiceId: '',
    amount: '',
    paymentDate: getTodayInput(),
    method: 'Bank Transfer',
    referenceNo: '',
    notes: '',
  });
  const [returnForm, setReturnForm] = useState({
    orderId: '',
    invoiceId: '',
    warehouseId: '',
    quantity: '',
    returnDate: getTodayInput(),
    reason: '',
    notes: '',
    restocked: true,
  });

  useEffect(() => {
    setIsInvoiceModalOpen(false);
    setIsPaymentModalOpen(false);
    setIsReturnModalOpen(false);
  }, [activeMenu]);

  const eligibleOrdersForInvoice = processing.filter((order) => !order.invoice);
  const unpaidInvoices = invoices.filter((invoice) => getInvoiceOutstanding(invoice) > 0);
  const returnableOrders = processing.filter((order) => {
    const maxReturnable = Math.max(
      toNumber(order?.details?.quantity) - toNumber(order?.returnQuantity),
      0,
    );
    return maxReturnable > 0;
  });

  const selectedInvoiceForPayment = invoices.find((invoice) => invoice._id === paymentForm.invoiceId);
  const selectedOrderForReturn = processing.find((order) => order._id === returnForm.orderId);
  const selectedOrderForInvoice = processing.find((order) => order._id === invoiceForm.orderId);
  const maxReturnableQuantity = Math.max(
    toNumber(selectedOrderForReturn?.details?.quantity) - toNumber(selectedOrderForReturn?.returnQuantity),
    0,
  );

  const resetInvoiceForm = (orderId = eligibleOrdersForInvoice[0]?._id || '') => {
    setInvoiceForm({
      orderId,
      dueDate: getFutureDateInput(14),
      notes: '',
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
      notes: '',
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
      restocked: true,
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
        notes: invoiceForm.notes,
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
        notes: paymentForm.notes,
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
        restocked: returnForm.restocked,
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

  const term = searchTerm.trim().toLowerCase();
  const filteredProcessing = processing.filter((order) => (
    !term ||
    order.orderNumber?.toLowerCase().includes(term) ||
    order.customer?.name?.toLowerCase().includes(term) ||
    order.product?.name?.toLowerCase().includes(term) ||
    order.invoice?.invoiceNumber?.toLowerCase().includes(term)
  ));
  const filteredInvoices = invoices.filter((invoice) => (
    !term ||
    invoice.invoiceNumber?.toLowerCase().includes(term) ||
    invoice.order?.orderNumber?.toLowerCase().includes(term) ||
    invoice.customer?.name?.toLowerCase().includes(term)
  ));
  const filteredPayments = payments.filter((payment) => (
    !term ||
    payment.paymentNumber?.toLowerCase().includes(term) ||
    payment.invoice?.invoiceNumber?.toLowerCase().includes(term) ||
    payment.customer?.name?.toLowerCase().includes(term) ||
    payment.referenceNo?.toLowerCase().includes(term)
  ));
  const filteredReturns = returns.filter((entry) => (
    !term ||
    entry.returnNumber?.toLowerCase().includes(term) ||
    entry.order?.orderNumber?.toLowerCase().includes(term) ||
    entry.customer?.name?.toLowerCase().includes(term) ||
    entry.product?.name?.toLowerCase().includes(term) ||
    entry.reason?.toLowerCase().includes(term)
  ));

  return (
    <>
      {activeMenu === 'sales-processing' && (
        <SalesProcessingSection
          eligibleOrdersForInvoice={eligibleOrdersForInvoice}
          filteredProcessing={filteredProcessing}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          onOpenInvoiceModal={openInvoiceModal}
          onOpenPaymentModal={openPaymentModal}
          onOpenReturnModal={openReturnModal}
          onSearchChange={setSearchTerm}
          onUpdateOrderStatus={onUpdateOrderStatus}
          onViewOrder={onViewOrder}
          processing={processing}
          returns={returns}
          searchTerm={searchTerm}
          summary={summary}
          unpaidInvoices={unpaidInvoices}
          updatingStatus={updatingStatus}
        />
      )}

      {activeMenu === 'invoice' && (
        <InvoicesSection
          filteredInvoices={filteredInvoices}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          invoices={invoices}
          onOpenInvoiceModal={openInvoiceModal}
          onOpenPaymentModal={openPaymentModal}
          onSearchChange={setSearchTerm}
          searchTerm={searchTerm}
          summary={summary}
          unpaidInvoices={unpaidInvoices}
        />
      )}

      {activeMenu === 'payment-received' && (
        <PaymentsSection
          filteredPayments={filteredPayments}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          formatDateTime={formatDateTime}
          onOpenPaymentModal={openPaymentModal}
          onSearchChange={setSearchTerm}
          payments={payments}
          searchTerm={searchTerm}
          summary={summary}
          unpaidInvoices={unpaidInvoices}
        />
      )}

      {activeMenu === 'sales-return' && (
        <ReturnsSection
          filteredReturns={filteredReturns}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          formatDateTime={formatDateTime}
          onOpenReturnModal={openReturnModal}
          onSearchChange={setSearchTerm}
          returns={returns}
          searchTerm={searchTerm}
          summary={summary}
          warehouses={warehouses}
        />
      )}

      <InvoiceModal
        eligibleOrdersForInvoice={eligibleOrdersForInvoice}
        formatCurrency={formatCurrency}
        invoiceForm={invoiceForm}
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onSubmit={handleCreateInvoice}
        savingInvoice={savingInvoice}
        selectedOrderForInvoice={selectedOrderForInvoice}
        setInvoiceForm={setInvoiceForm}
      />

      <PaymentModal
        formatCurrency={formatCurrency}
        invoices={invoices}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSubmit={handleCreatePayment}
        paymentForm={paymentForm}
        savingPayment={savingPayment}
        selectedInvoiceForPayment={selectedInvoiceForPayment}
        setPaymentForm={setPaymentForm}
        unpaidInvoices={unpaidInvoices}
      />

      <ReturnModal
        formatCurrency={formatCurrency}
        isOpen={isReturnModalOpen}
        maxReturnableQuantity={maxReturnableQuantity}
        onClose={() => setIsReturnModalOpen(false)}
        onSubmit={handleCreateReturn}
        processing={processing}
        returnForm={returnForm}
        returnableOrders={returnableOrders}
        savingReturn={savingReturn}
        selectedOrderForReturn={selectedOrderForReturn}
        setReturnForm={setReturnForm}
        warehouses={warehouses}
      />
    </>
  );
}
