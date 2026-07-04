import { toNumber } from './helpers';

const PRODUCT_IMPORT_HEADERS = [
  'name',
  'category',
  'material',
  'minOrder',
  'valvePrice',
  'description',
  'sku',
  'size',
  'color',
  'priceB2C',
  'priceB2B',
  'stock',
];

const PAYMENT_METHOD_LABELS = {
  bank_transfer: 'Bank Transfer',
  credit_card: 'Kartu Kredit',
  gopay: 'GoPay',
  qris: 'QRIS',
  cash: 'Tunai',
};

const csvEscape = (value) => {
  const stringValue = String(value ?? '');
  if (!/[",\n]/.test(stringValue)) return stringValue;
  return `"${stringValue.replace(/"/g, '""')}"`;
};

const parseCsvRow = (line) => {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
};

export const downloadTextFile = (content, fileName, mimeType = 'text/plain;charset=utf-8') => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const downloadProductImportTemplate = () => {
  const sampleRows = [
    PRODUCT_IMPORT_HEADERS.join(','),
    [
      'Flat Bottom Premium',
      'Flat Bottom',
      'PET / ALU / LLDPE',
      '100',
      '600',
      'Flat bottom dengan zipper premium',
      'FBP-250-BLK',
      '250 gr',
      'Black',
      '3200',
      '2800',
      '1500',
    ].map(csvEscape).join(','),
    [
      'Flat Bottom Premium',
      'Flat Bottom',
      'PET / ALU / LLDPE',
      '100',
      '600',
      'Flat bottom dengan zipper premium',
      'FBP-500-WHT',
      '500 gr',
      'White',
      '4200',
      '3700',
      '900',
    ].map(csvEscape).join(','),
  ].join('\n');

  downloadTextFile(sampleRows, 'product-import-template.csv', 'text/csv;charset=utf-8');
};

export const parseProductImportCsv = (text) => {
  const lines = String(text || '')
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    throw new Error('File CSV minimal harus berisi header dan satu baris data.');
  }

  const headers = parseCsvRow(lines[0]).map((header) => header.trim());
  const missingHeaders = PRODUCT_IMPORT_HEADERS.filter((header) => !headers.includes(header));

  if (missingHeaders.length > 0) {
    throw new Error(`Header CSV tidak lengkap: ${missingHeaders.join(', ')}`);
  }

  const headerMap = headers.reduce((accumulator, header, index) => {
    accumulator[header] = index;
    return accumulator;
  }, {});

  const rows = lines.slice(1).map((line, rowIndex) => {
    const values = parseCsvRow(line);
    const row = PRODUCT_IMPORT_HEADERS.reduce((accumulator, header) => {
      accumulator[header] = values[headerMap[header]] ?? '';
      return accumulator;
    }, {});

    row.__rowNumber = rowIndex + 2;
    return row;
  });

  const groupedProducts = rows.reduce((accumulator, row) => {
    const groupKey = [
      row.name,
      row.category,
      row.material,
      row.minOrder,
      row.valvePrice,
      row.description,
    ].join('::');

    if (!accumulator[groupKey]) {
      accumulator[groupKey] = {
        name: row.name.trim(),
        category: row.category.trim(),
        material: row.material.trim(),
        minOrder: toNumber(row.minOrder) || 100,
        valvePrice: toNumber(row.valvePrice),
        description: row.description.trim(),
        variants: [],
      };
    }

    accumulator[groupKey].variants.push({
      sku: row.sku.trim(),
      size: row.size.trim(),
      color: row.color.trim(),
      priceB2C: toNumber(row.priceB2C),
      priceB2B: toNumber(row.priceB2B),
      stock: toNumber(row.stock),
      rowNumber: row.__rowNumber,
    });

    return accumulator;
  }, {});

  return Object.values(groupedProducts);
};

export const validateImportedProducts = (products) => {
  const errors = [];

  products.forEach((product) => {
    if (!product.name || !product.category || !product.material) {
      errors.push(`Produk "${product.name || 'Tanpa Nama'}" belum lengkap.`);
    }

    if (!Array.isArray(product.variants) || product.variants.length === 0) {
      errors.push(`Produk "${product.name || 'Tanpa Nama'}" belum memiliki varian.`);
      return;
    }

    product.variants.forEach((variant) => {
      if (!variant.sku || !variant.size || !variant.color) {
        errors.push(`Baris ${variant.rowNumber}: SKU, size, dan color wajib diisi.`);
      }

      if (
        !Number.isFinite(variant.priceB2C)
        || !Number.isFinite(variant.priceB2B)
        || !Number.isFinite(variant.stock)
      ) {
        errors.push(`Baris ${variant.rowNumber}: harga dan stok harus berupa angka valid.`);
      }
    });
  });

  return errors;
};

export const exportProductsToCsv = (products = []) => {
  const rows = [PRODUCT_IMPORT_HEADERS.join(',')];

  products.forEach((product) => {
    const variants = Array.isArray(product.variants) && product.variants.length > 0
      ? product.variants
      : [{
          sku: product.sku || '',
          size: product.size || '',
          color: product.color || '',
          priceB2C: product.priceB2C || 0,
          priceB2B: product.priceB2B || 0,
          stock: product.stockPolos || 0,
        }];

    variants.forEach((variant) => {
      rows.push([
        product.name,
        product.category,
        product.material,
        product.minOrder || 100,
        product.addons?.valvePrice || 0,
        product.description || '',
        variant.sku || '',
        variant.size || '',
        variant.color || '',
        variant.priceB2C || 0,
        variant.priceB2B || 0,
        variant.stock || 0,
      ].map(csvEscape).join(','));
    });
  });

  downloadTextFile(rows.join('\n'), 'products-export.csv', 'text/csv;charset=utf-8');
};

export const normalizePaymentHistory = (order) => {
  const paymentEntries = order?.payments
    || order?.paymentHistory
    || order?.invoice?.payments
    || order?.paymentData?.payments
    || [];

  if (!Array.isArray(paymentEntries)) return [];

  return paymentEntries.map((payment, index) => ({
    id: payment?._id || payment?.id || payment?.paymentNumber || `payment-${index}`,
    paymentNumber: payment?.paymentNumber || payment?.referenceNo || payment?.transactionId || `PAY-${index + 1}`,
    amount: toNumber(payment?.amount || payment?.paidAmount),
    paymentDate: payment?.paymentDate || payment?.createdAt || payment?.paidAt || null,
    method: PAYMENT_METHOD_LABELS[payment?.method] || payment?.method || 'Payment',
    note: payment?.note || payment?.notes || '',
    status: payment?.status || 'Recorded',
  }));
};

export const buildOrderPreview = ({ orderForm, selectedCatalog, selectedVariant, quantity, basePrice, valvePrice }) => {
  const safeQuantity = toNumber(quantity);
  const unitPrice = toNumber(basePrice) + toNumber(valvePrice);
  const stock = toNumber(selectedVariant?.stock);
  const minOrder = toNumber(selectedCatalog?.minOrder || 100);

  return {
    productName: selectedCatalog?.name || '-',
    category: selectedCatalog?.category || '-',
    material: selectedCatalog?.materialLabel || selectedCatalog?.material || '-',
    sku: selectedVariant?.sku || '-',
    size: selectedVariant?.size || '-',
    color: selectedVariant?.color || '-',
    quantity: safeQuantity,
    minOrder,
    useValve: Boolean(orderForm?.useValve),
    basePrice: toNumber(basePrice),
    valvePrice: toNumber(valvePrice),
    unitPrice,
    totalPrice: unitPrice * safeQuantity,
    availableStock: stock,
    projectedStock: Math.max(stock - safeQuantity, 0),
    stockSufficient: safeQuantity > 0 && safeQuantity <= stock,
  };
};

export const filterStockCardRows = (rows, filters) => {
  const { dateFrom, dateTo, refType } = filters;
  const fromTime = dateFrom ? new Date(dateFrom).setHours(0, 0, 0, 0) : null;
  const toTime = dateTo ? new Date(dateTo).setHours(23, 59, 59, 999) : null;

  return (Array.isArray(rows) ? rows : []).filter((row) => {
    const rowTime = row?.date ? new Date(row.date).getTime() : null;
    const refTypeMatch = refType === 'all' || String(row?.refType || '').toLowerCase() === refType.toLowerCase();
    const fromMatch = fromTime === null || (rowTime !== null && rowTime >= fromTime);
    const toMatch = toTime === null || (rowTime !== null && rowTime <= toTime);

    return refTypeMatch && fromMatch && toMatch;
  });
};

export const buildReportCharts = (data = {}) => {
  const categoryStats = Array.isArray(data?.categoryStats) ? data.categoryStats : [];
  const trendSources = [
    data?.monthlyRevenue,
    data?.revenueTrend,
    data?.monthlyTrends,
    data?.revenueByMonth,
    data?.salesTrend,
    data?.summary?.monthlyRevenue,
    data?.summary?.revenueTrend,
    data?.summary?.monthlyTrends,
  ];
  const monthlyRevenue = trendSources.find((source) => Array.isArray(source)) || [];
  const orders = Array.isArray(data?.orders)
    ? data.orders
    : Array.isArray(data?.allOrders)
      ? data.allOrders
      : [];

  const trendDataFromApi = monthlyRevenue.map((entry, index) => ({
    label: entry?.month || entry?.label || entry?._id || entry?.period || `M-${index + 1}`,
    revenue: toNumber(
      entry?.revenue
      || entry?.totalRevenue
      || entry?.amount
      || entry?.value,
    ),
    orders: toNumber(
      entry?.orders
      || entry?.totalOrders
      || entry?.count
      || entry?.totalCount,
    ),
  })).filter((entry) => entry.label && (entry.revenue > 0 || entry.orders > 0));

  const trendMapFromOrders = orders.reduce((accumulator, order) => {
    const orderDate = order?.createdAt || order?.orderDate || order?.updatedAt;
    if (!orderDate) return accumulator;

    const date = new Date(orderDate);
    if (Number.isNaN(date.getTime())) return accumulator;

    const label = new Intl.DateTimeFormat('id-ID', {
      month: 'short',
      year: '2-digit',
      timeZone: 'UTC',
    }).format(date);

    if (!accumulator[label]) {
      accumulator[label] = {
        label,
        revenue: 0,
        orders: 0,
        sortKey: Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1),
      };
    }

    accumulator[label].revenue += toNumber(order?.totalPrice);
    accumulator[label].orders += 1;
    return accumulator;
  }, {});

  const trendDataFromOrders = Object.values(trendMapFromOrders)
    .sort((left, right) => left.sortKey - right.sortKey)
    .map((entry) => ({
      label: entry.label,
      revenue: entry.revenue,
      orders: entry.orders,
    }));

  const trendData = trendDataFromApi.length > 0 ? trendDataFromApi : trendDataFromOrders;

  const categoryPerformance = categoryStats.map((category) => ({
    name: category._id?.length > 12 ? `${category._id.slice(0, 12)}...` : category._id,
    fullName: category._id || 'Tanpa Kategori',
    Revenue: toNumber(category.revenue),
    Pesanan: toNumber(category.totalOrders),
    Terjual: toNumber(category.totalQtySold),
    AOV: toNumber(category.avgOrderValue),
  }));

  return {
    trendData,
    categoryPerformance,
  };
};

export const buildDashboardNotifications = ({ adminStats, lowStockProducts }) => {
  const notifications = [];
  const recentOrders = Array.isArray(adminStats?.recentOrders) ? adminStats.recentOrders : [];
  const productionStatus = Array.isArray(adminStats?.productionStatus) ? adminStats.productionStatus : [];

  lowStockProducts.slice(0, 5).forEach((product) => {
    notifications.push({
      id: `low-stock-${product._id}`,
      type: 'low-stock',
      title: `${product.name} hampir habis`,
      description: `Stok tersisa ${toNumber(product.stockPolos).toLocaleString()} pcs di master produk.`,
      tone: 'red',
    });
  });

  recentOrders.slice(0, 5).forEach((order) => {
    notifications.push({
      id: `new-order-${order._id}`,
      type: 'new-order',
      title: `Pesanan baru #${order.orderNumber || order._id?.slice?.(-6) || '-'}`,
      description: `${order.customer?.name || 'Customer'} memesan ${order.product?.name || 'produk custom'}.`,
      tone: 'emerald',
    });
  });

  productionStatus
    .filter((entry) => toNumber(entry?.count) > 0)
    .slice(0, 3)
    .forEach((entry) => {
      notifications.push({
        id: `production-${entry._id}`,
        type: 'production',
        title: `${entry._id} perlu perhatian`,
        description: `${toNumber(entry.count).toLocaleString()} order berada di tahap ${entry._id}.`,
        tone: 'sky',
      });
    });

  return notifications;
};

export const getStockOpnameVariance = (systemStock, actualStock) => {
  const normalizedSystemStock = toNumber(systemStock);
  const normalizedActualStock = toNumber(actualStock);
  const difference = normalizedActualStock - normalizedSystemStock;

  return {
    systemStock: normalizedSystemStock,
    actualStock: normalizedActualStock,
    difference,
    adjustmentType: difference >= 0 ? 'In' : 'Out',
    adjustmentQuantity: Math.abs(difference),
    matches: difference === 0,
  };
};

export const printInvoicePdf = ({ order, payments, formatCurrency, formatDate, formatDateTime }) => {
  const invoiceWindow = window.open('', '_blank', 'width=960,height=720');
  if (!invoiceWindow) return false;

  const normalizedPayments = normalizePaymentHistory({ payments });
  const totalPaid = normalizedPayments.reduce((sum, payment) => sum + toNumber(payment.amount), 0);
  const totalAmount = toNumber(order?.invoice?.totalAmount || order?.totalPrice);
  const outstandingAmount = Math.max(totalAmount - totalPaid, 0);

  const paymentRows = normalizedPayments.length > 0
    ? normalizedPayments.map((payment) => `
      <tr>
        <td>${payment.paymentNumber}</td>
        <td>${payment.paymentDate ? formatDateTime(payment.paymentDate) : '-'}</td>
        <td>${payment.method}</td>
        <td style="text-align:right">${formatCurrency(payment.amount)}</td>
      </tr>
    `).join('')
    : '<tr><td colspan="4" style="text-align:center;color:#64748b">Belum ada pembayaran tercatat.</td></tr>';

  invoiceWindow.document.write(`
    <html>
      <head>
        <title>Invoice ${order?.invoice?.invoiceNumber || order?.orderNumber || 'UKM Kemasan'}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 32px; color: #0f172a; }
          h1, h2, h3, p { margin: 0; }
          .muted { color: #64748b; }
          .card { border: 1px solid #e2e8f0; border-radius: 20px; padding: 20px; margin-top: 24px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border-bottom: 1px solid #e2e8f0; padding: 12px 8px; font-size: 12px; text-align: left; }
          th { text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; font-size: 10px; }
          .total { font-size: 18px; font-weight: 700; }
          .accent { color: #0ea5b7; }
        </style>
      </head>
      <body>
        <h1>Invoice ${order?.invoice?.invoiceNumber || order?.orderNumber || '-'}</h1>
        <p class="muted" style="margin-top:8px">Dibuat ${formatDate(order?.invoice?.issuedDate || order?.createdAt)} · Jatuh tempo ${formatDate(order?.invoice?.dueDate || order?.createdAt)}</p>

        <div class="grid">
          <div class="card">
            <h3>Customer</h3>
            <p style="margin-top:12px;font-weight:700">${order?.customer?.name || '-'}</p>
            <p class="muted" style="margin-top:4px">${order?.customer?.email || '-'}</p>
          </div>
          <div class="card">
            <h3>Pesanan</h3>
            <p style="margin-top:12px;font-weight:700">${order?.product?.name || 'Produk Custom'}</p>
            <p class="muted" style="margin-top:4px">${toNumber(order?.details?.quantity).toLocaleString()} pcs · Valve ${order?.details?.useValve ? 'Ya' : 'Tidak'}</p>
          </div>
        </div>

        <div class="card">
          <h3>Ringkasan Tagihan</h3>
          <table>
            <tbody>
              <tr><td>Total Invoice</td><td style="text-align:right">${formatCurrency(totalAmount)}</td></tr>
              <tr><td>Total Dibayar</td><td style="text-align:right">${formatCurrency(totalPaid)}</td></tr>
              <tr><td class="total">Sisa Tagihan</td><td class="total accent" style="text-align:right">${formatCurrency(outstandingAmount)}</td></tr>
            </tbody>
          </table>
        </div>

        <div class="card">
          <h3>Riwayat Pembayaran</h3>
          <table>
            <thead>
              <tr>
                <th>No. Pembayaran</th>
                <th>Tanggal</th>
                <th>Metode</th>
                <th>Nominal</th>
              </tr>
            </thead>
            <tbody>${paymentRows}</tbody>
          </table>
        </div>
      </body>
    </html>
  `);

  invoiceWindow.document.close();
  invoiceWindow.focus();
  invoiceWindow.print();
  return true;
};
