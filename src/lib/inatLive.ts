import { upgradePhoto } from "./inat";

const BASE = "https://api.inaturalist.org/v1";
/** Dataset de la Lista Roja IUCN dentro de GBIF. */
const GBIF_IUCN_DATASET = "19491596-35ae-4a91-9a98-85cf505f1bd3";

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

/* ---------------- tipos ---------------- */

export interface ObsPoint {
  lat: number;
  lng: number;
  date: string;
  latin: string;
  photoUrl: string | null;
}

export interface NearbyTaxon {
  id: number;
  latin: string;
  common: string | null;
  rank: string;
  count: number;
  photoUrl: string | null;
}

export interface TaxonChild {
  id: number;
  name: string;
  rank: string;
  common: string | null;
  observations: number;
  photoUrl: string | null;
}

export interface IucnResult {
  /** Código IUCN (LC, NT, VU…) o null si no hay evaluación en GBIF. */
  category: string | null;
  gbifKey: number | null;
}

interface ObsResponse {
  results: Array<{
    location: string | null;
    observed_on: string;
    taxon?: {
      id: number;
      name: string;
      rank: string;
      preferred_common_name?: string | null;
      default_photo?: { url?: string } | null;
    };
    observation_photos?: Array<{ photo?: { url?: string } }>;
  }>;
}

interface HistResponse {
  results: { month_of_year?: number[] };
}

interface ChildrenResponse {
  results: {
    taxa?: Array<{
      id: number;
      name: string;
      rank: string;
      preferred_common_name?: string | null;
      observations_count?: number;
      default_photo?: { url?: string } | null;
    }>;
  };
}

interface GbifResponse {
  results: Array<{ key: number; threatStatus?: string | null }>;
}

/* ---------------- observaciones georreferenciadas (mapa) ---------------- */

export async function fetchObservationsFor(taxonId: number, perPage = 120): Promise<ObsPoint[]> {
  const data = await get<ObsResponse>(
    `${BASE}/observations?taxon_id=${taxonId}&geo=true&quality_grade=research&order=desc&order_by=observed_on&per_page=${perPage}`
  );
  const pts: ObsPoint[] = [];
  for (const o of data.results) {
    if (!o.location) continue;
    const [latS, lngS] = o.location.split(",");
    const lat = Number(latS);
    const lng = Number(lngS);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    pts.push({
      lat,
      lng,
      date: o.observed_on,
      latin: o.taxon?.name ?? "Insecta",
      photoUrl: o.observation_photos?.[0]?.photo?.url
        ? upgradePhoto(o.observation_photos[0].photo.url)
        : null,
    });
  }
  return pts;
}

/* ---------------- fenología mensual ---------------- */

export const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export async function fetchMonthHistogram(taxonId: number): Promise<number[]> {
  const data = await get<HistResponse>(
    `${BASE}/observations/histogram?taxon_id=${taxonId}&date_field=observed&interval=month_of_year`
  );
  const arr = data.results?.month_of_year ?? [];
  return Array.from({ length: 12 }, (_, i) => Number(arr[i]) || 0);
}

/* ---------------- especies cercanas (geolocalización) ---------------- */

export async function fetchNearby(lat: number, lng: number, radiusKm: number): Promise<NearbyTaxon[]> {
  const data = await get<ObsResponse>(
    `${BASE}/observations?taxon_id=47158&lat=${lat}&lng=${lng}&radius=${radiusKm}&geo=true&quality_grade=research&order=desc&order_by=observed_on&per_page=100`
  );
  const map = new Map<number, NearbyTaxon>();
  for (const o of data.results) {
    const t = o.taxon;
    if (!t?.id) continue;
    const prev = map.get(t.id);
    if (prev) prev.count += 1;
    else
      map.set(t.id, {
        id: t.id,
        latin: t.name,
        common: t.preferred_common_name ?? null,
        rank: t.rank,
        count: 1,
        photoUrl: t.default_photo?.url ? upgradePhoto(t.default_photo.url) : null,
      });
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

/* ---------------- estado IUCN (vía GBIF) ---------------- */

export async function fetchIucn(name: string): Promise<IucnResult> {
  try {
    const data = await get<GbifResponse>(
      `https://api.gbif.org/v1/species/search?q=${encodeURIComponent(name)}&datasetKey=${GBIF_IUCN_DATASET}&rank=SPECIES&limit=1`
    );
    const r = data.results?.[0];
    if (!r) return { category: null, gbifKey: null };
    return { category: r.threatStatus ?? null, gbifKey: r.key ?? null };
  } catch {
    return { category: null, gbifKey: null };
  }
}

export const IUCN_CATS = ["LC", "NT", "VU", "EN", "CR", "EW", "EX"];

export const IUCN_META: Record<string, { label: string; color: string }> = {
  LC: { label: "Preocupación menor", color: "#7fae72" },
  NT: { label: "Casi amenazado", color: "#cdd97f" },
  VU: { label: "Vulnerable", color: "#e5a83b" },
  EN: { label: "En peligro", color: "#e07b39" },
  CR: { label: "Peligro crítico", color: "#c4593b" },
  EW: { label: "Extinto en silvestre", color: "#8a6f66" },
  EX: { label: "Extinto", color: "#5c554e" },
  DD: { label: "Datos insuficientes", color: "#8f9a8a" },
  NE: { label: "Sin evaluar", color: "#5c6660" },
};

/* ---------------- árbol taxonómico (hijos de un taxón) ---------------- */

export async function fetchChildren(taxonId: number): Promise<TaxonChild[]> {
  const data = await get<ChildrenResponse>(`${BASE}/taxa/${taxonId}/children?per_page=50`);
  const taxa = data.results?.taxa ?? [];
  return taxa
    .map((t) => ({
      id: t.id,
      name: t.name,
      rank: t.rank,
      common: t.preferred_common_name ?? null,
      observations: t.observations_count ?? 0,
      photoUrl: t.default_photo?.url ? upgradePhoto(t.default_photo.url) : null,
    }))
    .sort((a, b) => b.observations - a.observations);
}
