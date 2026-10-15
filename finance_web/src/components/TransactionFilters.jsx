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

  return (
    <div className="card tx-filters-card">
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
