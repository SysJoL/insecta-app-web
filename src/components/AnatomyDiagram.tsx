import { useState, type ReactNode } from "react";

interface Region {
  id: string;
  term: string;
  latin: string;
  def: string;
}

/** Regiones en orden de dibujo (las primeras quedan debajo). */
const REGIONS: Region[] = [
  {
    id: "ala",
    term: "Ala membranosa",
    latin: "Ala membranacea",
    def: "El ala de vuelo verdadera: una lámina quitinosa plegada en abanico con venas que le dan rigidez. En los escarabajos puede medir tres veces el élitro que la guarda.",
  },
  {
    id: "pata",
    term: "Pata torácica",
    latin: "Pesa thoracica",
    def: "Consta de coxa, trocánter, fémur, tibia y tarso. Sus modificaciones son claves de orden: raptoras (mantis), saltadoras (saltamontes), fosoras (grillotopo), colectoras (abejas).",
  },
  {
    id: "abdomen",
    term: "Ápice abdominal",
    latin: "Pygidium",
    def: "El extremo visible del abdomen: aloja el final del tubo digestivo, los genitales y los últimos espiráculos. Su forma ayuda a distinguir familias de coleópteros.",
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
    id: "escutelo",
    term: "Escutelo",
    latin: "Scutellum",
    def: "Pequeño triángulo dorsal entre las bases de los élitros: es el resto visible del mesonoto. En las chinches (Hemiptera) puede llegar a cubrir todo el abdomen.",
  },
  {
    id: "pronoto",
    term: "Pronoto",
    latin: "Pronotum",
    def: "La placa dorsal del primer segmento torácico (protórax). Su contorno, ángulos y ornamentación separan géneros enteros de escarabajos y chinches.",
  },
  {
    id: "cabeza",
    term: "Cabeza",
    latin: "Caput",
    def: "Tagma anterior: encierra el cerebro (ganglio supraesofágico), los órganos sensoriales y las piezas bucales. Su orientación —hipógnata o prognata— es un carácter de familia.",
  },
  {
    id: "mandibula",
    term: "Mandíbulas",
    latin: "Mandibulae",
    def: "Primer par de piezas bucales: cortan, trituran o transportan. En los ciervos volantes se hipertrofian en astas de combate que pueden superar la mitad del cuerpo.",
  },
  {
    id: "ojo",
    term: "Ojos compuestos",
    latin: "Oculi compositi",
    def: "Formados por miles de omatidios, cada uno con su propia lente: ofrecen un mosaico de imagen y un campo visual de casi 360°. Las libélulas alcanzan 28 000 por ojo.",
  },
  {
    id: "antena",
    term: "Antenas",
    latin: "Antennae",
    def: "Órganos sensoriales segmentados del tacto y el olfato; en muchos grupos también oyen. Su forma —filiforme, clavada, pectinada, geniculada— es una de las primeras claves de identificación.",
  },
];

/** Geometría de cada región dentro del lienzo 0 0 400 540 (escarabajo, vista dorsal). */
const SHAPES: Record<string, ReactNode> = {
  ala: (
    <>
      <ellipse cx="118" cy="330" rx="60" ry="132" transform="rotate(10 118 330)" strokeDasharray="7 7" />
      <ellipse cx="282" cy="330" rx="60" ry="132" transform="rotate(-10 282 330)" strokeDasharray="7 7" />
      <path d="M100 250 84 300M104 380l-10 52M300 250l16 50M296 380l10 52" strokeWidth="1.4" strokeDasharray="4 5" />
    </>
  ),
  pata: (
    <>
      <path d="M140 162 96 140 70 160 46 152M46 152l-14-4M46 152l-8 10" strokeWidth="5" />
      <path d="M260 162l44-22 26 20 24-8m0 0 14-4m-14 4 8 10" strokeWidth="5" />
      <path d="M130 236 84 240 62 266 40 266m0 0-14-2m14 2-6 12" strokeWidth="5" />
      <path d="M270 236l46 4 22 26 22 0m0 0 14-2m-14 2 6 12" strokeWidth="5" />
      <path d="M138 348 92 372 76 408 54 424m0 0-14 6m14-6 0 14" strokeWidth="5" />
      <path d="M262 348l46 24 16 36 22 16m0 0 14 6m-14-6 0 14" strokeWidth="5" />
    </>
  ),
  abdomen: <path d="M174 452 Q200 506 226 452 L200 470 Z" />,
  elitro: (
    <>
      <path d="M199 202 132 200C118 242 116 302 124 352 130 402 150 442 176 462c12 10 20 12 23 12Z" />
      <path d="M201 202l67-2c14 42 16 102 8 152-6 50-26 90-52 110-12 10-20 12-23 12Z" />
      <path d="M158 230c-8 44-8 120 4 180M242 230c8 44 8 120-4 180" strokeWidth="1.4" />
    </>
  ),
  sutura: <path d="M200 202v270" strokeWidth="3" strokeDasharray="1 0" />,
  escutelo: <path d="M186 198h28l-14 24Z" />,
  pronoto: (
    <path d="M150 132h100c18 0 28 16 26 36l-8 30H132l-8-30c-2-20 8-36 26-36Zm-14 34h128" strokeWidth="2.5" />
  ),
  cabeza: (
    <path d="M160 92c0-24 20-34 40-34s40 10 40 34c0 20-18 32-40 32s-40-12-40-32Z" />
  ),
  mandibula: (
    <>
      <path d="M186 62c-6-14 2-24 10-20M214 62c6-14-2-24-10-20" strokeWidth="3.5" />
    </>
  ),
  ojo: (
    <>
      <ellipse cx="160" cy="96" rx="11" ry="16" />
      <ellipse cx="240" cy="96" rx="11" ry="16" />
      <path d="M154 86c3 6 3 14 0 20M246 86c-3 6-3 14 0 20" strokeWidth="1.2" />
    </>
  ),
  antena: (
    <>
      <path d="M172 76C152 60 134 56 112 44l-12-6m12 6-14 4m14-4-2-14" strokeWidth="4" />
      <path d="M228 76c20-16 38-20 60-32l12-6m-12 6 14 4m-14-4 2-14" strokeWidth="4" />
      <circle cx="172" cy="78" r="3" />
      <circle cx="228" cy="78" r="3" />
    </>
  ),
};

export default function AnatomyDiagram() {
  const [active, setActive] = useState<string>("elitro");
  const activeRegion = REGIONS.find((r) => r.id === active)!;

  const set = (id: string) => setActive(id);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,440px)_1fr]">
      {/* ------- lámina anatómica ------- */}
      <figure className="label-frame relative bg-pine/80 p-4">
        <figcaption className="flex items-center justify-between px-2 pt-1">
          <span className="text-[10px] font-bold tracking-[0.24em] text-sage/70 uppercase">
            Lámina IX · Carabus sp., vista dorsal
          </span>
          <span className="text-[10px] tracking-[0.18em] text-bone/40 uppercase">esc. 12×</span>
        </figcaption>
        <svg viewBox="0 0 400 540" className="mx-auto mt-2 max-h-[520px] w-full max-w-[400px]" role="img" aria-label="Anatomía dorsal de un escarabajo">
          <defs>
            <radialGradient id="anat-bg" cx="50%" cy="42%" r="65%">
              <stop offset="0%" stopColor="rgba(163,194,147,0.08)" />
              <stop offset="100%" stopColor="rgba(163,194,147,0)" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="400" height="540" fill="url(#anat-bg)" />
          <circle cx="200" cy="280" r="196" fill="none" stroke="rgba(163,194,147,0.14)" strokeDasharray="3 6" />

          {REGIONS.map((r) => {
            const isActive = active === r.id;
            return (
              <g
                key={r.id}
                tabIndex={0}
                role="button"
                aria-label={`${r.term} (${r.latin})`}
                onMouseEnter={() => set(r.id)}
                onClick={() => set(r.id)}
                onFocus={() => set(r.id)}
                className={`cursor-pointer transition-all duration-200 outline-none ${
                  isActive
                    ? "fill-amber/20 stroke-amber"
                    : "fill-fern/40 stroke-sage/55 hover:fill-sage/15 hover:stroke-sage"
                }`}
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={r.id === "ala" ? "none" : undefined}
              >
                {SHAPES[r.id]}
              </g>
            );
          })}

          <text x="200" y="528" textAnchor="middle" className="fill-bone/35" fontSize="13" fontStyle="italic" fontFamily="Fraunces, serif">
            Pasa el puntero —o el dedo— sobre cada región
          </text>
        </svg>
      </figure>

      {/* ------- glosario ------- */}
      <div className="flex flex-col">
        <div className="label-frame bg-pine/80 p-6">
          <p className="text-[10px] font-bold tracking-[0.26em] text-sage/70 uppercase">
            Región seleccionada
          </p>
          <h4 key={active} className="fade-in mt-2 font-display text-3xl font-black text-parch">
            {activeRegion.term}
          </h4>
          <p className="font-display text-lg text-amber italic">{activeRegion.latin}</p>
          <p key={`d-${active}`} className="fade-in mt-3 text-[15px] leading-relaxed text-bone/85">
            {activeRegion.def}
          </p>
        </div>

        <div className="mt-4 grid flex-1 grid-cols-2 gap-2">
          {REGIONS.map((r) => (
            <button
              key={r.id}
              onMouseEnter={() => set(r.id)}
              onClick={() => set(r.id)}
              className={`border px-3 py-2.5 text-left text-xs font-semibold tracking-[0.1em] uppercase transition-all ${
                active === r.id
                  ? "border-amber/70 bg-amber/10 text-amber"
                  : "border-moss text-sage/80 hover:border-sage/60 hover:text-parch"
              }`}
            >
              {r.term}
            </button>
          ))}
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-bone/40">
          Terminología morfológica estándar (Snodgrass, <span className="italic">Principles of Insect Morphology</span>, 1935).
          Las alas membranosas se dibujan punteadas bajo los élitros, en su posición desplegada.
        </p>
      </div>
    </div>
  );
}
