import type { GlyphKey } from "./insects";

export interface AnatomyPart {
  id: string;
  term: string;
  latin: string;
  def: string;
}

export interface OrderAnatomyData {
  order: string;
  latin: string;
  representative: string;
  representativeLatin: string;
  glyph: GlyphKey;
  parts: AnatomyPart[];
  distinguishing: string[];
}

export const ORDER_ANATOMY: Record<string, OrderAnatomyData> = {
  Coleoptera: {
    order: "Coleoptera",
    latin: "Coleoptera · escarabajos",
    representative: "Carabus sp.",
    representativeLatin: "Carabus violaceus",
    glyph: "beetle",
    parts: [
      {
        id: "cabeza",
        term: "Cabeza",
        latin: "Caput",
        def: "Tagma anterior: encierra el cerebro (ganglio supraesofágico), los órganos sensoriales y las piezas bucales. Su orientación —hipógnata o prognata— es un carácter de familia.",
      },
      {
        id: "antena",
        term: "Antenas",
        latin: "Antennae",
        def: "Órganos sensoriales segmentados del tacto y el olfato; en muchos grupos también oyen. Su forma —filiforme, clavada, pectinada, geniculada— es una de las primeras claves de identificación.",
      },
      {
        id: "ojo",
        term: "Ojos compuestos",
        latin: "Oculi compositi",
        def: "Formados por miles de omatidios, cada uno con su propia lente: ofrecen un mosaico de imagen y un campo visual de casi 360°. Las libélulas alcanzan 28 000 por ojo.",
      },
      {
        id: "mandibula",
        term: "Mandíbulas",
        latin: "Mandibulae",
        def: "Primer par de piezas bucales: cortan, trituran o transportan. En los ciervos volantes se hipertrofian en astas de combate que pueden superar la mitad del cuerpo.",
      },
      {
        id: "pronoto",
        term: "Pronoto",
        latin: "Pronotum",
        def: "La placa dorsal del primer segmento torácico (protórax). Su contorno, ángulos y ornamentación separan géneros enteros de escarabajos y chinches.",
      },
      {
        id: "escutelo",
        term: "Escutelo",
        latin: "Scutellum",
        def: "Pequeño triángulo dorsal entre las bases de los élitros: es el resto visible del mesonoto. En las chinches (Hemiptera) puede llegar a cubrir todo el abdomen.",
      },
      {
        id: "elitro",
        term: "Élitros",
        latin: "Elytra",
        def: "Alas anteriores endurecidas que forman un estuche protector. Se abren en bisagra para desplegar las alas membranosas; su puntuación y estrías son caracteres taxonómicos de primer orden.",
      },
      {
        id: "sutura",
        term: "Sutura elitral",
        latin: "Sutura elitrorum",
        def: "La línea media donde ambos élitros se cierran. Una sutura recta y completa es sinapomorfía de los coleópteros: ninguna otra orden la presenta igual.",
      },
      {
        id: "pata",
        term: "Pata torácica",
        latin: "Pes thoracicus",
        def: "Consta de coxa, trocánter, fémur, tibia y tarso. Sus modificaciones son claves de orden: raptoras (mantis), saltadoras (saltamontes), fosoras (grillotopo), colectoras (abejas).",
      },
      {
        id: "ala",
        term: "Ala membranosa",
        latin: "Ala membranacea",
        def: "El ala de vuelo verdadera: una lámina quitinosa plegada en abanico con venas que le dan rigidez. En los escarabajos puede medir tres veces el élitro que la guarda.",
      },
      {
        id: "abdomen",
        term: "Ápice abdominal",
        latin: "Pygidium",
        def: "El extremo visible del abdomen: aloja el final del tubo digestivo, los genitales y los últimos espiráculos. Su forma ayuda a distinguir familias de coleópteros.",
      },
    ],
    distinguishing: [
      "Élitros que se cierran en línea recta sobre el dorso",
      "Alas membranosas plegadas bajo los élitros",
      "Metamorfosis completa: huevo → larva → pupa → adulto",
      "Piezas bucales masticadoras en todas las etapas",
      "Sutura elitral exclusiva de este orden",
      "El orden más diverso: >400 000 especies descritas",
    ],
  },
  Lepidoptera: {
    order: "Lepidoptera",
    latin: "Lepidoptera · mariposas y polillas",
    representative: "Mariposa monarca",
    representativeLatin: "Papilio machaon",
    glyph: "butterfly",
    parts: [
      {
        id: "alas_escamosas",
        term: "Alas escamosas",
        latin: "Alae squamosae",
        def: "Cada ala está cubierta por miles de escamas superpuestas como tejas. Cada escama es un pelo aplanado con pigmentos (melaninas, pterinas) y nanoestructuras que producen color estructural (iridiscencia azul). Al deslizar el dedo, las escamas se desprenden como polvo.",
      },
      {
        id: "espiritrompa",
        term: "Espiritrompa",
        latin: "Proboscis",
        def: "Tubo enrollado como un reloj suizo formado por dos maxilares modificados (galeas) que se encajan. En reposo permanece enrollado en espiral; al alimentarse se despliega hasta 3 veces la longitud de la cabeza para alcanzar el néctar. Las polillas primitivas conservan mandíbulas funcionales.",
      },
      {
        id: "antenas_clavadas",
        term: "Antenas clavadas",
        latin: "Antennae clavatae",
        def: "A diferencia de las filiformes de la mayoría de insectos, las mariposas tienen antenas con la punta engrosada (forma de maza). Funcionan como órganos olfativos de ultra alta sensibilidad: detectan feromonas y flores a kilómetros de distancia.",
      },
      {
        id: "ojos_compuestos",
        term: "Ojos compuestos",
        latin: "Oculi compositi",
        def: "Cada ojo contiene hasta 17 000 omatidios. Las mariposas ven en el espectro ultravioleta, lo que les permite detectar patrones en las flores invisibles al ojo humano. También ven colores primarios (rojo, verde, azul) como nosotros.",
      },
      {
        id: "torax",
        term: "Tórax",
        latin: "Thorax",
        def: "Dividido en tres segmentos: protórax (con el primer par de patas), mesotórax (alas delanteras + segundo par de patas) y metatórax (alas traseras + tercer par). Los músculos de vuelo se insertan en las paredes torácicas.",
      },
      {
        id: "alas_traseras",
        term: "Alas traseras",
        latin: "Alae posticae",
        def: "Menores que las delanteras, se acoplan a ellas mediante una estructura llamada frenulum (un gancho que encaja en la retinácula del ala delantera). Juntas forman una superficie de vuelo única. La venación es menos ramificada que en las delanteras.",
      },
      {
        id: "abdomen",
        term: "Abdomen",
        latin: "Abdomen",
        def: "Segmentado (10 anillos visibles). En las hembras alberga el ovipositor para depositar huevos en plantas hospedadoras. Los espiráculos (orificios respiratorios) en cada segmento permiten la ventilación traqueal.",
      },
      {
        id: "patas",
        term: "Patas con sensores de sabor",
        latin: "Pes cum chemoreceptoribus",
        def: "Las patas traen receptores químicos en los tarsos: al posarse sobre una hoja, la mariposa 'saborea' con los pies si la planta es adecuada para sus orugas. Este mecanismo se llama golpe gustativo.",
      },
    ],
    distinguishing: [
      "Alas cubiertas de escamas (no pelos ni membrana desnuda)",
      "Espiritrompa enrollada para succionar néctar",
      "Metamorfosis completa: huevo → oruga → pupa → adulto",
      "Orugas con mandíbulas masticadoras (adulto con espiritrompa)",
      "Antenas clavadas (vs. filiformes en la mayoría)",
      "Venación alar con patrones específicos por familia",
    ],
  },
};

export const ORDER_KEYS = Object.keys(ORDER_ANATOMY);
