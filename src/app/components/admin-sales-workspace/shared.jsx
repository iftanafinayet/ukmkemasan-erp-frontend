import { AlertCircle, Loader2, Plus, Save, Search, X } from 'lucide-react';

export function SearchActionBar({
  actionLabel,
  onAction,
  onChange,
  placeholder,
  value,
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 text-sm"
        />
      </div>
      <button
        type="button"
        onClick={onAction}
        className="bg-primary text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
      >
        <Plus size={14} />
        {actionLabel}
      </button>
    </div>
  );
}

export function SummaryCards({ items }) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {items.map((item) => (
        <div key={item.label} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">{item.label}</p>
              <p className="text-lg font-black text-slate-900 mt-1">{item.value}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
              <item.icon className="w-4 h-4 text-primary" />
            </div>
          </div>
          {item.helper && <p className="text-[10px] text-slate-500 font-medium mt-2 leading-tight">{item.helper}</p>}
        </div>
      ))}
    </div>
  );
}

export function TableHead({ children }) {
  return (
    <th className="px-3 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-[0.22em]">
      {children}
    </th>
  );
}

export function ActionButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-[0.14em] hover:bg-slate-200 transition-colors"
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
      className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:bg-primary/90 hover:-translate-y-1 active:scale-95 transition-all mt-3 disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2 text-sm"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      {label}
    </button>
  );
}

export function ModalWrapper({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 p-3 backdrop-blur-md animate-in fade-in duration-300 sm:items-center sm:p-4">
      <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/20 bg-white p-4 pt-12 shadow-2xl sm:rounded-3xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 sm:right-5 sm:top-5"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ text }) {
  return (
    <div className="col-span-full py-12 flex flex-col items-center justify-center opacity-40 text-slate-900">
      <AlertCircle size={40} strokeWidth={1} className="mb-3" />
      <p className="font-black uppercase tracking-[0.28em] text-[9px] text-center">{text}</p>
    </div>
  );
}
