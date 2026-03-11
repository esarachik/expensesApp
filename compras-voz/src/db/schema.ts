import { sqliteTable, integer, real, text } from 'drizzle-orm/sqlite-core';
import type { TransactionType } from '../types/transaction';

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  amount: real('amount').notNull(),
  type: text('type').$type<TransactionType>().notNull(),
  category: text('category').notNull().default(''),
  description: text('description').notNull().default(''),
  originalText: text('originalText').notNull().default(''),
});
