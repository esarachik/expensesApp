import { OPENAI_API_KEY, OPENAI_BASE_URL } from '../constants/config';
import type { Transaction } from '../types/transaction';

/**
 * Recibe el texto transcrito y usa GPT para extraer los datos estructurados
 * de la transacción (ingreso o egreso).
 */
export async function parseTransaction(
  transcribedText: string
): Promise<Omit<Transaction, 'textoOriginal'>> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const systemPrompt = `Sos un asistente que extrae datos de transacciones financieras (ingresos y egresos) a partir de texto hablado.

Reglas:
- Si el usuario dice "compré", "gasté", "pagué" o similar → tipo: "egreso"
- Si el usuario dice "cobré", "me pagaron", "recibí", "ingreso" o similar → tipo: "ingreso"
- Si no se menciona fecha, usá la fecha de hoy: ${today}
- Inferí la categoría del contexto (supermercado, transporte, sueldo, alquiler, comida, etc.)
- El monto siempre debe ser un número positivo
- Respondé SOLO con JSON válido, sin texto adicional ni markdown

Formato de respuesta:
{
  "fecha": "YYYY-MM-DD",
  "monto": 0,
  "tipo": "egreso",
  "categoria": "",
  "descripcion": ""
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

  return {
    date: parsed.fecha ?? today,
    amount: Number(parsed.monto) || 0,
    type: parsed.tipo === 'ingreso' ? 'ingreso' : 'egreso',
    category: parsed.categoria ?? '',
    description: parsed.descripcion ?? '',
    originalText: transcribedText    
  };
}
