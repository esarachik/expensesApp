import type { TransactionType } from '@/types/transaction';

export const CATEGORIES_INGRESO = [
  'salario',
  'ingreso alquileres',
  'inversión',
  'cambio',
  'saldo inicial',
  'otros ingresos',
] as const;

export const CATEGORIES_EGRESO = [
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
] as const;

export type CategoryIngreso = (typeof CATEGORIES_INGRESO)[number];
export type CategoryEgreso = (typeof CATEGORIES_EGRESO)[number];

export function getCategoriesByType(type: TransactionType): readonly string[] {
  return type === 'ingreso' ? CATEGORIES_INGRESO : CATEGORIES_EGRESO;
}
