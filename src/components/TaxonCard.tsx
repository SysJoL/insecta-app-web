import { useState } from "react";
import type { CardTaxon } from "../lib/inat";
import { fmtCompact, glyphForOrder, licenseLabel } from "../lib/inat";
import { OrderGlyph, PinMark } from "./glyphs";

interface Props {
  t: CardTaxon;
  collected: boolean;
  onOpen: () => void;
  onCollect: () => void;
}

export default function TaxonCard({ t, collected, onOpen, onCollect }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const showPhoto = t.photoUrl && !imgFailed;

  return (
    <article
      className={`group relative flex h-full cursor-pointer flex-col overflow-hidden border bg-pine/90 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_50px_rgba(0,0,0,0.55)] ${
        collected ? "border-amber/50" : "border-moss hover:border-amber/60"
      }`}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      aria-label={`Abrir ficha de ${t.latin}`}
    >
      {collected && (
        <PinMark className="absolute top-3 right-3 z-20 h-6 w-6 text-amber drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)]" />
      )}

      {/* vitrina con fotografía de campo */}
      <div className="relative aspect-[5/4] overflow-hidden border-b border-moss/70 bg-fern/40">
        {showPhoto ? (
          <>
            <img
              src={t.photoUrl!}
              alt={`Fotografía de ${t.latin}`}
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-95" />
            {t.attribution && (
              <p className="absolute right-2 bottom-2 left-2 truncate text-[10px] text-bone/75 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {t.attribution.replace("(c) ", "© ")} · {licenseLabel(t.licenseCode)}
              </p>
            )}
          </>
        ) : (
          <div className="bg-pingrid flex h-full w-full items-center justify-center">
            <OrderGlyph
              k={t.glyphKey ?? glyphForOrder(t.orderName)}
              className="h-24 w-24 text-bone/75 transition-all duration-300 group-hover:scale-110 group-hover:text-amber"
            />
          </div>
        )}

        <span className="absolute top-2 left-2 z-10 border border-bone/25 bg-ink/70 px-2 py-0.5 text-[10px] font-semibold tracking-[0.18em] text-bone/90 uppercase backdrop-blur-sm">
          {t.curated ? "Cajón local" : t.orderName}
        </span>
      </div>

      {/* etiqueta */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold tracking-[0.2em] text-sage uppercase">
            {t.rank === "species" ? "Especie" : t.rank}
          </span>
          {t.observations > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-amber tabular-nums" title={`${t.observations} observaciones verificadas`}>
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 1.5 10 6l4.5.5-3.4 3 1 4.5L8 11.7 3.9 14l1-4.5-3.4-3L6 6z" strokeLinejoin="round" />
              </svg>
              {fmtCompact(t.observations)}
            </span>
          )}
        </div>

        <h3 className="mt-1.5 font-display text-xl leading-tight font-bold text-parch italic">
          {t.latin}
        </h3>
        <p className="mt-0.5 text-sm text-bone/70">
          {t.common ?? <span className="text-bone/40 italic">Nombre vulgar no registrado</span>}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-[11px] font-semibold tracking-[0.18em] text-bone/50 uppercase transition-colors group-hover:text-amber">
            Abrir ficha →
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCollect();
            }}
            className={`border px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] uppercase transition-colors ${
              collected
                ? "border-amber bg-amber text-ink"
                : "border-moss text-sage hover:border-amber/60 hover:text-amber"
            }`}
            aria-label={collected ? `Quitar ${t.latin} de la caja` : `Añadir ${t.latin} a la caja`}
          >
            {collected ? "En caja" : "Colectar"}
          </button>
        </div>
      </div>
    </article>
  );
}
