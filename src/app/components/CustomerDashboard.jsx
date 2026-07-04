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
import AdminInboxPage from './customer-dashboard/inquiries/AdminInboxPage';
import InventoryAdjustmentPage from './customer-dashboard/inventory/InventoryAdjustmentPage';
import InventoryPage from './customer-dashboard/inventory/InventoryPage';
import ItemCategoriesPage from './customer-dashboard/inventory/ItemCategoriesPage';
import StockOpnamePage from './customer-dashboard/inventory/StockOpnamePage';
import WarehousePage from './customer-dashboard/inventory/WarehousePage';
import ProductModal from './customer-dashboard/modals/ProductModal';
import WarehouseModal from './customer-dashboard/modals/WarehouseModal';
import CreateOrderModal from './customer-dashboard/modals/CreateOrderModal';
import OrderDetailModal from './customer-dashboard/modals/OrderDetailModal';
import CustomersPage from './customer-dashboard/overview/CustomersPage';
import DashboardPage from './customer-dashboard/overview/DashboardPage';
import OrdersPage from './customer-dashboard/overview/OrdersPage';
import ReportsPage from './customer-dashboard/overview/ReportsPage';
import SettingsPage from './customer-dashboard/overview/SettingsPage';
import StockCardPage from './customer-dashboard/inventory/StockCardPage';
import {
  DashboardSkeleton,
  EmptyState,
  LoadingState,
  TableSkeleton,
} from './customer-dashboard/shared';
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
import { normalizeLandingContent } from '../utils/landingContent';
import useSocket from '../hooks/useSocket';

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
    setEditingProduct: _setEditingProduct,
    newProduct,
    setNewProduct,
    imageFiles,
    setImageFiles: _setImageFiles,
    deleteImageIds: _deleteImageIds,
    setDeleteImageIds: _setDeleteImageIds,
    existingImages,
    setExistingImages: _setExistingImages,
    closeProductModal,
    addImageFiles,
    handleEditProduct,
    handleAddProduct,
    handleDeleteProduct,
    handleRemoveExistingImage,
    handleRemoveNewImage,
    handleBulkImportProducts,
  } = useProducts(setData);

  const {
    selectedOrder,
    setSelectedOrder: _setSelectedOrder,
    isOrderDetailOpen,
    setIsOrderDetailOpen,
    updatingStatus,
    setUpdatingStatus: _setUpdatingStatus,
    isCreateOrderOpen,
    setIsCreateOrderOpen,
    products,
    setProducts: _setProducts,
    orderForm,
    setOrderForm,
    creatingOrder,
    setCreatingOrder: _setCreatingOrder,
    handleViewOrder,
    handleUpdateOrderStatus,
    handleTogglePaid,
    openCreateOrder,
    handleCreateOrder,
  } = useOrders();

  const {
    warehouses,
    setWarehouses,
    isWarehouseModalOpen,
    setIsWarehouseModalOpen: _setIsWarehouseModalOpen,
    editingWarehouse,
    setEditingWarehouse: _setEditingWarehouse,
    warehouseForm,
    setWarehouseForm,
    savingWarehouse,
    setSavingWarehouse: _setSavingWarehouse,
    deletingWarehouseId,
    setDeletingWarehouseId: _setDeletingWarehouseId,
    adjustmentForm,
    setAdjustmentForm,
    savingAdjustment,
    setSavingAdjustment: _setSavingAdjustment,
    inventoryProductOptions,
    setInventoryProductOptions,
    stockCardProductId,
    setStockCardProductId,
    stockCardRows,
    setStockCardRows,
    stockCardLoading,
    setStockCardLoading: _setStockCardLoading,
    stockOpnameForm,
    setStockOpnameForm,
    stockOpnameRows,
    savingStockOpname,
    prepareStockOpnameRows,
    updateStockOpnameActual,
    handleSaveStockOpname,
    fetchStockCardRows,
    handleSelectStockCardProduct,
    openCreateWarehouse,
    openEditWarehouse,
    handleSaveWarehouse,
    handleDeleteWarehouse,
    handleSaveAdjustment,
    closeWarehouseModal,
  } = useInventory();

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

  const [unreadCounts, setUnreadCounts] = useState({});
  const unreadHandler = useCallback((data) => {
    setUnreadCounts((prev) => ({ ...prev, [data.conversationId]: data.count }));
  }, []);
  useSocket({ onUnreadCount: unreadHandler });
  const inquiryBadge = Object.values(unreadCounts).reduce((sum, c) => sum + (c || 0), 0);

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
                api.get(ENDPOINTS.LOW_STOCK_PRODUCTS),
              ]);
               setAdminStats(statsResponse.data);
               setStats({
                 totalOrders: statsResponse.data.summary?.totalOrders || 0,
                 activeProduction: statsResponse.data.productionStatus?.find((status) => status._id === 'Production')?.count || 0,
                 totalRevenue: statsResponse.data.summary?.totalRevenue || 0,
                 totalCustomers: statsResponse.data.summary?.totalCustomers || 0,
               });
               setData(statsResponse.data.topProducts || []);
               setLowStockProducts(lowStockResponse.data || []);
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
        case 'stock-opname':
          response = await api.get(ENDPOINTS.INVENTORY_PRODUCTS);
          setInventoryProductOptions(response.data || []);
          setData(response.data || []);
          if (activeMenu === 'stock-opname') {
            prepareStockOpnameRows(response.data || []);
          }
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
              const [categoriesResponse, statsResponse, ordersResponse] = await Promise.all([
                api.get(ENDPOINTS.DASHBOARD_CATEGORIES),
                api.get(ENDPOINTS.DASHBOARD_STATS),
                api.get(ENDPOINTS.ALL_ORDERS),
              ]);
              setData({
                ...(statsResponse.data || {}),
                ...(categoriesResponse.data || {}),
                orders: ordersResponse.data || [],
              });
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
  }, [
    activeMenu,
    fetchStockCardRows,
    isAdmin,
    prepareStockOpnameRows,
    setInventoryProductOptions,
    setLandingContent,
    setProfile,
    setStockCardProductId,
    setStockCardRows,
    setWarehouses,
    stockCardProductId,
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setSearchTerm('');
    setStatusFilter('all');
    setOrderSort('newest');
    setInvPage(1);
    fetchData();
  }, [activeMenu, fetchData]);

  useEffect(() => {
    setInvPage(1);
  }, [searchTerm]);

  const renderLoading = () => {
    switch (activeMenu) {
      case 'dashboard':
        return <DashboardSkeleton isAdmin={isAdmin} />;
      case 'orders':
      case 'sales-orders':
      case 'customers':
      case 'inventory':
      case 'inventory-items':
        return <TableSkeleton />;
      default:
        return <LoadingState />;
    }
  };

  const renderPage = () => {
    if (loading) return renderLoading();

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
              onImportProducts={handleBulkImportProducts}
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

      case 'production-dashboard':
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
        return (
          <StockOpnamePage
            formatDateTime={formatDateTime}
            onSubmit={handleSaveStockOpname}
            savingStockOpname={savingStockOpname}
            setStockOpnameForm={setStockOpnameForm}
            stockOpnameForm={stockOpnameForm}
            stockOpnameRows={stockOpnameRows}
            updateStockOpnameActual={updateStockOpnameActual}
            warehouses={warehouses}
          />
        );

      case 'inquiries':
        return <AdminInboxPage />;

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
            setLandingContent={setLandingContent}
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
      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} inquiryBadge={inquiryBadge} />

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
              className="self-end rounded-2xl border border-slate-200 bg-white p-4 text-slate-600 shadow-sm transition-all duration-500 hover:rotate-180 hover:bg-slate-100 sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
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
        formatDateTime={formatDateTime}
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
