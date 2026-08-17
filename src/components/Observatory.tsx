import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fmtCompact, glyphForOrder, type CardTaxon } from "../lib/inat";
import {
  MESES,
  fetchMonthHistogram,
  fetchNearby,
  fetchObservationsFor,
  type NearbyTaxon,
  type ObsPoint,
} from "../lib/inatLive";
import { OrderGlyph } from "./glyphs";

const pinIcon = L.divIcon({
  className: "inat-pin",
  html: "<span></span>",
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -10],
});

/* Reencuadra el mapa cuando llegan puntos y corrige el tamaño al montar. */
function MapController({ points }: { points: ObsPoint[] }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 150);
    if (points.length) {
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
      map.fitBounds(bounds.pad(0.25), { maxZoom: 11 });
    }
    return () => clearTimeout(t);
  }, [points, map]);
  return null;
}

function Spinner() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8 animate-spin text-amber" fill="none" stroke="currentColor" strokeWidth="3">
      <circle cx="16" cy="16" r="12" strokeOpacity="0.2" />
      <path d="M16 4a12 12 0 0 1 12 12" strokeLinecap="round" />
    </svg>
  );
}

function SpeciesSelect({
  species,
  value,
  onChange,
}: {
  species: CardTaxon[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <label className="flex min-w-0 flex-1 items-center gap-2 sm:max-w-sm">
      <span className="shrink-0 text-[10px] font-bold tracking-[0.2em] text-sage uppercase">
        Taxón
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-moss bg-ink/70 px-3 py-2.5 text-sm text-bone focus:border-amber"
      >
        {species.map((s) => (
          <option key={s.id} value={s.id}>
            {s.latin}
            {s.common ? ` — ${s.common}` : ""}
          </option>
        ))}
      </select>
    </label>
  );
}

/* ---------------- pane: mapa ---------------- */

function MapPane({ selectedId }: { selectedId: string }) {
  const [points, setPoints] = useState<ObsPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!selectedId) return;
    const id = Number(selectedId.replace("inat:", ""));
    let alive = true;
    setLoading(true);
    setError(false);
    fetchObservationsFor(id)
      .then((pts) => alive && setPoints(pts))
      .catch(() => alive && setError(true))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [selectedId]);

  return (
    <div>
      <div className="relative h-[440px] border border-moss">
        <MapContainer center={[20, 0]} zoom={2} className="h-full w-full" scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController points={points} />
          {points.map((p, i) => (
            <Marker key={`${p.lat.toFixed(4)},${p.lng.toFixed(4)},${i}`} position={[p.lat, p.lng]} icon={pinIcon}>
              <Popup>
                <div className="w-44">
                  {p.photoUrl && (
                    <img src={p.photoUrl} alt="" loading="lazy" className="mb-1.5 h-24 w-full border border-moss object-cover" />
                  )}
                  <p className="font-display text-[13px] italic">{p.latin}</p>
                  <p className="text-[11px] text-sage/80">
                    {new Date(p.date + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        {loading && (
          <div className="absolute inset-0 z-[1000] grid place-items-center bg-ink/60">
            <Spinner />
          </div>
        )}
      </div>
      <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-bone/55">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber" /> {points.length} observaciones
          georreferenciadas de grado investigación
        </span>
        <span>· fuente: iNaturalist API · mapa: OpenStreetMap</span>
        {error && <span className="text-rust">· error al consultar la API</span>}
      </p>
    </div>
  );
}

/* ---------------- pane: fenología ---------------- */

function PhenologyPane({ selectedId, latin }: { selectedId: string; latin: string }) {
  const [values, setValues] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!selectedId) return;
    const id = Number(selectedId.replace("inat:", ""));
    let alive = true;
    setLoading(true);
    setError(false);
    setValues(null);
    fetchMonthHistogram(id)
      .then((v) => alive && setValues(v))
      .catch(() => alive && setError(true))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [selectedId]);

  const max = values ? Math.max(...values, 1) : 1;
  const total = values ? values.reduce((a, b) => a + b, 0) : 0;
  const peakIdx = values ? values.indexOf(Math.max(...values)) : -1;

  return (
    <div className="label-frame bg-pine/80 p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-bone/70">
          ¿Cuándo vuela <span className="font-display text-lg text-amber italic">{latin}</span>?
        </p>
        <p className="text-xs text-bone/50">{total > 0 ? `${fmtCompact(total)} observaciones históricas` : ""}</p>
      </div>

      {loading ? (
        <div className="mt-8 flex justify-center">
          <Spinner />
        </div>
      ) : error ? (
        <p className="mt-8 text-center text-sm text-rust">No se pudo obtener el histograma mensual.</p>
      ) : values ? (
        <>
          <div className="mt-6 grid h-56 grid-cols-12 items-end gap-1.5 sm:gap-2.5">
            {MESES.map((m, i) => (
              <div key={m} className="flex h-full flex-col items-center justify-end gap-1.5" title={`${m}: ${values[i]} observaciones`}>
                <span className="text-[9px] text-bone/50 tabular-nums sm:text-[10px]">
                  {values[i] > 0 ? fmtCompact(values[i]) : ""}
                </span>
                <div
                  className={`w-full transition-[height] duration-700 ${i === peakIdx ? "bg-amber" : "bg-sage/50"}`}
                  style={{ height: `${Math.max(2, (values[i] / max) * 78)}%`, transitionDelay: `${i * 40}ms` }}
                />
                <span className={`text-[9px] font-semibold tracking-[0.12em] uppercase sm:text-[10px] ${i === peakIdx ? "text-amber" : "text-bone/45"}`}>
                  {m}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-5 border-t border-moss/50 pt-4 text-sm text-bone/75">
            Pico de actividad: <strong className="text-amber capitalize">{MESES[peakIdx]}</strong>
            {total > 0 && (
              <>
                {" "}
                con <strong className="text-parch">{fmtCompact(values[peakIdx])}</strong> observaciones (
                {Math.round((values[peakIdx] / total) * 100)} % del total). Histograma por mes del año,
                iNaturalist.
              </>
            )}
          </p>
        </>
      ) : null}
    </div>
  );
}

/* ---------------- pane: especies cercanas ---------------- */

const RADII = [5, 25, 100];

function NearbyPane({ onOpen }: { onOpen: (t: CardTaxon) => void }) {
  const [radius, setRadius] = useState(25);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [found, setFound] = useState<NearbyTaxon[] | null>(null);

  const locate = () => {
    setErr(null);
    setBusy(true);
    if (!("geolocation" in navigator)) {
      setErr("Tu navegador no expone la API de geolocalización.");
      setBusy(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        try {
          setFound(await fetchNearby(latitude, longitude, radius));
        } catch {
          setErr("iNaturalist no respondió; comprueba la conexión e inténtalo de nuevo.");
        } finally {
          setBusy(false);
        }
      },
      () => {
        setErr("Permiso de ubicación denegado. Actívalo en el navegador para ver qué vuela en tu zona.");
        setBusy(false);
      },
      { timeout: 15000 }
    );
  };

  return (
    <div>
      <div className="label-frame flex flex-wrap items-center gap-3 bg-pine/80 p-5">
        <button
          onClick={locate}
          disabled={busy}
          className="group flex items-center gap-2.5 border border-amber bg-amber px-5 py-2.5 text-xs font-bold tracking-[0.18em] text-ink uppercase transition-all hover:bg-honey disabled:opacity-60"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="8" cy="8" r="3" />
            <path d="M8 1v2.5M8 12.5V15M1 8h2.5M12.5 8H15" strokeLinecap="round" />
          </svg>
          {busy ? "Localizando…" : "Localizarme"}
        </button>
        <div className="flex gap-1.5">
          {RADII.map((r) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={`border px-3 py-2 text-[11px] font-bold tracking-[0.14em] uppercase transition-colors ${
                radius === r ? "border-amber bg-amber/15 text-amber" : "border-moss text-sage/70 hover:border-sage/60"
              }`}
            >
              {r} km
            </button>
          ))}
        </div>
        <p className="ml-auto text-xs text-bone/50">
          Insecta · grado investigación · radio {radius} km
        </p>
      </div>

      {err && <p className="mt-4 border border-rust/50 bg-rust/10 p-3 text-sm text-rust">{err}</p>}
      {busy && (
        <div className="mt-6 flex justify-center">
          <Spinner />
        </div>
      )}

      {found && !busy && (
        <>
          {coords && (
            <p className="mt-4 text-xs text-bone/50">
              Coordenadas: <span className="font-mono text-sage">{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span> ·{" "}
              {found.length} taxones distintos en la muestra
            </p>
          )}
          {found.length === 0 ? (
            <p className="mt-6 text-center font-display text-xl text-bone/60 italic">
              Silencio entomológico: ninguna observación verificada en este radio.
            </p>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {found.map((t) => (
                <button
                  key={t.id}
                  onClick={() =>
                    onOpen({
                      id: `inat:${t.id}`,
                      latin: t.latin,
                      common: t.common,
                      orderName: "Insecta",
                      rank: t.rank,
                      observations: 0,
                      photoUrl: t.photoUrl,
                    })
                  }
                  className="group border border-moss bg-pine/90 text-left transition-all hover:-translate-y-1 hover:border-amber/60"
                >
                  <div className="relative aspect-[4/3] overflow-hidden border-b border-moss/60 bg-fern/40">
                    {t.photoUrl ? (
                      <img src={t.photoUrl} alt={t.latin} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <OrderGlyph k={glyphForOrder("Insecta")} className="h-12 w-12 text-sage/60" />
                      </div>
                    )}
                    <span className="absolute top-1.5 right-1.5 border border-amber/60 bg-ink/80 px-1.5 py-0.5 text-[10px] font-bold text-amber">
                      ×{t.count}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="font-display text-sm leading-tight font-bold text-parch italic">{t.latin}</p>
                    {t.common && <p className="mt-0.5 truncate text-xs text-bone/60">{t.common}</p>}
                    <p className="mt-1 text-[10px] tracking-[0.16em] text-sage/70 uppercase">{t.rank}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {!found && !busy && !err && (
        <p className="mt-6 border border-dashed border-moss/70 p-6 text-center text-sm text-bone/50 italic">
          Pulsa «Localizarme» para consultar qué insectos se han observado a {radius} km de donde estás.
        </p>
      )}
    </div>
  );
}

/* ---------------- observatorio ---------------- */

const PANES = [
  { id: "map", label: "Mapa de avistamientos" },
  { id: "phen", label: "Fenología mensual" },
  { id: "near", label: "Especies cercanas" },
] as const;

type PaneId = (typeof PANES)[number]["id"];

export default function Observatory({
  species,
  onOpen,
}: {
  species: CardTaxon[];
  onOpen: (t: CardTaxon) => void;
}) {
  const usable = species.filter((s) => !s.curated);
  const [pane, setPane] = useState<PaneId>("map");
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    if (!selectedId && usable.length) setSelectedId(usable[0].id);
    if (selectedId && !usable.some((u) => u.id === selectedId) && usable.length)
      setSelectedId(usable[0].id);
  }, [usable, selectedId]);

  const selected = usable.find((s) => s.id === selectedId) ?? null;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {PANES.map((p) => (
            <button
              key={p.id}
              onClick={() => setPane(p.id)}
              className={`border px-3.5 py-2 text-[11px] font-bold tracking-[0.16em] uppercase transition-all ${
                pane === p.id
                  ? "border-amber bg-amber text-ink"
                  : "border-moss text-sage hover:border-amber/50 hover:text-amber"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {pane !== "near" && usable.length > 0 && (
          <SpeciesSelect species={usable} value={selectedId} onChange={setSelectedId} />
        )}
      </div>

      {pane === "near" ? (
        <NearbyPane onOpen={onOpen} />
      ) : usable.length === 0 ? (
        <div className="label-frame bg-pine/70 p-10 text-center">
          <p className="font-display text-xl text-bone/70 italic">
            El atlas aún no tiene datos en vivo para alimentar este instrumento.
          </p>
          <p className="mt-2 text-sm text-bone/50">
            Recarga el atlas (botón «Actualizar») o espera a que iNaturalist responda.
          </p>
        </div>
      ) : pane === "map" ? (
        <MapPane selectedId={selectedId} />
      ) : (
        <PhenologyPane selectedId={selectedId} latin={selected?.latin ?? ""} />
      )}
    </div>
  );
}
