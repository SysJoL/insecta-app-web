import { useEffect } from "react";
import { STATUS_META, TAXONOMY_BASE, fmtMm, type Insect } from "../data/insects";
import { OrderGlyph } from "./glyphs";

interface Props {
  specimen: Insect | null;
  collected: boolean;
  onClose: () => void;
  onToggleCollect: (id: string) => void;
}

const MAX_SIZE = 170;

export default function SpecimenModal({ specimen, collected, onClose, onToggleCollect }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = specimen ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [specimen, onClose]);

  if (!specimen) return null;
  const s = specimen;
  const st = STATUS_META[s.status];

  const stats: { label: string; pct: number; note: string }[] = [
    {
      label: "Longitud corporal",
      pct: Math.max(6, (s.sizeMm / MAX_SIZE) * 100),
      note: fmtMm(s.sizeMm),
    },
    {
      label: "Envergadura alar",
      pct: s.wingspanMm ? Math.max(6, (s.wingspanMm / 150) * 100) : 0,
      note: s.wingspanMm ? fmtMm(s.wingspanMm) : "—",
    },
    { label: "Rareza en lámina", pct: (s.rarity / 5) * 100, note: `${s.rarity} / 5` },
    {
      label: "Potencial defensivo",
      pct: (s.danger / 3) * 100,
      note: ["Inofensivo", "Manipular con guantes", "Picadura dolorosa", "Aguijón potente"][s.danger],
    },
  ];

  return (
    <div
      className="fade-in fixed inset-0 z-[80] flex items-end justify-center bg-ink/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Ficha de ${s.name}`}
    >
      <div
        className="modal-in label-frame relative max-h-[92vh] w-full max-w-3xl overflow-y-auto bg-pine shadow-[0_40px_120px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* cabecera de etiqueta de museo */}
        <div className="flex items-center justify-between border-b border-moss/70 px-6 py-3">
          <p className="font-body text-[11px] tracking-[0.28em] text-sage/80 uppercase">
            Ficha de especimen · N.º {s.id.slice(0, 4).toUpperCase()}-{s.year}
          </p>
          <button
            onClick={onClose}
            className="group flex h-9 w-9 items-center justify-center border border-moss text-bone/70 transition-colors hover:border-rust hover:text-rust"
            aria-label="Cerrar ficha"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 3l10 10M13 3 3 13" />
            </svg>
          </button>
        </div>

        <div className="grid gap-8 p-6 sm:grid-cols-[220px_1fr] sm:p-8">
          {/* vitrina */}
          <div>
            <div className="bg-pingrid pin relative flex aspect-square items-center justify-center border border-moss bg-fern/60">
              <OrderGlyph k={s.orderKey} className="h-36 w-36 text-bone" />
            </div>
            <p className="mt-3 text-center font-display text-sm text-bone/60 italic">
              «Montado y etiquetado a mano»
            </p>

            <dl className="mt-5 space-y-2 border-t border-moss/70 pt-4 text-sm">
              {[
                ["Hábitat", s.habitat],
                ["Región", s.region],
                ["Actividad", s.activity],
                ["Ciclo vital", s.lifespan],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="shrink-0 text-sage/70">{k}</dt>
                  <dd className="text-right text-bone/90">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* datos */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="border border-moss px-2 py-0.5 text-[11px] tracking-[0.18em] text-sage uppercase">
                {s.order}
              </span>
              <span className={`border px-2 py-0.5 text-[11px] tracking-[0.18em] uppercase ${
                st.color === "sage" ? "border-sage/50 text-sage" : st.color === "amber" ? "border-amber/60 text-amber" : "border-rust/60 text-rust"
              }`}>
                {s.status} · {st.label}
              </span>
            </div>

            <h3 className="mt-3 font-display text-4xl leading-none font-black text-parch sm:text-5xl">
              {s.name}
            </h3>
            <p className="mt-1 font-display text-xl text-amber italic">
              {s.latin}
              <span className="ml-2 font-body text-xs text-bone/50 not-italic">
                {s.author}, {s.year}
              </span>
            </p>

            <p className="mt-4 text-[15px] leading-relaxed text-bone/85">{s.desc}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {s.traits.map((t) => (
                <span
                  key={t}
                  className="border border-moss/80 bg-fern px-2.5 py-1 text-xs text-sage"
                >
                  {t}
                </span>
              ))}
            </div>

            {/* barras */}
            <div className="mt-6 space-y-3">
              {stats.map((bar, i) => (
                <div key={bar.label}>
                  <div className="mb-1 flex items-baseline justify-between text-xs">
                    <span className="tracking-[0.14em] text-bone/60 uppercase">{bar.label}</span>
                    <span className="font-display text-sm text-amber">{bar.note}</span>
                  </div>
                  <div className="h-[7px] border border-moss/60 bg-ink/70 p-[1px]">
                    <div
                      className="bar-fill h-full"
                      style={{
                        width: `${bar.pct}%`,
                        background: `linear-gradient(90deg, ${s.accent}55, ${s.accent})`,
                        animationDelay: `${i * 120}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* taxonomía */}
            <div className="mt-6 border border-moss/70 bg-ink/40 p-4">
              <p className="mb-2 text-[11px] tracking-[0.24em] text-sage/70 uppercase">
                Clasificación
              </p>
              <div className="flex flex-wrap items-center gap-y-1 text-sm text-bone/85">
                {[...TAXONOMY_BASE, s.order, s.family, s.latin].map((tax, i, arr) => (
                  <span key={tax + i} className="flex items-center">
                    <span className={i === arr.length - 1 ? "font-display text-amber italic" : ""}>
                      {tax}
                    </span>
                    {i < arr.length - 1 && (
                      <svg viewBox="0 0 8 8" className="mx-2 h-2 w-2 text-moss">
                        <path d="M1 4h6M5 2l2 2-2 2" stroke="currentColor" fill="none" />
                      </svg>
                    )}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => onToggleCollect(s.id)}
              className={`mt-6 w-full border py-3 text-sm font-semibold tracking-[0.2em] uppercase transition-all ${
                collected
                  ? "border-amber bg-amber text-ink hover:bg-honey"
                  : "border-amber/70 text-amber hover:bg-amber/10"
              }`}
            >
              {collected ? "✓ En tu caja de colección" : "Añadir a la caja de colección"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
