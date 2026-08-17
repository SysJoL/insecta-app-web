import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QUIZ_MODES, type QuizMode } from "../data/quizBank";
import { getLevel, type PlayerProfile } from "../lib/quizEngine";
import QuizGame from "./QuizGame";

interface Props {
  profile: PlayerProfile;
  onProfileUpdate: (p: PlayerProfile) => void;
}

type View = "hub" | "playing";

export default function Quiz({ profile, onProfileUpdate }: Props) {
  const [view, setView] = useState<View>("hub");
  const [activeMode, setActiveMode] = useState<QuizMode>("speed-scientific");
  const levelInfo = getLevel(profile.xp);

  const handleStartMode = (mode: QuizMode) => {
    setActiveMode(mode);
    setView("playing");
  };

  const handleBackToHub = () => {
    setView("hub");
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {view === "hub" ? (
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

            {/* Mode grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {QUIZ_MODES.map((m) => (
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
        ) : (
          <motion.div
            key="playing"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
