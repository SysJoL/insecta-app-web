import { fetchTopSpecies, type CardTaxon } from "./inat";
import { specimensToQuizSpecimens, type QuizSpecimen } from "../data/quizBank";

let cachedPool: QuizSpecimen[] | null = null;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Obtiene un pool de especímenes para el quiz.
 * - Primera llamada: fetch a iNaturalist (50 spp), selecciona 20 al azar, cachea
 * - Llamadas siguientes: reutiliza cache
 * - Fallback: pool de 14 especímenes curados
 */
export async function ensureQuizPool(
  orderMap: Map<number, string>
): Promise<QuizSpecimen[]> {
  if (cachedPool) return cachedPool;

  try {
    const cards = await fetchTopSpecies(orderMap, null, "with", 50);
    const shuffled = shuffle(cards);
    const selected = shuffled.slice(0, 20);

    cachedPool = selected.map((c) => ({
      id: c.id,
      name: c.common ?? c.latin,
      latin: c.latin,
      order: c.orderName,
      traits: [],
    }));
  } catch {
    cachedPool = specimensToQuizSpecimens();
  }

  return cachedPool;
}

/** Retorna el pool cacheado (null si aún no se ha cargado) */
export function getCachedPool(): QuizSpecimen[] | null {
  return cachedPool;
}

/** Resetea el cache (útil para forzar recarga) */
export function resetQuizPool(): void {
  cachedPool = null;
}
