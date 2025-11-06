import React, { useState } from 'react';
import { useApiQuery } from '../hooks/useApiQuery.tsx';
import { getDailyReports, getIngredientTransactions } from '../api/reportApi.tsx';
import Card from '../components/common/Card/index.tsx';
import RevenueChart from '../features/reports/RevenueChart.tsx';
import TransactionTable from '../features/reports/TransactionTable.tsx';
import { formatCurrency, formatNumber } from '../utils/formatters.tsx';
import './ReportsPage.css';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('revenue');
  
  const { data: reports, loading: reportsLoading } = useApiQuery(getDailyReports, {}, []);
  const { data: transactions, loading: transactionsLoading } = useApiQuery(getIngredientTransactions, {}, []);

  // Calculate summary stats
  const stats = React.useMemo(() => {
    if (!reports || reports.length === 0) {
      return { totalRevenue: 0, totalOrders: 0, totalCost: 0, avgRevenue: 0 };
    }

    const totalRevenue = reports.reduce((sum, r) => sum + r.totalRevenue, 0);
    const totalOrders = reports.reduce((sum, r) => sum + r.totalOrders, 0);
    const totalCost = reports.reduce((sum, r) => sum + r.totalIngredientCost, 0);
    const avgRevenue = totalRevenue / reports.length;

    return { totalRevenue, totalOrders, totalCost, avgRevenue };
  }, [reports]);

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1>Reports & Analytics</h1>
        <p>View business performance and transaction history</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{formatNumber(stats.totalOrders)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Cost</div>
          <div className="stat-value">{formatCurrency(stats.totalCost)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Revenue/Day</div>
          <div className="stat-value">{formatCurrency(stats.avgRevenue)}</div>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'revenue' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('revenue')}
        >
          Revenue Chart
        </button>
        <button
          className={`tab ${activeTab === 'transactions' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
      </div>

      {activeTab === 'revenue' && (
        <Card title="Daily Revenue" subtitle="Last 7 days performance">
          {reportsLoading ? (
            <div className="loading-container">
              <div className="loading"></div>
              <p>Loading reports...</p>
            </div>
          ) : (
            <RevenueChart reports={reports || []} />
          )}
        </Card>
      )}

      {activeTab === 'transactions' && (
        <Card title="Ingredient Transactions" subtitle="Import and export history">
          <TransactionTable
            transactions={transactions || []}
            loading={transactionsLoading}
          />
        </Card>
      )}
    </div>
  );
};

export default ReportsPage;
