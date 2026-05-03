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
} from './customer-dashboard/utils';
import { useProducts } from './customer-dashboard/hooks/useProducts';
import { useOrders } from './customer-dashboard/hooks/useOrders';
import { useInventory } from './customer-dashboard/hooks/useInventory';
import { useUserSettings } from './customer-dashboard/hooks/useUserSettings';

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
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderSort, setOrderSort] = useState('newest');

  const [invPage, setInvPage] = useState(1);
  const [invPerPage, setInvPerPage] = useState(25);

  const {
    isModalOpen,
    setIsModalOpen,
    editingProduct,
    setEditingProduct,
    newProduct,
    setNewProduct,
    imageFiles,
    setImageFiles,
    deleteImageIds,
    setDeleteImageIds,
    existingImages,
    setExistingImages,
    closeProductModal,
    addImageFiles,
    handleEditProduct,
    handleAddProduct,
    handleDeleteProduct,
    handleRemoveExistingImage,
    handleRemoveNewImage,
  } = useProducts(setData);

  const {
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
  } = useOrders(setData);

  const {
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
  } = useInventory(setData);

  const {
    profile,
    setProfile,
    passwords,
    setPasswords,
    savingProfile,
    savingPassword,
    landingContent,
    setLandingContent,
    savingLandingContent,
    handleSaveProfile,
    handleChangePassword,
    updateArticleField,
    updateActivityField,
    updatePortfolioField,
    handleAddLandingArticle,
    handleRemoveLandingArticle,
    handleAddLandingActivity,
    handleRemoveLandingActivity,
    handleAddLandingPortfolio,
    handleRemoveLandingPortfolio,
    handleLandingArticleImageChange,
    handleLandingArticleRemoveImage,
    handleLandingActivityImageChange,
    handleLandingActivityRemoveImage,
    handleLandingPortfolioImageChange,
    handleLandingPortfolioRemoveImage,
    handleLandingSectionConfigChange,
    handleSaveLandingContent,
  } = useUserSettings();

  const currentWarehouseType = activeMenu === 'warehouse-retail' ? 'Retail' : 'Main';
  const filteredData = getFilteredData({
    activeMenu,
    data,
    searchTerm,
    statusFilter,
    orderSort,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let response;

      switch (activeMenu) {
        case 'dashboard':
          if (isAdmin) {
            try {
              const [statsResponse, lowStockResponse] = await Promise.all([
                api.get(ENDPOINTS.DASHBOARD_STATS),
                api.get('/api/products/low-stock'),
              ]);
              setAdminStats(statsResponse.data);
              setStats({
                totalOrders: statsResponse.data.summary?.totalOrders || 0,
                activeProduction: statsResponse.data.productionStatus?.find((status) => status._id === 'Production')?.count || 0,
                totalRevenue: statsResponse.data.summary?.totalRevenue || 0,
                totalCustomers: statsResponse.data.summary?.totalCustomers || 0,
              });
              setData(statsResponse.data.topProducts || []);
              // We can't set lowStockProducts state here because it's not defined in the main component yet.
              // I should add it to the state of CustomerDashboard.
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
        case 'sales-orders':
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
            // Profile already initialized in hook or will stay default
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
            lowStockProducts={lowStockProducts}
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
                closeProductModal();
                setIsModalOpen(true);
              }}
              onSearchChange={setSearchTerm}
              onSetInvPage={setInvPage}
              onSetInvPerPage={setInvPerPage}
              onViewProduct={(productId) => navigate(`/admin/products/${productId}`)}
              searchTerm={searchTerm}
              loading={loading}
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
        onClose={() => setIsOrderDetailOpen(false)}
        onTogglePaid={handleTogglePaid}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        orderStatuses={ORDER_STATUSES}
        selectedOrder={selectedOrder}
        updatingStatus={updatingStatus}
      />
    </div>
  );
}
