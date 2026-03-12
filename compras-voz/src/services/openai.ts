import { OPENAI_API_KEY, OPENAI_BASE_URL } from '../constants/config';
import type { Transaction } from '../types/transaction';
import { getCategoriesByType } from './category';

/**
 * Recibe el texto transcrito y usa GPT para extraer los datos estructurados
 * de la transacción (ingreso o egreso).
 */
export async function parseTransaction(
  transcribedText: string
): Promise<Omit<Transaction, 'id'>> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Cargar categorias dinamicas desde la DB
  const [ingresos, egresos] = await Promise.all([
    getCategoriesByType('ingreso'),
    getCategoriesByType('egreso'),
  ]);
  const ingresoNames = ingresos.map((c) => c.name);
  const egresoNames = egresos.map((c) => c.name);

  const fallbackIngreso = ingresoNames.includes('otros ingresos') ? 'otros ingresos' : (ingresoNames[ingresoNames.length - 1] ?? 'otros ingresos');
  const fallbackEgreso = egresoNames.includes('otros egresos') ? 'otros egresos' : (egresoNames[egresoNames.length - 1] ?? 'otros egresos');

  const systemPrompt = `Sos un asistente que extrae datos de transacciones financieras (ingresos y egresos) a partir de texto hablado.

Reglas:
- Si el usuario dice "compré", "gasté", "pagué" o similar → tipo: "egreso"
- Si el usuario dice "cobré", "me pagaron", "recibí", "ingreso" o similar → tipo: "ingreso"
- Si no se menciona fecha, usá la fecha de hoy: ${today}
- El monto siempre debe ser un número positivo
- Respondé SOLO con JSON válido, sin texto adicional ni markdown

Categorías disponibles para INGRESOS: ${ingresoNames.join(', ')}
Categorías disponibles para EGRESOS: ${egresoNames.join(', ')}

Usá la categoría que mejor corresponda de las listas anteriores. Si no hay ninguna adecuada usá "${fallbackIngreso}" o "${fallbackEgreso}" según corresponda.

Formato de respuesta:
{
  "date": "YYYY-MM-DD",
  "amount": 0,
  "type": "egreso",
  "category": "",
  "description": ""
}`;

  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: transcribedText },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GPT API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content: string = data.choices[0].message.content;

  // Limpiar posibles bloques de código markdown
  const cleaned = content.replace(/```json\n?|```\n?/g, '').trim();
  const parsed = JSON.parse(cleaned);

  const type: 'ingreso' | 'egreso' = parsed.type === 'ingreso' ? 'ingreso' : 'egreso';
  const allNames = type === 'ingreso' ? ingresoNames : egresoNames;
  const rawCategory: string = (parsed.category ?? '').toLowerCase().trim();
  const category = allNames.includes(rawCategory)
    ? rawCategory
    : type === 'ingreso' ? fallbackIngreso : fallbackEgreso;

  return {
    date: parsed.date ?? today,
    amount: Number(parsed.amount) || 0,
    type,
    category,
    description: parsed.description ?? '',
    originalText: transcribedText    
  };
}
