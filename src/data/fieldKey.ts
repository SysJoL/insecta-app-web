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
  /* ===== RAMA PRINCIPAL: insectos alados ===== */
  q1: {
    type: "q",
    id: "q1",
    question: "¿El espécimen presenta alas funcionales, o élitros que las cubren?",
    hint: "Los élitros son alas anteriores endurecidas en forma de estuche. Algunos insectos pierden las alas secundariamente.",
    options: [
      { label: "Sí: alas o élitros visibles", detail: "Pasa a examinar las alas", next: "q2" },
      { label: "No: sin alas visibles", detail: "Áptero primario o secundario", next: "qw1" },
    ],
  },
  q2: {
    type: "q",
    id: "q2",
    question: "¿Las alas anteriores son duras (élitros) que se cierran en línea recta sobre el abdomen?",
    hint: "Busca la sutura: la línea media donde ambos élitros se encuentran. Los élitros protegen las alas membranosas plegadas debajo.",
    options: [
      { label: "Sí: élitros que cubren el abdomen", detail: "Alas plegadas bajo el estuche", next: "q_elytra" },
      { label: "No: alas membranosas, escamosas o ausentes", detail: "Alas funcionales a la vista", next: "q3" },
    ],
  },

  /* --- élitros --- */
  q_elytra: {
    type: "q",
    id: "q_elytra",
    question: "¿El abdomen termina en pinzas o cercos en forma de forceps?",
    hint: "Las pinzas (cercos) se usan para defensa, cortejo y doblar las alas.",
    options: [
      { label: "Sí: pinzas abdominales", detail: "Forceps evidentes", next: "r_dermaptera" },
      { label: "No: sin pinzas", detail: "Élitros completamente desarrollados", next: "r_coleoptera" },
    ],
  },

  /* --- alas membranosas / escamosas --- */
  q3: {
    type: "q",
    id: "q3",
    question: "¿Las alas están cubiertas de escamas diminutas que se desprenden como polvo al tacto?",
    hint: "Las escamas son pelos aplanados; dan color a las alas de mariposas y polillas. Frota suavemente con el dedo.",
    options: [
      { label: "Sí: alas escamosas", detail: "Polvo de escamas en los dedos", next: "r_lepidoptera" },
      { label: "No: alas desnudas", detail: "Membranosas, peludas o con venación visible", next: "q4" },
    ],
  },
  q4: {
    type: "q",
    id: "q4",
    question: "¿Cuántos pares de alas puedes contar?",
    hint: "Los dípteros tienen un solo par; el segundo par está reducido a balancines (halterios) que parecen mazos diminutos.",
    options: [
      { label: "Un par (2 alas)", detail: "El segundo par son balancines", next: "q_diptera" },
      { label: "Dos pares (4 alas)", detail: "Ambos pares membranosos", next: "q5" },
    ],
  },
  q_diptera: {
    type: "q",
    id: "q_diptera",
    question: "¿El insecto es diminuto (< 2 mm) con alas en forma de cerdas y franjas de pelos?",
    hint: "Los tisanópteros tienen alas estrechas como varillas con flecos de pelos largos. A menudo se confunden con pulgones.",
    options: [
      { label: "Sí: alas tipo cerda con flecos", detail: "Insecto minúsculo, a menudo en flores", next: "r_thysanoptera" },
      { label: "No: alas anchas con un par de halterios", detail: "Moscas y mosquitos típicos", next: "r_diptera" },
    ],
  },

  /* --- 2 pares de alas --- */
  q5: {
    type: "q",
    id: "q5",
    question: "¿Las alas se extienden a los lados en reposo, con ojos enormes que se tocan?",
    hint: "Piensa en un cazador acuático que vuela como un helicóptero sobre el agua.",
    options: [
      { label: "Sí: alas en cruz, ojos gigantes", detail: "Vuelo cernido sobre el agua", next: "r_odonata" },
      { label: "No: alas plegadas o en tejado", detail: "Ojos de tamaño normal", next: "q6" },
    ],
  },
  q6: {
    type: "q",
    id: "q6",
    question: "¿El insecto tiene 2 o 3 filamentos caudales (colas) largos y delgados en el abdomen?",
    hint: "Los efemerópteros y plecópteros tienen cercos filiformes. Las efémeras los sostienen erectos; las piedras los extienden atrás.",
    options: [
      { label: "Sí: colas filiformes", detail: "2 o 3 filamentos en el abdomen", next: "q7" },
      { label: "No: sin filamentos caudales", detail: "Abdomen sin apéndices largos", next: "q9" },
    ],
  },
  q7: {
    type: "q",
    id: "q7",
    question: "¿Las alas se sostienen verticalmente erectas sobre el cuerpo en reposo?",
    hint: "Las efémeras plegan las alas hacia arriba como una vela. Las piedras las pliegan planas.",
    options: [
      { label: "Sí: alas erectas tipo vela", detail: "3 filamentos, antenas muy cortas", next: "r_ephemeroptera" },
      { label: "No: alas plegadas planas sobre el dorso", detail: "2 cercos, antenas visibles", next: "q8" },
    ],
  },
  q8: {
    type: "q",
    id: "q8",
    question: "¿El cuerpo está aplanado dorsoventralmente y el insecto se encuentra junto a corrientes de agua?",
    hint: "Los plecópteros viven en arroyos limpios; sus ninfas son indicadores de buena calidad de agua.",
    options: [
      { label: "Sí: aplanado, cercano al agua", detail: "Buen indicador de calidad ambiental", next: "r_plecoptera" },
      { label: "No: cuerpo no aplanado, hábitat variado", detail: "Otro tipo de insecto alado", next: "q9" },
    ],
  },

  /* --- alas sin colas --- */
  q9: {
    type: "q",
    id: "q9",
    question: "¿Las alas tienen una venación reticulada (muchas venas que se cruzan formando una red)?",
    hint: "Las venas forman una malla visible, como una libélula pero más suave. Típico de neurópteros y afines.",
    options: [
      { label: "Sí: venación reticulada", detail: "Red de venas visible", next: "q10" },
      { label: "No: venación simple o alas peludas", detail: "Pocas venas o con pelo", next: "q12" },
    ],
  },
  q10: {
    type: "q",
    id: "q10",
    question: "¿El insecto tiene mandíbulas grandes y protrusivas, o un «cuello» alargado (protórax)?",
    hint: "Los megalópteros tienen mandíbulas enormes; los rapidiópteros tienen un protórax alargado como serpiente.",
    options: [
      { label: "Mandíbulas grandes, cuerpo robusto", detail: "Larvas acuáticas depredadoras", next: "r_megaloptera" },
      { label: "Protórax alargado tipo cuello", detail: "Aspecto de serpiente alada", next: "r_raphidioptera" },
      { label: "Ninguno de los dos", detail: "Alas delicadas, ojos prominentes", next: "r_neuroptera" },
    ],
  },

  /* --- alas peludas / fringed --- */
  q12: {
    type: "q",
    id: "q12",
    question: "¿Las alas están cubiertas de pelos (no escamas) y parecen de terciopelo?",
    hint: "Los tricópteros tienen alas densamente pilosas. Sus larvas acuáticas construyen estuches con piedras y hojas.",
    options: [
      { label: "Sí: alas peludas, aspecto aterciopelado", detail: "Larvas con estuche acuático", next: "r_trichoptera" },
      { label: "No: alas sin pelo denso", detail: "Ver más caracteres", next: "q13" },
    ],
  },

  /* --- halterios / reducciones --- */
  q13: {
    type: "q",
    id: "q13",
    question: "¿Las alas anteriores están reducidas a estructuras en forma de garrote o maza?",
    hint: "Los estrepsípteros tienen halterios delanteros (alas anteriores reducidas) y alas traseras grandes y abanicadas. Parásitos de abejas y avispas.",
    options: [
      { label: "Sí: alas anteriores en maza", detail: "Alas traseras abanicadas, parásito", next: "r_strepsiptera" },
      { label: "No: alas con forma normal", detail: "Ver más caracteres", next: "q14" },
    ],
  },

  /* --- cabeza y mouthparts --- */
  q14: {
    type: "q",
    id: "q14",
    question: "¿La cabeza se prolonga en un pico o rostro tipo «cabeza de escorpión»?",
    hint: "Los mecópteros tienen la cabeza alargada hacia abajo formando un rostro. Los machos de algunos tienen el abdomen curvado como escorpión.",
    options: [
      { label: "Sí: cabeza alargada en pico", detail: "Rostro descendente, alas con manchas", next: "r_mecoptera" },
      { label: "No: cabeza normal", detail: "Ver más caracteres", next: "q15" },
    ],
  },

  /* --- cintura / waist --- */
  q15: {
    type: "q",
    id: "q15",
    question: "¿El abdomen se une al tórax por una «cintura» estrecha (pecíolo)?",
    hint: "El pecíolo es el anillo estrangulado que da flexibilidad al abdomen. Típico de avispas, abejas y hormigas.",
    options: [
      { label: "Sí: cintura de avispa", detail: "Pecíolo bien marcado", next: "q_hymenoptera" },
      { label: "No: abdomen sésil o ancho", detail: "Unión amplia con el tórax", next: "q16" },
    ],
  },
  q_hymenoptera: {
    type: "q",
    id: "q_hymenoptera",
    question: "¿El insecto tiene aguijón visible o las antenas son en forma de codo (geniculadas)?",
    hint: "Las abejas y hormigas tienen antenas geniculadas; las avispas pueden tener aguijón. Las hormigas no tienen alas en la casta obrera.",
    options: [
      { label: "Antenas geniculadas o aguijón", detail: "Sociedad compleja o polinizador", next: "q_hymenoptera2" },
      { label: "Antenas filiformes, sin aguijón evidente", detail: "Avispas parásitas o simbiosis", next: "r_hymenoptera" },
    ],
  },
  q_hymenoptera2: {
    type: "q",
    id: "q_hymenoptera2",
    question: "¿El insecto tiene alas? (Algunas castas de hormigas y termitas carecen de alas)",
    hint: "Las obreras de hormigas son ápteras; las reinas y machos alados. Las abejas siempre tienen alas.",
    options: [
      { label: "Sí: 2 pares de alas acopladas", detail: "Alas con hamuli (ganchos)", next: "r_hymenoptera" },
      { label: "No: sin alas, antenas geniculadas", detail: "Posiblemente hormiga obrera", next: "r_hymenoptera" },
    ],
  },

  /* --- patas modificadas --- */
  q16: {
    type: "q",
    id: "q16",
    question: "¿Las patas anteriores son raptoriales: plegables y armadas de espinas para sujetar presas?",
    hint: "Se pliegan como una navaja: fémur y tibia con espinas enfrentadas. Cazador al acecho.",
    options: [
      { label: "Sí: patas prensoras espinosas", detail: "Cazador al acecho", next: "r_mantodea" },
      { label: "No: patas marchadoras o normales", detail: "Sin espinas de agarre", next: "q17" },
    ],
  },
  q17: {
    type: "q",
    id: "q17",
    question: "¿Las patas posteriores son saltadoras, con fémures muy engrosados?",
    hint: "El fémur hipertrofiado almacena la energía del salto. A menudo estridulan (cantan).",
    options: [
      { label: "Sí: fémures saltadores", detail: "A menudo estridulan", next: "r_orthoptera" },
      { label: "No: patas uniformes", detail: "Ver más caracteres", next: "q18" },
    ],
  },

  /* --- mouthparts / rostro --- */
  q18: {
    type: "q",
    id: "q18",
    question: "¿El insecto tiene un rostro o pico suctor para extraer savia o fluidos?",
    hint: "El rostro (rostro) es un pico formado por maxilas y labio modificados. Típico de chinches, cigarras y pulgones.",
    options: [
      { label: "Sí: rostro suctor", detail: "Pico para extraer líquidos", next: "r_hemiptera" },
      { label: "No: mandíbulas masticadoras", detail: "Piezas bucales tipo pinza", next: "q19" },
    ],
  },

  /* --- alas en tejado / pteroteigoto --- */
  q19: {
    type: "q",
    id: "q19",
    question: "¿Las alas se pliegan en tejado sobre el cuerpo, con un pronoto ancho en escudo?",
    hint: "Los blattodeos (cucarachas y termitas) pliegan las alas en plano inclinado. El pronoto cubre la cabeza.",
    options: [
      { label: "Sí: alas en tejado, pronoto en escudo", detail: "Cuerpo aplanado, nocturno", next: "r_blattodea" },
      { label: "No: alas extendidas o plegadas de otro modo", detail: "Ver más caracteres", next: "q20" },
    ],
  },

  /* --- cripsis / mimetismo --- */
  q20: {
    type: "q",
    id: "q20",
    question: "¿El cuerpo imita un palo, una hoja o una parte de planta?",
    hint: "El mimetismo vegetal es su única defensa. Algunos se mecen con el viento como una rama.",
    options: [
      { label: "Sí: forma de palo, hoja o corteza", detail: "Mimetismo criptico vegetal", next: "r_phasmatodea" },
      { label: "No: sin mimetismo vegetal", detail: "Forma generalista", next: "q21" },
    ],
  },

  /* --- alas abanicadas / únicas --- */
  q21: {
    type: "q",
    id: "q21",
    question: "¿El insecto es diminuto (< 3 mm) con alas en forma de cerda con flecos de pelos?",
    hint: "Los tisanópteros (trips) son insectos minúsculos que se encuentran a menudo en flores y brotes.",
    options: [
      { label: "Sí: alas tipo cerda con flecos", detail: "Insecto minúsculo, a menudo en flores", next: "r_thysanoptera" },
      { label: "No: alas con forma normal", detail: "Ver más caracteres", next: "q22" },
    ],
  },

  /* --- alas iguales / pleconeuropteros --- */
  q22: {
    type: "q",
    id: "q22",
    question: "¿El insecto tiene alas de igual tamaño y forma, con venación simple y ojos compuestos pequeños?",
    hint: "Los embiópteros tienen alas iguales, flexibles, y los tarsos anteriores hinchados (glándulas de seda).",
    options: [
      { label: "Sí: alas iguales, tarsos hinchados", detail: "Tejen túneles de seda", next: "r_embioptera" },
      { label: "No: alas de distinto tamaño o venación compleja", detail: "Ver más caracteres", next: "q23" },
    ],
  },

  /* --- cramponneuros / neuropteroides --- */
  q23: {
    type: "q",
    id: "q23",
    question: "¿El insecto tiene antenas largas y alargadas, con alas membranosas transparentes y venación completa?",
    hint: "Los neuropteroides incluyen neurópteros (lacewings), mecópteros y afines. Carácter: metamorfosis completa.",
    options: [
      { label: "Sí: antenas largas, alas transparentes", detail: "Venación completa, depredadores", next: "r_neuroptera" },
      { label: "No: otro tipo de alas", detail: "Ver caracteres de ápteros", next: "qw1" },
    ],
  },

  /* ===== RAMA DE ÁPTEROS (sin alas) ===== */
  qw1: {
    type: "q",
    id: "qw1",
    question: "¿El cuerpo está comprimido lateralmente (plano de perfil) y es un saltador ágil?",
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
    hint: "El mimetismo vegetal es su única defensa. Algunos se mecen con el viento.",
    options: [
      { label: "Sí: forma de palo u hoja", detail: "Mimetismo criptico vegetal", next: "r_phasmatodea" },
      { label: "No: sin mimetismo vegetal", detail: "Forma generalista", next: "qw3" },
    ],
  },
  qw3: {
    type: "q",
    id: "qw3",
    question: "¿Corre veloz por el suelo, aplanado dorsoventralmente y con antenas larguísimas?",
    hint: "Nocturno, fotófobo y rapidísimo. El pronoto en escudo cubre la cabeza.",
    options: [
      { label: "Sí: corredor aplanado", detail: "Antenas filiformes muy largas", next: "r_blattodea" },
      { label: "No: otro tipo de áptero", detail: "Ver más caracteres", next: "qw4" },
    ],
  },
  qw4: {
    type: "q",
    id: "qw4",
    question: "¿El abdomen tiene 3 apéndices largos (2 cercos + 1 filamento medial) y el insecto salta al flexionar el abdomen?",
    hint: "Los archaeognatos saltan flexionando el abdomen. Los Zygentoma son más planos y no saltan.",
    options: [
      { label: "Sí: 3 colas, salta", detail: "Cuerpo cilíndrico, ojos grandes", next: "r_archaeognatha" },
      { label: "No: 3 colas pero no salta, o 2 colas", detail: "Cuerpo aplanado, escamas plateadas", next: "qw5" },
    ],
  },
  qw5: {
    type: "q",
    id: "qw5",
    question: "¿El cuerpo está cubierto de escamas plateadas brillantes y se mueve como un pez?",
    hint: "Los silverfish son insectos primitivos sin alas, cubiertos de escamas que brillan con la luz.",
    options: [
      { label: "Sí: escamas plateadas, movimiento peces", detail: "Cuerpo aplanado, 3 colas", next: "r_zygentoma" },
      { label: "No: sin escamas plateadas", detail: "Ver más caracteres", next: "qw6" },
    ],
  },
  qw6: {
    type: "q",
    id: "qw6",
    question: "¿Los tarsos anteriores están hinchados y producen seda para tejer túneles?",
    hint: "Los embiópteros son los únicos insectos que producen seda con glándulas en las patas delanteras.",
    options: [
      { label: "Sí: tarsos hinchados, seda", detail: "Viven en túneles de seda", next: "r_embioptera" },
      { label: "No: tarsos normales", detail: "Cuerpo blando, ojos reducidos", next: "qw7" },
    ],
  },
  qw7: {
    type: "q",
    id: "qw7",
    question: "¿El insecto es extremadamente pequeño (< 2 mm), con antenas largas y cuerpo blando?",
    hint: "Los psócidos (psocoptera) son diminutos, con cabeza grande y antenas largas. Viven en corteza, hojarasca o interiores.",
    options: [
      { label: "Sí: diminuto, cabeza grande", detail: "Antenas largas, cuerpo blando", next: "r_psocodea" },
      { label: "No: no coincide", detail: "Último recurso", next: "r_aptero_fallback" },
    ],
  },

  /* ===== RESULTADOS ===== */
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
    glyph: "flea",
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
      "Corredoras aplanadas con un plan corporal apenas cambiado en 300 millones de años. Las termitas, hoy incluidas en este orden, son las mayores ingenieras de ecosistemas del suelo. Unas 7 500 especies.",
    traits: ["Pronoto en escudo", "Corredoras veloces", "Incluye a las termitas"],
    glyph: "cockroach",
  },
  r_dermaptera: {
    type: "r",
    id: "r_dermaptera",
    order: "Dermaptera",
    latin: "Dermaptera · tijeretas",
    blurb:
      "Insectos nocturnos con élitros cortos y pinzas (cercos) en el abdomen que usan para defensa, cortejo y doblar las alas. Algunas especies cuidan sus huevos y ninfas. Unas 2 000 especies.",
    traits: ["Cercos tipo forceps", "Élitros cortos", "Cuidado parental"],
    glyph: "earwig",
  },
  r_ephemeroptera: {
    type: "r",
    id: "r_ephemeroptera",
    order: "Ephemeroptera",
    latin: "Ephemeroptera · efímeras",
    blurb:
      "Los adultos no se alimentan: su único propósito es reproducirse en un vuelo de unas pocas horas a unos pocos días. Las ninfas acuáticas viven 1-2 años. Unas 3 000 especies.",
    traits: ["Alas erectas", "Vida adulta efímera", "Ninfa acuática"],
    glyph: "mayfly",
  },
  r_plecoptera: {
    type: "r",
    id: "r_plecoptera",
    order: "Plecoptera",
    latin: "Plecoptera · piedras y moscas de piedra",
    blurb:
      "Insectos acuáticos de agua dulce con alas plegadas planas sobre el cuerpo. Sus ninfas son excelentes indicadores de calidad del agua: desaparecen con la contaminación. Unas 3 700 especies.",
    traits: ["Alas plegadas planas", "Cuerpo aplanado", "Ninfa acuática sensible a contaminación"],
    glyph: "stonefly",
  },
  r_neuroptera: {
    type: "r",
    id: "r_neuroptera",
    order: "Neuroptera",
    latin: "Neuroptera · neurópteros y mantis religiosa de jardín",
    blurb:
      "Depredadores con alas membranosas de venación reticulada. Las larvas de los antliones excavan trampas en la arena; los crustáceos lacewings son aliados contra pulgones. Unas 6 000 especies.",
    traits: ["Venación reticulada", "Larvas depredadoras", "Alas transparentes"],
    glyph: "lacewing",
  },
  r_trichoptera: {
    type: "r",
    id: "r_trichoptera",
    order: "Trichoptera",
    latin: "Trichoptera · tricópteros",
    blurb:
      "Parientes acuáticos de las mariposas: sus alas están cubiertas de pelos (no escamas). Las larvas construyen estuches portátiles con piedras, hojas y seda bajo el agua. Unas 14 500 especies.",
    traits: ["Alas peludas", "Larvas con estuche acuático", "Parientes de Lepidoptera"],
    glyph: "caddisfly",
  },
  r_megaloptera: {
    type: "r",
    id: "r_megaloptera",
    order: "Megaloptera",
    latin: "Megaloptera · megalópteros",
    blurb:
      "Insectos de mandíbulas enormes y alas membranosas con muchas venas. Las larvas acuáticas (dobsonflies) son depredadoras importantes en arroyos. Unas 380 especies.",
    traits: ["Mandíbulas grandes", "Larva acuática depredadora", "Alas con venación completa"],
    glyph: "dobsonfly",
  },
  r_raphidioptera: {
    type: "r",
    id: "r_raphidioptera",
    order: "Raphidioptera",
    latin: "Raphidioptera · serpientes aladas",
    blurb:
      "Su protórax alargado les da aspecto de serpiente alada. Depredadores de cortezas donde cazan pulgones y cochinillas. Solo se encuentran en el hemisferio norte. Unas 250 especies.",
    traits: ["Protórax alargado", "Depredador de cortezas", "Solo hemisferio norte"],
    glyph: "snakefly",
  },
  r_strepsiptera: {
    type: "r",
    id: "r_strepsiptera",
    order: "Strepsiptera",
    latin: "Strepsiptera · estrepsípteros",
    blurb:
      "Parásitos de otros insectos: las hembras nunca salen del cuerpo del hospedador. Los machos tienen alas traseras abanicadas y ojos como frambuesas. Unas 600 especies.",
    traits: ["Parásito interno", "Alas abanicadas", "Ojos tipo frambuesa"],
    glyph: "twisted-wing",
  },
  r_mecoptera: {
    type: "r",
    id: "r_mecoptera",
    order: "Mecoptera",
    latin: "Mecoptera · escorpiones alados",
    blurb:
      "Cabeza alargada en pico descendente. Los machos de Panorpa tienen el abdomen curvado como escorpión (inofensivo). Depredadores y carroñeros. Unas 750 especies.",
    traits: ["Rostro descendente", "Cabeza alargada", "Hábitos carroñeros"],
    glyph: "scorpionfly",
  },
  r_thysanoptera: {
    type: "r",
    id: "r_thysanoptera",
    order: "Thysanoptera",
    latin: "Thysanoptera · trips",
    blurb:
      "Insectos minúsculos (< 3 mm) con alas estrechas como cerdas bordeadas de pelos. Muchos son plagas de cultivos; otros son depredadores de ácaros. Unas 6 000 especies.",
    traits: ["Alas con flecos", "Cuerpo fusiforme", "Pestes y depredadores"],
    glyph: "thrip",
  },
  r_embioptera: {
    type: "r",
    id: "r_embioptera",
    order: "Embioptera",
    latin: "Embioptera · embiópteros",
    blurb:
      "Los únicos insectos que producen seda con glándulas en las patas delanteras. Tejen túneles sedosos bajo cortezas y hojas. Corren hacia adelante y atrás con igual agilidad. Unas 400 especies.",
    traits: ["Seda en tarsos anteriores", "Túneles sedosos", "Corredores veloces"],
    glyph: "webspinner",
  },
  r_archaeognatha: {
    type: "r",
    id: "r_archaeognatha",
    order: "Archaeognatha",
    latin: "Archaeognatha · bristletails",
    blurb:
      "Insectos primitivos sin alas que saltan flexionando el abdomen. Cuerpo cilíndrico cubierto de escamas, ojos grandes que se tocan. Testigos vivos de los primeros hexápodos. Unas 500 especies.",
    traits: ["Saltan flexionando abdomen", "Ojos grandes contiguos", "Escamas pigmentadas"],
    glyph: "bristletail",
  },
  r_zygentoma: {
    type: "r",
    id: "r_zygentoma",
    order: "Zygentoma",
    latin: "Zygentoma · pezcecillos de plata",
    blurb:
      "Insectos primitivos alargados y aplanados cubiertos de escamas plateadas que brillan como peces. Ametábolos: las crías son adultos en miniatura. Algunos son plagas domésticas. Unas 560 especies.",
    traits: ["Escamas plateadas", "Movimiento de pez", "Ametábolo"],
    glyph: "silverfish",
  },
  r_psocodea: {
    type: "r",
    id: "r_psocodea",
    order: "Psocodea",
    latin: "Psocodea · psócidos y piojos",
    blurb:
      "Diminutos insectos de cuerpo blando con cabeza grande y antenas largas. Incluye los psócidos de corteza (libres) y los piojos (parásitos). Unas 11 000 especies.",
    traits: ["Cabeza grande", "Cuerpo blando", "Incluye piojos parásitos"],
    glyph: "bug",
  },
  r_aptero_fallback: {
    type: "r",
    id: "r_aptero_fallback",
    order: "Insecta (sin alas)",
    latin: "Hexápodo áptero no identificado",
    blurb:
      "El espécimen no encaja claramente en un orden específico. Puede ser un insecto áptero poco común, una ninfa o un macho de orden con dimorfismo sexual marcado. Consulta una clave regional para determinación precisa.",
    traits: ["Sin alas", "Determinación requiere experto", "Consultar clave regional"],
    glyph: "bug",
  },
};

export const KEY_START = "q1";
