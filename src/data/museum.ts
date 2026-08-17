/* ------------------------------------------------------------------ */
/*  Catálogo de la tienda del museo                                     */
/* ------------------------------------------------------------------ */

export type DecorationCategory = "vitrina" | "fondo" | "iluminacion" | "marco";

export interface ShopItem {
  id: string;
  name: string;
  category: DecorationCategory;
  cost: number;
  css: string; // clases CSS que se aplican al slot del museo
  description: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  // Vitrinas
  {
    id: "vitrina-madera",
    name: "Vitrina de madera",
    category: "vitrina",
    cost: 15,
    css: "border-2 border-honey/60 shadow-[0_0_12px_rgba(201,138,43,0.15)]",
    description: "Marco dorado clásico de gabinete",
  },
  {
    id: "vitrina-cristal",
    name: "Vitrina de cristal",
    category: "vitrina",
    cost: 30,
    css: "border-2 border-bone/40 shadow-[inset_0_0_20px_rgba(236,227,205,0.08),0_0_15px_rgba(236,227,205,0.1)]",
    description: "Efecto de brillo y reflejo sutil",
  },
  {
    id: "vitrina-antigua",
    name: "Vitrina antigua",
    category: "vitrina",
    cost: 45,
    css: "border-2 border-honey/80 shadow-[inset_0_0_30px_rgba(201,138,43,0.12),0_0_20px_rgba(201,138,43,0.15)]",
    description: "Estilo vitrina de museo del siglo XIX",
  },

  // Fondos
  {
    id: "fondo-selva",
    name: "Selva tropical",
    category: "fondo",
    cost: 25,
    css: "bg-gradient-to-br from-fern/80 via-pine to-moss/60",
    description: "Verde profundo de dosel amazónico",
  },
  {
    id: "fondo-desierto",
    name: "Desierto",
    category: "fondo",
    cost: 25,
    css: "bg-gradient-to-br from-amber/20 via-honey/10 to-amber/5",
    description: "Tonos cálidos de arena y piedra",
  },
  {
    id: "fondo-bosque",
    name: "Bosque templado",
    category: "fondo",
    cost: 25,
    css: "bg-gradient-to-br from-moss/60 via-fern/50 to-pine",
    description: "Sombras verdes bajo dosel caducifolio",
  },
  {
    id: "fondo-nocturno",
    name: "Nocturno",
    category: "fondo",
    cost: 30,
    css: "bg-gradient-to-br from-ink via-pine/90 to-ink",
    description: "Oscuridad de noche estrellada",
  },

  // Iluminación
  {
    id: "luz-calida",
    name: "Luz cálida",
    category: "iluminacion",
    cost: 20,
    css: "shadow-[0_0_25px_rgba(229,168,59,0.2),inset_0_0_15px_rgba(229,168,59,0.08)]",
    description: "Glow amber de vitrina iluminada",
  },
  {
    id: "luz-fria",
    name: "Luz fría",
    category: "iluminacion",
    cost: 20,
    css: "shadow-[0_0_25px_rgba(111,181,168,0.2),inset_0_0_15px_rgba(111,181,168,0.08)]",
    description: "Glow teal de laboratorio nocturno",
  },
  {
    id: "luz-dramatica",
    name: "Luz dramática",
    category: "iluminacion",
    cost: 35,
    css: "shadow-[0_0_30px_rgba(196,89,59,0.2),inset_0_0_20px_rgba(196,89,59,0.1)]",
    description: " Spotlight rojizo de exposición",
  },

  // Marcos
  {
    id: "marco-premium",
    name: "Marco Haeckel",
    category: "marco",
    cost: 50,
    css: "ring-2 ring-amber/50 ring-offset-2 ring-offset-pine",
    description: "Borde decorativo estilo lámina de Ernst Haeckel",
  },
  {
    id: "marco-museo",
    name: "Marco de museo",
    category: "marco",
    cost: 40,
    css: "ring-2 ring-honey/40 ring-offset-4 ring-offset-pine",
    description: "Doble borde de museo naturalista",
  },
];

export const SLOT_COSTS = [0, 0, 0, 0, 20, 30, 40, 50, 60, 75, 90, 110]; // slots 0-3 free, 4-11 cost coins

export const CATEGORY_LABELS: Record<DecorationCategory, string> = {
  vitrina: "Vitrinas",
  fondo: "Fondos",
  iluminacion: "Iluminación",
  marco: "Marcos",
};

export const CATEGORY_ICONS: Record<DecorationCategory, string> = {
  vitrina: "🪟",
  fondo: "🖼️",
  iluminacion: "💡",
  marco: "📐",
};

/** Slot máximo desbloqueable */
export const MAX_SLOTS = SLOT_COSTS.length;
