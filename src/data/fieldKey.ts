import type { GlyphKey } from "./insects";

export interface KeyOption {
  label: string;
  detail?: string;
  next: string;
}

export type KeyNode =
  | {
      type: "q";
      id: string;
      question: string;
      hint?: string;
      options: KeyOption[];
    }
  | {
      type: "r";
      id: string;
      order: string;
      latin: string;
      blurb: string;
      traits: string[];
      glyph: GlyphKey;
    };

export const KEY_NODES: Record<string, KeyNode> = {
  q1: {
    type: "q",
    id: "q1",
    question: "¿El espécimen presenta alas, o élitros que las cubren?",
    hint: "Los élitros son alas anteriores endurecidas, en forma de estuche, que se cierran sobre el dorso.",
    options: [
      { label: "Sí: alas visibles o élitros", detail: "Pasa a examinar las alas", next: "q2" },
      { label: "No: sin alas ni élitros", detail: "Áptero primario o secundario", next: "qw1" },
    ],
  },
  q2: {
    type: "q",
    id: "q2",
    question: "¿Las alas anteriores son duras (élitros) que se cierran en línea recta sobre el abdomen?",
    hint: "Busca la sutura: la línea media donde ambos élitros se encuentran.",
    options: [
      { label: "Sí: élitros que cubren el abdomen", detail: "Alas plegadas bajo el estuche", next: "r_coleoptera" },
      { label: "No: alas membranosas o escamosas", detail: "Alas funcionales a la vista", next: "q3" },
    ],
  },
  q3: {
    type: "q",
    id: "q3",
    question: "¿Las alas están cubiertas de escamas diminutas, que se desprenden como polvo al tacto?",
    hint: "Las escamas son pelos aplanados; dan color a las alas.",
    options: [
      { label: "Sí: alas escamosas", detail: "Polvo de escamas en los dedos", next: "r_lepidoptera" },
      { label: "No: alas desnudas y membranosas", detail: "Transparentes o con nerviación visible", next: "q4" },
    ],
  },
  q4: {
    type: "q",
    id: "q4",
    question: "¿Cuántas alas membranosas puedes contar?",
    hint: "El segundo par de los dípteros está reducido a balancines (halterios), unos mazos diminutos tras las alas.",
    options: [
      { label: "Solo dos (un par)", detail: "El segundo par son balancines", next: "r_diptera" },
      { label: "Cuatro (dos pares)", detail: "Ambos pares membranosos", next: "q5" },
    ],
  },
  q5: {
    type: "q",
    id: "q5",
    question: "En reposo, ¿las alas quedan extendidas a los lados, con ojos enormes y abdomen alargado?",
    hint: "Piensa en un cazador acuático que vuela como un helicóptero.",
    options: [
      { label: "Sí: alas en cruz, ojos gigantes", detail: "Vuelo cernido sobre el agua", next: "r_odonata" },
      { label: "No: alas plegadas sobre el cuerpo", detail: "Ojos de tamaño normal", next: "q6" },
    ],
  },
  q6: {
    type: "q",
    id: "q6",
    question: "¿El abdomen se une al tórax por una «cintura» estrecha (pecíolo)?",
    hint: "El pecíolo es el anillo estrangulado que da flexibilidad al abdomen.",
    options: [
      { label: "Sí: cintura de avispa", detail: "Pecíolo bien marcado", next: "r_hymenoptera" },
      { label: "No: abdomen sésil o ancho", detail: "Unión amplia con el tórax", next: "q7" },
    ],
  },
  q7: {
    type: "q",
    id: "q7",
    question: "¿Las patas anteriores son raptoriales: plegables y armadas de espinas para sujetar presas?",
    hint: "Se pliegan como una navaja: fémur y tibia con espinas enfrentadas.",
    options: [
      { label: "Sí: patas prensoras espinosas", detail: "Cazador al acecho", next: "r_mantodea" },
      { label: "No: patas marchadoras", detail: "Sin espinas de agarre", next: "q8" },
    ],
  },
  q8: {
    type: "q",
    id: "q8",
    question: "¿Las patas posteriores son saltadoras, con fémures muy engrosados?",
    hint: "El fémur hipertrofiado almacena la energía del salto.",
    options: [
      { label: "Sí: fémures saltadores", detail: "A menudo estridulan", next: "r_orthoptera" },
      { label: "No: patas uniformes", detail: "Alas en tejado y pico suctor", next: "r_hemiptera" },
    ],
  },

  /* ---- rama de ápteros ---- */
  qw1: {
    type: "q",
    id: "qw1",
    question: "¿El cuerpo está comprimido lateralmente (visto de perfil, plano) y es un saltador ágil?",
    hint: "La forma aplanada le permite moverse entre el pelaje o las plumas del hospedador.",
    options: [
      { label: "Sí: plano, sin alas, salta", detail: "Ectoparásito de aves y mamíferos", next: "r_siphonaptera" },
      { label: "No: cuerpo no comprimido", detail: "Vida libre", next: "qw2" },
    ],
  },
  qw2: {
    type: "q",
    id: "qw2",
    question: "¿El cuerpo imita un palo o una hoja: alargado, fino o laminar?",
    hint: "El mimetismo vegetal es su única defensa.",
    options: [
      { label: "Sí: forma de palo u hoja", detail: "Mimetismo criptico vegetal", next: "r_phasmatodea" },
      { label: "No: sin mimetismo vegetal", detail: "Forma generalista", next: "qw3" },
    ],
  },
  qw3: {
    type: "q",
    id: "qw3",
    question: "¿Corre veloz por el suelo, aplanado dorsoventralmente y con antenas larguísimas?",
    hint: "Nocturno, fotófobo y rapidísimo.",
    options: [
      { label: "Sí: corredor aplanado", detail: "Antenas filiformes muy largas", next: "r_blattodea" },
      { label: "No: otro tipo de áptero", detail: "Pezcecillos de plata y afines", next: "r_aptera" },
    ],
  },

  /* ---- resultados ---- */
  r_coleoptera: {
    type: "r",
    id: "r_coleoptera",
    order: "Coleoptera",
    latin: "Coleoptera · escarabajos",
    blurb:
      "El orden más diverso de animales del planeta: más de 400 000 especies descritas. Sus élitros protegen las alas membranosas y el abdomen, lo que les permitió colonizar casi todos los hábitats terrestres y de agua dulce.",
    traits: ["Élitros con sutura media", "Metamorfosis completa", "Piezas bucales masticadoras"],
    glyph: "beetle",
  },
  r_lepidoptera: {
    type: "r",
    id: "r_lepidoptera",
    order: "Lepidoptera",
    latin: "Lepidoptera · mariposas y polillas",
    blurb:
      "Alas tapizadas de escamas que forman dibujos de camuflaje, aviso o cortejo. Las orugas mastican plantas y los adultos succionan néctar con una espiritrompa enrollada. Unas 180 000 especies.",
    traits: ["Escamas alares", "Espiritrompa", "Oruga fitófaga"],
    glyph: "butterfly",
  },
  r_diptera: {
    type: "r",
    id: "r_diptera",
    order: "Diptera",
    latin: "Diptera · moscas y mosquitos",
    blurb:
      "Vuelo de un solo par de alas: el segundo par se transformó en balancines giroscópicos que les dan una maniobrabilidad asombrosa. Polinizadores, descomponedores, vectores… unos 150 000 especies.",
    traits: ["Un par de alas", "Balancines (halterios)", "Piezas bucales lamedoras o picadoras"],
    glyph: "fly",
  },
  r_odonata: {
    type: "r",
    id: "r_odonata",
    order: "Odonata",
    latin: "Odonata · libélulas y caballitos",
    blurb:
      "Depredadores aéreos con hasta 28 000 omatidios por ojo y alas que baten de forma independiente. Cazan al vuelo con un 95 % de éxito. Sus ninfas viven en aguas dulces.",
    traits: ["Ojos compuestos gigantes", "Vuelo cernido", "Ninfa acuática depredadora"],
    glyph: "dragonfly",
  },
  r_hymenoptera: {
    type: "r",
    id: "r_hymenoptera",
    order: "Hymenoptera",
    latin: "Hymenoptera · abejas, avispas y hormigas",
    blurb:
      "Alas acopladas por ganchos diminutos (hamuli) que hacen volar los dos pares como uno. Incluye las sociedades más complejas del reino animal y los principales polinizadores. Unas 150 000 especies.",
    traits: ["Pecíolo abdominal", "Alas con hamuli", "Vida social en muchos grupos"],
    glyph: "bee",
  },
  r_mantodea: {
    type: "r",
    id: "r_mantodea",
    order: "Mantodea",
    latin: "Mantodea · mantis",
    blurb:
      "Cazadoras al acecho con cabeza triangular giratoria y patas raptoriales que se pliegan en 30 milisegundos. Su camuflaje imita hojas, ramas e incluso flores. Unas 2 400 especies.",
    traits: ["Patas raptoriales", "Cabeza giratoria", "Canibalismo nupcial ocasional"],
    glyph: "mantis",
  },
  r_orthoptera: {
    type: "r",
    id: "r_orthoptera",
    order: "Orthoptera",
    latin: "Orthoptera · saltamontes y grillos",
    blurb:
      "Maestros del sonido: frotan alas o patas para cantar (estridulación). Fémures posteriores saltadores que liberan hasta 20 veces su energía muscular. Unas 28 000 especies.",
    traits: ["Fémures saltadores", "Estridulación", "Oído en patas o abdomen"],
    glyph: "grasshopper",
  },
  r_hemiptera: {
    type: "r",
    id: "r_hemiptera",
    order: "Hemiptera",
    latin: "Hemiptera · chinches y cigarras",
    blurb:
      "Boca en pico suctor (rostro) para extraer savia o fluidos animales. Muchos pliegan las alas en tejado sobre el cuerpo. Incluye cigarras, chinches y pulgones: unas 80 000 especies.",
    traits: ["Rostro suctor", "Alas en tejado", "Hemiélitros en muchos grupos"],
    glyph: "cicada",
  },
  r_siphonaptera: {
    type: "r",
    id: "r_siphonaptera",
    order: "Siphonaptera",
    latin: "Siphonaptera · pulgas",
    blurb:
      "Parásitos laterales sin alas: su cuerpo comprimido se desliza entre pelos y plumas. Saltan hasta 150 veces su longitud gracias a la resilina, una proteína muelle. Unas 2 500 especies.",
    traits: ["Cuerpo comprimido", "Salto por resilina", "Ectoparásito hematófago"],
    glyph: "bug",
  },
  r_phasmatodea: {
    type: "r",
    id: "r_phasmatodea",
    order: "Phasmatodea",
    latin: "Phasmatodea · insectos palo y hoja",
    blurb:
      "El mimetismo llevado al extremo: especies que imitan ramas con nudos, hojas con venas e incluso el balanceo del viento. Muchos son partenogenéticos: las hembras se clonan. Unas 3 000 especies.",
    traits: ["Mimetismo vegetal", "Partenogénesis frecuente", "Huevos con forma de semilla"],
    glyph: "leaf",
  },
  r_blattodea: {
    type: "r",
    id: "r_blattodea",
    order: "Blattodea",
    latin: "Blattodea · cucarachas y termitas",
    blurb:
      "Corredoras aplanadas con un plan corporal apenas cambiado en 300 millones de años. Las termitas, hoy incluidas en este orden, son las mayores ingenieras de ecosistemas del suelo. Unas 4 600 especies.",
    traits: ["Pronoto en escudo", "Corredoras veloces", "Incluye a las termitas"],
    glyph: "bug",
  },
  r_aptera: {
    type: "r",
    id: "r_aptera",
    order: "Ápteros basales",
    latin: "Zygentoma y afines",
    blurb:
      "Linajes primitivos sin alas desde su origen: pezcecillos de plata y lepismas. Ametábolos: las crías son adultos en miniatura. Testigos vivos de cómo eran los primeros hexápodos.",
    traits: ["Sin alas ancestrales", "Desarrollo ametábolo", "Escamas plateadas"],
    glyph: "bug",
  },
};

export const KEY_START = "q1";
