import React from 'react';

const STATUS_STYLES = {
  quotation:   'bg-warning-container text-on-warning-container border-warning/20',
  payment:     'bg-warning-container text-on-warning-container border-warning/20',
  production:  'bg-info-container text-on-info-container border-info/20',
  'quality control': 'bg-secondary-container text-on-secondary-container border-secondary/20',
  shipping:    'bg-primary/10 text-primary border-primary/20',
  completed:   'bg-success-container text-on-success-container border-success/20',
  selesai:     'bg-success-container text-on-success-container border-success/20',
  cancelled:   'bg-error-container text-on-error-container border-error/20',
};

const STATUS_LABELS = {
  'quotation': 'Penawaran',
  'payment': 'Pembayaran',
  'production': 'Produksi',
  'quality control': 'Quality Control',
  'shipping': 'Pengiriman',
  'completed': 'Selesai',
  'selesai': 'Selesai',
  'cancelled': 'Dibatalkan',
};

const DEFAULT_STYLE = 'bg-surface-container-high text-on-surface-variant border-outline-variant';

export function getStatusStyles(status) {
  const key = status?.toLowerCase() || '';
  return STATUS_STYLES[key] || DEFAULT_STYLE;
}

export function getStatusLabel(status) {
  const key = status?.toLowerCase() || '';
  return STATUS_LABELS[key] || status;
}

export function StatusBadge({ status, className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-bold whitespace-nowrap ${getStatusStyles(status)} ${className}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}
