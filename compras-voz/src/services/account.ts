import { and, eq, like, sql } from 'drizzle-orm';
import { accounts, transactions } from '../db/schema';
import type { Account } from '../types/account';
import { db } from './db';

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
  const { id, ...data } = a;
  if (id) {
    await db.update(accounts).set(data).where(eq(accounts.id, id));
    return id;
  }
  const result = await db
    .insert(accounts)
    .values(data)
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
          : egresos;

      return { ...acc, currentBalance };
    }),
  );

  return results;
}
