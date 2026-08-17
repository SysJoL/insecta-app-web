/* ------------------------------------------------------------------
 * Bibliografía en vivo · API de literatura de GBIF (DOI) + Catálogo de la Vida
 * ------------------------------------------------------------------ */

export interface Reference {
  title: string;
  authors: string;
  year: string;
  source: string;
  doi: string | null;
  url: string | null;
}

interface GbifAuthor {
  name?: string;
}

interface GbifResult {
  title?: string;
  year?: number | string;
  source?: string;
  authors?: GbifAuthor[];
  doi?: string;
  identifiers?: { type?: string; identifier?: string }[];
}

interface GbifResponse {
  results?: GbifResult[];
}

function mapReference(r: GbifResult): Reference | null {
  const title = r.title?.trim();
  if (!title) return null;

  let doi = r.doi ?? null;
  if (!doi && Array.isArray(r.identifiers)) {
    const hit = r.identifiers.find((i) => (i.type ?? "").toUpperCase() === "DOI");
    doi = hit?.identifier ?? null;
  }
  if (doi) doi = doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");

  const authors = Array.isArray(r.authors)
    ? r.authors
        .map((a) => a.name)
        .filter(Boolean)
        .slice(0, 4)
        .join(", ") + (r.authors.length > 4 ? " et al." : "")
    : "—";

  return {
    title,
    authors,
    year: r.year != null ? String(r.year) : "s. f.",
    source: r.source ?? "—",
    doi,
    url: doi ? `https://doi.org/${doi}` : null,
  };
}

/** Búsqueda de literatura científica en GBIF para un taxón (familia u orden). */
export async function fetchLiterature(query: string, limit = 5): Promise<Reference[]> {
  const url = `https://api.gbif.org/v1/literature/search?q=${encodeURIComponent(
    query
  )}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GBIF literatura respondió ${res.status}`);
  const data = (await res.json()) as GbifResponse;
  return (data.results ?? [])
    .map(mapReference)
    .filter((r): r is Reference => r !== null);
}

/** Enlace al Catálogo de la Vida para un nombre científico. */
export function catalogueOfLife(name: string): string {
  return `https://www.catalogueoflife.org/data/search?q=${encodeURIComponent(name)}`;
}
