import React, { useState, useMemo } from 'react';
import { useApiQuery } from '../hooks/useApiQuery.jsx';
import { getAllOrders } from '../api/orderApi.jsx';
import { getAllEmployees } from '../api/employeeApi.jsx';
import { ORDER_STATUS } from '../utils/constants.jsx';
import Card from '../components/common/Card/index.jsx';
import Button from '../components/common/Button/index.jsx';
import StatusFilter from '../features/orders/StatusFilter.jsx';
import OrdersTable from '../features/orders/OrdersTable.jsx';
import NewOrderModal from '../features/orders/NewOrderModal.jsx';
import DateRangePicker from '../components/common/DateRangePicker/index.jsx';
import './OrdersPage.css';

const OrdersPage = () => {
  const [activeStatus, setActiveStatus] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('ALL');
  const [sortBy, setSortBy] = useState('date'); // date, amount-asc, amount-desc
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const { data: orders, loading } = useApiQuery(getAllOrders, {}, []);
  const { data: employees } = useApiQuery(getAllEmployees, {}, []);

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
  };

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
