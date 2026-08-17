/**
 * Web Audio API — synthetic sound effects for the quiz game.
 * No external files needed. All sounds generated procedurally.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = "square",
  volume = 0.15,
  decay = true
) {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();

  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;

  if (decay) {
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  }

  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + duration);
}

function playChord(freqs: number[], duration: number, type: OscillatorType = "sine", volume = 0.08) {
  freqs.forEach((f) => playTone(f, duration, type, volume));
}

function vibrate(pattern: number | number[]) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

/** Soft click — button tap */
export function sfxClick() {
  playTone(800, 0.05, "sine", 0.08);
}

/** Correct answer — bright ascending notes */
export function sfxCorrect() {
  playTone(523, 0.12, "sine", 0.12); // C5
  setTimeout(() => playTone(659, 0.12, "sine", 0.12), 80); // E5
  setTimeout(() => playTone(784, 0.18, "sine", 0.10), 160); // G5
  vibrate(30);
}

/** Wrong answer — descending buzz */
export function sfxWrong() {
  playTone(330, 0.15, "sawtooth", 0.08); // E4
  setTimeout(() => playTone(262, 0.2, "sawtooth", 0.06), 100); // C4
  vibrate([50, 30, 50]);
}

/** Streak bonus — shimmering arpeggio */
export function sfxStreak() {
  const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.15, "sine", 0.06), i * 60);
  });
  vibrate([20, 20, 20]);
}

/** Level up — triumphant fanfare */
export function sfxLevelUp() {
  playChord([523, 659, 784], 0.3, "sine", 0.08); // C major
  setTimeout(() => playChord([659, 784, 1047], 0.4, "sine", 0.10), 200); // E major
  setTimeout(() => playChord([784, 988, 1175], 0.5, "sine", 0.12), 400); // G major
  vibrate([30, 50, 30, 50, 100]);
}

/** Countdown tick */
export function sfxCountdown() {
  playTone(440, 0.06, "sine", 0.06);
}

/** Countdown go */
export function sfxGo() {
  playTone(880, 0.1, "sine", 0.1);
}

/** Mastery unlocked — magical sparkle */
export function sfxMastery() {
  const notes = [1047, 1319, 1568, 2093]; // C6 E6 G6 C7
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.2, "sine", 0.05), i * 80);
  });
  vibrate([20, 40, 20, 40, 80]);
}

/** Expedition station complete — milestone */
export function sfxStation() {
  playTone(659, 0.1, "triangle", 0.1);
  setTimeout(() => playTone(880, 0.15, "triangle", 0.1), 100);
}

/** Game over — descending */
export function sfxGameOver() {
  playTone(392, 0.2, "sawtooth", 0.06); // G4
  setTimeout(() => playTone(330, 0.2, "sawtooth", 0.06), 200); // E4
  setTimeout(() => playTone(262, 0.3, "sawtooth", 0.05), 400); // C4
  vibrate([100, 50, 200]);
}
