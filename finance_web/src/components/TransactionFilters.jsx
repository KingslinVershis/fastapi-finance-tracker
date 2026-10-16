import React, { useState, useEffect } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import CustomSelect from './CustomSelect';
import './TransactionFilters.css';

export const TransactionFilters = ({
  filters,
  onChange,
  onReset,
  categories = [],
}) => {
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  useEffect(() => {
    setLocalSearch(filters.search || '');
  }, [filters.search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (filters.search || '')) {
        handleChange('search', localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch]);

  const handleChange = (field, value) => {
    const nextFilters = { ...filters, [field]: value, page: 1 };
    if (field === 'type' && value && nextFilters.category_id) {
      const selectedCat = categories.find((c) => String(c.id) === String(nextFilters.category_id));
      if (selectedCat && selectedCat.type !== value) {
        nextFilters.category_id = '';
      }
    }
    onChange(nextFilters);
  };

  const handleReset = () => {
    setLocalSearch('');
    onReset();
  };

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' },
  ];

  const filteredCategories = categories.filter((c) => {
    if (!filters.type) return true;
    return c.type === filters.type;
  });

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...filteredCategories.map((c) => ({
      value: String(c.id),
      label: filters.type ? c.name : `${c.name} (${c.type === 'income' ? 'Income' : 'Expense'})`,
    })),
  ];

  const sortOptions = [
    { value: 'date_desc', label: 'Newest First' },
    { value: 'date_asc', label: 'Oldest First' },
    { value: 'amount_desc', label: 'Highest Amount' },
    { value: 'amount_asc', label: 'Lowest Amount' },
  ];

  const getPresetDates = (preset) => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const toYMD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (preset === 'this_month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start_date: toYMD(start), end_date: toYMD(end) };
    }
    if (preset === 'last_30_days') {
      const start = new Date();
      start.setDate(now.getDate() - 30);
      return { start_date: toYMD(start), end_date: toYMD(now) };
    }
    if (preset === 'last_month') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start_date: toYMD(start), end_date: toYMD(end) };
    }
    if (preset === 'this_year') {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31);
      return { start_date: toYMD(start), end_date: toYMD(end) };
    }
    return { start_date: '', end_date: '' };
  };

  const presetList = [
    { id: 'all', label: 'All Time' },
    { id: 'this_month', label: 'This Month' },
    { id: 'last_30_days', label: 'Last 30 Days' },
    { id: 'last_month', label: 'Last Month' },
    { id: 'this_year', label: 'This Year' },
  ];

  const getCurrentPresetId = () => {
    if (!filters.start_date && !filters.end_date) return 'all';
    for (const p of presetList) {
      if (p.id === 'all') continue;
      const dates = getPresetDates(p.id);
      if (dates.start_date === filters.start_date && dates.end_date === filters.end_date) {
        return p.id;
      }
    }
    return null;
  };

  const activePreset = getCurrentPresetId();

  const handlePresetClick = (presetId) => {
    const dates = getPresetDates(presetId);
    onChange({
      ...filters,
      start_date: dates.start_date,
      end_date: dates.end_date,
      page: 1,
    });
  };

  return (
    <div className="card tx-filters-card">
      {/* Date Range Presets */}
      <div className="tx-presets-row" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Date Range:
        </span>
        {presetList.map((preset) => {
          const isActive = activePreset === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePresetClick(preset.id)}
              className="preset-pill-btn"
              style={{
                fontSize: '0.75rem',
                fontWeight: isActive ? 600 : 500,
                padding: '0.25rem 0.65rem',
                borderRadius: '0.5rem',
                border: '1px solid',
                borderColor: isActive ? '#3b82f6' : 'var(--border-color)',
                backgroundColor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-elevated)',
                color: isActive ? '#60a5fa' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      <div className="tx-filters-grid">
        {/* Search */}
        <div className="tx-filters-search-col">
          <label className="form-label">Search Description, Category, Amount</label>
          <div className="input-icon-wrap">
            <Search size={15} className="input-icon" />
            <input
              type="text"
              placeholder="Search..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <label className="form-label">Type</label>
          <CustomSelect
            value={filters.type || ''}
            onChange={(val) => handleChange('type', val)}
            options={typeOptions}
            placeholder="All Types"
          />
        </div>

        {/* Category Filter */}
        <div>
          <label className="form-label">Category</label>
          <CustomSelect
            value={filters.category_id ? String(filters.category_id) : ''}
            onChange={(val) => handleChange('category_id', val)}
            options={categoryOptions}
            placeholder="All Categories"
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="form-label">Start Date</label>
          <input
            type="date"
            value={filters.start_date || ''}
            onChange={(e) => handleChange('start_date', e.target.value)}
            className="form-input"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="form-label">End Date</label>
          <input
            type="date"
            value={filters.end_date || ''}
            onChange={(e) => handleChange('end_date', e.target.value)}
            className="form-input"
          />
        </div>

        {/* Sort */}
        <div>
          <label className="form-label">Sort By</label>
          <CustomSelect
            value={filters.sort || 'date_desc'}
            onChange={(val) => handleChange('sort', val)}
            options={sortOptions}
            placeholder="Newest First"
          />
        </div>

        {/* Reset */}
        <div>
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-secondary tx-filters-reset-btn"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionFilters;
