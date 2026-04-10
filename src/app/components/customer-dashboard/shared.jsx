import { AlertCircle, ChevronDown, Loader2, Search, X } from 'lucide-react';

const STAT_CARD_STYLES = {
  blue: {
    iconBg: 'bg-blue-50',
    iconText: 'text-blue-500',
    labelText: 'text-blue-500',
    border: 'border-l-blue-400',
  },
  amber: {
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-500',
    labelText: 'text-amber-500',
    border: 'border-l-amber-400',
  },
  green: {
    iconBg: 'bg-green-50',
    iconText: 'text-green-500',
    labelText: 'text-green-500',
    border: 'border-l-green-400',
  },
  primary: {
    iconBg: 'bg-primary/10',
    iconText: 'text-primary',
    labelText: 'text-primary',
    border: 'border-l-primary',
  },
};

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-32">
      <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
        Menghubungkan ke Server...
      </p>
    </div>
  );
}

export function EmptyState({ text }) {
  return (
    <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-30 text-slate-900">
      <AlertCircle size={60} strokeWidth={1} className="mb-4" />
      <p className="font-black uppercase tracking-[0.3em] text-[10px] text-center">{text}</p>
    </div>
  );
}

export function StatCard({ icon, color, label, value, border = false }) {
  const Icon = icon;
  const styles = STAT_CARD_STYLES[color] || STAT_CARD_STYLES.primary;

  return (
    <div className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm ${border ? `border-l-4 ${styles.border}` : ''}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-xl ${styles.iconBg}`}>
          <Icon className={`w-5 h-5 ${styles.iconText}`} />
        </div>
        <p className={`text-[10px] font-black uppercase ${styles.labelText}`}>{label}</p>
      </div>
      <h3 className="text-2xl font-black text-slate-800">{value}</h3>
    </div>
  );
}

export function ModalWrapper({ children, onClose, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 p-3 backdrop-blur-md animate-in fade-in duration-300 sm:items-center sm:p-4">
      <div className={`relative max-h-[90vh] w-full overflow-y-auto rounded-[28px] border border-white/20 bg-white p-5 pt-14 shadow-2xl sm:rounded-[40px] sm:p-10 ${wide ? 'max-w-5xl' : 'max-w-lg'}`}>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 sm:right-6 sm:top-6"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}

export function FormInput({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder = '',
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 font-bold"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export function InputField({
  icon,
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder = '',
}) {
  const Icon = icon;

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type={type}
          required={required}
          placeholder={placeholder}
          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 font-bold"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  );
}

export function InfoBlock({ label, value, sub, highlight = false }) {
  return (
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className={`font-bold ${highlight ? 'text-primary text-xl' : 'text-slate-800'}`}>{value || '-'}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Cari...',
  showStatusFilter = false,
  statusFilter = 'all',
  onStatusFilterChange,
  statusOptions = [],
  showSortFilter = false,
  sortValue = 'newest',
  onSortChange,
  sortOptions = [],
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row">
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 text-sm"
        />
      </div>
      {(showStatusFilter || showSortFilter) && (
        <div className="flex flex-col gap-4 sm:flex-row">
          {showStatusFilter && (
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) => onStatusFilterChange(event.target.value)}
                className="w-full appearance-none px-5 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
              >
                <option value="all">Semua Status</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          )}
          {showSortFilter && (
            <div className="relative">
              <select
                value={sortValue}
                onChange={(event) => onSortChange?.(event.target.value)}
                className="w-full appearance-none px-5 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
