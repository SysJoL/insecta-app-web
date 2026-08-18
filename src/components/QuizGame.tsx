import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  generateQuestions,
  type QuizMode,
  type QuizQuestion,
} from "../data/quizBank";
import {
  calcPoints,
  calcCoins,
  getTimerDuration,
  trackMastery,
  saveDailyResult,
  saveExpeditionState,
  resetExpeditionState,
  getLevel,
  type PlayerProfile,
} from "../lib/quizEngine";
import {
  sfxClick,
  sfxCorrect,
  sfxWrong,
  sfxStreak,
  sfxLevelUp,
  sfxCountdown,
  sfxGo,
  sfxMastery,
  sfxStation,
  sfxGameOver,
} from "../lib/audio";
import { fetchTaxonPhoto } from "../lib/inat";
import { getCachedPool } from "../lib/quizPool";
import QuizResults from "./QuizResults";

interface Props {
  mode: QuizMode;
  profile: PlayerProfile;
  onProfileUpdate: (p: PlayerProfile) => void;
  onHub: () => void;
}

type Phase = "countdown" | "playing" | "feedback" | "results";

interface FeedbackState {
  correct: boolean;
  selected: number;
  correctAnswer: string;
  explanation: string;
  pointsEarned: number;
}

const COUNTDOWN_NUMS = [3, 2, 1, "¡Vamos!"];

export default function QuizGame({ mode, profile, onProfileUpdate, onHub }: Props) {
  const [phase, setPhase] = useState<Phase>("countdown");
  const [countdownIdx, setCountdownIdx] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [timeLeft, setTimeLeft] = useState(100); // percentage
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [lives, setLives] = useState(3);
  const [stationIdx, setStationIdx] = useState(0);
  const [questionImage, setQuestionImage] = useState<string | null>(null);

  const questionStartTime = useRef(0);
  const timerRef = useRef<number | undefined>(undefined);
  const feedbackTimerRef = useRef<number | undefined>(undefined);

  // Initialize questions and countdown
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const qs = await generateQuestions(mode, getCachedPool() ?? []);
      if (cancelled) return;
      setQuestions(qs);
      setLoading(false);

      // Save expedition state immediately so hub shows progress
      if (mode === "expedition") {
        saveExpeditionState({
          active: true,
          lives: 3,
          maxLives: 3,
          stationIdx: 0,
          totalStations: qs.length,
          score: 0,
          correctCount: 0,
        });
      }

      if (mode === "daily") {
        setPhase("playing");
        questionStartTime.current = Date.now();
        return;
      }

      // Countdown
      sfxCountdown();
      let idx = 0;
      const interval = setInterval(() => {
        idx++;
        if (idx >= COUNTDOWN_NUMS.length) {
          clearInterval(interval);
          sfxGo();
          setPhase("playing");
          questionStartTime.current = Date.now();
          return;
        }
        sfxCountdown();
        setCountdownIdx(idx);
      }, 800);
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(feedbackTimerRef.current);
      window.clearInterval(timerRef.current);
    };
  }, [mode]);

  // Timer logic
  useEffect(() => {
    if (phase !== "playing" || !questions[currentQ]) return;
    if (mode === "daily") return; // no timer for daily

    const duration = getTimerDuration(mode, streak);
    const interval = 50;
    let elapsed = 0;

    setTimeLeft(100);
    questionStartTime.current = Date.now();

    timerRef.current = window.setInterval(() => {
      elapsed += interval;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setTimeLeft(pct);

      if (elapsed >= duration) {
        window.clearInterval(timerRef.current);
        handleAnswer(-1); // timeout = wrong
      }
    }, interval);

    return () => window.clearInterval(timerRef.current);
  }, [phase, currentQ, questions, mode, streak]);

  // Fetch photo for current question's specimen
  useEffect(() => {
    const q = questions[currentQ];
    if (!q || !q.displayLabel) {
      setQuestionImage(null);
      return;
    }
    setQuestionImage(null); // clear while loading
    let cancelled = false;
    const searchName = q.latinName ?? q.displayLabel;
    fetchTaxonPhoto(searchName).then((url) => {
      if (!cancelled) setQuestionImage(url);
    });
    return () => { cancelled = true; };
  }, [currentQ, questions]);

  const handleAnswer = useCallback(
    (selectedIndex: number) => {
      window.clearInterval(timerRef.current);
      sfxClick();

      const q = questions[currentQ];
      if (!q) return;

      const responseTime = Date.now() - questionStartTime.current;
      const isCorrect = selectedIndex === q.correctIndex;

      const newStreak = isCorrect ? streak + 1 : 0;
      const newBestStreak = Math.max(bestStreak, newStreak);
      setStreak(newStreak);
      setBestStreak(newBestStreak);

      // Play correct/wrong sounds
      if (isCorrect) {
        sfxCorrect();
        if (newStreak >= 3) sfxStreak();
      } else {
        sfxWrong();
      }

      let pointsEarned = 0;
      let coinsEarned = 0;

      if (isCorrect) {
        const pts = calcPoints(newStreak, responseTime);
        pointsEarned = pts.total;
        coinsEarned = calcCoins(newStreak, false);
        setScore((s) => s + pointsEarned);
        setCorrectCount((c) => c + 1);
        setTotalCoins((c) => c + coinsEarned);
      }

      // Expedition lives
      let newLives = lives;
      if (mode === "expedition" && !isCorrect) {
        newLives = lives - 1;
        setLives(newLives);
      }

      // Track mastery for this specimen
      const { profile: profileAfterMastery, justMastered } = trackMastery(
        profile,
        q.specimenId ?? null,
        isCorrect
      );
      if (justMastered) {
        sfxMastery();
        window.setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent("insecta:mastery", { detail: { specimenId: q.specimenId } })
          );
        }, 2600);
      }
      onProfileUpdate(profileAfterMastery);

      setResponseTimes((prev) => [...prev, responseTime]);

      setFeedback({
        correct: isCorrect,
        selected: selectedIndex,
        correctAnswer: q.options[q.correctIndex],
        explanation: q.explanation,
        pointsEarned,
      });

      setPhase("feedback");

      // Auto-advance after 2.5s
      feedbackTimerRef.current = window.setTimeout(() => {
        setFeedback(null);

        // Daily mode: complete after single question
        if (mode === "daily") {
          saveDailyResult(isCorrect);
          const xpEarned = (isCorrect ? 1 : 0) * 100;
          const updated = {
            ...profileAfterMastery,
            totalCorrect: profileAfterMastery.totalCorrect + (isCorrect ? 1 : 0),
            totalAnswered: profileAfterMastery.totalAnswered + 1,
            bestStreak: Math.max(profileAfterMastery.bestStreak, newBestStreak),
            xp: profileAfterMastery.xp + xpEarned,
            coins: profileAfterMastery.coins + coinsEarned,
            gamesPlayed: profileAfterMastery.gamesPlayed + 1,
            modeBest: {
              ...profileAfterMastery.modeBest,
              daily: Math.max(profileAfterMastery.modeBest.daily ?? 0, isCorrect ? 1 : 0),
            },
          };
          onProfileUpdate(updated);
          setPhase("results");
          return;
        }

        // Expedition mode: check lives
        if (mode === "expedition") {
          if (newLives <= 0) {
            // Failed — reset expedition
            sfxGameOver();
            const finalCorrect = isCorrect ? correctCount + 1 : correctCount;
            const finalScore = score + pointsEarned;
            const xpEarned = finalCorrect * 100 + newBestStreak * 50;
            const coinsFinal = totalCoins + coinsEarned;
            const updated = {
              ...profileAfterMastery,
              totalCorrect: profileAfterMastery.totalCorrect + finalCorrect,
              totalAnswered: profileAfterMastery.totalAnswered + (stationIdx + 1),
              bestStreak: Math.max(profileAfterMastery.bestStreak, newBestStreak),
              xp: profileAfterMastery.xp + xpEarned,
              coins: profileAfterMastery.coins + coinsFinal,
              gamesPlayed: profileAfterMastery.gamesPlayed + 1,
              modeBest: {
                ...profileAfterMastery.modeBest,
                expedition: Math.max(profileAfterMastery.modeBest.expedition ?? 0, finalScore),
              },
            };
            onProfileUpdate(updated);
            resetExpeditionState();
            setPhase("results");
            return;
          }

          // Check if expedition complete
          const nextStation = stationIdx + 1;
          if (nextStation >= questions.length) {
            // Expedition complete — bonus!
            sfxLevelUp();
            const finalCorrect = isCorrect ? correctCount + 1 : correctCount;
            const finalScore = score + pointsEarned + 200; // completion bonus
            const xpEarned = finalCorrect * 100 + newBestStreak * 50 + 100; // bonus XP
            const coinsFinal = totalCoins + coinsEarned + 5; // bonus coins
            const updated = {
              ...profileAfterMastery,
              totalCorrect: profileAfterMastery.totalCorrect + finalCorrect,
              totalAnswered: profileAfterMastery.totalAnswered + questions.length,
              bestStreak: Math.max(profileAfterMastery.bestStreak, newBestStreak),
              xp: profileAfterMastery.xp + xpEarned,
              coins: profileAfterMastery.coins + coinsFinal,
              gamesPlayed: profileAfterMastery.gamesPlayed + 1,
              modeBest: {
                ...profileAfterMastery.modeBest,
                expedition: Math.max(profileAfterMastery.modeBest.expedition ?? 0, finalScore),
              },
            };
            onProfileUpdate(updated);
            resetExpeditionState();
            setPhase("results");
            return;
          }

          // Next station
          sfxStation();
          setStationIdx(nextStation);
          saveExpeditionState({
            active: true,
            lives: newLives,
            maxLives: 3,
            stationIdx: nextStation,
            totalStations: questions.length,
            score: score + pointsEarned,
            correctCount: isCorrect ? correctCount + 1 : correctCount,
          });
          setCurrentQ((c) => c + 1);
          setPhase("playing");
          return;
        }

        // Normal modes
        if (currentQ + 1 < questions.length) {
          setCurrentQ((c) => c + 1);
          setPhase("playing");
        } else {
          const finalCorrect = isCorrect ? correctCount + 1 : correctCount;
          const finalScore = score + pointsEarned;
          const xpEarned = finalCorrect * 100 + newBestStreak * 50;
          const coinsFinal = totalCoins + coinsEarned;

          // Check for level up
          const oldLevel = getLevel(profile.xp).level;
          const newLevel = getLevel(profile.xp + xpEarned).level;
          if (newLevel > oldLevel) sfxLevelUp();

          const updated = {
            ...profileAfterMastery,
            totalCorrect: profileAfterMastery.totalCorrect + finalCorrect,
            totalAnswered: profileAfterMastery.totalAnswered + questions.length,
            bestStreak: Math.max(profileAfterMastery.bestStreak, newBestStreak),
            xp: profileAfterMastery.xp + xpEarned,
            coins: profileAfterMastery.coins + coinsFinal,
            gamesPlayed: profileAfterMastery.gamesPlayed + 1,
            modeBest: {
              ...profileAfterMastery.modeBest,
              [mode]: Math.max(profileAfterMastery.modeBest[mode] ?? 0, finalScore),
            },
          };
          onProfileUpdate(updated);
          setPhase("results");
        }
      }, 2500);
    },
    [questions, currentQ, streak, bestStreak, score, correctCount, totalCoins, lives, stationIdx, profile, mode, onProfileUpdate]
  );

  if (questions.length === 0) return null;

  // Countdown phase
  if (phase === "countdown") {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={countdownIdx}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="font-display text-7xl font-black text-amber"
          >
            {COUNTDOWN_NUMS[countdownIdx]}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Results phase
  if (phase === "results") {
    const avgTime =
      responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

    // Daily results — custom screen
    if (mode === "daily") {
      return (
        <div className="modal-in mx-auto max-w-md">
          <div className="label-frame bg-pine/80 p-6 text-center">
            <p className="text-[10px] font-bold tracking-[0.3em] text-amber uppercase">
              Desafío Diario
            </p>
            <h3 className={`mt-2 font-display text-4xl font-black ${correctCount > 0 ? "text-sage" : "text-rust"}`}>
              {correctCount > 0 ? "¡Correcto!" : "Incorrecto"}
            </h3>
            {correctCount > 0 && (
              <p className="mt-2 font-display text-xl text-parch">{questions[0]?.displayLabel}</p>
            )}
            <p className="mt-3 text-sm text-bone/60">{questions[0]?.explanation}</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={onHub}
              className="border border-amber bg-amber py-3 text-xs font-bold tracking-[0.16em] text-ink uppercase transition-all hover:bg-honey"
            >
              Volver a la mesa
            </button>
          </div>
        </div>
      );
    }

    // Expedition results — custom screen
    if (mode === "expedition") {
      const expeditionComplete = stationIdx >= questions.length - 1 && lives > 0;
      return (
        <div className="modal-in mx-auto max-w-md">
          <div className="label-frame bg-pine/80 p-6 text-center">
            <p className="text-[10px] font-bold tracking-[0.3em] text-teal uppercase">
              Expedición
            </p>
            <h3 className={`mt-2 font-display text-4xl font-black ${expeditionComplete ? "text-sage" : "text-rust"}`}>
              {expeditionComplete ? "¡Expedición Completada!" : "Expedición Fallida"}
            </h3>
            <p className="mt-2 text-sm text-bone/60">
              {expeditionComplete
                ? `Sobreviviste las ${questions.length} estaciones con ${lives} vidas restantes.`
                : `Caido en la estación ${stationIdx + 1}. Las vidas se agotaron.`}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-px border border-moss/60 bg-moss/60">
            <StatCell label="Estaciones" value={`${expeditionComplete ? questions.length : stationIdx + 1}/${questions.length}`} />
            <StatCell label="Vidas" value={`${"❤️".repeat(lives)}${"🖤".repeat(3 - lives)}`} />
            <StatCell label="Puntuación" value={score.toLocaleString("es-ES")} accent />
            <StatCell label="Monedas" value={`+${totalCoins} 🪙`} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                resetExpeditionState();
                onHub();
              }}
              className="border border-amber bg-amber py-3 text-xs font-bold tracking-[0.16em] text-ink uppercase transition-all hover:bg-honey"
            >
              Nueva expedición
            </button>
            <button
              onClick={onHub}
              className="border border-moss py-3 text-xs font-bold tracking-[0.16em] text-sage uppercase transition-colors hover:border-sage hover:text-parch"
            >
              Volver a la mesa
            </button>
          </div>
        </div>
      );
    }

    // Normal results
    return (
      <QuizResults
        mode={mode}
        correct={correctCount}
        total={questions.length}
        score={score}
        bestStreak={bestStreak}
        xpEarned={correctCount * 100 + bestStreak * 50}
        coinsEarned={totalCoins}
        avgTimeMs={avgTime}
        profile={profile}
        onReplay={async () => {
          const qs = await generateQuestions(mode, getCachedPool() ?? []);
          setQuestions(qs);
          setCurrentQ(0);
          setScore(0);
          setStreak(0);
          setCorrectCount(0);
          setBestStreak(0);
          setTotalCoins(0);
          setFeedback(null);
          setResponseTimes([]);
          setPhase("countdown");
          setCountdownIdx(0);

          let idx = 0;
          const interval = setInterval(() => {
            idx++;
            if (idx >= COUNTDOWN_NUMS.length) {
              clearInterval(interval);
              setPhase("playing");
              questionStartTime.current = Date.now();
              return;
            }
            setCountdownIdx(idx);
          }, 800);
        }}
        onHub={onHub}
      />
    );
  }

  const q = questions[currentQ];
  const timerColor =
    timeLeft > 60
      ? "bg-sage"
      : timeLeft > 30
        ? "bg-amber"
        : "bg-rust";

  return (
    <div className="w-full">
      {/* Loading spinner while fetching taxonomy questions */}
      {loading && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-ink">
          <div className="mb-4 h-10 w-10 animate-spin border-2 border-amber border-t-transparent" />
          <p className="text-sm font-bold tracking-[0.14em] text-sage uppercase">
            Preparando preguntas…
          </p>
        </div>
      )}
      {/* Top bar: score + streak + timer + progress */}
      <div className="mb-6 flex items-center gap-3">
        <span className="shrink-0 font-display text-2xl font-black text-amber tabular-nums">
          {score}
        </span>
        {mode === "expedition" && (
          <div className="flex shrink-0 items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={i < lives ? "text-rust" : "text-bone/20"}>
                ❤️
              </span>
            ))}
          </div>
        )}
        {mode === "daily" && (
          <span className="shrink-0 border border-amber/40 bg-amber/10 px-2 py-1 text-[10px] font-bold text-amber">
            📅 Diario
          </span>
        )}
        {streak >= 2 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="shrink-0 border border-amber/40 bg-amber/10 px-2 py-1 text-xs font-bold text-amber"
          >
            {streak}🔥
          </motion.span>
        )}

        {/* Timer bar — fills flexible middle space, or feedback banner */}
        {mode !== "classify-order" && mode !== "daily" && (
          <div className="mx-2 flex-1 self-center overflow-hidden">
            {phase === "feedback" && feedback ? (
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`hidden border-l-4 px-3 py-1.5 text-[11px] font-semibold ${
                  feedback.correct
                    ? "border-sage bg-sage/10 text-sage"
                    : "border-rust bg-rust/10 text-rust"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="shrink-0">
                    {feedback.correct ? "✓" : "✕"}
                  </span>
                  <span className="truncate">
                    {feedback.correct
                      ? `+${feedback.pointsEarned} pts`
                      : feedback.correctAnswer}
                  </span>
                  {feedback.correct && streak >= 3 && (
                    <span className="shrink-0 text-amber">🔥×{streak >= 10 ? 3 : streak >= 5 ? 2 : 1.5}</span>
                  )}
                </div>
                <p className="mt-0.5 text-[10px] opacity-70 leading-tight truncate"><ItalicLatin text={feedback.explanation} /></p>
              </motion.div>
            ) : (
              <div className="h-2 bg-ink/80">
                <motion.div
                  className={`h-full ${timerColor}`}
                  initial={{ width: "100%" }}
                  animate={{ width: `${timeLeft}%` }}
                  transition={{ duration: 0.05, ease: "linear" }}
                />
              </div>
            )}
          </div>
        )}
        {/* Feedback for modes without timer (daily, classify-order) */}
        {feedback && (mode === "classify-order" || mode === "daily") && (
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`hidden mx-2 flex-1 self-center overflow-hidden border-l-4 px-3 py-1.5 text-[11px] font-semibold ${
              feedback.correct
                ? "border-sage bg-sage/10 text-sage"
                : "border-rust bg-rust/10 text-rust"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="shrink-0">
                {feedback.correct ? "✓" : "✕"}
              </span>
              <span className="truncate">
                {feedback.correct
                  ? `+${feedback.pointsEarned} pts`
                  : feedback.correctAnswer}
              </span>
            </div>
            <p className="mt-0.5 text-[10px] opacity-70 leading-tight truncate"><ItalicLatin text={feedback.explanation} /></p>
          </motion.div>
        )}

        <span className="shrink-0 text-[11px] font-bold tracking-[0.14em] text-sage uppercase tabular-nums">
          {mode === "expedition"
            ? `Estación ${currentQ + 1}/${questions.length}`
            : `${currentQ + 1} / ${questions.length}`}
        </span>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Glyph display for identify mode */}
          {q.glyphKey && (
            <div className="mb-6 flex justify-center">
              <div className="label-frame flex h-32 w-32 items-center justify-center bg-pine/80">
                <svg viewBox="0 0 64 64" className="h-24 w-24 text-amber" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  {/* Inline simplified glyph shapes */}
                  {q.glyphKey === "butterfly" && (
                    <g className="glyph-flutter">
                      <circle cx="32" cy="15" r="3" />
                      <path d="M32 18v28" />
                      <path d="M31 22C20 10 8 12 8 21c0 8 12 9 23 8ZM33 22c11-12 23-10 23-1 0 8-12 9-23 8Z" />
                      <path d="M31 31c-9 0-17 5-15 13 2 7 11 5 15-3ZM33 31c9 0 17 5 15 13-2 7-11 5-15-3Z" />
                    </g>
                  )}
                  {q.glyphKey === "beetle" && (
                    <g>
                      <circle cx="32" cy="12" r="4" />
                      <path d="M25 16h14v6H25z" />
                      <path d="M32 22c-10 0-13 8-12 18 1 9 6 14 12 14s11-5 12-14c1-10-2-18-12-18Z" />
                      <path d="M32 22v32" />
                    </g>
                  )}
                  {q.glyphKey === "dragonfly" && (
                    <g>
                      <circle cx="32" cy="9" r="4.5" />
                      <path d="M31 14C20 6 6 8 5 13c-1 4 13 6 26 5ZM33 14c11-8 25-6 26-1 1 4-13 6-26 5Z" />
                      <path d="M32 20v32" />
                    </g>
                  )}
                  {q.glyphKey === "bee" && (
                    <g>
                      <path d="M28 8C24 4 20 2 18 4" />
                      <path d="M36 8C40 4 44 2 46 4" />
                      <ellipse cx="32" cy="10" rx="6" ry="5" />
                      <ellipse cx="28" cy="9" rx="2.5" ry="3.5" fill="currentColor" stroke="none" />
                      <ellipse cx="36" cy="9" rx="2.5" ry="3.5" fill="currentColor" stroke="none" />
                      <ellipse cx="32" cy="17" rx="7" ry="5" />
                      <path d="M28 24C24 28 22 34 24 42 26 48 28 50 32 52 36 50 38 48 40 42 42 34 40 28 36 24" />
                      <path d="M27 28L37 28" />
                      <path d="M26 32L38 32" />
                      <path d="M25 36L39 36" />
                      <path d="M32 52L32 56" strokeWidth={1.5} />
                      <path d="M28 16C18 10 8 12 6 20 4 28 10 32 16 30 22 28 26 22 28 16" />
                      <path d="M36 16C46 10 56 12 58 20 60 28 54 32 48 30 42 28 38 22 36 16" />
                      <ellipse cx="14" cy="20" rx="2" ry="1.5" fill="currentColor" stroke="none" />
                      <ellipse cx="50" cy="20" rx="2" ry="1.5" fill="currentColor" stroke="none" />
                      <path d="M28 22L18 28L14 30" strokeWidth={2} />
                      <path d="M36 22L46 28L50 30" strokeWidth={2} />
                      <ellipse cx="16" cy="29" rx="2.5" ry="3" />
                      <ellipse cx="48" cy="29" rx="2.5" ry="3" />
                    </g>
                  )}
                  {q.glyphKey === "mantis" && (
                    <g>
                      <path d="M32 5l5 6H27z" />
                      <circle cx="29.7" cy="9.3" r="1" fill="currentColor" stroke="none" />
                      <circle cx="34.3" cy="9.3" r="1" fill="currentColor" stroke="none" />
                      <path d="M32 11v15" />
                      <path d="M32 26c-6 6-7 19 0 29 7-10 6-23 0-29Z" />
                      <path d="M31 14l-9-4-2 7 8 4M33 14l9-4 2 7-8 4" />
                    </g>
                  )}
                  {q.glyphKey === "grasshopper" && (
                    <g>
                      <path d="M24 10C16 2 8 0 2 4" strokeWidth={1.5} />
                      <path d="M40 10C48 2 56 0 62 4" strokeWidth={1.5} />
                      <circle cx="32" cy="12" r="7" />
                      <circle cx="27" cy="10" r="2.5" fill="currentColor" stroke="none" />
                      <circle cx="37" cy="10" r="2.5" fill="currentColor" stroke="none" />
                      <ellipse cx="32" cy="19" rx="12" ry="5" />
                      <ellipse cx="32" cy="36" rx="10" ry="9" />
                      <path d="M26 26L16 34C12 38 8 40 6 36" strokeWidth={4} />
                      <path d="M6 36L4 46L2 52" />
                      <path d="M38 26L48 34C52 38 56 40 58 36" strokeWidth={4} />
                      <path d="M58 36L60 46L62 52" />
                    </g>
                  )}
                  {q.glyphKey === "cicada" && (
                    <g>
                      <circle cx="20.5" cy="11" r="3" />
                      <circle cx="43.5" cy="11" r="3" />
                      <path d="M24 8h16l3 7H21z" />
                      <path d="M32 21c-10 3-17 13-16 27h32c1-14-6-24-16-27Z" />
                      <path d="M32 21v27" strokeWidth={1.5} />
                    </g>
                  )}
                  {q.glyphKey === "leaf" && (
                    <g>
                      <path d="M32 6C18 18 14 38 32 58c18-20 14-40 0-52Z" />
                      <path d="M32 6v52" />
                      <path d="M32 16l-10 8M32 16l10 8M32 26l-12 9M32 26l12 9" strokeWidth={1.5} />
                    </g>
                  )}
                  {q.glyphKey === "stag" && (
                    <g>
                      <path d="M28 12C23 9 21 4 25 1M36 12c5-3 7-8 3-11" />
                      <circle cx="32" cy="14" r="4" />
                      <path d="M32 23c-10 0-13 8-12 17 1 9 6 15 12 15s11-6 12-15c1-9-2-17-12-17Z" />
                      <path d="M32 23v32" />
                    </g>
                  )}
                  {q.glyphKey === "firefly" && (
                    <g>
                      <circle cx="32" cy="10" r="3.5" />
                      <path d="M32 20c-8 0-11 7-10 16 1 9 5 14 10 14s9-5 10-14c1-9-2-16-10-16Z" />
                      <path d="M32 20v30" />
                      <circle cx="32" cy="45" r="4.5" fill="#cdd97f" stroke="none" className="animate-pulse" />
                    </g>
                  )}
                  {q.glyphKey === "fly" && (
                    <g>
                      <circle cx="32" cy="12" r="4.5" />
                      <ellipse cx="18" cy="21" rx="11" ry="4.5" transform="rotate(-26 18 21)" />
                      <ellipse cx="46" cy="21" rx="11" ry="4.5" transform="rotate(26 46 21)" />
                      <path d="M32 28c-7 0-10 6-10 13 0 9 5 15 10 15s10-6 10-15c0-7-3-13-10-13Z" />
                    </g>
                  )}
                  {q.glyphKey === "bug" && (
                    <g>
                      <circle cx="32" cy="13" r="4" />
                      <ellipse cx="32" cy="23" rx="8" ry="5.5" />
                      <path d="M32 29c-8 0-11 7-11 15 0 9 6 15 11 15s11-6 11-15c0-8-3-15-11-15Z" />
                      <path d="M32 29v30" strokeWidth={1.5} />
                    </g>
                  )}
                  {q.glyphKey === "lacewing" && (
                    <g>
                      <path d="M32 8C28 2 22 0 18 2" />
                      <path d="M32 8C36 2 42 0 46 2" />
                      <circle cx="32" cy="10" r="3.5" />
                      <circle cx="29.5" cy="9.5" r="2" fill="currentColor" stroke="none" />
                      <circle cx="34.5" cy="9.5" r="2" fill="currentColor" stroke="none" />
                      <ellipse cx="32" cy="16" rx="3" ry="2.5" />
                      <path d="M29 17C18 14 8 18 6 28 4 36 10 42 20 40 28 38 30 30 29 17" />
                      <path d="M35 17C46 14 56 18 58 28 60 36 54 42 44 40 36 38 34 30 35 17" />
                      <path d="M32 18.5C33 22 34 28 33 34 32 38 31 42 30 46 29 48 30 49 32 49 34 49 35 48 34 46 33 42 32 38 31 34 30 28 31 22 32 18.5" />
                    </g>
                  )}
                  {q.glyphKey === "earwig" && (
                    <g>
                      <circle cx="32" cy="9" r="4" />
                      <circle cx="29" cy="8" r="1.5" fill="currentColor" stroke="none" />
                      <circle cx="35" cy="8" r="1.5" fill="currentColor" stroke="none" />
                      <ellipse cx="32" cy="15" rx="4.5" ry="2.5" />
                      <rect x="28" y="17" width="8" height="5" rx="0.5" />
                      <path d="M32 22C33 26 34 30 33 34 32 38 31 42 30 46 29 48 28 49 28 50" />
                      <path d="M32 22C31 26 30 30 31 34 32 38 33 42 34 46 35 48 36 49 36 50" />
                      <path d="M28 50C24 52 20 54 17 50 15 48 16 44 19 42" />
                      <path d="M36 50C40 52 44 54 47 50 49 48 48 44 45 42" />
                    </g>
                  )}
                  {q.glyphKey === "flea" && (
                    <g>
                      <ellipse cx="19" cy="16" rx="5" ry="6" />
                      <circle cx="17" cy="14" r="1.5" fill="currentColor" stroke="none" />
                      <ellipse cx="26" cy="18" rx="5" ry="7" />
                      <path d="M30 12C38 12 42 16 42 22 42 28 38 34 32 36 28 37 26 34 26 28 26 22 28 14 30 12" />
                      <path d="M28 18L20 26C18 28 16 30 14 28" strokeWidth={3} />
                      <path d="M14 28L10 38L8 44" />
                      <path d="M8 44L6 50" />
                      <path d="M6 50L4 52M6 50L8 52" />
                    </g>
                  )}
                  {q.glyphKey === "mayfly" && (
                    <g>
                      <circle cx="32" cy="8" r="4" />
                      <circle cx="29" cy="7" r="2.5" fill="currentColor" stroke="none" />
                      <circle cx="35" cy="7" r="2.5" fill="currentColor" stroke="none" />
                      <path d="M30 13C22 8 14 4 12 8 10 12 16 16 20 18 24 20 28 16 30 13" />
                      <path d="M34 13C42 8 50 4 52 8 54 12 48 16 44 18 40 20 36 16 34 13" />
                      <path d="M32 16C33 20 34 26 33 32 32 36 31 38 30 40" />
                      <path d="M32 16C31 20 30 26 31 32 32 36 33 38 34 40" />
                      <path d="M30 40C26 46 20 54 14 62" strokeWidth={1.5} />
                      <path d="M32 40C32 48 30 56 28 64" strokeWidth={1.5} />
                      <path d="M34 40C38 46 44 54 50 62" strokeWidth={1.5} />
                    </g>
                  )}
                  {q.glyphKey === "cockroach" && (
                    <g>
                      <path d="M24 14C18 6 10 2 4 4" strokeWidth={1.5} />
                      <path d="M40 14C46 6 54 2 60 4" strokeWidth={1.5} />
                      <ellipse cx="32" cy="16" rx="8" ry="5" />
                      <circle cx="26" cy="15" r="1.5" fill="currentColor" stroke="none" />
                      <circle cx="38" cy="15" r="1.5" fill="currentColor" stroke="none" />
                      <ellipse cx="32" cy="20" rx="14" ry="7" />
                      <ellipse cx="32" cy="34" rx="13" ry="12" />
                      <path d="M22 24C18 28 16 34 18 42 20 46 24 48 28 46" />
                      <path d="M42 24C46 28 48 34 46 42 44 46 40 48 36 46" />
                      <path d="M28 28L36 28" />
                      <path d="M27 32L37 32" />
                      <path d="M26 36L38 36" />
                      <path d="M27 40L37 40" />
                    </g>
                  )}
                  {q.glyphKey === "bristletail" && (
                    <g>
                      <path d="M14 20C10 16 4 14 2 16" strokeWidth={1.5} />
                      <ellipse cx="18" cy="22" rx="5" ry="4" />
                      <circle cx="16" cy="21" r="1.5" fill="currentColor" stroke="none" />
                      <path d="M18 26C22 30 30 36 42 40 54 44 58 42 60 40" />
                      <path d="M60 40L62 38L60 36" />
                      <path d="M60 42L62 40L60 38" />
                      <path d="M16 24L12 28L10 32" />
                      <path d="M20 24L24 28L26 32" />
                      <path d="M18 26L18 32L16 38" />
                    </g>
                  )}
                  {q.glyphKey === "webspinner" && (
                    <g>
                      <circle cx="18" cy="14" r="5" />
                      <circle cx="16" cy="13" r="1.5" fill="currentColor" stroke="none" />
                      <ellipse cx="34" cy="20" rx="8" ry="5" />
                      <path d="M42 20C46 22 50 26 52 32 54 38 52 44 48 48" />
                      <path d="M26 18L20 22L16 20" />
                      <path d="M42 22L48 26L52 24" />
                      <path d="M26 22L22 28L20 34" />
                      <path d="M42 26L46 32L48 38" />
                    </g>
                  )}
                  {q.glyphKey === "scorpionfly" && (
                    <g>
                      <ellipse cx="14" cy="18" rx="6" ry="4" />
                      <circle cx="12" cy="17" r="1.5" fill="currentColor" stroke="none" />
                      <ellipse cx="34" cy="20" rx="6" ry="4" />
                      <path d="M40 20C44 22 48 26 50 32 52 38 50 44 46 48" />
                      <path d="M20 16L16 12L12 8" strokeWidth={1.5} />
                      <path d="M46 48C42 52 38 54 34 52" />
                      <path d="M28 22L24 28L22 34" />
                      <path d="M40 26L44 32L46 38" />
                    </g>
                  )}
                  {q.glyphKey === "dobsonfly" && (
                    <g>
                      <circle cx="32" cy="12" r="5" />
                      <circle cx="29" cy="11" r="1.5" fill="currentColor" stroke="none" />
                      <circle cx="35" cy="11" r="1.5" fill="currentColor" stroke="none" />
                      <path d="M28 12L22 8L18 4" strokeWidth={1.5} />
                      <path d="M36 12L42 8L46 4" strokeWidth={1.5} />
                      <ellipse cx="32" cy="20" rx="5" ry="4" />
                      <path d="M28 22C18 18 8 20 6 26 4 32 8 36 14 34 20 32 26 26 28 22" />
                      <path d="M36 22C46 18 56 20 58 26 60 32 56 36 50 34 44 32 38 26 36 22" />
                      <path d="M20 24C16 24 12 26 10 28" />
                      <path d="M44 24C48 24 52 26 54 28" />
                      <path d="M32 24C33 30 34 36 33 42 32 46 31 48 30 50" />
                      <path d="M32 24C31 30 30 36 31 42 32 46 33 48 34 50" />
                    </g>
                  )}
                  {q.glyphKey === "stonefly" && (
                    <g>
                      <circle cx="32" cy="10" r="4" />
                      <circle cx="29.5" cy="9" r="1.5" fill="currentColor" stroke="none" />
                      <circle cx="34.5" cy="9" r="1.5" fill="currentColor" stroke="none" />
                      <ellipse cx="32" cy="18" rx="6" ry="4" />
                      <path d="M26 22C22 26 20 32 22 38 24 42 28 44 32 42" />
                      <path d="M38 22C42 26 44 32 42 38 40 42 36 44 32 42" />
                      <path d="M32 42C33 46 34 50 32 54" />
                      <path d="M32 42C31 46 30 50 32 54" />
                      <path d="M26 14L18 16L12 14" />
                      <path d="M38 14L46 16L52 14" />
                      <path d="M26 20L18 24L14 22" />
                      <path d="M38 20L46 24L50 22" />
                    </g>
                  )}
                  {q.glyphKey === "barklouse" && (
                    <g>
                      <ellipse cx="32" cy="14" rx="8" ry="6" />
                      <circle cx="28" cy="12" r="2.5" fill="currentColor" stroke="none" />
                      <circle cx="36" cy="12" r="2.5" fill="currentColor" stroke="none" />
                      <path d="M26 10C20 6 14 4 10 6" strokeWidth={1.5} />
                      <path d="M38 10C44 6 50 4 54 6" strokeWidth={1.5} />
                      <ellipse cx="32" cy="24" rx="5" ry="4" />
                      <path d="M28 26C24 30 22 36 24 40 26 44 30 46 32 44" />
                      <path d="M36 26C40 30 42 36 40 40 38 44 34 46 32 44" />
                      <path d="M26 16L20 20L16 18" />
                      <path d="M38 16L44 20L48 18" />
                    </g>
                  )}
                  {q.glyphKey === "snakefly" && (
                    <g>
                      <circle cx="14" cy="14" r="4" />
                      <circle cx="12" cy="13" r="1.5" fill="currentColor" stroke="none" />
                      <path d="M18 14C24 14 30 16 36 20" strokeWidth={1.5} />
                      <path d="M18 16C24 16 30 18 36 22" strokeWidth={1.5} />
                      <ellipse cx="40" cy="24" rx="6" ry="4" />
                      <path d="M46 24C50 26 54 30 56 36 58 42 56 48 52 50" />
                      <path d="M36 20L30 18L26 16" strokeWidth={1.5} />
                      <path d="M36 22L30 20L26 18" strokeWidth={1.5} />
                      <path d="M36 22L28 26L22 24" />
                      <path d="M44 24L50 28L54 26" />
                      <path d="M14 18L10 22L8 26" />
                    </g>
                  )}
                  {q.glyphKey === "twisted-wing" && (
                    <g>
                      <ellipse cx="32" cy="22" rx="6" ry="4" />
                      <circle cx="30" cy="21" r="1.5" fill="currentColor" stroke="none" />
                      <circle cx="34" cy="21" r="1.5" fill="currentColor" stroke="none" />
                      <path d="M26 24C22 28 20 34 22 38 24 42 28 44 32 42" />
                      <path d="M38 24C42 28 44 34 42 38 40 42 36 44 32 42" />
                      <path d="M32 18C22 14 12 16 8 22 6 26 10 30 16 28 22 26 28 20 32 18" />
                      <path d="M32 18C42 14 52 16 56 22 58 26 54 30 48 28 42 26 36 20 32 18" />
                      <path d="M32 42C33 46 34 50 32 54" />
                      <path d="M32 42C31 46 30 50 32 54" />
                    </g>
                  )}
                  {q.glyphKey === "thrip" && (
                    <g>
                      <ellipse cx="32" cy="10" rx="4" ry="3" />
                      <circle cx="30.5" cy="9.5" r="1" fill="currentColor" stroke="none" />
                      <circle cx="33.5" cy="9.5" r="1" fill="currentColor" stroke="none" />
                      <path d="M32 13C33 16 34 20 33 24 32 28 31 32 30 36" />
                      <path d="M32 13C31 16 30 20 31 24 32 28 33 32 34 36" />
                      <path d="M32 36C33 40 34 44 32 48 30 52 28 54 26 56" />
                      <path d="M32 36C31 40 30 44 32 48 34 52 36 54 38 56" />
                      <path d="M30 16L24 18L20 16" strokeWidth={1.5} />
                      <path d="M34 16L40 18L44 16" strokeWidth={1.5} />
                      <path d="M30 22L22 24L18 22" strokeWidth={1.5} />
                      <path d="M34 22L42 24L46 22" strokeWidth={1.5} />
                    </g>
                  )}
                  {q.glyphKey === "caddisfly" && (
                    <g>
                      <circle cx="32" cy="12" r="5" />
                      <circle cx="29" cy="11" r="1.5" fill="currentColor" stroke="none" />
                      <circle cx="35" cy="11" r="1.5" fill="currentColor" stroke="none" />
                      <path d="M26 10C20 6 14 4 10 6" strokeWidth={1.5} />
                      <path d="M38 10C44 6 50 4 54 6" strokeWidth={1.5} />
                      <ellipse cx="32" cy="20" rx="6" ry="4" />
                      <path d="M26 24C22 28 20 34 22 40 24 44 28 46 32 44" />
                      <path d="M38 24C42 28 44 34 42 40 40 44 36 46 32 44" />
                      <path d="M26 22L18 26L14 24" />
                      <path d="M38 22L46 26L50 24" />
                      <path d="M26 28L18 32L14 30" />
                      <path d="M38 28L46 32L50 30" />
                    </g>
                  )}
                  {q.glyphKey === "angel-insect" && (
                    <g>
                      <ellipse cx="32" cy="12" rx="5" ry="4" />
                      <circle cx="30" cy="11" r="1.5" fill="currentColor" stroke="none" />
                      <circle cx="34" cy="11" r="1.5" fill="currentColor" stroke="none" />
                      <ellipse cx="32" cy="20" rx="5" ry="4" />
                      <path d="M28 22C24 26 22 32 24 38 26 42 30 44 32 42" />
                      <path d="M36 22C40 26 42 32 40 38 38 42 34 44 32 42" />
                      <path d="M32 42C33 46 34 50 32 54" />
                      <path d="M32 42C31 46 30 50 32 54" />
                      <path d="M28 18L20 20L16 18" />
                      <path d="M36 18L44 20L48 18" />
                      <path d="M28 24L20 26L16 24" />
                      <path d="M36 24L44 26L48 24" />
                    </g>
                  )}
                  {q.glyphKey === "silverfish" && (
                    <g>
                      <ellipse cx="18" cy="16" rx="6" ry="5" />
                      <circle cx="16" cy="15" r="1.5" fill="currentColor" stroke="none" />
                      <path d="M24 14C30 14 38 16 46 20 54 24 58 30 60 36" />
                      <path d="M24 16C30 16 38 18 46 22 54 26 58 32 60 38" />
                      <path d="M60 36L62 34L60 32" />
                      <path d="M60 38L62 36L60 34" />
                      <path d="M14 20L10 24L8 28" />
                      <path d="M22 20L26 24L28 28" />
                      <path d="M14 22L10 26L8 30" />
                      <path d="M22 22L26 26L28 30" />
                    </g>
                  )}
                </svg>
              </div>
            </div>
          )}

          {/* Specimen photo for daily/expedition/speed modes */}
          {q.displayLabel && !q.glyphKey && (
            <div className="mb-6 flex justify-center">
              <div className="label-frame bg-pine/80 overflow-hidden" style={{ width: 220, height: 220 }}>
                {questionImage ? (
                  <img
                    src={questionImage}
                    alt={q.displayLabel}
                    className="h-full w-full object-cover"
                    loading="eager"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center shimmer">
                    <span className="text-[10px] font-bold tracking-[0.14em] text-sage/50 uppercase">
                      Cargando espécimen…
                    </span>
                  </div>
                )}
                <div className="border-t border-moss/40 px-3 py-2 text-center">
                  <p className="text-[9px] font-bold tracking-[0.14em] text-sage/60 uppercase">
                    Espécimen #{questions.indexOf(q) + 1}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Ecosystem label badge */}
          {q.ecosystemLabel && (
            <div className="mb-4 flex justify-center">
              <span className="border border-teal/40 bg-teal/10 px-3 py-1 text-[10px] font-bold tracking-[0.14em] text-teal uppercase">
                {q.ecosystemLabel}
              </span>
            </div>
          )}

          {/* Question text */}
          {q.chainItems ? (
            <div className="mb-8 text-center">
              <p className="mb-4 text-sm font-bold text-parch sm:text-base"><ItalicLatin text={q.question} /></p>
              <div className="mx-auto max-w-3xl px-2 sm:px-0">
                <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 sm:flex-nowrap sm:gap-x-0.5">
                  {q.chainItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-0.5 sm:gap-0.5">
                      {i > 0 && (
                        <span className="text-[10px] font-bold text-moss sm:mx-0.5">→</span>
                      )}
                      <div className={`flex flex-col items-center ${item.isBlank ? "min-w-[50px] sm:min-w-[60px]" : ""}`}>
                        <span className="text-[7px] font-bold tracking-[0.10em] text-sage/60 uppercase sm:text-[8px]">
                          {item.rank}
                        </span>
                        {item.isBlank ? (
                          <span className="mt-0.5 border-b-2 border-dashed border-amber px-2 py-0.5 text-xs font-black text-amber animate-pulse sm:text-sm">
                            ?
                          </span>
                        ) : (
                          <span className="mt-0.5 border border-moss/40 bg-ink/50 px-1.5 py-0.5 text-[10px] font-semibold text-bone/80 sm:text-[11px] sm:px-2">
                            {item.value}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : q.envText ? (
            <div className="mb-8 text-center">
              <p className="mb-2 text-[10px] font-bold tracking-[0.14em] text-amber uppercase">
                Entorno
              </p>
              <blockquote className="mb-4 border-l-2 border-amber/40 bg-amber/5 px-4 py-3 text-base italic leading-relaxed text-bone/80 sm:text-lg">
                &ldquo;{q.envText}&rdquo;
              </blockquote>
              <p className="font-display text-lg font-bold leading-snug text-parch sm:text-xl">
                <ItalicLatin text={q.question} />
              </p>
            </div>
          ) : (() => {
            const splitIdx = q.question.indexOf("¿");
            if (splitIdx > 0) {
              const context = q.question.slice(0, splitIdx).trim();
              const questionPart = q.question.slice(splitIdx);
              return (
                <div className="mb-8 text-center">
                  <p className="mb-3 text-xs leading-relaxed text-bone/60 sm:text-sm">
                    <ItalicLatin text={context} />
                  </p>
                  <p className="font-display text-base font-bold leading-snug text-parch sm:text-lg">
                    <ItalicLatin text={questionPart} />
                  </p>
                </div>
              );
            }
            return (
              <p className="mb-8 text-center font-display text-lg font-bold leading-snug text-parch sm:text-xl whitespace-pre-line">
                <ItalicLatin text={q.question} />
              </p>
            );
          })()}


          {/* Cryptid hints */}
          {q.hints && q.hints.length > 0 && (
            <div className="mb-6 label-frame bg-pine/80 p-4">
              <p className="mb-3 text-[10px] font-bold tracking-[0.16em] text-amber uppercase">
                🔍 Pistas del espécimen misterioso
              </p>
              <div className="space-y-2">
                {q.hints.map((hint, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 text-amber text-xs">▸</span>
                    <p className="text-sm leading-relaxed text-bone/80">{hint}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {q.options.map((opt, i) => {
              const isSelected = feedback?.selected === i;
              const isCorrectOption = i === q.correctIndex;
              const showResult = phase === "feedback";

              let btnClass =
                "border border-moss bg-pine/80 px-4 py-3 text-left text-xs font-semibold transition-all ";

              if (showResult) {
                if (isCorrectOption) {
                  btnClass += "border-sage bg-sage/15 text-sage ";
                } else if (isSelected && !feedback?.correct) {
                  btnClass += "border-rust bg-rust/15 text-rust ";
                } else {
                  btnClass += "opacity-40 ";
                }
              } else {
                btnClass += "text-bone hover:border-amber/60 hover:bg-amber/5 hover:text-amber cursor-pointer ";
              }

              return (
                <button
                  key={i}
                  onClick={() => phase === "playing" && handleAnswer(i)}
                  disabled={phase !== "playing"}
                  className={`${btnClass} grid grid-cols-[auto_1fr] items-center gap-2.5`}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center border border-current text-[9px] font-bold">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="min-w-0 leading-snug">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile feedback — below options */}
          {phase === "feedback" && feedback && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`mt-4 border-l-4 px-3 py-2 text-[11px] font-semibold ${
                feedback.correct
                  ? "border-sage bg-sage/10 text-sage"
                  : "border-rust bg-rust/10 text-rust"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="shrink-0">{feedback.correct ? "✓" : "✕"}</span>
                <span>
                  {feedback.correct
                    ? `+${feedback.pointsEarned} pts`
                    : feedback.correctAnswer}
                </span>
                {feedback.correct && streak >= 3 && (
                  <span className="shrink-0 text-amber">🔥×{streak >= 10 ? 3 : streak >= 5 ? 2 : 1.5}</span>
                )}
              </div>
              <p className="mt-1 text-[10px] opacity-70 leading-tight"><ItalicLatin text={feedback.explanation} /></p>
            </motion.div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** Renders text with Latin binomial names auto-italicized (e.g. "Apis mellifera") */
function ItalicLatin({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/([A-Z][a-z]+ [a-z]+(?: [a-z]+)?)/g);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        /^[A-Z][a-z]+ [a-z]+/.test(part) ? (
          <em key={i}>{part}</em>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
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
