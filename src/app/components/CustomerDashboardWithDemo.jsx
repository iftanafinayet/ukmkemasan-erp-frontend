import React, { useState, useEffect } from 'react';
import api from '../api/axios'; // <--- Gunakan instance axios kita
import { Sidebar } from './Sidebar';
import { OrderCard } from './OrderCard';
import { DemoToggle } from './DemoToggle';
import { mockApi } from '../utils/mockData';
import { ENDPOINTS, storage } from '../config/environment'; // <--- Gunakan helper config
import { 
  Search, 
  Filter, 
  RefreshCw, 
  AlertCircle,
  Loader2,
  Package
} from 'lucide-react';
import { toast } from 'sonner';

export function CustomerDashboardWithDemo() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeMenu, setActiveMenu] = useState('orders');
  const [useMockData, setUseMockData] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      let data;
      if (useMockData) {
        const response = await mockApi.getMyOrders();
        data = response.data.orders || response.data;
        toast.success(`${data.length} pesanan dimuat (Mode Demo)`);
      } else {
        // Simple call, interceptor handle token otomatis
        const response = await api.get(ENDPOINTS.MY_ORDERS);
        data = response.data.orders || response.data;
        toast.success(`${data.length} pesanan berhasil dimuat`);
      }

      const ordersArray = Array.isArray(data) ? data : [];
      setOrders(ordersArray);
      setFilteredOrders(ordersArray);
    } catch (err) {
      console.error('Error fetching orders:', err);
      let errorMessage = 'Gagal memuat data pesanan';
      
      if (!useMockData) {
        errorMessage = err.response?.data?.message || err.message;
        if (err.response?.status === 401) {
          storage.clear();
          setTimeout(() => window.location.href = '/login', 2000);
        }
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...orders];
    if (searchTerm) {
      filtered = filtered.filter(order => {
        const searchLower = searchTerm.toLowerCase();
        return (
          order.orderNumber?.toLowerCase().includes(searchLower) || // Sesuaikan field DB
          order.product?.name?.toLowerCase().includes(searchLower)  // Sesuaikan field DB
        );
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => 
        order.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, orders]);

  useEffect(() => {
    fetchOrders();
  }, [useMockData]);

  const handleLogout = () => {
    storage.clear();
    toast.success('Berhasil logout');
    setTimeout(() => window.location.href = '/login', 1000);
  };

  const handleRefresh = () => fetchOrders();

  const handleToggleDataSource = () => {
    setUseMockData(!useMockData);
    toast.info(`Beralih ke ${!useMockData ? 'Mode Demo' : 'Real API'}`);
  };

  // --- UI TETAP SAMA SEPERTI MILIKMU ---
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto">
        {/* ... Konten UI kamu tetap sama ... */}
        {/* Gunakan variabel filteredOrders untuk di-map ke OrderCard */}
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
           {/* Header, Search, Filter, Loading, Error, Empty, dan Grid UI kamu di sini */}
           {!loading && !error && filteredOrders.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredOrders.map((order) => (
                <OrderCard key={order._id || order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </main>
      <DemoToggle useMockData={useMockData} onToggle={handleToggleDataSource} />
    </div>
  );
}