import { SPECIMENS } from "./insects";
import { GENERA, EPITHETS } from "./academic";
import { TAXONOMY_CHAINS, type TaxonomyChain } from "./taxonomyChains";
import { fetchTaxonDetail, fetchWikipediaEtymology } from "../lib/inat";
import type { GlyphKey } from "./insects";

/* ------------------------------------------------------------------ */
/*  Specimen type for quiz generators (works with curated + iNat)       */
/* ------------------------------------------------------------------ */

export interface QuizSpecimen {
  id: string;
  name: string;
  latin: string;
  order: string;
  traits: string[];
  habitat?: string;
}

/** Convert curated SPECIMENS to QuizSpecimen */
export function specimensToQuizSpecimens(): QuizSpecimen[] {
  return SPECIMENS.map((s) => ({
    id: s.id,
    name: s.name,
    latin: s.latin,
    order: s.order,
    traits: s.traits,
    habitat: s.habitat,
  }));
}

/* ------------------------------------------------------------------ */
/*  Tipos del quiz                                                     */
/* ------------------------------------------------------------------ */

export type QuizMode =
  | "speed-scientific"
  | "classify-order"
  | "etymology"
  | "taxonomy-chain"
  | "evolution"
  | "cryptid"
  | "daily"
  | "expedition";

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
  /** Para modo cadena: items estructurados de la cadena taxonómica */
  chainItems?: { rank: string; value: string; isBlank: boolean }[];
  /** ID del espécimen al que se refiere la pregunta (para mastery tracking) */
  specimenId?: string;
  /** Para modo criptida: pistas progresivas que se revelan */
  hints?: string[];
  /** URL de imagen real del espécimen (iNaturalist) */
  image?: string;
  /** Nombre científico para buscar foto precisa en iNaturalist */
  latinName?: string;
  /** Para modo evolución: texto del entorno (separate rendering) */
  envText?: string;
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
  {
    id: "evolution",
    name: "Ingeniería Evolutiva",
    shortName: "Evolución",
    icon: "🦎",
    description: "Elige la adaptación correcta para sobrevivir en un entorno específico. Evolución en acción.",
    color: "sage",
  },
  {
    id: "cryptid",
    name: "Cazador de Criptidas",
    shortName: "Criptidas",
    icon: "🔍",
    description: "Tres pistas críticas: etimología, hábitat y rasgo. ¿Puedes identificar al espécimen antes de que desaparezca?",
    color: "rust",
  },
  {
    id: "daily",
    name: "Desafío Diario",
    shortName: "Diario",
    icon: "📅",
    description: "Un espécimen misterioso cada día. Sin timer, sin presión — solo tu conocimiento. ¿Acertarás hoy?",
    color: "amber",
  },
  {
    id: "expedition",
    name: "Expedición",
    shortName: "Expedición",
    icon: "🗺️",
    description: "5 estaciones, 3 vidas. Cada estación es un reto de entomología. ¿Sobrevivirás al final del camino?",
    color: "teal",
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
export function generateSpeedScientific(pool?: QuizSpecimen[]): QuizQuestion[] {
  const specimens = pool ?? specimensToQuizSpecimens();
  const questions: QuizQuestion[] = [];
  const allLatin = specimens.map((s) => s.latin);

  for (const s of shuffle(specimens)) {
    const distractors = pickRandom(allLatin, 3, s.latin);
    const options = shuffle([s.latin, ...distractors]);

    questions.push({
      question: s.name,
      options,
      correctIndex: options.indexOf(s.latin),
      explanation: `${s.latin} — ${s.traits[0] ?? "Especie del orden " + s.order}.`,
      displayLabel: s.name,
      latinName: s.latin,
      specimenId: s.id,
    });
  }

  return shuffle(questions).slice(0, 10);
}

/**
 * MODO 2: Clasifica el Orden
 * Muestra un especimen → elige su orden
 */
export function generateClassifyOrder(pool?: QuizSpecimen[]): QuizQuestion[] {
  const specimens = pool ?? specimensToQuizSpecimens();
  const questions: QuizQuestion[] = [];
  const allOrders = [...new Set(specimens.map((s) => s.order))];

  for (const s of shuffle(specimens)) {
    const distractors = pickRandom(allOrders, 3, s.order);
    const options = shuffle([s.order, ...distractors]);

    questions.push({
      question: `¿A qué orden pertenece ${s.latin}?`,
      options,
      correctIndex: options.indexOf(s.order),
      explanation: `${s.latin} pertenece al orden ${s.order}. ${s.traits[0] ?? ""}`,
      displayLabel: s.name,
      latinName: s.latin,
      glyphKey: SPECIMENS.find((sp) => sp.latin === s.latin)?.orderKey,
      specimenId: s.id,
    });
  }

  return shuffle(questions).slice(0, 10);
}

/**
 * MODO 4: Etimología Viva (híbrida: local + Wikipedia)
 * Muestra el significado de un término → elige la especie o concepto correcto
 */
export async function generateEtymology(pool?: QuizSpecimen[]): Promise<QuizQuestion[]> {
  interface EtymEntry {
    word: string;
    lang: string;
    meaning: string;
    detail?: string;
    source: "local" | "wikipedia";
  }

  // 1. Start with local data
  const entries: EtymEntry[] = [];
  for (const [word, ep] of Object.entries(GENERA)) {
    entries.push({ word, lang: ep.lang, meaning: ep.meaning, detail: ep.detail, source: "local" });
  }
  for (const [word, ep] of Object.entries(EPITHETS)) {
    entries.push({ word, lang: ep.lang, meaning: ep.meaning, detail: ep.detail, source: "local" });
  }

  // 2. Fetch from Wikipedia for pool specimens (genus + epithet)
  if (pool && pool.length > 0) {
    const seen = new Set(entries.map((e) => e.word.toLowerCase()));
    const fetches: Promise<void>[] = [];

    for (const sp of pool) {
      const parts = sp.latin.split(" ");
      const genus = parts[0]?.toLowerCase();
      const epithet = parts[1]?.toLowerCase();

      if (genus && !seen.has(genus)) {
        seen.add(genus);
        fetches.push(
          fetchWikipediaEtymology(genus).then((r) => {
            if (r) entries.push({ word: genus, lang: r.lang, meaning: r.meaning, detail: r.detail, source: "wikipedia" });
          }),
        );
      }
      if (epithet && !seen.has(epithet)) {
        seen.add(epithet);
        fetches.push(
          fetchWikipediaEtymology(epithet).then((r) => {
            if (r) entries.push({ word: epithet, lang: r.lang, meaning: r.meaning, detail: r.detail, source: "wikipedia" });
          }),
        );
      }
    }
    await Promise.allSettled(fetches);
  }

  // 3. Generate questions from merged pool
  const questions: QuizQuestion[] = [];
  const allMeanings = entries.map((e) => e.meaning);

  // Genus questions (5)
  const generaOnly = entries.filter((e) => Object.keys(GENERA).includes(e.word) || e.source === "wikipedia");
  for (const e of shuffle(generaOnly).slice(0, 5)) {
    const distractors = pickRandom(
      allMeanings.filter((m) => m !== e.meaning),
      3,
    );
    const options = shuffle([e.meaning, ...distractors]);
    questions.push({
      question: `¿Qué significa "${e.word}" en latín/griego?`,
      options,
      correctIndex: options.indexOf(e.meaning),
      explanation: `"${e.word}" (${e.lang}) significa "${e.meaning}".${e.detail ? " " + e.detail : ""}`,
      displayLabel: e.word,
    });
  }

  // Epithet questions (5)
  const epithetsOnly = entries.filter((e) => Object.keys(EPITHETS).includes(e.word) || e.source === "wikipedia");
  for (const e of shuffle(epithetsOnly).slice(0, 5)) {
    const distractors = pickRandom(
      allMeanings.filter((m) => m !== e.meaning),
      3,
    );
    const options = shuffle([e.meaning, ...distractors]);
    questions.push({
      question: `¿Qué significa "${e.word}" como epíteto específico?`,
      options,
      correctIndex: options.indexOf(e.meaning),
      explanation: `"${e.word}" (${e.lang}) significa "${e.meaning}".${e.detail ? " " + e.detail : ""}`,
      displayLabel: e.word,
    });
  }

  return shuffle(questions).slice(0, 10);
}

/**
 * MODO 5: Completa la Cadena
 * Muestra una cadena taxonómica con un nivel faltante
 */
export async function generateTaxonomyChain(pool?: QuizSpecimen[]): Promise<QuizQuestion[]> {
  const RANK_LABELS: Record<number, string> = {
    0: "Reino",
    1: "Filo",
    2: "Clase",
    3: "Orden",
    4: "Familia",
    5: "Género",
    6: "Especie",
  };
  const RANK_ORDER = ["kingdom", "phylum", "class", "order", "family", "genus", "species"];

  // Try to build chains from iNaturalist API
  if (pool && pool.length > 0) {
    try {
      const chains: TaxonomyChain[] = [];
      for (const sp of pool) {
        const inatMatch = sp.id.match(/^inat:(\d+)$/);
        if (!inatMatch) continue;
        const numericId = parseInt(inatMatch[1], 10);
        try {
          const detail = await fetchTaxonDetail(numericId);
          const ancestorMap = new Map(detail.ancestors.map((a) => [a.rank, a.name]));
          const chain: string[] = RANK_ORDER.map((rank) => {
            if (rank === "species") return detail.name;
            return ancestorMap.get(rank) ?? "—";
          });
          if (chain.filter((v) => v && v !== "—").length >= 5) {
            chains.push({ chain, blankIndex: 0, label: sp.name, specimenId: sp.id });
          }
        } catch {
          // skip this specimen
        }
      }

      if (chains.length >= 5) {
        const questions: QuizQuestion[] = [];
        for (const c of shuffle(chains).slice(0, 10)) {
          const blankIdx = [3, 4, 5][Math.floor(Math.random() * 3)];
          const correctAnswer = c.chain[blankIdx];
          if (!correctAnswer || correctAnswer === "—") continue;
          const rankName = RANK_LABELS[blankIdx];

          const allValues = new Set(chains.map((ch) => ch.chain[blankIdx]).filter(Boolean));
          const distractors = shuffle([...allValues].filter((v) => v !== correctAnswer)).slice(0, 3);
          if (distractors.length < 3) continue;
          const options = shuffle([correctAnswer, ...distractors]);

          const chainItems = c.chain.map((v, i) => ({
            rank: RANK_LABELS[i] ?? "",
            value: i === blankIdx ? "___" : v,
            isBlank: i === blankIdx,
          }));

          questions.push({
            question: `Completa la cadena taxonómica de ${c.label}:`,
            options,
            correctIndex: options.indexOf(correctAnswer),
            explanation: `El ${rankName} correcto es "${correctAnswer}".`,
            displayLabel: c.label,
            latinName: c.chain[5] ? `${c.chain[5]} ${c.chain[6] ?? ""}`.trim() : c.label,
            chainLevel: rankName,
            chainItems,
            specimenId: c.specimenId,
          });
        }
        if (questions.length >= 5) return shuffle(questions).slice(0, 10);
      }
    } catch {
      // fall through to hardcoded
    }
  }

  // Fallback: hardcoded chains (only Orden, Familia, Género blanks)
  const allOrders = [...new Set([...SPECIMENS.map((s) => s.order), ...TAXONOMY_CHAINS.map((c) => c.chain[3])])];
  const allFamilies = [...new Set([...SPECIMENS.map((s) => s.family), ...TAXONOMY_CHAINS.map((c) => c.chain[4])])];
  const allGenera = [...new Set(TAXONOMY_CHAINS.map((c) => c.chain[5]))];

  const validChains = TAXONOMY_CHAINS.filter((c) => c.blankIndex >= 3 && c.blankIndex <= 5);
  const questions: QuizQuestion[] = [];

  for (const c of shuffle(validChains).slice(0, 10)) {
    const blank = c.chain[c.blankIndex];
    const correctAnswer = blank;
    const rankName = RANK_LABELS[c.blankIndex] ?? "Nivel";

    let poolDistractors: string[];
    if (c.blankIndex === 3) poolDistractors = allOrders;
    else if (c.blankIndex === 4) poolDistractors = allFamilies;
    else poolDistractors = allGenera;

    const distractors = pickRandom(poolDistractors, 3, correctAnswer);
    const options = shuffle([correctAnswer, ...distractors]);

    const chainItems = c.chain.map((v, i) => ({
      rank: RANK_LABELS[i] ?? "",
      value: i === c.blankIndex ? "___" : v,
      isBlank: i === c.blankIndex,
    }));

    questions.push({
      question: `Completa la cadena taxonómica de ${c.label}:`,
      options,
      correctIndex: options.indexOf(correctAnswer),
      explanation: `El ${rankName} correcto es "${correctAnswer}".`,
      displayLabel: c.label,
      latinName: c.chain[6] ?? c.chain[5],
      chainLevel: rankName,
      chainItems,
      specimenId: c.specimenId,
    });
  }

  return shuffle(questions).slice(0, 10);
}

/**
 * MODO 6: Ingeniería Evolutiva
 * Se presenta un entorno → elige la adaptación correcta
 */
export function generateEvolution(): QuizQuestion[] {
  const SCENARIOS = [
    {
      env: "Perforar madera dura para extraer savia",
      correct: "Mandíbulas reforzadas — musculatura mandibular extrema",
      distractors: [
        "Patas raptoras — pinzas delanteras en forma de gancho",
        "Alas membranosas con venación compleja — vuelo sostenido",
        "Ojos compuestos de 30.000 facetas — visión de 360°",
      ],
      explanation: "Los escarabajos perforadores (Coleoptera) tienen mandíbulas de quitina reforzada capaces de perforar madera. El ciervo volante usa sus mandíbulas para duelo, pero las de otros escarabajos son herramientas de excavación.",
      specimenId: "lucanus-cervus",
    },
    {
      env: "Capturar presas voladoras sobre un río de corriente rápida",
      correct: "Vuelo estacionario con control de precisión — cuatro alas independientes",
      distractors: [
        "Saltos de distancia con patas traseras comprimidas",
        "Camuflaje foliar con balanceo de viento",
        "Exoesqueleto iridiscente — refleja depredadores",
      ],
      explanation: "Las libélulas (Odonata) vuelan con 4 alas independientes que permiten vuelo estacionario, marcha atrás y giros de 90°. Cazan al vuelo con 95% de éxito — la más eficiente del reino animal.",
      specimenId: "anax-imperator",
    },
    {
      env: "Emboscada silenciosa entre hojas verdes del sotobosque",
      correct: "Patas raptoras con espinas — trampa en 60 ms",
      distractors: [
        "Trompa chupadora de savia — piezas bucales tipo sonda",
        "Feromonas de atracción — señal química de largo alcance",
        "Mimetismo foliar con venación falsa — camuflaje absoluto",
      ],
      explanation: "La mantis (Mantodea) tiene patas delanteras raptoras con espinas que se cierran en 60 ms. Se camufla entre vegetación y espera pacientemente a que la presa entre en rango.",
      specimenId: "mantis-religiosa",
    },
    {
      env: "Comunicar la posición exacta de flores con néctar a 500 m del nido",
      correct: "Danza del meneo — ángulo + distancia codificados en movimiento",
      distractors: [
        "Estridulación — vibración del ala para señal acústica",
        "Bioluminiscencia — destellos codificados por especie",
        "Feromonas volátiles — marcaje territorial químico",
      ],
      explanation: "La abeja europea (Hymenoptera, Apidae) comunica distancia y dirección del néctar con una danza figure-8: el ángulo respecto al sol indica dirección, la duración indica distancia.",
      specimenId: "apis-mellifera",
    },
    {
      env: "Huir de depredadores en el sotobosque tropical moviéndose entre hojas",
      correct: "Mimetismo foliar con venación falsa — confusión visual total",
      distractors: [
        "Mandíbulas de combate — defensa activa con pellizco",
        "Trompa chupadora de savia — alimentación especializada",
        "Vuelo errático con ocelos crípticos — distracción visual",
      ],
      explanation: "El insecto hoja (Phasmatodea, Phylliidae) lleva el camuflaje al extremo: sus patas y abdomen tienen forma de hoja con venación falsa y hasta manchas de moho. Se balancea como una hoja con el viento.",
      specimenId: "phyllium-philippinicum",
    },
    {
      env: "Perforar frutos maduros para alimentarse de pulpa en una selva africana",
      correct: "Probóscide enrollable — tubo chupador extensible",
      distractors: [
        "Cuerno torácico curvado — herramienta de excavación",
        "Patas raptoras — captura activa de presas grandes",
        "Mimetismo foliar — camuflaje entre vegetación",
      ],
      explanation: "El goliat (Scarabaeidae) usa su probóscide para alimentarse de frutos maduros y savia. Con hasta 100 g de peso, es el insecto más pesado del mundo, volando entre el dosel de selvas africanas.",
      specimenId: "goliathus-goliatus",
    },
    {
      env: "Reclutar obreras para defender un nido subterráneo de intrusiones",
      correct: "Aguijón reutilizable — defensa activa con veneno",
      distractors: [
        "Canto de frecuencia variable — termómetro acústico",
        "Hembra áptera con bioluminiscencia — señal nocturna",
        "Alas con escamas iridiscentes — camuflaje reversible",
      ],
      explanation: "El avispón europeo (Vespidae) defiende su nido de papel con un aguijón liso que puede picar repetidamente. Las obreras cazan abejas y otros insectos para alimentar a las larvas.",
      specimenId: "vespa-crabro",
    },
    {
      env: "Atraer parejas durante una noche de verano en praderas húmedas",
      correct: "Bioluminiscencia — luz fría de luciferina de alta eficiencia",
      distractors: [
        "Estridulación de baja frecuencia — vibración del suelo",
        "Mimetismo foliar con balanceo — camuflaje activo",
        "Osmétero defensivo — cornamenta olorosa",
      ],
      explanation: "La luciérnaga (Lampyridae) usa bioluminiscencia casi sin calor (eficiencia del 95%) para atraer parejas. La hembra áptera enciende su faro verde y el macho vuela hacia la señal.",
      specimenId: "lampyris-noctiluca",
    },
    {
      env: "Migrar 3.000 km cruzando el Mediterráneo cada otoño y regresar en primavera",
      correct: "Alas membranosas con reservas grasas — vuelo de largo alcance",
      distractors: [
        "Mandíbulas hipertróficas — defensa territorial",
        "Órgano timbálico — canto de 120 dB de largo alcance",
        "Patas raptoras con espinas — captura en emboscada",
      ],
      explanation: "La almirante rojo (Lepidoptera, Nymphalidae) migra 3.000 km entre Europa y África. Acumula reservas grasas en el tórax que alimentan su vuelo sostenido sobre el mar Mediterráneo.",
      specimenId: "vanessa-atalanta",
    },
    {
      env: "Perforar el suelo para extraer raíces de plantas en praderas secas",
      correct: "Piezas bucales tipo sonda — estiletes para perforar tejido vegetal",
      distractors: [
        "Patas raptoras con espinas — captura de presas rápidas",
        "Cuerno torácico curvado — palanca en duelo",
        "Vuelo estacionario con 4 alas — interceptación aérea",
      ],
      explanation: "La cigarra (Hemiptera, Cicadidae) tiene piezas bucales tipo sonda (estiletes) para perforar tejido vegetal y chupar savia. Pasa años bajo tierra alimentándose de raíces antes de emerger.",
      specimenId: "cicada-orni",
    },
  ];

  return shuffle(SCENARIOS).slice(0, 10).map((sc) => {
    const options = shuffle([sc.correct, ...sc.distractors]);
    const latinParts = sc.specimenId.split("-");
    const latinName = latinParts.length >= 2
      ? `${latinParts[0].charAt(0).toUpperCase() + latinParts[0].slice(1)} ${latinParts.slice(1).join(" ")}`
      : sc.specimenId;
    return {
      question: "¿Qué adaptación evolutiva es más ventajosa?",
      envText: sc.env,
      options,
      correctIndex: options.indexOf(sc.correct),
      explanation: sc.explanation,
      specimenId: sc.specimenId,
      displayLabel: latinName,
      latinName,
    };
  });
}

/**
 * MODO 8: Cazador de Criptidas
 * Tres pistas críticas progresivas → identificar al espécimen
 */
export function generateCryptid(): QuizQuestion[] {
  interface CryptidChallenge {
    name: string;
    hints: string[];
    options: string[];
    correctIndex: number;
    explanation: string;
    specimenId: string;
  }

  const CHALLENGES: CryptidChallenge[] = [
    {
      name: "Criptida #001",
      hints: [
        "Pista 1 (Etimología): Su nombre significa 'el que se asemeja a una rama' en griego.",
        "Pista 2 (Hábitat): Habita exclusivamente en selvas tropicales húmedas del sudeste asiático.",
        "Pista 3 (Rasgo): Su cuerpo tiene venación falsa y bordes roídos que imitan una hoja en descomposición.",
      ],
      options: ["Phyllium philippinicum", "Mantis religiosa", "Anax imperator", "Papilio machaon"],
      correctIndex: 0,
      explanation: "Phyllium philippinicum — 'phullon' (hoja) + 'philippinicum' (Filipinas). El maestro absoluto del mimetismo foliar, con venación, manchas de moho y hasta bordes 'roídos'.",
      specimenId: "phyllium-philippinicum",
    },
    {
      name: "Criptida #002",
      hints: [
        "Pista 1 (Etimología): Su nombre evoca a la bestia mitológica de fuerza sobrehumana.",
        "Pista 2 (Hábitat): Selvas del golfo de Guinea, a más de 2.000 m de altitud.",
        "Pista 3 (Rasgo): Pesa hasta 100 g — iguala el peso de un ratón pequeño.",
      ],
      options: ["Goliathus goliatus", "Dynastes hercules", "Lucanus cervus", "Vespa crabro"],
      correctIndex: 0,
      explanation: "Goliathus goliatus — llamado 'Goliat' por su tamaño descomunal. El insecto más pesado del mundo, volando entre el dosel camerunés con un zumbido grave e inesperado.",
      specimenId: "goliathus-goliatus",
    },
    {
      name: "Criptida #003",
      hints: [
        "Pista 1 (Etimología): Su nombre significa 'la que viene de la oscuridad' en latín.",
        "Pista 2 (Hábitat): Praderas húmedas y linderos sombríos de Europa occidental.",
        "Pista 3 (Rasgo): La hembra no tiene alas y emite una luz verde fría casi sin calor.",
      ],
      options: ["Lampyris noctiluca", "Cicada orni", "Morpho menelaus", "Vanessa atalanta"],
      correctIndex: 0,
      explanation: "Lampyris noctiluca — 'noctis' (noche) + 'luca' (luz). La luciérnaga europea, cuya hembra áptera enciende un faro verde con eficiencia del 95% para guiar al macho volador.",
      specimenId: "lampyris-noctiluca",
    },
    {
      name: "Criptida #004",
      hints: [
        "Pista 1 (Etimología): Su nombre significa 'la que reza' en griego, por la postura de sus patas.",
        "Pista 2 (Hábitat): Herbazales y huertos soleados de todo el Mediterráneo.",
        "Pista 3 (Rasgo): Puede girar la cabeza 180° y tiene patas delanteras que se cierran en 60 ms.",
      ],
      options: ["Mantis religiosa", "Anax imperator", "Gryllus campestris", "Lucanus cervus"],
      correctIndex: 0,
      explanation: "Mantis religiosa — de 'mantis' (profeta) en griego, por su postura orante. Depredador ambusco con visión estereoscópica y patas raptoras que atrapan presas en milisegundos.",
      specimenId: "mantis-religiosa",
    },
    {
      name: "Criptida #005",
      hints: [
        "Pista 1 (Etimología): Su nombre significa 'el que tiene cuernos de ciervo' en latín.",
        "Pista 2 (Hábitat): Robledales maduros de Europa con troncos envejecidos.",
        "Pista 3 (Rasgo): Sus mandíbulas son tan grandes que no puede comer con ellas — solo sirven para duelos.",
      ],
      options: ["Lucanus cervus", "Dynastes hercules", "Goliathus goliatus", "Lampyris noctiluca"],
      correctIndex: 0,
      explanation: "Lucanus cervus — 'lucanus' (del Lacio) + 'cervus' (ciervo). El mayor escarabajo de Europa, cuyas mandíbulas hipertróficas son armas rituales, no herramientas alimenticias.",
      specimenId: "lucanus-cervus",
    },
    {
      name: "Criptida #006",
      hints: [
        "Pista 1 (Etimología): Su nombre significa 'la que danza' en latín.",
        "Pista 2 (Hábitat): Praderas, cultivos y bosques abiertos — cosmopolita.",
        "Pista 3 (Rasgo): Comunica la posición de las flores con una danza figure-8 codificada por ángulo y distancia.",
      ],
      options: ["Apis mellifera", "Vespa crabro", "Morpho menelaus", "Vanessa atalanta"],
      correctIndex: 0,
      explanation: "Apis mellifera — 'apis' (abeja) + 'mellifera' (productora de miel). La cartógrafa de flores que traduce coordenadas polares en una danza entendida por toda la colonia.",
      specimenId: "apis-mellifera",
    },
    {
      name: "Criptida #007",
      hints: [
        "Pista 1 (Etimología): Su nombre significa 'el que duerme de noche' en latín.",
        "Pista 2 (Hábitat): Estanques, marismas y ríos lentos de Europa y Asia.",
        "Pista 3 (Rasgo): Tiene 30.000 facetas por ojo y caza con 95% de éxito — la más eficiente del reino animal.",
      ],
      options: ["Anax imperator", "Cicada orni", "Gryllus campestris", "Lampyris noctiluca"],
      correctIndex: 0,
      explanation: "Anax imperator — 'anax' (señor) en griego + 'imperator' (emperador). La libélula emperador, caza al vuelo con visión de 360° y vuelo estacionario.",
      specimenId: "anax-imperator",
    },
    {
      name: "Criptida #008",
      hints: [
        "Pista 1 (Etimología): Su nombre significa 'el que hace sonar un tambor' en latín.",
        "Pista 2 (Hábitat): Bosques abiertos y olivares de la cuenca mediterránea.",
        "Pista 3 (Rasgo): Pasa años bajo tierra y emerge en masa para cantar a 120 dB durante unas semanas.",
      ],
      options: ["Cicada orni", "Anax imperator", "Gryllus campestris", "Lampyris noctiluca"],
      correctIndex: 0,
      explanation: "Cicada orni — de 'cicada' (cigarra en latín). Su tambor abdominal (tímpano) vibra 500 veces por segundo, produciendo el sonido más fuerte de cualquier insecto.",
      specimenId: "cicada-orni",
    },
  ];

  return shuffle(CHALLENGES).slice(0, 10).map((c) => {
    const latinParts = c.specimenId.split("-");
    const latinName = latinParts.length >= 2
      ? `${latinParts[0].charAt(0).toUpperCase() + latinParts[0].slice(1)} ${latinParts.slice(1).join(" ")}`
      : c.specimenId;
    return {
      question: `${c.name}\n\nResuelve las pistas para identificar al espécimen misterioso:`,
      options: c.options,
      correctIndex: c.correctIndex,
      explanation: c.explanation,
      hints: c.hints,
      specimenId: c.specimenId,
      displayLabel: latinName,
      latinName,
    };
  });
}

/**
 * MODO 9: Desafío Diario
 * Una pregunta al día basada en la fecha — determinística, sin timer
 */
export function generateDaily(pool?: QuizSpecimen[]): QuizQuestion[] {
  const specimens = pool ?? specimensToQuizSpecimens();
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  let hash = 5381;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) + hash + dateStr.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % specimens.length;
  const s = specimens[idx];

  const distractors = pickRandom(specimens.map((sp) => sp.latin), 3, s.latin);
  const options = shuffle([s.latin, ...distractors]);

  return [
    {
      question: `Desafío Diario — ${dateStr}\n\n¿Qué especie es esta?`,
      options,
      correctIndex: options.indexOf(s.latin),
      explanation: `${s.latin} — ${s.traits[0] ?? "Especie del orden " + s.order}.`,
      displayLabel: s.name,
      latinName: s.latin,
      specimenId: s.id,
    },
  ];
}

/**
 * MODO 10: Expedición
 * 5 preguntas diarias (seeded por fecha) con vidas — supervivencia pura
 */
export function generateExpedition(pool?: QuizSpecimen[]): QuizQuestion[] {
  const specimens = pool ?? specimensToQuizSpecimens();
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  let hash = 5381;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) + hash + dateStr.charCodeAt(i)) | 0;
  }

  // Seeded Fisher-Yates shuffle
  const indices = specimens.map((_, i) => i);
  let seed = Math.abs(hash);
  for (let i = indices.length - 1; i > 0; i--) {
    seed = (seed * 16807 + 0) % 2147483647;
    const j = seed % (i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  const allLatin = specimens.map((s) => s.latin);
  const selected = indices.slice(0, 5).map((i) => specimens[i]);

  return selected.map((s) => {
    const distractors = pickRandom(allLatin, 3, s.latin);
    const options = shuffle([s.latin, ...distractors]);
    return {
      question: s.name,
      options,
      correctIndex: options.indexOf(s.latin),
      explanation: `${s.latin} — ${s.traits[0] ?? "Especie del orden " + s.order}.`,
      displayLabel: s.name,
      latinName: s.latin,
      specimenId: s.id,
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Router principal                                                    */
/* ------------------------------------------------------------------ */

export async function generateQuestions(mode: QuizMode, pool?: QuizSpecimen[]): Promise<QuizQuestion[]> {
  switch (mode) {
    case "speed-scientific":
      return generateSpeedScientific(pool);
    case "classify-order":
      return generateClassifyOrder(pool);
    case "etymology":
      return generateEtymology(pool);
    case "taxonomy-chain":
      return generateTaxonomyChain(pool);
    case "evolution":
      return generateEvolution();
    case "cryptid":
      return generateCryptid();
    case "daily":
      return generateDaily(pool);
    case "expedition":
      return generateExpedition(pool);
    default:
      return generateSpeedScientific(pool);
  }
}
