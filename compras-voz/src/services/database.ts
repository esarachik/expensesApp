import { and, count, desc, eq, like, sql, sum } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import { accounts, transactions } from '../db/schema';
import type { Account } from '../types/account';
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
      accountId: t.accountId ?? null,
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
// ─── Cuentas ─────────────────────────────────────────────────────────────────

/** Devuelve todas las cuentas */
export async function getAllAccounts(): Promise<Account[]> {
  return db.select().from(accounts).orderBy(accounts.name);
}

/** Devuelve las cuentas de un mes dado (YYYY-MM) */
export async function getAccountsByMonth(yearMonth: string): Promise<Account[]> {
  return db
    .select()
    .from(accounts)
    .where(eq(accounts.month, yearMonth))
    .orderBy(accounts.name);
}

/** Inserta o actualiza el saldo inicial de una cuenta para un mes */
export async function upsertAccount(a: Account): Promise<number> {
  if (a.id) {
    await db
      .update(accounts)
      .set({ name: a.name, type: a.type, initialBalance: a.initialBalance, month: a.month })
      .where(eq(accounts.id, a.id));
    return a.id;
  }
  const result = await db
    .insert(accounts)
    .values({ name: a.name, type: a.type, initialBalance: a.initialBalance, month: a.month })
    .returning({ id: accounts.id });
  return result[0].id;
}

/** Elimina una cuenta */
export async function deleteAccount(id: number): Promise<void> {
  await db.delete(accounts).where(eq(accounts.id, id));
}

/**
 * Calcula el balance actual de cada cuenta en un mes dado.
 * - Banco: saldoActual = saldoInicial + ingresos - egresos (del mes vinculados a esa cuenta)
 * - Tarjeta: totalGastado = sum(egresos vinculados a la tarjeta en el mes)
 */
export async function getAccountsWithBalance(
  yearMonth: string,
): Promise<Array<Account & { currentBalance: number }>> {
  const accs = await getAccountsByMonth(yearMonth);
  if (accs.length === 0) return [];

  const results = await Promise.all(
    accs.map(async (acc) => {
      const rows = await db
        .select({
          ingresos: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'ingreso' THEN ${transactions.amount} ELSE 0 END), 0)`,
          egresos: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'egreso' THEN ${transactions.amount} ELSE 0 END), 0)`,
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.accountId, acc.id!),
            like(transactions.date, `${yearMonth}%`),
          ),
        );

      const ingresos = rows[0]?.ingresos ?? 0;
      const egresos = rows[0]?.egresos ?? 0;

      const currentBalance =
        acc.type === 'bank'
          ? acc.initialBalance + ingresos - egresos
          : egresos; // tarjeta: muestra total gastado

      return { ...acc, currentBalance };
    }),
  );

  return results;
}