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

const EMPTY_PRODUCT_FORM = {
  sku: '',
  name: '',
  category: 'Standing Pouch',
  material: '',
  priceBase: '',
  priceB2C: '',
  priceB2B: '',
  stockPolos: '',
  description: '',
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState(EMPTY_PRODUCT_FORM);
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
    quantity: 100,
    useValve: false,
  });
  const [creatingOrder, setCreatingOrder] = useState(false);

  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [passwords, setPasswords] = useState(EMPTY_PASSWORDS);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [warehouses, setWarehouses] = useState([]);
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [warehouseForm, setWarehouseForm] = useState(EMPTY_WAREHOUSE_FORM);
  const [savingWarehouse, setSavingWarehouse] = useState(false);
  const [deletingWarehouseId, setDeletingWarehouseId] = useState('');

  const [adjustmentForm, setAdjustmentForm] = useState(EMPTY_ADJUSTMENT_FORM);
  const [savingAdjustment, setSavingAdjustment] = useState(false);

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
  });

  const resetProductForm = () => {
    setNewProduct(EMPTY_PRODUCT_FORM);
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
          response = await api.get(ENDPOINTS.PRODUCTS);
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
            response = await api.get(ENDPOINTS.PROFILE);
            setProfile({
              name: response.data.name || '',
              email: response.data.email || '',
              phone: response.data.phone || '',
              address: response.data.address || '',
            });
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
    setInvPage(1);
    fetchData();
  }, [activeMenu, fetchData]);

  useEffect(() => {
    setInvPage(1);
  }, [searchTerm]);

  const handleAddProduct = async (event) => {
    event.preventDefault();

    try {
      const formData = new FormData();
      formData.append('sku', newProduct.sku || '');
      formData.append('name', newProduct.name);
      formData.append('category', newProduct.category);
      formData.append('material', newProduct.material);
      formData.append('priceBase', Number(newProduct.priceBase));
      formData.append('priceB2C', Number(newProduct.priceB2C));
      formData.append('priceB2B', Number(newProduct.priceB2B));
      formData.append('stockPolos', Number(newProduct.stockPolos));
      formData.append('description', newProduct.description);

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
      sku: product.sku || '',
      name: product.name,
      category: product.category,
      material: product.material,
      priceBase: product.priceBase,
      priceB2C: product.priceB2C,
      priceB2B: product.priceB2B,
      stockPolos: product.stockPolos,
      description: product.description || '',
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
        warehouseId: adjustmentForm.warehouseId,
        type: adjustmentForm.type,
        quantity: Number(adjustmentForm.quantity),
        reason: adjustmentForm.reason,
      });
      toast.success('Stok berhasil disesuaikan!');
      setAdjustmentForm((currentForm) => ({
        ...currentForm,
        quantity: '',
        reason: '',
      }));
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
            onStatusFilterChange={setStatusFilter}
            onViewOrder={handleViewOrder}
            orderStatuses={ORDER_STATUSES}
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
            onSubmit={handleSaveAdjustment}
            products={Array.isArray(data) ? data : []}
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
            onChangePassword={handleChangePassword}
            onSaveProfile={handleSaveProfile}
            passwords={passwords}
            profile={profile}
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
    <div className="flex h-screen bg-slate-50 font-sans selection:bg-primary/20">
      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          <header className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">{PAGE_TITLES[activeMenu] || activeMenu}</h1>
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
              className="p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-100 hover:rotate-180 transition-all duration-500 shadow-sm text-slate-600"
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
