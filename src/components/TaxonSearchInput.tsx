import { useCallback, useEffect, useRef, useState } from "react";
import { searchSpecies, type CardTaxon } from "../lib/inat";
import { Search } from "lucide-react";

export default function TaxonSearchInput({
  value,
  onSelect,
  suggestions,
  orderMap,
  label,
  excludeId,
}: {
  value: CardTaxon | null;
  onSelect: (t: CardTaxon) => void;
  suggestions: CardTaxon[];
  orderMap: Map<number, string>;
  label: string;
  excludeId?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CardTaxon[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | undefined>(undefined);

  /* close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const doSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        setSearching(false);
        return;
      }
      setSearching(true);
      try {
        const hits = await searchSpecies(q, orderMap, "with", 10);
        setResults(hits);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    },
    [orderMap]
  );

  const handleChange = (v: string) => {
    setQuery(v);
    setOpen(true);
    window.clearTimeout(timerRef.current);
    if (v.trim()) {
      setSearching(true);
      timerRef.current = window.setTimeout(() => doSearch(v), 350);
    } else {
      setResults([]);
      setSearching(false);
    }
  };

  const pick = (t: CardTaxon) => {
    onSelect(t);
    setQuery("");
    setResults([]);
    setOpen(false);
    inputRef.current?.blur();
  };

  const filteredSuggestions = suggestions.filter((s) => s.id !== excludeId);
  const displayItems = query.trim() ? results : filteredSuggestions.slice(0, 8);
  const showDropdown = open && displayItems.length > 0;

  return (
    <div ref={wrapRef} className="relative">
      <label className="mb-1.5 block text-[10px] font-bold tracking-[0.2em] text-sage uppercase">
        {label}
      </label>
      <div className="flex items-center border border-moss bg-ink/70 transition-colors focus-within:border-amber">
        <Search className="ml-3 h-4 w-4 shrink-0 text-bone/40" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder={value ? value.latin : "Buscar especie…"}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setOpen(true)}
          className="w-full bg-transparent px-3 py-2.5 text-sm text-bone placeholder:text-bone/35 focus:outline-none"
        />
        {value && !query && (
          <button
            onClick={() => onSelect(null as unknown as CardTaxon)}
            className="mr-2 shrink-0 border border-moss/60 px-1.5 py-0.5 text-[10px] text-bone/50 transition-colors hover:border-rust hover:text-rust"
          >
            ✕
          </button>
        )}
      </div>

      {showDropdown && (
        <ul className="absolute z-50 mt-1 max-h-72 w-full overflow-auto border border-moss bg-pine shadow-lg shadow-black/40">
          {!query.trim() && (
            <li className="px-3 py-1.5 text-[10px] font-bold tracking-[0.18em] text-bone/40 uppercase">
              {filteredSuggestions.length > 0 ? "En pantalla" : "Escribe para buscar en iNaturalist"}
            </li>
          )}
          {searching && (
            <li className="px-3 py-2 text-xs text-bone/50 italic">Buscando…</li>
          )}
          {displayItems.map((t) => (
            <li key={t.id}>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(t);
                }}
                className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-amber/5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden border border-moss/60 bg-fern/40">
                  {t.photoUrl ? (
                    <img src={t.photoUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-bone/40">—</span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-sm font-bold italic text-parch">
                    {t.latin}
                  </span>
                  {t.common && (
                    <span className="block truncate text-xs text-bone/55">{t.common}</span>
                  )}
                </span>
                <span className="shrink-0 border border-moss/60 px-1.5 py-0.5 text-[9px] tracking-[0.12em] text-bone/50 uppercase">
                  {t.orderName}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
