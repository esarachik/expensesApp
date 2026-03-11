export type TransactionType = 'ingreso' | 'egreso';

export interface Transaction {
  
  id?: number;
  
  date: string;
  
  amount: number;

  type: TransactionType;

  category: string;

  description: string;

  originalText: string;

  accountId?: number | null;
}
