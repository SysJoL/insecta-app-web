import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ORDERS,
  ORDER_COUNTS,
  SPECIMENS,
  STATUS_META,
  fmtMm,
  type Insect,
} from "./data/insects";
import { OrderGlyph, PinMark } from "./components/glyphs";
import { Reveal, useCountUp } from "./components/Reveal";
import Fireflies from "./components/Fireflies";
import SpecimenModal from "./components/SpecimenModal";

/* ---------------- persistencia ---------------- */

const COL_KEY = "insecta:caja";
const LOG_KEY = "insecta:cuaderno";

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

interface Sighting {
  id: string;
  insectId: string;
  place: string;
  date: string;
  note: string;
  createdAt: number;
}

/* ---------------- piezas pequeñas ---------------- */

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setP(max > 0 ? (window.scrollY / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 z-[70] h-[3px] w-full bg-transparent">
      <div
        className="h-full bg-amber transition-[width] duration-150 ease-out"
        style={{ width: `${p}%` }}
      />
    </div>
  );
}

function StatBlock({ target, suffix, label, sub }: { target: number; suffix?: string; label: string; sub: string }) {
  const { ref, value } = useCountUp(target);
  return (
    <div className="border-l-2 border-amber/60 pl-4">
      <span ref={ref} className="font-display text-4xl font-black text-parch tabular-nums sm:text-5xl">
        {value.toLocaleString("es-ES")}
        {suffix && <span className="text-2xl text-amber">{suffix}</span>}
      </span>
      <p className="mt-1 text-[11px] font-semibold tracking-[0.22em] text-sage uppercase">{label}</p>
      <p className="text-xs text-bone/55">{sub}</p>
    </div>
  );
}

function SpecimenCard({
  s,
  collected,
  onOpen,
  onCollect,
}: {
  s: Insect;
  collected: boolean;
  onOpen: () => void;
  onCollect: () => void;
}) {
  const st = STATUS_META[s.status];
  return (
    <article
      className={`group relative h-full cursor-pointer border bg-pine/90 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_50px_rgba(0,0,0,0.55)] ${
        collected ? "border-amber/50" : "border-moss hover:border-amber/60"
      }`}
      style={{ "--acc": s.accent } as React.CSSProperties}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      aria-label={`Abrir ficha de ${s.name}`}
    >
      {collected && <PinMark className="absolute top-3 right-3 z-10 h-6 w-6 text-amber drop-shadow" />}

      <div className="bg-pingrid relative flex aspect-[7/5] items-center justify-center overflow-hidden border-b border-moss/70 bg-fern/40">
        <span className="absolute top-2 left-2 font-display text-[11px] tracking-[0.2em] text-bone/35 uppercase">
          {s.order.slice(0, 5)}.
        </span>
        <OrderGlyph
          k={s.orderKey}
          className="h-24 w-24 text-bone/80 transition-all duration-300 group-hover:scale-110 group-hover:text-[color:var(--acc)]"
        />
        <span className="absolute right-2 bottom-2 h-2 w-2 rounded-full" style={{ background: s.accent }} />
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold tracking-[0.2em] text-sage uppercase">
            {s.order}
          </span>
          <span
            className={`border px-1.5 py-0.5 text-[9px] tracking-[0.16em] uppercase ${
              st.color === "sage"
                ? "border-sage/50 text-sage"
                : st.color === "amber"
                  ? "border-amber/60 text-amber"
                  : "border-rust/60 text-rust"
            }`}
          >
            {s.status}
          </span>
        </div>
        <h3 className="mt-1.5 font-display text-xl leading-tight font-bold text-parch">
          {s.name}
        </h3>
        <p className="font-display text-sm text-[color:var(--acc)] italic">
          {s.latin}
          <span className="ml-1.5 font-body text-[10px] text-bone/45 not-italic">{s.year}</span>
        </p>

        <div className="mt-3 flex items-center justify-between border-t border-moss/60 pt-3 text-xs text-bone/70">
          <span>{fmtMm(s.sizeMm)}{s.wingspanMm ? ` · Ø ${fmtMm(s.wingspanMm)}` : ""}</span>
          <span className="flex items-center gap-1" title={`Rareza ${s.rarity}/5`}>
            {Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: i < s.rarity ? s.accent : "rgba(163,194,147,0.2)" }}
              />
            ))}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
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
            aria-label={collected ? `Quitar ${s.name} de la caja` : `Añadir ${s.name} a la caja`}
          >
            {collected ? "En caja" : "Colectar"}
          </button>
        </div>
      </div>
    </article>
  );
}

/* ---------------- App ---------------- */

type SortKey = "name" | "size" | "rarity" | "year";

export default function App() {
  const clock = useClock();

  const [query, setQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState<string>("Todos");
  const [sortKey, setSortKey] = useState<SortKey>("name");

  const [active, setActive] = useState<Insect | null>(null);
  const [collection, setCollection] = useState<string[]>(() => loadJSON<string[]>(COL_KEY, []));
  const [sightings, setSightings] = useState<Sighting[]>(() => loadJSON<Sighting[]>(LOG_KEY, []));
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  // formulario de cuaderno
  const [fInsect, setFInsect] = useState(SPECIMENS[0].id);
  const [fPlace, setFPlace] = useState("");
  const [fDate, setFDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [fNote, setFNote] = useState("");
  const [fError, setFError] = useState("");

  useEffect(() => {
    localStorage.setItem(COL_KEY, JSON.stringify(collection));
  }, [collection]);
  useEffect(() => {
    localStorage.setItem(LOG_KEY, JSON.stringify(sightings));
  }, [sightings]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  const toggleCollect = useCallback(
    (id: string) => {
      setCollection((prev) => {
        const has = prev.includes(id);
        const next = has ? prev.filter((x) => x !== id) : [...prev, id];
        const sp = SPECIMENS.find((s) => s.id === id);
        showToast(
          has
            ? `${sp?.name ?? "Especimen"} devuelto al cajón`
            : `${sp?.name ?? "Especimen"} fijado en tu caja`
        );
        return next;
      });
    },
    [showToast]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = SPECIMENS.filter((s) => {
      const matchesOrder = orderFilter === "Todos" || s.order === orderFilter;
      const matchesQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.latin.toLowerCase().includes(q) ||
        s.order.toLowerCase().includes(q) ||
        s.family.toLowerCase().includes(q);
      return matchesOrder && matchesQuery;
    });
    list = [...list].sort((a, b) => {
      switch (sortKey) {
        case "size":
          return b.sizeMm - a.sizeMm;
        case "rarity":
          return b.rarity - a.rarity;
        case "year":
          return a.year - b.year;
        default:
          return a.name.localeCompare(b.name, "es");
      }
    });
    return list;
  }, [query, orderFilter, sortKey]);

  const featured = useMemo(() => [SPECIMENS[0], SPECIMENS[1], SPECIMENS[10]], []);

  const addSighting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fPlace.trim()) {
      setFError("Indica la localidad del avistamiento.");
      return;
    }
    setFError("");
    const entry: Sighting = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      insectId: fInsect,
      place: fPlace.trim(),
      date: fDate,
      note: fNote.trim(),
      createdAt: Date.now(),
    };
    setSightings((prev) => [entry, ...prev]);
    setFPlace("");
    setFNote("");
    showToast("Anotación registrada en el cuaderno");
  };

  const removeSighting = (id: string) => {
    setSightings((prev) => prev.filter((s) => s.id !== id));
    showToast("Anotación eliminada");
  };

  const latinNames = SPECIMENS.map((s) => s.latin);

  return (
    <div className="relative min-h-screen">
      {/* fondo ambiental */}
      <div className="bg-blueprint fixed inset-0 z-0" />
      <div
        className="fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(1100px 600px at 78% -10%, rgba(36,54,38,0.55), transparent 60%), radial-gradient(900px 700px at -10% 105%, rgba(28,40,28,0.7), transparent 55%), linear-gradient(180deg, rgba(13,19,14,0) 0%, rgba(13,19,14,0.85) 100%)",
        }}
      />
      <div className="pointer-events-none fixed inset-0 z-[1] opacity-60">
        <Fireflies count={22} />
      </div>
      <div className="noise-veil" />
      <ScrollProgress />

      <div className="relative z-10">
        {/* ---------- cabecera ---------- */}
        <header className="sticky top-0 z-50 border-b border-moss/60 bg-ink/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <a href="#inicio" className="flex items-center gap-2.5">
              <OrderGlyph k="beetle" className="h-8 w-8 text-amber" />
              <span className="font-display text-lg font-black tracking-tight text-parch">
                INSECTA
                <span className="ml-2 hidden text-[10px] font-semibold tracking-[0.26em] text-sage/80 uppercase sm:inline">
                  Guía de campo · Vol. IV
                </span>
              </span>
            </a>

            <nav className="hidden items-center gap-6 text-[12px] font-semibold tracking-[0.18em] uppercase md:flex">
              {[
                ["Colección", "#coleccion"],
                ["Cifras", "#cifras"],
                ["Cuaderno", "#cuaderno"],
              ].map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  className="text-bone/65 transition-colors hover:text-amber"
                >
                  {label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-1.5 border border-moss/70 px-2 py-1 font-mono text-[11px] text-sage tabular-nums lg:flex">
                <span className="blink-dot h-1.5 w-1.5 rounded-full bg-amber" />
                {clock} · estación de campo
              </span>
              <a
                href="#coleccion"
                className="flex items-center gap-2 border border-amber/60 bg-amber/10 px-3 py-1.5 text-[11px] font-bold tracking-[0.16em] text-amber uppercase transition-colors hover:bg-amber hover:text-ink"
              >
                <PinMark className="h-4 w-4" />
                Caja · {collection.length}
              </a>
            </div>
          </div>
        </header>

        {/* ---------- apertura: cajón de especímenes ---------- */}
        <section id="inicio" className="relative overflow-hidden">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 pt-14 pb-16 sm:px-6 lg:grid-cols-12 lg:pt-20">
            <div className="lg:col-span-7">
              <p className="line-mask text-[11px] font-bold tracking-[0.34em] text-sage uppercase">
                <span style={{ animationDelay: "0.05s" }}>
                  Lámina IV — Sistemática de los hexápodos
                </span>
              </p>

              <h1 className="mt-4 font-display font-black tracking-tight">
                <span className="line-mask text-[clamp(4.2rem,13vw,10rem)] leading-[0.86] text-parch">
                  <span style={{ animationDelay: "0.15s" }}>
                    INSECTA<span className="text-amber">.</span>
                  </span>
                </span>
                <span className="line-mask mt-2 text-[clamp(1.6rem,4vw,3rem)] leading-tight text-sage italic">
                  <span style={{ animationDelay: "0.3s" }}>el mundo en seis patas</span>
                </span>
              </h1>

              <div className="line-mask mt-6 max-w-xl">
                <p className="text-[15px] leading-relaxed text-bone/80" style={{ animationDelay: "0.45s" }}>
                  Un gabinete entomológico vivo: catorce especímenes montados, fichas con
                  taxonomía completa, rareza y ecología. Explora la lámina, amplía tu caja de
                  colección y anota tus avistamientos en el cuaderno de campo.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#coleccion"
                  className="group flex items-center gap-3 border border-amber bg-amber px-6 py-3 text-sm font-bold tracking-[0.18em] text-ink uppercase transition-all hover:bg-honey hover:shadow-[0_10px_36px_rgba(229,168,59,0.25)]"
                >
                  Explorar la lámina
                  <svg viewBox="0 0 16 16" className="h-4 w-4 transition-transform group-hover:translate-x-1" stroke="currentColor" fill="none" strokeWidth="1.8">
                    <path d="M2 8h11M9 3.5 13.5 8 9 12.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <a
                  href="#cuaderno"
                  className="border border-moss px-6 py-3 text-sm font-bold tracking-[0.18em] text-sage uppercase transition-colors hover:border-sage hover:text-parch"
                >
                  Cuaderno de campo
                </a>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-2 text-xs text-bone/55">
                <span><strong className="text-amber">1,05 M</strong> especies descritas</span>
                <span><strong className="text-amber">~80 %</strong> de los animales conocidos</span>
                <span><strong className="text-amber">8</strong> órdenes en esta lámina</span>
              </div>
            </div>

            {/* vitrina inclinada */}
            <div className="relative hidden lg:col-span-5 lg:block">
              <svg
                viewBox="0 0 200 200"
                className="absolute top-1/2 left-1/2 h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 text-moss/50"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.6"
                strokeDasharray="3 5"
              >
                <circle cx="100" cy="100" r="96" />
                <circle cx="100" cy="100" r="70" />
                {Array.from({ length: 12 }, (_, i) => {
                  const a = (i * Math.PI) / 6;
                  return (
                    <line
                      key={i}
                      x1={100 + Math.cos(a) * 88}
                      y1={100 + Math.sin(a) * 88}
                      x2={100 + Math.cos(a) * 96}
                      y2={100 + Math.sin(a) * 96}
                    />
                  );
                })}
              </svg>

              <div className="relative h-[440px]">
                {featured.map((s, i) => {
                  const layout = [
                    { cls: "top-0 right-6 w-56", tilt: "-4deg" },
                    { cls: "top-36 left-0 w-60", tilt: "3deg" },
                    { cls: "bottom-0 right-0 w-52", tilt: "-2deg" },
                  ][i];
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActive(s)}
                      className={`float-slow pin absolute border border-moss bg-pine/95 p-4 text-left shadow-[0_22px_50px_rgba(0,0,0,0.5)] transition-colors hover:border-amber/70 ${layout.cls}`}
                      style={{ "--tilt": layout.tilt, animationDelay: `${i * 0.9}s` } as React.CSSProperties}
                    >
                      <div className="flex items-center gap-3">
                        <span className="bg-pingrid flex h-16 w-16 shrink-0 items-center justify-center border border-moss/70 bg-fern/50">
                          <OrderGlyph k={s.orderKey} className="h-11 w-11" />
                        </span>
                        <span>
                          <span className="block font-display text-base leading-tight font-bold text-parch">
                            {s.name}
                          </span>
                          <span className="font-display text-sm italic" style={{ color: s.accent }}>
                            {s.latin}
                          </span>
                          <span className="mt-0.5 block text-[10px] tracking-[0.18em] text-sage/80 uppercase">
                            {s.order} · {fmtMm(s.sizeMm)}
                          </span>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* marquesina de nomenclatura */}
          <div className="border-y border-moss/60 bg-pine/70 py-3 backdrop-blur-sm">
            <div className="marquee-track flex w-max items-center gap-8 pr-8">
              {[...latinNames, ...latinNames].map((n, i) => (
                <span
                  key={`${n}-${i}`}
                  aria-hidden={i >= latinNames.length}
                  className="flex items-center gap-8 font-display text-lg whitespace-nowrap text-bone/70 italic"
                >
                  {n}
                  <svg viewBox="0 0 12 12" className="h-3 w-3 text-amber" fill="currentColor">
                    <path d="M6 0l1.4 4.6L12 6 7.4 7.4 6 12 4.6 7.4 0 6l4.6-1.4z" />
                  </svg>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- cifras ---------- */}
        <section id="cifras" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <Reveal>
            <div className="grid gap-8 border-y border-moss/60 py-8 sm:grid-cols-2 lg:grid-cols-4">
              <StatBlock target={ORDERS.length} label="Órdenes representados" sub="De los ~30 descritos" />
              <StatBlock target={SPECIMENS.length} label="Especímenes en lámina" sub="Montados y etiquetados" />
              <StatBlock target={170} suffix=" mm" label="Longitud récord" sub="Dynastes hercules" />
              <StatBlock target={1050000} label="Especies descritas" sub="La clase más diversa del reino animal" />
            </div>
          </Reveal>
        </section>

        {/* ---------- colección ---------- */}
        <section id="coleccion" className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold tracking-[0.3em] text-sage uppercase">
                Gabinete principal
              </p>
              <h2 className="mt-1 font-display text-4xl font-black text-parch sm:text-5xl">
                La colección<span className="text-amber">.</span>
              </h2>
            </div>
            <p className="max-w-sm text-sm text-bone/60">
              Filtra por orden, busca por nombre vulgar o científico y fija tus especímenes
              favoritos en la caja. Todo queda guardado en este navegador.
            </p>
          </Reveal>

          {/* barra de herramientas */}
          <Reveal delay={80} className="label-frame mb-8 bg-pine/70 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="relative min-w-56 flex-1 sm:max-w-xs">
                <svg viewBox="0 0 16 16" className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-sage" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="7" cy="7" r="4.5" />
                  <path d="M10.5 10.5 14 14" strokeLinecap="round" />
                </svg>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar especie, familia, orden…"
                  className="w-full border border-moss bg-ink/80 py-2.5 pr-3 pl-9 text-sm text-bone placeholder:text-bone/35 focus:border-amber"
                  aria-label="Buscar especímenes"
                />
              </label>

              <div className="flex flex-wrap gap-1.5">
                {["Todos", ...ORDERS].map((o) => {
                  const activeChip = orderFilter === o;
                  const count = o === "Todos" ? SPECIMENS.length : ORDER_COUNTS.find((c) => c.order === o)?.count;
                  return (
                    <button
                      key={o}
                      onClick={() => setOrderFilter(o)}
                      className={`border px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em] uppercase transition-all ${
                        activeChip
                          ? "border-amber bg-amber text-ink"
                          : "border-moss text-sage hover:border-amber/50 hover:text-amber"
                      }`}
                    >
                      {o} <span className={activeChip ? "opacity-70" : "opacity-50"}>{count}</span>
                    </button>
                  );
                })}
              </div>

              <label className="ml-auto flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-sage uppercase">
                Ordenar
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="border border-moss bg-ink/80 px-2 py-2 text-xs text-bone normal-case focus:border-amber"
                >
                  <option value="name">Nombre A–Z</option>
                  <option value="size">Tamaño (mayor)</option>
                  <option value="rarity">Rareza</option>
                  <option value="year">Año de descripción</option>
                </select>
              </label>
            </div>
          </Reveal>

          {filtered.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((s, i) => (
                <Reveal key={s.id} delay={(i % 4) * 60} as="div" className="h-full">
                  <SpecimenCard
                    s={s}
                    collected={collection.includes(s.id)}
                    onOpen={() => setActive(s)}
                    onCollect={() => toggleCollect(s.id)}
                  />
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal className="label-frame flex flex-col items-center gap-4 bg-pine/60 px-6 py-16 text-center">
              <OrderGlyph k="leaf" className="h-16 w-16 text-moss" />
              <p className="font-display text-2xl text-parch italic">
                Ningún especimen bajo esta lupa…
              </p>
              <p className="max-w-sm text-sm text-bone/60">
                Ajusta la búsqueda o limpia los filtros: la lámina completa aguarda en el cajón.
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setOrderFilter("Todos");
                }}
                className="border border-amber/70 px-5 py-2 text-xs font-bold tracking-[0.2em] text-amber uppercase transition-colors hover:bg-amber hover:text-ink"
              >
                Limpiar filtros
              </button>
            </Reveal>
          )}
        </section>

        {/* ---------- cuaderno de campo ---------- */}
        <section id="cuaderno" className="relative mt-10 border-t border-moss/60 bg-pine/50">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-5">
            <Reveal className="lg:col-span-2">
              <p className="text-[11px] font-bold tracking-[0.3em] text-sage uppercase">
                Diario del naturalista
              </p>
              <h2 className="mt-1 font-display text-4xl font-black text-parch sm:text-5xl">
                Cuaderno de campo<span className="text-amber">.</span>
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-bone/70">
                Cada avistamiento cuenta: especie, localidad, fecha y una nota de comportamiento.
                Las anotaciones se guardan en tu navegador, como un diario de expedición que
                nadie más puede abrir.
              </p>

              <form onSubmit={addSighting} className="label-frame mt-7 space-y-4 bg-ink/60 p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-[10px] font-bold tracking-[0.2em] text-sage uppercase">
                      Especie
                    </span>
                    <select
                      value={fInsect}
                      onChange={(e) => setFInsect(e.target.value)}
                      className="w-full border border-moss bg-pine px-3 py-2.5 text-sm text-bone focus:border-amber"
                    >
                      {SPECIMENS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} — {s.latin}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[10px] font-bold tracking-[0.2em] text-sage uppercase">
                      Fecha
                    </span>
                    <input
                      type="date"
                      value={fDate}
                      onChange={(e) => setFDate(e.target.value)}
                      className="w-full border border-moss bg-pine px-3 py-2.5 text-sm text-bone focus:border-amber"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-bold tracking-[0.2em] text-sage uppercase">
                    Localidad *
                  </span>
                  <input
                    value={fPlace}
                    onChange={(e) => {
                      setFPlace(e.target.value);
                      if (fError) setFError("");
                    }}
                    placeholder="p. ej. Robledal de Sierra Morena, km 4"
                    className={`w-full border bg-pine px-3 py-2.5 text-sm text-bone placeholder:text-bone/35 focus:border-amber ${
                      fError ? "border-rust" : "border-moss"
                    }`}
                  />
                  {fError && <span className="mt-1 block text-xs text-rust">{fError}</span>}
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-bold tracking-[0.2em] text-sage uppercase">
                    Nota de campo
                  </span>
                  <textarea
                    value={fNote}
                    onChange={(e) => setFNote(e.target.value)}
                    rows={3}
                    placeholder="Comportamiento, clima, sustrato…"
                    className="w-full resize-none border border-moss bg-pine px-3 py-2.5 text-sm text-bone placeholder:text-bone/35 focus:border-amber"
                  />
                </label>
                <button
                  type="submit"
                  className="w-full border border-amber bg-amber py-3 text-sm font-bold tracking-[0.2em] text-ink uppercase transition-all hover:bg-honey hover:shadow-[0_8px_30px_rgba(229,168,59,0.25)]"
                >
                  Registrar avistamiento
                </button>
              </form>
            </Reveal>

            <Reveal delay={120} className="lg:col-span-3">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-xl font-bold text-parch">
                  Anotaciones{" "}
                  <span className="text-amber">({sightings.length})</span>
                </h3>
                {sightings.length > 0 && (
                  <span className="text-[11px] tracking-[0.2em] text-sage/70 uppercase">
                    Guardado local
                  </span>
                )}
              </div>

              {sightings.length === 0 ? (
                <div className="label-frame flex flex-col items-center gap-3 bg-ink/50 px-6 py-16 text-center">
                  <svg viewBox="0 0 48 48" className="h-14 w-14 text-moss" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M10 6h22a4 4 0 0 1 4 4v32a2 2 0 0 1-2 2H12a4 4 0 0 1-4-4V8a2 2 0 0 1 2-2z" />
                    <path d="M10 6a4 4 0 0 1 4 4v30" />
                    <path d="M20 16h10M20 22h10M20 28h6" />
                  </svg>
                  <p className="font-display text-xl text-bone/70 italic">
                    El cuaderno espera su primera entrada.
                  </p>
                  <p className="max-w-xs text-xs text-bone/50">
                    Sal al prado con la lupa: cualquier encuentro de seis patas merece una línea.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {sightings.map((sg) => {
                    const sp = SPECIMENS.find((s) => s.id === sg.insectId);
                    const d = new Date(sg.date + "T00:00:00");
                    return (
                      <li
                        key={sg.id}
                        className="group flex gap-4 border border-moss/70 bg-pine/80 p-4 transition-colors hover:border-amber/50"
                      >
                        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center border border-moss/70 bg-ink/60">
                          <span className="font-display text-lg leading-none font-black text-amber">
                            {d.getDate()}
                          </span>
                          <span className="text-[9px] tracking-[0.14em] text-sage uppercase">
                            {d.toLocaleDateString("es-ES", { month: "short" }).replace(".", "")}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-base font-bold text-parch">
                            {sp ? sp.name : "Especie sin determinar"}{" "}
                            <span className="font-display text-sm font-normal italic" style={{ color: sp?.accent ?? "#a3c293" }}>
                              {sp?.latin ?? "Insecta sp."}
                            </span>
                          </p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-sage">
                            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M8 14s5-4.6 5-8.5A5 5 0 0 0 3 5.5C3 9.4 8 14 8 14z" />
                              <circle cx="8" cy="5.5" r="1.6" />
                            </svg>
                            {sg.place}
                          </p>
                          {sg.note && <p className="mt-1.5 text-sm text-bone/75 italic">«{sg.note}»</p>}
                        </div>
                        <button
                          onClick={() => removeSighting(sg.id)}
                          className="self-start border border-transparent p-1.5 text-bone/35 transition-colors hover:border-rust/60 hover:text-rust"
                          aria-label="Eliminar anotación"
                        >
                          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M3 4h10M6.5 4V2.5h3V4M5 4l.6 9h4.8L11 4M7 6.5v4M9 6.5v4" strokeLinecap="round" />
                          </svg>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Reveal>
          </div>
        </section>

        {/* ---------- pie ---------- */}
        <footer className="relative overflow-hidden border-t border-moss/60 bg-ink">
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
                Lámina digital de entomología: especímenes, taxonomía y cuaderno de campo en un
                solo cajón. Compilada a partir del repositorio{" "}
                <span className="text-amber">SysJoL/insecta-app-web</span>.
              </p>
            </div>
            <div>
              <p className="mb-3 text-[11px] font-bold tracking-[0.26em] text-sage uppercase">
                Órdenes en lámina
              </p>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                {ORDER_COUNTS.map((o) => (
                  <li key={o.order} className="flex justify-between border-b border-moss/40 pb-1 text-bone/75">
                    {o.order}
                    <span className="text-amber">{o.count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-3 text-[11px] font-bold tracking-[0.26em] text-sage uppercase">
                Estado de conservación
              </p>
              <ul className="space-y-1.5 text-sm text-bone/75">
                {Object.entries(STATUS_META).map(([code, m]) => (
                  <li key={code} className="flex items-center gap-2.5">
                    <span className={`border px-1.5 py-0.5 text-[10px] tracking-widest ${
                      m.color === "sage" ? "border-sage/50 text-sage" : m.color === "amber" ? "border-amber/60 text-amber" : "border-rust/60 text-rust"
                    }`}>
                      {code}
                    </span>
                    {m.label}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs text-bone/45">
                React · Vite · Tailwind — datos de campo con fines divulgativos.
              </p>
            </div>
          </div>
          <div className="relative border-t border-moss/50 py-4 text-center text-[11px] tracking-[0.24em] text-bone/40 uppercase">
            Vol. IV · Hecho con lupa y paciencia
          </div>
        </footer>
      </div>

      {/* ---------- modal ---------- */}
      <SpecimenModal
        specimen={active}
        collected={active ? collection.includes(active.id) : false}
        onClose={() => setActive(null)}
        onToggleCollect={toggleCollect}
      />

      {/* ---------- toast ---------- */}
      {toast && (
        <div className="toast-in fixed right-5 bottom-5 z-[90] flex items-center gap-3 border border-amber/70 bg-pine px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.6)]">
          <span className="blink-dot h-2 w-2 rounded-full bg-amber" />
          <p className="text-sm text-bone">{toast}</p>
        </div>
      )}
    </div>
  );
}
