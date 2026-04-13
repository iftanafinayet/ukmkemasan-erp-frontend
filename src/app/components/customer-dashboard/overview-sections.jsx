import {
  Award,
  BarChart3,
  Clock,
  DollarSign,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Plus,
  ShoppingCart,
  TrendingUp,
  User,
  Users,
  Save,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { OrderCard } from '../OrderCard';
import { REPORT_CHART_COLORS } from './constants';
import { EmptyState, InputField, SearchBar, StatCard } from './shared';
import LandingContentSettingsSection from './LandingContentSettingsSection';

function ReportTooltip({ active, payload, label, formatCurrency }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100">
      <p className="font-black text-slate-800 text-sm mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={`${entry.name}-${index}`} className="text-xs font-bold" style={{ color: entry.color }}>
          {entry.name}: {entry.name === 'Revenue' ? formatCurrency(entry.value) : entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export function DashboardPage({
  adminStats,
  data,
  formatCurrency,
  isAdmin,
  onViewOrder,
  stats,
}) {
  const chartData = isAdmin && Array.isArray(data) ? data.slice(0, 5).map((item) => ({
    name: item.name?.length > 15 ? `${item.name.slice(0, 15)}...` : (item.name || 'Produk'),
    fullName: item.name || 'Produk',
    Terjual: item.totalSold || 0,
  })) : [];

  return (
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h3 className="font-black text-slate-800 flex items-center gap-2">
            {isAdmin ? (
              <>
                <Award className="w-5 h-5 text-primary" />
                Produk Terlaris
              </>
            ) : (
              <>
                <Clock className="w-5 h-5 text-primary" />
                Pesanan Terbaru
              </>
            )}
          </h3>
          {isAdmin && data.length > 0 && (
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
              Top 5 Performers
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {isAdmin ? (
            data.length > 0 ? (
              <>
                {/* Chart Section */}
                <div className="lg:col-span-7 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                      />
                      <Tooltip
                        content={<ReportTooltip formatCurrency={formatCurrency} />}
                        cursor={{ fill: '#f8fafc' }}
                      />
                      <Bar
                        dataKey="Terjual"
                        fill="#4dbace"
                        radius={[6, 6, 0, 0]}
                        barSize={40}
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index === 0 ? '#4dbace' : '#94a3b8'}
                            fillOpacity={1 - index * 0.15}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* List Section */}
                <div className="lg:col-span-5 space-y-3">
                  {data.slice(0, 5).map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/30 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${
                          index === 0 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-slate-400 border border-slate-100 group-hover:bg-primary/5 group-hover:text-primary'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                      </div>
                      <span className="px-3 py-1 bg-white border border-slate-100 rounded-full text-[10px] font-black text-primary">
                        {item.totalSold.toLocaleString()} terjual
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="lg:col-span-12">
                <EmptyState text="Belum ada data penjualan." />
              </div>
            )
          ) : (
            <div className="lg:col-span-12 space-y-3">
              {data.length > 0 ? data.map((order) => (
                <div
                  key={order._id}
                  onClick={() => onViewOrder(order._id)}
                  className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <ShoppingCart size={18} />
                    </div>
                    <div>
                      <span className="text-sm font-black text-slate-800">#{order.orderNumber || order._id.slice(-6)}</span>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{order.product?.name || 'Custom Order'}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-primary uppercase">{order.status}</span>
                </div>
              )) : <EmptyState text="Belum ada aktivitas pesanan." />}
            </div>
          )}
        </div>
      </div>

      {isAdmin && adminStats?.productionStatus && (
        <div className="bg-white p-8 rounded-3xl border border-slate-100">
          <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Status Produksi
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {adminStats.productionStatus.map((status, index) => (
              <div key={`${status._id}-${index}`} className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-2xl font-black text-slate-800">{status.count}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{status._id}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function OrdersPage({
  filteredOrders,
  isAdmin,
  onCreateOrder,
  onSearchChange,
  onSortChange,
  onStatusFilterChange,
  onViewOrder,
  orderStatuses,
  orderSort,
  searchTerm,
  statusFilter,
}) {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Cari order, produk, customer..."
            showStatusFilter
            showSortFilter
            statusFilter={statusFilter}
            onStatusFilterChange={onStatusFilterChange}
            statusOptions={orderStatuses}
            sortValue={orderSort}
            onSortChange={onSortChange}
            sortOptions={[
              { value: 'newest', label: 'Pesanan Terbaru' },
              { value: 'oldest', label: 'Pesanan Terlama' },
            ]}
          />
        </div>
        {!isAdmin && (
          <button
            type="button"
            onClick={onCreateOrder}
            className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Plus size={16} />
            Buat Pesanan
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(filteredOrders) && filteredOrders.map((order) => (
          <div key={order._id} onClick={() => onViewOrder(order._id)} className="cursor-pointer">
            <OrderCard order={order} />
          </div>
        ))}
      </div>

      {(!Array.isArray(filteredOrders) || filteredOrders.length === 0) && (
        <EmptyState text="Tidak ada pesanan ditemukan." />
      )}
    </div>
  );
}

export function CustomersPage({
  filteredCustomers,
  onSearchChange,
  searchTerm,
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <SearchBar value={searchTerm} onChange={onSearchChange} placeholder="Cari pelanggan..." />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.isArray(filteredCustomers) && filteredCustomers.map((customer) => (
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
      {(!Array.isArray(filteredCustomers) || filteredCustomers.length === 0) && (
        <EmptyState text="Tidak ada pelanggan ditemukan." />
      )}
    </div>
  );
}

export function ReportsPage({
  data,
  formatCurrency,
  isAdmin,
}) {
  if (!isAdmin) return <EmptyState text="Halaman ini khusus admin." />;

  const categoryStats = data?.categoryStats || [];
  const valveUsage = data?.valveUsage || {};
  const chartData = categoryStats.map((category) => ({
    name: category._id?.length > 12 ? `${category._id.slice(0, 12)}...` : category._id,
    fullName: category._id,
    Revenue: category.revenue,
    Pesanan: category.totalOrders,
    Terjual: category.totalQtySold,
    avgOrderValue: category.avgOrderValue,
  }));
  const valveData = [
    { name: 'Dengan Valve', value: valveUsage.withValve || 0 },
    { name: 'Tanpa Valve', value: valveUsage.withoutValve || 0 },
  ];
  const valveColors = ['#22c55e', '#94a3b8'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-3xl border border-slate-100">
        <h3 className="font-black text-slate-800 mb-2 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Revenue per Kategori
        </h3>
        <p className="text-xs text-slate-400 mb-6">Pendapatan dari setiap kategori produk kemasan</p>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
              <Tooltip content={<ReportTooltip formatCurrency={formatCurrency} />} />
              <Bar dataKey="Revenue" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState text="Belum ada data revenue." />
        )}
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100">
        <h3 className="font-black text-slate-800 mb-2 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Volume Penjualan
        </h3>
        <p className="text-xs text-slate-400 mb-6">Jumlah unit terjual per kategori</p>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} width={80} />
              <Tooltip content={<ReportTooltip formatCurrency={formatCurrency} />} />
              <Bar dataKey="Terjual" fill="#8b5cf6" radius={[0, 8, 8, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState text="Belum ada data penjualan." />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-100">
          <h3 className="font-black text-slate-800 mb-6">Penggunaan Valve</h3>
          {(valveUsage.withValve || valveUsage.withoutValve) ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={valveData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {valveData.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={valveColors[index]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 700 }} />
                <Tooltip formatter={(value) => [`${value} pesanan`, '']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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

        <div className="bg-white p-8 rounded-3xl border border-slate-100">
          <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Ringkasan Kategori
          </h3>
          <div className="space-y-3">
            {categoryStats.map((category, index) => (
              <div key={`${category._id}-${index}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: REPORT_CHART_COLORS[index % REPORT_CHART_COLORS.length] }} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{category._id}</p>
                  <p className="text-[10px] text-slate-400">{category.totalOrders} pesanan</p>
                </div>
                <p className="font-black text-primary text-sm whitespace-nowrap">{formatCurrency(category.revenue)}</p>
              </div>
            ))}
            {categoryStats.length === 0 && <EmptyState text="Belum ada data." />}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SettingsPage({
  isAdmin,
  landingContent,
  onActivityChange,
  onActivityImageChange,
  onActivityRemoveImage,
  onAddActivity,
  onAddArticle,
  onChangePassword,
  onRemoveActivity,
  onRemoveArticle,
  onSaveProfile,
  onSaveLandingContent,
  onSectionConfigChange, // New prop
  onArticleChange,
  onArticleImageChange,
  onArticleRemoveImage,
  passwords,
  profile,
  savingLandingContent,
  savingPassword,
  savingProfile,
  setPasswords,
  setProfile,
  user,
}) {
  return (
    <div className={`space-y-8 animate-in fade-in duration-500 ${isAdmin ? 'max-w-5xl' : 'max-w-2xl'}`}>
      <div className="bg-white p-8 rounded-3xl border border-slate-100">
        <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Profil Saya
        </h3>
        <form onSubmit={onSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField icon={User} label="Nama" value={profile.name} onChange={(value) => setProfile({ ...profile, name: value })} required />
            <InputField icon={Mail} label="Email" type="email" value={profile.email} onChange={(value) => setProfile({ ...profile, email: value })} required />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField icon={Phone} label="No. Telepon" value={profile.phone} onChange={(value) => setProfile({ ...profile, phone: value })} />
            <InputField icon={MapPin} label="Alamat" value={profile.address} onChange={(value) => setProfile({ ...profile, address: value })} />
          </div>
          <button
            type="submit"
            disabled={savingProfile}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50 sm:w-auto"
          >
            {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Profil
          </button>
        </form>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100">
        <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          Ganti Password
        </h3>
        <form onSubmit={onChangePassword} className="space-y-4">
          <InputField
            icon={Lock}
            label="Password Lama"
            type="password"
            value={passwords.currentPassword}
            onChange={(value) => setPasswords({ ...passwords, currentPassword: value })}
            required
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField
              icon={Lock}
              label="Password Baru"
              type="password"
              value={passwords.newPassword}
              onChange={(value) => setPasswords({ ...passwords, newPassword: value })}
              required
              placeholder="Min. 6 karakter"
            />
            <InputField
              icon={Lock}
              label="Konfirmasi"
              type="password"
              value={passwords.confirmPassword}
              onChange={(value) => setPasswords({ ...passwords, confirmPassword: value })}
              required
            />
          </div>
          <button
            type="submit"
            disabled={savingPassword}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-slate-700 active:scale-95 disabled:opacity-50 sm:w-auto"
          >
            {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Ubah Password
          </button>
        </form>
      </div>

      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Info Akun</p>
        <p className="text-sm text-slate-600">
          Role: <span className="font-bold text-primary uppercase">{user?.role}</span>
        </p>
      </div>

      {isAdmin && (
        <LandingContentSettingsSection
          landingContent={landingContent}
          onActivityChange={onActivityChange}
          onActivityImageChange={onActivityImageChange}
          onActivityRemoveImage={onActivityRemoveImage}
          onAddActivity={onAddActivity}
          onAddArticle={onAddArticle}
          onArticleChange={onArticleChange}
          onArticleImageChange={onArticleImageChange}
          onArticleRemoveImage={onArticleRemoveImage}
          onRemoveActivity={onRemoveActivity}
          onRemoveArticle={onRemoveArticle}
          onSectionConfigChange={onSectionConfigChange}
          onSave={onSaveLandingContent}
          saving={savingLandingContent}
        />
      )}
    </div>
  );
}
