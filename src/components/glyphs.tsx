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
          <ellipse cx="17" cy="18" rx="10" ry="4.5" transform="rotate(-28 17 18)" />
          <ellipse cx="47" cy="18" rx="10" ry="4.5" transform="rotate(28 47 18)" />
          <circle cx="32" cy="10" r="4" />
          <ellipse cx="32" cy="20" rx="7" ry="5.5" />
          <path d="M32 26c-7 0-9 6-9 13 0 8 4 13 9 13s9-5 9-13c0-7-2-13-9-13Z" />
          <path d="M24 33q8 3 16 0M23.5 39q8.5 3 17 0M25 45q7 3 14 0" strokeWidth={1.5} />
          <path d="M32 52v5M27 44l-6 6M37 44l6 6" />
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
          <path d="M14 18 5 7M16 17 9 5" />
          <circle cx="15" cy="22" r="5" />
          <circle cx="13.5" cy="21" r="1.6" fill="currentColor" stroke="none" />
          <path d="M19 19c11-7 25-5 32 5 3 6-1 12-8 12H21c-2-4-3-10-2-17Z" />
          <path d="M24 18c12-4 22 0 26 8" strokeWidth={1.5} />
          <path d="M36 34l10-12 5 16 5 2" />
          <path d="M22 34l-2 11M28 35v11" />
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
      {k === "leaf" && (
        <g>
          <path d="M32 6C18 18 14 38 32 58c18-20 14-40 0-52Z" />
          <path d="M32 6v52" />
          <path d="M32 16l-10 8M32 16l10 8M32 26l-12 9M32 26l12 9M32 36l-10 9M32 36l10 9" strokeWidth={1.5} />
          <path d="M24 30l-6 2M40 30l6 2M26 42l-5 3M38 42l5 3" />
          <path d="M32 58c1 3 3 4 5 4" />
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
