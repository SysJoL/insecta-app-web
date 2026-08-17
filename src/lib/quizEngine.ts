import type { QuizMode } from "../data/quizBank";

/* ------------------------------------------------------------------ */
/*  Daily Challenge history                                             */
/* ------------------------------------------------------------------ */

export const DAILY_HISTORY_KEY = "insecta:daily-history:v1";

export interface DailyHistoryEntry {
  date: string; // YYYY-MM-DD
  correct: boolean;
}

/** Returns today's date as YYYY-MM-DD */
export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Load daily history from localStorage */
export function loadDailyHistory(): DailyHistoryEntry[] {
  try {
    const raw = localStorage.getItem(DAILY_HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** Save a daily result */
export function saveDailyResult(correct: boolean): DailyHistoryEntry[] {
  const history = loadDailyHistory();
  const today = todayStr();
  // Replace if already exists for today
  const filtered = history.filter((e) => e.date !== today);
  const updated = [...filtered, { date: today, correct }];
  localStorage.setItem(DAILY_HISTORY_KEY, JSON.stringify(updated));
  return updated;
}

/** Check if daily is already completed today */
export function isDailyCompleted(): boolean {
  return loadDailyHistory().some((e) => e.date === todayStr());
}

/** Get current daily streak (consecutive correct days ending today or yesterday) */
export function getDailyStreak(history: DailyHistoryEntry[]): number {
  if (history.length === 0) return 0;
  const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  const today = todayStr();
  let expected = today;
  for (const entry of sorted) {
    if (entry.date === expected && entry.correct) {
      streak++;
      // Previous day
      const d = new Date(expected);
      d.setDate(d.getDate() - 1);
      expected = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    } else if (entry.date < expected) {
      break;
    }
  }
  return streak;
}

/** Get last 7 days results for calendar display */
export function getLast7Days(history: DailyHistoryEntry[]): { date: string; correct: boolean | null }[] {
  const result: { date: string; correct: boolean | null }[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const entry = history.find((e) => e.date === dateStr);
    result.push({ date: dateStr, correct: entry ? entry.correct : null });
  }
  return result;
}

/* ------------------------------------------------------------------ */
/*  Expedition state                                                    */
/* ------------------------------------------------------------------ */

export const EXPEDITION_STATE_KEY = "insecta:expedition-state:v1";

export interface ExpeditionState {
  active: boolean;
  lives: number;
  maxLives: number;
  stationIdx: number;
  totalStations: number;
  score: number;
  correctCount: number;
}

export function loadExpeditionState(): ExpeditionState {
  try {
    const raw = localStorage.getItem(EXPEDITION_STATE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { active: false, lives: 3, maxLives: 3, stationIdx: 0, totalStations: 5, score: 0, correctCount: 0 };
}

export function saveExpeditionState(state: ExpeditionState): void {
  localStorage.setItem(EXPEDITION_STATE_KEY, JSON.stringify(state));
}

export function resetExpeditionState(): ExpeditionState {
  const state: ExpeditionState = { active: false, lives: 3, maxLives: 3, stationIdx: 0, totalStations: 5, score: 0, correctCount: 0 };
  localStorage.setItem(EXPEDITION_STATE_KEY, JSON.stringify(state));
  return state;
}

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
    evolution: 0,
    ecosystem: 0,
    cryptid: 0,
    daily: 0,
    expedition: 0,
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
    "classify-order": 20000,
    "identify-glyph": 10000,
    etymology: 12000,
    "taxonomy-chain": 15000,
    evolution: 12000,
    ecosystem: 12000,
    cryptid: 18000,
    daily: 0, // no timer
    expedition: 10000,
  };

  const base = BASE[mode];

  // Reducir tiempo con streak alto (flow state)
  if (mode === "classify-order" || mode === "daily") return base; // sin timer en clasificación
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
