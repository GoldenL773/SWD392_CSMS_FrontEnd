import React from 'react';
import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, LabelList, Cell } from 'recharts';
import { formatCurrency } from '../../utils/formatters.jsx';

// Colors: positive (revenue) green, negatives red, total blue
const COLORS = {
  revenue: '#10b981',
  negative: '#ef4444',
  total: '#3b82f6'
};

// Label renderer showing currency above bars
const CurrencyLabel = (props) => {
  const { x, y, width, value } = props;
  if (value == null) return null;
  const posX = (x || 0) + (width || 0) / 2;
  const posY = (y || 0) - 6;
  return (
    <text x={posX} y={posY} textAnchor="middle" fill="#e5e7eb" fontSize={12}>
      {formatCurrency(Number(value) || 0)}
    </text>
  );
};

// Props:
// - data: [{name:'COGS (Ingredients)', value}, {name:'Labor Cost', value}, {name:'Net Profit', value?}]
// - revenue: total revenue number
// - loading: boolean
const FinancialBreakdownChart = ({ data = [], revenue = 0, loading = false }) => {
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div className="spinner" />
      </div>
    );
  }

  const cogs = Number(data?.[0]?.value) || 0;
  const labor = Number(data?.[1]?.value) || 0;
  const netFromProp = Number(data?.[2]?.value);
  const net = isNaN(netFromProp) ? (Number(revenue) - cogs - labor) : netFromProp;

  // Empty state
  if (!revenue && !cogs && !labor) {
    return (
      <div className="empty-state" style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>No data available for the selected period</p>
      </div>
    );
  }

  // Build waterfall with base + delta to emulate waterfall in Recharts
  const waterfallData = [
    { name: 'Total Revenue', base: 0, delta: revenue, color: COLORS.revenue },
    { name: 'COGS', base: revenue, delta: -cogs, color: COLORS.negative },
    { name: 'Labor', base: revenue - cogs, delta: -labor, color: COLORS.negative },
    { name: 'Net Profit', base: 0, delta: net, color: COLORS.total },
  ];

  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <ComposedChart data={waterfallData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="category" dataKey="name" />
          <YAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
          <Tooltip formatter={(v) => formatCurrency(v)} />
          <Legend />
          {/* Invisible base bar for positioning */}
          <Bar dataKey="base" stackId="a" fill="transparent" />
          {/* Delta bar with per-bar color and currency labels */}
          <Bar dataKey="delta" stackId="a" name="Amount">
            <LabelList dataKey="delta" content={<CurrencyLabel />} />
            {waterfallData.map((entry, idx) => (
              <Cell key={`wf-cell-${idx}`} fill={entry.color} />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinancialBreakdownChart;
