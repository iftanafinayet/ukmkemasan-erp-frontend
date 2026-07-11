import React from 'react';
import { Package, Calendar, User, DollarSign, Package2, Hash } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { formatCurrency, formatDate } from '../utils/formatters';

export function OrderCard({ order }) {

  // Helper untuk mengambil ID yang cantik (Real API: orderNumber, Mock: id)
  const displayId = order.orderNumber || order.id || order._id?.substring(0, 8);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-xs flex items-center gap-1">
              <Hash className="w-3 h-3 text-gray-400" />
              {displayId}
            </h3>
            <p className="text-xs font-medium text-gray-600 truncate max-w-[120px] sm:max-w-none">
              {order.product?.name || order.productName || 'Produk Kemasan'}
            </p>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs">
        <div className="flex items-center gap-1.5 text-gray-600">
          <User className="w-3.5 h-3.5 text-gray-400" />
          <span className="truncate">
            {order.customer?.name || order.customer || 'Customer'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <Package2 className="w-3.5 h-3.5 text-gray-400" />
          <span>{order.details?.quantity || order.quantity || 0} pcs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-900 font-bold">{formatCurrency(order.totalPrice || order.totalAmount)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span>{formatDate(order.createdAt || order.orderDate)}</span>
        </div>
      </div>

      {(order.details?.material || order.details?.size) && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex gap-1.5 flex-wrap">
          {order.details.material && (
            <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-bold uppercase">
              {order.details.material}
            </span>
          )}
          {order.details.size && (
            <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-bold uppercase">
              {order.details.size}
            </span>
          )}
        </div>
      )}
    </div>
  );
}