# INSECTA · Atlas entomológico en vivo

Guía de campo académica de insectos conectada a fuentes de datos abiertas.
Compilada para el repositorio [`SysJoL/insecta-app-web`](https://github.com/SysJoL/insecta-app-web).

## Qué hace

- **Atlas en vivo**: carga por orden (Coleoptera, Lepidoptera, Hymenoptera…) las especies más
  observadas del mundo desde la **iNaturalist API v1**, con fotografía de campo verificada,
  nombre vulgar y conteo de observaciones.
- **Ficha académica** por espécimen: linaje taxonómico completo (Reino → Especie),
  **semáforo IUCN (LC→EX) vía GBIF**, resumen enciclopédico en español vía
  **Wikipedia REST API**, galería fotográfica con crédito del observador y licencia
  Creative Commons, y enlaces cruzados a **iNaturalist, GBIF, EOL y Wikipedia**.
- **Rigor académico** en cada ficha:
  - *Etimología del binomio*: descompone género + epíteto y traduce cada raíz
    (griego/latín) con nota filológica.
  - *Bibliografía enlazada*: artículos con **DOI** vía la API de literatura de GBIF
    (con clásicos de respaldo) + enlace al **Catálogo de la Vida**.
  - *Glosario con tooltips*: los términos técnicos (élitros, pronoto, holometábolo…)
    se subrayan en el resumen y muestran su definición al vuelo (hover o teclado).
- **Ciencia en vivo** (mesa de análisis):
  - *Observatorio*: mapa de avistamientos georreferenciados sobre **Leaflet + OpenStreetMap**,
    fenología mensual (histograma de cuándo vuela cada especie) y especies cercanas por
    geolocalización con radio configurable (5/25/100 km).
  - *Comparador*: dos taxones lado a lado con diferencial de observaciones destacado.
  - *Árbol taxonómico*: explorador orden → familia → género → especie servido por
    `/taxa/children`, con miga de pan navegable.
- **Caja de colección** y **cuaderno de campo** con persistencia en `localStorage`.
- **Búsqueda** contra la API con pausa tipográfica, ordenación y actualización manual.
- **Cajón local de respaldo**: 14 especímenes curados con ilustración SVG propia si la red falla.

### Herramientas de campo

- **Clave dicotómica interactiva** de órdenes, con rastro navegable y salto directo al atlas filtrado.
- **Anatomía dorsal interactiva**: lámina SVG de un coleóptero con 11 regiones y glosario (Snodgrass).
- **Comparador a escala real**: longitudes corporales sobre regla graduada con referencias cotidianas.
- **Exportación**: CSV (caja y cuaderno, compatible con Excel en español) y **hoja de recolecta imprimible**.
- **PWA instalable** con service worker: modo campo offline (cache + cajón local automático al perder señal).

## Fuentes de datos

| Fuente | Uso | Clave |
| --- | --- | --- |
| [iNaturalist API v1](https://api.inaturalist.org/v1/docs/) | Taxa, observaciones, fotos | No requiere |
| [Wikipedia REST API](https://es.wikipedia.org/api/rest_v1/) | Resúmenes enciclopédicos | No requiere |
| GBIF / EOL | Enlaces de referencia | No requiere |

Fotografías © sus observadores en iNaturalist, bajo licencias CC-BY / CC-BY-NC / CC0.

## Stack

- React 18 + TypeScript + Vite 6
- Tailwind CSS **v4** (plugin `@tailwindcss/vite`, sintaxis `@theme` en `src/index.css`)
- Sin dependencias adicionales de runtime: todo el arte es SVG propio.

## Estructura

```
src/
├── App.tsx                    # orquestación: atlas, colección, cuaderno
├── lib/inat.ts                # cliente de iNaturalist + Wikipedia, tipos, licencias
├── data/insects.ts            # cajón local curado (respaldo offline)
└── components/
    ├── glyphs.tsx             # láminas xilográficas SVG por orden
    ├── TaxonCard.tsx          # tarjeta con foto, Ken Burns y licencias
    ├── TaxonModal.tsx         # ficha académica completa
    ├── Fireflies.tsx          # fondo ambiental (canvas)
    └── Reveal.tsx             # reveals por scroll y contadores
```

## Ejecutar

```bash
npm install
npm run dev      # desarrollo
npm run build    # producción → dist/
```

> **Nota de migración**: si vienes del scaffold original de Lovable (Tailwind v3),
> actualiza a Tailwind v4 (`npm i tailwindcss @tailwindcss/vite`) y registra el plugin
> en `vite.config.ts`; el resto del código no usa Supabase ni otras dependencias.
