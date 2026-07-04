import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import api from '../../../utils/api';
import { ENDPOINTS } from '../../../config/environment';
import { normalizeStockCardRows } from '../utils';
import { getStockOpnameVariance } from '../../../utils/phase2';

const EMPTY_WAREHOUSE_FORM = {
  name: '',
  location: '',
  type: 'Main',
  isActive: true,
};

const EMPTY_ADJUSTMENT_FORM = {
  productId: '',
  variantId: '',
  warehouseId: '',
  type: 'In',
  quantity: '',
  reason: '',
};

const EMPTY_STOCK_OPNAME_FORM = {
  warehouseId: '',
  note: '',
};

export function useInventory() {
  const [warehouses, setWarehouses] = useState([]);
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [warehouseForm, setWarehouseForm] = useState(EMPTY_WAREHOUSE_FORM);
  const [savingWarehouse, setSavingWarehouse] = useState(false);
  const [deletingWarehouseId, setDeletingWarehouseId] = useState('');

  const [adjustmentForm, setAdjustmentForm] = useState(EMPTY_ADJUSTMENT_FORM);
  const [savingAdjustment, setSavingAdjustment] = useState(false);
  const [inventoryProductOptions, setInventoryProductOptions] = useState([]);

  const [stockCardProductId, setStockCardProductId] = useState('');
  const [stockCardRows, setStockCardRows] = useState([]);
  const [stockCardLoading, setStockCardLoading] = useState(false);
  const [stockOpnameForm, setStockOpnameForm] = useState(EMPTY_STOCK_OPNAME_FORM);
  const [stockOpnameRows, setStockOpnameRows] = useState([]);
  const [savingStockOpname, setSavingStockOpname] = useState(false);

  const fetchStockCardRows = useCallback(async (productId) => {
    if (!productId) {
      setStockCardRows([]);
      return;
    }

    setStockCardLoading(true);
    try {
      const response = await api.get(ENDPOINTS.STOCK_CARDS(productId));
      setStockCardRows(normalizeStockCardRows(response.data)); 
    } catch (error) {
      setStockCardRows([]);
      toast.error(error.response?.data?.message || 'Gagal memuat histori stock card.');
    } finally {
      setStockCardLoading(false);
    }
  }, []);

  const handleSelectStockCardProduct = useCallback(async (productId) => {
    setStockCardProductId(productId);
    await fetchStockCardRows(productId);
  }, [fetchStockCardRows]);

  const resetWarehouseForm = (type = 'Main') => {
    setWarehouseForm({
      ...EMPTY_WAREHOUSE_FORM,
      type,
    });
    setEditingWarehouse(null);
  };

  const closeWarehouseModal = useCallback(() => {
    setIsWarehouseModalOpen(false);
    resetWarehouseForm('Main');
  }, []);

  const openCreateWarehouse = (type = 'Main') => {
    resetWarehouseForm(type);
    setIsWarehouseModalOpen(true);
  };

  const openEditWarehouse = (warehouse) => {
    setEditingWarehouse(warehouse);
    setWarehouseForm({
      name: warehouse.name || '',
      location: warehouse.location || '',
      type: warehouse.type || 'Main',
      isActive: warehouse.isActive !== false,
    });
    setIsWarehouseModalOpen(true);
  };

  const handleSaveWarehouse = async (event) => {
    event.preventDefault();

    if (!warehouseForm.name.trim()) {
      toast.error('Nama gudang wajib diisi.');
      return;
    }

    setSavingWarehouse(true);
    try {
      const payload = {
        name: warehouseForm.name.trim(),
        location: warehouseForm.location.trim(),
        type: warehouseForm.type,
        isActive: warehouseForm.isActive,
      };

      if (editingWarehouse?._id) {
        await api.put(ENDPOINTS.WAREHOUSE_BY_ID(editingWarehouse._id), payload);
        toast.success('Gudang berhasil diperbarui.');
      } else {
        await api.post(ENDPOINTS.WAREHOUSES, payload);
        toast.success('Gudang berhasil ditambahkan.');
      }

      closeWarehouseModal();
      const response = await api.get(ENDPOINTS.WAREHOUSES);
      setWarehouses(response.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan gudang.');
    } finally {
      setSavingWarehouse(false);
    }
  };

  const handleDeleteWarehouse = async (warehouseId) => {
    if (!window.confirm('Yakin ingin menghapus gudang ini?')) return;

    setDeletingWarehouseId(warehouseId);
    try {
      await api.delete(ENDPOINTS.WAREHOUSE_BY_ID(warehouseId));
      toast.success('Gudang berhasil dihapus.');
      const response = await api.get(ENDPOINTS.WAREHOUSES);
      setWarehouses(response.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menghapus gudang.');
    } finally {
      setDeletingWarehouseId('');
    }
  };

  const handleSaveAdjustment = async (event) => {
    event.preventDefault();

    if (!adjustmentForm.productId || !adjustmentForm.warehouseId || !adjustmentForm.quantity) {
      toast.error('Mohon lengkapi semua field wajib.');
      return;
    }

    setSavingAdjustment(true);
    try {
      await api.post(ENDPOINTS.ADJUSTMENTS, {
        productId: adjustmentForm.productId,
        variantId: adjustmentForm.variantId || undefined,
        warehouseId: adjustmentForm.warehouseId,
        type: adjustmentForm.type,
        quantity: Number(adjustmentForm.quantity),
        reason: adjustmentForm.reason,
      });
      toast.success('Stok berhasil disesuaikan!');
      setAdjustmentForm(EMPTY_ADJUSTMENT_FORM);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan penyesuaian.');
    } finally {
      setSavingAdjustment(false);
    }
  };

  const prepareStockOpnameRows = useCallback((products = []) => {
    setStockOpnameRows((currentRows) => {
      const currentMap = currentRows.reduce((accumulator, row) => {
        accumulator[row.productId] = row;
        return accumulator;
      }, {});

      return (Array.isArray(products) ? products : []).map((product) => ({
        productId: product._id,
        productName: product.name,
        sku: product.sku || product.variants?.[0]?.sku || '-',
        category: product.category,
        systemStock: Number(product.stockPolos || 0),
        actualStock: currentMap[product._id]?.actualStock ?? Number(product.stockPolos || 0),
      }));
    });
  }, []);

  const updateStockOpnameActual = useCallback((productId, actualStock) => {
    setStockOpnameRows((currentRows) => currentRows.map((row) => (
      row.productId === productId
        ? { ...row, actualStock }
        : row
    )));
  }, []);

  const handleSaveStockOpname = useCallback(async (event) => {
    event.preventDefault();

    if (!stockOpnameForm.warehouseId) {
      toast.error('Pilih gudang untuk stock opname.');
      return;
    }

    const adjustments = stockOpnameRows
      .map((row) => ({
        row,
        variance: getStockOpnameVariance(row.systemStock, row.actualStock),
      }))
      .filter((entry) => !entry.variance.matches);

    if (adjustments.length === 0) {
      toast.info('Tidak ada selisih stok untuk disimpan.');
      return;
    }

    setSavingStockOpname(true);
    try {
      for (const { row, variance } of adjustments) {
        await api.post(ENDPOINTS.ADJUSTMENTS, {
          productId: row.productId,
          warehouseId: stockOpnameForm.warehouseId,
          type: variance.adjustmentType,
          quantity: variance.adjustmentQuantity,
          reason: stockOpnameForm.note?.trim()
            ? `Stock Opname: ${stockOpnameForm.note.trim()}`
            : 'Stock Opname',
        });
      }

      toast.success(`${adjustments.length} selisih stok berhasil dicatat.`);
      setStockOpnameForm(EMPTY_STOCK_OPNAME_FORM);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan stock opname.');
    } finally {
      setSavingStockOpname(false);
    }
  }, [stockOpnameForm, stockOpnameRows]);

  return {
    warehouses,
    setWarehouses,
    isWarehouseModalOpen,
    setIsWarehouseModalOpen,
    editingWarehouse,
    setEditingWarehouse,
    warehouseForm,
    setWarehouseForm,
    savingWarehouse,
    setSavingWarehouse,
    deletingWarehouseId,
    setDeletingWarehouseId,
    adjustmentForm,
    setAdjustmentForm,
    savingAdjustment,
    setSavingAdjustment,
    inventoryProductOptions,
    setInventoryProductOptions,
    stockCardProductId,
    setStockCardProductId,
    stockCardRows,
    setStockCardRows,
    stockCardLoading,
    setStockCardLoading,
    fetchStockCardRows,
    stockOpnameForm,
    setStockOpnameForm,
    stockOpnameRows,
    setStockOpnameRows,
    savingStockOpname,
    prepareStockOpnameRows,
    updateStockOpnameActual,
    handleSaveStockOpname,
    handleSelectStockCardProduct,
    openCreateWarehouse,
    openEditWarehouse,
    handleSaveWarehouse,
    handleDeleteWarehouse,
    handleSaveAdjustment,
    closeWarehouseModal,
  };
}
