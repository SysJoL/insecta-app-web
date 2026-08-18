export interface TaxonomyChain {
  chain: string[]; // [Reino, Filo, Clase, Orden, Familia, Género, Especie]
  blankIndex: number;
  label: string;
  specimenId: string;
}

export const TAXONOMY_CHAINS: TaxonomyChain[] = [
  // ─── blankIndex: 1 — Filo ───
  { chain: ["Animalia", "Arthropoda", "Insecta", "Coleoptera", "Scarabaeidae", "Goliathus", "G. goliatus"], blankIndex: 1, label: "Goliat", specimenId: "goliathus-goliatus" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Lepidoptera", "Nymphalidae", "Morpho", "M. menelaus"], blankIndex: 1, label: "Morpho azul", specimenId: "morpho-menelaus" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Hymenoptera", "Apidae", "Apis", "A. mellifera"], blankIndex: 1, label: "Abeja europea", specimenId: "apis-mellifera" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Odonata", "Aeshnidae", "Anax", "A. imperator"], blankIndex: 1, label: "Libélula emperador", specimenId: "anax-imperator" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Mantodea", "Mantidae", "Mantis", "M. religiosa"], blankIndex: 1, label: "Mantis religiosa", specimenId: "mantis-religiosa" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Orthoptera", "Gryllidae", "Gryllus", "G. bimaculatus"], blankIndex: 1, label: "Grillo europeo", specimenId: "gryllus-bimaculatus" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Hemiptera", "Cicadidae", "Cicada", "C. orni"], blankIndex: 1, label: "Cigarra común", specimenId: "cicada-orni" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Diptera", "Syrphidae", "Episyrphus", "E. balteatus"], blankIndex: 1, label: "Sírfido marmoleado", specimenId: "episyrphus-balteatus" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Neuroptera", "Chrysopidae", "Chrysoperla", "C. carnea"], blankIndex: 1, label: "Leucóptera verde", specimenId: "chrysoperla-carnea" },
  { chain: ["Animalia", "Arthropoda", "Arachnida", "Araneae", "Salticidae", "Phidippus", "P. audax"], blankIndex: 1, label: "Araña saltadora", specimenId: "phidippus-audax" },

  // ─── blankIndex: 2 — Clase ───
  { chain: ["Animalia", "Arthropoda", "Insecta", "Coleoptera", "Lucanidae", "Lucanus", "L. cervus"], blankIndex: 2, label: "Ciervo volante", specimenId: "lucanus-cervus" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Lepidoptera", "Papilionidae", "Papilio", "P. machaon"], blankIndex: 2, label: "Cola de golondrina", specimenId: "papilio-machaon" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Hymenoptera", "Formicidae", "Atta", "A. cephalotes"], blankIndex: 2, label: "Hormiga cortadora", specimenId: "atta-cephalotes" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Diptera", "Muscidae", "Musca", "M. domestica"], blankIndex: 2, label: "Mosca doméstica", specimenId: "musca-domestica" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Hemiptera", "Reduviidae", "Rhodnius", "R. prolixus"], blankIndex: 2, label: "Vinchuca", specimenId: "rhodnius-prolixus" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Coleoptera", "Coccinellidae", "Coccinella", "C. septempunctata"], blankIndex: 2, label: "Mariquita de 7 puntos", specimenId: "coccinella-septempunctata" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Orthoptera", "Acrididae", "Schistocerca", "S. gregaria"], blankIndex: 2, label: "Langostina del desierto", specimenId: "schistocerca-gregaria" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Odonata", "Libellulidae", "Libellula", "L. depressa"], blankIndex: 2, label: "Libélula parda", specimenId: "libellula-depressa" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Lepidoptera", "Saturniidae", "Saturnia", "S. pavonia"], blankIndex: 2, label: "Saturnia real", specimenId: "saturnia-pavonia" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Phasmatodea", "Phylliidae", "Phyllium", "P. philippinicum"], blankIndex: 2, label: "Insecto hoja", specimenId: "phyllium-philippinicum" },

  // ─── blankIndex: 3 — Orden ───
  { chain: ["Animalia", "Arthropoda", "Insecta", "Coleoptera", "Scarabaeidae", "Dynastes", "D. hercules"], blankIndex: 3, label: "Escarabajo hércules", specimenId: "dynastes-hercules" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Lepidoptera", "Nymphalidae", "Vanessa", "V. atalanta"], blankIndex: 3, label: "Almirante rojo", specimenId: "vanessa-atalanta" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Hymenoptera", "Vespidae", "Vespa", "V. crabro"], blankIndex: 3, label: "Avispón europeo", specimenId: "vespa-crabro" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Diptera", "Tipulidae", "Tipula", "T. oleracea"], blankIndex: 3, label: "Tipúlido", specimenId: "tipula-oleracea" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Hemiptera", "Pentatomidae", "Rhaphigaster", "R. nebulosa"], blankIndex: 3, label: "Esbirro gris", specimenId: "rhaphigaster-nebulosa" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Coleoptera", "Carabidae", "Carabus", "C. granulatus"], blankIndex: 3, label: "Escarabajo terrestre", specimenId: "carabus-granulatus" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Lepidoptera", "Sphingidae", "Deilephila", "D. elpenor"], blankIndex: 3, label: "Esfinge del yeah", specimenId: "deilephila-elpenor" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Mantodea", "Mantidae", "Tenodera", "T. sinensis"], blankIndex: 3, label: "Mantis china", specimenId: "tenodera-sinensis" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Odonata", "Calopterygidae", "Calopteryx", "C. virgo"], blankIndex: 3, label: "Caballito del diablo azul", specimenId: "calopteryx-virgo" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Neuroptera", "Myrmeleontidae", "Myrmeleon", "M. formicarius"], blankIndex: 3, label: "León de las hormigas", specimenId: "myrmeleon-formicarius" },

  // ─── blankIndex: 4 — Familia ───
  { chain: ["Animalia", "Arthropoda", "Insecta", "Coleoptera", "Scarabaeidae", "Onthophagus", "O. taurus"], blankIndex: 4, label: "Escarabajo pelotero", specimenId: "onthophagus-taurus" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Coleoptera", "Scarabaeidae", "Scarabaeus", "S. sacer"], blankIndex: 4, label: "Escarabajo sagrado", specimenId: "scarabaeus-sacer" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Coleoptera", "Scarabaeidae", "Canthon", "C. cyanellus"], blankIndex: 4, label: "Pelotero americano", specimenId: "canthon-cyanellus" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Coleoptera", "Lucanidae", "Dorcus", "D. parallelipipedus"], blankIndex: 4, label: "Ciervo volante menor", specimenId: "dorcus-parallelipipedus" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Coleoptera", "Lucanidae", "Prosopocoilus", "P. inclinatus"], blankIndex: 4, label: "Ciervo volante japonés", specimenId: "prosopocoilus-inclinatus" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Lepidoptera", "Nymphalidae", "Danaus", "D. plexippus"], blankIndex: 4, label: "Mariposa monarca", specimenId: "danaus-plexippus" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Lepidoptera", "Nymphalidae", "Limenitis", "L. archippus"], blankIndex: 4, label: "Almirante norteamericano", specimenId: "limenitis-archippus" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Lepidoptera", "Nymphalidae", "Aglais", "A. urticae"], blankIndex: 4, label: "Cartujo", specimenId: "aglais-urticae" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Hymenoptera", "Formicidae", "Linepithema", "L. humile"], blankIndex: 4, label: "Hormiga argentina", specimenId: "linepithema-humile" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Hymenoptera", "Formicidae", "Solenopsis", "S. invicta"], blankIndex: 4, label: "Hormiga de fuego", specimenId: "solenopsis-invicta" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Diptera", "Syrphidae", "Episyrphus", "E. balteatus"], blankIndex: 4, label: "Sírfido marmoleado", specimenId: "episyrphus-balteatus" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Diptera", "Syrphidae", "Eristalis", "E. tenax"], blankIndex: 4, label: "Mosca abejorro", specimenId: "eristalis-tenax" },

  // ─── Órdenes faltantes: 1 cadena cada uno (respaldo) ───
  { chain: ["Animalia", "Arthropoda", "Insecta", "Dermaptera", "Forficulidae", "Forficula", "F. auricularia"], blankIndex: 3, label: "Tijereta común", specimenId: "forficula-auricularia" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Siphonaptera", "Pulicidae", "Ctenocephalides", "C. felis"], blankIndex: 3, label: "Pulga del gato", specimenId: "ctenocephalides-felis" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Ephemeroptera", "Baetidae", "Baetis", "B. rhodani"], blankIndex: 3, label: "Efímero de río", specimenId: "baetis-rhodani" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Blattodea", "Blattidae", "Periplaneta", "P. americana"], blankIndex: 3, label: "Cucaracha americana", specimenId: "periplaneta-americana" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Archaeognatha", "Machilidae", "Machilis", "M. polypoda"], blankIndex: 3, label: "Bristletail", specimenId: "machilis-polypoda" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Embioptera", "Embiidae", "Embia", "E. major"], blankIndex: 3, label: "Webspinner", specimenId: "embia-major" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Mecoptera", "Panorpidae", "Panorpa", "P. communis"], blankIndex: 3, label: "Escorpión europeo", specimenId: "panorpa-communis" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Megaloptera", "Corydalidae", "Corydalus", "C. cornutus"], blankIndex: 3, label: "Dobsonfly", specimenId: "corydalus-cornutus" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Plecoptera", "Perlidae", "Perla", "P. marginata"], blankIndex: 3, label: "Piedra de río", specimenId: "perla-marginata" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Psocodea", "Psocidae", "Psocus", "P. nebulosus"], blankIndex: 3, label: "Psocoptero del papel", specimenId: "psocus-nebulosus" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Raphidioptera", "Raphidiidae", "Raphidia", "R. ophiopsis"], blankIndex: 3, label: "Snakefly", specimenId: "raphidia-ophiopsis" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Strepsiptera", "Stylopidae", "Stylops", "S. melittae"], blankIndex: 3, label: "Parásito de abejas", specimenId: "stylops-melittae" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Thysanoptera", "Thripidae", "Frankliniella", "F. occidentalis"], blankIndex: 3, label: "Trips del occidente", specimenId: "frankliniella-occidentalis" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Trichoptera", "Limnephilidae", "Limnophilus", "L. stigma"], blankIndex: 3, label: "Caddisfly de estanque", specimenId: "limnophilus-stigma" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Zoraptera", "Zorotypidae", "Zorotypus", "Z. hubbardi"], blankIndex: 3, label: "Angel insect", specimenId: "zorotypus-hubbardi" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Zygentoma", "Lepismatidae", "Lepisma", "L. saccharina"], blankIndex: 3, label: "Pececillo de plata", specimenId: "lepisma-saccharina" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Phasmatodea", "Phasmatidae", "Phasma", "P. gigas"], blankIndex: 3, label: "Insecto palo gigante", specimenId: "phasma-gigas" },
  { chain: ["Animalia", "Arthropoda", "Insecta", "Orthoptera", "Acrididae", "Locusta", "L. migratoria"], blankIndex: 3, label: "Langosta migratoria", specimenId: "locusta-migratoria" },
];
