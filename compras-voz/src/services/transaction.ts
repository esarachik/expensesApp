import { count, desc, eq, like, sql, sum } from 'drizzle-orm';
import { transactions } from '../db/schema';
import type { Transaction } from '../types/transaction';
import { db } from './db';

/** Inserta una transacción y devuelve el ID generado */
export async function insertTransaction(t: Transaction): Promise<number> {
  const { id, ...data } = t;
  const result = await db
    .insert(transactions)
    .values({ ...data, accountId: data.accountId ?? null })
    .returning({ id: transactions.id });
  return result[0].id;
}

/** Obtiene todas las transacciones ordenadas por fecha descendente */
export async function getAllTransactions(): Promise<Transaction[]> {
  return db
    .select()
    .from(transactions)
    .orderBy(desc(transactions.date), desc(transactions.id));
}

/** Obtiene transacciones filtradas por mes (formato: 'YYYY-MM') */
export async function getTransactionsByMonth(yearMonth: string): Promise<Transaction[]> {
  return db
    .select()
    .from(transactions)
    .where(like(transactions.date, `${yearMonth}%`))
    .orderBy(desc(transactions.date), desc(transactions.id));
}

/** Obtiene el resumen de totales por tipo para un mes dado */
export async function getMonthlySummary(yearMonth: string): Promise<{
  totalIngresos: number;
  totalEgresos: number;
  balance: number;
}> {
  const row = await db
    .select({
      totalIngresos: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'ingreso' THEN ${transactions.amount} ELSE 0 END), 0)`,
      totalEgresos: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'egreso' THEN ${transactions.amount} ELSE 0 END), 0)`,
    })
    .from(transactions)
    .where(like(transactions.date, `${yearMonth}%`));

  const totalIngresos = row[0]?.totalIngresos ?? 0;
  const totalEgresos = row[0]?.totalEgresos ?? 0;

  return { totalIngresos, totalEgresos, balance: totalIngresos - totalEgresos };
}

/** Devuelve los meses distintos con transacciones, en formato 'YYYY-MM', orden descendente */
export async function getAvailableMonths(): Promise<string[]> {
  const rows = await db
    .selectDistinct({
      month: sql<string>`strftime('%Y-%m', ${transactions.date})`,
    })
    .from(transactions)
    .orderBy(desc(sql`strftime('%Y-%m', ${transactions.date})`));
  return rows.map((r) => r.month);
}

/** Elimina una transacción por ID */
export async function deleteTransaction(id: number): Promise<void> {
  await db.delete(transactions).where(eq(transactions.id, id));
}

/** Actualiza una transacción existente por ID */
export async function updateTransaction(t: Transaction): Promise<void> {
  if (!t.id) {
    throw new Error('Falta el ID de la transacción');
  }

  const { id, ...data } = t;
  await db
    .update(transactions)
    .set({
      ...data,
      accountId: data.accountId ?? null,
    })
    .where(eq(transactions.id, id));
}

/** Obtiene el total de gastos por categoría para un mes dado */
export async function getCategoryBreakdown(
  yearMonth: string,
): Promise<Array<{ category: string; total: number; count: number }>> {
  return db
    .select({
      category: transactions.category,
      total: sum(transactions.amount).mapWith(Number),
      count: count(),
    })
    .from(transactions)
    .where(
      sql`${transactions.type} = 'egreso' AND ${transactions.date} LIKE ${yearMonth + '%'}`,
    )
    .groupBy(transactions.category)
    .orderBy(desc(sum(transactions.amount)));
}
