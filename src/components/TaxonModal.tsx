import { useEffect, useState } from "react";
import type { CardTaxon, TaxonDetail, WikiSummary } from "../lib/inat";
import { EXTERNAL, fetchTaxonDetail, fetchWikiSummary, fmtFull, glyphForOrder, licenseLabel } from "../lib/inat";
import { OrderGlyph } from "./glyphs";

interface Props {
  taxon: CardTaxon | null;
  collected: boolean;
  onClose: () => void;
  onToggleCollect: (t: CardTaxon) => void;
}

type LoadState = "loading" | "ready" | "error";

const RANK_ES: Record<string, string> = {
  kingdom: "Reino",
  phylum: "Filo",
  subphylum: "Subfilo",
  class: "Clase",
  order: "Orden",
  family: "Familia",
  genus: "Género",
  species: "Especie",
};

export default function TaxonModal({ taxon, collected, onClose, onToggleCollect }: Props) {
  const [detail, setDetail] = useState<TaxonDetail | null>(null);
  const [wiki, setWiki] = useState<WikiSummary | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [mainPhoto, setMainPhoto] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = taxon ? "hidden" : "";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [taxon, onClose]);

  useEffect(() => {
    if (!taxon) return;
    let alive = true;
    setDetail(null);
    setWiki(null);
    setMainPhoto(0);
    setState("loading");

    if (taxon.curated) {
      // cajón local: no hay detalle remoto
      setState("ready");
      return;
    }

    const inatId = Number(taxon.id.replace("inat:", ""));
    (async () => {
      try {
        const [d, w] = await Promise.all([
          fetchTaxonDetail(inatId),
          fetchWikiSummary(taxon.latin).catch(() => ({ extract: null, url: null, thumbnail: null })),
        ]);
        if (!alive) return;
        setDetail(d);
        setWiki(w);
        setState("ready");
      } catch {
        if (alive) setState("error");
      }
    })();
    return () => {
      alive = false;
    };
  }, [taxon]);

  if (!taxon) return null;

  const photos = detail?.photos.length ? detail.photos : [];
  const currentPhoto = photos[mainPhoto] ?? null;
  const heroSrc = currentPhoto?.url ?? taxon.photoUrl;
  const heroAttribution = currentPhoto?.attribution ?? taxon.attribution;
  const heroLicense = currentPhoto?.licenseCode ?? taxon.licenseCode;

  const lineage = detail?.ancestors ?? [];

  return (
    <div
      className="fade-in fixed inset-0 z-[80] flex items-end justify-center bg-ink/85 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Ficha de ${taxon.latin}`}
    >
      <div
        className="modal-in label-frame relative max-h-[92vh] w-full max-w-4xl overflow-y-auto bg-pine shadow-[0_40px_120px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* cabecera etiqueta de museo */}
        <div className="flex items-center justify-between border-b border-moss/70 px-6 py-3">
          <p className="font-body text-[11px] tracking-[0.28em] text-sage/80 uppercase">
            {taxon.curated ? "Cajón local · espécimen curado" : `Ficha en vivo · iNaturalist n.º ${taxon.id.replace("inat:", "")}`}
          </p>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center border border-moss text-bone/70 transition-colors hover:border-rust hover:text-rust"
            aria-label="Cerrar ficha"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 3l10 10M13 3 3 13" />
            </svg>
          </button>
        </div>

        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[340px_1fr]">
          {/* -------- vitrina fotográfica -------- */}
          <div>
            <div className="relative aspect-[4/3] overflow-hidden border border-moss bg-fern/50">
              {state === "loading" && !heroSrc ? (
                <div className="shimmer absolute inset-0" />
              ) : heroSrc ? (
                <img
                  src={heroSrc}
                  alt={`Fotografía de ${taxon.latin}`}
                  onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="bg-pingrid flex h-full items-center justify-center">
                  <OrderGlyph k={taxon.glyphKey ?? glyphForOrder(taxon.orderName)} className="h-28 w-28 text-bone/80" />
                </div>
              )}
              <span className="absolute top-2 left-2 border border-bone/25 bg-ink/70 px-2 py-0.5 text-[10px] font-semibold tracking-[0.18em] text-bone uppercase backdrop-blur-sm">
                {taxon.orderName}
              </span>
            </div>

            {heroAttribution && (
              <p className="mt-2 text-[11px] leading-snug text-bone/55">
                {heroAttribution.replace("(c) ", "© ")} · {licenseLabel(heroLicense)}
              </p>
            )}

            {/* galería */}
            {photos.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {photos.map((p, i) => (
                  <button
                    key={p.url + i}
                    onClick={() => setMainPhoto(i)}
                    className={`aspect-square overflow-hidden border transition-all ${
                      i === mainPhoto ? "border-amber opacity-100" : "border-moss opacity-60 hover:opacity-100"
                    }`}
                    aria-label={`Ver foto ${i + 1}`}
                  >
                    <img src={p.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* métricas */}
            <dl className="mt-5 space-y-2 border-t border-moss/70 pt-4 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-sage/70">Observaciones verificadas</dt>
                <dd className="font-display text-amber tabular-nums">
                  {taxon.observations > 0 ? fmtFull(taxon.observations) : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-sage/70">Rango taxonómico</dt>
                <dd className="text-bone/90 capitalize">{taxon.rank}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-sage/70">Fuente</dt>
                <dd className="text-bone/90">{taxon.curated ? "Colección curada" : "iNaturalist API"}</dd>
              </div>
            </dl>
          </div>

          {/* -------- datos académicos -------- */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="border border-moss px-2 py-0.5 text-[11px] tracking-[0.18em] text-sage uppercase">
                {taxon.orderName}
              </span>
              <span className="border border-amber/50 px-2 py-0.5 text-[11px] tracking-[0.18em] text-amber uppercase">
                Atlas en vivo
              </span>
            </div>

            <h3 className="mt-3 font-display text-4xl leading-none font-black text-parch italic sm:text-5xl">
              {taxon.latin}
            </h3>
            {taxon.common && (
              <p className="mt-2 text-lg text-bone/80">
                {taxon.common}
                <span className="ml-2 text-sm text-bone/45">— nombre vulgar</span>
              </p>
            )}

            {/* linaje */}
            {lineage.length > 0 && (
              <div className="mt-5 border border-moss/70 bg-ink/40 p-4">
                <p className="mb-2.5 text-[11px] tracking-[0.24em] text-sage/70 uppercase">
                  Clasificación (linaje completo)
                </p>
                <ol className="space-y-1">
                  {[...lineage, { name: taxon.latin, rank: taxon.rank, common: taxon.common }].map(
                    (tax, i, arr) => (
                      <li key={tax.name + i} className="flex items-baseline gap-3 text-sm">
                        <span className="w-20 shrink-0 text-[10px] font-semibold tracking-[0.16em] text-sage/60 uppercase">
                          {RANK_ES[tax.rank] ?? tax.rank}
                        </span>
                        <span className={i === arr.length - 1 ? "font-display text-amber italic" : "text-bone/85"}>
                          {tax.name}
                        </span>
                        {tax.common && i < arr.length - 1 && (
                          <span className="hidden text-xs text-bone/40 sm:inline">({tax.common})</span>
                        )}
                      </li>
                    )
                  )}
                </ol>
              </div>
            )}

            {/* resumen de Wikipedia */}
            <div className="mt-5">
              <p className="mb-2 text-[11px] tracking-[0.24em] text-sage/70 uppercase">
                Nota enciclopédica · Wikipedia
              </p>
              {state === "loading" && !wiki ? (
                <div className="space-y-2">
                  <div className="shimmer h-3.5 w-full" />
                  <div className="shimmer h-3.5 w-11/12" />
                  <div className="shimmer h-3.5 w-4/5" />
                </div>
              ) : wiki?.extract ? (
                <>
                  <p className="max-h-40 overflow-y-auto pr-2 text-[15px] leading-relaxed text-bone/85">
                    {wiki.extract}
                  </p>
                  {wiki.url && (
                    <a
                      href={wiki.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-amber transition-colors hover:text-honey"
                    >
                      Leer el artículo completo
                      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M4 12 12 4M6 4h6v6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  )}
                </>
              ) : (
                <p className="text-sm text-bone/50 italic">
                  Sin resumen enciclopédico disponible para este taxón en español.
                </p>
              )}
            </div>

            {/* enlaces académicos */}
            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "iNaturalist", href: EXTERNAL.inaturalist(taxon.id.replace("inat:", "")) },
                { label: "GBIF", href: EXTERNAL.gbif(taxon.latin) },
                { label: "EOL", href: EXTERNAL.eol(taxon.latin) },
                { label: "Wikipedia", href: wiki?.url ?? EXTERNAL.wikiSearch(taxon.latin) },
              ].map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group/link flex items-center justify-center gap-1.5 border border-moss py-2.5 text-[11px] font-bold tracking-[0.18em] text-sage uppercase transition-all hover:border-amber/70 hover:bg-amber/10 hover:text-amber"
                >
                  {l.label}
                  <svg viewBox="0 0 16 16" className="h-3 w-3 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 12 12 4M6 4h6v6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              ))}
            </div>

            {state === "error" && (
              <p className="mt-4 border border-rust/50 bg-rust/10 p-3 text-sm text-rust">
                No se pudo ampliar la ficha en vivo; la red puede estar limitada. Los datos de la
                tarjeta siguen siendo válidos.
              </p>
            )}

            <button
              onClick={() => onToggleCollect(taxon)}
              className={`mt-6 w-full border py-3 text-sm font-bold tracking-[0.2em] uppercase transition-all ${
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
