import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AdminSalesWorkspace from './AdminSalesWorkspace';
import Sidebar from './Sidebar';
import { ENDPOINTS, storage } from '../config/environment';
import api from '../utils/api';
import {
  ORDER_STATUSES,
  PAGE_TITLES,
  PRODUCT_CATEGORIES,
} from './customer-dashboard/constants';
import {
  InventoryAdjustmentPage,
  InventoryPage,
  ItemCategoriesPage,
  WarehousePage,
} from './customer-dashboard/inventory-sections';
import {
  ProductModal,
  WarehouseModal,
} from './customer-dashboard/inventory-modals';
import {
  CreateOrderModal,
  OrderDetailModal,
} from './customer-dashboard/order-modals';
import {
  CustomersPage,
  DashboardPage,
  OrdersPage,
  ReportsPage,
  SettingsPage,
} from './customer-dashboard/overview-sections';
import {
  EmptyState,
  LoadingState,
} from './customer-dashboard/shared';
import { StockCardPage } from './customer-dashboard/stock-sections';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getFilteredData,
  normalizeStockCardRows,
} from './customer-dashboard/utils';
import {
  buildLandingContentPayload,
  createEmptyActivity,
  createEmptyArticle,
  createEmptyPortfolio,
  createEmptyLandingContent,
  normalizeLandingContent,
} from '../utils/landingContent';

const EMPTY_PRODUCT_FORM = {
  name: '',
  category: 'Standing Pouch',
  material: '',
  minOrder: 100,
  valvePrice: 600,
  description: '',
  variants: [],
};

const createEmptyVariant = () => ({
  _id: '',
  sku: '',
  size: '',
  color: '',
  priceB2C: '',
  priceB2B: '',
  stock: '',
});

const getEmptyProductForm = () => ({
  ...EMPTY_PRODUCT_FORM,
  variants: [createEmptyVariant()],
});

const normalizeProductVariants = (variants = []) => {
  if (!Array.isArray(variants) || variants.length === 0) {
    return [createEmptyVariant()];
  }

  return variants.map((variant) => ({
    _id: variant._id || '',
    sku: variant.sku || '',
    size: variant.size || '',
    color: variant.color || '',
    priceB2C: variant.priceB2C ?? '',
    priceB2B: variant.priceB2B ?? '',
    stock: variant.stock ?? '',
  }));
};

const EMPTY_PROFILE = {
  name: '',
  email: '',
  phone: '',
  address: '',
};

const EMPTY_PASSWORDS = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

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

export default function CustomerDashboard() {
  const user = storage.getUser();
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeProduction: 0,
    totalRevenue: 0,
    totalCustomers: 0,
  });
  const [adminStats, setAdminStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderSort, setOrderSort] = useState('newest');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState(getEmptyProductForm());
  const [imageFiles, setImageFiles] = useState([]);
  const [deleteImageIds, setDeleteImageIds] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [orderForm, setOrderForm] = useState({
    productId: '',
    variantId: '',
    quantity: 100,
    useValve: false,
  });
  const [creatingOrder, setCreatingOrder] = useState(false);

  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [passwords, setPasswords] = useState(EMPTY_PASSWORDS);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [landingContent, setLandingContent] = useState(createEmptyLandingContent());
  const [savingLandingContent, setSavingLandingContent] = useState(false);

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

  const [invPage, setInvPage] = useState(1);
  const [invPerPage, setInvPerPage] = useState(25);

  const currentWarehouseType = activeMenu === 'warehouse-retail' ? 'Retail' : 'Main';
  const filteredData = getFilteredData({
    activeMenu,
    data,
    searchTerm,
    statusFilter,
    orderSort,
  });

  const resetProductForm = () => {
    setNewProduct(getEmptyProductForm());
    setImageFiles([]);
    setDeleteImageIds([]);
    setExistingImages([]);
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    resetProductForm();
  };

  const resetWarehouseForm = (type = currentWarehouseType) => {
    setWarehouseForm({
      ...EMPTY_WAREHOUSE_FORM,
      type,
    });
    setEditingWarehouse(null);
  };

  const closeWarehouseModal = () => {
    setIsWarehouseModalOpen(false);
    resetWarehouseForm(currentWarehouseType);
  };

  const closeOrderDetailModal = () => {
    setIsOrderDetailOpen(false);
    setSelectedOrder(null);
  };

  const addImageFiles = (files) => {
    const remaining = 5 - existingImages.length - imageFiles.length;
    if (remaining <= 0) return;
    setImageFiles((currentFiles) => [...currentFiles, ...files.slice(0, remaining)]);
  };

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

  const handleSelectStockCardProduct = async (productId) => {
    setStockCardProductId(productId);
    await fetchStockCardRows(productId);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let response;

      switch (activeMenu) {
        case 'dashboard':
          if (isAdmin) {
            try {
              response = await api.get(ENDPOINTS.DASHBOARD_STATS);
              setAdminStats(response.data);
              setStats({
                totalOrders: response.data.summary?.totalOrders || 0,
                activeProduction: response.data.productionStatus?.find((status) => status._id === 'Production')?.count || 0,
                totalRevenue: response.data.summary?.totalRevenue || 0,
                totalCustomers: response.data.summary?.totalCustomers || 0,
              });
              setData(response.data.topProducts || []);
            } catch {
              response = await api.get(ENDPOINTS.MY_ORDERS);
              const allOrders = response.data || [];
              setStats({
                totalOrders: allOrders.length,
                activeProduction: allOrders.filter((order) => order.status === 'Production').length,
                totalRevenue: 0,
                totalCustomers: 0,
              });
              setData(allOrders.slice(0, 5));
            }
          } else {
            response = await api.get(ENDPOINTS.MY_ORDERS);
            const allOrders = response.data || [];
            setStats({
              totalOrders: allOrders.length,
              activeProduction: allOrders.filter((order) => order.status === 'Production').length,
              totalRevenue: 0,
              totalCustomers: 0,
            });
            setData(allOrders.slice(0, 5));
          }
          break;

        case 'orders':
          response = isAdmin
            ? await api.get(ENDPOINTS.ALL_ORDERS)
            : await api.get(ENDPOINTS.MY_ORDERS);
          setData(response.data || []);
          break;

        case 'inventory':
        case 'inventory-items':
        case 'item-categories':
          response = await api.get(ENDPOINTS.PRODUCTS);
          setData(response.data || []);
          break;

        case 'warehouse':
        case 'warehouse-retail':
          response = await api.get(ENDPOINTS.WAREHOUSES);
          setWarehouses(response.data || []);
          break;

        case 'inventory-adjustment':
          response = await api.get(ENDPOINTS.INVENTORY_PRODUCTS);
          setInventoryProductOptions(response.data || []);
          setData(response.data || []);
          response = await api.get(ENDPOINTS.WAREHOUSES);
          setWarehouses(response.data || []);
          break;

        case 'customers':
          response = await api.get(ENDPOINTS.CUSTOMERS);
          setData(response.data || []);
          break;

        case 'sales-processing':
        case 'invoice':
        case 'payment-received':
        case 'sales-return':
          response = await api.get(ENDPOINTS.SALES_OVERVIEW);
          setData(response.data || {});
          break;

        case 'reports':
          if (isAdmin) {
            try {
              response = await api.get(ENDPOINTS.DASHBOARD_CATEGORIES);
              setData(response.data || {});
            } catch {
              setData({});
            }
          }
          break;

        case 'stock-card':
        case 'stock-card-retail': {
          response = await api.get(ENDPOINTS.PRODUCTS);
          const stockProducts = response.data || [];
          const nextProductId = stockProducts.some((product) => product._id === stockCardProductId)
            ? stockCardProductId
            : stockProducts[0]?._id || '';

          setData(stockProducts);
          setStockCardProductId(nextProductId);

          if (nextProductId) {
            await fetchStockCardRows(nextProductId);
          } else {
            setStockCardRows([]);
          }
          break;
        }

        case 'settings':
          try {
            const [profileResponse, landingContentResponse] = await Promise.all([
              api.get(ENDPOINTS.PROFILE),
              isAdmin ? api.get(ENDPOINTS.LANDING_CONTENT) : Promise.resolve(null),
            ]);
            setProfile({
              name: profileResponse.data.name || '',
              email: profileResponse.data.email || '',
              phone: profileResponse.data.phone || '',
              address: profileResponse.data.address || '',
            });
            if (landingContentResponse?.data) {
              setLandingContent(normalizeLandingContent(landingContentResponse.data));
            }
          } catch {
            setProfile((currentProfile) => currentProfile);
          }
          break;

        default:
          setData([]);
      }
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        storage.clear();
        window.location.href = '/login';
        return;
      }
      toast.error(`Gagal sinkronisasi data ${activeMenu}`);
    } finally {
      setLoading(false);
    }
  }, [activeMenu, fetchStockCardRows, isAdmin, stockCardProductId]);

  useEffect(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setOrderSort('newest');
    setInvPage(1);
    fetchData();
  }, [activeMenu, fetchData]);

  useEffect(() => {
    setInvPage(1);
  }, [searchTerm]);

  const handleAddProduct = async (event) => {
    event.preventDefault();

    try {
      const normalizedVariants = (newProduct.variants || [])
        .map((variant) => ({
          ...(variant._id ? { _id: variant._id } : {}),
          sku: String(variant.sku || '').trim(),
          size: String(variant.size || '').trim(),
          color: String(variant.color || '').trim(),
          priceB2C: Number(variant.priceB2C),
          priceB2B: Number(variant.priceB2B),
          stock: Number(variant.stock),
        }))
        .filter((variant) => variant.sku || variant.size || variant.color || variant.priceB2C || variant.priceB2B || variant.stock);

      if (normalizedVariants.length === 0) {
        toast.error('Tambahkan minimal satu varian produk.');
        return;
      }

      const hasInvalidVariant = normalizedVariants.some((variant) => (
        !variant.sku
        || !variant.size
        || !variant.color
        || !Number.isFinite(variant.priceB2C)
        || !Number.isFinite(variant.priceB2B)
        || !Number.isFinite(variant.stock)
      ));

      if (hasInvalidVariant) {
        toast.error('Lengkapi SKU, ukuran, warna, harga, dan stok untuk setiap varian.');
        return;
      }

      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('category', newProduct.category);
      formData.append('material', newProduct.material);
      formData.append('minOrder', Number(newProduct.minOrder || 100));
      formData.append('description', newProduct.description || '');
      formData.append('addons', JSON.stringify({
        valvePrice: Number(newProduct.valvePrice || 0),
      }));
      formData.append('variants', JSON.stringify(normalizedVariants));

      imageFiles.forEach((file) => formData.append('images', file));

      if (deleteImageIds.length > 0) {
        formData.append('deleteImageIds', JSON.stringify(deleteImageIds));
      }

      if (editingProduct) {
        await api.put(ENDPOINTS.PRODUCT_BY_ID(editingProduct._id), formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Produk berhasil diupdate!');
      } else {
        await api.post(ENDPOINTS.PRODUCTS, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Produk baru berhasil ditambahkan!');
      }

      closeProductModal();
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan produk.');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      category: product.category,
      material: product.material,
      minOrder: product.minOrder || 100,
      valvePrice: product.addons?.valvePrice ?? 0,
      description: product.description || '',
      variants: normalizeProductVariants(product.variants),
    });
    setExistingImages(product.images || []);
    setImageFiles([]);
    setDeleteImageIds([]);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Yakin ingin menghapus produk ini?')) return;

    try {
      await api.delete(ENDPOINTS.PRODUCT_BY_ID(productId));
      toast.success('Produk berhasil dihapus!');
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menghapus produk.');
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
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan penyesuaian.');
    } finally {
      setSavingAdjustment(false);
    }
  };

  const openCreateWarehouse = () => {
    resetWarehouseForm(currentWarehouseType);
    setIsWarehouseModalOpen(true);
  };

  const openEditWarehouse = (warehouse) => {
    setEditingWarehouse(warehouse);
    setWarehouseForm({
      name: warehouse.name || '',
      location: warehouse.location || '',
      type: warehouse.type || currentWarehouseType,
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
      await fetchData();
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
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menghapus gudang.');
    } finally {
      setDeletingWarehouseId('');
    }
  };

  const handleRemoveExistingImage = (publicId) => {
    setDeleteImageIds((currentIds) => [...currentIds, publicId]);
    setExistingImages((currentImages) => currentImages.filter((image) => image.publicId !== publicId));
  };

  const handleRemoveNewImage = (indexToRemove) => {
    setImageFiles((currentFiles) => currentFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleViewOrder = async (orderId) => {
    try {
      const response = await api.get(ENDPOINTS.ORDER_BY_ID(orderId));
      setSelectedOrder(response.data);
      setIsOrderDetailOpen(true);
    } catch {
      toast.error('Gagal memuat detail order.');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await api.put(ENDPOINTS.UPDATE_ORDER_STATUS(orderId), { status: newStatus });
      toast.success(`Status diubah ke ${newStatus}`);
      const response = await api.get(ENDPOINTS.ORDER_BY_ID(orderId));
      setSelectedOrder(response.data);
      await fetchData();
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
      await fetchData();
    } catch {
      toast.error('Gagal mengubah status pembayaran.');
    }
  };

  const openCreateOrder = async () => {
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
  };

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
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal membuat pesanan.');
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);

    try {
      const response = await api.put(ENDPOINTS.PROFILE, profile);
      storage.setUser({
        _id: response.data._id,
        name: response.data.name,
        role: response.data.role,
      });
      toast.success('Profil berhasil diupdate!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan profil.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Password baru dan konfirmasi tidak cocok.');
      return;
    }

    setSavingPassword(true);
    try {
      await api.put(ENDPOINTS.CHANGE_PASSWORD, {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password berhasil diubah!');
      setPasswords(EMPTY_PASSWORDS);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengubah password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const updateArticleField = (clientId, field, value) => {
    setLandingContent((currentContent) => ({
      ...currentContent,
      articles: currentContent.articles.map((article) => (
        article.clientId === clientId ? { ...article, [field]: value } : article
      )),
    }));
  };

  const updateActivityField = (clientId, field, value) => {
    setLandingContent((currentContent) => ({
      ...currentContent,
      activities: currentContent.activities.map((activity) => (
        activity.clientId === clientId ? { ...activity, [field]: value } : activity
      )),
    }));
  };

  const updatePortfolioField = (clientId, field, value) => {
    setLandingContent((currentContent) => ({
      ...currentContent,
      portfolios: currentContent.portfolios.map((portfolio) => (
        portfolio.clientId === clientId ? { ...portfolio, [field]: value } : portfolio
      )),
    }));
  };

  const handleAddLandingArticle = () => {
    setLandingContent((currentContent) => ({
      ...currentContent,
      articles: [...currentContent.articles, createEmptyArticle()],
    }));
  };

  const handleRemoveLandingArticle = (clientId) => {
    setLandingContent((currentContent) => ({
      ...currentContent,
      articles: currentContent.articles.filter((article) => article.clientId !== clientId),
    }));
  };

  const handleAddLandingActivity = () => {
    setLandingContent((currentContent) => ({
      ...currentContent,
      activities: [...currentContent.activities, createEmptyActivity()],
    }));
  };

  const handleRemoveLandingActivity = (clientId) => {
    setLandingContent((currentContent) => ({
      ...currentContent,
      activities: currentContent.activities.filter((activity) => activity.clientId !== clientId),
    }));
  };

  const handleAddLandingPortfolio = () => {
    setLandingContent((currentContent) => ({
      ...currentContent,
      portfolios: [...currentContent.portfolios, createEmptyPortfolio()],
    }));
  };

  const handleRemoveLandingPortfolio = (clientId) => {
    setLandingContent((currentContent) => ({
      ...currentContent,
      portfolios: currentContent.portfolios.filter((portfolio) => portfolio.clientId !== clientId),
    }));
  };

  const handleLandingArticleImageChange = (clientId, file) => {
    setLandingContent((currentContent) => ({
      ...currentContent,
      articles: currentContent.articles.map((article) => (
        article.clientId === clientId
          ? {
              ...article,
              imageFile: file || null,
              imageRemoved: false,
            }
          : article
      )),
    }));
  };

  const handleLandingArticleRemoveImage = (clientId) => {
    setLandingContent((currentContent) => ({
      ...currentContent,
      articles: currentContent.articles.map((article) => (
        article.clientId === clientId
          ? {
              ...article,
              imageFile: null,
              imageUrl: '',
              imagePublicId: '',
              imageRemoved: true,
            }
          : article
      )),
    }));
  };

  const handleLandingActivityImageChange = (clientId, file) => {
    setLandingContent((currentContent) => ({
      ...currentContent,
      activities: currentContent.activities.map((activity) => (
        activity.clientId === clientId
          ? {
              ...activity,
              imageFile: file || null,
              imageRemoved: false,
            }
          : activity
      )),
    }));
  };

  const handleLandingActivityRemoveImage = (clientId) => {
    setLandingContent((currentContent) => ({
      ...currentContent,
      activities: currentContent.activities.map((activity) => (
        activity.clientId === clientId
          ? {
              ...activity,
              imageFile: null,
              imageUrl: '',
              imagePublicId: '',
              imageRemoved: true,
            }
          : activity
      )),
    }));
  };

  const handleLandingPortfolioImageChange = (clientId, file) => {
    setLandingContent((currentContent) => ({
      ...currentContent,
      portfolios: currentContent.portfolios.map((portfolio) => (
        portfolio.clientId === clientId
          ? {
              ...portfolio,
              imageFile: file || null,
              imageRemoved: false,
            }
          : portfolio
      )),
    }));
  };

  const handleLandingPortfolioRemoveImage = (clientId) => {
    setLandingContent((currentContent) => ({
      ...currentContent,
      portfolios: currentContent.portfolios.map((portfolio) => (
        portfolio.clientId === clientId
          ? {
              ...portfolio,
              imageFile: null,
              imageUrl: '',
              imagePublicId: '',
              imageRemoved: true,
            }
          : portfolio
      )),
    }));
  };

  const handleLandingSectionConfigChange = (sectionType, field, value) => {
    setLandingContent((currentContent) => ({
      ...currentContent,
      [sectionType]: {
        ...currentContent[sectionType],
        [field]: value,
      },
    }));
  };

  const handleSaveLandingContent = async () => {
    setSavingLandingContent(true);

    try {
      const formData = new FormData();
      formData.append('payload', JSON.stringify(buildLandingContentPayload(landingContent)));

      landingContent.articles.forEach((article) => {
        if (article.imageFile) {
          formData.append(`articleImage:${article.clientId}`, article.imageFile);
        }
      });

      (landingContent.activities || []).forEach((activity) => {
        if (activity.imageFile) {
          formData.append(`activityImage:${activity.clientId}`, activity.imageFile);
        }
      });

      (landingContent.portfolios || []).forEach((portfolio) => {
        if (portfolio.imageFile) {
          formData.append(`portfolioImage:${portfolio.clientId}`, portfolio.imageFile);
        }
      });

      const response = await api.put(ENDPOINTS.LANDING_CONTENT, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setLandingContent(normalizeLandingContent(response.data));
      toast.success('Konten landing page berhasil diperbarui.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan konten landing page.');
    } finally {
      setSavingLandingContent(false);
    }
  };

  const renderPage = () => {
    if (loading) {
      return <LoadingState />;
    }

    switch (activeMenu) {
      case 'dashboard':
        return (
          <DashboardPage
            adminStats={adminStats}
            data={Array.isArray(data) ? data : []}
            formatCurrency={formatCurrency}
            isAdmin={isAdmin}
            onViewOrder={handleViewOrder}
            stats={stats}
          />
        );

      case 'orders':
      case 'sales-orders':
        return (
          <OrdersPage
            filteredOrders={Array.isArray(filteredData) ? filteredData : []}
            isAdmin={isAdmin}
            onCreateOrder={openCreateOrder}
            onSearchChange={setSearchTerm}
            onSortChange={setOrderSort}
            onStatusFilterChange={setStatusFilter}
            onViewOrder={handleViewOrder}
            orderStatuses={ORDER_STATUSES}
            orderSort={orderSort}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
          />
        );

      case 'inventory':
      case 'inventory-items':
        return (
          <InventoryPage
            filteredProducts={Array.isArray(filteredData) ? filteredData : []}
            formatCurrency={formatCurrency}
            invPage={invPage}
            invPerPage={invPerPage}
            isAdmin={isAdmin}
            onDeleteProduct={handleDeleteProduct}
            onEditProduct={handleEditProduct}
            onOpenProductModal={() => {
              resetProductForm();
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            onSearchChange={setSearchTerm}
            onSetInvPage={setInvPage}
            onSetInvPerPage={setInvPerPage}
            onViewProduct={(productId) => navigate(`/admin/products/${productId}`)}
            searchTerm={searchTerm}
          />
        );

      case 'warehouse':
      case 'warehouse-retail':
        return (
          <WarehousePage
            currentWarehouseType={currentWarehouseType}
            deletingWarehouseId={deletingWarehouseId}
            onCreateWarehouse={openCreateWarehouse}
            onDeleteWarehouse={handleDeleteWarehouse}
            onEditWarehouse={openEditWarehouse}
            warehouses={warehouses}
          />
        );

      case 'inventory-adjustment':
        return (
          <InventoryAdjustmentPage
            adjustmentForm={adjustmentForm}
            inventoryProductOptions={inventoryProductOptions}
            onSubmit={handleSaveAdjustment}
            savingAdjustment={savingAdjustment}
            setAdjustmentForm={setAdjustmentForm}
            warehouses={warehouses}
          />
        );

      case 'item-categories':
        return (
          <ItemCategoriesPage
            formatCurrency={formatCurrency}
            products={Array.isArray(data) ? data : []}
          />
        );

      case 'sales-processing':
      case 'invoice':
      case 'payment-received':
      case 'sales-return':
        return (
          <AdminSalesWorkspace
            activeMenu={activeMenu}
            overview={data}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onRefresh={fetchData}
            onViewOrder={handleViewOrder}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            updatingStatus={updatingStatus}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            formatDateTime={formatDateTime}
          />
        );

      case 'stock-card':
      case 'stock-card-retail':
        return (
          <StockCardPage
            formatDate={formatDate}
            formatDateTime={formatDateTime}
            onRefresh={fetchStockCardRows}
            onSelectProduct={handleSelectStockCardProduct}
            products={Array.isArray(data) ? data : []}
            stockCardLoading={stockCardLoading}
            stockCardProductId={stockCardProductId}
            stockCardRows={stockCardRows}
          />
        );

      case 'stock-opname':
        return <EmptyState text="Stock Opname Page" />;

      case 'customers':
        return (
          <CustomersPage
            filteredCustomers={Array.isArray(filteredData) ? filteredData : []}
            onSearchChange={setSearchTerm}
            searchTerm={searchTerm}
          />
        );

      case 'reports':
        return (
          <ReportsPage
            data={data}
            formatCurrency={formatCurrency}
            isAdmin={isAdmin}
          />
        );

      case 'settings':
        return (
          <SettingsPage
            isAdmin={isAdmin}
            landingContent={landingContent}
            onActivityChange={updateActivityField}
            onActivityImageChange={handleLandingActivityImageChange}
            onActivityRemoveImage={handleLandingActivityRemoveImage}
            onAddActivity={handleAddLandingActivity}
            onAddArticle={handleAddLandingArticle}
            onChangePassword={handleChangePassword}
            onRemoveActivity={handleRemoveLandingActivity}
            onRemoveArticle={handleRemoveLandingArticle}
            onPortfolioChange={updatePortfolioField}
            onPortfolioImageChange={handleLandingPortfolioImageChange}
            onPortfolioRemoveImage={handleLandingPortfolioRemoveImage}
            onAddPortfolio={handleAddLandingPortfolio}
            onRemovePortfolio={handleRemoveLandingPortfolio}
            onSaveProfile={handleSaveProfile}
            onSaveLandingContent={handleSaveLandingContent}
            onArticleChange={updateArticleField}
            onArticleImageChange={handleLandingArticleImageChange}
            onArticleRemoveImage={handleLandingArticleRemoveImage}
            onSectionConfigChange={handleLandingSectionConfigChange}
            passwords={passwords}
            profile={profile}
            savingLandingContent={savingLandingContent}
            savingPassword={savingPassword}
            savingProfile={savingProfile}
            setPasswords={setPasswords}
            setProfile={setProfile}
            user={user}
          />
        );

      default:
        return <EmptyState text={`Halaman ${activeMenu} sedang dirancang.`} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-primary/20 lg:h-screen">
      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />

      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="mx-auto max-w-7xl px-4 pb-6 pt-20 sm:px-6 sm:pb-8 lg:p-8">
          <header className="mb-8 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-slate-900 sm:text-4xl">{PAGE_TITLES[activeMenu] || activeMenu}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-slate-500 text-sm font-medium italic">
                  {isAdmin ? 'Admin Panel' : 'Customer Portal'} · UKM Kemasan v1.0
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchData}
              className="self-end rounded-2xl border border-slate-200 bg-white p-4 text-slate-600 shadow-sm transition-all duration-500 hover:rotate-180 hover:bg-slate-100 sm:self-auto"
            >
              <RefreshCw size={24} className={loading ? 'animate-spin text-primary' : ''} />
            </button>
          </header>

          {renderPage()}
        </div>
      </main>

      <ProductModal
        editingProduct={editingProduct}
        existingImages={existingImages}
        imageFiles={imageFiles}
        isOpen={isModalOpen}
        newProduct={newProduct}
        onAddImages={addImageFiles}
        onClose={closeProductModal}
        onRemoveExistingImage={handleRemoveExistingImage}
        onRemoveNewImage={handleRemoveNewImage}
        onSubmit={handleAddProduct}
        productCategories={PRODUCT_CATEGORIES}
        setNewProduct={setNewProduct}
      />

      <WarehouseModal
        editingWarehouse={editingWarehouse}
        isOpen={isWarehouseModalOpen}
        onClose={closeWarehouseModal}
        onSubmit={handleSaveWarehouse}
        savingWarehouse={savingWarehouse}
        setWarehouseForm={setWarehouseForm}
        warehouseForm={warehouseForm}
      />

      <CreateOrderModal
        creatingOrder={creatingOrder}
        formatCurrency={formatCurrency}
        isOpen={isCreateOrderOpen}
        onClose={() => setIsCreateOrderOpen(false)}
        onSubmit={handleCreateOrder}
        orderForm={orderForm}
        products={products}
        setOrderForm={setOrderForm}
      />

      <OrderDetailModal
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        isAdmin={isAdmin}
        isOpen={isOrderDetailOpen}
        onClose={closeOrderDetailModal}
        onTogglePaid={handleTogglePaid}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        orderStatuses={ORDER_STATUSES}
        selectedOrder={selectedOrder}
        updatingStatus={updatingStatus}
      />
    </div>
  );
}
