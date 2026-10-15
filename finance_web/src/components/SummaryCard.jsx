import React from 'react';
import './SummaryCard.css';

export const SummaryCard = ({
  title,
  amount,
  subtitle,
  icon: Icon,
  color = 'blue',
  prefix = '₹',
}) => {
  const renderFormattedAmount = () => {
    if (typeof amount === 'number') {
      const isNegative = amount < 0;
      const absVal = Math.abs(amount);
      const [intPart, decPart] = absVal.toFixed(2).split('.');
      const formattedInt = Number(intPart).toLocaleString('en-IN');

      return (
        <div className="summary-amount-row">
          {prefix && (
            <span className="summary-amount-prefix">
              {isNegative ? `-${prefix}` : prefix}
            </span>
          )}
          <span className="summary-amount-int">
            {!prefix && isNegative ? `-${formattedInt}` : formattedInt}
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
