import { useMemo, useState } from "react";
import { KEY_NODES, KEY_START, type KeyNode } from "../data/fieldKey";
import { OrderGlyph } from "./glyphs";

interface Step {
  nodeId: string;
  choice?: string;
}

interface Props {
  onPickOrder: (order: string) => void;
}

const LETTERS = ["a", "b", "c"];

export default function DichotomousKey({ onPickOrder }: Props) {
  const [path, setPath] = useState<Step[]>([{ nodeId: KEY_START }]);

  const current: KeyNode = KEY_NODES[path[path.length - 1].nodeId];
  const isResult = current.type === "r";
  const depth = path.length;

  const answered = useMemo(
    () =>
      path
        .slice(0, -1)
        .map((s) => ({ node: KEY_NODES[s.nodeId], choice: s.choice ?? "" }))
        .filter((a) => a.node.type === "q"),
    [path]
  );

  const choose = (next: string, label: string) => {
    setPath((p) => [...p, { nodeId: next, choice: label }]);
  };

  const back = () => setPath((p) => (p.length > 1 ? p.slice(0, -1) : p));
  const jumpTo = (index: number) => setPath((p) => p.slice(0, index + 1));
  const restart = () => setPath([{ nodeId: KEY_START }]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* ------- tarjeta de pregunta / resultado ------- */}
      <div className="label-frame relative bg-pine/80 p-6 sm:p-8">
        {/* rastro navegable */}
        <div className="mb-6 flex flex-wrap items-center gap-1.5">
          {path.map((s, i) => {
            const n = KEY_NODES[s.nodeId];
            const last = i === path.length - 1;
            return (
              <span key={s.nodeId + i} className="flex items-center gap-1.5">
                <button
                  onClick={() => jumpTo(i)}
                  disabled={last}
                  className={`border px-2 py-0.5 text-[10px] font-bold tracking-[0.14em] uppercase transition-colors ${
                    last
                      ? "cursor-default border-amber/60 bg-amber/10 text-amber"
                      : "border-moss text-sage/70 hover:border-amber/50 hover:text-amber"
                  }`}
                >
                  {n.type === "q" ? `P${i + 1}` : n.order}
                </button>
                {!last && (
                  <svg viewBox="0 0 8 8" className="h-2 w-2 text-moss">
                    <path d="M1 4h6M5 2l2 2-2 2" stroke="currentColor" fill="none" />
                  </svg>
                )}
              </span>
            );
          })}
        </div>

        {current.type === "q" ? (
          <>
            <p className="text-[11px] font-bold tracking-[0.3em] text-sage uppercase">
              Pregunta {depth} · observa con la lupa
            </p>
            <h4 className="mt-3 max-w-xl font-display text-2xl leading-snug font-bold text-parch sm:text-3xl">
              {current.question}
            </h4>
            {current.hint && (
              <p className="mt-3 flex max-w-xl items-start gap-2 border-l-2 border-amber/50 pl-3 text-sm text-bone/65 italic">
                <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0 text-amber" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="8" r="6.5" />
                  <path d="M8 7.5v4M8 4.6v.2" strokeLinecap="round" />
                </svg>
                {current.hint}
              </p>
            )}

            <div className="mt-7 space-y-3">
              {current.options.map((o, i) => (
                <button
                  key={o.next}
                  onClick={() => choose(o.next, o.label)}
                  className="group flex w-full items-center gap-4 border border-moss bg-ink/50 p-4 text-left transition-all hover:translate-x-1.5 hover:border-amber/70 hover:bg-amber/5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-sage/40 font-display text-lg font-bold text-sage transition-colors group-hover:border-amber group-hover:bg-amber group-hover:text-ink">
                    {LETTERS[i]}
                  </span>
                  <span>
                    <span className="block font-semibold text-bone group-hover:text-parch">{o.label}</span>
                    {o.detail && <span className="block text-xs text-bone/50">{o.detail}</span>}
                  </span>
                  <svg viewBox="0 0 16 16" className="ml-auto h-4 w-4 shrink-0 text-bone/30 transition-all group-hover:translate-x-1 group-hover:text-amber" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={back}
                disabled={depth === 1}
                className="flex items-center gap-2 border border-moss px-4 py-2 text-[11px] font-bold tracking-[0.18em] text-sage uppercase transition-colors hover:border-amber/60 hover:text-amber disabled:cursor-not-allowed disabled:opacity-35"
              >
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M13 8H3M7 4 3 8l4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Volver
              </button>
              {depth > 1 && (
                <button
                  onClick={restart}
                  className="text-[11px] font-bold tracking-[0.18em] text-bone/45 uppercase transition-colors hover:text-rust"
                >
                  Reiniciar clave
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="fade-in">
            <p className="text-[11px] font-bold tracking-[0.3em] text-amber uppercase">
              Identificación alcanzada · {depth - 1} pasos
            </p>
            <div className="mt-5 flex flex-col items-start gap-6 sm:flex-row">
              <div className="bg-pingrid pin relative flex h-32 w-32 shrink-0 items-center justify-center border border-amber/40 bg-fern/50">
                <OrderGlyph k={current.glyph} className="h-20 w-20 text-amber" />
              </div>
              <div>
                <h4 className="font-display text-4xl font-black text-parch sm:text-5xl">{current.order}</h4>
                <p className="mt-1 font-display text-lg text-amber italic">{current.latin}</p>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-bone/80">{current.blurb}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {current.traits.map((t) => (
                    <span key={t} className="border border-moss bg-ink/50 px-2.5 py-1 text-xs text-sage">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => onPickOrder(current.order)}
                className="group flex items-center gap-3 border border-amber bg-amber px-5 py-3 text-xs font-bold tracking-[0.2em] text-ink uppercase transition-all hover:bg-honey"
              >
                Ver en el atlas
                <svg viewBox="0 0 16 16" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={restart}
                className="border border-moss px-5 py-3 text-xs font-bold tracking-[0.2em] text-sage uppercase transition-colors hover:border-amber/60 hover:text-amber"
              >
                Identificar otro
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ------- diario de la clave ------- */}
      <aside className="border border-moss/70 bg-ink/50 p-5">
        <p className="text-[11px] font-bold tracking-[0.26em] text-sage/70 uppercase">
          Diario de la clave
        </p>
        {answered.length === 0 && !isResult ? (
          <div className="mt-5 space-y-3">
            <p className="text-sm leading-relaxed text-bone/60">
              Responde observando un espécimen real o una fotografía. Cada respuesta queda
              anotada aquí, como en un cuaderno de determinación.
            </p>
            <ul className="space-y-2 text-xs text-bone/45">
              {["Lupa 10× y buena luz", "Empieza por las alas", "Ante la duda, vuelve un paso"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-amber" /> {t}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ol className="mt-4 space-y-2.5">
            {answered.map((a, i) => (
              <li key={i} className="border-b border-moss/40 pb-2.5">
                <p className="text-[10px] font-bold tracking-[0.18em] text-sage/60 uppercase">
                  Paso {i + 1}
                </p>
                <p className="text-xs text-bone/55 line-through decoration-sage/40">
                  {a.node.type === "q" ? a.node.question : ""}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-amber">
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2.5 8.5 6 12l7.5-8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {a.choice}
                </p>
              </li>
            ))}
            {isResult && (
              <li className="bg-amber/10 p-3">
                <p className="text-[10px] font-bold tracking-[0.18em] text-amber uppercase">
                  Conclusión
                </p>
                <p className="mt-1 font-display text-lg font-bold text-parch">
                  Orden {current.type === "r" ? current.order : ""}
                </p>
              </li>
            )}
          </ol>
        )}
        <p className="mt-5 border-t border-moss/40 pt-4 text-[11px] leading-relaxed text-bone/40">
          Clave dicotómica simplificada con fines didácticos. Para determinación rigurosa,
          consulta claves regionales y caracteres genitales.
        </p>
      </aside>
    </div>
  );
}
