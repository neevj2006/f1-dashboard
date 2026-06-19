"use client";

import { useEffect, useState } from "react";

export function Countdown({ target }: { target: string }) {
  const [remaining, setRemaining] = useState(() => new Date(target).getTime() - Date.now());

  useEffect(() => {
    const timer = setInterval(() => setRemaining(new Date(target).getTime() - Date.now()), 1000);
    return () => clearInterval(timer);
  }, [target]);

  const safe = Math.max(0, remaining);
  const days = Math.floor(safe / 86_400_000);
  const hours = Math.floor((safe % 86_400_000) / 3_600_000);
  const minutes = Math.floor((safe % 3_600_000) / 60_000);
  const seconds = Math.floor((safe % 60_000) / 1000);
  const values = [["D", days], ["H", hours], ["M", minutes], ["S", seconds]];

  return (
    <div className="grid grid-cols-4 gap-2">
      {values.map(([label, value]) => (
        <div key={label} className="rounded border border-white/10 bg-black/40 p-3 text-center">
          <div suppressHydrationWarning className="text-2xl font-black text-white">{String(value).padStart(2, "0")}</div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{label}</div>
        </div>
      ))}
    </div>
  );
}
