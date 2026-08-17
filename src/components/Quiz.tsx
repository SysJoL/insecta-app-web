import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { QUIZ_MODES, type QuizMode } from "../data/quizBank";
import {
  getLevel,
  loadDailyHistory,
  isDailyCompleted,
  getDailyStreak,
  getLast7Days,
  saveExpeditionState,
  resetExpeditionState,
  loadExpeditionState,
  type PlayerProfile,
} from "../lib/quizEngine";
import { ensureQuizPool } from "../lib/quizPool";
import QuizGame from "./QuizGame";

interface Props {
  profile: PlayerProfile;
  onProfileUpdate: (p: PlayerProfile) => void;
  orderMap: Map<number, string>;
}

type View = "hub" | "playing" | "daily-hub" | "expedition-hub";

const REGULAR_MODES = QUIZ_MODES.filter(
  (m) => m.id !== "daily" && m.id !== "expedition"
);

export default function Quiz({ profile, onProfileUpdate, orderMap }: Props) {
  const [view, setView] = useState<View>("hub");
  const [activeMode, setActiveMode] = useState<QuizMode>("speed-scientific");
  const [poolLoading, setPoolLoading] = useState(false);
  const levelInfo = getLevel(profile.xp);

  const dailyHistory = loadDailyHistory();
  const dailyCompleted = isDailyCompleted();
  const dailyStreak = getDailyStreak(dailyHistory);
  const last7 = getLast7Days(dailyHistory);
  const expeditionState = loadExpeditionState();

  const handleStartMode = async (mode: QuizMode) => {
    setPoolLoading(true);
    await ensureQuizPool(orderMap);
    setPoolLoading(false);
    setActiveMode(mode);
    setView("playing");
  };

  const handlePlayDaily = async () => {
    if (dailyCompleted) return;
    setPoolLoading(true);
    await ensureQuizPool(orderMap);
    setPoolLoading(false);
    setActiveMode("daily");
    setView("playing");
  };

  const handleStartExpedition = async () => {
    resetExpeditionState();
    setPoolLoading(true);
    await ensureQuizPool(orderMap);
    setPoolLoading(false);
    setActiveMode("expedition");
    setView("playing");
  };

  const handleContinueExpedition = () => {
    if (!expeditionState.active) return;
    setActiveMode("expedition");
    setView("playing");
  };

  const handleBackToHub = () => {
    setView("hub");
  };

  // Lock body scroll when game is active
  useEffect(() => {
    if (view !== "hub") {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [view]);

  return (
    <div>
      <AnimatePresence mode="wait">
        {view === "hub" && (
          <motion.div
            key="hub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Player stats bar */}
            <div className="label-frame mb-8 bg-pine/70 p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{levelInfo.icon}</span>
                  <div>
                    <p className="font-display text-lg font-bold text-parch">{levelInfo.title}</p>
                    <p className="text-[10px] font-bold tracking-[0.16em] text-sage uppercase">
                      {profile.gamesPlayed} partidas · {profile.bestStreak} mejor racha
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-5">
                  <div className="text-center">
                    <p className="font-display text-xl font-black text-amber">{profile.xp}</p>
                    <p className="text-[9px] font-bold tracking-[0.14em] text-sage uppercase">XP</p>
                  </div>
                  <div className="text-center">
                    <p className="font-display text-xl font-black text-honey">{profile.coins}</p>
                    <p className="text-[9px] font-bold tracking-[0.14em] text-sage uppercase">🪙</p>
                  </div>
                  <div className="text-center">
                    <p className="font-display text-xl font-black text-parch">{profile.totalCorrect}</p>
                    <p className="text-[9px] font-bold tracking-[0.14em] text-sage uppercase">Correctas</p>
                  </div>
                </div>
              </div>

              {/* XP bar */}
              <div className="mt-4">
                <div className="h-2 bg-ink/80">
                  <div
                    className="bar-fill h-full bg-gradient-to-r from-amber to-honey transition-all"
                    style={{
                      width: `${Math.min(100, ((profile.xp - (levelInfo.level === 0 ? 0 : levelInfo.next)) / Math.max(1, levelInfo.next - (levelInfo.level === 0 ? 0 : levelInfo.next))) * 100)}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-right text-[9px] text-bone/40">
                  {levelInfo.next > profile.xp
                    ? `${levelInfo.next - profile.xp} XP para el siguiente nivel`
                    : "Nivel máximo alcanzado"}
                </p>
              </div>
            </div>

            {/* Daily + Expedition side by side */}
            <div className="mb-8 grid gap-6 sm:grid-cols-2 items-stretch">
            {/* Daily Challenge card */}
            <div className="label-frame flex flex-col justify-between bg-pine/70 p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <h4 className="font-display text-lg font-bold text-parch">Desafío Diario</h4>
                    <p className="text-[10px] font-bold tracking-[0.14em] text-sage uppercase">
                      {dailyCompleted
                        ? `Completado ✓ · Racha: ${dailyStreak} días`
                        : "Un espécimen misterioso te espera"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handlePlayDaily}
                  disabled={dailyCompleted}
                  className={`shrink-0 border px-4 py-2 text-[11px] font-bold tracking-[0.14em] uppercase transition-all ${
                    dailyCompleted
                      ? "cursor-not-allowed border-moss/40 bg-moss/10 text-bone/30"
                      : "border-amber bg-amber text-ink hover:bg-honey"
                  }`}
                >
                  {dailyCompleted ? "Hecho ✓" : "Jugar"}
                </button>
              </div>

              {/* Last 7 days calendar */}
              <div className="mt-4 flex items-center gap-1.5">
                {last7.map((day) => (
                  <div key={day.date} className="flex flex-col items-center gap-1">
                    <div
                      className={`h-3 w-3 border ${
                        day.correct === true
                          ? "border-sage bg-sage"
                          : day.correct === false
                            ? "border-rust bg-rust"
                            : "border-moss/50 bg-ink/50"
                      }`}
                    />
                    <span className="text-[8px] text-bone/30">
                      {day.date.slice(8)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expedition card */}
            <div className="label-frame flex flex-col justify-between bg-pine/70 p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🗺️</span>
                  <div>
                    <h4 className="font-display text-lg font-bold text-parch">Expedición</h4>
                    <p className="text-[10px] font-bold tracking-[0.14em] text-sage uppercase">
                      {expeditionState.active
                        ? `Estación ${expeditionState.stationIdx + 1}/${expeditionState.totalStations} · ${expeditionState.lives} vidas`
                        : "5 estaciones, 3 vidas — supervivencia pura"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={expeditionState.active ? handleContinueExpedition : handleStartExpedition}
                  className="shrink-0 border border-teal bg-teal px-4 py-2 text-[11px] font-bold tracking-[0.14em] text-ink uppercase transition-all hover:bg-sage"
                >
                  {expeditionState.active ? "Continuar" : "Expedición"}
                </button>
              </div>

              {/* Station map */}
              <div className="mt-4 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div
                      className={`flex h-7 w-7 items-center justify-center border text-[10px] font-bold ${
                        expeditionState.active && i < expeditionState.stationIdx
                          ? "border-sage bg-sage/20 text-sage"
                          : expeditionState.active && i === expeditionState.stationIdx
                            ? "border-amber bg-amber/20 text-amber"
                            : "border-moss/40 bg-ink/30 text-bone/30"
                      }`}
                    >
                      {i + 1}
                    </div>
                    {i < 4 && (
                      <div className={`h-px w-2 ${i < expeditionState.stationIdx ? "bg-sage" : "bg-moss/30"}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            </div>

            {/* Mode grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {REGULAR_MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleStartMode(m.id)}
                  className="group label-frame bg-pine/60 p-5 text-left transition-all hover:border-amber/70 hover:bg-amber/5"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="text-2xl">{m.icon}</span>
                    <div>
                      <h4 className="font-display text-base font-bold text-parch group-hover:text-amber">
                        {m.name}
                      </h4>
                      <p className="text-[9px] font-bold tracking-[0.14em] text-sage uppercase">
                        {profile.modeBest[m.id] ? `Mejor: ${profile.modeBest[m.id]}` : "Sin jugar"}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-bone/60">{m.description}</p>
                  <div className="mt-3 flex items-center gap-2 text-[10px] font-bold tracking-[0.14em] text-amber uppercase opacity-0 transition-opacity group-hover:opacity-100">
                    Jugar
                    <svg viewBox="0 0 16 16" className="h-3 w-3" stroke="currentColor" fill="none" strokeWidth="1.8">
                      <path d="M2 8h11M9 3.5 13.5 8 9 12.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {poolLoading && createPortal(
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-ink">
          <div className="h-10 w-10 animate-spin border-2 border-moss border-t-amber" />
          <p className="mt-5 text-sm font-semibold text-sage animate-pulse">
            Consultando iNaturalist…
          </p>
          <p className="mt-1 text-[10px] text-bone/40">
            Preparando tu juego
          </p>
        </div>,
        document.body
      )}

      {view !== "hub" && createPortal(
        <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-ink [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
            <div className="mb-6">
              <button
                onClick={handleBackToHub}
                className="flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] text-sage uppercase transition-colors hover:text-amber"
              >
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" stroke="currentColor" fill="none" strokeWidth="1.8">
                  <path d="M10 3.5 5.5 8 10 12.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Volver al museo
              </button>
            </div>
              <QuizGame
                mode={activeMode}
                profile={profile}
                onProfileUpdate={onProfileUpdate}
                onHub={handleBackToHub}
              />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
