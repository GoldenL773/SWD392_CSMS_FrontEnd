import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

const EmployeePerformanceChart = ({ data = [], loading = false }) => {
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div className="spinner" />
      </div>
    );
  }

  const safeData = Array.isArray(data) ? data.filter(d => d && !isNaN(d.value)) : [];

  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <BarChart data={safeData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tickFormatter={(v) => v.toLocaleString()} />
          <YAxis type="category" dataKey="name" width={120} />
          <Tooltip formatter={(v) => [v, 'AOV']} />
          <Legend />
          <Bar dataKey="value" name="Average Order Value" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmployeePerformanceChart;
