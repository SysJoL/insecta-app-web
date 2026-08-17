import { OrderGlyph } from "./glyphs";

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 12 12 4M6 4h6v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface FooterProps {
  statusLabel: string;
  statusCls: string;
  clock: string;
}

const SOURCES = [
  { n: "iNaturalist API v1", d: "especies, conteos y fotografías", u: "https://www.inaturalist.org/pages/api+reference" },
  { n: "Wikipedia REST API", d: "resúmenes enciclopédicos en español", u: "https://es.wikipedia.org/api/rest_v1" },
  { n: "GBIF", d: "referencia global de biodiversidad", u: "https://www.gbif.org/es" },
  { n: "Encyclopedia of Life", d: "fichas de historia natural", u: "https://eol.org" },
];

export default function Footer({ statusLabel, statusCls, clock }: FooterProps) {
  return (
    <footer id="fuentes" className="relative overflow-hidden border-t border-moss/60 bg-ink">
      <p
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 font-display text-[22vw] leading-none font-black whitespace-nowrap text-fern/40 select-none"
      >
        INSECTA
      </p>
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <OrderGlyph k="beetle" className="h-8 w-8 text-amber" />
            <span className="font-display text-xl font-black text-parch">INSECTA</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-bone/60">
            Atlas entomológico de ciencia abierta: datos en vivo, fotografías con licencia y
            referencias cruzadas a las grandes bases de biodiversidad.
          </p>
          <p className="mt-4 text-xs text-bone/45">
            Compilado a partir del repositorio <span className="text-amber">SysJoL/insecta-app-web</span>.
          </p>
        </div>

        <div>
          <p className="mb-3 text-[11px] font-bold tracking-[0.26em] text-sage uppercase">Fuentes de datos</p>
          <ul className="space-y-2.5 text-sm text-bone/75">
            {SOURCES.map((f) => (
              <li key={f.n}>
                <a href={f.u} target="_blank" rel="noreferrer" className="group flex items-start gap-2 transition-colors hover:text-amber">
                  <span className="mt-1 text-amber"><ExternalLinkIcon /></span>
                  <span>
                    <span className="font-semibold text-parch group-hover:text-amber">{f.n}</span>
                    <span className="block text-xs text-bone/50">{f.d}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-[11px] font-bold tracking-[0.26em] text-sage uppercase">Créditos y licencias</p>
          <p className="text-sm leading-relaxed text-bone/70">
            Las fotografías pertenecen a los observadores de la comunidad iNaturalist y se
            muestran respetando su licencia Creative Commons (visible en cada tarjeta y
            ficha). Los conteos corresponden a observaciones verificadas por la comunidad.
          </p>
          <p className="mt-4 text-sm text-bone/70">
            Sin conexión, el atlas se apoya en un <span className="text-amber">cajón local</span> con
            catorce especímenes curados e ilustración propia.
          </p>
          <p className="mt-6 text-xs text-bone/45">React · Vite · Tailwind — uso divulgativo y académico.</p>
        </div>
      </div>
      <div className="relative border-t border-moss/50 flex flex-wrap items-center justify-center gap-4 py-4 text-[11px] tracking-[0.24em] text-bone/40 uppercase">
        <span className="flex items-center gap-2">
          <span className={`blink-dot h-1.5 w-1.5 rounded-full ${statusCls}`} />
          {statusLabel} · <span className="font-mono tabular-nums">{clock}</span>
        </span>
        <span>·</span>
        <span>Vol. IV · Hecho con lupa, API y paciencia</span>
      </div>
    </footer>
  );
}
