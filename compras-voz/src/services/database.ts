import * as SQLite from 'expo-sqlite';
import type { Transaction } from '../types/transaction';

// ─── Configuración ──────────────────────────────────────────────────────────

const DB_NAME = 'compras_voz.db';

let db: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<void> | null = null;

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS transactions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    date        TEXT    NOT NULL,
    amount      REAL    NOT NULL,
    type        TEXT    NOT NULL,
    category    TEXT    NOT NULL DEFAULT '',
    description TEXT    NOT NULL DEFAULT '',
    originalText TEXT   NOT NULL DEFAULT ''
  );
`;

// ─── Inicialización ─────────────────────────────────────────────────────────

/** Abre la base de datos y crea la tabla si no existe */
export async function initDatabase(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (db) return;
    db = await SQLite.openDatabaseAsync(DB_NAME);
    await db.execAsync(CREATE_TABLE_SQL);
  })();

  try {
    await initPromise;
  } catch (err) {
    if (db) {
      await db.closeAsync();
    }
    db = null;
    initPromise = null;
    throw err;
  }
}

// ─── Queries ────────────────────────────────────────────────────────────────

/** Obtiene la instancia de la DB, inicializando si es necesario */
async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) await initDatabase();
  return db!;
}

/** Inserta una transacción y devuelve el ID generado */
export async function insertTransaction(t: Transaction): Promise<number> {
  const database = await getDb();
  const result = await database.runAsync(
    `INSERT INTO transactions (date, amount, type, category, description, originalText)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [t.date, t.amount, t.type, t.category, t.description, t.originalText]
  );
  return result.lastInsertRowId;
}

/** Obtiene todas las transacciones ordenadas por fecha descendente */
export async function getAllTransactions(): Promise<Transaction[]> {
  const database = await getDb();
  return database.getAllAsync<Transaction>(
    'SELECT * FROM transactions ORDER BY date DESC, id DESC'
  );
}

/** Obtiene transacciones filtradas por mes (formato: 'YYYY-MM') */
export async function getTransactionsByMonth(yearMonth: string): Promise<Transaction[]> {
  const database = await getDb();
  return database.getAllAsync<Transaction>(
    'SELECT * FROM transactions WHERE date LIKE ? ORDER BY date DESC, id DESC',
    [`${yearMonth}%`]
  );
}

/** Obtiene el resumen de totales por tipo para un mes dado */
export async function getMonthlySummary(yearMonth: string): Promise<{
  totalIngresos: number;
  totalEgresos: number;
  balance: number;
}> {
  const database = await getDb();

  const row = await database.getFirstAsync<{
    totalIngresos: number;
    totalEgresos: number;
  }>(
    `SELECT
       COALESCE(SUM(CASE WHEN type = 'ingreso' THEN amount ELSE 0 END), 0) AS totalIngresos,
       COALESCE(SUM(CASE WHEN type = 'egreso'  THEN amount ELSE 0 END), 0) AS totalEgresos
     FROM transactions
     WHERE date LIKE ?`,
    [`${yearMonth}%`]
  );

  const totalIngresos = row?.totalIngresos ?? 0;
  const totalEgresos = row?.totalEgresos ?? 0;

  return { totalIngresos, totalEgresos, balance: totalIngresos - totalEgresos };
}

/** Elimina una transacción por ID */
export async function deleteTransaction(id: number): Promise<void> {
  const database = await getDb();
  await database.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
}

/** Obtiene el total de gastos por categoría para un mes dado */
export async function getCategoryBreakdown(
  yearMonth: string,
): Promise<Array<{ category: string; total: number; count: number }>> {
  const database = await getDb();
  return database.getAllAsync<{ category: string; total: number; count: number }>(
    `SELECT category, SUM(amount) AS total, COUNT(*) AS count
     FROM transactions
     WHERE type = 'egreso' AND date LIKE ?
     GROUP BY category
     ORDER BY total DESC`,
    [`${yearMonth}%`]
  );
}
