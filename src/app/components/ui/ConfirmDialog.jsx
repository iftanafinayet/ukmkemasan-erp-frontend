import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ isOpen, title, message, confirmLabel = 'Ya', cancelLabel = 'Batal', variant = 'danger', onConfirm, onCancel }) {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4 animate-fade-in">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-surface-container-lowest rounded-3xl shadow-modal max-w-sm w-full p-6 animate-scale-in">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isDanger ? 'bg-error-container text-error' : 'bg-surface-container-high text-on-surface-variant'}`}>
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-lg font-bold text-on-surface text-center mb-2">{title}</h3>
        <p className="text-sm text-on-surface-variant text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${isDanger ? 'bg-error hover:bg-error/90' : 'bg-primary hover:bg-primary/90'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
