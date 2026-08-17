import { useCountUp } from "./Reveal";

export default function StatBlock({ target, suffix, label, sub }: { target: number; suffix?: string; label: string; sub: string }) {
  const { ref, value } = useCountUp(target);
  return (
    <div className="border-l-2 border-amber/60 pl-5 lg:pl-6">
      <span ref={ref} className="font-display text-3xl font-black text-parch tabular-nums sm:text-4xl lg:text-[2.5rem]">
        {value.toLocaleString("es-ES")}
        {suffix && <span className="text-2xl text-amber">{suffix}</span>}
      </span>
      <p className="mt-1 text-[11px] font-semibold tracking-[0.22em] text-sage uppercase">{label}</p>
      <p className="text-xs text-bone/55">{sub}</p>
    </div>
  );
}
