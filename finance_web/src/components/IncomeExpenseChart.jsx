import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useCurrency } from '../context/CurrencyContext';
import './Charts.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const IncomeExpenseChart = ({ data = [] }) => {
  const { symbol, activeCurrency } = useCurrency();
  if (!data || data.length === 0) {
    return <div className="chart-empty-state">No trend data available</div>;
  }

  const labels = data.map((d) => d.month_name || d.month);
  const incomeValues = data.map((d) => Number(d.income));
  const expenseValues = data.map((d) => Number(d.expenses));

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Income',
        data: incomeValues,
        backgroundColor: '#10b981',
        hoverBackgroundColor: '#34d399',
        borderRadius: 6,
        maxBarThickness: 28,
      },
      {
        label: 'Expenses',
        data: expenseValues,
        backgroundColor: '#f43f5e',
        hoverBackgroundColor: '#fb7185',
        borderRadius: 6,
        maxBarThickness: 28,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0b111e',
        titleColor: '#94a3b8',
        titleFont: { family: 'JetBrains Mono', size: 10, weight: '700' },
        bodyFont: { family: 'JetBrains Mono', size: 12, weight: '600' },
        bodyColor: '#f8fafc',
        borderColor: '#1e293b',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (items) => {
            const label = items[0]?.label || '';
            return `${label.toUpperCase()} PERFORMANCE`;
          },
          label: (context) => {
            const isInc = context.dataset.label === 'Income';
            const sign = isInc ? '+' : '-';
            return `${sign}${symbol}${Number(context.raw).toLocaleString(activeCurrency.locale, { minimumFractionDigits: 2 })}`;
          },
          labelTextColor: (context) => {
            return context.dataset.label === 'Income' ? '#34d399' : '#fb7185';
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 11, weight: '500' },
        },
      },
      y: {
        grid: { color: 'rgba(30, 41, 59, 0.45)' },
        border: { display: false },
        ticks: {
          color: '#64748b',
          font: { family: 'JetBrains Mono', size: 11 },
          callback: (val) => `${symbol}${Number(val).toLocaleString(activeCurrency.locale)}`,
        },
      },
    },
  };

  return (
    <div className="chart-bar-container">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default IncomeExpenseChart;
