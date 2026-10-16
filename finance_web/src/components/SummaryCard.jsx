import React from 'react';
import { useCurrency } from '../context/CurrencyContext';
import './SummaryCard.css';

export const SummaryCard = ({
  title,
  amount,
  subtitle,
  icon: Icon,
  color = 'blue',
  prefix,
}) => {
  const { symbol, activeCurrency } = useCurrency();
  const effectivePrefix = prefix !== undefined ? prefix : symbol;

  const renderFormattedAmount = () => {
    if (typeof amount === 'number') {
      const isNegative = amount < 0;
      const absVal = Math.abs(amount);
      const [intPart, decPart] = absVal.toFixed(2).split('.');
      const formattedInt = Number(intPart).toLocaleString(activeCurrency.locale);

      return (
        <div className="summary-amount-row">
          {effectivePrefix && (
            <span className="summary-amount-prefix">
              {isNegative ? `-${effectivePrefix}` : effectivePrefix}
            </span>
          )}
          <span className="summary-amount-int">
            {!effectivePrefix && isNegative ? `-${formattedInt}` : formattedInt}
          </span>
          <span className="font-mono summary-amount-dec">.{decPart}</span>
        </div>
      );
    }

    const strAmount = String(amount);
    if (strAmount.endsWith('%')) {
      const numPart = strAmount.slice(0, -1);
      return (
        <div className="summary-amount-row">
          <span className="summary-amount-int">{numPart}</span>
          <span className="font-mono summary-amount-suffix">%</span>
        </div>
      );
    }

    return (
      <div className="summary-amount-int">
        {prefix}
        {amount}
      </div>
    );
  };

  return (
    <div className="card summary-card">
      <div>
        <div className="summary-card-top">
          <span className="summary-card-title">{title}</span>
          {Icon && (
            <div className={`summary-card-icon ${color}`}>
              <Icon size={16} />
            </div>
          )}
        </div>

        <div>
          {renderFormattedAmount()}
          {subtitle && <span className="summary-subtitle">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
