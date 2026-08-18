import { useEffect, useRef, useState } from "react";
import type { CardTaxon, TaxonDetail, WikiSummary } from "../lib/inat";
import { EXTERNAL, fetchTaxonDetail, fetchWikiSummary, fmtFull, glyphForOrder, licenseLabel } from "../lib/inat";
import { IUCN_CATS, IUCN_META, fetchIucn, type IucnResult } from "../lib/inatLive";
import { OrderGlyph } from "./glyphs";
import EtymologyPanel from "./EtymologyPanel";
import ReferencesPanel from "./ReferencesPanel";
import GlossaryText from "./GlossaryText";

interface Props {
  taxon: CardTaxon | null;
  collected: boolean;
  wished: boolean;
  onClose: () => void;
  onToggleCollect: (t: CardTaxon) => void;
  onToggleWish: (t: CardTaxon) => void;
}

type LoadState = "loading" | "ready" | "error";
type TabKey = "info" | "etno" | "wiki" | "biblio";

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

const TABS: { key: TabKey; label: string }[] = [
  { key: "info", label: "Info" },
  { key: "etno", label: "Etnobiología" },
  { key: "wiki", label: "Enciclopedia" },
  { key: "biblio", label: "Bibliografía" },
];

export default function TaxonModal({ taxon, collected, wished, onClose, onToggleCollect, onToggleWish }: Props) {
  const [detail, setDetail] = useState<TaxonDetail | null>(null);
  const [wiki, setWiki] = useState<WikiSummary | null>(null);
  const [iucn, setIucn] = useState<IucnResult | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [mainPhoto, setMainPhoto] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>("info");
  const tabRefs = useRef<Map<TabKey, HTMLButtonElement>>(new Map());

  const scrollToTab = (key: TabKey) => {
    tabRefs.current.get(key)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  const handleTab = (key: TabKey) => {
    setActiveTab(key);
    scrollToTab(key);
  };

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
    setIucn(null);
    setMainPhoto(0);
    setState("loading");
    setActiveTab("info");
    setTimeout(() => scrollToTab("info"), 50);

    (async () => {
      try {
        const detailP: Promise<TaxonDetail | null> = taxon.curated
          ? Promise.resolve(null)
          : fetchTaxonDetail(Number(taxon.id.replace("inat:", "")));
        const wikiP = fetchWikiSummary(taxon.latin).catch(() => ({
          extract: null,
          url: null,
          thumbnail: null,
        }));
        const iucnP = fetchIucn(taxon.latin);
        const [d, w, iu] = await Promise.all([detailP, wikiP, iucnP]);
        if (!alive) return;
        setDetail(d);
        setWiki(w);
        setIucn(iu);
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
  const family = lineage.find((a) => a.rank === "family")?.name;
  const refQuery = family ?? (taxon.rank === "order" ? taxon.latin : taxon.orderName);

  const externalLinks = [
    { label: "iNaturalist", href: EXTERNAL.inaturalist(taxon.id.replace("inat:", "")) },
    { label: "GBIF", href: EXTERNAL.gbif(taxon.latin) },
    { label: "EOL", href: EXTERNAL.eol(taxon.latin) },
    { label: "Wikipedia", href: wiki?.url ?? EXTERNAL.wikiSearch(taxon.latin) },
  ];

  return (
    <div
      className="fade-in fixed inset-0 z-[80] flex items-end justify-center bg-ink/85 p-0 sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Ficha de ${taxon.latin}`}
    >
      <div
        className="sheet-up label-frame relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-xl bg-pine shadow-[0_40px_120px_rgba(0,0,0,0.6)] sm:max-h-[92vh] sm:rounded-none sm:modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* cabecera */}
        <div className="flex shrink-0 flex-col border-b border-moss/70">
          {/*desktop header */}
          <div className="hidden items-center justify-between px-6 py-3 sm:flex">
            <p className="font-body text-[11px] tracking-[0.28em] text-sage/80 uppercase">
              {taxon.curated ? "Cajón local · espécimen curado" : `Ficha en vivo · iNaturalist n.º ${taxon.id.replace("inat:", "")}`}
            </p>
            <button
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center border border-moss text-bone/70 transition-colors hover:border-rust hover:text-rust"
              aria-label="Cerrar ficha"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 3l10 10M13 3 3 13" />
              </svg>
            </button>
          </div>

          {/* mobile header: grid con status + botones + close */}
          <div className="flex items-center justify-between px-4 py-3 sm:hidden">
            <p className="min-w-0 flex-1 truncate font-body text-[10px] tracking-[0.22em] text-sage/70 uppercase">
              {taxon.curated ? "Cajón local · curado" : `iNaturalist n.º ${taxon.id.replace("inat:", "")}`}
            </p>
            <button
              onClick={onClose}
              className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center border border-moss text-bone/70 transition-colors hover:border-rust hover:text-rust"
              aria-label="Cerrar ficha"
            >
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 3l10 10M13 3 3 13" />
              </svg>
            </button>
          </div>


        </div>

        {/* contenido scrolleable */}
        <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto overflow-x-hidden no-scrollbar p-4 sm:gap-8 sm:p-8 lg:grid-cols-[340px_1fr]">
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

          {/* -------- columna derecha -------- */}
          <div className="flex min-h-0 min-w-0 flex-col">
            {/* badges + título */}
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <span className="border border-moss px-2 py-0.5 text-[11px] tracking-[0.18em] text-sage uppercase">
                {taxon.orderName}
              </span>
              <span className="border border-amber/50 px-2 py-0.5 text-[11px] tracking-[0.18em] text-amber uppercase">
                Atlas en vivo
              </span>
            </div>

            <h3 className="mt-3 font-display text-3xl leading-none font-black text-parch italic sm:text-4xl lg:text-5xl">
              {taxon.latin}
            </h3>
            {taxon.common && (
              <p className="mt-2 text-base text-bone/80 sm:text-lg">
                {taxon.common}
                <span className="ml-2 text-sm text-bone/45">— nombre vulgar</span>
              </p>
            )}

            {/* tabs: scroll horizontal en móvil */}
            <div className="no-scrollbar mt-5 w-full shrink-0 overflow-x-auto sm:mt-6 sm:overflow-visible">
              <div className="flex w-max gap-1 border-b border-transparent sm:border-b sm:border-moss/70 sm:w-auto">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    ref={(el) => { if (el) tabRefs.current.set(t.key, el); }}
                    onClick={() => handleTab(t.key)}
                    className={`whitespace-nowrap border-b-2 px-3 py-2 text-[11px] font-bold tracking-[0.16em] uppercase transition-colors sm:px-4 ${
                      activeTab === t.key
                        ? "border-amber bg-amber/15 text-amber sm:bg-transparent"
                        : "border-transparent text-bone/50 hover:text-bone/80"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* contenido del tab activo */}
            <div className="min-h-0 flex-1 py-4 sm:py-5">
              {activeTab === "info" && (
                <>
                  {lineage.length > 0 && (
                    <div className="border border-moss/70 bg-ink/40 p-3 sm:p-4">
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
                  {state === "error" && (
                    <p className="mt-4 border border-rust/50 bg-rust/10 p-3 text-sm text-rust">
                      No se pudo ampliar la ficha en vivo; la red puede estar limitada. Los datos de la
                      tarjeta siguen siendo válidos.
                    </p>
                  )}
                </>
              )}

              {activeTab === "etno" && (
                <div className="space-y-4 sm:space-y-5">
                  <div className="border border-moss/70 bg-ink/40 p-3 sm:p-4">
                    <EtymologyPanel latin={taxon.latin} />
                  </div>
                  <div className="border border-moss/70 bg-ink/40 p-3 sm:p-4">
                    <p className="mb-3 text-[11px] tracking-[0.24em] text-sage/70 uppercase">
                      Conservación · Lista Roja IUCN vía GBIF
                    </p>
                    {iucn === null && state === "loading" ? (
                      <div className="shimmer h-9 w-full" />
                    ) : iucn?.category ? (
                      <>
                        <div className="flex flex-wrap gap-1.5">
                          {IUCN_CATS.map((c) => {
                            const meta = IUCN_META[c];
                            const on = c === iucn.category;
                            return (
                              <span
                                key={c}
                                title={meta.label}
                                className={`px-2.5 py-1.5 text-[11px] font-bold tracking-[0.14em] transition-all ${
                                  on
                                    ? "scale-110 text-ink shadow-[0_6px_18px_rgba(0,0,0,0.45)]"
                                    : "border border-moss text-bone/35"
                                }`}
                                style={on ? { background: meta.color } : undefined}
                              >
                                {c}
                              </span>
                            );
                          })}
                        </div>
                        <p className="mt-2.5 text-sm text-bone/80">
                          <strong style={{ color: IUCN_META[iucn.category]?.color ?? "#e5a83b" }}>
                            {IUCN_META[iucn.category]?.label ?? iucn.category}
                          </strong>
                          {iucn.gbifKey && (
                            <>
                              {" · "}
                              <a
                                href={`https://www.gbif.org/species/${iucn.gbifKey}`}
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-amber transition-colors hover:text-honey"
                              >
                                ficha GBIF ↗
                              </a>
                            </>
                          )}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-bone/55 italic">
                        Sin evaluación en la Lista Roja según GBIF (NE). No implica bajo riesgo: muchos
                        taxones aún no han sido evaluados.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "wiki" && (
                <div>
                  {state === "loading" && !wiki ? (
                    <div className="space-y-2">
                      <div className="shimmer h-3.5 w-full" />
                      <div className="shimmer h-3.5 w-11/12" />
                      <div className="shimmer h-3.5 w-4/5" />
                    </div>
                  ) : wiki?.extract ? (
                    <>
                      <p className="text-[15px] leading-relaxed text-bone/85">
                        <GlossaryText text={wiki.extract} />
                      </p>
                      {wiki.url && (
                        <a
                          href={wiki.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-amber transition-colors hover:text-honey"
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
              )}

              {activeTab === "biblio" && (
                <div className="border border-moss/70 bg-ink/40 p-3 sm:p-4">
                  <ReferencesPanel query={refQuery} latin={taxon.latin} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* footer sticky */}
        <div className="flex shrink-0 flex-col border-t border-moss/70 bg-pine/95 backdrop-blur-sm">
          {/* fila 1: links externos en 4 columnas iguales */}
          <div className="grid grid-cols-4 gap-1.5 px-4 py-2.5 sm:gap-2 sm:px-6 sm:py-3">
            {externalLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1 border border-moss px-2 py-1.5 text-[9px] font-bold tracking-[0.14em] text-sage uppercase transition-all hover:border-amber/70 hover:bg-amber/10 hover:text-amber sm:text-[11px]"
              >
                {l.label}
                <svg viewBox="0 0 16 16" className="h-2.5 w-2.5 sm:h-3 sm:w-3" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 12 12 4M6 4h6v6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            ))}
          </div>

          {/* separador */}
          <div className="mx-4 border-t border-moss/50 sm:mx-6" />

          {/* fila 2: botones de acción en 2 columnas iguales */}
          <div className="grid grid-cols-2 gap-2 px-4 py-2.5 sm:px-6 sm:py-3">
            <button
              onClick={() => onToggleWish(taxon)}
              className={`flex items-center justify-center border px-3 py-2 text-[10px] font-bold tracking-[0.18em] uppercase transition-all sm:text-[11px] ${
                wished
                  ? "border-rust bg-rust/10 text-rust hover:bg-rust/20"
                  : "border-moss text-sage hover:border-rust/60 hover:text-rust"
              }`}
            >
              {wished ? "♥ En lista" : "Deseo"}
            </button>
            <button
              onClick={() => onToggleCollect(taxon)}
              className={`flex items-center justify-center border px-3 py-2 text-[10px] font-bold tracking-[0.18em] uppercase transition-all sm:text-[11px] ${
                collected
                  ? "border-amber bg-amber text-ink hover:bg-honey"
                  : "border-amber/70 text-amber hover:bg-amber/10"
              }`}
            >
              {collected ? "✓ En tu caja" : "Añadir a la caja"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
