export interface BackupSpecimen {
  id: string;
  name: string;
  latin: string;
  order: string;
  traits: string[];
}

export const BACKUP_QUIZ_SPECIMENS: BackupSpecimen[] = [
  // ─── Coleoptera (8) ───
  { id: "chrysochroa-fulgidissima", name: "Escarabajo joya", latin: "Chrysochroa fulgidissima", order: "Coleoptera", traits: ["Metalizado", "Elytras iridiscentes"] },
  { id: "tribolium-castaneum", name: "Gorgojo de la harina", latin: "Tribolium castaneum", order: "Coleoptera", traits: ["Plaga de graneros", "Benzodiazepinas naturales"] },
  { id: "coccinella-septempunctata", name: "Mariquita de siete puntos", latin: "Coccinella septempunctata", order: "Coleoptera", traits: ["Control biológico", "Aposemática roja"] },
  { id: "melolontha-melolontha", name: "Escarabajo mayizo", latin: "Melolontha melolontha", order: "Coleoptera", traits: ["Larva subterránea", "Plaga agrícola"] },
  { id: "cerambyx-cerdo", name: "Rosalia alpina", latin: "Rosalia alpina", order: "Coleoptera", traits: ["Longicornio", "Especie protegida UE"] },
  { id: "ptinus-fur", name: "Escarabajo de los muebles", latin: "Ptinus fur", order: "Coleoptera", traits: ["Sinivoro", "Plaga doméstica"] },
  { id: "agrypnus-marginatus", name: "Escarabajo click", latin: "Agrypnus marginatus", order: "Coleoptera", traits: ["Mecanismo de click", "Elateridae"] },
  { id: "dorcus-parallelipipedus", name: "Ciervo volante menor", latin: "Dorcus parallelipipedus", order: "Coleoptera", traits: ["Lucanidae", "Mandíbulas en pinza"] },

  // ─── Lepidoptera (6) ───
  { id: "vanessa-cardui", name: "Cardocomma", latin: "Vanessa cardui", order: "Lepidoptera", traits: ["Migratoria", "Cosmopolita"] },
  { id: "pieris-brassicae", name: "Mariposa de la col", latin: "Pieris brassicae", order: "Lepidoptera", traits: ["Pieridae", "Plaga de crucíferas"] },
  { id: "deilephila-elpenor", name: "Esfinge del yeah", latin: "Deilephila elpenor", order: "Lepidoptera", traits: ["Esfinge", "Larva con ojos falsos"] },
  { id: "galleria-mellonella", name: "Polilla de la cera", latin: "Galleria mellonella", order: "Lepidoptera", traits: ["Degradadora de cera", "Piralidae"] },
  { id: "saturnia-pavonia", name: "Saturnia real", latin: "Saturnia pavonia", order: "Lepidoptera", traits: ["Saturniidae", "Gran envergadura"] },
  { id: "yponomeuta-cognatella", name: "Polilla del manzano", latin: "Yponomeuta cognatella", order: "Lepidoptera", traits: ["Hilos sedosos", "Gregarina larvaria"] },

  // ─── Hymenoptera (4) ───
  { id: "formica-rufa", name: "Hormiga roja", latin: "Formica rufa", order: "Hymenoptera", traits: ["Formicidae", "Formación de montículos"] },
  { id: "xylocopa-violacea", name: "Abejorro violeta", latin: "Xylocopa violacea", order: "Hymenoptera", traits: ["Xilófaga", "Polinizador"] },
  { id: "bombus-terrestris", name: "Abejorro terrestris", latin: "Bombus terrestris", order: "Hymenoptera", traits: ["Social", "Polinización en invernadero"] },
  { id: "dolichovespula-arenaria", name: "Avispa arena", latin: "Dolichovespula arenaria", order: "Hymenoptera", traits: ["Vespidácea", "Nido aéreo de papel"] },

  // ─── Odonata (3) ───
  { id: "libellula-depressa", name: "Libélula plaza", latin: "Libellula depressa", order: "Odonata", traits: ["Libellulidae", "Vuelo territorial"] },
  { id: "calopteryx-virgo", name: "Caballito del diablo azul", latin: "Calopteryx virgo", order: "Odonata", traits: ["Calopterygidae", "Envergadura negra metálica"] },
  { id: "enallagma-cyathigerum", name: "Caballito del diablo común", latin: "Enallagma cyathigerum", order: "Odonata", traits: ["Coenagrionidae", "Odonata zigóptera"] },

  // ─── Mantodea (2) ───
  { id: "stagmomantis-limbata", name: "Mantis del Nuevo Mundo", latin: "Stagmomantis limbata", order: "Mantodea", traits: ["Mantidae", "Camo flexoide"] },
  { id: "hoplophora-tuberculata", name: "Mantis espinosa", latin: "Hoplophora tuberculata", order: "Mantodea", traits: ["Thespidae", "Espinas torácicas"] },

  // ─── Orthoptera (3) ───
  { id: "tettigonia-cantans", name: "Cantamaña verde", latin: "Tettigonia cantans", order: "Orthoptera", traits: ["Tettigoniidae", "Estridulación"] },
  { id: "schistocerca-gregaria", name: "Langostina del desierto", latin: "Schistocerca gregaria", order: "Orthoptera", traits: ["Acrididae", "Fase gregaria"] },
  { id: "cephalippus-biger", name: "Saltamontes gigante", latin: "Chortophaga australior", order: "Orthoptera", traits: ["Acrididae", "Vuelo corto"] },

  // ─── Hemiptera (3) ───
  { id: "pyrrhocoris-apterus", name: "Escarabajo cocinero", latin: "Pyrrhocoris apterus", order: "Hemiptera", traits: ["Pyrrhocoridae", "Aposemático rojo"] },
  { id: "rhaphigaster-nebulosa", name: "Esbirro gris", latin: "Rhaphigaster nebulosa", order: "Hemiptera", traits: ["Pentatomidae", "Olor defensivo"] },
  { id: "gerris-lacustris", name: "Zapatero de agua", latin: "Gerris lacustris", order: "Hemiptera", traits: ["Gerridae", "Tensión superficial"] },

  // ─── Phasmatodea (1) ───
  { id: "clitarchus-hookeri", name: "Insecto palo", latin: "Clitarchus hookeri", order: "Phasmatodea", traits: ["Phasmatidae", "Cripsis perfecta"] },

  // ─── Neuroptera (2) ───
  { id: "chrysoperla-carnea", name: "Leucopis diminuta", latin: "Chrysoperla carnea", order: "Neuroptera", traits: ["Chrysopidae", "Control biológico"] },
  { id: "myrmeleon-formicarius", name: "León de las hormigas", latin: "Myrmeleon formicarius", order: "Neuroptera", traits: ["Myrmeleontidae", "Trampas de arena"] },

  // ─── Dermaptera (1) ───
  { id: "forficula-auricularia", name: "Tijereta", latin: "Forficula auricularia", order: "Dermaptera", traits: ["Forficulidae", "Pinzas caudales"] },

  // ─── Siphonaptera (1) ───
  { id: "pulex-irritans", name: "Pulga común", latin: "Pulex irritans", order: "Siphonaptera", traits: ["Pulicidae", "Parásito externo"] },

  // ─── Ephemeroptera (1) ───
  { id: "ephemera-danica", name: "Efímera", latin: "Ephemera danica", order: "Ephemeroptera", traits: ["Ephemeridae", "Adulto efímero"] },
];
