import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { eq, like, sql, desc, sum, count } from 'drizzle-orm';
import { transactions } from '../db/schema';
import type { Transaction } from '../types/transaction';

// ─── Configuración (inicialización síncrona a nivel de módulo) ──────────────

const DB_NAME = 'compras_voz.db';

export const expoDb = openDatabaseSync(DB_NAME);
export const db = drizzle(expoDb);

// ─── Queries ────────────────────────────────────────────────────────────────

/** Inserta una transacción y devuelve el ID generado */
export async function insertTransaction(t: Transaction): Promise<number> {
  const result = await db
    .insert(transactions)
    .values({
      date: t.date,
      amount: t.amount,
      type: t.type,
      category: t.category,
      description: t.description,
      originalText: t.originalText,
    })
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

/** Elimina una transacción por ID */
export async function deleteTransaction(id: number): Promise<void> {
  await db.delete(transactions).where(eq(transactions.id, id));
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
