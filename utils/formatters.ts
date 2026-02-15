
import { CurrencyType } from '../types';

/**
 * EMPIRION FINANCIAL LOCALIZATION PROTOCOL v1.0
 * Mapeia moedas para seus respectivos padrões de separadores decimais e de milhar.
 */

const CURRENCY_LOCALE_MAP: Record<CurrencyType, string> = {
  'BRL': 'pt-BR',
  'EUR': 'de-DE',
  'USD': 'en-US',
  'CNY': 'zh-CN',
  'GBP': 'en-GB',
  'BTC': 'en-US' // Padrão técnico internacional
};

export const formatCurrency = (value: number, currency: CurrencyType = 'BRL', showSymbol: boolean = true): string => {
  const locale = CURRENCY_LOCALE_MAP[currency] || 'pt-BR';
  return new Intl.NumberFormat(locale, {
    style: showSymbol ? 'currency' : 'decimal',
    currency: currency === 'BTC' ? 'USD' : currency, // Fallback para BTC display
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value).replace('US$', showSymbol && currency === 'BTC' ? '₿' : '$');
};

export const getCurrencySymbol = (currency: CurrencyType = 'BRL'): string => {
  const locale = CURRENCY_LOCALE_MAP[currency] || 'pt-BR';
  return (0).toLocaleString(locale, { style: 'currency', currency: currency === 'BTC' ? 'USD' : currency, minimumFractionDigits: 0, maximumFractionDigits: 0 })
    .replace(/\d/g, '').trim()
    .replace('US$', currency === 'BTC' ? '₿' : '$');
};
