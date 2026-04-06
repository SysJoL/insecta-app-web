export type ConservationStatus = "LC" | "NT" | "VU" | "EN" | "CR" | "DD";
export type DevelopmentType = "Holometábolo" | "Hemimetábolo" | "Paurometábolo";

export interface TaxonomyOrder {
  id: string;
  name: string;
  commonName: string;
  description: string;
  speciesCount: number;
  iconEmoji: string;
  families: TaxonomyFamily[];
}

export interface TaxonomyFamily {
  id: string;
  orderId: string;
  name: string;
  commonName: string;
  description: string;
  speciesCount: number;
  species: Species[];
}

export interface Species {
  id: string;
  familyId: string;
  orderId: string;
  scientificName: string;
  commonName: string;
  author: string;
  year: number;
  description: string;
  developmentType: DevelopmentType;
  conservationStatus: ConservationStatus;
  habitat: string[];
  distribution: string;
  size: { min: number; max: number; unit: string };
  lifecycle: {
    stages: string[];
    duration: string;
  };
  diet: string;
  imageUrl?: string;
  characteristics: string[];
}

export const conservationLabels: Record<ConservationStatus, string> = {
  LC: "Preocupación Menor",
  NT: "Casi Amenazado",
  VU: "Vulnerable",
  EN: "En Peligro",
  CR: "En Peligro Crítico",
  DD: "Datos Insuficientes",
};

export const developmentColors: Record<DevelopmentType, string> = {
  "Holometábolo": "bg-badge-holo",
  "Hemimetábolo": "bg-badge-hemi",
  "Paurometábolo": "bg-badge-pauro",
};

export const conservationColors: Record<ConservationStatus, string> = {
  LC: "bg-badge-lc",
  NT: "bg-badge-nt",
  VU: "bg-badge-vu",
  EN: "bg-badge-en",
  CR: "bg-badge-cr",
  DD: "bg-muted",
};
