import { CurrencyConfig, defaultCurrencyConfig } from './utils';

export const createPriceFormatter = (config: CurrencyConfig = defaultCurrencyConfig) => {
  const safeConfig = {
    currency: config?.currency || defaultCurrencyConfig.currency,
    locale: config?.locale || defaultCurrencyConfig.locale
  };

  return {
    format: (value: number) => {
      return new Intl.NumberFormat(safeConfig.locale, {
        style: 'currency',
        currency: safeConfig.currency
      }).format(value);
    },
    
    formatWithoutCurrency: (value: number) => {
      return new Intl.NumberFormat(safeConfig.locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    },

    getCurrencySymbol: () => {
      return new Intl.NumberFormat(safeConfig.locale, {
        style: 'currency',
        currency: safeConfig.currency
      })
        .formatToParts(0)
        .find(part => part.type === 'currency')?.value || '$';
    }
  };
};
