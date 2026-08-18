import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { SPECIMENS } from "./data/insects";
import {
  fetchOrders,
  fetchTopSpecies,
  fmtCompact,
  searchSpecies,
  type CardTaxon,
  type OrderInfo,
  type PhotoFilter,
} from "./lib/inat";
import { OrderGlyph, PinMark } from "./components/glyphs";
import { Reveal } from "./components/Reveal";
import Fireflies from "./components/Fireflies";
import TaxonCard from "./components/TaxonCard";
import TaxonModal from "./components/TaxonModal";
import DichotomousKey from "./components/DichotomousKey";
import Observatory from "./components/Observatory";
import SpeciesCompare from "./components/SpeciesCompare";
import TaxonomyTree from "./components/TaxonomyTree";
import AnatomyDiagram from "./components/AnatomyDiagram";
import ScaleTool from "./components/ScaleTool";
import ExportPanel from "./components/ExportPanel";
import Header from "./components/Header";
import MobileDrawer from "./components/MobileDrawer";
import Footer from "./components/Footer";
import ScrollProgress from "./components/ScrollProgress";
import StatBlock from "./components/StatBlock";
import FilterSheet from "./components/FilterSheet";
import Quiz from "./components/Quiz";
import Museum from "./components/Museum";
import { loadProfile, saveProfile, type PlayerProfile, DEFAULT_PROFILE } from "./lib/quizEngine";
import { SlidersHorizontal } from "lucide-react";

/* ---------------- persistencia ---------------- */

const COL_KEY = "insecta:caja:v2";
const LOG_KEY = "insecta:cuaderno:v2";
const WISH_KEY = "insecta:wishlist:v1";
const QUIZ_KEY = "insecta:quiz-stats:v1";

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

interface SavedSpecimen {
  id: string;
  latin: string;
  common: string | null;
  orderName: string;
  photoUrl: string | null;
}

interface Sighting {
  id: string;
  species: string;
  place: string;
  date: string;
  note: string;
  createdAt: number;
}

/** Cajón curado local: respaldo académico sin conexión. */
const CURATED_CARDS: CardTaxon[] = SPECIMENS.map((s) => ({
  id: `local:${s.id}`,
  latin: s.latin,
  common: s.name,
  orderName: s.order,
  rank: "species",
  observations: 0,
  photoUrl: null,
  curated: true,
  glyphKey: s.orderKey,
}));

const LAB_TABS = [
  { id: "obs", n: "01", label: "Observatorio en vivo" },
  { id: "cmp", n: "02", label: "Comparador" },
  { id: "tree", n: "03", label: "Árbol taxonómico" },
] as const;

type LabTool = (typeof LAB_TABS)[number]["id"];

/* ---------------- piezas pequeñas ---------------- */

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden border border-moss bg-pine/90">
      <div className="shimmer aspect-[5/4] border-b border-moss/70" />
      <div className="space-y-2.5 p-4">
        <div className="shimmer h-3 w-1/3" />
        <div className="shimmer h-5 w-4/5" />
        <div className="shimmer h-3.5 w-1/2" />
        <div className="shimmer mt-4 h-7 w-full" />
      </div>
    </div>
  );
}

/* ---------------- App ---------------- */

type SortKey = "obs" | "name";
type ApiStatus = "boot" | "online" | "offline";

export default function App() {
  const clock = useClock();

  const [orders, setOrders] = useState<OrderInfo[]>([]);
  const orderMapRef = useRef<Map<number, string>>(new Map());

  const [cards, setCards] = useState<CardTaxon[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<ApiStatus>("boot");
  const [localMode, setLocalMode] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);

  const [activeOrder, setActiveOrder] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("obs");
  const [photoFilter, setPhotoFilter] = useState<PhotoFilter>("with");

  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const [active, setActive] = useState<CardTaxon | null>(null);
  const [collection, setCollection] = useState<Record<string, SavedSpecimen>>(() =>
    loadJSON<Record<string, SavedSpecimen>>(COL_KEY, {})
  );
  const [wishList, setWishList] = useState<Record<string, SavedSpecimen>>(() =>
    loadJSON<Record<string, SavedSpecimen>>(WISH_KEY, {})
  );
  const [sightings, setSightings] = useState<Sighting[]>(() => loadJSON<Sighting[]>(LOG_KEY, []));
  const [quizProfile, setQuizProfile] = useState<PlayerProfile>(() => loadProfile());
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  // cuaderno
  const [fSpecies, setFSpecies] = useState("");
  const [fPlace, setFPlace] = useState("");
  const [fDate, setFDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [fNote, setFNote] = useState("");
  const [fError, setFError] = useState("");

  useEffect(() => localStorage.setItem(COL_KEY, JSON.stringify(collection)), [collection]);
  useEffect(() => localStorage.setItem(WISH_KEY, JSON.stringify(wishList)), [wishList]);
  useEffect(() => localStorage.setItem(LOG_KEY, JSON.stringify(sightings)), [sightings]);
  useEffect(() => saveProfile(quizProfile), [quizProfile]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  // Listen for mastery events from QuizGame
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const sp = SPECIMENS.find((s) => s.id === detail?.specimenId);
      if (sp) {
        showToast(`¡${sp.latin} dominado! Ahora puedes exhibirlo en tu museo 🏛️`);
      }
    };
    window.addEventListener("insecta:mastery", handler);
    return () => window.removeEventListener("insecta:mastery", handler);
  }, [showToast]);

  /* ---------- carga de datos en vivo ---------- */

  const reqId = useRef(0);

  const photoFilterRef = useRef<PhotoFilter>("with");
  const sortKeyRef = useRef<SortKey>("obs");

  const refresh = useCallback(
    async (orderId: number | null, q: string) => {
      const my = ++reqId.current;
      setLoading(true);
      setLocalMode(false);
      try {
        const data = q.trim()
          ? await searchSpecies(q, orderMapRef.current, photoFilterRef.current)
          : await fetchTopSpecies(orderMapRef.current, orderId, photoFilterRef.current);
        if (my !== reqId.current) return;
        setCards(data);
        setApiStatus("online");
        setLastUpdate(Date.now());
      } catch {
        if (my !== reqId.current) return;
        setApiStatus("offline");
        setCards([]);
      } finally {
        if (my === reqId.current) setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const os = await fetchOrders();
        if (!alive) return;
        const map = new Map(os.map((o) => [o.id, o.name]));
        orderMapRef.current = map;
        setOrders(os);
      } catch {
        /* seguimos sin chips de órdenes; la carga principal puede funcionar igual */
      }
      if (alive) refresh(null, "");
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // búsqueda con pausa tipográfica
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (query.trim()) refresh(activeOrder, query);
      else if (!loading && apiStatus !== "boot") refresh(activeOrder, "");
    }, 480);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleOrder = (id: number | null) => {
    setActiveOrder(id);
    setQuery("");
    refresh(id, "");
  };

  const handlePhotoFilter = (f: PhotoFilter) => {
    setPhotoFilter(f);
    photoFilterRef.current = f;
    refresh(activeOrder, query);
  };

  const handleLocalMode = () => {
    reqId.current++;
    setLoading(false);
    setLocalMode(true);
    setApiStatus("offline");
    setCards(CURATED_CARDS);
    showToast("Cajón local abierto: 14 especímenes curados");
  };

  /* ---------- colección ---------- */

  const toggleCollect = useCallback(
    (t: CardTaxon) => {
      setCollection((prev) => {
        const has = prev[t.id];
        const next = { ...prev };
        if (has) delete next[t.id];
        else
          next[t.id] = {
            id: t.id,
            latin: t.latin,
            common: t.common,
            orderName: t.orderName,
            photoUrl: t.photoUrl,
          };
        showToast(has ? `${t.latin} devuelto al cajón` : `${t.latin} fijado en tu caja`);
        return next;
      });
    },
    [showToast]
  );

  const toggleWish = useCallback(
    (t: CardTaxon) => {
      setWishList((prev) => {
        const has = prev[t.id];
        const next = { ...prev };
        if (has) delete next[t.id];
        else
          next[t.id] = {
            id: t.id,
            latin: t.latin,
            common: t.common,
            orderName: t.orderName,
            photoUrl: t.photoUrl,
          };
        showToast(has ? `${t.latin} eliminada de tu lista` : `${t.latin} añadida a tu lista de deseos`);
        return next;
      });
    },
    [showToast]
  );

  /* ---------- derivados ---------- */

  const sortedCards = useMemo(() => {
    const list = [...cards];
    if (sortKey === "name") list.sort((a, b) => a.latin.localeCompare(b.latin, "es"));
    else list.sort((a, b) => b.observations - a.observations);
    return list;
  }, [cards, sortKey]);

  const totalObs = useMemo(() => cards.reduce((acc, c) => acc + c.observations, 0), [cards]);
  const heroAll = useMemo(() => cards.filter((c) => c.photoUrl), [cards]);
  const marqueeNames = useMemo(
    () => (cards.length ? cards.map((c) => c.latin).slice(0, 16) : CURATED_CARDS.map((c) => c.latin)),
    [cards]
  );
  const collectionList = useMemo(() => Object.values(collection), [collection]);
  const wishListArr = useMemo(() => Object.values(wishList), [wishList]);
  const suggestionNames = useMemo(() => {
    const set = new Set<string>();
    cards.forEach((c) => set.add(c.latin));
    CURATED_CARDS.forEach((c) => set.add(c.latin));
    return [...set];
  }, [cards]);

  /* ---------- cuaderno ---------- */

  const addSighting = (e: FormEvent) => {
    e.preventDefault();
    if (!fPlace.trim()) {
      setFError("Indica la localidad del avistamiento.");
      return;
    }
    if (!fSpecies.trim()) {
      setFError("Indica la especie observada (puedes elegir de la lista).");
      return;
    }
    setFError("");
    const entry: Sighting = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      species: fSpecies.trim(),
      place: fPlace.trim(),
      date: fDate,
      note: fNote.trim(),
      createdAt: Date.now(),
    };
    setSightings((prev) => [entry, ...prev]);
    setFPlace("");
    setFNote("");
    setFSpecies("");
    showToast("Anotación registrada en el cuaderno");
  };

  const removeSighting = (id: string) => {
    setSightings((prev) => prev.filter((s) => s.id !== id));
    showToast("Anotación eliminada");
  };

  /* ---------- mesa de ciencia en vivo ---------- */
  const [labTool, setLabTool] = useState<LabTool>("obs");

  /* ---------- drawer ---------- */
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* ---------- hero rotation ---------- */
  const [heroIdx, setHeroIdx] = useState(0);
  useEffect(() => {
    if (heroAll.length <= 3) return;
    const t = window.setInterval(() => {
      setHeroIdx((prev) => (prev + 1) % heroAll.length);
    }, 4500);
    return () => window.clearInterval(t);
  }, [heroAll.length]);
  const heroCards = useMemo(() => {
    if (heroAll.length === 0) return [];
    if (heroAll.length <= 3) return heroAll;
    return Array.from({ length: 3 }, (_, i) => heroAll[(heroIdx + i) % heroAll.length]);
  }, [heroAll, heroIdx]);

  /* ---------- PWA · instalación ---------- */
  const [canInstall, setCanInstall] = useState(false);
  const installEvt = useRef<(Event & { prompt: () => Promise<unknown> }) | null>(null);
  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      installEvt.current = e as Event & { prompt: () => Promise<unknown> };
      setCanInstall(true);
    };
    const onInstalled = () => setCanInstall(false);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);
  const handleInstall = async () => {
    const evt = installEvt.current;
    if (!evt) return;
    await evt.prompt();
    setCanInstall(false);
  };
  const handleInstallFallback = () => {
    showToast("La app se puede instalar desde el menú del navegador cuando el dispositivo lo permita");
  };

  /* ---------- estado de red · modo campo ---------- */
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => {
      setOnline(false);
      setLocalMode(true);
      showToast("Sin conexión: modo campo activado (cajón local)");
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [showToast]);

  /* ---------- clave dicotómica → atlas ---------- */
  const handlePickOrder = (order: string) => {
    const match = orders.find((o) => o.name.toLowerCase() === order.toLowerCase());
    if (match) {
      setActiveOrder(match.id);
      refresh(match.id, "");
    } else {
      setActiveOrder(null);
      refresh(null, order);
    }
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("atlas")?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
    showToast(`Atlas filtrado por ${order}`);
  };

  const statusMeta =
    apiStatus === "online"
      ? { label: localMode ? "Cajón local" : "API iNaturalist · en línea", cls: "bg-limey" }
      : apiStatus === "boot"
        ? { label: "Conectando con iNaturalist…", cls: "bg-amber" }
        : { label: localMode ? "Cajón local" : "API sin conexión", cls: "bg-rust" };

  return (
    <div className="relative min-h-screen print:hidden">
      {/* fondo ambiental */}
      <div className="bg-blueprint fixed inset-0 z-0" />
      <div
        className="fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(1100px 600px at 78% -10%, rgba(36,54,38,0.55), transparent 60%), radial-gradient(900px 700px at -10% 105%, rgba(28,40,28,0.7), transparent 55%)",
        }}
      />
      <div className="pointer-events-none fixed inset-0 z-[1] opacity-60">
        <Fireflies count={22} />
      </div>
      <div className="noise-veil" />
      <ScrollProgress />

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        online={online}
        canInstall={canInstall}
        onInstall={handleInstall}
        onInstallFallback={handleInstallFallback}
        collectionCount={collectionList.length}
        wishCount={wishListArr.length}
      />

      <div className="relative z-10">
        {/* ---------- cabecera ---------- */}
        <Header
          online={online}
          canInstall={canInstall}
          onInstall={handleInstall}
          onInstallFallback={handleInstallFallback}
          collectionCount={collectionList.length}
          wishCount={wishListArr.length}
          onMenuToggle={() => setDrawerOpen(true)}
        />

        {/* ---------- apertura ---------- */}
        <section id="inicio" className="relative overflow-hidden">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 pt-10 pb-10 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:pt-20 lg:pb-16">
            <div className="min-w-0 lg:col-span-7 lg:relative lg:z-10">
              <p className="line-mask text-[11px] font-bold tracking-[0.34em] text-sage uppercase">
                <span style={{ animationDelay: "0.05s" }}>
                  Ciencia abierta · datos en vivo de iNaturalist
                </span>
              </p>

              <h1 className="mt-4 font-display font-black tracking-tight">
                <span className="line-mask block text-[clamp(2.4rem,9vw,7.5rem)] leading-[0.88] text-parch">
                  <span style={{ animationDelay: "0.15s" }}>
                    ATLAS<span className="text-amber">.</span>
                  </span>
                </span>
                <span className="line-mask block text-[clamp(2rem,6vw,5rem)] leading-[0.88] text-parch">
                  <span style={{ animationDelay: "0.27s" }}>
                    ENTOMOLÓGICO
                  </span>
                </span>
                <span className="line-mask mt-2 block text-[clamp(1.1rem,3.2vw,2.4rem)] leading-tight text-sage italic">
                  <span style={{ animationDelay: "0.4s" }}>taxonomía viva, fotos de campo verificadas</span>
                </span>
              </h1>

              <div className="line-mask mt-4 max-w-xl">
                <p className="text-[15px] leading-relaxed text-bone/80">
                  Las especies más observadas del planeta, orden por orden, cargadas en directo
                  desde la API de iNaturalist: linaje taxonómico completo, notas de Wikipedia,
                  enlaces a GBIF y EOL, y fotografías de naturalistas con su licencia. Fija tus
                  especímenes en la caja y anota avistamientos en el cuaderno.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <a
                  href="#atlas"
                  className="group flex items-center justify-center gap-2  border border-amber bg-amber px-4 py-3 text-xs font-bold tracking-[0.14em] text-ink uppercase transition-all hover:bg-honey hover:shadow-[0_10px_36px_rgba(229,168,59,0.25)] sm:text-sm"
                >
                  Explorar el atlas
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 sm:h-4 sm:w-4" stroke="currentColor" fill="none" strokeWidth="1.8">
                    <path d="M2 8h11M9 3.5 13.5 8 9 12.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <a
                  href="#cuaderno"
                  className="flex items-center justify-center  border border-moss px-4 py-3 text-xs font-bold tracking-[0.14em] text-sage uppercase transition-colors hover:border-sage hover:text-parch sm:text-sm"
                >
                  Cuaderno de campo
                </a>
              </div>

            </div>

            {/* especímenes destacados en vivo */}
            <div className="relative lg:col-span-5">
              {/* mobile: grid 2 cols */}
              <div className="grid grid-cols-2 gap-2 lg:hidden">
                {(loading && heroCards.length === 0 ? [0, 1, 2] : heroCards.slice(0, 3)).map((item, i) => {
                  if (loading && heroCards.length === 0) {
                    return (
                      <div
                        key={i}
                        className={`overflow-hidden border border-moss bg-pine/95 shadow-[0_8px_24px_rgba(0,0,0,0.4)] ${
                          i === 2 ? "col-span-2" : ""
                        }`}
                      >
                        <div className={`shimmer ${i === 2 ? "aspect-[2/1]" : "aspect-square"}`} />
                        <div className="space-y-1.5 p-2.5">
                          <div className="shimmer h-3 w-3/4" />
                          <div className="shimmer h-2.5 w-1/2" />
                        </div>
                      </div>
                    );
                  }
                  const s = item as typeof heroCards[number];
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActive(s)}
                      className={`group overflow-hidden border border-moss bg-pine/95 text-left shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-colors hover:border-amber/70 ${
                        i === 2 ? "col-span-2" : ""
                      }`}
                    >
                      <div className={`relative overflow-hidden ${i === 2 ? "aspect-[2/1]" : "aspect-square"}`}>
                        <img
                          src={s.photoUrl!}
                          alt={s.latin}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent" />
                        <span className="absolute top-1.5 left-1.5 border border-bone/25 bg-ink/70 px-1 py-0.5 text-[7px] font-semibold tracking-[0.14em] text-bone uppercase">
                          {s.orderName}
                        </span>
                      </div>
                      <div className="p-2.5">
                        <span className="block font-display text-xs leading-tight font-bold text-parch italic">
                          {s.latin}
                        </span>
                        <span className="mt-0.5 block text-[8px] tracking-[0.14em] text-sage uppercase">
                          {fmtCompact(s.observations)} obs.
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* desktop: floating cards */}
              <div className="relative hidden lg:block">
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

                <div className="relative h-[460px]">
                  {loading && heroCards.length === 0
                    ? [0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className={`pin absolute overflow-hidden border border-moss bg-pine/95 shadow-[0_22px_50px_rgba(0,0,0,0.5)] ${
                            ["top-0 right-6 w-56", "top-40 left-0 w-60", "bottom-0 right-0 w-52"][i]
                          }`}
                        >
                          <div className="shimmer aspect-[4/3]" />
                          <div className="space-y-2 p-3">
                            <div className="shimmer h-3.5 w-3/4" />
                            <div className="shimmer h-3 w-1/2" />
                          </div>
                        </div>
                      ))
                    : heroCards.map((s, i) => {
                        const layout = [
                          { cls: "top-0 right-6 w-56", tilt: "-4deg" },
                          { cls: "top-40 left-0 w-60", tilt: "3deg" },
                          { cls: "bottom-0 right-0 w-52", tilt: "-2deg" },
                        ][i] ?? { cls: "top-0 left-0 w-52", tilt: "0deg" };
                        return (
                          <button
                            key={s.id}
                            onClick={() => setActive(s)}
                            className={`float-slow pin group absolute overflow-hidden border border-moss bg-pine/95 text-left shadow-[0_22px_50px_rgba(0,0,0,0.5)] transition-colors hover:border-amber/70 ${layout.cls}`}
                            style={{ "--tilt": layout.tilt, animationDelay: `${i * 0.9}s` } as CSSProperties}
                          >
                            <div className="relative aspect-[4/3] overflow-hidden">
                              <img
                                src={s.photoUrl!}
                                alt={s.latin}
                                loading="lazy"
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 to-transparent" />
                              <span className="absolute top-2 left-2 border border-bone/25 bg-ink/70 px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.16em] text-bone uppercase">
                                {s.orderName}
                              </span>
                            </div>
                            <div className="p-3">
                              <span className="block font-display text-base leading-tight font-bold text-parch italic">
                                {s.latin}
                              </span>
                              <span className="mt-0.5 block text-[10px] tracking-[0.16em] text-sage uppercase">
                                {fmtCompact(s.observations)} observaciones
                              </span>
                            </div>
                          </button>
                        );
                      })}
                </div>
              </div>
            </div>
          </div>

          {/* stats a ancho completo */}
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 pb-10 sm:grid-cols-3 sm:gap-10 sm:px-6 lg:pb-16">
            <StatBlock target={cards.length} label="Especies en pantalla" sub={loading ? "cargando…" : "de la última consulta"} />
            <StatBlock target={totalObs} label="Observaciones sumadas" sub="registros verificados" />
            <StatBlock target={orders.length || 0} label="Órdenes de Insecta" sub="índice taxonómico" />
          </div>

          {/* marquesina de nomenclatura (en vivo) */}
          <div className="overflow-hidden border-y border-moss/60 bg-pine/70 py-3 backdrop-blur-sm">
            <div className="marquee-track flex w-max items-center gap-8 pr-8">
              {[...marqueeNames, ...marqueeNames].map((n, i) => (
                <span
                  key={`${n}-${i}`}
                  aria-hidden={i >= marqueeNames.length}
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

        {/* ---------- atlas ---------- */}
        <section id="atlas" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold tracking-[0.3em] text-sage uppercase">
                Sistemática en directo
              </p>
              <h2 className="mt-1 font-display text-4xl font-black text-parch sm:text-5xl">
                El atlas<span className="text-amber">.</span>
              </h2>
            </div>
            <p className="max-w-sm text-sm text-bone/60">
              Especies con más observaciones verificadas, filtradas por orden. Busca por nombre
              científico o vulgar; cada ficha abre la taxonomía completa.
            </p>
          </Reveal>

          {/* barra de trabajo */}
          <Reveal delay={80} className="label-frame mb-8 bg-pine/70 p-4">
            {/* mobile: search + filter button */}
            <div className="flex gap-2 sm:hidden">
              <label className="relative flex-1">
                <svg viewBox="0 0 16 16" className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-sage" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="7" cy="7" r="4.5" />
                  <path d="M10.5 10.5 14 14" strokeLinecap="round" />
                </svg>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar en la API…"
                  className="w-full border border-moss bg-ink/80 py-2.5 pr-3 pl-9 text-sm text-bone placeholder:text-bone/35 focus:border-amber"
                  aria-label="Buscar especies en iNaturalist"
                />
              </label>
              <button
                onClick={() => setFilterSheetOpen(true)}
                className="flex shrink-0 items-center gap-1.5 border border-moss bg-ink/80 px-3 text-sage transition-colors hover:border-amber/60 hover:text-amber"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="text-[10px] font-bold tracking-[0.12em] uppercase">Filtros</span>
              </button>
            </div>

            {/* desktop: full grid */}
            <div className="hidden grid-cols-[1fr_auto_1fr] items-center gap-3 sm:grid">
              <label className="relative w-full">
                <svg viewBox="0 0 16 16" className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-sage" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="7" cy="7" r="4.5" />
                  <path d="M10.5 10.5 14 14" strokeLinecap="round" />
                </svg>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar en la API:Apis, Papilio, libélula…"
                  className="w-full border border-moss bg-ink/80 py-2.5 pr-3 pl-9 text-sm text-bone placeholder:text-bone/35 focus:border-amber"
                  aria-label="Buscar especies en iNaturalist"
                />
              </label>

              {/* photo filter segmented */}
              <div className="flex border border-moss">
                {(["with", "all", "without"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => handlePhotoFilter(v)}
                    className={`px-3 py-2 text-[10px] font-semibold tracking-[0.12em] uppercase transition-all ${
                      photoFilter === v
                        ? "bg-amber text-ink"
                        : "text-sage hover:text-amber"
                    }`}
                  >
                    {v === "with" ? "Con foto" : v === "without" ? "Sin foto" : "Todas"}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 justify-end">
                <label className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-sage uppercase">
                  Ordenar
                  <select
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value as SortKey)}
                    className="border border-moss bg-ink/80 px-2 py-2.5 text-xs text-bone normal-case focus:border-amber"
                  >
                    <option value="obs">Observaciones</option>
                    <option value="name">Nombre A–Z</option>
                  </select>
                </label>

                <button
                  onClick={() => refresh(activeOrder, query)}
                  disabled={loading}
                  className="flex items-center gap-2 border border-moss px-3 py-2.5 text-[11px] font-bold tracking-[0.16em] text-sage uppercase transition-colors hover:border-amber/60 hover:text-amber disabled:opacity-50"
                >
                  <svg
                    viewBox="0 0 16 16"
                    className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 1.5v3h-3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {loading ? "Consultando…" : "Actualizar"}
                </button>

                {lastUpdate && !loading && (
                  <span className="text-[11px] text-bone/45 tabular-nums whitespace-nowrap">
                    última consulta ·{" "}
                    {new Date(lastUpdate).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                )}
              </div>
            </div>

            {/* separador */}
            <div className="mt-3 border-t border-moss/50 hidden sm:block" />

            {/* chips de órdenes — solo desktop */}
            <div className="mt-3 hidden grid-cols-4 gap-1.5 sm:grid md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-9">
              <button
                onClick={() => handleOrder(null)}
                className={`border px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em] uppercase transition-all ${
                  activeOrder === null && !query
                    ? "border-amber bg-amber text-ink"
                    : "border-moss text-sage hover:border-amber/50 hover:text-amber"
                }`}
              >
                Todos
              </button>
              {orders.map((o) => {
                const isActive = activeOrder === o.id && !query;
                return (
                  <button
                    key={o.id}
                    onClick={() => handleOrder(o.id)}
                    className={`border px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em] uppercase transition-all ${
                      isActive
                        ? "border-amber bg-amber text-ink"
                        : "border-moss text-sage hover:border-amber/50 hover:text-amber"
                    }`}
                  >
                    {o.name}
                  </button>
                );
              })}
              {orders.length === 0 && !loading && (
                <span className="px-1 py-1.5 text-[11px] text-bone/45 italic">
                  Índice de órdenes no disponible sin conexión
                </span>
              )}
            </div>
          </Reveal>

          {/* rejilla */}
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 12 }, (_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : sortedCards.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedCards.map((c, i) => (
                <Reveal key={c.id} delay={(i % 4) * 60} className="h-full">
                  <TaxonCard
                    t={c}
                    collected={Boolean(collection[c.id])}
                    wished={Boolean(wishList[c.id])}
                    onOpen={() => setActive(c)}
                    onCollect={() => toggleCollect(c)}
                    onWish={() => toggleWish(c)}
                  />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="label-frame flex flex-col items-center gap-4 bg-pine/60 px-6 py-16 text-center">
              {query ? (
                <>
                  <OrderGlyph k="leaf" className="h-16 w-16 text-moss" />
                  <p className="font-display text-2xl text-parch italic">
                    La lupa no encontró «{query}» entre los hexápodos…
                  </p>
                  <button
                    onClick={() => setQuery("")}
                    className="border border-amber/70 px-5 py-2 text-xs font-bold tracking-[0.2em] text-amber uppercase transition-colors hover:bg-amber hover:text-ink"
                  >
                    Limpiar búsqueda
                  </button>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 48 48" className="h-16 w-16 text-rust" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M8 24a16 16 0 0 1 27-11M40 24a16 16 0 0 1-27 11" />
                    <path d="M35 9v5h-5M13 39v-5h5" strokeLinejoin="round" />
                    <path d="M19 21h10M19 27h6" />
                  </svg>
                  <p className="font-display text-2xl text-parch italic">
                    La expedición perdió señal con iNaturalist.
                  </p>
                  <p className="max-w-md text-sm text-bone/60">
                    Puede ser un corte de red o un límite temporal de la API. Reintenta la
                    consulta o abre el cajón local con catorce especímenes curados.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => refresh(activeOrder, "")}
                      className="border border-amber/70 px-5 py-2 text-xs font-bold tracking-[0.2em] text-amber uppercase transition-colors hover:bg-amber hover:text-ink"
                    >
                      Reintentar consulta
                    </button>
                    <button
                      onClick={handleLocalMode}
                      className="border border-moss px-5 py-2 text-xs font-bold tracking-[0.2em] text-sage uppercase transition-colors hover:border-sage hover:text-parch"
                    >
                      Abrir cajón local
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        {/* ---------- caja de colección ---------- */}
        <section id="caja" className="relative mt-6 border-t border-moss/60 bg-pine/40">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold tracking-[0.3em] text-sage uppercase">
                  Tu gabinete personal
                </p>
                <h2 className="mt-1 font-display text-4xl font-black text-parch sm:text-5xl">
                  Caja de colección<span className="text-amber">.</span>
                </h2>
              </div>
              <p className="max-w-sm text-sm text-bone/60">
                Cada espécimen «colectado» queda fijado con su alfiler en este navegador — sin
                cuenta, sin nube, solo ciencia de bolsillo.
              </p>
            </Reveal>

            {collectionList.length === 0 ? (
              <Reveal className="label-frame flex flex-col items-center gap-3 bg-ink/50 px-6 py-14 text-center">
                <PinMark className="h-12 w-12 text-moss" />
                <p className="font-display text-xl text-bone/70 italic">
                  La caja está vacía: ningún alfiler clavado todavía.
                </p>
                <a
                  href="#atlas"
                  className="mt-2 border border-amber/70 px-5 py-2 text-xs font-bold tracking-[0.2em] text-amber uppercase transition-colors hover:bg-amber hover:text-ink"
                >
                  Ir al atlas
                </a>
              </Reveal>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {collectionList.map((sp, i) => (
                  <Reveal key={sp.id} delay={(i % 6) * 50} className="h-full">
                    <div className="pin group relative h-full border border-amber/40 bg-pine pt-2 transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
                      <div className="relative aspect-square overflow-hidden border-b border-moss/70 bg-fern/40">
                        {sp.photoUrl ? (
                          <img
                            src={sp.photoUrl}
                            alt={sp.latin}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="bg-pingrid flex h-full items-center justify-center">
                            <OrderGlyph k="beetle" className="h-14 w-14 text-bone/70" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="truncate font-display text-sm font-bold text-parch italic">{sp.latin}</p>
                        <p className="truncate text-[10px] tracking-[0.14em] text-sage uppercase">
                          {sp.orderName}
                          {sp.common ? ` · ${sp.common}` : ""}
                        </p>
                        <button
                          onClick={() => {
                            const next = { ...collection };
                            delete next[sp.id];
                            setCollection(next);
                            showToast(`${sp.latin} devuelto al cajón`);
                          }}
                          className="mt-2 w-full border border-moss py-1 text-[9px] font-bold tracking-[0.16em] text-bone/55 uppercase transition-colors hover:border-rust/70 hover:text-rust"
                        >
                          Desfijar
                        </button>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ---------- lista de deseos ---------- */}
        <section id="deseos" className="relative border-t border-moss/60 bg-pine/40">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold tracking-[0.3em] text-sage uppercase">
                  Especies que quiero ver
                </p>
                <h2 className="mt-1 font-display text-4xl font-black text-parch sm:text-5xl">
                  Lista de deseos<span className="text-amber">.</span>
                </h2>
              </div>
              <p className="max-w-sm text-sm text-bone/60">
                Marca con el corazón las especies que te gustaría encontrar en campo — tu wish list personal de entomología.
              </p>
            </Reveal>

            {wishListArr.length === 0 ? (
              <Reveal className="label-frame flex flex-col items-center gap-3 bg-ink/50 px-6 py-14 text-center">
                <svg viewBox="0 0 16 16" className="h-12 w-12 text-moss" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M8 14s-5.5-3.5-5.5-7A3.5 3.5 0 0 1 8 4a3.5 3.5 0 0 1 5.5 3c0 3.5-5.5 7-5.5 7z" />
                </svg>
                <p className="font-display text-xl text-bone/70 italic">
                  Tu lista de deseos está vacía — toca el corazón en cualquier especie.
                </p>
                <a
                  href="#atlas"
                  className="mt-2 border border-amber/70 px-5 py-2 text-xs font-bold tracking-[0.2em] text-amber uppercase transition-colors hover:bg-amber hover:text-ink"
                >
                  Ir al atlas
                </a>
              </Reveal>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {wishListArr.map((sp, i) => (
                  <Reveal key={sp.id} delay={(i % 6) * 50} className="h-full">
                    <div className="group relative h-full border border-rust/30 bg-pine transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
                      <div className="relative aspect-square overflow-hidden border-b border-moss/70 bg-fern/40">
                        {sp.photoUrl ? (
                          <img
                            src={sp.photoUrl}
                            alt={sp.latin}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="bg-pingrid flex h-full items-center justify-center">
                            <OrderGlyph k="beetle" className="h-14 w-14 text-bone/70" />
                          </div>
                        )}
                        <svg viewBox="0 0 16 16" className="absolute top-2 right-2 h-5 w-5 text-rust drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" fill="currentColor" stroke="none">
                          <path d="M8 14s-5.5-3.5-5.5-7A3.5 3.5 0 0 1 8 4a3.5 3.5 0 0 1 5.5 3c0 3.5-5.5 7-5.5 7z" />
                        </svg>
                      </div>
                      <div className="p-3">
                        <p className="truncate font-display text-sm font-bold text-parch italic">{sp.latin}</p>
                        <p className="truncate text-[10px] tracking-[0.14em] text-sage uppercase">
                          {sp.orderName}
                          {sp.common ? ` · ${sp.common}` : ""}
                        </p>
                        <button
                          onClick={() => {
                            const next = { ...wishList };
                            delete next[sp.id];
                            setWishList(next);
                            showToast(`${sp.latin} eliminada de tu lista`);
                          }}
                          className="mt-2 w-full border border-moss py-1 text-[9px] font-bold tracking-[0.16em] text-bone/55 uppercase transition-colors hover:border-rust/70 hover:text-rust"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ---------- ciencia en vivo ---------- */}
        <section id="ciencia" className="relative border-t border-moss/60 bg-pine/40">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold tracking-[0.3em] text-sage uppercase">
                  Mesa de análisis · iNaturalist + GBIF + OpenStreetMap
                </p>
                <h2 className="mt-1 font-display text-4xl font-black text-parch sm:text-5xl">
                  Ciencia en vivo<span className="text-amber">.</span>
                </h2>
              </div>
              <p className="max-w-md text-sm text-bone/60">
                Cinco instrumentos sobre datos abiertos: dónde se observa cada especie
                (mapa), cuándo vuela (fenología), qué hay en tu zona (geolocalización),
                cómo se comparan dos taxones y su posición en el árbol de la vida.
              </p>
            </Reveal>

            <Reveal delay={80} className="mb-6 flex flex-wrap gap-1.5">
              {LAB_TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setLabTool(t.id)}
                  className={`flex items-center gap-2.5 border px-4 py-2.5 text-[11px] font-bold tracking-[0.18em] uppercase transition-all ${
                    labTool === t.id
                      ? "border-amber bg-amber text-ink shadow-[0_8px_26px_rgba(229,168,59,0.22)]"
                      : "border-moss text-sage hover:border-amber/50 hover:text-amber"
                  }`}
                >
                  <span className={labTool === t.id ? "opacity-60" : "text-amber/70"}>{t.n}</span>
                  {t.label}
                </button>
              ))}
            </Reveal>

            <Reveal delay={120}>
              {labTool === "obs" && <Observatory species={cards} onOpen={setActive} />}
              {labTool === "cmp" && <SpeciesCompare species={cards} orderMap={orderMapRef.current} />}
              {labTool === "tree" && <TaxonomyTree orders={orders} onOpen={setActive} />}
            </Reveal>
          </div>
        </section>

        {/* ---------- mesa de herramientas ---------- */}
        <section id="herramientas" className="relative border-t border-moss/60 bg-ink/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Reveal className="flex flex-wrap items-end justify-between gap-4 py-12 pb-4">
              <div>
                <p className="text-[11px] font-bold tracking-[0.3em] text-sage uppercase">
                  Banco de trabajo del naturalista
                </p>
                <h2 className="mt-1 font-display text-4xl font-black text-parch sm:text-5xl">
                  Herramientas de campo<span className="text-amber">.</span>
                </h2>
              </div>
              <p className="max-w-sm text-sm text-bone/60">
                Determina el orden con la clave dicotómica, estudia la anatomía región a región
                y compara tallas a escala real — sin salir del gabinete.
              </p>
            </Reveal>

            <Reveal className="border-t border-moss/50 py-10">
              <h3 className="mb-6 flex items-center gap-3 font-display text-2xl font-bold text-parch">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-amber/60 bg-amber/5 font-display text-sm text-amber">
                  01
                </span>
                Clave dicotómica de órdenes
              </h3>
              <DichotomousKey onPickOrder={handlePickOrder} />
            </Reveal>

            <Reveal className="border-t border-moss/50 py-10">
              <h3 className="mb-6 flex items-center gap-3 font-display text-2xl font-bold text-parch">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-amber/60 bg-amber/5 font-display text-sm text-amber">
                  02
                </span>
                Anatomía dorsal interactiva
              </h3>
              <AnatomyDiagram />
            </Reveal>

            <Reveal className="border-t border-moss/50 py-10">
              <h3 className="mb-6 flex items-center gap-3 font-display text-2xl font-bold text-parch">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-amber/60 bg-amber/5 font-display text-sm text-amber">
                  03
                </span>
                Comparador a escala real
              </h3>
              <ScaleTool />
            </Reveal>
          </div>
        </section>

        {/* ---------- quiz: mesa de estudio ---------- */}
        <section id="quiz" className="relative border-t border-moss/60 bg-ink/50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold tracking-[0.3em] text-sage uppercase">
                  Aprende entomología jugando
                </p>
                <h2 className="mt-1 font-display text-4xl font-black text-parch sm:text-5xl">
                  Mesa de estudio<span className="text-amber">.</span>
                </h2>
              </div>
              <p className="max-w-sm text-sm text-bone/60">
                Cinco modos para dominar nombres científicos, órdenes, etimología y taxonomía.
                Gana puntos, sube de nivel y construye tu colección de conocimiento.
              </p>
            </Reveal>

            <Reveal delay={80}>
              <Quiz profile={quizProfile} onProfileUpdate={setQuizProfile} orderMap={orderMapRef.current} />
            </Reveal>
          </div>
        </section>

        {/* ---------- museo personal ---------- */}
        <section id="museo" className="relative border-t border-moss/60 bg-ink/50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold tracking-[0.3em] text-sage uppercase">
                  Tu gabinete de curiosidades
                </p>
                <h2 className="mt-1 font-display text-4xl font-black text-parch sm:text-5xl">
                  El museo<span className="text-amber">.</span>
                </h2>
              </div>
              <p className="max-w-sm text-sm text-bone/60">
                Domina especímenes en el quiz para exhibirlos. Compra vitrinas,
                fondos e iluminación con las monedas que ganes jugando.
              </p>
            </Reveal>

            <Reveal delay={80}>
              <Museum profile={quizProfile} onProfileUpdate={setQuizProfile} />
            </Reveal>
          </div>
        </section>

        {/* ---------- cuaderno de campo ---------- */}
        <section id="cuaderno" className="relative border-t border-moss/60 bg-pine/60">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-5">
            <Reveal className="lg:col-span-2">
              <p className="text-[11px] font-bold tracking-[0.3em] text-sage uppercase">
                Diario del naturalista
              </p>
              <h2 className="mt-1 font-display text-4xl font-black text-parch sm:text-5xl">
                Cuaderno de campo<span className="text-amber">.</span>
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-bone/70">
                Registra cada encuentro: especie, localidad, fecha y comportamiento. La lista de
                especies se alimenta del atlas en vivo; tus anotaciones viven solo en este
                navegador.
              </p>

              <form onSubmit={addSighting} className="label-frame mt-7 space-y-4 bg-ink/60 p-5">
                <datalist id="inat-species">
                  {suggestionNames.map((n) => (
                    <option key={n} value={n} />
                  ))}
                </datalist>
                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-bold tracking-[0.2em] text-sage uppercase">
                    Especie *
                  </span>
                  <input
                    list="inat-species"
                    value={fSpecies}
                    onChange={(e) => {
                      setFSpecies(e.target.value);
                      if (fError) setFError("");
                    }}
                    placeholder="Empieza a escribir: Apis, Vanessa…"
                    className={`w-full border bg-pine px-3 py-2.5 text-sm text-bone italic placeholder:text-bone/35 focus:border-amber ${
                      fError && !fSpecies.trim() ? "border-rust" : "border-moss"
                    }`}
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
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
                      placeholder="p. ej. Robledal de Sierra Morena"
                      className={`w-full border bg-pine px-3 py-2.5 text-sm text-bone placeholder:text-bone/35 focus:border-amber ${
                        fError && !fPlace.trim() ? "border-rust" : "border-moss"
                      }`}
                    />
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
                {fError && <p className="text-xs text-rust">{fError}</p>}
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
                  Anotaciones <span className="text-amber">({sightings.length})</span>
                </h3>
                {sightings.length > 0 && (
                  <span className="text-[11px] tracking-[0.2em] text-sage/70 uppercase">Guardado local</span>
                )}
              </div>

              {sightings.length === 0 ? (
                <div className="label-frame flex flex-col items-center gap-3 bg-ink/50 px-6 py-16 text-center">
                  <svg viewBox="0 0 48 48" className="h-14 w-14 text-moss" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M10 6h22a4 4 0 0 1 4 4v32a2 2 0 0 1-2 2H12a4 4 0 0 1-4-4V8a2 2 0 0 1 2-2z" />
                    <path d="M10 6a4 4 0 0 1 4 4v30" />
                    <path d="M20 16h10M20 22h10M20 28h6" />
                  </svg>
                  <p className="font-display text-xl text-bone/70 italic">El cuaderno espera su primera entrada.</p>
                  <p className="max-w-xs text-xs text-bone/50">
                    Sal al prado con la lupa: cualquier encuentro de seis patas merece una línea.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {sightings.map((sg) => {
                    const d = new Date(sg.date + "T00:00:00");
                    return (
                      <li
                        key={sg.id}
                        className="group flex gap-4 border border-moss/70 bg-pine/80 p-4 transition-colors hover:border-amber/50"
                      >
                        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center border border-moss/70 bg-ink/60">
                          <span className="font-display text-lg leading-none font-black text-amber">{d.getDate()}</span>
                          <span className="text-[9px] tracking-[0.14em] text-sage uppercase">
                            {d.toLocaleDateString("es-ES", { month: "short" }).replace(".", "")}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-base font-bold text-parch italic">{sg.species}</p>
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

            <Reveal delay={150} className="mt-14">
              <ExportPanel box={collectionList} log={sightings} onToast={showToast} />
            </Reveal>
        </section>

        {/* ---------- pie con fuentes académicas ---------- */}
        <Footer
          statusLabel={statusMeta.label}
          statusCls={statusMeta.cls}
          clock={clock}
          canInstall={canInstall}
          onInstall={handleInstall}
          onInstallFallback={handleInstallFallback}
        />
      </div>

      {/* ---------- modal ---------- */}
      <FilterSheet
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        sortKey={sortKey}
        onSortKey={setSortKey}
        photoFilter={photoFilter}
        onPhotoFilter={handlePhotoFilter}
        onRefresh={() => refresh(activeOrder, query)}
        onOrder={handleOrder}
        loading={loading}
        lastUpdate={lastUpdate}
        orders={orders}
        activeOrder={activeOrder}
        query={query}
      />

      <TaxonModal
        taxon={active}
        collected={active ? Boolean(collection[active.id]) : false}
        wished={active ? Boolean(wishList[active.id]) : false}
        onClose={() => setActive(null)}
        onToggleCollect={toggleCollect}
        onToggleWish={toggleWish}
      />

      {/* ---------- toast ---------- */}
      {toast && (
        <div className="toast-in fixed bottom-20 left-4 right-4 z-[90] flex items-center gap-3 border border-amber/70 bg-pine px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.6)] sm:left-auto sm:right-5 sm:w-auto">
          <span className="blink-dot h-2 w-2  bg-amber" />
          <p className="text-sm text-bone">{toast}</p>
        </div>
      )}
    </div>
  );
}
