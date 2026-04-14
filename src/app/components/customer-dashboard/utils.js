import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';

export { formatCurrency, formatDate, formatDateTime };

export const toNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const getOrderTimestamp = (order) => {
  const orderDate = order?.createdAt || order?.orderDate || order?.updatedAt;

  if (!orderDate) return null;

  const timestamp = new Date(orderDate).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
};

export const getFilteredData = ({
  activeMenu,
  data,
  searchTerm,
  statusFilter,
  orderSort = 'newest',
}) => {
  if (!Array.isArray(data)) return data;

  let filtered = [...data];
  const isOrderMenu = activeMenu === 'orders' || activeMenu === 'sales-orders';

  if (searchTerm) {
    const term = searchTerm.toLowerCase();

    if (isOrderMenu) {
      filtered = filtered.filter((order) => (
        order.orderNumber?.toLowerCase().includes(term) ||
        order.product?.name?.toLowerCase().includes(term) ||
        order.customer?.name?.toLowerCase().includes(term)
      ));
    } else if (activeMenu === 'inventory' || activeMenu === 'inventory-items') {
      filtered = filtered.filter((product) => (
        product.name?.toLowerCase().includes(term) ||
        product.category?.toLowerCase().includes(term) ||
        product.material?.toLowerCase().includes(term)
      ));
    } else if (activeMenu === 'customers') {
      filtered = filtered.filter((customer) => (
        customer.name?.toLowerCase().includes(term) ||
        customer.email?.toLowerCase().includes(term)
      ));
    }
  }

  if (statusFilter !== 'all' && isOrderMenu) {
    filtered = filtered.filter((order) => order.status === statusFilter);
  }

  if (isOrderMenu) {
    filtered.sort((left, right) => {
      const leftTimestamp = getOrderTimestamp(left);
      const rightTimestamp = getOrderTimestamp(right);

      if (leftTimestamp === null && rightTimestamp === null) return 0;
      if (leftTimestamp === null) return 1;
      if (rightTimestamp === null) return -1;

      return orderSort === 'oldest'
        ? leftTimestamp - rightTimestamp
        : rightTimestamp - leftTimestamp;
    });
  }

  return filtered;
};

export const getInventoryPagination = (items, page, perPage) => {
  const total = Array.isArray(items) ? items.length : 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * perPage;
  const endIdx = Math.min(startIdx + perPage, total);
  const paginated = Array.isArray(items) ? items.slice(startIdx, endIdx) : [];

  const pageNumbers = [];
  if (totalPages <= 5) {
    for (let index = 1; index <= totalPages; index += 1) {
      pageNumbers.push(index);
    }
  } else {
    pageNumbers.push(1);
    if (safePage > 3) pageNumbers.push('...');
    for (
      let index = Math.max(2, safePage - 1);
      index <= Math.min(totalPages - 1, safePage + 1);
      index += 1
    ) {
      pageNumbers.push(index);
    }
    if (safePage < totalPages - 2) pageNumbers.push('...');
    pageNumbers.push(totalPages);
  }

  return {
    total,
    totalPages,
    safePage,
    startIdx,
    endIdx,
    paginated,
    pageNumbers,
  };
};

export const buildItemCategories = (products) => {
  const categoryMap = products.reduce((accumulator, product) => {
    const key = product.category || 'Tanpa Kategori';

    if (!accumulator[key]) {
      accumulator[key] = {
        name: key,
        totalItems: 0,
        totalStock: 0,
        minPrice: Number.POSITIVE_INFINITY,
        maxPrice: 0,
      };
    }

    accumulator[key].totalItems += 1;
    accumulator[key].totalStock += toNumber(product.stockPolos);
    accumulator[key].minPrice = Math.min(
      accumulator[key].minPrice,
      toNumber(product.priceB2B || product.priceB2C),
    );
    accumulator[key].maxPrice = Math.max(
      accumulator[key].maxPrice,
      toNumber(product.priceB2C || product.priceB2B),
    );

    return accumulator;
  }, {});

  return Object.values(categoryMap).sort((left, right) => right.totalItems - left.totalItems);
};

export const normalizeStockCardRows = (payload) => {
  const rawRows = Array.isArray(payload)
    ? payload
    : payload?.data ||
      payload?.stockCards ||
      payload?.movements ||
      payload?.items ||
      payload?.history ||
      [];

  if (!Array.isArray(rawRows)) return [];

  return rawRows.map((entry, index) => {
    const qtyIn = toNumber(
      entry?.qtyIn ??
      entry?.in ??
      entry?.quantityIn ??
      entry?.stockIn ??
      entry?.debit,
    );
    const qtyOut = toNumber(
      entry?.qtyOut ??
      entry?.out ??
      entry?.quantityOut ??
      entry?.stockOut ??
      entry?.credit,
    );
    const fallbackQty = toNumber(entry?.quantity ?? entry?.qty ?? entry?.amount);
    const quantityChange = toNumber(entry?.quantityChange ?? entry?.change ?? entry?.delta);
    const typeValue = String(
      entry?.type ??
      entry?.referenceType ??
      entry?.transactionType ??
      entry?.movementType ??
      '',
    ).toLowerCase();

    const normalizedIn = (
      qtyIn ||
      (quantityChange > 0 ? quantityChange : 0) ||
      (!qtyOut && fallbackQty > 0 && /^(in|masuk|add|increase)$/i.test(typeValue) ? fallbackQty : 0)
    );
    const normalizedOut = (
      qtyOut ||
      (quantityChange < 0 ? Math.abs(quantityChange) : 0) ||
      (!qtyIn && fallbackQty > 0 && /^(out|keluar|remove|decrease)$/i.test(typeValue) ? fallbackQty : 0)
    );

    return {
      id: entry?._id || entry?.id || `${entry?.referenceNo || entry?.reference || 'row'}-${index}`,
      date: entry?.date || entry?.createdAt || entry?.transactionDate || entry?.updatedAt || null,
      refType: entry?.referenceType || entry?.transactionType || entry?.type || entry?.source || 'Mutasi',
      refNo: entry?.referenceNo || entry?.reference || entry?.orderNumber || entry?.invoiceNumber || entry?._id || '-',
      qtyIn: normalizedIn,
      qtyOut: normalizedOut,
      balance: toNumber(
        entry?.balance ??
        entry?.runningBalance ??
        entry?.balanceAfter ??
        entry?.stockAfter ??
        entry?.currentStock ??
        entry?.saldo,
      ),
      note: entry?.note || entry?.reason || entry?.description || '',
      warehouseName: entry?.warehouse?.name || entry?.warehouseName || '',
    };
  });
};
