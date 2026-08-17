import { GENERA, EPITHETS, type WordPart } from "../data/academic";

const LANG_CHIP: Record<string, string> = {
  Griego: "border-teal/60 text-teal",
  Latín: "border-amber/60 text-amber",
};

function PartCard({ label, part, fallback }: { label: string; part: WordPart | undefined; fallback: string }) {
  const chip = part ? (LANG_CHIP[part.lang] ?? "border-moss text-bone/70") : "border-moss text-bone/45";
  return (
    <div className="flex-1 border border-moss/70 bg-ink/45 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[9px] font-bold tracking-[0.2em] text-sage/60 uppercase">{label}</p>
        <span className={`border px-1.5 py-0.5 text-[9px] tracking-[0.14em] uppercase ${chip}`}>
          {part ? part.lang : "—"}
        </span>
      </div>
      <p className="mt-1.5 font-display text-lg leading-tight font-bold text-parch italic">{fallback}</p>
      <p className="mt-1 text-sm text-bone/85">{part ? part.meaning : "Etimología no catalogada"}</p>
      {part?.detail && <p className="mt-1 text-xs leading-snug text-bone/55">{part.detail}</p>}
    </div>
  );
}

/** Descompone el binomio en género + epíteto y traduce cada raíz (griego/latín). */
export default function EtymologyPanel({ latin }: { latin: string }) {
  const [genus, epithet] = latin.split(" ");
  const g = genus ? GENERA[genus.toLowerCase()] : undefined;
  const e = epithet ? EPITHETS[epithet.toLowerCase()] : undefined;
  const any = g || e;

  return (
    <div>
      <p className="mb-2 text-[11px] tracking-[0.24em] text-sage/70 uppercase">
        Etimología del binomio
      </p>
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-stretch">
        <PartCard label="Género" part={g} fallback={genus ?? latin} />
        <span className="self-center font-display text-xl text-amber/70">+</span>
        <PartCard label="Epíteto específico" part={e} fallback={epithet ?? "—"} />
      </div>
      {!any && (
        <p className="mt-2 text-xs leading-snug text-bone/50">
          Este binomio aún no figura en el diccionario etimológico; sigue, no obstante, la
          nomenclatura binomial de Linneo (género + epíteto específico, en latín científico).
        </p>
      )}
    </div>
  );
}
