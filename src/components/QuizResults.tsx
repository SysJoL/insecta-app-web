import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import type { QuizMode } from "../data/quizBank";
import { QUIZ_MODES } from "../data/quizBank";
import { getLevel, type PlayerProfile } from "../lib/quizEngine";
import { sfxLevelUp } from "../lib/audio";

interface Props {
  mode: QuizMode;
  correct: number;
  total: number;
  score: number;
  bestStreak: number;
  xpEarned: number;
  coinsEarned: number;
  avgTimeMs: number;
  profile: PlayerProfile;
  onReplay: () => void;
  onHub: () => void;
}

export default function QuizResults({
  mode,
  correct,
  total,
  score,
  bestStreak,
  xpEarned,
  coinsEarned,
  avgTimeMs,
  profile,
  onReplay,
  onHub,
}: Props) {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const modeInfo = QUIZ_MODES.find((m) => m.id === mode);
  const levelInfo = getLevel(profile.xp);

  // Confetti on good scores
  const confettiFired = useRef(false);
  useEffect(() => {
    if (confettiFired.current) return;
    confettiFired.current = true;
    if (accuracy >= 70) {
      sfxLevelUp();
      const duration = accuracy >= 90 ? 3000 : 1500;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({
          particleCount: accuracy >= 90 ? 4 : 2,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ["#e5a83b", "#a3c293", "#c4593b", "#6fb5a8"],
        });
        confetti({
          particleCount: accuracy >= 90 ? 4 : 2,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ["#e5a83b", "#a3c293", "#c4593b", "#6fb5a8"],
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [accuracy]);

  const rating =
    accuracy >= 90
      ? { label: "Excelente", color: "text-amber", stars: "★★★" }
      : accuracy >= 70
        ? { label: "Muy bien", color: "text-sage", stars: "★★☆" }
        : accuracy >= 50
          ? { label: "Aceptable", color: "text-bone/70", stars: "★☆☆" }
          : { label: "Sigue practicando", color: "text-rust", stars: "☆☆☆" };

  return (
    <div className="modal-in mx-auto max-w-md">
      {/* Header */}
      <div className="label-frame bg-pine/80 p-6 text-center">
        <p className="text-[10px] font-bold tracking-[0.3em] text-sage uppercase">
          {modeInfo?.icon} {modeInfo?.name}
        </p>
        <h3 className={`mt-2 font-display text-4xl font-black ${rating.color}`}>
          {rating.label}
        </h3>
        <p className="mt-1 font-display text-2xl tracking-[0.2em] text-amber/80">
          {rating.stars}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-px border border-moss/60 bg-moss/60">
        <StatCell label="Puntuación" value={score.toLocaleString("es-ES")} accent />
        <StatCell label="Precisión" value={`${accuracy}%`} accent={accuracy >= 70} />
        <StatCell label="Mejor racha" value={`${bestStreak}🔥`} />
        <StatCell label="Tiempo medio" value={`${(avgTimeMs / 1000).toFixed(1)}s`} />
        <StatCell label="Correctas" value={`${correct}/${total}`} />
        <StatCell label="Monedas" value={`+${coinsEarned} 🪙`} />
      </div>

      {/* XP progress */}
      <div className="border-x border-b border-moss/60 bg-pine/80 px-6 py-4">
        <div className="flex items-center justify-between text-[10px] font-bold tracking-[0.16em] uppercase">
          <span className="text-sage">
            {levelInfo.icon} {levelInfo.title}
          </span>
          <span className="text-amber">+{xpEarned} XP</span>
        </div>
        <div className="mt-2 h-2 bg-ink/80">
          <div
            className="bar-fill h-full bg-amber"
            style={{ width: `${Math.min(100, ((profile.xp - (levelInfo.level === 0 ? 0 : getLevel(profile.xp - xpEarned).next)) / (levelInfo.next - (levelInfo.level === 0 ? 0 : getLevel(profile.xp - xpEarned).next))) * 100)}%` }}
          />
        </div>
        <p className="mt-1 text-right text-[9px] text-bone/40">
          {profile.xp} / {levelInfo.next} XP
        </p>
      </div>

      {/* Actions */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={onReplay}
          className="border border-amber bg-amber py-3 text-xs font-bold tracking-[0.16em] text-ink uppercase transition-all hover:bg-honey"
        >
          Jugar de nuevo
        </button>
        <button
          onClick={onHub}
          className="border border-moss py-3 text-xs font-bold tracking-[0.16em] text-sage uppercase transition-colors hover:border-sage hover:text-parch"
        >
          Elegir otro modo
        </button>
      </div>
    </div>
  );
}

function StatCell({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-pine/80 px-4 py-3 text-center">
      <p className="text-[9px] font-bold tracking-[0.2em] text-sage/70 uppercase">{label}</p>
      <p className={`mt-1 font-display text-xl font-black ${accent ? "text-amber" : "text-parch"}`}>
        {value}
      </p>
    </div>
  );
}
