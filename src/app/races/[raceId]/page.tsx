import { notFound } from "next/navigation";
import { CalendarDays, CloudSun, Flag, MapPinned, Radio, Trophy } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CircuitImage } from "@/components/dashboard/circuit-image";
import { RaceInsights } from "@/components/race-insights";
import { getRaceDetail } from "@/lib/openf1-data";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ raceId: string }>;
}) {
  const { raceId } = await params;
  const data = await getRaceDetail(raceId);
  return { title: data ? data.race.name : "Race" };
}

export default async function RacePage({
  params,
}: {
  params: Promise<{ raceId: string }>;
}) {
  const { raceId } = await params;
  const data = await getRaceDetail(raceId);
  if (!data) notFound();
  const {
    race,
    sessions,
    drivers,
    dataYear,
    dataRaceName,
    usingPreviousYear,
    weather,
    results,
    startingGrid,
    fastestLaps,
    stints,
    raceControl,
    recentWinners,
  } = data;
  const driverCode = (number: number) =>
    drivers.find((driver) => driver.driver_number === number)?.name_acronym ??
    String(number);
  const yearSuffix = dataYear !== race.year ? ` (${dataYear})` : "";
  const gridByDriver = new Map(
    startingGrid.map((row) => [row.driver_number, row.position]),
  );
  const validResults = results.filter(
    (row) => typeof row.position === "number" && row.position >= 1,
  );
  const resultRows = validResults.map((row) => ({
    driverNumber: row.driver_number,
    driverCode: driverCode(row.driver_number),
    finish: row.position,
    grid: gridByDriver.get(row.driver_number),
  }));
  const stintRows = stints.map((stint) => ({
    driverNumber: stint.driver_number,
    driverCode: driverCode(stint.driver_number),
    compound: stint.compound,
    lapStart: stint.lap_start,
    lapEnd: stint.lap_end,
  }));
  const stats = [
    { icon: MapPinned, label: "Circuit Type", value: race.circuitType },
    { icon: Flag, label: "Race #", value: race.raceNumber },
    { icon: CalendarDays, label: "Year", value: race.year },
    weather
      ? {
          icon: CloudSun,
          label: "Weather",
          value: `${weather.air_temperature}C air / ${weather.track_temperature}C track${yearSuffix}`,
        }
      : null,
  ].filter(Boolean) as Array<{
    icon: typeof Flag;
    label: string;
    value: string | number;
  }>;
  const resultTableRows = validResults
    .filter((row) => row.position <= 5)
    .map((row) => [
      `P${row.position}`,
      driverCode(row.driver_number),
      formatGap(row.position, row.gap_to_leader),
    ]);
  const gridTableRows = startingGrid
    .slice(0, 10)
    .map((row) => [
      `P${row.position}`,
      driverCode(row.driver_number),
      row.lap_duration ? `${row.lap_duration.toFixed(3)}s` : "-",
    ]);
  const hasTimingTables = resultTableRows.length || gridTableRows.length;
  const hasRaceSummary = hasTimingTables || raceControl.length;

  return (
    <div className="page-shell">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <section>
          <Badge>Race #{race.raceNumber}</Badge>
          <h1 className="mt-4 text-5xl font-black uppercase leading-none text-white">
            {race.name}
          </h1>
          <p className="mt-4 text-lg text-zinc-300">
            {race.countryCode} {race.country} / {race.circuit} /{" "}
            {formatDate(race.date)}
          </p>
          <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
            {stats.map((item) => (
              <Stat
                key={item.label}
                icon={item.icon}
                label={item.label}
                value={item.value}
              />
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_.85fr]">
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-black text-white">Circuit Map</h2>
            </CardHeader>
            <CardContent>
              <CircuitImage
                src={race.circuitImage}
                alt={`${race.circuit} circuit`}
                circuitName={race.circuit}
                className="min-h-[280px]"
              />
            </CardContent>
          </Card>
          <div className="grid gap-6">
            {usingPreviousYear ? (
              <Card className="flex min-w-[min(100%,20rem)] flex-1 basis-full md:basis-[calc((100%-1.5rem)/2)] 2xl:basis-[calc((100%-3rem)/3)] flex-col">
                <CardHeader>
                  <h2 className="text-2xl font-black text-white">
                    Race Dataset
                  </h2>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-zinc-300">
                  <div className="rounded border border-white/10 bg-white/5 p-3">
                    {race.year} race timing is not available yet, so results and
                    timing panels are showing {dataRaceName} {dataYear}.
                  </div>
                </CardContent>
              </Card>
            ) : null}
            {sessions.length ? (
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-black text-white">
                    Weekend Schedule
                  </h2>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sessions.map((session) => (
                    <div
                      key={session.session_key}
                      className="flex items-center justify-between gap-3 rounded border border-white/10 bg-white/5 p-3"
                    >
                      <div>
                        <div className="font-black text-white">
                          {session.session_name}
                        </div>
                        <div className="text-sm text-zinc-400">
                          {session.session_type}
                        </div>
                      </div>
                      <div className="text-sm text-zinc-300">
                        {formatDate(session.date_start)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}
            {recentWinners.length ? (
              <Card>
                <CardHeader>
                  <h2 className="flex items-center gap-2 text-2xl font-black text-white">
                    <Trophy className="text-[#e10600]" />
                    Recent Track Winners
                  </h2>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentWinners.map((winner) => (
                    <div
                      key={`${winner.year}-${winner.driverNumber}`}
                      className="grid grid-cols-[4rem_1fr_auto] items-center gap-3 rounded border border-white/10 bg-white/5 p-3"
                    >
                      <div className="text-sm font-black text-zinc-400">
                        {winner.year}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-black text-white">
                          {winner.driverName}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: winner.teamColor }}
                          />
                          <span className="truncate">{winner.teamName}</span>
                        </div>
                      </div>
                      <div className="text-xl font-black text-white">
                        {winner.driverCode}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </section>

        <RaceInsights
          results={resultRows}
          fastestLaps={fastestLaps}
          stints={stintRows}
          year={dataYear}
        />

        {hasRaceSummary ? (
          <section className="mt-8 flex flex-wrap gap-6">
            <DataTable
              title={`Race Result${yearSuffix}`}
              rows={resultTableRows}
              scroll={false}
            />
            <DataTable
              title={`Starting Grid${yearSuffix}`}
              rows={gridTableRows}
            />
            {raceControl.length ? (
              <Card className="flex min-w-[min(100%,20rem)] flex-1 basis-full flex-col md:basis-[calc((100%-1.5rem)/2)] 2xl:basis-[calc((100%-3rem)/3)]">
                <CardHeader>
                  <h2 className="flex items-center gap-2 text-xl font-black text-white">
                    <Radio className="text-[#e10600]" /> Race Control
                  </h2>
                </CardHeader>
                <CardContent className="scrollbar-f1 max-h-72 space-y-3 overflow-y-auto pr-3">
                  {raceControl.map((item) => (
                    <div
                      key={`${item.date}-${item.message}`}
                      className="rounded border border-white/10 bg-white/5 p-3"
                    >
                      <div className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
                        {item.category}
                        {item.lap_number ? ` / Lap ${item.lap_number}` : ""}
                      </div>
                      <div className="mt-1 text-sm text-zinc-200">
                        {item.message}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}
          </section>
        ) : null}
      </main>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Flag;
  label: string;
  value: string | number;
}) {
  return (
    <Card className="flex h-full">
      <CardContent className="flex min-h-32 w-full flex-col justify-between">
        <Icon className="text-[#e10600]" />
        <div>
          <div className="mt-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
            {label}
          </div>
          <div className="mt-1 break-words text-lg font-black leading-tight text-white">
            {value}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DataTable({
  title,
  rows,
  scroll = true,
}: {
  title: string;
  rows: string[][];
  scroll?: boolean;
}) {
  if (!rows.length) return null;
  return (
    <Card className="flex min-w-[min(100%,20rem)] flex-1 basis-full flex-col md:basis-[calc((100%-1.5rem)/2)] 2xl:basis-[calc((100%-3rem)/3)]">
      <CardHeader>
        <h2 className="text-xl font-black text-white">{title}</h2>
      </CardHeader>
      <CardContent className={`${scroll ? "scrollbar-f1 max-h-72 overflow-y-auto pr-3" : ""} flex-1 space-y-3`}>
        {rows.map((row) => (
          <div
            key={row.join("-")}
            className="grid grid-cols-3 gap-3 rounded border border-white/10 bg-white/5 p-3 text-sm text-zinc-300"
          >
            {row.map((cell) => (
              <span
                key={cell}
                className="truncate first:font-black first:text-white"
              >
                {cell}
              </span>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function formatGap(position: number, gap: string | number | number[] | null) {
  if (position === 1) return "Leader";
  if (Array.isArray(gap)) return gap.join(" / ");
  if (typeof gap === "number") return `+${gap}s`;
  return gap ?? "-";
}
