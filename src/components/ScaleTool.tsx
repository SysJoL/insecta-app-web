import { useMemo, useState } from "react";
import { SPECIMENS } from "../data/insects";

const MAX_MM = 200;
const X0 = 24;
const MM_TO_X = 952 / MAX_MM; // lienzo 0..1000

const REFERENCES = [
  { id: "abeja", label: "Abeja melífera", mm: 15 },
  { id: "moneda", label: "Moneda de 1 €", mm: 23 },
  { id: "cerilla", label: "Caja de cerillas", mm: 42 },
  { id: "tarjeta", label: "Tarjeta de crédito", mm: 86 },
  { id: "mano", label: "Mano adulta", mm: 190 },
];

export default function ScaleTool() {
  const [aId, setAId] = useState(SPECIMENS[0].id);
  const [bId, setBId] = useState(SPECIMENS[4].id);
  const [refs, setRefs] = useState<Set<string>>(() => new Set(["abeja", "moneda"]));

  const a = useMemo(() => SPECIMENS.find((s) => s.id === aId)!, [aId]);
  const b = useMemo(() => SPECIMENS.find((s) => s.id === bId)!, [bId]);
  const ratio = Math.max(a.sizeMm, b.sizeMm) / Math.min(a.sizeMm, b.sizeMm);

  const toggleRef = (id: string) =>
    setRefs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const ticks = useMemo(() => {
    const t: { mm: number; major: boolean }[] = [];
    for (let mm = 0; mm <= MAX_MM; mm += 10) t.push({ mm, major: mm % 50 === 0 });
    return t;
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      {/* ------- regla ------- */}
      <div className="label-frame overflow-hidden bg-pine/80">
        <svg viewBox="0 0 1000 190" className="w-full" role="img" aria-label="Comparador de longitudes corporales a escala">
          {/* referencias cotidianas */}
          {REFERENCES.filter((r) => refs.has(r.id)).map((r) => {
            const x = X0 + r.mm * MM_TO_X;
            return (
              <g key={r.id}>
                <line x1={x} y1={26} x2={x} y2={166} stroke="rgba(236,227,205,0.3)" strokeDasharray="4 5" />
                <text x={x + 5} y={38} fontSize="14" fill="rgba(236,227,205,0.55)">
                  {r.label} · {r.mm} mm
                </text>
              </g>
            );
          })}

          {/* regla graduada */}
          <line x1={X0} y1={166} x2={X0 + MAX_MM * MM_TO_X} y2={166} stroke="rgba(163,194,147,0.6)" strokeWidth="1.5" />
          {ticks.map((t) => (
            <g key={t.mm}>
              <line
                x1={X0 + t.mm * MM_TO_X}
                y1={166}
                x2={X0 + t.mm * MM_TO_X}
                y2={166 - (t.major ? 14 : 7)}
                stroke="rgba(163,194,147,0.5)"
                strokeWidth="1.2"
              />
              {t.major && (
                <text x={X0 + t.mm * MM_TO_X} y={184} textAnchor="middle" fontSize="13" fill="rgba(163,194,147,0.7)">
                  {t.mm}
                </text>
              )}
            </g>
          ))}

          {/* barra A */}
          <text x={X0} y={72} fontSize="17" fill="rgba(236,227,205,0.85)" fontStyle="italic" fontFamily="Fraunces, serif">
            {a.latin} — {a.sizeMm} mm
          </text>
          <rect
            x={X0}
            y={78}
            width={a.sizeMm * MM_TO_X}
            height={24}
            fill="rgba(229,168,59,0.85)"
            className="transition-all duration-500"
          />
          <rect x={X0} y={78} width={a.sizeMm * MM_TO_X} height={5} fill="rgba(255,255,255,0.25)" className="transition-all duration-500" />

          {/* barra B */}
          <text x={X0} y={130} fontSize="17" fill="rgba(236,227,205,0.85)" fontStyle="italic" fontFamily="Fraunces, serif">
            {b.latin} — {b.sizeMm} mm
          </text>
          <rect
            x={X0}
            y={136}
            width={b.sizeMm * MM_TO_X}
            height={24}
            fill="rgba(163,194,147,0.75)"
            className="transition-all duration-500"
          />
          <rect x={X0} y={136} width={b.sizeMm * MM_TO_X} height={5} fill="rgba(255,255,255,0.22)" className="transition-all duration-500" />
        </svg>
        <p className="border-t border-moss/60 px-5 py-3 text-sm text-bone/65">
          <span className="font-display text-lg text-amber italic">{a.name}</span> es{" "}
          <strong className="text-parch">{ratio.toFixed(1)}×</strong>{" "}
          {ratio >= 1 ? "más largo que" : "más corto que"}{" "}
          <span className="font-display text-lg text-sage italic">{b.name}</span>. Escala 1 px ≙ la misma
          longitud en ambas barras.
        </p>
      </div>

      {/* ------- controles ------- */}
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1.5 flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-amber uppercase">
            <span className="h-2.5 w-2.5 bg-amber" /> Especie A
          </span>
          <select
            value={aId}
            onChange={(e) => setAId(e.target.value)}
            className="w-full border border-moss bg-ink/70 px-3 py-2.5 text-sm text-bone focus:border-amber"
          >
            {SPECIMENS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {s.sizeMm} mm
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-sage uppercase">
            <span className="h-2.5 w-2.5 bg-sage" /> Especie B
          </span>
          <select
            value={bId}
            onChange={(e) => setBId(e.target.value)}
            className="w-full border border-moss bg-ink/70 px-3 py-2.5 text-sm text-bone focus:border-amber"
          >
            {SPECIMENS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {s.sizeMm} mm
              </option>
            ))}
          </select>
        </label>

        <div>
          <p className="mb-1.5 text-[10px] font-bold tracking-[0.2em] text-bone/60 uppercase">
            Referencias cotidianas
          </p>
          <div className="flex flex-wrap gap-1.5">
            {REFERENCES.map((r) => {
              const on = refs.has(r.id);
              return (
                <button
                  key={r.id}
                  onClick={() => toggleRef(r.id)}
                  className={`border px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                    on
                      ? "border-amber/70 bg-amber/10 text-amber"
                      : "border-moss text-bone/55 hover:border-sage/60 hover:text-sage"
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        <p className="border border-moss/60 bg-ink/40 p-3 text-[11px] leading-relaxed text-bone/45">
          La API de iNaturalist no publica medidas corporales; este comparador usa las tallas
          verificadas del cajón curado. Longitud corporal máxima del adulto.
        </p>
      </div>
    </div>
  );
}
