import React, { useState, useMemo, useCallback } from 'react';
import { useApiQuery, useApiMutation } from '../hooks/useApiQuery.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { useOrderNotifications } from '../hooks/useOrderNotifications.jsx';
import { getAllOrders, createOrder, updateOrderStatus } from '../api/orderApi.jsx';
import { getAllEmployees, getEmployeeForUser } from '../api/employeeApi.jsx';
import ToastContainer from '../components/common/Toast/ToastContainer.jsx';
import OrderNotificationToast from '../components/common/OrderNotificationToast/index.jsx';
import OrderReceiptModal from '../features/orders/OrderReceiptModal.jsx';
import { ORDER_STATUS } from '../utils/constants.jsx';
import Card from '../components/common/Card/index.jsx';
import Button from '../components/common/Button/index.jsx';
import StatusFilter from '../features/orders/StatusFilter.jsx';
import OrdersTable from '../features/orders/OrdersTable.jsx';
import NewOrderModal from '../features/orders/NewOrderModal.jsx';
import DateRangePicker from '../components/common/DateRangePicker/index.jsx';
import SearchableSelect from '../components/common/SearchableSelect/index.jsx';
import { formatCurrency } from '../utils/formatters.jsx';
import { ShoppingCart } from '@phosphor-icons/react';
import './OrdersPage.css';

const OrdersPage = () => {
  const { user, hasAnyRole } = useAuth();
  const toast = useToast();
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('ALL');
  const [sortField, setSortField] = useState('orderDate');
  const [sortDir, setSortDir] = useState('DESC');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  
  // Receipt modal state
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  
  // Real-time order notification state
  const [newOrderNotification, setNewOrderNotification] = useState(null);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  
  // Fetch data (Spring Pageable expects sort=field,direction)
  const { data: ordersData, loading: ordersLoading, refetch: refetchOrders } = useApiQuery(
    getAllOrders, 
    { 
      page: currentPage, 
      size: pageSize,
      status: activeStatus === 'ALL' ? undefined : activeStatus,
      userId: selectedEmployee === 'ALL' ? undefined : selectedEmployee,
      startDate: startDate ? `${startDate}T00:00:00` : undefined,
      endDate: endDate ? `${endDate}T23:59:59` : undefined,
      sort: `${sortField},${sortDir.toLowerCase()}`
    }, 
    [currentPage, pageSize, activeStatus, selectedEmployee, sortField, sortDir, startDate, endDate]
  );

  // Lightweight meta queries for counts by status (size=1 to get totalElements)
  const { data: pendingMeta } = useApiQuery(
    getAllOrders,
    { page: 0, size: 1, status: ORDER_STATUS.PENDING },
    [],
    { enabled: true }
  );
  const { data: completedMeta } = useApiQuery(
    getAllOrders,
    { page: 0, size: 1, status: ORDER_STATUS.COMPLETED },
    [],
    { enabled: true }
  );
  const { data: cancelledMeta } = useApiQuery(
    getAllOrders,
    { page: 0, size: 1, status: ORDER_STATUS.CANCELLED },
    [],
    { enabled: true }
  );

  // Reset pagination when filters changes (not on sort change)
  React.useEffect(() => {
    setCurrentPage(0);
  }, [activeStatus]);
  
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
  
  // Debug logging
  React.useEffect(() => {
    console.log('OrdersPage - ordersData:', ordersData);
    console.log('OrdersPage - orders array:', orders);
    console.log('OrdersPage - totalOrders:', totalOrders);
  }, [ordersData, orders, totalOrders]);

  // Only fetch employees if user has ADMIN or MANAGER role
  const hasEmployeeAccess = hasAnyRole(['ADMIN', 'MANAGER']);
  const { data: employees } = useApiQuery(
    getAllEmployees,
    {},
    [],
    { enabled: hasEmployeeAccess }
  );
  const { mutate: createOrderMutation, loading: creating } = useApiMutation(createOrder);
  const { mutate: updateStatusMutation } = useApiMutation(updateOrderStatus);

  // Calculate order counts by status
  const orderCounts = useMemo(() => {
    const countsFromPage = {
      [ORDER_STATUS.PENDING]: 0,
      [ORDER_STATUS.COMPLETED]: 0,
      [ORDER_STATUS.CANCELLED]: 0
    };
    (orders || []).forEach((order) => {
      if (countsFromPage[order.status] !== undefined) countsFromPage[order.status]++;
    });

    return {
      ALL: totalOrders, // use server total across all pages
      [ORDER_STATUS.PENDING]: pendingMeta?.totalElements ?? countsFromPage[ORDER_STATUS.PENDING] ?? 0,
      [ORDER_STATUS.COMPLETED]: completedMeta?.totalElements ?? countsFromPage[ORDER_STATUS.COMPLETED] ?? 0,
      [ORDER_STATUS.CANCELLED]: cancelledMeta?.totalElements ?? countsFromPage[ORDER_STATUS.CANCELLED] ?? 0
    };
  }, [orders, totalOrders, pendingMeta, completedMeta, cancelledMeta]);

  // No more local filtering - we let the backend handle it for correct pagination
  const filteredOrders = orders;
  
  const handleClearFilters = () => {
    setSelectedEmployee('ALL');
    setStartDate('');
    setEndDate('');
    setSortField('orderDate');
    setSortDir('DESC');
    setCurrentPage(0);
  };

  const handleCreateOrder = async (orderData) => {
    try {
      // Get current user's employee ID
      let currentEmployee = employees?.find(emp => emp.userId === user?.id);

      // If we couldn't find it in the employees list (or list was not accessible), try a dedicated API helper
      if (!currentEmployee) {
        try {
          currentEmployee = await getEmployeeForUser(user);
        } catch (err) {
          // Distinguish permission problem vs missing profile
          const msg = err.message && /not found/i.test(err.message) ?
            'Could not find employee profile for current user' :
            'Unable to resolve employee profile (possible permission issue)';
          toast.error(msg);
          console.error('Employee resolution error:', err);
          return;
        }
      }

      const requestData = {
        userId: user?.id,
        items: orderData.orderItems.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          comboId: item.comboId,
          quantity: item.quantity,
          type: item.type,
          price: item.price 
        })),
        promotionId: orderData.promotionId,
        employeeName: orderData.employeeName,
        totalAmount: orderData.totalAmount || orderData.finalTotal,
        note: orderData.notes || ''
      };

      const createdOrder = await createOrderMutation(requestData);
      toast.success('Order created successfully!');
      setIsModalOpen(false);
      refetchOrders();
      // Show receipt modal
      setReceiptOrder(createdOrder || requestData);
      setIsReceiptOpen(true);
    } catch (err) {
      console.error("Error creating order:", err);
      let errorMsg = err.message || 'Operation failed';
      
      // Try to parse JSON error message if it looks like one (from Saga/Feign)
      if (errorMsg.includes(':[{') || errorMsg.includes(':[ {"')) {
        try {
          const jsonPart = errorMsg.substring(errorMsg.indexOf('['));
          const parsed = JSON.parse(jsonPart);
          if (Array.isArray(parsed) && parsed[0]?.message) {
            errorMsg = parsed[0].message;
          } else if (parsed?.message) {
            errorMsg = parsed.message;
          }
        } catch (e) {
          // Fallback to extraction via regex or string slice if JSON.parse fails
          const match = errorMsg.match(/"message":"([^"]+)"/);
          if (match && match[1]) errorMsg = match[1];
        }
      }

      toast.error('Failed to create order: ' + errorMsg);
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
        <div className="page-header-content">
          <ShoppingCart size={32} weight="thin" className="page-header-icon" />
          <div>
            <h1 className="page-title">Orders Management</h1>
            <p className="page-subtitle">View and manage customer orders</p>
          </div>
        </div>
        <div className="page-header-actions">
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            + Create Order
          </Button>
        </div>
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
              {/* Only show employee filter for ADMIN/MANAGER users */}
              {hasEmployeeAccess && (
                <div className="filter-group">
                  <label>Employee</label>
                  <SearchableSelect
                    options={employees?.map(emp => ({ value: emp.userId, label: `${emp.firstName} ${emp.lastName}` })) || []}
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    placeholder="All Employees"
                    clearLabel="All Employees"
                  />
                </div>
              )}

                <div className="filter-group">
                  <label>Sort By (Quick)</label>
                  <select
                    value={sortField === 'totalAmount' ? (sortDir === 'ASC' ? 'amount-asc' : 'amount-desc') : 'date'}
                    onChange={(e) => {
                      if (e.target.value === 'date') {
                        setSortField('orderDate');
                        setSortDir('DESC');
                      } else if (e.target.value === 'amount-asc') {
                        setSortField('totalAmount');
                        setSortDir('ASC');
                      } else {
                        setSortField('totalAmount');
                        setSortDir('DESC');
                      }
                    }}
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
                onChange={(start, end) => {
                  setStartDate(start ? new Date(start).toISOString().split('T')[0] : '');
                  setEndDate(end ? new Date(end).toISOString().split('T')[0] : '');
                }}
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
          sortField={sortField}
          sortDir={sortDir}
          onSort={(field) => {
            if (sortField === field) {
              setSortDir(sortDir === 'ASC' ? 'DESC' : 'ASC');
            } else {
              setSortField(field);
              setSortDir('DESC');
            }
          }}
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
      
      <OrderReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => { setIsReceiptOpen(false); setReceiptOrder(null); }}
        order={receiptOrder}
        cashierName={user?.fullName || user?.username}
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
