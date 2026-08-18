import type { GlyphKey } from "../data/insects";

interface Props {
  k: GlyphKey;
  className?: string;
}

/**
 * Láminas xilográficas: cada orden, dibujada a mano como arte lineal.
 */
export function OrderGlyph({ k, className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {k === "beetle" && (
        <g>
          <circle cx="32" cy="12" r="4" />
          <path d="M29 9 24 3M35 9 40 3" />
          <path d="M25 16h14v6H25z" />
          <path d="M32 22c-10 0-13 8-12 18 1 9 6 14 12 14s11-5 12-14c1-10-2-18-12-18Z" />
          <path d="M32 22v32" />
          <path d="M25 20 15 14M23 30 11 28M25 42l-10 10M39 20l10-6M41 30l12-2M39 42l10 10" />
        </g>
      )}
      {k === "stag" && (
        <g>
          <path d="M28 12C23 9 21 4 25 1M36 12c5-3 7-8 3-11" />
          <circle cx="32" cy="14" r="4" />
          <path d="M25 18h14v5H25z" />
          <path d="M32 23c-10 0-13 8-12 17 1 9 6 15 12 15s11-6 12-15c1-9-2-17-12-17Z" />
          <path d="M32 23v32" />
          <path d="M25 21 14 16M23 31 11 30M25 43l-9 10M39 21l11-5M41 31l12-1M39 43l9 10" />
        </g>
      )}
      {k === "firefly" && (
        <g>
          <circle cx="32" cy="10" r="3.5" />
          <path d="M26 14h12v6H26z" />
          <path d="M32 20c-8 0-11 7-10 16 1 9 5 14 10 14s9-5 10-14c1-9-2-16-10-16Z" />
          <path d="M32 20v30" />
          <path d="M26 18l-9-4M38 18l9-4M24 30H14M40 30h10M26 40l-8 8M38 40l8 8" />
          <circle cx="32" cy="45" r="4.5" fill="#cdd97f" stroke="none" className="animate-pulse" />
          <path d="M32 55v3M26 52l-3 3M38 52l3 3" stroke="#cdd97f" strokeWidth={1.5} />
        </g>
      )}
      {k === "butterfly" && (
        <g className="glyph-flutter">
          <circle cx="32" cy="15" r="3" />
          <path d="M30 12c-3-5-5-6-7-6M34 12c3-5 5-6 7-6" />
          <path d="M32 18v28" />
          <path d="M31 22C20 10 8 12 8 21c0 8 12 9 23 8ZM33 22c11-12 23-10 23-1 0 8-12 9-23 8Z" />
          <path d="M31 31c-9 0-17 5-15 13 2 7 11 5 15-3ZM33 31c9 0 17 5 15 13-2 7-11 5-15-3Z" />
          <circle cx="15" cy="21" r="2" />
          <circle cx="49" cy="21" r="2" />
          <circle cx="22" cy="41" r="1.5" />
          <circle cx="42" cy="41" r="1.5" />
        </g>
      )}
      {k === "bee" && (
        <g>
          <path d="M28 8C24 4 20 2 18 4" />
          <path d="M18 4L14 6" />
          <path d="M36 8C40 4 44 2 46 4" />
          <path d="M46 4L50 6" />
          <ellipse cx="32" cy="10" rx="6" ry="5" />
          <ellipse cx="28" cy="9" rx="2.5" ry="3.5" fill="currentColor" stroke="none" />
          <ellipse cx="36" cy="9" rx="2.5" ry="3.5" fill="currentColor" stroke="none" />
          <path d="M30 13L28 15L30 17" />
          <path d="M34 13L36 15L34 17" />
          <ellipse cx="32" cy="17" rx="7" ry="5" />
          <ellipse cx="32" cy="22" rx="5" ry="2.5" />
          <path d="M28 24C24 28 22 34 24 42 26 48 28 50 32 52 36 50 38 48 40 42 42 34 40 28 36 24" />
          <path d="M27 28L37 28" />
          <path d="M26 32L38 32" />
          <path d="M25 36L39 36" />
          <path d="M26 40L38 40" />
          <path d="M27 44L37 44" />
          <path d="M29 48L35 48" />
          <path d="M32 52L32 56" strokeWidth={1.5} />
          <path d="M28 16C18 10 8 12 6 20 4 28 10 32 16 30 22 28 26 22 28 16" />
          <path d="M22 14C16 14 12 18 12 22" />
          <path d="M20 18C16 18 14 22 16 26" />
          <path d="M24 16C20 18 18 22 20 26" />
          <ellipse cx="14" cy="20" rx="2" ry="1.5" fill="currentColor" stroke="none" />
          <path d="M30 18C24 14 16 16 14 22 12 28 16 30 20 28 24 26 28 22 30 18" />
          <path d="M22 18C18 20 18 24 20 26" />
          <path d="M36 16C46 10 56 12 58 20 60 28 54 32 48 30 42 28 38 22 36 16" />
          <path d="M42 14C48 14 52 18 52 22" />
          <path d="M44 18C48 18 50 22 48 26" />
          <path d="M40 16C44 18 46 22 44 26" />
          <ellipse cx="50" cy="20" rx="2" ry="1.5" fill="currentColor" stroke="none" />
          <path d="M34 18C40 14 48 16 50 22 52 28 48 30 44 28 40 26 36 22 34 18" />
          <path d="M42 18C46 20 46 24 44 26" />
          <path d="M28 15L20 12L16 10" />
          <path d="M16 10L14 8" />
          <path d="M27 18L18 20L14 18" />
          <path d="M14 18L12 16" />
          <path d="M28 22L18 28L14 30" strokeWidth={2} />
          <ellipse cx="16" cy="29" rx="2.5" ry="3" />
          <path d="M14 30L12 34" />
          <path d="M12 34L10 36M12 34L14 36" />
          <path d="M36 15L44 12L48 10" />
          <path d="M48 10L50 8" />
          <path d="M37 18L46 20L50 18" />
          <path d="M50 18L52 16" />
          <path d="M36 22L46 28L50 30" strokeWidth={2} />
          <ellipse cx="48" cy="29" rx="2.5" ry="3" />
          <path d="M50 30L52 34" />
          <path d="M52 34L54 36M52 34L50 36" />
          <circle cx="30" cy="16" r="0.8" fill="currentColor" stroke="none" />
          <circle cx="34" cy="16" r="0.8" fill="currentColor" stroke="none" />
          <circle cx="32" cy="18" r="0.8" fill="currentColor" stroke="none" />
          <circle cx="29" cy="19" r="0.8" fill="currentColor" stroke="none" />
          <circle cx="35" cy="19" r="0.8" fill="currentColor" stroke="none" />
        </g>
      )}
      {k === "dragonfly" && (
        <g>
          <circle cx="32" cy="9" r="4.5" />
          <circle cx="28.5" cy="7.5" r="1.6" fill="currentColor" stroke="none" />
          <circle cx="35.5" cy="7.5" r="1.6" fill="currentColor" stroke="none" />
          <ellipse cx="32" cy="16.5" rx="3.5" ry="4" />
          <path d="M31 14C20 6 6 8 5 13c-1 4 13 6 26 5ZM33 14c11-8 25-6 26-1 1 4-13 6-26 5Z" />
          <path d="M31 19c-10 0-22 6-20 10 2 4 14-2 20-6ZM33 19c10 0 22 6 20 10-2 4-14-2-20-6Z" />
          <path d="M32 20v32M29 28h6M29 34h6M29 40h6M29 46h6M30 52l2 4 2-4" />
        </g>
      )}
      {k === "mantis" && (
        <g>
          <path d="M32 5l5 6H27z" />
          <circle cx="29.7" cy="9.3" r="1" fill="currentColor" stroke="none" />
          <circle cx="34.3" cy="9.3" r="1" fill="currentColor" stroke="none" />
          <path d="M32 11v15" />
          <path d="M32 26c-6 6-7 19 0 29 7-10 6-23 0-29Z" />
          <path d="M31 14l-9-4-2 7 8 4M33 14l9-4 2 7-8 4" />
          <path d="M30 30l-12 3-3 9M34 30l12 3 3 9" />
          <path d="M30 38l-10 8-1 8M34 38l10 8 1 8" />
        </g>
      )}
      {k === "grasshopper" && (
        <g>
          <path d="M24 10C16 2 8 0 2 4" strokeWidth={1.5} />
          <path d="M24 10C14 4 6 2 0 8" strokeWidth={1.5} />
          <path d="M40 10C48 2 56 0 62 4" strokeWidth={1.5} />
          <path d="M40 10C50 4 58 2 64 8" strokeWidth={1.5} />
          <circle cx="32" cy="12" r="7" />
          <circle cx="27" cy="10" r="2.5" fill="currentColor" stroke="none" />
          <circle cx="37" cy="10" r="2.5" fill="currentColor" stroke="none" />
          <path d="M29 17L26 20L28 22" />
          <path d="M35 17L38 20L36 22" />
          <ellipse cx="32" cy="19" rx="12" ry="5" />
          <path d="M24 18C28 16 36 16 40 18" />
          <path d="M24 22C18 26 14 32 16 40 18 44 22 46 26 44" />
          <path d="M40 22C46 26 50 32 48 40 46 44 42 46 38 44" />
          <path d="M23 26C19 30 18 36 19 40" />
          <path d="M25 24C21 28 20 34 21 42" />
          <path d="M41 26C45 30 46 36 45 40" />
          <path d="M39 24C43 28 44 34 43 42" />
          <ellipse cx="32" cy="36" rx="10" ry="9" />
          <path d="M24 30L40 30" />
          <path d="M23 34L41 34" />
          <path d="M24 38L40 38" />
          <path d="M26 42L38 42" />
          <path d="M32 45C32 50 30 56 28 62" strokeWidth={1.5} />
          <path d="M32 45C34 50 36 56 38 62" strokeWidth={1.5} />
          <path d="M26 45C22 48 20 50 18 50" />
          <path d="M38 45C42 48 44 50 46 50" />
          <path d="M26 16L18 14L14 12" />
          <path d="M38 16L46 14L50 12" />
          <path d="M24 22L16 24L12 22" />
          <path d="M40 22L48 24L52 22" />
          <path d="M26 26L16 34C12 38 8 40 6 36" strokeWidth={4} />
          <path d="M6 36L4 46L2 52" />
          <path d="M5 40L2 41" />
          <path d="M4 44L1 45" />
          <path d="M3 48L1 49" />
          <path d="M2 52L1 56" />
          <path d="M1 56L0 58M1 56L3 58" />
          <path d="M38 26L48 34C52 38 56 40 58 36" strokeWidth={4} />
          <path d="M58 36L60 46L62 52" />
          <path d="M59 40L62 41" />
          <path d="M60 44L63 45" />
          <path d="M61 48L63 49" />
          <path d="M62 52L63 56" />
          <path d="M63 56L64 58M63 56L61 58" />
        </g>
      )}
      {k === "cicada" && (
        <g>
          <circle cx="20.5" cy="11" r="3" />
          <circle cx="43.5" cy="11" r="3" />
          <path d="M24 8h16l3 7H21z" />
          <path d="M24 15h16l2 6H22z" />
          <path d="M32 21c-10 3-17 13-16 27h32c1-14-6-24-16-27Z" />
          <path d="M32 21v27M26 32l-4 12M38 32l4 12" strokeWidth={1.5} />
          <path d="M32 48v4" />
        </g>
      )}
      {k === "fly" && (
        <g>
          <ellipse cx="18" cy="21" rx="11" ry="4.5" transform="rotate(-26 18 21)" />
          <ellipse cx="46" cy="21" rx="11" ry="4.5" transform="rotate(26 46 21)" />
          <circle cx="32" cy="12" r="4.5" />
          <circle cx="29" cy="10.8" r="1.7" fill="currentColor" stroke="none" />
          <circle cx="35" cy="10.8" r="1.7" fill="currentColor" stroke="none" />
          <path d="M28 8l-5-5M36 8l5-5" strokeWidth={1.6} />
          <ellipse cx="32" cy="22" rx="7.5" ry="5.5" />
          <path d="M32 28c-7 0-10 6-10 13 0 9 5 15 10 15s10-6 10-15c0-7-3-13-10-13Z" />
          <path d="M24.5 35q7.5 3 15 0M25.5 42q6.5 3 13 0M27 49q5 2.5 10 0" strokeWidth={1.4} />
          <path d="M26 24l-8 6M38 24l8 6M25 31l-10 7M39 31l10 7M27 45l-7 9M37 45l7 9" strokeWidth={1.7} />
        </g>
      )}
      {k === "bug" && (
        <g>
          <path d="M27 9l-5-6M37 9l5-6" />
          <circle cx="32" cy="13" r="4" />
          <ellipse cx="32" cy="23" rx="8" ry="5.5" />
          <path d="M32 29c-8 0-11 7-11 15 0 9 6 15 11 15s11-6 11-15c0-8-3-15-11-15Z" />
          <path d="M32 29v30" strokeWidth={1.5} />
          <path d="M25 19l-10-5M39 19l10-5M23 29H10M41 29h13M25 40l-11 7M39 40l11 7" />
        </g>
      )}
      {k === "leaf" && (
        <g>
          <path d="M32 6C18 18 14 38 32 58c18-20 14-40 0-52Z" />
          <path d="M32 6v52" />
          <path d="M32 16l-10 8M32 16l10 8M32 26l-12 9M32 26l12 9M32 36l-10 9M32 36l10 9" strokeWidth={1.5} />
          <path d="M24 30l-6 2M40 30l6 2M26 42l-5 3M38 42l5 3" />
          <path d="M32 58c1 3 3 4 5 4" />
        </g>
      )}
      {k === "lacewing" && (
        <g>
          <path d="M32 8C28 2 22 0 18 2" />
          <path d="M32 8C36 2 42 0 46 2" />
          <circle cx="32" cy="10" r="3.5" />
          <circle cx="29.5" cy="9.5" r="2" fill="currentColor" stroke="none" />
          <circle cx="34.5" cy="9.5" r="2" fill="currentColor" stroke="none" />
          <ellipse cx="32" cy="16" rx="3" ry="2.5" />
          <path d="M29 17C18 14 8 18 6 28 4 36 10 42 20 40 28 38 30 30 29 17" />
          <path d="M27 20C20 18 14 21 13 28" />
          <path d="M26 25C22 24 18 26 17 32" />
          <path d="M27 30C24 30 21 32 20 36" />
          <path d="M35 17C46 14 56 18 58 28 60 36 54 42 44 40 36 38 34 30 35 17" />
          <path d="M37 20C44 18 50 21 51 28" />
          <path d="M38 25C42 24 46 26 47 32" />
          <path d="M37 30C40 30 43 32 44 36" />
          <path d="M32 18.5C33 22 34 28 33 34 32 38 31 42 30 46 29 48 30 49 32 49 34 49 35 48 34 46 33 42 32 38 31 34 30 28 31 22 32 18.5" />
          <path d="M29 15L22 18L18 16" />
          <path d="M29 16L21 21L17 20" />
          <path d="M29 17L23 24L19 24" />
          <path d="M35 15L42 18L46 16" />
          <path d="M35 16L43 21L47 20" />
          <path d="M35 17L41 24L45 24" />
        </g>
      )}
      {k === "earwig" && (
        <g>
          <path d="M27 7C23 4 20 2 17 3" />
          <path d="M37 7C41 4 44 2 47 3" />
          <circle cx="32" cy="9" r="4" />
          <circle cx="29" cy="8" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="35" cy="8" r="1.5" fill="currentColor" stroke="none" />
          <ellipse cx="32" cy="15" rx="4.5" ry="2.5" />
          <rect x="28" y="17" width="8" height="5" rx="0.5" />
          <path d="M32 22C33 26 34 30 33 34 32 38 31 42 30 46 29 48 28 49 28 50" />
          <path d="M32 22C31 26 30 30 31 34 32 38 33 42 34 46 35 48 36 49 36 50" />
          <path d="M31 26L33 26" />
          <path d="M30.5 30L33.5 30" />
          <path d="M30 34L34 34" />
          <path d="M29.5 38L34.5 38" />
          <path d="M29 42L35 42" />
          <path d="M28.5 46L35.5 46" />
          <path d="M28 50C24 52 20 54 17 50 15 48 16 44 19 42" />
          <path d="M36 50C40 52 44 54 47 50 49 48 48 44 45 42" />
          <path d="M28 14L20 17L16 16" />
          <path d="M28 15L19 20L15 21" />
          <path d="M28 17L20 24L16 26" />
          <path d="M36 14L44 17L48 16" />
          <path d="M36 15L45 20L49 21" />
          <path d="M36 17L44 24L48 26" />
        </g>
      )}
      {k === "flea" && (
        <g>
          <path d="M18 14C14 10 12 6 14 3" />
          <path d="M16 20L12 22L10 20" />
          <ellipse cx="19" cy="16" rx="5" ry="6" />
          <circle cx="17" cy="14" r="1.5" fill="currentColor" stroke="none" />
          <ellipse cx="26" cy="18" rx="5" ry="7" />
          <path d="M30 12C38 12 42 16 42 22 42 28 38 34 32 36 28 37 26 34 26 28 26 22 28 14 30 12" />
          <path d="M30 16C34 16 38 18 40 18" />
          <path d="M29 20C34 20 39 22 41 22" />
          <path d="M28 24C33 24 39 26 41 26" />
          <path d="M28 28C33 28 38 30 40 30" />
          <path d="M29 32C33 32 37 34 38 34" />
          <path d="M22 14L16 18L14 22L12 28" />
          <path d="M12 28L10 30M12 28L14 30" />
          <path d="M24 16L18 22L16 28L14 34" />
          <path d="M14 34L12 36M14 34L16 36" />
          <path d="M28 18L20 26C18 28 16 30 14 28" strokeWidth={3} />
          <path d="M14 28L10 38L8 44" />
          <path d="M8 44L6 50" />
          <path d="M6 50L4 52M6 50L8 52" />
          <path d="M26 16L18 24C16 26 14 28 12 26" strokeWidth={2.5} />
          <path d="M12 26L8 36L6 42" />
          <path d="M6 42L4 48" />
          <path d="M4 48L2 50M4 48L6 50" />
          <path d="M15 20L12 21" />
          <path d="M15 22L11 23" />
          <path d="M15 24L12 25" />
          <path d="M16 26L13 27" />
        </g>
      )}
      {k === "mayfly" && (
        <g>
          <path d="M30 6C26 2 23 0 20 1" />
          <path d="M34 6C38 2 41 0 44 1" />
          <circle cx="32" cy="8" r="4" />
          <circle cx="29" cy="7" r="2.5" fill="currentColor" stroke="none" />
          <circle cx="35" cy="7" r="2.5" fill="currentColor" stroke="none" />
          <ellipse cx="32" cy="14" rx="3.5" ry="2.5" />
          <path d="M30 13C22 8 14 4 12 8 10 12 16 16 20 18 24 20 28 16 30 13" />
          <path d="M25 9C23 10 22 12 23 14" />
          <path d="M22 11C20 13 20 15 22 16" />
          <path d="M27 11C26 13 26 14 27 15" />
          <path d="M34 13C42 8 50 4 52 8 54 12 48 16 44 18 40 20 36 16 34 13" />
          <path d="M39 9C41 10 42 12 41 14" />
          <path d="M42 11C44 13 44 15 42 16" />
          <path d="M37 11C38 13 38 14 37 15" />
          <path d="M29 14C24 10 18 8 17 11 16 14 20 16 23 17 26 18 28 16 29 14" />
          <path d="M35 14C40 10 46 8 47 11 48 14 44 16 41 17 38 18 36 16 35 14" />
          <path d="M32 16C33 20 34 26 33 32 32 36 31 38 30 40" />
          <path d="M32 16C31 20 30 26 31 32 32 36 33 38 34 40" />
          <path d="M31.5 20L34.5 20" />
          <path d="M31 24L35 24" />
          <path d="M30.5 28L35.5 28" />
          <path d="M30 32L36 32" />
          <path d="M30 36L34 36" />
          <path d="M30 40C26 46 20 54 14 62" strokeWidth={1.5} />
          <path d="M32 40C32 48 30 56 28 64" strokeWidth={1.5} />
          <path d="M34 40C38 46 44 54 50 62" strokeWidth={1.5} />
          <path d="M29 13L22 16L18 15" />
          <path d="M29 14L21 19L17 19" />
          <path d="M29 15L22 22L18 23" />
          <path d="M35 13L42 16L46 15" />
          <path d="M35 14L43 19L47 19" />
          <path d="M35 15L42 22L46 23" />
        </g>
      )}
      {k === "cockroach" && (
        <g>
          <path d="M24 14C18 6 10 2 4 4" strokeWidth={1.5} />
          <path d="M24 14C16 8 8 6 2 10" strokeWidth={1.5} />
          <path d="M40 14C46 6 54 2 60 4" strokeWidth={1.5} />
          <path d="M40 14C48 8 56 6 62 10" strokeWidth={1.5} />
          <ellipse cx="32" cy="16" rx="8" ry="5" />
          <circle cx="26" cy="15" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="38" cy="15" r="1.5" fill="currentColor" stroke="none" />
          <ellipse cx="32" cy="20" rx="14" ry="7" />
          <path d="M22 20C24 18 28 17 32 17 36 17 40 18 42 20" />
          <ellipse cx="32" cy="34" rx="13" ry="12" />
          <path d="M22 24C18 28 16 34 18 42 20 46 24 48 28 46" />
          <path d="M42 24C46 28 48 34 46 42 44 46 40 48 36 46" />
          <path d="M21 28C19 32 19 38 20 42" />
          <path d="M23 26C21 30 21 36 22 42" />
          <path d="M25 25C24 30 24 36 25 44" />
          <path d="M43 28C45 32 45 38 44 42" />
          <path d="M41 26C43 30 43 36 42 42" />
          <path d="M39 25C40 30 40 36 39 44" />
          <path d="M28 28L36 28" />
          <path d="M27 32L37 32" />
          <path d="M26 36L38 36" />
          <path d="M27 40L37 40" />
          <path d="M26 46C24 48 22 48 20 47" />
          <path d="M38 46C40 48 42 48 44 47" />
          <path d="M24 18L16 14L12 10" />
          <path d="M18 14L15 12" />
          <path d="M16 13L13 11" />
          <path d="M14 11L12 9" />
          <path d="M22 22L14 20L10 16" />
          <path d="M16 20L13 18" />
          <path d="M14 19L11 17" />
          <path d="M12 17L10 15" />
          <path d="M22 30L14 34L10 38" />
          <path d="M16 33L13 35" />
          <path d="M14 34L11 36" />
          <path d="M12 36L10 38" />
          <path d="M40 18L48 14L52 10" />
          <path d="M46 14L49 12" />
          <path d="M48 13L51 11" />
          <path d="M50 11L52 9" />
          <path d="M42 22L50 20L54 16" />
          <path d="M48 20L51 18" />
          <path d="M50 19L53 17" />
          <path d="M52 17L54 15" />
          <path d="M42 30L50 34L54 38" />
          <path d="M48 33L51 35" />
          <path d="M50 34L53 36" />
          <path d="M52 36L54 38" />
        </g>
      )}
      {k === "bristletail" && (
        <g>
          <path d="M14 20C10 16 4 14 2 16" strokeWidth={1.5} />
          <path d="M16 18C12 14 6 12 4 14" strokeWidth={1.5} />
          <ellipse cx="18" cy="22" rx="5" ry="4" />
          <circle cx="16" cy="21" r="1.5" fill="currentColor" stroke="none" />
          <path d="M18 26C22 30 30 36 42 40 54 44 58 42 60 40" />
          <path d="M18 28C22 32 30 38 42 42 54 46 58 44 60 42" />
          <path d="M20 30L58 46" />
          <path d="M20 32L56 48" />
          <path d="M60 40L62 38L60 36" />
          <path d="M60 42L62 40L60 38" />
          <path d="M16 24L12 28L10 32" />
          <path d="M20 24L24 28L26 32" />
          <path d="M18 26L18 32L16 38" />
        </g>
      )}
      {k === "webspinner" && (
        <g>
          <circle cx="18" cy="14" r="5" />
          <circle cx="16" cy="13" r="1.5" fill="currentColor" stroke="none" />
          <path d="M22 12C26 10 30 12 32 16" strokeWidth={1.5} />
          <path d="M22 14C26 12 30 14 32 18" strokeWidth={1.5} />
          <ellipse cx="34" cy="20" rx="8" ry="5" />
          <path d="M42 20C46 22 50 26 52 32 54 38 52 44 48 48" />
          <path d="M42 22C46 24 50 28 52 34 54 40 52 46 48 50" />
          <path d="M26 18L20 22L16 20" />
          <path d="M26 20L20 24L16 22" />
          <path d="M42 22L48 26L52 24" />
          <path d="M42 24L48 28L52 26" />
          <path d="M26 22L22 28L20 34" />
          <path d="M42 26L46 32L48 38" />
          <path d="M48 48C44 52 38 54 32 52" strokeWidth={1.5} />
          <path d="M48 50C44 54 38 56 32 54" strokeWidth={1.5} />
        </g>
      )}
      {k === "scorpionfly" && (
        <g>
          <ellipse cx="14" cy="18" rx="6" ry="4" />
          <circle cx="12" cy="17" r="1.5" fill="currentColor" stroke="none" />
          <path d="M20 16C24 14 28 14 30 16" strokeWidth={1.5} />
          <path d="M20 18C24 16 28 16 30 18" strokeWidth={1.5} />
          <ellipse cx="34" cy="20" rx="6" ry="4" />
          <path d="M40 20C44 22 48 26 50 32 52 38 50 44 46 48" />
          <path d="M40 22C44 24 48 28 50 34 52 40 50 46 46 50" />
          <path d="M20 16L16 12L12 8" strokeWidth={1.5} />
          <path d="M20 18L16 14L12 10" strokeWidth={1.5} />
          <path d="M46 48C42 52 38 54 34 52" />
          <path d="M46 50C42 54 38 56 34 54" />
          <path d="M28 18L24 22L20 20" />
          <path d="M28 20L24 24L20 22" />
          <path d="M40 22L44 26L48 24" />
          <path d="M40 24L44 28L48 26" />
          <path d="M28 22L24 28L22 34" />
          <path d="M40 26L44 32L46 38" />
        </g>
      )}
      {k === "dobsonfly" && (
        <g>
          <circle cx="32" cy="12" r="5" />
          <circle cx="29" cy="11" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="35" cy="11" r="1.5" fill="currentColor" stroke="none" />
          <path d="M28 12L22 8L18 4" strokeWidth={1.5} />
          <path d="M36 12L42 8L46 4" strokeWidth={1.5} />
          <ellipse cx="32" cy="20" rx="5" ry="4" />
          <path d="M28 22C18 18 8 20 6 26 4 32 8 36 14 34 20 32 26 26 28 22" />
          <path d="M36 22C46 18 56 20 58 26 60 32 56 36 50 34 44 32 38 26 36 22" />
          <path d="M20 24C16 24 12 26 10 28" />
          <path d="M22 26C18 26 14 28 12 30" />
          <path d="M44 24C48 24 52 26 54 28" />
          <path d="M42 26C46 26 50 28 52 30" />
          <path d="M32 24C33 30 34 36 33 42 32 46 31 48 30 50" />
          <path d="M32 24C31 30 30 36 31 42 32 46 33 48 34 50" />
          <path d="M28 26L20 30L16 34" />
          <path d="M36 26L44 30L48 34" />
        </g>
      )}
      {k === "stonefly" && (
        <g>
          <circle cx="32" cy="10" r="4" />
          <circle cx="29.5" cy="9" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="34.5" cy="9" r="1.5" fill="currentColor" stroke="none" />
          <path d="M28 12C24 10 20 12 18 16" strokeWidth={1.5} />
          <path d="M36 12C40 10 44 12 46 16" strokeWidth={1.5} />
          <ellipse cx="32" cy="18" rx="6" ry="4" />
          <path d="M26 22C22 26 20 32 22 38 24 42 28 44 32 42" />
          <path d="M38 22C42 26 44 32 42 38 40 42 36 44 32 42" />
          <path d="M32 42C33 46 34 50 32 54" />
          <path d="M32 42C31 46 30 50 32 54" />
          <path d="M26 14L18 16L12 14" />
          <path d="M38 14L46 16L52 14" />
          <path d="M26 20L18 24L14 22" />
          <path d="M38 20L46 24L50 22" />
          <path d="M26 28L20 32L16 30" />
          <path d="M38 28L44 32L48 30" />
          <path d="M32 54L30 58L32 60L34 58Z" />
        </g>
      )}
      {k === "barklouse" && (
        <g>
          <ellipse cx="32" cy="14" rx="8" ry="6" />
          <circle cx="28" cy="12" r="2.5" fill="currentColor" stroke="none" />
          <circle cx="36" cy="12" r="2.5" fill="currentColor" stroke="none" />
          <path d="M26 10C20 6 14 4 10 6" strokeWidth={1.5} />
          <path d="M38 10C44 6 50 4 54 6" strokeWidth={1.5} />
          <ellipse cx="32" cy="24" rx="5" ry="4" />
          <path d="M28 26C24 30 22 36 24 40 26 44 30 46 32 44" />
          <path d="M36 26C40 30 42 36 40 40 38 44 34 46 32 44" />
          <path d="M26 16L20 20L16 18" />
          <path d="M38 16L44 20L48 18" />
          <path d="M26 22L18 26L14 24" />
          <path d="M38 22L46 26L50 24" />
          <path d="M26 28L20 32L16 30" />
          <path d="M38 28L44 32L48 30" />
          <path d="M28 28C24 32 20 38 22 42" strokeWidth={1} />
          <path d="M36 28C40 32 44 38 42 42" strokeWidth={1} />
        </g>
      )}
      {k === "snakefly" && (
        <g>
          <circle cx="14" cy="14" r="4" />
          <circle cx="12" cy="13" r="1.5" fill="currentColor" stroke="none" />
          <path d="M18 14C24 14 30 16 36 20" strokeWidth={1.5} />
          <path d="M18 16C24 16 30 18 36 22" strokeWidth={1.5} />
          <ellipse cx="40" cy="24" rx="6" ry="4" />
          <path d="M46 24C50 26 54 30 56 36 58 42 56 48 52 50" />
          <path d="M46 26C50 28 54 32 56 38 58 44 56 50 52 52" />
          <path d="M36 20L30 18L26 16" strokeWidth={1.5} />
          <path d="M36 22L30 20L26 18" strokeWidth={1.5} />
          <path d="M36 22L28 26L22 24" />
          <path d="M44 24L50 28L54 26" />
          <path d="M36 26L28 30L22 28" />
          <path d="M44 28L50 32L54 30" />
          <path d="M14 18L10 22L8 26" />
          <path d="M52 50L50 54L52 56" strokeWidth={1.5} />
        </g>
      )}
      {k === "twisted-wing" && (
        <g>
          <ellipse cx="32" cy="22" rx="6" ry="4" />
          <circle cx="30" cy="21" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="34" cy="21" r="1.5" fill="currentColor" stroke="none" />
          <path d="M26 24C22 28 20 34 22 38 24 42 28 44 32 42" />
          <path d="M38 24C42 28 44 34 42 38 40 42 36 44 32 42" />
          <path d="M32 18C22 14 12 16 8 22 6 26 10 30 16 28 22 26 28 20 32 18" />
          <path d="M32 18C42 14 52 16 56 22 58 26 54 30 48 28 42 26 36 20 32 18" />
          <path d="M22 26L16 30L12 28" />
          <path d="M42 26L48 30L52 28" />
          <path d="M22 30L16 34L12 32" />
          <path d="M42 30L48 34L52 32" />
          <path d="M32 42C33 46 34 50 32 54" />
          <path d="M32 42C31 46 30 50 32 54" />
        </g>
      )}
      {k === "thrip" && (
        <g>
          <ellipse cx="32" cy="10" rx="4" ry="3" />
          <circle cx="30.5" cy="9.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="33.5" cy="9.5" r="1" fill="currentColor" stroke="none" />
          <path d="M28 8C24 6 20 8 18 12" strokeWidth={1.5} />
          <path d="M36 8C40 6 44 8 46 12" strokeWidth={1.5} />
          <path d="M32 13C33 16 34 20 33 24 32 28 31 32 30 36" />
          <path d="M32 13C31 16 30 20 31 24 32 28 33 32 34 36" />
          <path d="M32 36C33 40 34 44 32 48 30 52 28 54 26 56" />
          <path d="M32 36C31 40 30 44 32 48 34 52 36 54 38 56" />
          <path d="M30 16L24 18L20 16" strokeWidth={1.5} />
          <path d="M34 16L40 18L44 16" strokeWidth={1.5} />
          <path d="M30 22L22 24L18 22" strokeWidth={1.5} />
          <path d="M34 22L42 24L46 22" strokeWidth={1.5} />
          <path d="M30 28L22 30L18 28" strokeWidth={1.5} />
          <path d="M34 28L42 30L46 28" strokeWidth={1.5} />
        </g>
      )}
      {k === "caddisfly" && (
        <g>
          <circle cx="32" cy="12" r="5" />
          <circle cx="29" cy="11" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="35" cy="11" r="1.5" fill="currentColor" stroke="none" />
          <path d="M26 10C20 6 14 4 10 6" strokeWidth={1.5} />
          <path d="M38 10C44 6 50 4 54 6" strokeWidth={1.5} />
          <ellipse cx="32" cy="20" rx="6" ry="4" />
          <path d="M26 24C22 28 20 34 22 40 24 44 28 46 32 44" />
          <path d="M38 24C42 28 44 34 42 40 40 44 36 46 32 44" />
          <path d="M26 22L18 26L14 24" />
          <path d="M38 22L46 26L50 24" />
          <path d="M26 28L18 32L14 30" />
          <path d="M38 28L46 32L50 30" />
          <path d="M26 34L20 38L16 36" />
          <path d="M38 34L44 38L48 36" />
          <path d="M22 24C18 26 14 30 12 34" strokeWidth={1} />
          <path d="M42 24C46 26 50 30 52 34" strokeWidth={1} />
        </g>
      )}
      {k === "angel-insect" && (
        <g>
          <ellipse cx="32" cy="12" rx="5" ry="4" />
          <circle cx="30" cy="11" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="34" cy="11" r="1.5" fill="currentColor" stroke="none" />
          <path d="M28 10C24 8 20 10 18 14" strokeWidth={1.5} />
          <path d="M36 10C40 8 44 10 46 14" strokeWidth={1.5} />
          <ellipse cx="32" cy="20" rx="5" ry="4" />
          <path d="M28 22C24 26 22 32 24 38 26 42 30 44 32 42" />
          <path d="M36 22C40 26 42 32 40 38 38 42 34 44 32 42" />
          <path d="M32 42C33 46 34 50 32 54" />
          <path d="M32 42C31 46 30 50 32 54" />
          <path d="M28 18L20 20L16 18" />
          <path d="M36 18L44 20L48 18" />
          <path d="M28 24L20 26L16 24" />
          <path d="M36 24L44 26L48 24" />
          <path d="M28 30L22 32L18 30" />
          <path d="M36 30L42 32L46 30" />
        </g>
      )}
      {k === "silverfish" && (
        <g>
          <ellipse cx="18" cy="16" rx="6" ry="5" />
          <circle cx="16" cy="15" r="1.5" fill="currentColor" stroke="none" />
          <path d="M24 14C30 14 38 16 46 20 54 24 58 30 60 36" />
          <path d="M24 16C30 16 38 18 46 22 54 26 58 32 60 38" />
          <path d="M60 36L62 34L60 32" />
          <path d="M60 38L62 36L60 34" />
          <path d="M12 14C8 10 4 8 2 10" strokeWidth={1.5} />
          <path d="M14 12C10 8 6 6 4 8" strokeWidth={1.5} />
          <path d="M22 12L30 10L38 12" strokeWidth={1.5} />
          <path d="M22 14L30 12L38 14" strokeWidth={1.5} />
          <path d="M14 20L10 24L8 28" />
          <path d="M22 20L26 24L28 28" />
          <path d="M14 22L10 26L8 30" />
          <path d="M22 22L26 26L28 30" />
          <path d="M14 24L10 28L8 32" />
          <path d="M22 24L26 28L28 32" />
        </g>
      )}
    </svg>
  );
}

export function PinMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="8" r="5" fill="currentColor" />
      <circle cx="10.4" cy="6.4" r="1.6" fill="rgba(255,255,255,0.55)" />
      <path d="M12 13v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
