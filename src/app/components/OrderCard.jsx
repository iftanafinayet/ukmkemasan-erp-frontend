import React from 'react';
import { Package, Calendar, User, DollarSign, Package2, Hash } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { formatCurrency, formatDate } from '../utils/formatters';

export function OrderCard({ order }) {

  // Helper untuk mengambil ID yang cantik (Real API: orderNumber, Mock: id)
  const displayId = order.orderNumber || order.id || order._id?.substring(0, 8);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1">
              <Hash className="w-3 h-3 text-gray-400" />
              {displayId}
            </h3>
            <p className="text-sm font-medium text-gray-600">
              {/* Cek produk dari Real API (.populate) atau Mock Data */}
              {order.product?.name || order.productName || 'Produk Kemasan'}
            </p>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4">
        {/* Customer Info */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4 text-gray-400" />
          <span className="truncate">
            {order.customer?.name || order.customer || 'Customer'}
          </span>
        </div>

        {/* Quantity - Sesuaikan dengan skema: order.details.quantity atau order.quantity */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Package2 className="w-4 h-4 text-gray-400" />
          <span>
            {order.details?.quantity || order.quantity || 0} pcs
          </span>
        </div>

        {/* Total Amount - Sesuaikan dengan order.totalPrice atau order.totalAmount */}
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-bold">
            {formatCurrency(order.totalPrice || order.totalAmount)}
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>
            {formatDate(order.createdAt || order.orderDate)}
          </span>
        </div>
      </div>

      {/* Footer Info (Misal: Material) */}
      {(order.details?.material || order.details?.size) && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
          {order.details.material && (
            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-bold uppercase">
              {order.details.material}
            </span>
          )}
          {order.details.size && (
            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-bold uppercase">
              {order.details.size}
            </span>
          )}
        </div>
      )}
    </div>
  );
}