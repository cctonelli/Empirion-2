
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
  // Garantir que o valor seja numérico e válido
  const numericValue = typeof value === 'number' && !isNaN(value) ? value : Number(value) || 0;

  // Normalizar símbolos e códigos comuns de moedas para os códigos ISO 4217 de 3 letras válidos
  let cleanCurrency = String(currency || 'BRL').trim().toUpperCase();
  if (cleanCurrency === '$') cleanCurrency = 'USD';
  else if (cleanCurrency === 'R$') cleanCurrency = 'BRL';
  else if (cleanCurrency === '€') cleanCurrency = 'EUR';
  else if (cleanCurrency === '£') cleanCurrency = 'GBP';

  // Verificar se o código normalizado é suportado nativamente pelo mapa de locales
  const isSupported = ['BRL', 'EUR', 'USD', 'CNY', 'GBP', 'BTC'].includes(cleanCurrency);
  const finalCurrency = isSupported ? cleanCurrency : 'BRL';

  const locale = CURRENCY_LOCALE_MAP[finalCurrency] || 'pt-BR';
  
  try {
    // Tratamento especial para Criptoativos (8 casas decimais por padrão)
    if (finalCurrency === 'BTC') {
      const formatter = new Intl.NumberFormat(locale, {
        minimumFractionDigits: Math.max(8, fractionDigits),
        maximumFractionDigits: Math.max(8, fractionDigits),
      });
      return showSymbol ? `₿ ${formatter.format(numericValue)}` : formatter.format(numericValue);
    }

    // Padrão Fiat
    return new Intl.NumberFormat(locale, {
      style: showSymbol ? 'currency' : 'decimal',
      currency: finalCurrency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(numericValue);
  } catch (e) {
    // Fallback de contingência caso ocorra alguma falha com Intl ou com o código da moeda
    try {
      const basicFormatter = new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      });
      const formattedNum = basicFormatter.format(numericValue);
      if (showSymbol) {
        const symbol = getCurrencySymbol(currency);
        return `${symbol} ${formattedNum}`;
      }
      return formattedNum;
    } catch (err) {
      return (showSymbol ? `${currency} ` : '') + numericValue.toFixed(fractionDigits);
    }
  }
};

export const getCurrencySymbol = (currency: CurrencyType = 'BRL'): string => {
  let cleanCurrency = String(currency || 'BRL').trim().toUpperCase();
  if (cleanCurrency === '$') return '$';
  if (cleanCurrency === 'R$') return 'R$';
  if (cleanCurrency === '€') return '€';
  if (cleanCurrency === '£') return '£';
  if (cleanCurrency === 'BTC') return '₿';

  const isSupported = ['BRL', 'EUR', 'USD', 'CNY', 'GBP', 'BTC'].includes(cleanCurrency);
  const finalCurrency = isSupported ? cleanCurrency : 'BRL';

  const locale = CURRENCY_LOCALE_MAP[finalCurrency] || 'pt-BR';
  try {
    return (0).toLocaleString(locale, { 
      style: 'currency', 
      currency: finalCurrency, 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    }).replace(/\d/g, '').trim();
  } catch (e) {
    return '$'; // Fallback universal em caso de erros de locale
  }
};
