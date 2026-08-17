import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

/** Formato persistido de la caja de colección. */
export interface BoxItem {
  id: string; // "inat:207991" | "local:01"
  latin: string;
  common: string | null;
  orderName: string;
  photoUrl: string | null;
}

export interface LogEntry {
  date: string;
  species: string;
  place: string;
  note: string;
}

interface Props {
  box: BoxItem[];
  log: LogEntry[];
  onToast: (msg: string) => void;
}

/* ---------- CSV (con BOM para Excel en español, separador ;) ---------- */

function toCSV(headers: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return "\uFEFF" + [headers, ...rows].map((r) => r.map(esc).join(";")).join("\r\n");
}

function download(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const today = () => new Date().toISOString().slice(0, 10);

export default function ExportPanel({ box, log, onToast }: Props) {
  const [sheetNo] = useState(() => String(Math.floor(1000 + Math.random() * 9000)));

  const boxRows = useMemo(
    () =>
      box.map((c, i) => [
        i + 1,
        c.latin,
        c.common ?? "—",
        c.orderName,
        c.id.startsWith("local:") ? "Cajón curado" : "iNaturalist",
      ]),
    [box]
  );

  const logRows = useMemo(
    () => log.map((l, i) => [i + 1, l.date, l.species, l.place, l.note || "—"]),
    [log]
  );

  const exportBox = () => {
    if (box.length === 0) {
      onToast("La caja está vacía: nada que exportar");
      return;
    }
    download(
      `insecta-caja-${today()}.csv`,
      toCSV(["N.º", "Taxón", "Nombre vulgar", "Orden", "Fuente"], boxRows)
    );
    onToast(`Caja exportada (${box.length} especímenes)`);
  };

  const exportLog = () => {
    if (log.length === 0) {
      onToast("El cuaderno está vacío: nada que exportar");
      return;
    }
    download(
      `insecta-cuaderno-${today()}.csv`,
      toCSV(["N.º", "Fecha", "Especie", "Localidad", "Nota"], logRows)
    );
    onToast(`Cuaderno exportado (${log.length} anotaciones)`);
  };

  const printSheet = () => {
    onToast("Preparando hoja de recolecta…");
    window.print();
  };

  return (
    <>
      <div className="label-frame bg-pine/80 p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold tracking-[0.3em] text-sage uppercase">
              Mesa de exportación
            </p>
            <h3 className="mt-1 font-display text-2xl font-black text-parch">
              Documenta tu recolecta<span className="text-amber">.</span>
            </h3>
            <p className="mt-1 max-w-xl text-sm text-bone/60">
              Lleva tus registros fuera de la app: CSV compatible con Excel y hojas de
              recolecta imprimibles, con casillas en blanco para el trabajo de campo.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <button
            onClick={exportBox}
            className="group border border-moss bg-ink/50 p-4 text-left transition-all hover:-translate-y-1 hover:border-amber/70"
          >
            <span className="flex items-center gap-2 text-amber">
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 13v3h14v-3M10 3v10M6 9l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs font-bold tracking-[0.18em] uppercase">CSV · Caja</span>
            </span>
            <span className="mt-1.5 block text-xs text-bone/55">
              {box.length} especímenes · taxón, orden y fuente
            </span>
          </button>

          <button
            onClick={exportLog}
            className="group border border-moss bg-ink/50 p-4 text-left transition-all hover:-translate-y-1 hover:border-amber/70"
          >
            <span className="flex items-center gap-2 text-amber">
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 13v3h14v-3M10 3v10M6 9l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs font-bold tracking-[0.18em] uppercase">CSV · Cuaderno</span>
            </span>
            <span className="mt-1.5 block text-xs text-bone/55">
              {log.length} anotaciones · fecha, especie, localidad
            </span>
          </button>

          <button
            onClick={printSheet}
            className="group border border-amber/60 bg-amber/10 p-4 text-left transition-all hover:-translate-y-1 hover:bg-amber hover:shadow-[0_10px_30px_rgba(229,168,59,0.25)]"
          >
            <span className="flex items-center gap-2 text-amber group-hover:text-ink">
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M5 7V3h10v4M5 13H3V9h14v4h-2M5 11h10v6H5z" strokeLinejoin="round" />
              </svg>
              <span className="text-xs font-bold tracking-[0.18em] uppercase">Hoja de recolecta</span>
            </span>
            <span className="mt-1.5 block text-xs text-bone/55 group-hover:text-ink/70">
              Imprimible · registro en papel estilo expedición
            </span>
          </button>
        </div>
      </div>

      {/* ------- hoja imprimible (fuera del flujo de pantalla) ------- */}
      {createPortal(
        <div className="print-sheet">
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "2px solid #111", paddingBottom: 8 }}>
            <h1 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 26, margin: 0 }}>
              INSECTA · Hoja de recolecta <span style={{ fontSize: 15 }}>N.º {sheetNo}</span>
            </h1>
            <p style={{ margin: 0, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Atlas entomológico · {today()}
            </p>
          </header>

          <div style={{ display: "flex", gap: 24, marginTop: 12, fontSize: 12 }}>
            <p style={{ flex: 1, margin: 0, borderBottom: "1px solid #444", paddingBottom: 3 }}>Fecha: ______________</p>
            <p style={{ flex: 2, margin: 0, borderBottom: "1px solid #444", paddingBottom: 3 }}>Localidad y coordenadas: ________________________</p>
            <p style={{ flex: 1, margin: 0, borderBottom: "1px solid #444", paddingBottom: 3 }}>Colector/a: ____________</p>
          </div>

          <h2 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 15, margin: "18px 0 6px" }}>
            Caja de colección ({box.length})
          </h2>
          <table>
            <thead>
              <tr>
                <th style={{ width: 34 }}>N.º</th>
                <th>Taxón</th>
                <th>Nombre vulgar</th>
                <th>Orden</th>
                <th>Fuente</th>
                <th style={{ width: 90 }}>Determinado por</th>
              </tr>
            </thead>
            <tbody>
              {boxRows.map((r) => (
                <tr key={String(r[0])}>
                  <td>{r[0]}</td>
                  <td style={{ fontStyle: "italic" }}>{r[1]}</td>
                  <td>{r[2]}</td>
                  <td>{r[3]}</td>
                  <td>{r[4]}</td>
                  <td />
                </tr>
              ))}
              {boxRows.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "#666" }}>Caja vacía</td></tr>
              )}
            </tbody>
          </table>

          <h2 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 15, margin: "18px 0 6px" }}>
            Cuaderno de campo ({log.length})
          </h2>
          <table>
            <thead>
              <tr>
                <th style={{ width: 34 }}>N.º</th>
                <th style={{ width: 80 }}>Fecha</th>
                <th>Especie</th>
                <th>Localidad</th>
                <th>Nota de comportamiento</th>
              </tr>
            </thead>
            <tbody>
              {logRows.map((r) => (
                <tr key={String(r[0])}>
                  <td>{r[0]}</td>
                  <td>{r[1]}</td>
                  <td style={{ fontStyle: "italic" }}>{r[2]}</td>
                  <td>{r[3]}</td>
                  <td>{r[4]}</td>
                </tr>
              ))}
              {logRows.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: "center", color: "#666" }}>Cuaderno vacío</td></tr>
              )}
            </tbody>
          </table>

          <h2 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 15, margin: "18px 0 6px" }}>
            Registro en campo (rellenar a mano)
          </h2>
          <table>
            <thead>
              <tr>
                <th style={{ width: 34 }}>N.º</th>
                <th>Especie (presunta)</th>
                <th>Hábitat / sustrato</th>
                <th>Hora</th>
                <th>Clima</th>
                <th style={{ width: 90 }}>Firma</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }, (_, i) => (
                <tr key={i}>
                  <td>{box.length + log.length + i + 1}</td>
                  <td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>

          <footer style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 22, fontSize: 10, color: "#444" }}>
            <div>
              <p style={{ margin: 0, letterSpacing: "0.14em", textTransform: "uppercase" }}>Escala gráfica (imprimir al 100 %)</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                <span>0</span>
                <span style={{ display: "inline-block", width: 100, height: 6, background: "repeating-linear-gradient(90deg,#111 0 25px,#fff 25px 50px)", border: "1px solid #111" }} />
                <span>10 mm</span>
              </div>
            </div>
            <p style={{ margin: 0, maxWidth: 380, textAlign: "right" }}>
              INSECTA · datos iNaturalist (CC) y Wikipedia. La recolecta de ejemplares debe
              cumplir la normativa local de conservación.
            </p>
          </footer>
        </div>,
        document.body
      )}
    </>
  );
}
