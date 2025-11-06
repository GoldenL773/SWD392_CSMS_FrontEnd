import React, { useState, useMemo, useCallback } from 'react';
import { useApiQuery, useApiMutation } from '../hooks/useApiQuery.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { useOrderNotifications } from '../hooks/useOrderNotifications.jsx';
import { getAllOrders, createOrder, updateOrderStatus } from '../api/orderApi.jsx';
import { getAllEmployees } from '../api/employeeApi.jsx';
import ToastContainer from '../components/common/Toast/ToastContainer.jsx';
import OrderNotificationToast from '../components/common/OrderNotificationToast/index.jsx';
import { ORDER_STATUS } from '../utils/constants.jsx';
import Card from '../components/common/Card/index.jsx';
import Button from '../components/common/Button/index.jsx';
import StatusFilter from '../features/orders/StatusFilter.jsx';
import OrdersTable from '../features/orders/OrdersTable.jsx';
import NewOrderModal from '../features/orders/NewOrderModal.jsx';
import DateRangePicker from '../components/common/DateRangePicker/index.jsx';
import { formatCurrency } from '../utils/formatters.jsx';
import './OrdersPage.css';

const OrdersPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('ALL');
  const [sortBy, setSortBy] = useState('date'); // date, amount-asc, amount-desc
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  
  // Real-time order notification state
  const [newOrderNotification, setNewOrderNotification] = useState(null);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  
  // Fetch data
  const { data: ordersData, loading: ordersLoading, refetch: refetchOrders } = useApiQuery(
    getAllOrders, 
    { page: currentPage, size: pageSize }, 
    [currentPage]
  );
  
  // Handle new order notification
  const handleNewOrder = useCallback((order) => {
    setNewOrderNotification(order);
    setShowNotificationToast(true);
    
    // Auto-hide notification after 10 seconds
    setTimeout(() => {
      setShowNotificationToast(false);
    }, 10000);
    
    // Refetch orders to update the list
    refetchOrders();
    
    // Show toast message
    toast.addToast(`New order #${order.id} received!`, 'info');
  }, [refetchOrders, toast]);
  
  // Initialize real-time notifications for Barista/Staff
  useOrderNotifications({
    enabled: true,
    pollingInterval: 5000, // Check every 5 seconds
    onNewOrder: handleNewOrder,
    userRole: user?.role
  });
  
  // Handle notification toast click
  const handleNotificationClick = useCallback(() => {
    setShowNotificationToast(false);
    // Optionally scroll to top or highlight the new order
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  // Extract data from paginated response
  const orders = ordersData?.content || ordersData || [];
  const totalOrders = ordersData?.totalElements || orders.length;
  const totalPages = ordersData?.totalPages || Math.ceil(totalOrders / pageSize);
  const { data: employees } = useApiQuery(getAllEmployees, {}, []);
  const { mutate: createOrderMutation, loading: creating } = useApiMutation(createOrder);
  const { mutate: updateStatusMutation } = useApiMutation(updateOrderStatus);

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

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    let filtered = [...orders];
    
    // Filter by status
    if (activeStatus !== 'ALL') {
      filtered = filtered.filter((order) => order.status === activeStatus);
    }
    
    // Filter by employee
    if (selectedEmployee !== 'ALL') {
      filtered = filtered.filter((order) => order.employee?.id === parseInt(selectedEmployee));
    }
    
    // Filter by date range
    if (startDate) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.orderDate).toISOString().split('T')[0];
        return orderDate >= startDate;
      });
    }
    if (endDate) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.orderDate).toISOString().split('T')[0];
        return orderDate <= endDate;
      });
    }
    
    // Sort orders
    if (sortBy === 'amount-asc') {
      filtered.sort((a, b) => a.totalAmount - b.totalAmount);
    } else if (sortBy === 'amount-desc') {
      filtered.sort((a, b) => b.totalAmount - a.totalAmount);
    } else {
      // Sort by date (newest first)
      filtered.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    }
    
    return filtered;
  }, [orders, activeStatus, selectedEmployee, startDate, endDate, sortBy]);
  
  const handleClearFilters = () => {
    setSelectedEmployee('ALL');
    setStartDate('');
    setEndDate('');
    setSortBy('date');
    setCurrentPage(0);
  };

  const handleCreateOrder = async (orderData) => {
    try {
      // Get current user's employee ID
      const currentEmployee = employees?.find(emp => emp.userId === user?.id);
      if (!currentEmployee) {
        toast.error('Could not find employee profile for current user');
        return;
      }

      const requestData = {
        employeeId: currentEmployee.id,
        items: orderData.orderItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        notes: orderData.notes || ''
      };

      await createOrderMutation(requestData);
      toast.success('Order created successfully!');
      setIsModalOpen(false);
      refetchOrders();
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(`Failed to create order: ${error.message || 'Unknown error'}`);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateStatusMutation(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}!`);
      refetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(`Failed to update order status: ${error.message || 'Unknown error'}`);
    }
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

      {/* Advanced Filters */}
      <Card>
        <div className="filters-header">
          <h3>Filters</h3>
          <Button 
            variant="secondary" 
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? '▲ Hide Filters' : '▼ Show Filters'}
          </Button>
        </div>
        
        {showFilters && (
          <div className="advanced-filters">
            <div className="filter-row">
              <div className="filter-group">
                <label htmlFor="employee-filter">Employee</label>
                <select
                  id="employee-filter"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="filter-select"
                >
                  <option value="ALL">All Employees</option>
                  {employees?.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="sort-filter">Sort By</label>
                <select
                  id="sort-filter"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="date">Date (Newest First)</option>
                  <option value="amount-desc">Amount (High to Low)</option>
                  <option value="amount-asc">Amount (Low to High)</option>
                </select>
              </div>
            </div>

            <div className="filter-row">
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                label="Order Date Range"
              />
            </div>

            <div className="filter-actions">
              <Button variant="secondary" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card
        title="Orders"
        subtitle={`${filteredOrders.length} order${filteredOrders.length !== 1 ? 's' : ''} (Total: ${totalOrders})`}
      >
        <OrdersTable
          orders={filteredOrders}
          loading={ordersLoading}
          onUpdateStatus={handleUpdateStatus}
        />
        {totalOrders > pageSize && (
          <div className="pagination-controls">
            <Button 
              variant="secondary" 
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <span className="page-info">
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button 
              variant="secondary" 
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        )}
      </Card>

      <NewOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrder}
      />
      
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      
      {/* Real-time Order Notification */}
      {showNotificationToast && newOrderNotification && (
        <OrderNotificationToast
          order={newOrderNotification}
          onClose={() => setShowNotificationToast(false)}
          onClick={handleNotificationClick}
        />
      )}
    </div>
  );
};

export default OrdersPage;
