import { useEffect, type ReactNode } from "react";
import { Menu, X, Download } from "lucide-react";
import { OrderGlyph, PinMark } from "./glyphs";

const NAV_ITEMS: [string, string][] = [
  ["Atlas", "#atlas"],
  ["Ciencia", "#ciencia"],
  ["Herramientas", "#herramientas"],
  ["Quiz", "#quiz"],
  ["Caja", "#caja"],
  ["Deseos", "#deseos"],
  ["Cuaderno", "#cuaderno"],
  ["Fuentes", "#fuentes"],
];

/* ---------- hamburger button (visible solo < md) ---------- */

export function HamburgerButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center p-1.5 text-bone/70 transition-colors hover:text-amber md:hidden"
      aria-label="Abrir menú de navegación"
    >
      <Menu className="h-6 w-6" />
    </button>
  );
}

/* ---------- drawer ---------- */

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  online: boolean;
  canInstall: boolean;
  onInstall: () => void;
  onInstallFallback: () => void;
  collectionCount: number;
  wishCount: number;
}

export default function MobileDrawer({
  open,
  onClose,
  online,
  canInstall,
  onInstall,
  onInstallFallback,
  collectionCount,
  wishCount,
}: MobileDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <>
      {/* overlay */}
      {open && (
        <div
          className="overlay-in fixed inset-0 z-[75] bg-ink/85 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* panel */}
      <aside
        className={`fixed top-0 left-0 z-[80] flex h-full w-72 flex-col border-r border-moss/60 bg-pine transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "drawer-in translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-label="Menú de navegación"
        aria-hidden={!open}
      >
        {/* header del drawer */}
        <div className="flex items-center justify-between border-b border-moss/60 px-5 py-4">
          <a href="#inicio" onClick={onClose} className="flex items-center gap-2.5">
            <OrderGlyph k="beetle" className="h-7 w-7 text-amber" />
            <span className="font-display text-base font-black tracking-tight text-parch">INSECTA</span>
          </a>
          <button
            onClick={onClose}
            className="flex items-center justify-center p-1 text-bone/50 transition-colors hover:text-amber"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* links */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-2 text-[9px] font-bold tracking-[0.3em] text-sage/60 uppercase">
            Navegación
          </p>
          <ul className="space-y-1">
            {NAV_ITEMS.map(([label, href]) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={onClose}
                  className="flex items-center gap-3 border border-transparent px-3 py-2.5 text-[13px] font-semibold tracking-[0.14em] text-bone/75 uppercase transition-all hover:border-amber/40 hover:bg-amber/5 hover:text-amber"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>

          {/* acciones */}
          <div className="mt-6 border-t border-moss/50 pt-5">
            <p className="mb-3 px-2 text-[9px] font-bold tracking-[0.3em] text-sage/60 uppercase">
              Acciones
            </p>
            <div className="space-y-2">
              {!online && (
                <span className="flex w-fit items-center gap-2 border border-rust/60 bg-rust/10 px-3 py-1.5 text-[10px] font-bold tracking-[0.14em] text-rust uppercase">
                  Modo campo
                </span>
              )}
              <button
                onClick={() => {
                  canInstall ? onInstall() : onInstallFallback();
                  onClose();
                }}
                className="flex w-full items-center gap-2 border border-sage/60 px-3 py-2 text-[11px] font-bold tracking-[0.16em] text-sage uppercase transition-colors hover:bg-sage hover:text-ink"
              >
                <Download className="h-3.5 w-3.5" />
                Instalar app
              </button>
              <a
                href="#caja"
                onClick={onClose}
                className="flex w-full items-center gap-2 border border-amber/60 bg-amber/10 px-3 py-2 text-[11px] font-bold tracking-[0.16em] text-amber uppercase transition-colors hover:bg-amber hover:text-ink"
              >
                <PinMark className="h-4 w-4" />
                Caja · {collectionCount}
              </a>
              <a
                href="#deseos"
                onClick={onClose}
                className="flex w-full items-center gap-2 border border-rust/60 bg-rust/10 px-3 py-2 text-[11px] font-bold tracking-[0.16em] text-rust uppercase transition-colors hover:bg-rust/20"
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor"><path d="M8 14s-5.5-3.5-5.5-7A3.5 3.5 0 0 1 8 4a3.5 3.5 0 0 1 5.5 3c0 3.5-5.5 7-5.5 7z" /></svg>
                Deseos · {wishCount}
              </a>
            </div>
          </div>
        </nav>

        {/* footer del drawer */}
        <div className="border-t border-moss/50 px-5 py-3">
          <p className="text-[9px] tracking-[0.2em] text-bone/30 uppercase">React · Vite · Tailwind</p>
        </div>
      </aside>
    </>
  );
}
