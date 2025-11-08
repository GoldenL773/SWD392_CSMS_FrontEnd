import React, { useState, useEffect, useMemo } from 'react';
import { useApiQuery, useApiMutation } from '../hooks/useApiQuery.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { useOrderNotifications } from '../hooks/useOrderNotifications.jsx';
import { getAllOrders, updateOrderStatus } from '../api/orderApi.jsx';
import { ORDER_STATUS } from '../utils/constants.jsx';
import Card from '../components/common/Card/index.jsx';
import Button from '../components/common/Button/index.jsx';
import ToastContainer from '../components/common/Toast/ToastContainer.jsx';
import { formatDate, formatTime } from '../utils/formatters.jsx';
import './OrderQueuePage.css';

/**
 * OrderQueuePage Component
 * Kitchen Display System for Baristas to manage order queue
 * Auto-refreshes every 10 seconds to check for new orders
 */
const OrderQueuePage = () => {
  const toast = useToast();
  const { user } = useAuth();
  const [autoRefresh, setAutoRefresh] = useState(false); // default OFF to save resources
  
  // Fetch all orders
  const { data: ordersData, loading, refetch } = useApiQuery(
    getAllOrders, 
    { size: 100 }, 
    [],
    { enabled: true }
  );
  
  // Auto-refresh logic using setInterval
  useEffect(() => {
    if (!autoRefresh) return;
    
    const intervalId = setInterval(() => {
      refetch();
    }, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(intervalId);
  }, [autoRefresh, refetch]);

  // Real-time: refetch when a new order arrives (Staff/Barista)
  useOrderNotifications({
    enabled: true,
    pollingInterval: 5000,
    userRole: user?.role || user?.roles?.[0]?.name || 'STAFF',
    onNewOrder: (order) => {
      toast.info(`New order #${order.id} received`);
      refetch();
    }
  });
  
  // Update order status mutation
  const { mutate: updateStatus, loading: updating } = useApiMutation(updateOrderStatus);
  
  // Extract orders from response
  const allOrders = useMemo(() => {
    const orders = ordersData?.content || ordersData || [];
    return orders;
  }, [ordersData]);
  
  // Group orders by status
  const ordersByStatus = useMemo(() => {
    return {
      pending: allOrders.filter(order => order.status === ORDER_STATUS.PENDING),
      preparing: allOrders.filter(order => order.status === ORDER_STATUS.PREPARING),
      completed: allOrders.filter(order => order.status === ORDER_STATUS.COMPLETED)
    };
  }, [allOrders]);
  
  // Calculate time ago
  const getTimeAgo = (orderDate) => {
    const now = new Date();
    const order = new Date(orderDate);
    const diffInMinutes = Math.floor((now - order) / 60000);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes === 1) return '1 min ago';
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return '1 hour ago';
    return `${diffInHours} hours ago`;
  };
  
  // Handle status change
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateStatus(orderId, newStatus);
      toast.success(`Order #${orderId} moved to ${newStatus}`);
      refetch();
    } catch (error) {
      toast.error(error.message || 'Failed to update order status');
    }
  };
  
  // Play sound for new orders (optional)
  useEffect(() => {
    const pendingCount = ordersByStatus.pending.length;
    if (pendingCount > 0 && autoRefresh) {
      // Could play a notification sound here
      console.log(`${pendingCount} pending order(s)`);
    }
  }, [ordersByStatus.pending.length, autoRefresh]);
  
  // Render order card
  const renderOrderCard = (order, status) => {
    const getNextStatus = () => {
      if (status === 'pending') return ORDER_STATUS.PREPARING;
      if (status === 'preparing') return ORDER_STATUS.COMPLETED;
      return null;
    };
    
    const getActionButton = () => {
      const nextStatus = getNextStatus();
      if (!nextStatus) return null;
      
      const buttonText = {
        [ORDER_STATUS.PREPARING]: 'Start Preparing',
        [ORDER_STATUS.COMPLETED]: 'Mark Completed'
      }[nextStatus];
      
      return (
        <Button
          variant="primary"
          size="small"
          onClick={() => handleStatusChange(order.id, nextStatus)}
          disabled={updating}
        >
          {buttonText}
        </Button>
      );
    };
    
    return (
      <div key={order.id} className={`order-card order-${status}`}>
        {/* Header */}
        <div className="order-card-header">
          <div className="order-number">#{order.id}</div>
          <div className="order-time">{getTimeAgo(order.orderDate)}</div>
        </div>
        
        {/* Body - Order Items */}
        <div className="order-card-body">
          {(order.items || order.orderItems) && (order.items || order.orderItems).length > 0 ? (
            <ul className="order-items-list">
              {(order.items || order.orderItems).map((item, index) => (
                <li key={index} className="order-item">
                  <span className="item-quantity">{item.quantity}x</span>
                  <span className="item-name">{item.productName || item.product?.name || 'Unknown'}</span>
                  {item.notes && (
                    <span className="item-notes">({item.notes})</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-items">No items</p>
          )}
          
          {order.notes && (
            <div className="order-notes">
              <strong>Note:</strong> {order.notes}
            </div>
          )}
        </div>
        
        {/* Footer - Actions */}
        <div className="order-card-footer">
          <div className="order-total">
            Total: {order.totalAmount?.toLocaleString('vi-VN')} ₫
          </div>
          {getActionButton()}
        </div>
      </div>
    );
  };
  
  return (
    <div className="order-queue-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Order Queue</h1>
          <p className="page-subtitle">Kitchen Display System - Real-time order management</p>
        </div>
        
        <div className="header-actions">
          <Button
            variant={autoRefresh ? 'primary' : 'secondary'}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? '🔄 Auto-refresh ON' : '⏸️ Auto-refresh OFF'}
          </Button>
          
          <Button
            variant="secondary"
            onClick={refetch}
            disabled={loading}
          >
            {loading ? '⏳ Refreshing...' : '🔄 Refresh Now'}
          </Button>
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="queue-stats">
        <div className="stat-badge stat-pending">
          <span className="stat-number">{ordersByStatus.pending.length}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-badge stat-preparing">
          <span className="stat-number">{ordersByStatus.preparing.length}</span>
          <span className="stat-label">Preparing</span>
        </div>
        <div className="stat-badge stat-completed">
          <span className="stat-number">{ordersByStatus.completed.length}</span>
          <span className="stat-label">Completed</span>
        </div>
      </div>
      
      {/* Order Columns */}
      <div className="order-columns">
        {/* Pending Column */}
        <div className="order-column">
          <div className="column-header pending">
            <h2>🔔 Pending</h2>
            <span className="count-badge">{ordersByStatus.pending.length}</span>
          </div>
          <div className="column-body">
            {ordersByStatus.pending.length === 0 ? (
              <div className="empty-column">
                <p>✅ No pending orders</p>
              </div>
            ) : (
              ordersByStatus.pending.map(order => renderOrderCard(order, 'pending'))
            )}
          </div>
        </div>
        
        {/* Preparing Column */}
        <div className="order-column">
          <div className="column-header preparing">
            <h2>👨‍🍳 Preparing</h2>
            <span className="count-badge">{ordersByStatus.preparing.length}</span>
          </div>
          <div className="column-body">
            {ordersByStatus.preparing.length === 0 ? (
              <div className="empty-column">
                <p>No orders being prepared</p>
              </div>
            ) : (
              ordersByStatus.preparing.map(order => renderOrderCard(order, 'preparing'))
            )}
          </div>
        </div>
        
        {/* Completed Column */}
        <div className="order-column">
          <div className="column-header completed">
            <h2>✅ Completed</h2>
            <span className="count-badge">{ordersByStatus.completed.length}</span>
          </div>
          <div className="column-body">
            {ordersByStatus.completed.length === 0 ? (
              <div className="empty-column">
                <p>No completed orders</p>
              </div>
            ) : (
              ordersByStatus.completed.map(order => renderOrderCard(order, 'completed'))
            )}
          </div>
        </div>
      </div>
      
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  );
};

export default OrderQueuePage;
