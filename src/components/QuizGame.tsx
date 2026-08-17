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
  type PlayerProfile,
} from "../lib/quizEngine";
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
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [timeLeft, setTimeLeft] = useState(100); // percentage
  const [responseTimes, setResponseTimes] = useState<number[]>([]);

  const questionStartTime = useRef(0);
  const timerRef = useRef<number | undefined>(undefined);
  const feedbackTimerRef = useRef<number | undefined>(undefined);

  // Initialize questions and countdown
  useEffect(() => {
    const qs = generateQuestions(mode);
    setQuestions(qs);

    // Countdown
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

    return () => {
      clearInterval(interval);
      window.clearTimeout(feedbackTimerRef.current);
      window.clearInterval(timerRef.current);
    };
  }, [mode]);

  // Timer logic
  useEffect(() => {
    if (phase !== "playing" || !questions[currentQ]) return;

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

  const handleAnswer = useCallback(
    (selectedIndex: number) => {
      window.clearInterval(timerRef.current);

      const q = questions[currentQ];
      if (!q) return;

      const responseTime = Date.now() - questionStartTime.current;
      const isCorrect = selectedIndex === q.correctIndex;

      const newStreak = isCorrect ? streak + 1 : 0;
      const newBestStreak = Math.max(bestStreak, newStreak);
      setStreak(newStreak);
      setBestStreak(newBestStreak);

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

      // Track mastery for this specimen
      const { profile: profileAfterMastery, justMastered } = trackMastery(
        profile,
        q.specimenId ?? null,
        isCorrect
      );
      if (justMastered) {
        // Store the mastery toast info to show after feedback
        window.setTimeout(() => {
          // Use a custom event to trigger toast in App
          window.dispatchEvent(
            new CustomEvent("insecta:mastery", { detail: { specimenId: q.specimenId } })
          );
        }, 2600);
      }
      // Update profile in background (mastery counter)
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
        if (currentQ + 1 < questions.length) {
          setCurrentQ((c) => c + 1);
          setPhase("playing");
        } else {
          // Round complete — use profileAfterMastery which has updated counters
          const finalCorrect = isCorrect ? correctCount + 1 : correctCount;
          const finalScore = score + pointsEarned;
          const xpEarned = finalCorrect * 100 + newBestStreak * 50;
          const coinsFinal = totalCoins + coinsEarned;

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
    [questions, currentQ, streak, bestStreak, score, correctCount, totalCoins, profile, mode, onProfileUpdate]
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
        onReplay={() => {
          setQuestions(generateQuestions(mode));
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
    <div className="mx-auto max-w-2xl">
      {/* Top bar: score + streak + progress */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="font-display text-2xl font-black text-amber tabular-nums">
            {score}
          </span>
          {streak >= 2 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 border border-amber/40 bg-amber/10 px-2.5 py-1 text-sm font-bold text-amber"
            >
              {streak}🔥
            </motion.span>
          )}
        </div>
        <span className="text-[11px] font-bold tracking-[0.14em] text-sage uppercase tabular-nums">
          {currentQ + 1} / {questions.length}
        </span>
      </div>

      {/* Timer bar */}
      {mode !== "classify-order" && (
        <div className="mb-6 h-1.5 bg-ink/80">
          <motion.div
            className={`h-full ${timerColor}`}
            initial={{ width: "100%" }}
            animate={{ width: `${timeLeft}%` }}
            transition={{ duration: 0.05, ease: "linear" }}
          />
        </div>
      )}

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
                      <circle cx="32" cy="10" r="4" />
                      <path d="M32 26c-7 0-9 6-9 13 0 8 4 13 9 13s9-5 9-13c0-7-2-13-9-13Z" />
                      <path d="M24 33q8 3 16 0M23.5 39q8.5 3 17 0" strokeWidth={1.5} />
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
                      <circle cx="15" cy="22" r="5" />
                      <path d="M19 19c11-7 25-5 32 5 3 6-1 12-8 12H21c-2-4-3-10-2-17Z" />
                      <path d="M14 18 5 7M16 17 9 5" />
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
                </svg>
              </div>
            </div>
          )}

          {/* Question text */}
          <p className="mb-8 text-center font-display text-xl font-bold leading-snug text-parch sm:text-2xl">
            {q.question}
          </p>

          {/* Options */}
          <div className="grid gap-3">
            {q.options.map((opt, i) => {
              const isSelected = feedback?.selected === i;
              const isCorrectOption = i === q.correctIndex;
              const showResult = phase === "feedback";

              let btnClass =
                "border border-moss bg-pine/80 px-5 py-4 text-left text-sm font-semibold transition-all ";

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
                  className={btnClass}
                >
                  <span className="mr-3 inline-flex h-6 w-6 shrink-0 items-center justify-center border border-current text-[10px] font-bold">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Feedback explanation */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div
                  className={`mt-4 border-l-4 px-4 py-3 ${
                    feedback.correct
                      ? "border-sage bg-sage/10 text-sage"
                      : "border-rust bg-rust/10 text-rust/90"
                  }`}
                >
                  <p className="text-sm font-semibold">
                    {feedback.correct ? (
                      <>
                        ¡Correcto! +{feedback.pointsEarned} pts
                        {streak >= 3 && (
                          <span className="ml-2 text-amber">Racha ×{streak >= 10 ? 3 : streak >= 5 ? 2 : 1.5}</span>
                        )}
                      </>
                    ) : (
                      <>
                        Incorrecto — la respuesta era{" "}
                        <span className="font-bold">{feedback.correctAnswer}</span>
                      </>
                    )}
                  </p>
                  <p className="mt-1 text-xs opacity-80">{feedback.explanation}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
