export type AccountType = 'bank' | 'credit_card';

export interface Account {
  id?: number;
  name: string;
  type: AccountType;
  initialBalance: number;
  month: string; // YYYY-MM
}

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  bank: '🏦 Banco',
  credit_card: '💳 Tarjeta de crédito',
};
