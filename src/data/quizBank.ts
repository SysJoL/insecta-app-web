import { SPECIMENS } from "./insects";
import { GENERA, EPITHETS } from "./academic";
import type { GlyphKey } from "./insects";

/* ------------------------------------------------------------------ */
/*  Tipos del quiz                                                     */
/* ------------------------------------------------------------------ */

export type QuizMode =
  | "speed-scientific"
  | "classify-order"
  | "identify-glyph"
  | "etymology"
  | "taxonomy-chain";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  /** Para modo glyph: la key del SVG */
  glyphKey?: GlyphKey;
  /** Para modo velocidad: nombre vulgar mostrado */
  displayLabel?: string;
  /** Para modo cadena: el nivel que se rellena */
  chainLevel?: string;
}

export interface QuizModeInfo {
  id: QuizMode;
  name: string;
  shortName: string;
  icon: string;
  description: string;
  color: string; // tailwind color class
}

/* ------------------------------------------------------------------ */
/*  Información de los modos                                           */
/* ------------------------------------------------------------------ */

export const QUIZ_MODES: QuizModeInfo[] = [
  {
    id: "speed-scientific",
    name: "Velocidad Científica",
    shortName: "Velocidad",
    icon: "⚡",
    description: "¿Sabes el nombre científico? Elige entre 4 opciones antes de que se agote el tiempo.",
    color: "amber",
  },
  {
    id: "classify-order",
    name: "Clasifica el Orden",
    shortName: "Órdenes",
    icon: "🏷️",
    description: "Arrastra cada especie a su orden correcto: Coleoptera, Lepidoptera, Hymenoptera…",
    color: "sage",
  },
  {
    id: "identify-glyph",
    name: "¿Qué Orden Es?",
    shortName: "Glyphs",
    icon: "🔬",
    description: "Reconoce el orden a partir de su lámina xilográfica: ¿cuál es este insecto?",
    color: "teal",
  },
  {
    id: "etymology",
    name: "Etimología Viva",
    shortName: "Etimología",
    icon: "📖",
    description: "Descubre qué significan los nombres griegos y latinos de los insectos.",
    color: "rust",
  },
  {
    id: "taxonomy-chain",
    name: "Completa la Cadena",
    shortName: "Cadena",
    icon: "🧬",
    description: "Rellena el eslabón faltante en la cadena taxonómica: Reino → Filo → Clase → Orden…",
    color: "limey",
  },
];

/* ------------------------------------------------------------------ */
/*  Utilidades                                                         */
/* ------------------------------------------------------------------ */

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[], count: number, exclude?: T): T[] {
  const filtered = exclude ? arr.filter((x) => x !== exclude) : [...arr];
  return shuffle(filtered).slice(0, count);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* ------------------------------------------------------------------ */
/*  Generadores de preguntas por modo                                   */
/* ------------------------------------------------------------------ */

/**
 * MODO 1: Velocidad Científica
 * Muestra el nombre vulgar → elige el latín correcto
 */
export function generateSpeedScientific(): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const allLatin = SPECIMENS.map((s) => s.latin);

  for (const s of shuffle(SPECIMENS)) {
    const distractors = pickRandom(allLatin, 3, s.latin);
    const options = shuffle([s.latin, ...distractors]);

    questions.push({
      question: s.name,
      options,
      correctIndex: options.indexOf(s.latin),
      explanation: `${s.latin} — ${s.traits[0]}. ${s.desc.slice(0, 80)}…`,
      displayLabel: s.name,
    });
  }

  return shuffle(questions).slice(0, 10);
}

/**
 * MODO 2: Clasifica el Orden
 * Muestra un especimen → elige su orden
 */
export function generateClassifyOrder(): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const allOrders = [...new Set(SPECIMENS.map((s) => s.order))];

  for (const s of shuffle(SPECIMENS)) {
    const distractors = pickRandom(allOrders, 3, s.order);
    const options = shuffle([s.order, ...distractors]);

    questions.push({
      question: `¿A qué orden pertenece ${s.latin}?`,
      options,
      correctIndex: options.indexOf(s.order),
      explanation: `${s.latin} pertenece al orden ${s.order}. ${s.traits[0]}.`,
      displayLabel: s.name,
      glyphKey: s.orderKey,
    });
  }

  return shuffle(questions).slice(0, 10);
}

/**
 * MODO 3: ¿Qué Orden Es?
 * Muestra un glyph → elige el orden
 */
export function generateIdentifyGlyph(): QuizQuestion[] {
  const GLYPH_TO_ORDER: Partial<Record<GlyphKey, string>> = {
    beetle: "Coleoptera",
    stag: "Coleoptera",
    firefly: "Coleoptera",
    butterfly: "Lepidoptera",
    bee: "Hymenoptera",
    dragonfly: "Odonata",
    mantis: "Mantodea",
    grasshopper: "Orthoptera",
    cicada: "Hemiptera",
    leaf: "Phasmatodea",
    fly: "Diptera",
    bug: "Hemiptera",
  };

  const allGlyphs = Object.keys(GLYPH_TO_ORDER) as GlyphKey[];
  const allOrders = [...new Set(Object.values(GLYPH_TO_ORDER))];

  const questions: QuizQuestion[] = [];

  for (const glyph of shuffle(allGlyphs)) {
    const correctOrder = GLYPH_TO_ORDER[glyph]!;
    const distractors = pickRandom(allOrders, 3, correctOrder);
    const options = shuffle([correctOrder, ...distractors]);

    questions.push({
      question: "¿Qué orden representa esta lámina?",
      options,
      correctIndex: options.indexOf(correctOrder),
      explanation: `La lámina corresponde al orden ${correctOrder}.`,
      glyphKey: glyph,
    });
  }

  return shuffle(questions).slice(0, 10);
}

/**
 * MODO 4: Etimología Viva
 * Muestra el significado de un término → elige la especie o concepto correcto
 */
export function generateEtymology(): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  // Preguntas de género: "¿Qué significa 'Apis'?" → "abeja"
  const genusKeys = Object.keys(GENERA);
  for (const key of shuffle(genusKeys).slice(0, 5)) {
    const gen = GENERA[key];
    const distractors = pickRandom(
      genusKeys.filter((k) => GENERA[k].meaning !== gen.meaning),
      3
    ).map((k) => GENERA[k].meaning);

    const correctMeaning = gen.meaning;
    const options = shuffle([correctMeaning, ...distractors]);

    questions.push({
      question: `¿Qué significa "${key}" en latín/griego?`,
      options,
      correctIndex: options.indexOf(correctMeaning),
      explanation: `"${key}" (${gen.lang}) significa "${gen.meaning}".${gen.detail ? " " + gen.detail : ""}`,
      displayLabel: key,
    });
  }

  // Preguntas de epíteto
  const epithetKeys = Object.keys(EPITHETS);
  for (const key of shuffle(epithetKeys).slice(0, 5)) {
    const ep = EPITHETS[key];
    const distractors = pickRandom(
      epithetKeys.filter((k) => EPITHETS[k].meaning !== ep.meaning),
      3
    ).map((k) => EPITHETS[k].meaning);

    const correctMeaning = ep.meaning;
    const options = shuffle([correctMeaning, ...distractors]);

    questions.push({
      question: `¿Qué significa "${key}" como epíteto específico?`,
      options,
      correctIndex: options.indexOf(correctMeaning),
      explanation: `"${key}" (${ep.lang}) significa "${ep.meaning}".${ep.detail ? " " + ep.detail : ""}`,
      displayLabel: key,
    });
  }

  return shuffle(questions).slice(0, 10);
}

/**
 * MODO 5: Completa la Cadena
 * Muestra una cadena taxonómica con un nivel faltante
 */
export function generateTaxonomyChain(): QuizQuestion[] {
  const CHAINS: { chain: string[]; blankIndex: number; label: string }[] = [
    { chain: ["Animalia", "Arthropoda", "Insecta", "Coleoptera", "Scarabaeidae", "Goliathus", "G. goliatus"], blankIndex: 3, label: "Goliat" },
    { chain: ["Animalia", "Arthropoda", "Insecta", "Lepidoptera", "Nymphalidae", "Morpho", "M. menelaus"], blankIndex: 3, label: "Morpho azul" },
    { chain: ["Animalia", "Arthropoda", "Insecta", "Hymenoptera", "Apidae", "Apis", "A. mellifera"], blankIndex: 3, label: "Abeja europea" },
    { chain: ["Animalia", "Arthropoda", "Insecta", "Odonata", "Aeshnidae", "Anax", "A. imperator"], blankIndex: 3, label: "Libélula emperador" },
    { chain: ["Animalia", "Arthropoda", "Insecta", "Mantodea", "Mantidae", "Mantis", "M. religiosa"], blankIndex: 3, label: "Mantis religiosa" },
    { chain: ["Animalia", "Arthropoda", "Insecta", "Orthoptera", "Gryllidae", "Gryllus", "G. campestris"], blankIndex: 3, label: "Grillo campestre" },
    { chain: ["Animalia", "Arthropoda", "Insecta", "Hemiptera", "Cicadidae", "Cicada", "C. orni"], blankIndex: 3, label: "Cigarra común" },
    { chain: ["Animalia", "Arthropoda", "Insecta", "Coleoptera", "Lucanidae", "Lucanus", "L. cervus"], blankIndex: 3, label: "Ciervo volante" },
    { chain: ["Animalia", "Arthropoda", "Insecta", "Hymenoptera", "Vespidae", "Vespa", "V. crabro"], blankIndex: 3, label: "Avispón europeo" },
    { chain: ["Animalia", "Arthropoda", "Insecta", "Lepidoptera", "Nymphalidae", "Vanessa", "V. atalanta"], blankIndex: 3, label: "Almirante rojo" },
    { chain: ["Animalia", "Arthropoda", "Insecta", "Coleoptera", "Lampyridae", "Lampyris", "L. noctiluca"], blankIndex: 3, label: "Luciérnaga europea" },
    { chain: ["Animalia", "Arthropoda", "Insecta", "Phasmatodea", "Phylliidae", "Phyllium", "P. philippinicum"], blankIndex: 3, label: "Insecto hoja" },
    { chain: ["Animalia", "Arthropoda", "Insecta", "Lepidoptera", "Papilionidae", "Papilio", "P. machaon"], blankIndex: 3, label: "Cola de golondrina" },
    // Familia como blank
    { chain: ["Animalia", "Arthropoda", "Insecta", "Coleoptera", "___", "Dynastes", "D. hercules"], blankIndex: 4, label: "Escarabajo hércules" },
    { chain: ["Animalia", "Arthropoda", "Insecta", "Lepidoptera", "___", "Papilio", "P. machaon"], blankIndex: 4, label: "Cola de golondrina" },
  ];

  const allOrders = [...new Set(SPECIMENS.map((s) => s.order))];
  const allFamilies = [...new Set(SPECIMENS.map((s) => s.family))];
  const allRanks = ["Reino", "Filo", "Clase", "Orden", "Familia", "Género", "Especie"];
  const RANK_LABELS: Record<number, string> = {
    0: "Reino",
    1: "Filo",
    2: "Clase",
    3: "Orden",
    4: "Familia",
    5: "Género",
    6: "Especie",
  };

  const questions: QuizQuestion[] = [];

  for (const c of shuffle(CHAINS).slice(0, 10)) {
    const blank = c.chain[c.blankIndex];
    const correctAnswer = blank;
    const rankName = RANK_LABELS[c.blankIndex] ?? "Nivel";

    // Generar distractores del mismo tipo
    let pool: string[];
    if (c.blankIndex <= 3) pool = allOrders;
    else if (c.blankIndex === 4) pool = allFamilies;
    else pool = SPECIMENS.map((s) => s.latin.split(" ")[0]);

    const distractors = pickRandom(pool, 3, correctAnswer);
    const options = shuffle([correctAnswer, ...distractors]);

    // Visualizar la cadena con ___
    const chainVisual = c.chain
      .map((v, i) => (i === c.blankIndex ? "___" : v))
      .join(" → ");

    questions.push({
      question: `Completa la cadena taxonómica de ${c.label}:\n${chainVisual}`,
      options,
      correctIndex: options.indexOf(correctAnswer),
      explanation: `El ${rankName} correcto es "${correctAnswer}".`,
      displayLabel: c.label,
      chainLevel: rankName,
    });
  }

  return shuffle(questions).slice(0, 10);
}

/* ------------------------------------------------------------------ */
/*  Router principal                                                    */
/* ------------------------------------------------------------------ */

export function generateQuestions(mode: QuizMode): QuizQuestion[] {
  switch (mode) {
    case "speed-scientific":
      return generateSpeedScientific();
    case "classify-order":
      return generateClassifyOrder();
    case "identify-glyph":
      return generateIdentifyGlyph();
    case "etymology":
      return generateEtymology();
    case "taxonomy-chain":
      return generateTaxonomyChain();
    default:
      return generateSpeedScientific();
  }
}
