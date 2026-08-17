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
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <HamburgerButton onClick={onMenuToggle} />
          <a href="#inicio" className="flex items-center gap-2.5">
            <OrderGlyph k="beetle" className="h-8 w-8 text-amber" />
            <span className="font-display text-lg font-black tracking-tight text-parch">
              INSECTA
              <span className="ml-2 hidden text-[10px] font-semibold tracking-[0.26em] text-sage/80 uppercase sm:inline">
                Atlas entomológico en vivo
              </span>
            </span>
          </a>
        </div>

        <nav className="hidden items-center gap-6 text-[12px] font-semibold tracking-[0.18em] uppercase md:flex">
          {NAV_ITEMS.map(([label, href]) => (
            <a key={href} href={href} className="text-bone/65 transition-colors hover:text-amber">
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {!online && (
            <span className="hidden border border-rust/60 bg-rust/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] text-rust uppercase xl:block">
              Modo campo
            </span>
          )}
          <button
            onClick={canInstall ? onInstall : onInstallFallback}
            className="hidden items-center gap-1.5 border border-sage/60 px-3 py-1.5 text-[11px] font-bold tracking-[0.16em] text-sage uppercase transition-colors hover:bg-sage hover:text-ink lg:flex"
          >
            <Download className="h-3.5 w-3.5" />
            Instalar
          </button>
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
    </header>
  );
}
