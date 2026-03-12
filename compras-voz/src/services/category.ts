import { eq } from 'drizzle-orm';

import { categories } from '../db/schema';
import type { Category } from '../types/category';
import type { TransactionType } from '../types/transaction';
import { db } from './db';

// ─── Valores por defecto ─────────────────────────────────────────────────────

const DEFAULT_INGRESOS = [
  'salario',
  'ingreso alquileres',
  'inversión',
  'cambio',
  'saldo inicial',
  'otros ingresos',
];

const DEFAULT_EGRESOS = [
  'supermercado',
  'alquiler',
  'tarjeta',
  'auto',
  'banco',
  'casa',
  'colegio',
  'comida',
  'cena',
  'asado',
  'bebidas',
  'deporte',
  'entretenimiento',
  'farmacia',
  'gastos comunes',
  'gastos empresa',
  'impuestos',
  'perros',
  'regalo',
  'ropa',
  'salud',
  'ajuste',
  'otros egresos',
];

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getAllCategories(): Promise<Category[]> {
  return db.select().from(categories).all();
}

export async function getCategoriesByType(type: TransactionType): Promise<Category[]> {
  return db.select().from(categories).where(eq(categories.type, type)).all();
}

export async function insertCategory(cat: Omit<Category, 'id'>): Promise<void> {
  const { name, type } = cat;
  await db.insert(categories).values({ name: name.trim().toLowerCase(), type });
}

export async function deleteCategory(id: number): Promise<void> {
  await db.delete(categories).where(eq(categories.id, id));
}

/**
 * Inserta las categorías por defecto si la tabla está vacía.
 * Llamar una vez después de las migraciones.
 */
export async function seedDefaultCategories(): Promise<void> {
  const existing = await getAllCategories();
  if (existing.length > 0) return;

  const rows = [
    ...DEFAULT_INGRESOS.map((name) => ({ name, type: 'ingreso' as TransactionType })),
    ...DEFAULT_EGRESOS.map((name) => ({ name, type: 'egreso' as TransactionType })),
  ];

  for (const row of rows) {
    await db.insert(categories).values(row);
  }
}
