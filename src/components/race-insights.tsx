"use client";

import type { ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TooltipContentProps } from "recharts";

type ResultRow = {
  driverNumber: number;
  driverCode: string;
  finish: number;
  grid?: number;
};

type FastLapRow = {
  driverCode: string;
  duration: number;
  lap: number;
  teamColor: string;
};

type StintRow = {
  driverNumber: number;
  driverCode: string;
  compound: string | null;
  lapStart: number;
  lapEnd: number;
};

type LapChartRow = {
  driver: string;
  duration: number;
  lap: number;
  teamColor: string;
};

export function RaceInsights({
  results,
  fastestLaps,
  stints,
  year,
}: {
  results: ResultRow[];
  fastestLaps: FastLapRow[];
  stints: StintRow[];
  year: number;
}) {
  const movement = results
    .filter((row) => typeof row.grid === "number" && typeof row.finish === "number")
    .slice(0, 10)
    .map((row) => ({
      driver: row.driverCode,
      change: (row.grid as number) - row.finish,
      grid: row.grid,
      finish: row.finish,
    }));
  const lapRows = fastestLaps.slice(0, 5).map((row) => ({
    driver: row.driverCode,
    duration: Number(row.duration.toFixed(3)),
    lap: row.lap,
    teamColor: row.teamColor,
  }));
  const maxLap = Math.max(1, ...stints.map((stint) => stint.lapEnd || stint.lapStart || 1));
  const stintRows = stints.slice(0, 16);
  if (!movement.length && !lapRows.length && !stintRows.length) return null;

  return (
    <section className="mt-8 flex flex-wrap gap-6">
      {movement.length > 0 ? <Panel title={`Position Movement (${year})`}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={movement} margin={{ top: 12, right: 4, left: -24, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="driver" tick={{ fill: "#a1a1aa", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: "#a1a1aa", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
              formatter={(value, name, item) => [`${Number(value) > 0 ? "+" : ""}${value}`, `Grid P${item.payload.grid} to finish P${item.payload.finish}`]}
              contentStyle={{ background: "#09090b", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff" }}
              labelStyle={{ color: "#fff" }}
            />
            <Bar dataKey="change" radius={[4, 4, 0, 0]}>
              {movement.map((row) => <Cell key={row.driver} fill={row.change >= 0 ? "#22c55e" : "#ef4444"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Panel> : null}

      {lapRows.length > 0 ? <Panel title={`Fastest Lap Comparison (${year})`}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={lapRows} margin={{ top: 12, right: 4, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="driver" tick={{ fill: "#a1a1aa", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fill: "#a1a1aa", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
              content={(props) => <FastestLapTooltip {...props} />}
            />
            <Bar dataKey="duration" radius={[4, 4, 0, 0]}>
              {lapRows.map((row) => <Cell key={row.driver} fill={row.teamColor} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Panel> : null}

      {stintRows.length > 0 ? <Panel title={`Tyre Strategy (${year})`}>
        <div className="mb-4 flex items-center justify-between gap-4 rounded border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
          <span>Lap 1</span>
          <span>{maxLap} laps</span>
        </div>
        <div className="scrollbar-f1 max-h-72 space-y-3 overflow-y-auto pr-2">
          {stintRows.map((stint) => {
            const left = `${Math.max(0, ((stint.lapStart - 1) / maxLap) * 100)}%`;
            const width = `${Math.max(4, ((stint.lapEnd - stint.lapStart + 1) / maxLap) * 100)}%`;
            const compound = stint.compound ?? "Unknown";
            const color = compoundColor(compound);
            return (
              <div key={`${stint.driverCode}-${compound}-${stint.lapStart}-${stint.lapEnd}`} className="rounded border border-white/10 bg-white/[0.03] p-3 text-sm">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="font-black text-white">{stint.driverCode}</span>
                  <span className="rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-black" style={{ background: color }}>
                    {compound}
                  </span>
                </div>
                <div className="relative h-8 overflow-hidden rounded bg-black/40 ring-1 ring-white/10">
                  <div className="absolute inset-y-0 rounded" style={{ left, width, background: color, boxShadow: `0 0 24px ${color}55` }}>
                    <span className="absolute inset-0 grid place-items-center px-2 text-xs font-black text-white">
                      L{stint.lapStart}-{stint.lapEnd}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel> : null}
    </section>
  );
}

function FastestLapTooltip({
  active,
  payload,
}: Partial<TooltipContentProps>) {
  const row = payload?.[0]?.payload as LapChartRow | undefined;
  if (!active || !row) return null;

  return (
    <div className="rounded border border-white/15 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 shadow-2xl">
      <div className="mb-2 flex items-center gap-2 font-black text-white">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: row.teamColor }}
        />
        {row.driver}
      </div>
      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        <span className="text-zinc-500">Time</span>
        <span className="text-right font-black text-white">
          {row.duration.toFixed(3)}s
        </span>
        <span className="text-zinc-500">Lap</span>
        <span className="text-right font-black text-white">{row.lap}</span>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-w-[min(100%,20rem)] flex-1 basis-full flex-col rounded-lg border border-white/10 bg-zinc-950 p-5 md:basis-[calc((100%-1.5rem)/2)] 2xl:basis-[calc((100%-3rem)/3)]">
      <h2 className="text-xl font-black text-white">{title}</h2>
      <div className="mt-4 flex-1">{children}</div>
    </div>
  );
}

function compoundColor(compound: string) {
  const key = compound.toLowerCase();
  if (key.includes("soft")) return "#ef4444";
  if (key.includes("medium")) return "#d99a16";
  if (key.includes("hard")) return "#a855f7";
  if (key.includes("inter")) return "#22c55e";
  if (key.includes("wet")) return "#3b82f6";
  return "#a1a1aa";
}
