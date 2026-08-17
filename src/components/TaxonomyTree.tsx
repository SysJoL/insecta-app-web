import { useEffect, useMemo, useState } from "react";
import { fmtCompact, glyphForOrder, type CardTaxon, type OrderInfo } from "../lib/inat";
import { fetchChildren, type TaxonChild } from "../lib/inatLive";
import { OrderGlyph } from "./glyphs";

interface Crumb {
  id: number;
  name: string;
  rank: string;
}

const RANK_ES: Record<string, string> = {
  order: "Orden",
  suborder: "Suborden",
  infraorder: "Infraorden",
  superfamily: "Superfamilia",
  family: "Familia",
  subfamily: "Subfamilia",
  tribe: "Tribu",
  genus: "Género",
  subgenus: "Subgénero",
  species: "Especie",
};

function rankChip(rank: string) {
  switch (rank) {
    case "species":
      return "border-amber/60 text-amber";
    case "genus":
    case "subgenus":
      return "border-teal/60 text-teal";
    case "family":
    case "subfamily":
      return "border-sage/60 text-sage";
    default:
      return "border-moss text-bone/60";
  }
}

export default function TaxonomyTree({
  orders,
  onOpen,
}: {
  orders: OrderInfo[];
  onOpen: (t: CardTaxon) => void;
}) {
  const [path, setPath] = useState<Crumb[]>([]);
  const [children, setChildren] = useState<TaxonChild[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    const node = path[path.length - 1];
    if (!node) {
      setChildren(null);
      return;
    }
    let alive = true;
    setLoading(true);
    setError(false);
    setChildren(null);
    fetchChildren(node.id)
      .then((c) => alive && setChildren(c))
      .catch(() => alive && setError(true))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [path, retryTick]);

  const orderName = path.find((p) => p.rank === "order")?.name ?? "Insecta";

  const rootRows: TaxonChild[] = useMemo(
    () =>
      orders.map((o) => ({
        id: o.id,
        name: o.name,
        rank: "order",
        common: o.common,
        observations: 0,
        photoUrl: null,
      })),
    [orders]
  );

  const rows = path.length === 0 ? rootRows : children;

  const openSpecies = (c: TaxonChild) =>
    onOpen({
      id: `inat:${c.id}`,
      latin: c.name,
      common: c.common,
      orderName,
      rank: c.rank,
      observations: c.observations,
      photoUrl: c.photoUrl,
    });

  const isItalicRank = (r: string) => r === "genus" || r === "subgenus" || r === "species";

  return (
    <div className="label-frame bg-pine/80 p-5 sm:p-6">
      {/* miga de pan */}
      <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-sm" aria-label="Ruta taxonómica">
        <button
          onClick={() => setPath([])}
          className={`border px-2 py-1 text-[11px] font-bold tracking-[0.14em] uppercase transition-colors ${
            path.length === 0
              ? "cursor-default border-amber/60 bg-amber/10 text-amber"
              : "border-moss text-sage/70 hover:border-amber/50 hover:text-amber"
          }`}
        >
          Insecta
        </button>
        {path.map((c, i) => (
          <span key={c.id} className="flex items-center gap-1.5">
            <svg viewBox="0 0 8 8" className="h-2 w-2 text-moss">
              <path d="M1 4h6M5 2l2 2-2 2" stroke="currentColor" fill="none" />
            </svg>
            <button
              onClick={() => setPath(path.slice(0, i + 1))}
              className={`border px-2 py-1 font-display text-[13px] italic transition-colors ${
                i === path.length - 1
                  ? "cursor-default border-amber/60 bg-amber/10 text-amber"
                  : "border-moss text-bone/70 hover:border-amber/50 hover:text-amber"
              }`}
            >
              {c.name}
            </button>
          </span>
        ))}
      </nav>

      {/* acciones */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs text-bone/55">
          {path.length === 0
            ? `${rootRows.length} órdenes · elige uno para descender`
            : `Descendiendo por ${RANK_ES[path[path.length - 1].rank] ?? path[path.length - 1].rank}: ${path[path.length - 1].name}`}
        </p>
        {path.length > 0 && (
          <button
            onClick={() => setPath(path.slice(0, -1))}
            className="flex items-center gap-1.5 border border-moss px-3 py-1.5 text-[10px] font-bold tracking-[0.18em] text-sage uppercase transition-colors hover:border-amber/60 hover:text-amber"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M13 8H3M7 4 3 8l4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Subir
          </button>
        )}
      </div>

      {/* filas */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="shimmer h-16 w-full" style={{ animationDelay: `${i * 80}ms` }} />
          ))}
        </div>
      ) : error ? (
        <div className="py-10 text-center">
          <p className="text-sm text-rust">No se pudieron cargar los descendientes de este taxón.</p>
          <button
            onClick={() => setRetryTick((t) => t + 1)}
            className="mt-3 border border-rust/60 px-4 py-2 text-[11px] font-bold tracking-[0.18em] text-rust uppercase transition-colors hover:bg-rust/10"
          >
            Reintentar
          </button>
        </div>
      ) : rows && rows.length === 0 ? (
        <p className="py-10 text-center font-display text-xl text-bone/60 italic">
          Este taxón no tiene descendientes registrados en iNaturalist.
        </p>
      ) : !rows ? (
        <p className="py-10 text-center text-sm text-bone/50">
          Conecta con la API para explorar el árbol de la vida (Insecta → orden → familia → género).
        </p>
      ) : (
        <ul className="divide-y divide-moss/40 border border-moss/50">
          {rows.map((c) => {
            const speciesRow = c.rank === "species";
            return (
              <li key={c.id}>
                <button
                  onClick={() => (speciesRow ? openSpecies(c) : setPath([...path, { id: c.id, name: c.name, rank: c.rank }]))}
                  className="group flex w-full items-center gap-4 px-3 py-2.5 text-left transition-all hover:bg-amber/5 hover:pl-5"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden border border-moss/60 bg-fern/40">
                    {c.photoUrl ? (
                      <img src={c.photoUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <OrderGlyph k={glyphForOrder(c.rank === "order" ? c.name : orderName)} className="h-8 w-8 text-sage/70" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate font-display text-base font-bold ${
                        isItalicRank(c.rank) ? "italic" : ""
                      } ${speciesRow ? "text-amber" : "text-parch"}`}
                    >
                      {c.name}
                    </span>
                    {c.common && <span className="block truncate text-xs text-bone/55">{c.common}</span>}
                  </span>
                  <span className={`hidden shrink-0 border px-2 py-0.5 text-[10px] tracking-[0.14em] uppercase sm:inline ${rankChip(c.rank)}`}>
                    {RANK_ES[c.rank] ?? c.rank}
                  </span>
                  {c.observations > 0 && (
                    <span className="hidden shrink-0 text-xs text-bone/55 tabular-nums md:inline">
                      {fmtCompact(c.observations)} obs.
                    </span>
                  )}
                  <svg
                    viewBox="0 0 16 16"
                    className="h-4 w-4 shrink-0 text-bone/30 transition-all group-hover:translate-x-1 group-hover:text-amber"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    {speciesRow ? (
                      <path d="M4 12 12 4M6 4h6v6" strokeLinecap="round" strokeLinejoin="round" />
                    ) : (
                      <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                    )}
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-4 text-[11px] text-bone/40">
        Jerarquía servida en vivo por iNaturalist (<span className="italic">/taxa/children</span>). En una
        especie, la fila abre su ficha académica completa.
      </p>
    </div>
  );
}
