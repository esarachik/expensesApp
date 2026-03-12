import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type { AccountType } from '../types/account';
import type { TransactionType } from '../types/transaction';

// ─── Cuentas bancarias y tarjetas ───────────────────────────────────────────
export const accounts = sqliteTable('accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type').$type<AccountType>().notNull(), // 'bank' | 'credit_card'
  initialBalance: real('initialBalance').notNull().default(0),
  month: text('month').notNull(), // YYYY-MM: mes al que pertenece este saldo inicial
});

// ─── Categorías ─────────────────────────────────────────────────────────────
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type').$type<TransactionType>().notNull(), // 'ingreso' | 'egreso'
});

// ─── Transacciones ──────────────────────────────────────────────────────────
export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  amount: real('amount').notNull(),
  type: text('type').$type<TransactionType>().notNull(),
  category: text('category').notNull().default(''),
  description: text('description').notNull().default(''),
  originalText: text('originalText').notNull().default(''),
  accountId: integer('accountId').references(() => accounts.id),
});
