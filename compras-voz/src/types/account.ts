export type AccountType = 'bank' | 'credit_card';
export type Currency = 'USD' | 'UYU';

export interface Account {
  id?: number;
  name: string;
  type: AccountType;
  currency: Currency;
  initialBalance: number;
  month: string; // YYYY-MM
}

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  bank: 'Banco',
  credit_card: 'Tarjeta de crédito',
};

export const CURRENCY_LABELS: Record<Currency, string> = {  
  USD: 'Dólares',
  UYU: 'Pesos uru.',
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {  
  USD: 'U$S',
  UYU: '$U',
};
