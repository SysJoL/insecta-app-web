import type { SortKey } from "../App";
import type { OrderInfo, PhotoFilter } from "../lib/inat";

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  sortKey: SortKey;
  onSortKey: (k: SortKey) => void;
  photoFilter: PhotoFilter;
  onPhotoFilter: (f: PhotoFilter) => void;
  onRefresh: () => void;
  onOrder: (id: number | null) => void;
  loading: boolean;
  lastUpdate: number | null;
  orders: OrderInfo[];
  activeOrder: number | null;
  query: string;
}

export default function FilterSheet({
  open,
  onClose,
  sortKey,
  onSortKey,
  photoFilter,
  onPhotoFilter,
  onRefresh,
  onOrder,
  loading,
  lastUpdate,
  orders,
  activeOrder,
  query,
}: FilterSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] sm:hidden">
      {/* overlay */}
      <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={onClose} />

      {/* sheet */}
      <div className="overlay-in absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto border-t border-moss bg-pine px-4 pt-3 pb-6">
        {/* handle */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-bone/30" />

        <p className="mb-3 text-[11px] font-bold tracking-[0.16em] text-sage uppercase">
          Filtros y orden
        </p>

        {/* sort */}
        <label className="mb-4 flex items-center justify-between text-[11px] font-semibold tracking-[0.16em] text-sage uppercase">
          Ordenar por
          <select
            value={sortKey}
            onChange={(e) => onSortKey(e.target.value as SortKey)}
            className="border border-moss bg-ink/80 px-2 py-2 text-xs text-bone normal-case focus:border-amber"
          >
            <option value="obs">Observaciones</option>
            <option value="name">Nombre A–Z</option>
          </select>
        </label>

        {/* photo filter */}
        <p className="mb-2 text-[11px] font-bold tracking-[0.16em] text-sage uppercase">
          Mostrar
        </p>
        <div className="mb-4 flex border border-moss">
          {(["with", "all", "without"] as const).map((v) => (
            <button
              key={v}
              onClick={() => onPhotoFilter(v)}
              className={`flex-1 py-2 text-[10px] font-semibold tracking-[0.12em] uppercase transition-all ${
                photoFilter === v
                  ? "bg-amber text-ink"
                  : "text-sage hover:text-amber"
              }`}
            >
              {v === "with" ? "Con foto" : v === "without" ? "Sin foto" : "Todas"}
            </button>
          ))}
        </div>

        {/* refresh */}
        <button
          onClick={() => {
            onRefresh();
            onClose();
          }}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 border border-moss px-3 py-2.5 text-[11px] font-bold tracking-[0.16em] text-sage uppercase transition-colors hover:border-amber/60 hover:text-amber disabled:opacity-50"
        >
          <svg
            viewBox="0 0 16 16"
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 1.5v3h-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {loading ? "Consultando…" : "Actualizar"}
        </button>

        {lastUpdate && !loading && (
          <p className="mt-3 text-center text-[11px] text-bone/45 tabular-nums">
            última consulta ·{" "}
            {new Date(lastUpdate).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </p>
        )}

        {/* separator */}
        <div className="my-4 border-t border-moss/50" />

        {/* order chips */}
        <p className="mb-2 text-[11px] font-bold tracking-[0.16em] text-sage uppercase">
          Órdenes
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => {
              onOrder(null);
              onClose();
            }}
            className={`border px-2 py-2 text-[10px] font-semibold tracking-[0.12em] uppercase transition-all ${
              activeOrder === null && !query
                ? "border-amber bg-amber text-ink"
                : "border-moss text-sage hover:border-amber/50 hover:text-amber"
            }`}
          >
            Todos
          </button>
          {orders.map((o) => {
            const isActive = activeOrder === o.id && !query;
            return (
              <button
                key={o.id}
                onClick={() => {
                  onOrder(o.id);
                  onClose();
                }}
                className={`border px-2 py-2 text-[10px] font-semibold tracking-[0.12em] uppercase transition-all ${
                  isActive
                    ? "border-amber bg-amber text-ink"
                    : "border-moss text-sage hover:border-amber/50 hover:text-amber"
                }`}
              >
                {o.name}
              </button>
            );
          })}
          {orders.length === 0 && !loading && (
            <span className="col-span-3 px-1 py-2 text-[10px] text-bone/45 italic">
              Índice de órdenes no disponible sin conexión
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
