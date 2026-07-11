import { AlertCircle, ChevronDown, Loader2, Search, X } from 'lucide-react';
import { Skeleton, SkeletonCircle } from '../ui/Skeleton';

const STAT_CARD_STYLES = {
  primary: {
    iconBg: 'bg-primary/10',
    iconText: 'text-primary',
    labelText: 'text-primary',
    border: 'border-l-primary',
  },
  info: {
    iconBg: 'bg-info-container',
    iconText: 'text-info',
    labelText: 'text-info',
    border: 'border-l-info',
  },
  warning: {
    iconBg: 'bg-warning-container',
    iconText: 'text-warning',
    labelText: 'text-warning',
    border: 'border-l-warning',
  },
  success: {
    iconBg: 'bg-success-container',
    iconText: 'text-success',
    labelText: 'text-success',
    border: 'border-l-success',
  },
  error: {
    iconBg: 'bg-error-container',
    iconText: 'text-error',
    labelText: 'text-error',
    border: 'border-l-error',
  },
};

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
      <p className="text-on-surface-variant font-semibold uppercase tracking-widest text-[10px]">
        Menghubungkan ke Server...
      </p>
    </div>
  );
}

export function DashboardSkeleton({ isAdmin }) {
  const cardCount = isAdmin ? 4 : 2;
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(cardCount)].map((_, i) => (
          <div key={i} className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <SkeletonCircle className="w-6 h-6" />
              <Skeleton className="h-2.5 w-16" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
      <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 h-72">
        <div className="flex justify-between mb-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 h-48 bg-surface-container rounded-xl" />
          <div className="lg:col-span-5 space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden animate-pulse">
      <div className="p-4 border-b border-outline-variant/30 flex justify-between">
        <Skeleton className="h-6 w-48 rounded-lg" />
        <Skeleton className="h-6 w-24 rounded-lg" />
      </div>
      <div className="p-0">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="px-4 py-3 border-b border-outline-variant/30 flex gap-3 items-center">
            <SkeletonCircle className="w-8 h-8" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-2.5 w-1/4" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ text }) {
  return (
    <div className="col-span-full py-12 flex flex-col items-center justify-center opacity-30 text-on-surface">
      <AlertCircle size={40} strokeWidth={1} className="mb-3" />
      <p className="font-bold uppercase tracking-[0.3em] text-[9px] text-center">{text}</p>
    </div>
  );
}

export function StatCard({ icon, color = 'primary', label, value, border = false, neumo = false }) {
  const Icon = icon;
  const styles = STAT_CARD_STYLES[color] || STAT_CARD_STYLES.primary;

  const cardClasses = neumo
    ? `neumo p-4 ${border ? `border-l-4 ${styles.border}` : ''}`
    : `bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-card transition-all duration-200 ${border ? `border-l-4 ${styles.border}` : ''}`;

  return (
    <div className={cardClasses}>
      <div className="flex items-center gap-2 mb-2">
        <div className={neumo ? `neumo-icon p-1.5 ${styles.iconBg}` : `p-1.5 rounded-lg ${styles.iconBg}`}>
          <Icon className={`w-4 h-4 ${styles.iconText}`} />
        </div>
        <p className={`text-[10px] font-bold uppercase tracking-wider ${styles.labelText}`}>{label}</p>
      </div>
      <h3 className="text-xl font-bold text-on-surface">{value}</h3>
    </div>
  );
}

export function ModalWrapper({ children, onClose, wide = false }) {
  return (
    <div className="fixed inset-0 z-modal flex items-start justify-center bg-black/40 backdrop-blur-sm p-2 animate-fade-in sm:items-center sm:p-4">
      <div className={`relative max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 pt-12 shadow-modal sm:rounded-2xl sm:p-6 ${wide ? 'max-w-5xl' : 'max-w-lg'}`}>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1.5 text-on-surface-variant transition-colors duration-200 hover:bg-surface-container-low cursor-pointer focus-visible:ring-2 focus-visible:ring-primary sm:right-4 sm:top-4"
        >
          <X size={18} />
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
  dataTestId,
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">
        {label}{required && <span className="text-error ml-0.5">*</span>}
      </label>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        data-testid={dataTestId}
        className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 text-on-surface font-medium text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export function InputField({
  icon: Icon,
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder = '',
  dataTestId,
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">
        {label}{required && <span className="text-error ml-0.5">*</span>}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant" />
        <input
          type={type}
          required={required}
          placeholder={placeholder}
          data-testid={dataTestId}
          className="w-full pl-10 pr-3 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 text-on-surface font-medium text-sm"
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
      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{label}</p>
      <p className={`font-semibold ${highlight ? 'text-primary text-xl' : 'text-on-surface'}`}>{value || '-'}</p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
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
    <div className="mb-4 flex flex-col gap-3 lg:flex-row">
      <div className="flex-1 relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full pl-10 pr-3 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-on-surface text-sm"
        />
      </div>
      {(showStatusFilter || showSortFilter) && (
        <div className="flex flex-col gap-3 sm:flex-row">
          {showStatusFilter && (
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) => onStatusFilterChange(event.target.value)}
                className="w-full appearance-none px-4 pr-8 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm font-semibold text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 cursor-pointer"
              >
                <option value="all">Semua Status</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant pointer-events-none" />
            </div>
          )}
          {showSortFilter && (
            <div className="relative">
              <select
                value={sortValue}
                onChange={(event) => onSortChange?.(event.target.value)}
                className="w-full appearance-none px-4 pr-8 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-sm font-semibold text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 cursor-pointer"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant pointer-events-none" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
