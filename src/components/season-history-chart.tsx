"use client";

import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Season = {
  year: number;
  position: number;
  points: number;
};

export function SeasonHistoryChart({ history, accent = "#e10600" }: { history: Season[]; accent?: string }) {
  const rows = [...history]
    .sort((a, b) => a.year - b.year)
    .map((season) => ({
      year: String(season.year),
      position: season.position,
      points: season.points,
    }));

  if (!rows.length) {
    return <div className="grid min-h-[260px] place-items-center rounded border border-white/10 bg-white/5 text-zinc-400">No season history published yet.</div>;
  }

  return (
    <div className="h-[280px] rounded border border-white/10 bg-black/20 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="year" tick={{ fill: "#a1a1aa", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="points" tick={{ fill: "#a1a1aa", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="position" orientation="right" reversed allowDecimals={false} tick={{ fill: "#a1a1aa", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
            contentStyle={{ background: "#09090b", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff" }}
            labelStyle={{ color: "#fff" }}
          />
          <Bar yAxisId="points" dataKey="points" name="Points" fill={accent} radius={[4, 4, 0, 0]} />
          <Line yAxisId="position" type="monotone" dataKey="position" name="Championship Position" stroke="#ffffff" strokeWidth={3} dot={{ r: 4, fill: "#ffffff" }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
