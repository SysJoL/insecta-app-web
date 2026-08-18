import type { GlyphKey } from "../data/insects";

/* ------------------------------------------------------------------ */
/* Modelo unificado: un "espécimen en tarjeta" puede venir de la API   */
/* de iNaturalist o del cajón curado local (respaldo sin conexión).    */
/* ------------------------------------------------------------------ */

export interface CardTaxon {
  id: string; // "inat:207991" | "local:01"
  latin: string;
  common: string | null;
  orderName: string; // Coleoptera, Lepidoptera…
  rank: string;
  observations: number; // 0 ⇒ dato curado sin conteo
  photoUrl: string | null;
  attribution?: string;
  licenseCode?: string;
  curated?: boolean;
  glyphKey?: GlyphKey; // lámina preferida para especímenes curados
}

export interface InatPhoto {
  url: string;
  attribution: string;
  licenseCode: string;
}

export interface TaxonDetail {
  id: number;
  name: string;
  rank: string;
  commonName: string | null;
  observations: number;
  wikipediaUrl: string | null;
  ancestors: { name: string; rank: string; common: string | null }[];
  photos: InatPhoto[];
}

export interface WikiSummary {
  extract: string | null;
  url: string | null;
  thumbnail: string | null;
}

const BASE = "https://api.inaturalist.org/v1";
/** Insecta en iNaturalist */
export const INSECTA_ID = 47158;

async function inatFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`iNaturalist respondió ${res.status}`);
  return (await res.json()) as T;
}

/* ------------------- órdenes bajo Insecta ------------------- */

export interface OrderInfo {
  id: number;
  name: string;
  common: string | null;
}

interface TaxaListResponse {
  results: { id: number; name: string; preferred_common_name?: string }[];
}

/** Órdenes preferidos al frente de la fila (los más carismáticos). */
const PREFERRED_ORDERS = [
  "Coleoptera",
  "Lepidoptera",
  "Hymenoptera",
  "Diptera",
  "Hemiptera",
  "Orthoptera",
  "Odonata",
  "Mantodea",
  "Blattodea",
  "Phasmatodea",
  "Neuroptera",
  "Ephemeroptera",
];

export async function fetchOrders(): Promise<OrderInfo[]> {
  const data = await inatFetch<TaxaListResponse>(
    `/taxa?taxon_id=${INSECTA_ID}&rank=order&per_page=60`
  );
  const orders = data.results.map((r) => ({
    id: r.id,
    name: r.name,
    common: r.preferred_common_name ?? null,
  }));
  return orders.sort((a, b) => {
    const ia = PREFERRED_ORDERS.indexOf(a.name);
    const ib = PREFERRED_ORDERS.indexOf(b.name);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.name.localeCompare(b.name);
  });
}

/* --------------- especies más observadas por orden --------------- */

interface SpeciesCountResult {
  count: number;
  taxon: {
    id: number;
    name: string;
    rank: string;
    preferred_common_name?: string;
    ancestor_ids?: number[];
    default_photo?: { url: string; attribution: string; license_code: string };
  };
}

interface SpeciesCountsResponse {
  total_results: number;
  results: SpeciesCountResult[];
}

export function upgradePhoto(url: string): string {
  if (url.includes("/square.jpg")) return url.replace("/square.jpg", "/original.jpg");
  if (url.includes("size=square")) return url.replace("size=square", "size=original");
  return url;
}

export function toCard(
  t: SpeciesCountResult["taxon"],
  count: number,
  orderMap: Map<number, string>
): CardTaxon {
  const orderName =
    t.ancestor_ids?.map((id) => orderMap.get(id)).find(Boolean) ?? "Insecta";
  return {
    id: `inat:${t.id}`,
    latin: t.name,
    common: t.preferred_common_name ?? null,
    orderName,
    rank: t.rank ?? "species",
    observations: count,
    photoUrl: t.default_photo ? upgradePhoto(t.default_photo.url) : null,
    attribution: t.default_photo?.attribution,
    licenseCode: t.default_photo?.license_code,
  };
}

export type PhotoFilter = "all" | "with" | "without";

export async function fetchTopSpecies(
  orderMap: Map<number, string>,
  orderId: number | null,
  photoFilter: PhotoFilter = "with",
  perPage = 24
): Promise<CardTaxon[]> {
  const taxon = orderId ?? INSECTA_ID;
  const photoParam = photoFilter === "with" ? "&photos=true" : photoFilter === "without" ? "&photos=false" : "";
  const data = await inatFetch<SpeciesCountsResponse>(
    `/observations/species_counts?taxon_id=${taxon}${photoParam}&verifiable=true&order_by=count&order=desc&per_page=${perPage}`
  );
  return data.results.map((r) => toCard(r.taxon, r.count, orderMap));
}

/* ------------------------- búsqueda ------------------------- */

interface TaxaSearchResponse {
  results: {
    id: number;
    name: string;
    rank: string;
    preferred_common_name?: string;
    observations_count?: number;
    ancestor_ids?: number[];
    default_photo?: { url: string; attribution: string; license_code: string };
  }[];
}

export async function searchSpecies(
  query: string,
  orderMap: Map<number, string>,
  photoFilter: PhotoFilter = "with",
  perPage = 24
): Promise<CardTaxon[]> {
  const q = encodeURIComponent(query.trim());
  const photoParam = photoFilter === "with" ? "&photos=true" : photoFilter === "without" ? "&photos=false" : "";
  const data = await inatFetch<TaxaSearchResponse>(
    `/taxa?q=${q}&taxon_id=${INSECTA_ID}&rank=species${photoParam}&per_page=${perPage}`
  );
  return data.results.map((t) =>
    toCard(
      {
        id: t.id,
        name: t.name,
        rank: t.rank,
        preferred_common_name: t.preferred_common_name,
        ancestor_ids: t.ancestor_ids,
        default_photo: t.default_photo,
      },
      t.observations_count ?? 0,
      orderMap
    )
  );
}

/* --------------------- ficha completa --------------------- */

interface TaxonDetailResponse {
  results: [
    {
      id: number;
      name: string;
      rank: string;
      preferred_common_name?: string;
      observations_count?: number;
      wikipedia_url?: string;
      ancestors?: {
        name: string;
        rank: string;
        preferred_common_name?: string;
      }[];
      taxon_photos?: {
        photo: { url: string; attribution: string; license_code: string };
      }[];
    },
  ];
}

export async function fetchTaxonDetail(id: number): Promise<TaxonDetail> {
  const data = await inatFetch<TaxonDetailResponse>(
    `/taxa/${id}?photos=true&preferred_place_id=1`
  );
  const t = data.results[0];
  const RANKS = ["kingdom", "phylum", "subphylum", "class", "order", "family", "genus"];
  return {
    id: t.id,
    name: t.name,
    rank: t.rank,
    commonName: t.preferred_common_name ?? null,
    observations: t.observations_count ?? 0,
    wikipediaUrl: t.wikipedia_url ?? null,
    ancestors: (t.ancestors ?? [])
      .filter((a) => RANKS.includes(a.rank))
      .map((a) => ({ name: a.name, rank: a.rank, common: a.preferred_common_name ?? null })),
    photos: (t.taxon_photos ?? [])
      .slice(0, 5)
      .map((tp) => ({
        url: upgradePhoto(tp.photo.url),
        attribution: tp.photo.attribution,
        licenseCode: tp.photo.license_code,
      })),
  };
}

/* --------------------- resumen de Wikipedia --------------------- */

export async function fetchWikiSummary(scientificName: string): Promise<WikiSummary> {
  const title = encodeURIComponent(scientificName.replace(/ /g, "_"));
  const res = await fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${title}`);
  if (!res.ok) return { extract: null, url: null, thumbnail: null };
  const data = (await res.json()) as {
    extract?: string;
    content_urls?: { desktop?: { page?: string } };
    thumbnail?: { source?: string };
  };
  return {
    extract: data.extract ?? null,
    url: data.content_urls?.desktop?.page ?? null,
    thumbnail: data.thumbnail?.source ?? null,
  };
}

/* --------------------- utilidades de presentación --------------------- */

const LICENSES: Record<string, string> = {
  cc0: "CC0 · dominio público",
  "cc-by": "CC BY",
  "cc-by-nc": "CC BY-NC",
  "cc-by-nd": "CC BY-ND",
  "cc-by-sa": "CC BY-SA",
  "cc-by-nc-nd": "CC BY-NC-ND",
  "cc-by-nc-sa": "CC BY-NC-SA",
};

export function licenseLabel(code?: string | null): string {
  if (!code) return "© todos los derechos reservados";
  return LICENSES[code] ?? code.toUpperCase();
}

const ORDER_GLYPHS: Record<string, GlyphKey> = {
  Coleoptera: "beetle",
  Lucanidae: "stag",
  Lampyridae: "firefly",
  Lepidoptera: "butterfly",
  Hymenoptera: "bee",
  Odonata: "dragonfly",
  Mantodea: "mantis",
  Orthoptera: "grasshopper",
  Hemiptera: "cicada",
  Phasmatodea: "leaf",
  Neuroptera: "lacewing",
  Dermaptera: "earwig",
  Siphonaptera: "flea",
  Ephemeroptera: "mayfly",
  Blattodea: "cockroach",
};

export function glyphForOrder(orderName: string): GlyphKey {
  return ORDER_GLYPHS[orderName] ?? "beetle";
}

const nfCompact = new Intl.NumberFormat("es-ES", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const nfFull = new Intl.NumberFormat("es-ES");

export function fmtCompact(n: number): string {
  return nfCompact.format(n);
}
export function fmtFull(n: number): string {
  return nfFull.format(n);
}

export const EXTERNAL = {
  inaturalist: (id: string | number) => `https://www.inaturalist.org/taxa/${id}`,
  gbif: (name: string) => `https://www.gbif.org/es/species/search?q=${encodeURIComponent(name)}`,
  eol: (name: string) => `https://eol.org/search?q=${encodeURIComponent(name)}`,
  wikiSearch: (name: string) =>
    `https://es.wikipedia.org/w/index.php?search=${encodeURIComponent(name)}`,
};

/* ---------- photo cache for quiz ---------- */

const photoCache = new Map<string, string | null>();

export async function fetchTaxonPhoto(latinName: string): Promise<string | null> {
  if (photoCache.has(latinName)) return photoCache.get(latinName) ?? null;
  try {
    const data = await inatFetch<{ results: { default_photo?: { url: string } }[] }>(
      `/taxa?q=${encodeURIComponent(latinName)}&taxon_id=${INSECTA_ID}&rank=species&per_page=1`
    );
    const url = data.results[0]?.default_photo?.url
      ? upgradePhoto(data.results[0].default_photo.url)
      : null;
    photoCache.set(latinName, url);
    return url;
  } catch {
    photoCache.set(latinName, null);
    return null;
  }
}

/* ---------- Wikipedia etymology cache ---------- */

const etymologyCache = new Map<string, { lang: string; meaning: string; detail: string } | null>();

/**
 * Fetches the etymology section from a Wikipedia article via MediaWiki API.
 * Returns structured etymology or null if not found.
 */
export async function fetchWikipediaEtymology(
  name: string,
): Promise<{ lang: string; meaning: string; detail: string } | null> {
  const key = name.toLowerCase();
  if (etymologyCache.has(key)) return etymologyCache.get(key) ?? null;

  try {
    const title = encodeURIComponent(name);
    const res = await fetch(
      `https://es.wikipedia.org/w/api.php?action=parse&page=${title}&prop=wikitext&formatversion=2&format=json&origin=*`,
    );
    if (!res.ok) {
      etymologyCache.set(key, null);
      return null;
    }
    const data = (await res.json()) as { parse?: { wikitext?: string } };
    const wikitext = data.parse?.wikitext ?? "";

    // Find etymology section (== Etimología == or == Etymology ==)
    const etymMatch = wikitext.match(
      /==\s*(?:Etimolog[ií]a|Etymology)\s*==\n([\s\S]*?)(?=\n==\s|\n*$)/i,
    );
    if (!etymMatch) {
      etymologyCache.set(key, null);
      return null;
    }
    const section = etymMatch[1].replace(/\[\[([^|\]]*\|)?([^\]]+)\]\]/g, "$2").replace(/'''/g, "").trim();

    // Try to extract: "del latín X que significa Y" or "De X (Y)"
    let lang = "Latín";
    let meaning = "";
    let detail = section.split("\n")[0].slice(0, 200);

    const latMatch = section.match(/del?\s+(latín|griego|árabe|nahuatl)\s+(\w+)\s*(?:que\s+)?(?:significa|equivale\s+a|=)\s+["""]?([^""",.;\n]+)["""]?/i);
    if (latMatch) {
      lang = latMatch[1].charAt(0).toUpperCase() + latMatch[1].slice(1);
      meaning = latMatch[3].trim();
    } else {
      const deMatch = section.match(/De\s+(\w+)\s*\(([^)]+)\)/);
      if (deMatch) {
        meaning = deMatch[2].trim();
      } else {
        const sigMatch = section.match(/(?:significa|nombre\s+de)\s+["""]?([^""",.;\n]{2,40})["""]?/i);
        if (sigMatch) meaning = sigMatch[1].trim();
      }
    }

    if (!meaning) {
      etymologyCache.set(key, null);
      return null;
    }

    const result = { lang, meaning, detail };
    etymologyCache.set(key, result);
    return result;
  } catch {
    etymologyCache.set(key, null);
    return null;
  }
}
