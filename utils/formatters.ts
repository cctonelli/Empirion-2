
import { CurrencyType } from '../types';

/**
 * EMPIRION FINANCIAL LOCALIZATION PROTOCOL v1.1
 */

const CURRENCY_LOCALE_MAP: Record<CurrencyType, string> = {
  'BRL': 'pt-BR',
  'EUR': 'de-DE',
  'USD': 'en-US',
  'CNY': 'zh-CN',
  'GBP': 'en-GB',
  'BTC': 'en-US'
};

export const formatCurrency = (value: number, currency: CurrencyType = 'BRL', showSymbol: boolean = true): string => {
  const locale = CURRENCY_LOCALE_MAP[currency] || 'pt-BR';
  
  if (currency === 'BTC') {
    const formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 8,
      maximumFractionDigits: 8,
    });
    return showSymbol ? `₿ ${formatter.format(value)}` : formatter.format(value);
  }

  return new Intl.NumberFormat(locale, {
    style: showSymbol ? 'currency' : 'decimal',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const getCurrencySymbol = (currency: CurrencyType = 'BRL'): string => {
  if (currency === 'BTC') return '₿';
  const locale = CURRENCY_LOCALE_MAP[currency] || 'pt-BR';
  return (0).toLocaleString(locale, { 
    style: 'currency', 
    currency: currency, 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  }).replace(/\d/g, '').trim();
};
