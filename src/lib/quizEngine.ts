import type { QuizMode } from "../data/quizBank";

/* ------------------------------------------------------------------ */
/*  Perfil del jugador (persistido en localStorage)                     */
/* ------------------------------------------------------------------ */

export const QUIZ_STATS_KEY = "insecta:quiz-stats:v1";

export interface MuseumSlot {
  specimenId: string | null;
  decorationIds: string[]; // IDs de ShopItem aplicados
}

export interface PlayerProfile {
  totalCorrect: number;
  totalAnswered: number;
  bestStreak: number;
  xp: number;
  coins: number;
  level: number; // 0–3
  gamesPlayed: number;
  modeBest: Record<QuizMode, number>; // mejor score por modo
  /** IDs de especímenes dominados (3+ correctas seguidas) */
  masteredSpecimens: string[];
  /** Contador de rachas correctas por espécimen (resetea en incorrecta) */
  masteryCounters: Record<string, number>;
  /** Slots del museo:哪些 espécimen están exhibidos y con qué decoración */
  museumSlots: MuseumSlot[];
  /** IDs de ShopItem ya comprados */
  ownedDecorations: string[];
  /** Cuántos slots están desbloqueados */
  slotsUnlocked: number;
}

export const DEFAULT_PROFILE: PlayerProfile = {
  totalCorrect: 0,
  totalAnswered: 0,
  bestStreak: 0,
  xp: 0,
  coins: 0,
  level: 0,
  gamesPlayed: 0,
  modeBest: {
    "speed-scientific": 0,
    "classify-order": 0,
    "identify-glyph": 0,
    etymology: 0,
    "taxonomy-chain": 0,
  },
  masteredSpecimens: [],
  masteryCounters: {},
  museumSlots: [
    { specimenId: null, decorationIds: [] },
    { specimenId: null, decorationIds: [] },
    { specimenId: null, decorationIds: [] },
    { specimenId: null, decorationIds: [] },
  ],
  ownedDecorations: [],
  slotsUnlocked: 4,
};

/* ------------------------------------------------------------------ */
/*  Niveles de entomólogo                                               */
/* ------------------------------------------------------------------ */

export const LEVELS = [
  { xp: 0, title: "Aprendiz de campo", icon: "🥉" },
  { xp: 500, title: "Colector de gabinete", icon: "🥈" },
  { xp: 1500, title: "Naturalista viajero", icon: "🥇" },
  { xp: 3000, title: "Doctor en Entomología", icon: "💎" },
] as const;

export function getLevel(xp: number): { level: number; title: string; icon: string; next: number } {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) {
      const next = i < LEVELS.length - 1 ? LEVELS[i + 1].xp : LEVELS[i].xp;
      return { level: i, title: LEVELS[i].title, icon: LEVELS[i].icon, next };
    };
  }
  return { level: 0, title: LEVELS[0].title, icon: LEVELS[0].icon, next: LEVELS[1].xp };
}

/* ------------------------------------------------------------------ */
/*  Cálculo de puntos por respuesta                                    */
/* ------------------------------------------------------------------ */

export function calcPoints(streak: number, responseTimeMs: number): { base: number; speedBonus: number; streakMult: number; total: number } {
  const base = 100;

  let streakMult = 1;
  if (streak >= 10) streakMult = 3;
  else if (streak >= 5) streakMult = 2;
  else if (streak >= 3) streakMult = 1.5;

  let speedBonus = 0;
  if (responseTimeMs < 3000) speedBonus = 50;
  else if (responseTimeMs < 5000) speedBonus = 25;

  const total = Math.round((base + speedBonus) * streakMult);
  return { base, speedBonus, streakMult, total };
}

/* ------------------------------------------------------------------ */
/*  Cálculo de monedas                                                  */
/* ------------------------------------------------------------------ */

export function calcCoins(streak: number, roundPerfect: boolean): number {
  let coins = 1; // 1 por respuesta correcta
  if (streak > 0 && streak % 5 === 0) coins += 2; // bonus cada 5 de racha
  if (roundPerfect) coins += 3; // bonus ronda perfecta
  return coins;
}

/* ------------------------------------------------------------------ */
/*  Timer adaptativo según modo                                         */
/* ------------------------------------------------------------------ */

export function getTimerDuration(mode: QuizMode, streak: number): number {
  // Base durations
  const BASE: Record<QuizMode, number> = {
    "speed-scientific": 8000,
    "classify-order": 20000, // sin presión temporal en clasificación
    "identify-glyph": 10000,
    etymology: 12000,
    "taxonomy-chain": 15000,
  };

  const base = BASE[mode];

  // Reducir tiempo con streak alto (flow state)
  if (mode === "classify-order") return base; // sin timer en clasificación
  if (streak >= 10) return Math.max(base * 0.5, 4000);
  if (streak >= 5) return Math.max(base * 0.7, 5000);
  return base;
}

/* ------------------------------------------------------------------ */
/*  Persistencia                                                        */
/* ------------------------------------------------------------------ */

export function loadProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(QUIZ_STATS_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    const data = JSON.parse(raw);
    // Merge with defaults to handle new fields
    return { ...DEFAULT_PROFILE, ...data };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function saveProfile(profile: PlayerProfile): void {
  localStorage.setItem(QUIZ_STATS_KEY, JSON.stringify(profile));
}

export function updateProfileAfterRound(
  profile: PlayerProfile,
  mode: QuizMode,
  correct: number,
  total: number,
  bestStreak: number,
  xpEarned: number,
  coinsEarned: number
): PlayerProfile {
  const updated = { ...profile };
  updated.totalCorrect += correct;
  updated.totalAnswered += total;
  updated.bestStreak = Math.max(updated.bestStreak, bestStreak);
  updated.xp += xpEarned;
  updated.coins += coinsEarned;
  updated.gamesPlayed += 1;

  // Update mode best score
  const score = correct * 100 + bestStreak * 50;
  if (score > (updated.modeBest[mode] ?? 0)) {
    updated.modeBest[mode] = score;
  }

  // Update level
  updated.level = getLevel(updated.xp).level;

  return updated;
}

/* ------------------------------------------------------------------ */
/*  Mastery tracking                                                    */
/* ------------------------------------------------------------------ */

/** Mínimo de correctas seguidas para dominar un espécimen */
export const MASTERY_THRESHOLD = 3;

/**
 * Registra una respuesta y retorna el perfil actualizado.
 * Si el jugador acierta, incrementa el contador del espécimen.
 * Si llega a MASTERY_THRESHOLD, lo marca como dominado.
 * Si falla, resetea el contador del espécimen.
 */
export function trackMastery(
  profile: PlayerProfile,
  specimenId: string | null,
  correct: boolean
): { profile: PlayerProfile; justMastered: boolean } {
  if (!specimenId) return { profile, justMastered: false };

  const updated = { ...profile, masteryCounters: { ...profile.masteryCounters } };

  if (!correct) {
    // Reset counter on wrong answer
    updated.masteryCounters[specimenId] = 0;
    return { profile: updated, justMastered: false };
  }

  const prev = updated.masteryCounters[specimenId] ?? 0;
  const next = prev + 1;
  updated.masteryCounters[specimenId] = next;

  if (next >= MASTERY_THRESHOLD && !updated.masteredSpecimens.includes(specimenId)) {
    updated.masteredSpecimens = [...updated.masteredSpecimens, specimenId];
    return { profile: updated, justMastered: true };
  }

  return { profile: updated, justMastered: false };
}

/** Comprer una decoración de la tienda. Retorna null si no puede permitírselo. */
export function buyDecoration(
  profile: PlayerProfile,
  decorationId: string,
  cost: number
): PlayerProfile | null {
  if (profile.coins < cost) return null;
  if (profile.ownedDecorations.includes(decorationId)) return profile;

  return {
    ...profile,
    coins: profile.coins - cost,
    ownedDecorations: [...profile.ownedDecorations, decorationId],
  };
}

/** Desbloquear un slot nuevo. Retorna null si no puede permitírselo. */
export function unlockSlot(
  profile: PlayerProfile,
  cost: number
): PlayerProfile | null {
  if (profile.coins < cost) return null;

  return {
    ...profile,
    coins: profile.coins - cost,
    slotsUnlocked: profile.slotsUnlocked + 1,
    museumSlots: [
      ...profile.museumSlots,
      { specimenId: null, decorationIds: [] },
    ],
  };
}

/** Asignar un espécimen a un slot del museo. */
export function assignSpecimenToSlot(
  profile: PlayerProfile,
  slotIndex: number,
  specimenId: string | null
): PlayerProfile {
  const slots = [...profile.museumSlots];
  if (slotIndex < 0 || slotIndex >= slots.length) return profile;
  slots[slotIndex] = { ...slots[slotIndex], specimenId };
  return { ...profile, museumSlots: slots };
}

/** Aplicar/quitar una decoración de un slot. */
export function toggleDecoration(
  profile: PlayerProfile,
  slotIndex: number,
  decorationId: string
): PlayerProfile {
  const slots = [...profile.museumSlots];
  if (slotIndex < 0 || slotIndex >= slots.length) return profile;

  const slot = { ...slots[slotIndex] };
  const has = slot.decorationIds.includes(decorationId);
  slot.decorationIds = has
    ? slot.decorationIds.filter((d) => d !== decorationId)
    : [...slot.decorationIds, decorationId];

  slots[slotIndex] = slot;
  return { ...profile, museumSlots: slots };
}
