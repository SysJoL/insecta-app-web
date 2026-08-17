import { useMemo, type ReactNode } from "react";
import { GLOSSARY } from "../data/academic";

/**
 * Renderiza un texto y envuelve los términos técnicos del glosario
 * en tooltips que se despliegan "al vuelo" (hover o foco por teclado).
 */
export default function GlossaryText({ text, className = "" }: { text: string; className?: string }) {
  const parts = useMemo<ReactNode[]>(() => {
    const terms = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);
    const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    let re: RegExp;
    try {
      re = new RegExp(`(?<![\\p{L}])(${escaped.join("|")})(?![\\p{L}])`, "giu");
    } catch {
      re = new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");
    }

    const segments = text.split(re);
    return segments.map((seg, i) => {
      if (i % 2 === 1) {
        const entry = GLOSSARY[seg.toLowerCase()];
        if (entry) {
          return (
            <span key={i} tabIndex={0} className="group/tip relative inline-block cursor-help border-b border-dotted border-amber/70 text-parch outline-none focus:border-amber">
              {seg}
              <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-56 -translate-x-1/2 border border-amber/60 bg-ink/95 px-3 py-2 text-left text-xs leading-snug text-bone shadow-[0_10px_30px_rgba(0,0,0,0.6)] group-hover/tip:block group-focus/tip:block">
                <span className="mb-0.5 block text-[9px] font-bold tracking-[0.18em] text-amber uppercase">
                  {seg} · glosario
                </span>
                {entry.def}
              </span>
            </span>
          );
        }
      }
      return <span key={i}>{seg}</span>;
    });
  }, [text]);

  return <span className={className}>{parts}</span>;
}
