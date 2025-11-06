import React, { useState, useMemo } from 'react';
import { useApiQuery } from '../hooks/useApiQuery.jsx';
import { getAllOrders } from '../api/orderApi.jsx';
import { ORDER_STATUS } from '../utils/constants.jsx';
import Card from '../components/common/Card/index.jsx';
import Button from '../components/common/Button/index.jsx';
import StatusFilter from '../features/orders/StatusFilter.jsx';
import OrdersTable from '../features/orders/OrdersTable.jsx';
import NewOrderModal from '../features/orders/NewOrderModal.jsx';
import './OrdersPage.css';

const OrdersPage = () => {
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleCreateOrder = (orderData) => {
    console.log('Creating order:', orderData);
    // TODO: Call API to create order
    alert('Order created successfully! (Mock)');
    setIsModalOpen(false);
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    console.log('Updating order status:', orderId, newStatus);
    // TODO: Call API to update order status
    alert(`Order ${orderId} status updated to ${newStatus}! (Mock)`);
  };

  return (
    <div className="orders-page">
      <div className="page-header">
        <div>
          <h1>Orders Management</h1>
          <p>View and manage customer orders</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Create Order
        </Button>
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
          onUpdateStatus={handleUpdateStatus}
        />
      </Card>

      <NewOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrder}
      />
    </div>
  );
};

export default OrdersPage;
