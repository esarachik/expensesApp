import type { TransactionType } from './transaction';

export interface Category {
  id?: number;
  name: string;
  type: TransactionType; // 'ingreso' | 'egreso'
}
