import { SPECIMENS } from "./insects";
import { GENERA, EPITHETS } from "./academic";
import { ECO_QUESTIONS, type EcoRelation } from "./ecosystemQuestions";
import { TAXONOMY_CHAINS, type TaxonomyChain } from "./taxonomyChains";
import { fetchTaxonDetail } from "../lib/inat";
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
  | "identify-glyph"
  | "etymology"
  | "taxonomy-chain"
  | "evolution"
  | "ecosystem"
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
  /** Para modo ecosistema: subtítulo de la relación trófica */
  ecosystemLabel?: string;
  /** URL de imagen real del espécimen (iNaturalist) */
  image?: string;
  /** Nombre científico para buscar foto precisa en iNaturalist */
  latinName?: string;
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
  {
    id: "evolution",
    name: "Ingeniería Evolutiva",
    shortName: "Evolución",
    icon: "🦎",
    description: "Elige la adaptación correcta para sobrevivir en un entorno específico. Evolución en acción.",
    color: "sage",
  },
  {
    id: "ecosystem",
    name: "Red Trófica",
    shortName: "Trófico",
    icon: "🕸️",
    description: "Identifica relaciones de depredación, polinización y parasitismo entre especies.",
    color: "teal",
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
    return {
      question: `Entorno: "${sc.env}"\n\n¿Qué adaptación evolutiva es más ventajosa?`,
      options,
      correctIndex: options.indexOf(sc.correct),
      explanation: sc.explanation,
      specimenId: sc.specimenId,
    };
  });
}

/**
 * MODO 7: Red Trófica
 * Pregunta sobre relaciones ecológicas: depredación, polinización, parasitismo
 */
export function generateEcosystem(): QuizQuestion[] {
  // 10 originales (hardcoded abajo) + 35 nuevas (ecosystemQuestions.ts) = 45 total
  const ORIGINAL_RELATIONS: EcoRelation[] = [
    {
      question: "¿Qué captura la libélula emperador al vuelo con 95% de éxito?",
      label: "Relación: Depredación",
      correct: "Moscas y mosquitos — insectos voladores de pequeño tamaño",
      distractors: [
        "Polen de flores acuáticas — alimentación nectarívora",
        "Hojas en descomposición del estanque — detritívora",
        "Larvas de escarabajos bajo la corteza — excavación",
      ],
      explanation: "La libélula (Odonata, Aeshnidae) es un depredador aéreo de primer orden. Intercepta moscas, mosquitos y otros insectos voladores con visión estereoscópica y vuelo estacionario.",
      specimenId: "anax-imperator",
    },
    {
      question: "La mantis religiosa depende de este recurso para emboscarse exitosamente:",
      label: "Relación: Camuflaje y depredación",
      correct: "Vegetación densa y hojarasca — camuflaje entre tallos",
      distractors: [
        "Nidos de aves — parasitismo de crías",
        "Troncos en descomposición — alimentación de madera",
        "Flores con néctar profundo — polinización mutualista",
      ],
      explanation: "La mantis (Mantodea, Mantidae) necesita vegetación densa para camuflarse y emboscarse. Es un depredador ambusco que depende del entorno para no ser detectado por sus presas.",
      specimenId: "mantis-religiosa",
    },
    {
      question: "La abeja europea tiene una relación mutualista directa con:",
      label: "Relación: Polinización mutualista",
      correct: "Flores con néctar y polen — las abejas polinizan mientras se alimentan",
      distractors: [
        "Colmenas de avispas — competencia por presas",
        "Troncos viejos — nidificación en cavidades",
        "Larvas de escarabajos — parasitismo de provisiones",
      ],
      explanation: "La abeja (Hymenoptera, Apidae) es la polinizadora clave del planeta. Visita millones de flores al día, transportando polen mientras se alimenta de néctar — una relación mutualista perfecta.",
      specimenId: "apis-mellifera",
    },
    {
      question: "¿Quién es el principal depredador del ciervo volante en su hábitat?",
      label: "Relación: Depredación",
      correct: "Aves insectívoras y mamíferos — depredación generalista",
      distractors: [
        "Otras abejas sociales — competencia por recursos",
        "Hongos entomopatógenos — parasitismo obligado",
        "Bacterias del suelo — descomposición pasiva",
      ],
      explanation: "El ciervo volante (Coleoptera, Lucanidae) es depredado por aves y mamíferos. Su declive se debe a la pérdida de bosques viejos con madera muerta donde cría sus larvas.",
      specimenId: "lucanus-cervus",
    },
    {
      question: "¿Qué busca el avispón europeo cuando caza abejas para alimentar a sus larvas?",
      label: "Relación: Depredación",
      correct: "Proteínas de insectos vivos — presas de cuerpo blando",
      distractors: [
        "Néctar de flores silvestres — alimentación nectarívora",
        "Madera en descomposición — material de construcción del nido",
        "Hojas verdes — alimentación herbívora de larvas",
      ],
      explanation: "El avispón (Hymenoptera, Vespidae) caza abejas y otros insectos para alimentar a sus larvas. Las obreras mastican las presas para crear una pasta proteica que depositan en las celdas del nido.",
      specimenId: "vespa-crabro",
    },
    {
      question: "¿Cómo afecta la cigarra común a los árboles durante su fase subterránea?",
      label: "Relación: Parasitismo de savia",
      correct: "Chupa savia de las raíces — alimentación parasitaria durante años",
      distractors: [
        "Perfora el tronco para depositar huevos — oviposición destructiva",
        "Devora las hojas en masa — defoliación estacional",
        "Transmite bacterias entre árboles — vector de enfermedad",
      ],
      explanation: "La cigarra (Hemiptera, Cicadidae) se alimenta de savia de raíces durante 2-5 años como ninfa subterránea. Sus estiletes perforan el tejido vascular para extraer nutrientes, debilitando al árbol.",
      specimenId: "cicada-orni",
    },
    {
      question: "La morfo azul usa su coloración iridiscente principalmente para:",
      label: "Relación: Señalización visual",
      correct: "Confundir depredadores con destellos de vuelo errático",
      distractors: [
        "Atraer polinizadores con reflejos ultravioleta",
        "Camuflarse entre flores azules del sotobosque",
        "Marcar territorio con pigmentos urinarios",
      ],
      explanation: "La morfo (Lepidoptera, Nymphalidae) usa su azul estructural para confundir depredadores: los destellos erráticos durante el vuelo dificultan la persecución. El reverso críptico la oculta al posarse.",
      specimenId: "morpho-menelaus",
    },
    {
      question: "¿Qué estrategia usa la luciérnaga para atraer parejas sin atraer depredadores?",
      label: "Relación: Señalización sexual",
      correct: "Bioluminiscencia de frecuencia específica — código por especie",
      distractors: [
        "Feromonas volátiles — marcaje químico de largo alcance",
        "Estridulación nocturna — canto de baja frecuencia",
        "Mimetismo de flores — trampa visual pasiva",
      ],
      explanation: "La luciérnaga (Coleoptera, Lampyridae) usa destellos de frecuencia y duración específica para atraer parejas de la misma especie. La hembra áptera brilla desde el suelo mientras el macho vuela buscando la señal.",
      specimenId: "lampyris-noctiluca",
    },
    {
      question: "La almirante rojo migra desde Europa hasta África siguiendo este recurso:",
      label: "Relación: Dependencia estacional",
      correct: "Ortigas para oviposición — nurserías de orugas en primavera",
      distractors: [
        "Flores de lavanda — néctar de larga distancia",
        "Frutos caídos del bosque — alimentación de otoño",
        "Agua estancada — reproducción acuática",
      ],
      explanation: "La almirante (Lepidoptera, Nymphalidae) migra 3.000 km siguiendo la disponibilidad de ortigas (Urtica) para ovipositar. Las orugas se alimentan exclusivamente de ortigas, lo que determina su distribución.",
      specimenId: "vanessa-atalanta",
    },
    {
      question: "¿Qué relación tiene el insecto hoja con su entorno en las selvas de Filipinas?",
      label: "Relación: Mimetismo críptico",
      correct: "Se confunde con hojas vivas — depredadores lo ignoran como vegetación",
      distractors: [
        "Depende de hormigas para dispersión de huevos — mutualismo",
        "Se alimenta de líquenes del tronco — saprofitismo",
        "Vive en simbiosis con hongos — cultivo fungario",
      ],
      explanation: "El insecto hoja (Phasmatodea, Phylliidae) es la cúspide del mimetismo foliar: venación falsa, bordes roídos, manchas de moho y balanceo de viento. Los depredadores lo ven como una hoja más.",
      specimenId: "phyllium-philippinicum",
    },
  ];

  const ALL: EcoRelation[] = [...ORIGINAL_RELATIONS, ...ECO_QUESTIONS];

  return shuffle(ALL).slice(0, 10).map((r) => {
    const options = shuffle([r.correct, ...r.distractors]);
    return {
      question: r.question,
      options,
      correctIndex: options.indexOf(r.correct),
      explanation: r.explanation,
      specimenId: r.specimenId,
      ecosystemLabel: r.label,
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

  return shuffle(CHALLENGES).slice(0, 10).map((c) => ({
    question: `${c.name}\n\nResuelve las pistas para identificar al espécimen misterioso:`,
    options: c.options,
    correctIndex: c.correctIndex,
    explanation: c.explanation,
    hints: c.hints,
    specimenId: c.specimenId,
  }));
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
    case "identify-glyph":
      return generateIdentifyGlyph();
    case "etymology":
      return generateEtymology();
    case "taxonomy-chain":
      return generateTaxonomyChain(pool);
    case "evolution":
      return generateEvolution();
    case "ecosystem":
      return generateEcosystem();
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
