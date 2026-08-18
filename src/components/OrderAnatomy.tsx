import { useState, type ReactNode } from "react";
import { ORDER_ANATOMY, type OrderAnatomyData, type AnatomyPart } from "../data/orderAnatomy";

/* ---------- SVG shapes for Lepidoptera (Papilio, dorsal view) ---------- */

const LEP_SVG: Record<string, ReactNode> = {
  alas_escamosas: (
    <>
      {/* forewings with scale pattern */}
      <path d="M200 200 C160 140 80 100 50 160 C30 200 40 280 80 340 C120 400 170 420 198 410 Z" strokeWidth="2" />
      <path d="M200 200 C240 140 320 100 350 160 C370 200 360 280 320 340 C280 400 230 420 202 410 Z" strokeWidth="2" />
      {/* scale pattern lines */}
      <path d="M120 200 C140 240 160 300 180 360" strokeWidth="0.8" strokeDasharray="2 4" />
      <path d="M280 200 C260 240 240 300 220 360" strokeWidth="0.8" strokeDasharray="2 4" />
      <path d="M90 240 C120 260 150 300 180 340" strokeWidth="0.8" strokeDasharray="2 4" />
      <path d="M310 240 C280 260 250 300 220 340" strokeWidth="0.8" strokeDasharray="2 4" />
    </>
  ),
  espiritrompa: (
    <>
      <path d="M200 120 C200 100 195 80 180 70 C165 60 155 65 155 75 C155 85 165 90 175 85" strokeWidth="2.5" fill="none" />
      <circle cx="155" cy="75" r="3" />
    </>
  ),
  antenas_clavadas: (
    <>
      <path d="M188 130 C170 100 150 70 130 50" strokeWidth="2" fill="none" />
      <ellipse cx="130" cy="48" rx="5" ry="8" transform="rotate(-20 130 48)" />
      <path d="M212 130 C230 100 250 70 270 50" strokeWidth="2" fill="none" />
      <ellipse cx="270" cy="48" rx="5" ry="8" transform="rotate(20 270 48)" />
    </>
  ),
  ojos_compuestos: (
    <>
      <ellipse cx="180" cy="135" rx="16" ry="20" />
      <ellipse cx="220" cy="135" rx="16" ry="20" />
      {/* facet pattern */}
      <circle cx="175" cy="128" r="2" strokeDasharray="1 2" />
      <circle cx="185" cy="128" r="2" strokeDasharray="1 2" />
      <circle cx="180" cy="142" r="2" strokeDasharray="1 2" />
      <circle cx="215" cy="128" r="2" strokeDasharray="1 2" />
      <circle cx="225" cy="128" r="2" strokeDasharray="1 2" />
      <circle cx="220" cy="142" r="2" strokeDasharray="1 2" />
    </>
  ),
  torax: (
    <>
      <path d="M175 160 C175 155 185 150 200 150 C215 150 225 155 225 160 L225 200 C225 205 215 210 200 210 C185 210 175 205 175 200 Z" strokeWidth="2" />
      <path d="M175 175 L225 175" strokeWidth="1" strokeDasharray="3 3" />
      <path d="M175 190 L225 190" strokeWidth="1" strokeDasharray="3 3" />
    </>
  ),
  alas_traseras: (
    <>
      <path d="M200 210 C170 210 130 230 120 270 C110 310 130 350 160 370 C180 380 195 370 198 350 Z" strokeWidth="2" />
      <path d="M200 210 C230 210 270 230 280 270 C290 310 270 350 240 370 C220 380 205 370 202 350 Z" strokeWidth="2" />
      <path d="M155 250 C170 280 185 320 195 350" strokeWidth="0.8" strokeDasharray="2 4" />
      <path d="M245 250 C230 280 215 320 205 350" strokeWidth="0.8" strokeDasharray="2 4" />
    </>
  ),
  abdomen: (
    <>
      <path d="M185 210 C185 215 188 230 192 260 C196 290 198 310 200 320 C202 310 204 290 208 260 C212 230 215 215 215 210 Z" strokeWidth="2" />
      <path d="M192 230 L208 230" strokeWidth="1" strokeDasharray="2 3" />
      <path d="M190 250 L210 250" strokeWidth="1" strokeDasharray="2 3" />
      <path d="M191 270 L209 270" strokeWidth="1" strokeDasharray="2 3" />
      <path d="M193 290 L207 290" strokeWidth="1" strokeDasharray="2 3" />
    </>
  ),
  patas: (
    <>
      {/* front legs */}
      <path d="M180 170 150 160 130 175 115 185" strokeWidth="2.5" fill="none" />
      <path d="M220 170 250 160 270 175 285 185" strokeWidth="2.5" fill="none" />
      {/* mid legs */}
      <path d="M178 195 145 210 125 235 110 245" strokeWidth="2.5" fill="none" />
      <path d="M222 195 255 210 275 235 290 245" strokeWidth="2.5" fill="none" />
      {/* hind legs */}
      <path d="M180 215 150 240 130 275 115 290" strokeWidth="2.5" fill="none" />
      <path d="M220 215 250 240 270 275 285 290" strokeWidth="2.5" fill="none" />
    </>
  ),
};

const REGIONS_ORDER = [
  "alas_escamosas",
  "espiritrompa",
  "antenas_clavadas",
  "ojos_compuestos",
  "torax",
  "alas_traseras",
  "abdomen",
  "patas",
];

export default function OrderAnatomy() {
  const data: OrderAnatomyData = ORDER_ANATOMY.Lepidoptera;
  const [activeId, setActiveId] = useState<string>("alas_escamosas");
  const activePart: AnatomyPart | undefined = data.parts.find((p) => p.id === activeId);

  const set = (id: string) => setActiveId(id);

  return (
    <div>
      {/* header */}
      <div className="mb-6 flex flex-wrap items-baseline gap-3">
        <h4 className="font-display text-2xl font-black text-parch sm:text-3xl">{data.latin}</h4>
        <span className="text-sm text-bone/55">{data.representative} · {data.representativeLatin}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        {/* ------- SVG interactivo ------- */}
        <figure className="label-frame relative bg-pine/80 p-4">
          <figcaption className="flex items-center justify-between px-2 pt-1">
            <span className="text-[10px] font-bold tracking-[0.24em] text-sage/70 uppercase">
              Lámina anatómica · {data.representativeLatin}, vista dorsal
            </span>
            <span className="text-[10px] tracking-[0.18em] text-bone/40 uppercase">esc. 4×</span>
          </figcaption>
          <svg viewBox="0 0 400 440" className="mx-auto mt-2 max-h-[480px] w-full max-w-[400px]" role="img" aria-label={`Anatomía dorsal de ${data.representativeLatin}`}>
            <defs>
              <radialGradient id="anat-bg-lep" cx="50%" cy="42%" r="65%">
                <stop offset="0%" stopColor="rgba(163,194,147,0.08)" />
                <stop offset="100%" stopColor="rgba(163,194,147,0)" />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="400" height="440" fill="url(#anat-bg-lep)" />
            <circle cx="200" cy="240" r="196" fill="none" stroke="rgba(163,194,147,0.14)" strokeDasharray="3 6" />

            {REGIONS_ORDER.map((rid) => {
              const isActive = activeId === rid;
              return (
                <g
                  key={rid}
                  tabIndex={0}
                  role="button"
                  aria-label={data.parts.find((p) => p.id === rid)?.term ?? rid}
                  onMouseEnter={() => set(rid)}
                  onClick={() => set(rid)}
                  onFocus={() => set(rid)}
                  className={`cursor-pointer transition-all duration-200 outline-none ${
                    isActive
                      ? "fill-amber/20 stroke-amber"
                      : "fill-fern/30 stroke-sage/55 hover:fill-sage/15 hover:stroke-sage"
                  }`}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {LEP_SVG[rid]}
                </g>
              );
            })}

            <text x="200" y="428" textAnchor="middle" className="fill-bone/35" fontSize="13" fontStyle="italic" fontFamily="Fraunces, serif">
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
            {activePart && (
              <>
                <h4 key={activePart.id} className="fade-in mt-2 font-display text-3xl font-black text-parch">
                  {activePart.term}
                </h4>
                <p className="font-display text-lg text-amber italic">{activePart.latin}</p>
                <p key={`d-${activePart.id}`} className="fade-in mt-3 text-[15px] leading-relaxed text-bone/85">
                  {activePart.def}
                </p>
              </>
            )}
          </div>

          <div className="mt-4 grid flex-1 grid-cols-2 gap-2">
            {data.parts.map((r) => (
              <button
                key={r.id}
                onMouseEnter={() => set(r.id)}
                onClick={() => set(r.id)}
                className={`border px-3 py-2.5 text-left text-xs font-semibold tracking-[0.1em] uppercase transition-all ${
                  activeId === r.id
                    ? "border-amber/70 bg-amber/10 text-amber"
                    : "border-moss text-sage/80 hover:border-sage/60 hover:text-parch"
                }`}
              >
                {r.term}
              </button>
            ))}
          </div>

          {/* rasgos distintivos */}
          <div className="mt-5 border border-moss/60 bg-ink/50 p-5">
            <p className="mb-3 text-[10px] font-bold tracking-[0.24em] text-sage/70 uppercase">
              Rasgos distintivos del orden
            </p>
            <ul className="space-y-1.5">
              {data.distinguishing.map((d) => (
                <li key={d} className="flex items-start gap-2 text-sm text-bone/80">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-amber" />
                  {d}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 text-[11px] leading-relaxed text-bone/40">
            Terminología morfológica basada en Snodgrass (<span className="italic">Principles of Insect Morphology</span>, 1935)
            y Borror & DeLong (<span className="italic">Introduction to the Study of Insects</span>, 7ª ed.).
          </p>
        </div>
      </div>
    </div>
  );
}
