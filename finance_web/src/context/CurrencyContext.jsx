import React, { createContext, useContext, useState, useEffect } from 'react';

export const CURRENCIES = {
  INR: { code: 'INR', symbol: '₹', label: 'Indian Rupee', locale: 'en-IN' },
  USD: { code: 'USD', symbol: '$', label: 'US Dollar', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', label: 'Euro', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', label: 'British Pound', locale: 'en-GB' },
};

const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('finance_currency') || 'INR';
  });

  const activeCurrency = CURRENCIES[currency] || CURRENCIES.INR;

  useEffect(() => {
    localStorage.setItem('finance_currency', activeCurrency.code);
  }, [activeCurrency]);

  const setCurrency = (code) => {
    if (CURRENCIES[code]) {
      setCurrencyState(code);
    }
  };

  const formatAmount = (amount, decimals = 2) => {
    const num = Number(amount) || 0;
    return `${activeCurrency.symbol}${num.toLocaleString(activeCurrency.locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency: activeCurrency.code,
        symbol: activeCurrency.symbol,
        activeCurrency,
        currencies: CURRENCIES,
        setCurrency,
        formatAmount,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    return {
      currency: 'INR',
      symbol: '₹',
      activeCurrency: CURRENCIES.INR,
      currencies: CURRENCIES,
      setCurrency: () => {},
      formatAmount: (amount, decimals = 2) =>
        `₹${(Number(amount) || 0).toLocaleString('en-IN', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}`,
    };
  }
  return ctx;
};

export default CurrencyContext;

