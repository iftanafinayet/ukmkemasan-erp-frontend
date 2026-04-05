import { AlertCircle, Loader2, Plus, Save, Search, X } from 'lucide-react';

export function SearchActionBar({
  actionLabel,
  onAction,
  onChange,
  placeholder,
  value,
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 text-sm"
        />
      </div>
      <button
        type="button"
        onClick={onAction}
        className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
      >
        <Plus size={16} />
        {actionLabel}
      </button>
    </div>
  );
}

export function SummaryCards({ items }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.label} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{item.label}</p>
              <p className="text-2xl font-black text-slate-900 mt-2">{item.value}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
              <item.icon className="w-5 h-5 text-primary" />
            </div>
          </div>
          {item.helper && <p className="text-xs text-slate-500 font-medium mt-3">{item.helper}</p>}
        </div>
      ))}
    </div>
  );
}

export function TableHead({ children }) {
  return (
    <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.22em]">
      {children}
    </th>
  );
}

export function ActionButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-black uppercase tracking-[0.14em] hover:bg-slate-200 transition-colors"
    >
      {children}
    </button>
  );
}

export function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      {children}
    </div>
  );
}

export function SummaryLine({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="font-bold text-slate-800 text-sm mt-1">{value}</p>
    </div>
  );
}

export function SubmitButton({ loading, label }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-5 bg-primary text-white font-black rounded-3xl shadow-xl shadow-primary/30 hover:bg-primary/90 hover:-translate-y-1 active:scale-95 transition-all mt-4 disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-3"
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4" />}
      {label}
    </button>
  );
}

export function ModalWrapper({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 p-3 backdrop-blur-md animate-in fade-in duration-300 sm:items-center sm:p-4">
      <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[28px] border border-white/20 bg-white p-5 pt-14 shadow-2xl sm:rounded-[40px] sm:p-10">
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

export function EmptyState({ text }) {
  return (
    <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-40 text-slate-900">
      <AlertCircle size={60} strokeWidth={1} className="mb-4" />
      <p className="font-black uppercase tracking-[0.28em] text-[10px] text-center">{text}</p>
    </div>
  );
}
