"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { RaceItem } from "@/lib/openf1-data";
import { formatDate } from "@/lib/utils";
import { Countdown } from "./countdown";

export function RaceCarousel({ races, nextRaceId }: { races: RaceItem[]; nextRaceId: string }) {
  const start = Math.max(0, races.findIndex((race) => race.id === nextRaceId));
  const [index, setIndex] = useState(start);
  const race = races[index] ?? races[0];
  const visible = useMemo(() => races.slice(Math.max(0, index - 1), index + 2), [races, index]);

  return (
    <section className="rounded-lg border border-white/10 bg-zinc-950 p-4 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#e10600]">Upcoming Race Slider</p>
          <h2 className="text-2xl font-black text-white">Remaining 2026 Calendar</h2>
        </div>
        <div className="flex gap-2">
          <button title="Previous race" onClick={() => setIndex(Math.max(0, index - 1))} className="grid h-10 w-10 place-items-center rounded bg-white/10 text-white disabled:opacity-40" disabled={index === 0}><ChevronLeft size={18} /></button>
          <button title="Next race" onClick={() => setIndex(Math.min(races.length - 1, index + 1))} className="grid h-10 w-10 place-items-center rounded bg-white/10 text-white disabled:opacity-40" disabled={index === races.length - 1}><ChevronRight size={18} /></button>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <motion.div key={race.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg bg-gradient-to-br from-[#e10600] to-zinc-950 p-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/70">{race.countryCode} / {race.country}</p>
          <Link href={`/races/${race.id}`} className="mt-3 block text-4xl font-black leading-tight text-white hover:underline">{race.name}</Link>
          <p className="mt-2 text-zinc-200">{race.circuit} / {formatDate(race.date)}</p>
          <div className="mt-6"><Countdown target={race.startTimeUtc} /></div>
        </motion.div>
        <div className="grid gap-3">
          {visible.map((item) => (
            <button key={item.id} onClick={() => setIndex(races.findIndex((raceItem) => raceItem.id === item.id))} className={`rounded-lg border p-4 text-left transition ${item.id === race.id ? "border-[#e10600] bg-[#e10600]/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}>
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold text-white">{item.name}</span>
                <span className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">{item.countryCode}</span>
              </div>
              <p className="mt-1 text-sm text-zinc-400">{item.circuit}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
