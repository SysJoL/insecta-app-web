import { useEffect, useState } from "react";
import { fmtFull, glyphForOrder, type CardTaxon } from "../lib/inat";
import { OrderGlyph } from "./glyphs";

function Panel({
  t,
  winner,
  maxObs,
  tag,
}: {
  t: CardTaxon;
  winner: boolean;
  maxObs: number;
  tag: "A" | "B";
}) {
  const hasObs = t.observations > 0;
  return (
    <div className={`label-frame relative bg-pine/85 transition-all ${winner ? "border-amber/70" : ""}`}>
      <span
        className={`absolute top-3 left-3 z-10 flex h-8 w-8 items-center justify-center border font-display text-base font-black ${
          tag === "A" ? "border-amber/70 text-amber" : "border-sage/70 text-sage"
        }`}
      >
        {tag}
      </span>
      {winner && (
        <span className="absolute top-3 right-3 z-10 border border-amber bg-amber px-2 py-0.5 text-[10px] font-bold tracking-[0.14em] text-ink uppercase">
          ▲ Más observado
        </span>
      )}

      <div className="relative aspect-[7/4] overflow-hidden border-b border-moss/60 bg-fern/40">
        {t.photoUrl ? (
          <img src={t.photoUrl} alt={t.latin} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="bg-pingrid flex h-full items-center justify-center">
            <OrderGlyph k={t.glyphKey ?? glyphForOrder(t.orderName)} className="h-20 w-20 text-bone/70" />
          </div>
        )}
      </div>

      <div className="p-5">
        <p className="font-display text-2xl leading-tight font-black text-parch italic">{t.latin}</p>
        {t.common && <p className="mt-0.5 text-sm text-bone/70">{t.common}</p>}

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="border border-moss px-2 py-0.5 text-[10px] tracking-[0.16em] text-sage uppercase">
            {t.orderName}
          </span>
          <span className="border border-moss px-2 py-0.5 text-[10px] tracking-[0.16em] text-bone/60 uppercase">
            {t.rank}
          </span>
          <span className="border border-moss px-2 py-0.5 text-[10px] tracking-[0.16em] text-bone/60 uppercase">
            {t.curated ? "Cajón curado" : "iNaturalist"}
          </span>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] font-bold tracking-[0.2em] text-sage/70 uppercase">
              Observaciones verificadas
            </span>
            <span className="font-display text-xl font-black text-amber tabular-nums">
              {hasObs ? fmtFull(t.observations) : "—"}
            </span>
          </div>
          <div className="mt-1.5 h-[7px] border border-moss/60 bg-ink/70 p-[1px]">
            <div
              className={`bar-fill h-full ${winner ? "bg-amber" : "bg-sage/60"}`}
              style={{ width: `${hasObs && maxObs > 0 ? Math.max(3, (t.observations / maxObs) * 100) : 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SpeciesCompare({ species }: { species: CardTaxon[] }) {
  const [aId, setAId] = useState("");
  const [bId, setBId] = useState("");

  useEffect(() => {
    if (!aId && species[0]) setAId(species[0].id);
    if (!bId && species[1]) setBId(species[1].id);
  }, [species, aId, bId]);

  const a = species.find((s) => s.id === aId) ?? null;
  const b = species.find((s) => s.id === bId) ?? null;

  if (!a || !b) {
    return (
      <p className="label-frame bg-pine/70 p-10 text-center font-display text-xl text-bone/70 italic">
        Cargando especímenes para la mesa de comparación…
      </p>
    );
  }

  const hasCounts = a.observations > 0 || b.observations > 0;
  const winner: "a" | "b" | null =
    hasCounts && a.observations !== b.observations
      ? a.observations > b.observations
        ? "a"
        : "b"
      : null;
  const maxObs = Math.max(a.observations, b.observations);
  const delta = Math.abs(a.observations - b.observations);
  const ratio =
    hasCounts && Math.min(a.observations, b.observations) > 0
      ? (Math.max(a.observations, b.observations) / Math.min(a.observations, b.observations)).toFixed(1)
      : null;
  const sameOrder = a.orderName === b.orderName;

  return (
    <div>
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-2">
          <span className="shrink-0 text-[10px] font-bold tracking-[0.2em] text-amber uppercase">A</span>
          <select
            value={aId}
            onChange={(e) => setAId(e.target.value)}
            className="w-full border border-moss bg-ink/70 px-3 py-2.5 text-sm text-bone focus:border-amber"
          >
            {species.map((s) => (
              <option key={s.id} value={s.id}>
                {s.latin}
                {s.common ? ` — ${s.common}` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="shrink-0 text-[10px] font-bold tracking-[0.2em] text-sage uppercase">B</span>
          <select
            value={bId}
            onChange={(e) => setBId(e.target.value)}
            className="w-full border border-moss bg-ink/70 px-3 py-2.5 text-sm text-bone focus:border-amber"
          >
            {species.map((s) => (
              <option key={s.id} value={s.id}>
                {s.latin}
                {s.common ? ` — ${s.common}` : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Panel t={a} tag="A" winner={winner === "a"} maxObs={maxObs} />
        <Panel t={b} tag="B" winner={winner === "b"} maxObs={maxObs} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border border-moss/60 bg-ink/50 px-5 py-4 text-sm">
        <span className="text-[10px] font-bold tracking-[0.24em] text-sage/70 uppercase">Diferencial</span>
        {hasCounts ? (
          <>
            <span className="text-bone/80">
              Δ <strong className="text-parch tabular-nums">{fmtFull(delta)}</strong> observaciones
              {ratio && (
                <>
                  {" "}
                  · <strong className="text-amber">{ratio}×</strong> entre ambas
                </>
              )}
            </span>
            <span
              className={`border px-2 py-0.5 text-[10px] font-bold tracking-[0.16em] uppercase ${
                sameOrder ? "border-sage/50 text-sage" : "border-amber/60 text-amber"
              }`}
            >
              {sameOrder ? `Mismo orden · ${a.orderName}` : `${a.orderName} ≠ ${b.orderName}`}
            </span>
          </>
        ) : (
          <span className="text-bone/55 italic">
            Sin conteos en vivo disponibles (cajón local): compara taxonomía y fotografías.
          </span>
        )}
      </div>
    </div>
  );
}
