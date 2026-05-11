import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrdersPage from './OrdersPage';

// Mock OrderCard since it's imported
jest.mock('../../OrderCard', () => ({
  OrderCard: ({ order }) => <div>{order.orderNumber}</div>
}));

const mockOrders = [
  { _id: '1', orderNumber: 'ORD-001', customer: { name: 'Customer A' }, status: 'Quotation' },
  { _id: '2', orderNumber: 'ORD-002', customer: { name: 'Customer B' }, status: 'Production' },
];

const mockStatuses = ['Quotation', 'Production', 'Completed'];

describe('OrdersPage Component', () => {
  it('renders correctly with given orders', () => {
    render(
      <OrdersPage
        filteredOrders={mockOrders}
        isAdmin={false}
        onCreateOrder={jest.fn()}
        onSearchChange={jest.fn()}
        onSortChange={jest.fn()}
        onStatusFilterChange={jest.fn()}
        onViewOrder={jest.fn()}
        orderStatuses={mockStatuses}
        orderSort="newest"
        searchTerm=""
        statusFilter="all"
      />
    );

    expect(screen.getByText('ORD-001')).toBeInTheDocument();
    expect(screen.getByText('ORD-002')).toBeInTheDocument();
  });

  it('renders "Buat Pesanan" button only for non-admins', () => {
    const { rerender } = render(
      <OrdersPage
        filteredOrders={[]}
        isAdmin={false}
        onCreateOrder={jest.fn()}
        onSearchChange={jest.fn()}
        onSortChange={jest.fn()}
        onStatusFilterChange={jest.fn()}
        onViewOrder={jest.fn()}
        orderStatuses={mockStatuses}
      />
    );

    expect(screen.getByText(/Buat Pesanan/i)).toBeInTheDocument();

    rerender(
      <OrdersPage
        filteredOrders={[]}
        isAdmin={true}
        onCreateOrder={jest.fn()}
        onSearchChange={jest.fn()}
        onSortChange={jest.fn()}
        onStatusFilterChange={jest.fn()}
        onViewOrder={jest.fn()}
        orderStatuses={mockStatuses}
      />
    );

    expect(screen.queryByText(/Buat Pesanan/i)).not.toBeInTheDocument();
  });
});
