/**
 * Supported global currencies and foreign exchange conversion constants
 * Reference Base: INR (₹)
 */

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  country: string;
  rateFromInr: number; // Foreign currency units per 1 INR (multiplier from base INR)
  rateToInr: number;   // INR units per 1 foreign currency
  locale: string;
  decimals: number;
  popular?: boolean;
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    flag: '🇮🇳',
    country: 'India',
    rateFromInr: 1.0,
    rateToInr: 1.0,
    locale: 'en-IN',
    decimals: 0,
    popular: true,
  },
  {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    country: 'United States',
    rateFromInr: 0.0119,
    rateToInr: 84.03,
    locale: 'en-US',
    decimals: 2,
    popular: true,
  },
  {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    country: 'European Union',
    rateFromInr: 0.0110,
    rateToInr: 90.91,
    locale: 'de-DE',
    decimals: 2,
    popular: true,
  },
  {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound Sterling',
    flag: '🇬🇧',
    country: 'United Kingdom',
    rateFromInr: 0.0094,
    rateToInr: 106.38,
    locale: 'en-GB',
    decimals: 2,
    popular: true,
  },
  {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    flag: '🇯🇵',
    country: 'Japan',
    rateFromInr: 1.84,
    rateToInr: 0.543,
    locale: 'ja-JP',
    decimals: 0,
    popular: true,
  },
  {
    code: 'AED',
    symbol: 'د.إ',
    name: 'UAE Dirham',
    flag: '🇦🇪',
    country: 'United Arab Emirates',
    rateFromInr: 0.0437,
    rateToInr: 22.88,
    locale: 'ar-AE',
    decimals: 2,
    popular: true,
  },
  {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    flag: '🇨🇦',
    country: 'Canada',
    rateFromInr: 0.0163,
    rateToInr: 61.35,
    locale: 'en-CA',
    decimals: 2,
    popular: true,
  },
  {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    flag: '🇦🇺',
    country: 'Australia',
    rateFromInr: 0.0182,
    rateToInr: 54.95,
    locale: 'en-AU',
    decimals: 2,
    popular: true,
  },
  {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    flag: '🇸🇬',
    country: 'Singapore',
    rateFromInr: 0.0160,
    rateToInr: 62.50,
    locale: 'en-SG',
    decimals: 2,
    popular: false,
  },
  {
    code: 'CHF',
    symbol: 'CHF',
    name: 'Swiss Franc',
    flag: '🇨🇭',
    country: 'Switzerland',
    rateFromInr: 0.0105,
    rateToInr: 95.24,
    locale: 'de-CH',
    decimals: 2,
    popular: false,
  },
  {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    flag: '🇨🇳',
    country: 'China',
    rateFromInr: 0.0862,
    rateToInr: 11.60,
    locale: 'zh-CN',
    decimals: 2,
    popular: false,
  },
  {
    code: 'SAR',
    symbol: '﷼',
    name: 'Saudi Riyal',
    flag: '🇸🇦',
    country: 'Saudi Arabia',
    rateFromInr: 0.0446,
    rateToInr: 22.42,
    locale: 'ar-SA',
    decimals: 2,
    popular: false,
  },
];

export const DEFAULT_CURRENCY_CODE = 'INR';

export function getCurrencyInfo(code?: string): CurrencyInfo {
  if (!code) return SUPPORTED_CURRENCIES[0];
  const found = SUPPORTED_CURRENCIES.find((c) => c.code.toUpperCase() === code.toUpperCase());
  return found || SUPPORTED_CURRENCIES[0];
}

export function convertFromBase(amountInBase: number, targetCode: string): number {
  const info = getCurrencyInfo(targetCode);
  return amountInBase * info.rateFromInr;
}

export function formatCurrencyValue(
  amount: number,
  currencyCode: string = 'INR',
  mode: 'symbol_only' | 'convert_fx' = 'symbol_only',
  overrideSymbol?: string
): string {
  const info = getCurrencyInfo(currencyCode);
  const symbol = overrideSymbol || info.symbol;

  const finalAmount = mode === 'convert_fx' ? amount * info.rateFromInr : amount;

  // Format with proper decimals and locale grouping
  const isZeroDecimals = info.decimals === 0 || mode === 'symbol_only';
  
  if (isZeroDecimals) {
    const rounded = Math.round(finalAmount);
    return `${symbol}${rounded.toLocaleString(info.locale || 'en-US')}`;
  }

  return `${symbol}${finalAmount.toLocaleString(info.locale || 'en-US', {
    minimumFractionDigits: info.decimals,
    maximumFractionDigits: info.decimals,
  })}`;
}
