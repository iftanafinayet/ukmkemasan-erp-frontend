import React from 'react';

/**
 * StatusBadge Component
 * Menampilkan badge status dengan warna yang sesuai status pesanan dari backend
 * Backend Order status enum: Quotation, Payment, Production, Quality Control, Shipping, Completed
 */
export function StatusBadge({ status }) {
  const getStatusStyles = (status) => {
    const statusLower = status?.toLowerCase() || '';

    switch (statusLower) {
      case 'quotation':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'payment':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'production':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'quality control':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'shipping':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'completed':
      case 'selesai':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status) => {
    const statusLower = status?.toLowerCase() || '';

    const statusMap = {
      'quotation': 'Penawaran',
      'payment': 'Pembayaran',
      'production': 'Produksi',
      'quality control': 'Quality Control',
      'shipping': 'Pengiriman',
      'completed': 'Selesai',
      'selesai': 'Selesai'
    };

    return statusMap[statusLower] || status;
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-bold ${getStatusStyles(
        status
      )}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}
