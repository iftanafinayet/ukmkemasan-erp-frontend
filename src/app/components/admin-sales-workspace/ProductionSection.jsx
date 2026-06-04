import { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  X,
  Cog,
  Eye,
  Save,
  Filter,
} from 'lucide-react';
import { StatusBadge } from '../StatusBadge';
import { StatCard, EmptyState } from '../customer-dashboard/shared';
import { ActionButton, TableHead } from './shared';
import api from '../../utils/api';

const TASK_STATUSES = ['Pending', 'InProgress', 'Review', 'Completed', 'Cancelled'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const TEAMS = ['Printing', 'Cutting', 'Assembly', 'Finishing'];

const TEAM_COLORS = {
  Printing: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  Cutting: 'bg-rose-50 text-rose-600 border-rose-200',
  Assembly: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  Finishing: 'bg-amber-50 text-amber-600 border-amber-200',
};

export default function ProductionSection({ formatCurrency, formatDate }) {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({});

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (teamFilter) params.set('team', teamFilter);
      const [tasksRes, statsRes] = await Promise.all([
        api.get(`/production-tasks?${params}`),
        api.get('/production-tasks/stats'),
      ]);
      setTasks(tasksRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch production tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, teamFilter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.put(`/production-tasks/${taskId}`, { status });
      fetchTasks();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingTask) return;
    try {
      await api.put(`/production-tasks/${editingTask}`, editForm);
      setEditingTask(null);
      setEditForm({});
      fetchTasks();
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const filtered = tasks.filter((t) => {
    const q = searchTerm.toLowerCase();
    const o = t.order || {};
    return [o.orderNumber, t.taskNumber, o.customer?.name, o.product?.name].some(
      (f) => f && f.toLowerCase().includes(q),
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={ClipboardList} color="primary" label="Total Tasks" value={stats?.total || 0} border />
        <StatCard icon={Clock} color="amber" label="In Progress" value={stats?.inProgress || 0} border />
        <StatCard icon={CheckCircle2} color="green" label="Completed" value={stats?.completed || 0} border />
        <StatCard icon={AlertTriangle} color="blue" label="Pending" value={stats?.pending || 0} border />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari task, order, customer, atau produk..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary appearance-none cursor-pointer"
            >
              <option value="">All Status</option>
              {TASK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="pl-9 pr-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary appearance-none cursor-pointer"
            >
              <option value="">All Teams</option>
              {TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <TableHead>Task</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((task) => {
                const order = task.order || {};
                const customer = order.customer || {};
                const product = order.product || {};
                const teamColor = TEAM_COLORS[task.assignedTeam] || 'bg-slate-50 text-slate-600 border-slate-200';
                return (
                  <tr key={task._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-mono font-black text-slate-900 text-sm">{task.taskNumber}</p>
                      <p className="text-[11px] text-slate-400 font-medium mt-1">
                        {task.createdAt ? formatDate(task.createdAt) : '-'}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800 text-sm">{order.orderNumber || '-'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800 text-sm">{customer.name || '-'}</p>
                      {customer.email && (
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{customer.email}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800 text-sm">{product.name || '-'}</p>
                      {order.details?.quantity && (
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                          {order.details.quantity.toLocaleString()} pcs
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {task.assignedTeam ? (
                        <span className={`inline-flex px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] ${teamColor}`}>
                          {task.assignedTeam}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300 font-bold">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={task.priority} />
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary cursor-pointer"
                      >
                        {TASK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <ActionButton
                        onClick={() => {
                          setEditingTask(task._id);
                          setEditForm({
                            assignedTeam: task.assignedTeam || '',
                            priority: task.priority,
                            notes: task.notes || '',
                          });
                        }}
                      >
                        <Cog className="w-3.5 h-3.5" />
                        Edit
                      </ActionButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && (
          <div className="px-6 py-16">
            <EmptyState text="Tidak ada production task yang cocok dengan pencarian." />
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingTask && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 p-3 backdrop-blur-md animate-in fade-in duration-300 sm:items-center sm:p-4"
          onClick={() => setEditingTask(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[28px] border border-white/20 bg-white p-5 pt-14 shadow-2xl sm:rounded-[40px] sm:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setEditingTask(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 sm:right-6 sm:top-6"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-black text-slate-900 mb-6">Edit Production Task</h3>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Team</label>
                <select
                  value={editForm.assignedTeam}
                  onChange={(e) => setEditForm({ ...editForm, assignedTeam: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 font-bold"
                >
                  <option value="">Select Team</option>
                  {TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                <select
                  value={editForm.priority}
                  onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 font-bold"
                >
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 font-bold resize-none"
                  rows={3}
                />
              </div>

              <button
                onClick={handleSaveEdit}
                className="w-full py-5 bg-primary text-white font-black rounded-3xl shadow-xl shadow-primary/30 hover:bg-primary/90 hover:-translate-y-1 active:scale-95 transition-all mt-2 flex items-center justify-center gap-3"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
