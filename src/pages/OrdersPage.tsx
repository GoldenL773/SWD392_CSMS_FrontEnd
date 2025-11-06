import React, { useState, useMemo } from 'react';
import { useApiQuery } from '../hooks/useApiQuery.tsx';
import { getAllOrders } from '../api/orderApi.tsx';
import { ORDER_STATUS } from '../utils/constants.tsx';
import Card from '../components/common/Card/index.tsx';
import StatusFilter from '../features/orders/StatusFilter.tsx';
import OrdersTable from '../features/orders/OrdersTable.tsx';
import './OrdersPage.css';

const OrdersPage = () => {
  const [activeStatus, setActiveStatus] = useState('ALL');
  const { data: orders, loading } = useApiQuery(getAllOrders, {}, []);

  // Calculate order counts by status
  const orderCounts = useMemo(() => {
    if (!orders) return { ALL: 0 };
    
    const counts = {
      ALL: orders.length,
      [ORDER_STATUS.PENDING]: 0,
      [ORDER_STATUS.COMPLETED]: 0,
      [ORDER_STATUS.CANCELLED]: 0
    };

    orders.forEach((order) => {
      if (counts[order.status] !== undefined) {
        counts[order.status]++;
      }
    });

    return counts;
  }, [orders]);

  // Filter orders by status
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (activeStatus === 'ALL') return orders;
    return orders.filter((order) => order.status === activeStatus);
  }, [orders, activeStatus]);

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>Orders Management</h1>
        <p>View and manage customer orders</p>
      </div>

      <StatusFilter
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
        orderCounts={orderCounts}
      />

      <Card
        title="Orders"
        subtitle={`${filteredOrders.length} order${filteredOrders.length !== 1 ? 's' : ''}`}
      >
        <OrdersTable
          orders={filteredOrders}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default OrdersPage;
