import { Download } from "lucide-react";
import { OrderGlyph, PinMark } from "./glyphs";
import { HamburgerButton } from "./MobileDrawer";

const NAV_ITEMS: [string, string][] = [
  ["Atlas", "#atlas"],
  ["Ciencia", "#ciencia"],
  ["Herramientas", "#herramientas"],
  ["Quiz", "#quiz"],
  ["Museo", "#museo"],
  ["Caja", "#caja"],
  ["Deseos", "#deseos"],
  ["Cuaderno", "#cuaderno"],
  ["Fuentes", "#fuentes"],
];

interface HeaderProps {
  online: boolean;
  canInstall: boolean;
  onInstall: () => void;
  onInstallFallback: () => void;
  collectionCount: number;
  wishCount: number;
  onMenuToggle: () => void;
}

export default function Header({
  online,
  canInstall,
  onInstall,
  onInstallFallback,
  collectionCount,
  wishCount,
  onMenuToggle,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-moss/60 bg-ink/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        {/* Mobile layout */}
        <div className="flex items-center justify-between gap-4 md:hidden">
          <div className="flex items-center gap-2">
            <HamburgerButton onClick={onMenuToggle} />
            <a href="#inicio" className="flex items-center gap-2.5">
              <OrderGlyph k="beetle" className="h-8 w-8 text-amber" />
              <span className="font-display text-lg font-black tracking-tight text-parch">INSECTA</span>
            </a>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="#deseos"
              className="flex items-center gap-1 border border-rust/60 bg-rust/10 px-2 py-1.5 text-[11px] font-bold tabular-nums text-rust transition-colors hover:bg-rust/20"
            >
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" fill="currentColor"><path d="M8 14s-5.5-3.5-5.5-7A3.5 3.5 0 0 1 8 4a3.5 3.5 0 0 1 5.5 3c0 3.5-5.5 7-5.5 7z" /></svg>
              {wishCount}
            </a>
            <a
              href="#caja"
              className="flex items-center gap-1 border border-amber/60 bg-amber/10 px-2 py-1.5 text-[11px] font-bold tabular-nums text-amber transition-colors hover:bg-amber hover:text-ink"
            >
              <PinMark className="h-3.5 w-3.5 shrink-0" />
              {collectionCount}
            </a>
          </div>
        </div>

        {/* Desktop layout: grid [logo+name] [nav] [actions] */}
        <div className="hidden items-center justify-between gap-6 md:grid md:grid-cols-[auto_1fr_auto]">
          {/* Col 1: Logo + name + slogan */}
          <a href="#inicio" className="flex items-center gap-3">
            <OrderGlyph k="beetle" className="h-10 w-10 text-amber" />
            <div className="flex flex-col">
              <span className="font-display text-xl font-black leading-none tracking-tight text-parch">
                INSECTA
              </span>
              <span className="mt-0.5 text-[9px] font-semibold tracking-[0.22em] text-sage/70 uppercase">
                Atlas entomológico en vivo
              </span>
            </div>
          </a>

          {/* Col 2: Navigation */}
          <nav className="flex items-center justify-center gap-5 text-[11px] font-semibold tracking-[0.16em] uppercase lg:gap-6">
            {NAV_ITEMS.map(([label, href]) => (
              <a key={href} href={href} className="text-bone/65 transition-colors hover:text-amber whitespace-nowrap">
                {label}
              </a>
            ))}
          </nav>

          {/* Col 3: Actions */}
          <div className="flex items-center gap-3">
            {!online && (
              <span className="hidden border border-rust/60 bg-rust/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] text-rust uppercase xl:block">
                Modo campo
              </span>
            )}
            <a
              href="#deseos"
              className="hidden items-center gap-1 border border-rust/60 bg-rust/10 px-2.5 py-1.5 text-[11px] font-bold tabular-nums text-rust transition-colors hover:bg-rust/20 lg:flex"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" fill="currentColor"><path d="M8 14s-5.5-3.5-5.5-7A3.5 3.5 0 0 1 8 4a3.5 3.5 0 0 1 5.5 3c0 3.5-5.5 7-5.5 7z" /></svg>
              {wishCount}
            </a>
            <a
              href="#caja"
              className="flex items-center gap-1 border border-amber/60 bg-amber/10 px-2.5 py-1.5 text-[11px] font-bold tabular-nums text-amber transition-colors hover:bg-amber hover:text-ink"
            >
              <PinMark className="h-4 w-4 shrink-0" />
              {collectionCount}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
