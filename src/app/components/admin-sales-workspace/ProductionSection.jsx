import { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { StatusBadge } from '../StatusBadge';

const TASK_STATUSES = ['Pending', 'InProgress', 'Review', 'Completed', 'Cancelled'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const TEAMS = ['Printing', 'Cutting', 'Assembly', 'Finishing'];

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
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (teamFilter) params.set('team', teamFilter);
      const [tasksRes, statsRes] = await Promise.all([
        api.get(`/api/production-tasks?${params}`),
        api.get('/api/production-tasks/stats')
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

  const handleUpdateTask = async (taskId) => {
    try {
      await api.put(`/api/production-tasks/${taskId}`, editForm);
      setEditingTask(null);
      setEditForm({});
      fetchTasks();
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.put(`/api/production-tasks/${taskId}`, { status });
      fetchTasks();
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const filtered = tasks.filter((t) => {
    const search = searchTerm.toLowerCase();
    const order = t.order || {};
    const orderNum = order.orderNumber || '';
    const taskNum = t.taskNumber || '';
    const customerName = order.customer?.name || '';
    const productName = order.product?.name || '';
    return (
      orderNum.includes(search) ||
      taskNum.includes(search) ||
      customerName.toLowerCase().includes(search) ||
      productName.toLowerCase().includes(search)
    );
  });

  if (loading) return <div className="p-6 text-center text-gray-400">Loading production tasks...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'bg-blue-500' },
            { label: 'Pending', value: stats.pending, color: 'bg-yellow-500' },
            { label: 'In Progress', value: stats.inProgress, color: 'bg-indigo-500' },
            { label: 'Review', value: stats.review, color: 'bg-purple-500' },
            { label: 'Completed', value: stats.completed, color: 'bg-green-500' },
          ].map((s) => (
            <div key={s.label} className={`${s.color} rounded-xl p-4 text-white`}>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm opacity-80">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search order/task/customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm w-64 bg-white dark:bg-gray-800"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
          >
            <option value="">All Status</option>
            {TASK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800"
          >
            <option value="">All Teams</option>
            {TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 text-left">
            <tr>
              <th className="p-3 font-medium">Task</th>
              <th className="p-3 font-medium">Order</th>
              <th className="p-3 font-medium">Customer</th>
              <th className="p-3 font-medium">Product</th>
              <th className="p-3 font-medium">Team</th>
              <th className="p-3 font-medium">Priority</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {filtered.map((task) => {
              const order = task.order || {};
              return (
                <tr key={task._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="p-3 font-mono text-xs">{task.taskNumber}</td>
                  <td className="p-3 font-mono text-xs">{order.orderNumber || '-'}</td>
                  <td className="p-3">{order.customer?.name || '-'}</td>
                  <td className="p-3">{order.product?.name || '-'}</td>
                  <td className="p-3">
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {task.assignedTeam || '—'}
                    </span>
                  </td>
                  <td className="p-3">
                    <StatusBadge status={task.priority} />
                  </td>
                  <td className="p-3">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      className="border rounded px-2 py-1 text-xs bg-white dark:bg-gray-800"
                    >
                      {TASK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => {
                        setEditingTask(task._id);
                        setEditForm({ assignedTeam: task.assignedTeam, priority: task.priority, notes: task.notes });
                      }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditingTask(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg">Edit Task</h3>
            <select
              value={editForm.assignedTeam}
              onChange={(e) => setEditForm({ ...editForm, assignedTeam: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select Team</option>
              {TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select
              value={editForm.priority}
              onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <textarea
              placeholder="Notes"
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
              rows="3"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditingTask(null)} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
              <button onClick={() => handleUpdateTask(editingTask)} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
