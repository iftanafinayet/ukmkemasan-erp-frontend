import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import api from '../../../utils/api';
import { ENDPOINTS } from '../../../config/environment';

const EMPTY_ORDER_FORM = {
  productId: '',
  variantId: '',
  quantity: 100,
  useValve: false,
};

export function useOrders(setData) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [orderForm, setOrderForm] = useState(EMPTY_ORDER_FORM);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const handleViewOrder = useCallback(async (orderId) => {
    try {
      const response = await api.get(ENDPOINTS.ORDER_BY_ID(orderId));
      setSelectedOrder(response.data);
      setIsOrderDetailOpen(true);
    } catch {
      toast.error('Gagal memuat detail order.');
    }
  }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await api.put(ENDPOINTS.UPDATE_ORDER_STATUS(orderId), { status: newStatus });
      toast.success(`Status diubah ke ${newStatus}`);
      const response = await api.get(ENDPOINTS.ORDER_BY_ID(orderId));
      setSelectedOrder(response.data);
      
      // Refresh orders list
      const ordersResponse = api.get(ENDPOINTS.ALL_ORDERS); // Note: this might need admin check
      // Since we don't know the role here, we might need to handle it differently or just call setData
      // But for now, we let the main component handle the refresh via fetchData
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengubah status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleTogglePaid = async (orderId, isPaid) => {
    try {
      await api.put(ENDPOINTS.UPDATE_ORDER_STATUS(orderId), { isPaid });
      toast.success(isPaid ? 'Ditandai sudah bayar' : 'Status bayar dihapus');
      const response = await api.get(ENDPOINTS.ORDER_BY_ID(orderId));
      setSelectedOrder(response.data);
    } catch {
      toast.error('Gagal mengubah status pembayaran.');
    }
  };

  const openCreateOrder = useCallback(async () => {
    try {
      const response = await api.get(ENDPOINTS.PRODUCTS);
      setProducts(response.data || []);
      setOrderForm({
        productId: response.data[0]?._id || '',
        variantId: '',
        quantity: 100,
        useValve: false,
      });
      setIsCreateOrderOpen(true);
    } catch {
      toast.error('Gagal memuat produk.');
    }
  }, []);

  const handleCreateOrder = async (event) => {
    event.preventDefault();

    if (Number(orderForm.quantity) % 100 !== 0) {
      toast.error('Jumlah pesanan harus kelipatan 100 pcs.');
      return;
    }

    setCreatingOrder(true);

    try {
      await api.post(ENDPOINTS.ORDERS, orderForm);
      toast.success('Pesanan berhasil dibuat!');
      setIsCreateOrderOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal membuat pesanan.');
    } finally {
      setCreatingOrder(false);
    }
  };

  return {
    selectedOrder,
    setSelectedOrder,
    isOrderDetailOpen,
    setIsOrderDetailOpen,
    updatingStatus,
    setUpdatingStatus,
    isCreateOrderOpen,
    setIsCreateOrderOpen,
    products,
    setProducts,
    orderForm,
    setOrderForm,
    creatingOrder,
    setCreatingOrder,
    handleViewOrder,
    handleUpdateOrderStatus,
    handleTogglePaid,
    openCreateOrder,
    handleCreateOrder,
  };
}
