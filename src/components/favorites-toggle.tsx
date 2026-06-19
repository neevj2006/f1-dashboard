"use client";

import { Star } from "lucide-react";
import { useState } from "react";

export function FavoritesToggle({ id, label }: { id: string; label: string }) {
  const [active, setActive] = useState(() => {
    if (typeof window === "undefined") return false;
    const favorites = JSON.parse(localStorage.getItem("f1-favorites") ?? "[]") as string[];
    return favorites.includes(id);
  });

  function toggle() {
    const favorites = JSON.parse(localStorage.getItem("f1-favorites") ?? "[]") as string[];
    const next = active ? favorites.filter((item) => item !== id) : [...favorites, id];
    localStorage.setItem("f1-favorites", JSON.stringify(next));
    setActive(!active);
  }

  return (
    <button onClick={toggle} title={`Favorite ${label}`} className={`grid h-10 w-10 place-items-center rounded border border-white/10 transition ${active ? "bg-[#e10600] text-white" : "bg-white/5 text-zinc-300 hover:bg-white/10"}`}>
      <Star size={18} fill={active ? "currentColor" : "none"} />
    </button>
  );
}
