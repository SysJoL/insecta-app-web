import { useState, useEffect } from "react";

export default function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setP(max > 0 ? (window.scrollY / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 z-[70] h-[3px] w-full">
      <div className="h-full bg-amber transition-[width] duration-150 ease-out" style={{ width: `${p}%` }} />
    </div>
  );
}
