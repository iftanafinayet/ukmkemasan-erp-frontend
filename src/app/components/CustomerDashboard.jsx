import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Sidebar from './Sidebar';
import { OrderCard } from './OrderCard';
import { ENDPOINTS, storage } from '../config/environment';
import {
  Search, RefreshCw, Loader2, Package, Users,
  BarChart3, Clock, AlertCircle, Plus, X,
  TrendingUp, DollarSign, ShoppingCart, Award,
  Edit3, Trash2, Save, User, Lock, Mail, Phone, MapPin,
  ChevronDown, ImagePlus, Eye, Layers, Ruler, Box,
  ArrowRightLeft, Warehouse, ClipboardList, CalendarDays
} from 'lucide-react';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext
} from './ui/carousel';

export default function CustomerDashboard() {
  const user = storage.getUser();
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();

  // === STATE ===
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalOrders: 0, activeProduction: 0, totalRevenue: 0, totalCustomers: 0 });
  const [adminStats, setAdminStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Product Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    sku: '', name: '', category: 'Standing Pouch', material: '', priceBase: '', priceB2C: '', priceB2B: '', stockPolos: '', description: ''
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [deleteImageIds, setDeleteImageIds] = useState([]);
  const [existingImages, setExistingImages] = useState([]);


  // Order Detail Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Order Creation Modal
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [orderForm, setOrderForm] = useState({ productId: '', quantity: 100, useValve: false });
  const [creatingOrder, setCreatingOrder] = useState(false);

  // Settings State
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [adjustmentForm, setAdjustmentForm] = useState({
    productId: '',
    warehouseId: '',
    type: 'In',
    quantity: '',
    reason: ''
  });
  const [savingAdjustment, setSavingAdjustment] = useState(false);
  const [stockCardProductId, setStockCardProductId] = useState('');
  const [stockCardRows, setStockCardRows] = useState([]);
  const [stockCardLoading, setStockCardLoading] = useState(false);

  // Inventory Pagination
  const [invPage, setInvPage] = useState(1);
  const [invPerPage, setInvPerPage] = useState(25);

  // Constants
  const productCategories = [
    'Standing Pouch', 'Gusset Side Seal', 'Gusset Quad Seal', 'Gusset',
    'Flat Bottom', 'Flatbottom Square', 'Flatbottom Rice Papper',
    'Flatbottom Rice Papper Square', 'Sachet', 'Dripbag', 'Vacuum Pack', 'Roll', 'Lain Lain'
  ];
  const orderStatuses = ['Quotation', 'Payment', 'Production', 'Quality Control', 'Shipping', 'Completed'];

  // === FETCH DATA ===
  const fetchData = async () => {
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
                activeProduction: 0,
                totalRevenue: response.data.summary?.totalRevenue || 0,
                totalCustomers: response.data.summary?.totalCustomers || 0
              });
              if (response.data.productionStatus) {
                const prodCount = response.data.productionStatus.find(s => s._id === 'Production');
                setStats(prev => ({ ...prev, activeProduction: prodCount?.count || 0 }));
              }
              setData(response.data.topProducts || []);
            } catch {
              response = await api.get(ENDPOINTS.MY_ORDERS);
              const allOrders = response.data || [];
              setStats({ totalOrders: allOrders.length, activeProduction: allOrders.filter(o => o.status === 'Production').length, totalRevenue: 0, totalCustomers: 0 });
              setData(allOrders.slice(0, 5));
            }
          } else {
            response = await api.get(ENDPOINTS.MY_ORDERS);
            const allOrders = response.data || [];
            setStats({ totalOrders: allOrders.length, activeProduction: allOrders.filter(o => o.status === 'Production').length, totalRevenue: 0, totalCustomers: 0 });
            setData(allOrders.slice(0, 5));
          }
          break;

        case 'orders':
          response = isAdmin ? await api.get(ENDPOINTS.ALL_ORDERS) : await api.get(ENDPOINTS.MY_ORDERS);
          setData(response.data || []);
          break;
        
        case 'inventory':
          response = await api.get(ENDPOINTS.PRODUCTS);
          setData(response.data || []);
          break;
        
        case 'warehouse':
        case 'warehouse-retail':
          response = await api.get(ENDPOINTS.WAREHOUSES);
          setWarehouses(response.data || []);
          break;

        case 'inventory-adjustment':
          // Fetch products for dropdown if not loaded
          if (data.length === 0) {
            response = await api.get(ENDPOINTS.PRODUCTS);
            setData(response.data || []);
          }
          // Fetch warehouses for dropdown
          response = await api.get(ENDPOINTS.WAREHOUSES);
          setWarehouses(response.data || []);
          break;

        case 'customers':
          response = await api.get(ENDPOINTS.CUSTOMERS);
          setData(response.data || []);
          break;

        case 'reports':
          if (isAdmin) {
            try {
              response = await api.get(ENDPOINTS.DASHBOARD_CATEGORIES);
              setData(response.data || {});
            } catch { setData({}); }
          }
          break;

        case 'stock-card':
        case 'stock-card-retail': {
          response = await api.get(ENDPOINTS.PRODUCTS);
          const products = response.data || [];
          const nextProductId = products.some(product => product._id === stockCardProductId)
            ? stockCardProductId
            : products[0]?._id || '';

          setData(products);
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
              address: response.data.address || ''
            });
          } catch { /* use existing profile state */ }
          break;

        default:
          setData([]);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        storage.clear();
        window.location.href = '/login';
        return;
      }
      toast.error(`Gagal sinkronisasi data ${activeMenu}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setInvPage(1);
    fetchData();
  }, [activeMenu]);

  useEffect(() => {
    setInvPage(1);
  }, [searchTerm]);

  // === FILTERED DATA ===
  const getFilteredData = () => {
    if (!Array.isArray(data)) return data;
    let filtered = [...data];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (activeMenu === 'orders') {
        filtered = filtered.filter(o =>
          o.orderNumber?.toLowerCase().includes(term) ||
          o.product?.name?.toLowerCase().includes(term) ||
          o.customer?.name?.toLowerCase().includes(term)
        );
      } else if (activeMenu === 'inventory') {
        filtered = filtered.filter(p =>
          p.name?.toLowerCase().includes(term) ||
          p.category?.toLowerCase().includes(term) ||
          p.material?.toLowerCase().includes(term)
        );
      } else if (activeMenu === 'customers') {
        filtered = filtered.filter(c =>
          c.name?.toLowerCase().includes(term) ||
          c.email?.toLowerCase().includes(term)
        );
      }
    }

    if (statusFilter !== 'all' && activeMenu === 'orders') {
      filtered = filtered.filter(o => o.status === statusFilter);
    }

    return filtered;
  };

  // === HANDLERS ===
  // Product
  const handleAddProduct = async (e) => {
    e.preventDefault();
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

      // Append new image files
      imageFiles.forEach(file => formData.append('images', file));

      // Append IDs of images to delete (for edit mode)
      if (deleteImageIds.length > 0) {
        formData.append('deleteImageIds', JSON.stringify(deleteImageIds));
      }

      if (editingProduct) {
        await api.put(ENDPOINTS.PRODUCT_BY_ID(editingProduct._id), formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Produk berhasil diupdate!');
      } else {
        await api.post(ENDPOINTS.PRODUCTS, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Produk baru berhasil ditambahkan!');
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      resetProductForm();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan produk.');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      sku: product.sku || '', name: product.name, category: product.category, material: product.material,
      priceBase: product.priceBase, priceB2C: product.priceB2C, priceB2B: product.priceB2B,
      stockPolos: product.stockPolos, description: product.description || ''
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
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus produk.');
    }
  };

  const resetProductForm = () => {
    setNewProduct({ sku: '', name: '', category: 'Standing Pouch', material: '', priceBase: '', priceB2C: '', priceB2B: '', stockPolos: '', description: '' });
    setImageFiles([]);
    setDeleteImageIds([]);
    setExistingImages([]);
  };

  const handleSaveAdjustment = async (e) => {
    e.preventDefault();
    if (!adjustmentForm.productId || !adjustmentForm.warehouseId || !adjustmentForm.quantity) {
      return toast.error('Mohon lengkapi semua field wajib.');
    }

    setSavingAdjustment(true);
    try {
      await api.post(ENDPOINTS.ADJUSTMENTS, {
        productId: adjustmentForm.productId,
        warehouseId: adjustmentForm.warehouseId,
        type: adjustmentForm.type,
        quantity: Number(adjustmentForm.quantity),
        reason: adjustmentForm.reason
      });
      toast.success('Stok berhasil disesuaikan!');
      setAdjustmentForm({ ...adjustmentForm, quantity: '', reason: '' });
      fetchData(); // Refresh data products
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan penyesuaian.');
    } finally {
      setSavingAdjustment(true); // Wait, should be false
      setSavingAdjustment(false);
    }
  };

  const handleRemoveExistingImage = (publicId) => {
    setDeleteImageIds(prev => [...prev, publicId]);
    setExistingImages(prev => prev.filter(img => img.publicId !== publicId));
  };

  const handleRemoveNewImage = (idx) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
  };

  // Order Detail
  const handleViewOrder = async (orderId) => {
    try {
      const response = await api.get(ENDPOINTS.ORDER_BY_ID(orderId));
      setSelectedOrder(response.data);
      setIsOrderDetailOpen(true);
    } catch { toast.error('Gagal memuat detail order.'); }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await api.put(ENDPOINTS.UPDATE_ORDER_STATUS(orderId), { status: newStatus });
      toast.success(`Status diubah ke ${newStatus}`);
      const response = await api.get(ENDPOINTS.ORDER_BY_ID(orderId));
      setSelectedOrder(response.data);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah status.');
    } finally { setUpdatingStatus(false); }
  };

  const handleTogglePaid = async (orderId, isPaid) => {
    try {
      await api.put(ENDPOINTS.UPDATE_ORDER_STATUS(orderId), { isPaid });
      toast.success(isPaid ? 'Ditandai sudah bayar' : 'Status bayar dihapus');
      const response = await api.get(ENDPOINTS.ORDER_BY_ID(orderId));
      setSelectedOrder(response.data);
      fetchData();
    } catch { toast.error('Gagal mengubah status pembayaran.'); }
  };

  // Order Creation
  const openCreateOrder = async () => {
    try {
      const res = await api.get(ENDPOINTS.PRODUCTS);
      setProducts(res.data || []);
      setOrderForm({ productId: res.data[0]?._id || '', quantity: 100, useValve: false });
      setIsCreateOrderOpen(true);
    } catch { toast.error('Gagal memuat produk.'); }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setCreatingOrder(true);
    try {
      const res = await api.post(ENDPOINTS.ORDERS, orderForm);
      toast.success('Pesanan berhasil dibuat!');
      setIsCreateOrderOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat pesanan.');
    } finally { setCreatingOrder(false); }
  };

  // Settings
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put(ENDPOINTS.PROFILE, profile);
      storage.setUser({ _id: res.data._id, name: res.data.name, role: res.data.role });
      toast.success('Profil berhasil diupdate!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan profil.');
    } finally { setSavingProfile(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('Password baru dan konfirmasi tidak cocok.');
    }
    setSavingPassword(true);
    try {
      await api.put(ENDPOINTS.CHANGE_PASSWORD, {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      toast.success('Password berhasil diubah!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah password.');
    } finally { setSavingPassword(false); }
  };

  // Formatting helpers
  const formatCurrency = (amount) => {
    if (!amount) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateString));
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const toNumber = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  };

  const normalizeStockCardRows = (payload) => {
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
        entry?.debit
      );
      const qtyOut = toNumber(
        entry?.qtyOut ??
        entry?.out ??
        entry?.quantityOut ??
        entry?.stockOut ??
        entry?.credit
      );
      const fallbackQty = toNumber(entry?.quantity ?? entry?.qty ?? entry?.amount);
      const typeValue = String(
        entry?.type ??
        entry?.referenceType ??
        entry?.transactionType ??
        entry?.movementType ??
        ''
      ).toLowerCase();

      const normalizedIn = qtyIn || ((!qtyOut && fallbackQty > 0 && /^(in|masuk|add|increase)$/i.test(typeValue)) ? fallbackQty : 0);
      const normalizedOut = qtyOut || ((!qtyIn && fallbackQty > 0 && /^(out|keluar|remove|decrease)$/i.test(typeValue)) ? fallbackQty : 0);

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
          entry?.stockAfter ??
          entry?.currentStock ??
          entry?.saldo
        ),
        note: entry?.note || entry?.reason || entry?.description || '',
        warehouseName: entry?.warehouse?.name || entry?.warehouseName || ''
      };
    });
  };

  const fetchStockCardRows = async (productId) => {
    if (!productId) {
      setStockCardRows([]);
      return;
    }

    setStockCardLoading(true);
    try {
      const response = await api.get(ENDPOINTS.STOCK_CARDS(productId));
      setStockCardRows(normalizeStockCardRows(response.data));
    } catch (err) {
      setStockCardRows([]);
      toast.error(err.response?.data?.message || 'Gagal memuat histori stock card.');
    } finally {
      setStockCardLoading(false);
    }
  };

  // === RENDER ===
  const renderPage = () => {
    if (loading) return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Menghubungkan ke Server...</p>
      </div>
    );

    switch (activeMenu) {
      case 'dashboard': return renderDashboard();
      case 'orders': return renderOrders();
      case 'inventory': 
      case 'inventory-items': return renderInventory();
      case 'warehouse':
      case 'warehouse-retail': return renderWarehouse();
      case 'inventory-adjustment': return renderInventoryAdjustment();
      case 'item-categories': return <EmptyState text="Item Categories Page" />;
      case 'sales-orders': return renderOrders();
      case 'sales-processing': return <EmptyState text="Sales Processing Page" />;
      case 'invoice': return renderInvoice();
      case 'payment-received': return <EmptyState text="Payment Received Page" />;
      case 'sales-return': return <EmptyState text="Sales Return Page" />;
      case 'stock-card':
      case 'stock-card-retail': return renderStockCard();
      case 'stock-opname': return <EmptyState text="Stock Opname Page" />;
      case 'customers': return renderCustomers();
      case 'reports': return renderReports();
      case 'settings': return renderSettings();
      default: return <EmptyState text={`Halaman ${activeMenu} sedang dirancang.`} />;
    }
  };

  // === SEARCH BAR COMPONENT ===
  const SearchBar = ({ placeholder, showStatusFilter }) => (
    <div className="flex gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder={placeholder || 'Cari...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 text-sm"
        />
      </div>
      {showStatusFilter && (
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none px-5 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
          >
            <option value="all">Semua Status</option>
            {orderStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      )}
    </div>
  );

  // === DASHBOARD ===
  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={ShoppingCart} color="blue" label="Total Pesanan" value={stats.totalOrders} />
        <StatCard icon={Clock} color="amber" label="Sedang Diproduksi" value={stats.activeProduction} border />
        {isAdmin ? (
          <>
            <StatCard icon={DollarSign} color="green" label="Total Omzet" value={formatCurrency(stats.totalRevenue)} border />
            <StatCard icon={Users} color="primary" label="Total Pelanggan" value={stats.totalCustomers} border />
          </>
        ) : (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm border-l-4 border-l-primary">
            <p className="text-primary text-[10px] font-black uppercase mb-1">Sistem Aktif</p>
            <h3 className="text-xl font-black text-slate-800">Operational</h3>
          </div>
        )}
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100">
        <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
          {isAdmin ? <><Award className="w-5 h-5 text-primary" /> Produk Terlaris</> : <><Clock className="w-5 h-5 text-primary" /> Pesanan Terbaru</>}
        </h3>
        <div className="space-y-3">
          {isAdmin ? (
            data.length > 0 ? data.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-sm">#{idx + 1}</span>
                  <span className="font-bold text-slate-800">{item.name}</span>
                </div>
                <span className="px-3 py-1 bg-primary/10 rounded-full text-xs font-black text-primary">{item.totalSold} terjual</span>
              </div>
            )) : <EmptyState text="Belum ada data penjualan." />
          ) : (
            data.length > 0 ? data.map(order => (
              <div key={order._id} onClick={() => handleViewOrder(order._id)}
                className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/30 transition-all cursor-pointer">
                <div>
                  <span className="text-sm font-black text-slate-800">#{order.orderNumber || order._id.slice(-6)}</span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{order.product?.name || 'Custom Order'}</p>
                </div>
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-primary uppercase">{order.status}</span>
              </div>
            )) : <EmptyState text="Belum ada aktivitas pesanan." />
          )}
        </div>
      </div>

      {isAdmin && adminStats?.productionStatus && (
        <div className="bg-white p-8 rounded-3xl border border-slate-100">
          <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> Status Produksi
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {adminStats.productionStatus.map((s, idx) => (
              <div key={idx} className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-2xl font-black text-slate-800">{s.count}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{s._id}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // === ORDERS ===
  const renderOrders = () => {
    const filtered = getFilteredData();
    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center">
          <div className="flex-1"><SearchBar placeholder="Cari order, produk, customer..." showStatusFilter={true} /></div>
          {!isAdmin && (
            <button onClick={openCreateOrder}
              className="ml-4 bg-primary text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap">
              <Plus size={16} /> Buat Pesanan
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(filtered) && filtered.map(order => (
            <div key={order._id} onClick={() => handleViewOrder(order._id)} className="cursor-pointer">
              <OrderCard order={order} />
            </div>
          ))}
        </div>
        {(!Array.isArray(filtered) || filtered.length === 0) && <EmptyState text="Tidak ada pesanan ditemukan." />}
      </div>
    );
  };

  // === INVENTORY ===
  const renderInventory = () => {
    const filtered = getFilteredData();
    const total = Array.isArray(filtered) ? filtered.length : 0;
    const totalPages = Math.max(1, Math.ceil(total / invPerPage));
    const safePage = Math.min(invPage, totalPages);
    const startIdx = (safePage - 1) * invPerPage;
    const endIdx = Math.min(startIdx + invPerPage, total);
    const paginated = Array.isArray(filtered) ? filtered.slice(startIdx, endIdx) : [];

    // Generate page numbers to display (always show first, last, and up to 3 around current)
    const getPageNumbers = () => {
      const pages = [];
      if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        if (safePage > 3) pages.push('...');
        for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i);
        if (safePage < totalPages - 2) pages.push('...');
        pages.push(totalPages);
      }
      return pages;
    };

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1"><SearchBar placeholder="Cari produk, kategori, material..." /></div>
          {isAdmin && (
            <button onClick={() => { resetProductForm(); setEditingProduct(null); setIsModalOpen(true); }}
              className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap">
              <Plus size={16} /> Tambah Produk
            </button>
          )}
        </div>
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gambar</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Produk</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Material</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Stok</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">B2C</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">B2B</th>
                {isAdmin && <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginated.map(product => (
                <tr key={product._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-5">
                    {product.images?.length > 0 ? (
                      <img src={product.images[0].url} alt={product.images[0].alt || product.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                        <ImagePlus className="w-5 h-5 text-slate-300" />
                      </div>
                    )}
                  </td>
                  <td className="p-5 text-sm text-slate-500 font-bold">{product.sku || '-'}</td>
                  <td className="p-5 font-bold text-slate-800">
                    <button onClick={() => navigate('/admin/products/' + product._id)}
                      className="hover:text-primary transition-colors text-left">
                      {product.name}
                    </button>
                  </td>
                  <td className="p-5 text-xs text-slate-500 font-medium">{product.category}</td>
                  <td className="p-5 text-xs text-slate-500 font-medium">{product.material || '-'}</td>
                  <td className="p-5 text-center">
                    <span className={`inline-block px-3 py-1 rounded-lg font-black text-xs ${product.stockPolos < 500 ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-600'}`}>
                      {product.stockPolos?.toLocaleString()} pcs
                    </span>
                  </td>
                  <td className="p-5 font-bold text-primary text-right">{formatCurrency(product.priceB2C)}</td>
                  <td className="p-5 font-bold text-slate-600 text-right">{formatCurrency(product.priceB2B)}</td>
                  {isAdmin && (
                    <td className="p-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => navigate('/admin/products/' + product._id)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors" title="Detail">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => handleEditProduct(product)} className="p-2 hover:bg-blue-50 rounded-xl text-blue-500 transition-colors" title="Edit">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDeleteProduct(product._id)} className="p-2 hover:bg-red-50 rounded-xl text-red-500 transition-colors" title="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Bar */}
          {total > 0 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
              {/* Info */}
              <span className="text-sm text-slate-500 font-medium">
                Showing <span className="font-black text-slate-700">{startIdx + 1}</span> –{' '}
                <span className="font-black text-slate-700">{endIdx}</span> of{' '}
                <span className="font-black text-slate-700">{total}</span> entries
              </span>

              <div className="flex items-center gap-3">
                {/* Per-page selector */}
                <select
                  value={invPerPage}
                  onChange={(e) => { setInvPerPage(Number(e.target.value)); setInvPage(1); }}
                  className="appearance-none border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                >
                  {[25, 50, 100, 200].map(n => <option key={n} value={n}>{n}</option>)}
                </select>

                {/* Prev */}
                <button
                  onClick={() => setInvPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-all text-sm font-bold"
                >
                  ‹
                </button>

                {/* Page numbers */}
                {getPageNumbers().map((pg, idx) =>
                  pg === '...' ? (
                    <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm">…</span>
                  ) : (
                    <button
                      key={pg}
                      onClick={() => setInvPage(pg)}
                      className={`w-8 h-8 flex items-center justify-center rounded-xl text-sm font-black transition-all ${
                        pg === safePage
                          ? 'bg-primary text-white shadow-md shadow-primary/30'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {pg}
                    </button>
                  )
                )}

                {/* Next */}
                <button
                  onClick={() => setInvPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-all text-sm font-bold"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // === WAREHOUSE ===
  const renderWarehouse = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-slate-100">
        <div>
          <h3 className="text-xl font-black text-slate-800">Manajemen Gudang</h3>
          <p className="text-slate-500 text-sm">Kelola lokasi penyimpanan barang {activeMenu === 'warehouse-retail' ? 'Retail' : 'Pusat'}.</p>
        </div>
        <button className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/30 flex items-center gap-2">
          <Plus size={16} /> Tambah Gudang
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 rounded-2xl"><Warehouse className="text-blue-500" /></div>
          <div>
            <p className="font-black text-slate-800">{activeMenu === 'warehouse-retail' ? 'Gudang Retail' : 'Gudang Utama'}</p>
            <p className="text-xs text-slate-400">Jl. Industri No. 12, Bekasi</p>
          </div>
        </div>
      </div>
    </div>
  );

  // === INVENTORY ADJUSTMENT ===
  const renderInventoryAdjustment = () => (
    <div className="space-y-6 animate-in fade-in duration-500 overflow-hidden">
      <div className="bg-white p-8 rounded-3xl border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <ArrowRightLeft className="text-primary w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Penyesuaian Stok</h3>
            <p className="text-slate-400 text-xs font-medium">Tambah atau kurangi stok secara manual.</p>
          </div>
        </div>
        <form onSubmit={handleSaveAdjustment} className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Plus size={12} /> Input Transaksi
            </h4>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Produk</label>
                <select 
                  required
                  value={adjustmentForm.productId}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, productId: e.target.value })}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800"
                >
                  <option value="">-- Cari Produk --</option>
                  {(activeMenu === 'inventory-adjustment' ? (Array.isArray(data) ? data : []) : []).map(p => (
                    <option key={p._id} value={p._id}>{p.name} (Stok: {p.stockPolos})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gudang Tujuan</label>
                <select 
                  required
                  value={adjustmentForm.warehouseId}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, warehouseId: e.target.value })}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800"
                >
                  <option value="">-- Pilih Gudang --</option>
                  {warehouses.map(w => (
                    <option key={w._id} value={w._id}>{w.name}</option>
                  ))}
                </select>
                {warehouses.length === 0 && (
                  <p className="text-[10px] text-amber-500 font-bold mt-1">⚠️ Belum ada gudang terdaftar. Tambah di menu Warehouse.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipe Mutasi</label>
                  <div className="flex bg-slate-100 p-1 rounded-2xl">
                    <button 
                      type="button"
                      onClick={() => setAdjustmentForm({ ...adjustmentForm, type: 'In' })}
                      className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${adjustmentForm.type === 'In' ? 'bg-white text-emerald-500 shadow-sm' : 'text-slate-400'}`}
                    >
                      MASUK (+)
                    </button>
                    <button 
                      type="button"
                      onClick={() => setAdjustmentForm({ ...adjustmentForm, type: 'Out' })}
                      className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${adjustmentForm.type === 'Out' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-400'}`}
                    >
                      KELUAR (-)
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jumlah (Pcs)</label>
                  <input 
                    type="number" 
                    required
                    value={adjustmentForm.quantity}
                    onChange={(e) => setAdjustmentForm({ ...adjustmentForm, quantity: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800" 
                    placeholder="0" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alasan Penyesuaian</label>
                <input 
                  type="text" 
                  required
                  value={adjustmentForm.reason}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800" 
                  placeholder="Misal: Barang Rusak, Hasil Opname..." 
                />
              </div>

              <button 
                type="submit"
                disabled={savingAdjustment || warehouses.length === 0}
                className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 hover:-translate-y-1 active:scale-95 transition-all mt-4 disabled:opacity-50 disabled:translate-y-0"
              >
                {savingAdjustment ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Proses Penyesuaian Stok'}
              </button>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Informasi Penting</h4>
            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 border-dashed">
              <p className="text-xs text-amber-700 leading-relaxed font-medium">
                Setiap transaksi penyesuaian stok akan tercatat secara permanen di <strong>Stock Card</strong>. 
                Pastikan data yang diinput sudah sesuai dengan fisik barang di gudang untuk menghindari selisih laporan.
              </p>
            </div>
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 flex flex-col items-center justify-center text-center py-20">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-4 shadow-sm">
                <ClipboardList className="text-slate-200 w-10 h-10" />
              </div>
              <p className="font-bold text-slate-400 text-xs uppercase tracking-widest">Histori Real-time</p>
              <p className="text-slate-300 text-[10px] mt-2">Pilih produk untuk melihat mutasi terakhir.</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  // === INVOICE ===
  const renderInvoice = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black text-slate-800">Daftar Invoice</h3>
        <button className="bg-primary text-white p-3 rounded-2xl shadow-lg shadow-primary/30"><Plus size={20}/></button>
      </div>
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left border-b border-slate-100">
            <tr>
              <th className="p-5">No. Invoice</th>
              <th className="p-5">Customer</th>
              <th className="p-5">Jatuh Tempo</th>
              <th className="p-5 text-right">Total Tagihan</th>
              <th className="p-5 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 uppercase text-[10px] font-bold text-slate-500">
            <tr><td className="p-10 text-center col-span-5 opacity-30 italic" colSpan="5">Belum ada invoice yang diterbitkan.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  // === STOCK CARD ===
  const renderStockCard = () => {
    const stockProducts = Array.isArray(data) ? data : [];
    const selectedProduct = stockProducts.find(product => product._id === stockCardProductId);
    const totalIn = stockCardRows.reduce((sum, row) => sum + toNumber(row.qtyIn), 0);
    const totalOut = stockCardRows.reduce((sum, row) => sum + toNumber(row.qtyOut), 0);
    const latestMutation = stockCardRows[0]?.date || stockCardRows[stockCardRows.length - 1]?.date;

    const handleSelectProduct = async (productId) => {
      setStockCardProductId(productId);
      await fetchStockCardRows(productId);
    };

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-8 py-7 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-cyan-50">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-slate-200 text-[10px] font-black uppercase tracking-[0.24em] text-slate-500 mb-4">
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  Stock Card
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Histori mutasi stok yang lebih rapi dan terbaca.</h3>
                <p className="text-sm text-slate-500 font-medium mt-2">
                  Pilih produk untuk melihat pergerakan stok masuk, keluar, dan saldo akhirnya secara kronologis.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 lg:min-w-[380px]">
                <div className="relative flex-1">
                  <select
                    value={stockCardProductId}
                    onChange={(e) => handleSelectProduct(e.target.value)}
                    className="appearance-none w-full px-5 pr-11 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm text-slate-800 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                  >
                    <option value="">Pilih produk...</option>
                    {stockProducts.map(product => (
                      <option key={product._id} value={product._id}>
                        {product.name} {product.sku ? `(${product.sku})` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <button
                  type="button"
                  onClick={() => fetchStockCardRows(stockCardProductId)}
                  disabled={!stockCardProductId || stockCardLoading}
                  className="px-5 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.22em] shadow-lg shadow-slate-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {stockCardLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Muat Ulang
                </button>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Produk</p>
                  <Package className="w-4 h-4 text-slate-300" />
                </div>
                <p className="text-lg font-black text-slate-900 leading-tight">{selectedProduct?.name || 'Belum dipilih'}</p>
                <p className="text-xs text-slate-500 font-medium mt-1">{selectedProduct?.sku || selectedProduct?.category || 'Pilih produk dari dropdown di atas.'}</p>
              </div>

              <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-600">Stok Saat Ini</p>
                  <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-3xl font-black text-emerald-700">{toNumber(selectedProduct?.stockPolos).toLocaleString()}</p>
                <p className="text-xs text-emerald-700/80 font-bold mt-1">pcs tersedia di master produk</p>
              </div>

              <div className="rounded-3xl border border-sky-100 bg-sky-50 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-sky-600">Mutasi Tercatat</p>
                  <CalendarDays className="w-4 h-4 text-sky-400" />
                </div>
                <p className="text-3xl font-black text-sky-700">{stockCardRows.length}</p>
                <p className="text-xs text-sky-700/80 font-bold mt-1">
                  {latestMutation ? `Update terakhir ${formatDateTime(latestMutation)}` : 'Belum ada histori mutasi'}
                </p>
              </div>
            </div>

            {selectedProduct && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-slate-100 bg-white p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Total Masuk</p>
                  <p className="text-2xl font-black text-emerald-600 mt-2">{totalIn.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">pcs dari seluruh histori</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Total Keluar</p>
                  <p className="text-2xl font-black text-rose-600 mt-2">{totalOut.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">pcs dari seluruh histori</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Saldo Akhir Histori</p>
                  <p className="text-2xl font-black text-slate-800 mt-2">{toNumber(stockCardRows[stockCardRows.length - 1]?.balance || stockCardRows[0]?.balance).toLocaleString()}</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">pcs berdasarkan baris terakhir yang tersedia</p>
                </div>
              </div>
            )}

            <div className="rounded-[1.75rem] border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.22em] border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-4">Tanggal</th>
                      <th className="px-5 py-4">Ref Tipe</th>
                      <th className="px-5 py-4">Ref No</th>
                      <th className="px-5 py-4">Catatan</th>
                      <th className="px-5 py-4 text-center">Masuk</th>
                      <th className="px-5 py-4 text-center">Keluar</th>
                      <th className="px-5 py-4 text-right">Saldo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {!stockCardProductId && (
                      <tr>
                        <td className="px-6 py-20 text-center italic uppercase text-[10px] font-black tracking-[0.22em] text-slate-300" colSpan={7}>
                          Silakan pilih produk untuk melihat histori mutasi stok.
                        </td>
                      </tr>
                    )}

                    {stockCardProductId && stockCardLoading && (
                      <tr>
                        <td className="px-6 py-16" colSpan={7}>
                          <div className="flex items-center justify-center gap-3 text-slate-400 font-bold text-sm">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Memuat histori stock card...
                          </div>
                        </td>
                      </tr>
                    )}

                    {stockCardProductId && !stockCardLoading && stockCardRows.length === 0 && (
                      <tr>
                        <td className="px-6 py-20 text-center" colSpan={7}>
                          <div className="flex flex-col items-center gap-3 text-slate-400">
                            <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                              <ClipboardList className="w-7 h-7 text-slate-300" />
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Belum ada histori</p>
                              <p className="text-sm font-medium text-slate-400 mt-1">Produk ini belum memiliki mutasi stok yang tercatat.</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {stockCardProductId && !stockCardLoading && stockCardRows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-800 text-sm">{formatDate(row.date)}</p>
                          <p className="text-[11px] text-slate-400 font-medium mt-1">{formatDateTime(row.date)}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-[0.18em]">
                            {row.refType}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-700 text-sm">{row.refNo}</td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-slate-600">{row.note || '-'}</p>
                          {row.warehouseName && <p className="text-[11px] text-slate-400 font-medium mt-1">{row.warehouseName}</p>}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex min-w-[86px] justify-center px-3 py-1.5 rounded-xl text-xs font-black ${row.qtyIn > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            {row.qtyIn > 0 ? `+${row.qtyIn.toLocaleString()}` : '-'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex min-w-[86px] justify-center px-3 py-1.5 rounded-xl text-xs font-black ${row.qtyOut > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
                            {row.qtyOut > 0 ? `-${row.qtyOut.toLocaleString()}` : '-'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right font-black text-slate-800 text-sm">{row.balance.toLocaleString()} pcs</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // === CUSTOMERS ===
  const renderCustomers = () => {
    const filtered = getFilteredData();
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <SearchBar placeholder="Cari pelanggan..." />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.isArray(filtered) && filtered.map(customer => (
            <div key={customer._id} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-primary/20">
                {customer.name?.charAt(0)}
              </div>
              <div>
                <h4 className="font-black text-slate-800 leading-tight">{customer.name}</h4>
                <p className="text-xs text-slate-400 font-medium">{customer.email}</p>
                {customer.phone && <p className="text-[10px] text-slate-400 mt-0.5">{customer.phone}</p>}
                <p className="text-[10px] text-primary font-bold mt-1 uppercase tracking-tighter">Verified Client</p>
              </div>
            </div>
          ))}
        </div>
        {(!Array.isArray(filtered) || filtered.length === 0) && <EmptyState text="Tidak ada pelanggan ditemukan." />}
      </div>
    );
  };

  // === REPORTS ===
  const CHART_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#6d28d9', '#4f46e5', '#7c3aed', '#5b21b6'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100">
          <p className="font-black text-slate-800 text-sm mb-1">{label}</p>
          {payload.map((entry, idx) => (
            <p key={idx} className="text-xs font-bold" style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'Revenue' ? formatCurrency(entry.value) : entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderReports = () => {
    if (!isAdmin) return <EmptyState text="Halaman ini khusus admin." />;
    const categoryStats = data?.categoryStats || [];
    const valveUsage = data?.valveUsage || {};

    const chartData = categoryStats.map(cat => ({
      name: cat._id?.length > 12 ? cat._id.slice(0, 12) + '...' : cat._id,
      fullName: cat._id,
      Revenue: cat.revenue,
      Pesanan: cat.totalOrders,
      Terjual: cat.totalQtySold,
      avgOrderValue: cat.avgOrderValue
    }));

    const valveData = [
      { name: 'Dengan Valve', value: valveUsage.withValve || 0 },
      { name: 'Tanpa Valve', value: valveUsage.withoutValve || 0 }
    ];
    const valveColors = ['#22c55e', '#94a3b8'];

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Revenue Bar Chart */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100">
          <h3 className="font-black text-slate-800 mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Revenue per Kategori
          </h3>
          <p className="text-xs text-slate-400 mb-6">Pendapatan dari setiap kategori produk kemasan</p>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Revenue" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState text="Belum ada data revenue." />}
        </div>

        {/* Quantity Sold Chart */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100">
          <h3 className="font-black text-slate-800 mb-2 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> Volume Penjualan
          </h3>
          <p className="text-xs text-slate-400 mb-6">Jumlah unit terjual per kategori</p>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Terjual" fill="#8b5cf6" radius={[0, 8, 8, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState text="Belum ada data penjualan." />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Valve Usage Pie Chart */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100">
            <h3 className="font-black text-slate-800 mb-6">Penggunaan Valve</h3>
            {(valveUsage.withValve || valveUsage.withoutValve) ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={valveData}
                    cx="50%" cy="50%"
                    innerRadius={70} outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {valveData.map((entry, idx) => (
                      <Cell key={idx} fill={valveColors[idx]} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 700 }} />
                  <Tooltip formatter={(value) => [`${value} pesanan`, '']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-green-50 rounded-2xl border border-green-100">
                  <p className="text-3xl font-black text-green-600">0</p>
                  <p className="text-xs font-bold text-green-500 uppercase mt-2">Dengan Valve</p>
                </div>
                <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-3xl font-black text-slate-600">0</p>
                  <p className="text-xs font-bold text-slate-400 uppercase mt-2">Tanpa Valve</p>
                </div>
              </div>
            )}
          </div>

          {/* Summary Table */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100">
            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" /> Ringkasan Kategori
            </h3>
            <div className="space-y-3">
              {categoryStats.map((cat, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{cat._id}</p>
                    <p className="text-[10px] text-slate-400">{cat.totalOrders} pesanan</p>
                  </div>
                  <p className="font-black text-primary text-sm whitespace-nowrap">{formatCurrency(cat.revenue)}</p>
                </div>
              ))}
              {categoryStats.length === 0 && <EmptyState text="Belum ada data." />}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // === SETTINGS ===
  const renderSettings = () => (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl">
      {/* Profile */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100">
        <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Profil Saya</h3>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField icon={User} label="Nama" value={profile.name} onChange={(v) => setProfile({ ...profile, name: v })} required />
            <InputField icon={Mail} label="Email" type="email" value={profile.email} onChange={(v) => setProfile({ ...profile, email: v })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField icon={Phone} label="No. Telepon" value={profile.phone} onChange={(v) => setProfile({ ...profile, phone: v })} />
            <InputField icon={MapPin} label="Alamat" value={profile.address} onChange={(v) => setProfile({ ...profile, address: v })} />
          </div>
          <button type="submit" disabled={savingProfile}
            className="bg-primary text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50">
            {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Profil
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white p-8 rounded-3xl border border-slate-100">
        <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2"><Lock className="w-5 h-5 text-primary" /> Ganti Password</h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <InputField icon={Lock} label="Password Lama" type="password" value={passwords.currentPassword}
            onChange={(v) => setPasswords({ ...passwords, currentPassword: v })} required />
          <div className="grid grid-cols-2 gap-4">
            <InputField icon={Lock} label="Password Baru" type="password" value={passwords.newPassword}
              onChange={(v) => setPasswords({ ...passwords, newPassword: v })} required placeholder="Min. 6 karakter" />
            <InputField icon={Lock} label="Konfirmasi" type="password" value={passwords.confirmPassword}
              onChange={(v) => setPasswords({ ...passwords, confirmPassword: v })} required />
          </div>
          <button type="submit" disabled={savingPassword}
            className="bg-slate-800 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-lg hover:bg-slate-700 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50">
            {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Ubah Password
          </button>
        </form>
      </div>

      {/* Account Info */}
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Info Akun</p>
        <p className="text-sm text-slate-600">Role: <span className="font-bold text-primary uppercase">{user?.role}</span></p>
      </div>
    </div>
  );

  // === MAIN RETURN ===
  return (
    <div className="flex h-screen bg-slate-50 font-sans selection:bg-primary/20">
      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          <header className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter capitalize">{activeMenu}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-slate-500 text-sm font-medium italic">{isAdmin ? 'Admin Panel' : 'Customer Portal'} · UKM Kemasan v1.0</p>
              </div>
            </div>
            <button onClick={fetchData} className="p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-100 hover:rotate-180 transition-all duration-500 shadow-sm text-slate-600">
              <RefreshCw size={24} className={loading ? 'animate-spin text-primary' : ''} />
            </button>
          </header>
          {renderPage()}
        </div>
      </main>

      {/* ====== MODALS ====== */}

      {/* Product Modal (Add/Edit) */}
      {isModalOpen && (
        <ModalWrapper onClose={() => { setIsModalOpen(false); setEditingProduct(null); }}>
          <div className="mb-8">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{editingProduct ? 'Edit Produk' : 'Tambah Katalog'}</h3>
            <p className="text-slate-500 text-sm font-medium">{editingProduct ? 'Perbarui data produk.' : 'Input stok kemasan polos baru ke gudang.'}</p>
          </div>
          <form onSubmit={handleAddProduct} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormInput label="SKU" value={newProduct.sku} onChange={(v) => setNewProduct({ ...newProduct, sku: v })} placeholder="SPR-001..." />
              <FormInput label="Nama Produk" value={newProduct.name} onChange={(v) => setNewProduct({ ...newProduct, name: v })} required placeholder="Standing Pouch 500g..." />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
                <select required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 font-bold"
                  value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}>
                  {productCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <FormInput label="Material" value={newProduct.material} onChange={(v) => setNewProduct({ ...newProduct, material: v })} required placeholder="MET/PE" />
            </div>
            <div className="grid grid-cols-3 gap-5">
              <FormInput label="Harga Base (Rp)" type="number" value={newProduct.priceBase} onChange={(v) => setNewProduct({ ...newProduct, priceBase: v })} required placeholder="2000" />
              <FormInput label="Harga B2C (Rp)" type="number" value={newProduct.priceB2C} onChange={(v) => setNewProduct({ ...newProduct, priceB2C: v })} required placeholder="2500" />
              <FormInput label="Harga B2B (Rp)" type="number" value={newProduct.priceB2B} onChange={(v) => setNewProduct({ ...newProduct, priceB2B: v })} required placeholder="2000" />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <FormInput label="Stok Polos" type="number" value={newProduct.stockPolos} onChange={(v) => setNewProduct({ ...newProduct, stockPolos: v })} required placeholder="1000" />
              <FormInput label="Deskripsi" value={newProduct.description} onChange={(v) => setNewProduct({ ...newProduct, description: v })} placeholder="Opsional..." />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gambar Produk (Maks. 5)</label>

              {/* Existing images (edit mode) */}
              {existingImages.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {existingImages.map((img) => (
                    <div key={img.publicId} className="relative group">
                      <img src={img.url} alt={img.alt} className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200" />
                      <button type="button" onClick={() => handleRemoveExistingImage(img.publicId)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* New image previews */}
              {imageFiles.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {imageFiles.map((file, idx) => (
                    <div key={idx} className="relative group">
                      <img src={URL.createObjectURL(file)} alt={`preview-${idx}`} className="w-20 h-20 rounded-2xl object-cover border-2 border-primary/30" />
                      <button type="button" onClick={() => handleRemoveNewImage(idx)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
              {(existingImages.length + imageFiles.length) < 5 && (
                <label className="flex items-center justify-center gap-3 px-6 py-5 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-slate-100 hover:border-primary/40 transition-all group">
                  <ImagePlus className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                  <span className="text-sm font-bold text-slate-500 group-hover:text-primary transition-colors">
                    {imageFiles.length > 0 || existingImages.length > 0 ? 'Tambah Gambar' : 'Pilih Gambar'}
                  </span>
                  <input type="file" accept="image/*" multiple className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      const remaining = 5 - existingImages.length - imageFiles.length;
                      setImageFiles(prev => [...prev, ...files.slice(0, remaining)]);
                      e.target.value = '';
                    }} />
                </label>
              )}
              <p className="text-[10px] text-slate-400 ml-1">Format: JPEG, PNG, WebP. Otomatis dikonversi ke AVIF.</p>
            </div>
            <button type="submit" className="w-full py-5 bg-primary text-white font-black rounded-3xl shadow-xl shadow-primary/30 hover:bg-primary/90 hover:-translate-y-1 active:scale-95 transition-all mt-4">
              {editingProduct ? 'Update Produk' : 'Simpan ke Sistem'}
            </button>
          </form>
        </ModalWrapper>
      )}

      {/* Order Creation Modal */}
      {isCreateOrderOpen && (
        <ModalWrapper onClose={() => setIsCreateOrderOpen(false)}>
          <div className="mb-8">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Buat Pesanan Baru</h3>
            <p className="text-slate-500 text-sm font-medium">Pilih produk kemasan dan jumlah pesanan.</p>
          </div>
          <form onSubmit={handleCreateOrder} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Produk</label>
              <select required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 font-bold"
                value={orderForm.productId} onChange={(e) => setOrderForm({ ...orderForm, productId: e.target.value })}>
                {products.map(p => (
                  <option key={p._id} value={p._id}>{p.name} — {formatCurrency(p.priceB2C)}/pcs (Stok: {p.stockPolos})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <FormInput label="Jumlah (kelipatan 100)" type="number" value={orderForm.quantity}
                onChange={(v) => setOrderForm({ ...orderForm, quantity: Number(v) })} required placeholder="100" />
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pakai Valve?</label>
                <div className="flex gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="valve" checked={orderForm.useValve}
                      onChange={() => setOrderForm({ ...orderForm, useValve: true })} className="accent-primary w-4 h-4" />
                    <span className="font-bold text-slate-700">Ya</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="valve" checked={!orderForm.useValve}
                      onChange={() => setOrderForm({ ...orderForm, useValve: false })} className="accent-primary w-4 h-4" />
                    <span className="font-bold text-slate-700">Tidak</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Preview harga */}
            {orderForm.productId && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Estimasi Harga</p>
                {(() => {
                  const p = products.find(pr => pr._id === orderForm.productId);
                  if (!p) return null;
                  const qty = orderForm.quantity;
                  const base = qty >= 1000 ? p.priceB2B : p.priceB2C;
                  const valve = orderForm.useValve ? (p.addons?.valvePrice || 600) : 0;
                  const unit = base + valve;
                  const total = unit * qty;
                  return (
                    <div className="space-y-1 text-sm">
                      <p className="text-slate-600">Tipe: <span className="font-bold">{qty >= 1000 ? 'B2B (Wholesale)' : 'B2C (Retail)'}</span></p>
                      <p className="text-slate-600">Harga satuan: <span className="font-bold">{formatCurrency(base)}</span>{valve > 0 && ` + valve ${formatCurrency(valve)}`}</p>
                      <p className="text-lg font-black text-primary mt-2">Total: {formatCurrency(total)}</p>
                    </div>
                  );
                })()}
              </div>
            )}

            <button type="submit" disabled={creatingOrder}
              className="w-full py-5 bg-primary text-white font-black rounded-3xl shadow-xl shadow-primary/30 hover:bg-primary/90 hover:-translate-y-1 active:scale-95 transition-all mt-4 flex items-center justify-center gap-3 disabled:opacity-50">
              {creatingOrder ? <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</> : 'Pesan Sekarang'}
            </button>
          </form>
        </ModalWrapper>
      )}

      {/* Order Detail Modal */}
      {isOrderDetailOpen && selectedOrder && (
        <ModalWrapper onClose={() => setIsOrderDetailOpen(false)} wide>
          <div className="mb-8">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Detail Order #{selectedOrder.orderNumber}</h3>
            <p className="text-slate-500 text-sm font-medium">{formatDate(selectedOrder.createdAt)}</p>
          </div>
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <InfoBlock label="Pelanggan" value={selectedOrder.customer?.name} sub={selectedOrder.customer?.email} />
              <InfoBlock label="Produk" value={selectedOrder.product?.name} sub={selectedOrder.product?.category} />
            </div>
            <div className="space-y-4">
              <InfoBlock label="Kuantitas" value={`${selectedOrder.details?.quantity?.toLocaleString()} pcs`} />
              <InfoBlock label="Total Harga" value={formatCurrency(selectedOrder.totalPrice)} highlight />
              <InfoBlock label="Valve" value={selectedOrder.details?.useValve ? 'Ya' : 'Tidak'} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status Produksi</p>
              <span className="px-4 py-2 bg-primary/10 rounded-full text-sm font-black text-primary">{selectedOrder.status}</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pembayaran</p>
              <span className={`px-4 py-2 rounded-full text-sm font-black ${selectedOrder.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {selectedOrder.isPaid ? '✓ Lunas' : '✗ Belum Bayar'}
              </span>
            </div>
          </div>
          {isAdmin && (
            <div className="space-y-4 border-t border-slate-100 pt-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aksi Admin</p>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-2 block">Ubah Status Produksi</label>
                <div className="flex flex-wrap gap-2">
                  {orderStatuses.map(status => (
                    <button key={status} onClick={() => handleUpdateOrderStatus(selectedOrder._id, status)}
                      disabled={updatingStatus || selectedOrder.status === status}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedOrder.status === status ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} disabled:opacity-50`}>
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => handleTogglePaid(selectedOrder._id, !selectedOrder.isPaid)}
                className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all ${selectedOrder.isPaid ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-500 text-white hover:bg-green-600 shadow-lg'}`}>
                {selectedOrder.isPaid ? 'Tandai Belum Bayar' : 'Tandai Sudah Bayar'}
              </button>
            </div>
          )}
        </ModalWrapper>
      )}
    </div>
  );
}

// === SUB-COMPONENTS ===
const EmptyState = ({ text }) => (
  <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-30 text-slate-900">
    <AlertCircle size={60} strokeWidth={1} className="mb-4" />
    <p className="font-black uppercase tracking-[0.3em] text-[10px]">{text}</p>
  </div>
);

const StatCard = ({ icon: Icon, color, label, value, border }) => (
  <div className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm ${border ? `border-l-4 border-l-${color}-400` : ''}`}>
    <div className="flex items-center gap-3 mb-3">
      <div className={`p-2 bg-${color}-50 rounded-xl`}><Icon className={`w-5 h-5 text-${color}-500`} /></div>
      <p className={`text-${color}-500 text-[10px] font-black uppercase`}>{label}</p>
    </div>
    <h3 className="text-2xl font-black text-slate-800">{value}</h3>
  </div>
);

const ModalWrapper = ({ children, onClose, wide }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
    <div className={`bg-white rounded-[40px] p-10 w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} shadow-2xl relative border border-white/20 max-h-[90vh] overflow-y-auto`}>
      <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
        <X size={20} />
      </button>
      {children}
    </div>
  </div>
);

const FormInput = ({ label, value, onChange, type = 'text', required, placeholder }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input type={type} required={required} placeholder={placeholder}
      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 font-bold"
      value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const InputField = ({ icon: Icon, label, value, onChange, type = 'text', required, placeholder }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input type={type} required={required} placeholder={placeholder || ''}
        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 font-bold"
        value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  </div>
);

const InfoBlock = ({ label, value, sub, highlight }) => (
  <div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className={`font-bold ${highlight ? 'text-primary text-xl' : 'text-slate-800'}`}>{value || '-'}</p>
    {sub && <p className="text-xs text-slate-400">{sub}</p>}
  </div>
);
