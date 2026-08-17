import { useEffect, useState } from "react";
import { CLASSIC_REFERENCES } from "../data/academic";
import { catalogueOfLife, fetchLiterature, type Reference } from "../lib/references";

interface Props {
  query: string;       // familia, orden o nombre científico
  latin: string;       // para el Catálogo de la Vida
}

export default function ReferencesPanel({ query, latin }: Props) {
  const [refs, setRefs] = useState<Reference[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setRefs(null);
    setUsedFallback(false);
    fetchLiterature(query, 5)
      .then((r) => {
        if (!alive) return;
        if (r.length === 0) {
          setRefs(CLASSIC_REFERENCES);
          setUsedFallback(true);
        } else {
          setRefs(r);
        }
      })
      .catch(() => {
        if (alive) {
          setRefs(CLASSIC_REFERENCES);
          setUsedFallback(true);
        }
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [query]);

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="text-[11px] tracking-[0.24em] text-sage/70 uppercase">
          Bibliografía científica
        </p>
        {!loading && (
          <a
            href={catalogueOfLife(latin)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber transition-colors hover:text-honey"
          >
            Catálogo de la Vida
            <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 12 12 4M6 4h6v6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="shimmer h-3.5 w-full" />
          <div className="shimmer h-3.5 w-4/5" />
          <div className="shimmer h-3.5 w-11/12" />
        </div>
      ) : refs ? (
        <>
          <ul className="space-y-2.5">
            {refs.map((r) => (
              <li key={r.title + r.year} className="border-l-2 border-sage/40 pl-3 text-sm leading-snug">
                <p className="font-semibold text-parch">{r.title}</p>
                <p className="text-xs text-bone/60">
                  {r.authors} ({r.year}). <span className="italic">{r.source}</span>.
                </p>
                {r.url ? (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-0.5 inline-flex items-center gap-1 font-mono text-[11px] text-amber transition-colors hover:text-honey"
                  >
                    DOI {r.doi}
                    <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 12 12 4M6 4h6v6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                ) : (
                  <span className="mt-0.5 inline-block text-[10px] tracking-[0.14em] text-bone/40 uppercase">
                    libro · sin DOI
                  </span>
                )}
              </li>
            ))}
          </ul>
          {usedFallback && (
            <p className="mt-2 text-[11px] text-bone/45 italic">
              Referencias clásicas de la entomología (GBIF no devolvió literatura para este taxón).
            </p>
          )}
        </>
      ) : null}
    </div>
  );
}
