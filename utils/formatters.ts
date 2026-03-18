
import { CurrencyType } from '../types';

/**
 * EMPIRION FINANCIAL LOCALIZATION PROTOCOL v1.2
 * Suporte dinâmico para expansão global de moedas e idiomas.
 */

const CURRENCY_LOCALE_MAP: Record<string, string> = {
  'BRL': 'pt-BR',
  'EUR': 'de-DE',
  'USD': 'en-US',
  'CNY': 'zh-CN',
  'GBP': 'en-GB',
  'BTC': 'en-US'
};

export const formatCurrency = (value: number, currency: CurrencyType = 'BRL', showSymbol: boolean = true, fractionDigits: number = 2): string => {
  const locale = CURRENCY_LOCALE_MAP[currency] || 'en-US';
  
  // Tratamento especial para Criptoativos (8 casas decimais por padrão)
  if (currency === 'BTC') {
    const formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: Math.max(8, fractionDigits),
      maximumFractionDigits: Math.max(8, fractionDigits),
    });
    return showSymbol ? `₿ ${formatter.format(value)}` : formatter.format(value);
  }

  // Padrão Fiat
  return new Intl.NumberFormat(locale, {
    style: showSymbol ? 'currency' : 'decimal',
    currency: currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
};

export const getCurrencySymbol = (currency: CurrencyType = 'BRL'): string => {
  if (currency === 'BTC') return '₿';
  const locale = CURRENCY_LOCALE_MAP[currency] || 'en-US';
  try {
    return (0).toLocaleString(locale, { 
      style: 'currency', 
      currency: currency, 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).replace(/\d/g, '').trim();
  } catch (e) {
    return '$'; // Fallback universal
  }
};
