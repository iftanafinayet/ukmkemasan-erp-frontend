import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import api from '../../../utils/api';
import { ENDPOINTS } from '../../../config/environment';
import { normalizeStockCardRows } from '../utils';

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

export function useInventory(setData) {
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
    handleSelectStockCardProduct,
    openCreateWarehouse,
    openEditWarehouse,
    handleSaveWarehouse,
    handleDeleteWarehouse,
    handleSaveAdjustment,
    closeWarehouseModal,
  };
}
