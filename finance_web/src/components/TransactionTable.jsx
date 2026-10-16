import React from 'react';
import {
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Briefcase,
  ShoppingBag,
  Car,
  Utensils,
  Receipt,
  CreditCard,
  Plus,
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import './TransactionTable.css';

const getLedgerMeta = (tx) => {
  const isIncome = tx.type === 'income';
  const cat = (tx.category_name || '').toLowerCase();
  if (isIncome) {
    return {
      icon: Briefcase,
      tone: 'amber',
      defaultTitle: 'Monthly Payroll Credit',
      subText: `Direct Deposit #TX-${9000 + Number(tx.id || 21)}`,
    };
  }
  if (cat.includes('shop')) {
    return {
      icon: ShoppingBag,
      tone: 'blue',
      defaultTitle: 'Retail Purchase',
      subText: 'POS • Visa Debit Card',
    };
  }
  if (cat.includes('transport')) {
    return {
      icon: Car,
      tone: 'emerald',
      defaultTitle: 'Metro / Transit Ride',
      subText: 'Tap-and-Go NFC',
    };
  }
  if (cat.includes('food')) {
    return {
      icon: Utensils,
      tone: 'yellow',
      defaultTitle: 'Dining & Groceries',
      subText: 'UPI Verified Merchant',
    };
  }
  if (cat.includes('bill')) {
    return {
      icon: Receipt,
      tone: 'purple',
      defaultTitle: 'Utility Bill Settlement',
      subText: 'Auto-Pay Standing Instruction',
    };
  }
  return {
    icon: CreditCard,
    tone: 'slate',
    defaultTitle: 'Ledger Entry',
    subText: `UPI Ref #TX-${9000 + Number(tx.id || 10)}`,
  };
};

export const TransactionTable = ({
  transactions = [],
  onEdit,
  onDelete,
  showActions = true,
  hasActiveFilters = false,
  onResetFilters,
  onAddTransaction,
}) => {
  const { symbol, activeCurrency } = useCurrency();

  if (!transactions || transactions.length === 0) {
    return (
      <div className="tx-empty-state-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '1rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <Receipt size={28} />
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
          {hasActiveFilters ? 'No matching transactions found' : 'No transactions recorded yet'}
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
          {hasActiveFilters
            ? 'No records match your selected filters. Try adjusting your search query, category, or date range.'
            : 'Start building your financial ledger by recording your income credits or daily expense purchases.'}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {hasActiveFilters && onResetFilters && (
            <button type="button" onClick={onResetFilters} className="btn btn-secondary">
              Reset Filters
            </button>
          )}
          {onAddTransaction && (
            <button type="button" onClick={onAddTransaction} className="btn btn-primary">
              <Plus size={15} />
              <span>Add Transaction</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(activeCurrency.locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>TYPE</th>
            <th>DESCRIPTION</th>
            <th>CATEGORY</th>
            <th>DATE</th>
            <th className="col-right">AMOUNT</th>
            {showActions && <th className="col-center">ACTIONS</th>}
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => {
            const isIncome = tx.type === 'income';
            const meta = getLedgerMeta(tx);
            const IconComp = meta.icon;

            return (
              <tr key={tx.id}>
                <td>
                  <span className={`badge ${isIncome ? 'badge-income' : 'badge-expense'}`}>
                    {isIncome ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                    {isIncome ? 'Income' : 'Expense'}
                  </span>
                </td>
                <td>
                  <div className="tx-desc-cell">
                    <div className={`tx-icon-box ${meta.tone}`}>
                      <IconComp size={15} />
                    </div>
                    <div>
                      <div className="tx-title">{tx.description || meta.defaultTitle}</div>
                      <div className="tx-subtext">{meta.subText}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="tx-category-pill">{tx.category_name || 'General'}</span>
                </td>
                <td className="font-mono tx-date-cell">{formatDate(tx.transaction_date)}</td>
                <td
                  className={`font-mono col-right ${
                    isIncome ? 'val-income' : 'val-expense'
                  }`}
                >
                  {isIncome ? '+' : '-'}{symbol}
                  {Number(tx.amount).toLocaleString(activeCurrency.locale, { minimumFractionDigits: 2 })}
                </td>
                {showActions && (
                  <td className="col-center">
                    <div className="tx-actions-group">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(tx)}
                          title="Edit transaction"
                          className="icon-btn edit"
                        >
                          <Edit2 size={15} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(tx.id)}
                          title="Delete transaction"
                          className="icon-btn delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
