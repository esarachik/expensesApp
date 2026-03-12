import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

const DB_NAME = 'compras_voz.db';

export const expoDb = openDatabaseSync(DB_NAME);
export const db = drizzle(expoDb);
