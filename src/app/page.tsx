import Link from "next/link";
import { ArrowRight, CalendarDays, Timer, Trophy, type LucideIcon } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DriverAvatar } from "@/components/ui/driver-avatar";
import { TeamLogo } from "@/components/ui/team-logo";
import { Countdown } from "@/components/dashboard/countdown";
import { CircuitPreview } from "@/components/dashboard/circuit-preview";
import { RaceCarousel } from "@/components/dashboard/race-carousel";
import { getHomeData } from "@/lib/openf1-data";
import { formatDateWithoutYear } from "@/lib/utils";

export default async function Home() {
  const { nextRace, remainingRaces, drivers, teams, fastestLap } = await getHomeData();
  const stats: [string, string, LucideIcon][] = [
    ["Leader", `${drivers[0]?.name_acronym ?? "-"} / ${drivers[0]?.points ?? 0} pts`, Trophy],
    ["Fastest Lap", fastestLap ? `${fastestLap.driverCode} / ${fastestLap.duration.toFixed(3)}s` : "Pending", Timer],
    ["Next Race", `${nextRace.countryCode} / ${formatDateWithoutYear(nextRace.date)}`, CalendarDays],
    ["Race #", String(nextRace.raceNumber), Trophy],
  ];

  return (
    <div className="page-shell">
      <SiteNav />
      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:py-10">
        <section className="grid min-h-[calc(100vh-170px)] items-center gap-8 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <Badge className="border-[#e10600]/40 bg-[#e10600]/15 text-red-100">Next Race</Badge>
            <h1 className="mt-5 max-w-4xl text-5xl font-black uppercase leading-none text-white sm:text-7xl">
              {nextRace.name}
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-zinc-300">
              {nextRace.countryCode} {nextRace.country} / {nextRace.circuit} / {formatDateWithoutYear(nextRace.date)}
            </p>
            <div className="mt-7 max-w-xl"><Countdown target={nextRace.startTimeUtc} /></div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/races/${nextRace.id}`} className="inline-flex h-12 items-center gap-2 rounded bg-[#e10600] px-5 font-black text-white transition hover:bg-red-700">
                Race Center <ArrowRight size={18} />
              </Link>
              <Link href="/races" className="inline-flex h-12 items-center gap-2 rounded border border-white/15 px-5 font-bold text-white transition hover:bg-white/10">
                Full Calendar
              </Link>
            </div>
          </div>
          <div className="grid gap-4">
            <CircuitPreview
              src={nextRace.circuitImage}
              alt={`${nextRace.circuit} circuit`}
            />
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Circuit", nextRace.circuit],
                ["Type", nextRace.circuitType],
                ["Race #", nextRace.raceNumber],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">{label}</div>
                  <div className="mt-1 text-xl font-black text-white">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <RaceCarousel races={remainingRaces} nextRaceId={nextRace.id} />

        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-black text-white">Driver Standings</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              {drivers.slice(0, 10).map((driver) => (
                <Link href={`/drivers/${driver.id}`} key={driver.driver_number} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded border border-white/10 bg-white/[0.03] p-3 transition hover:bg-white/10">
                  <div className="w-8 text-center text-xl font-black text-zinc-500">{driver.position}</div>
                  <div className="flex min-w-0 items-center gap-3">
                    <DriverAvatar driver={driver} size="sm" />
                    <div className="min-w-0">
                      <div className="truncate font-black text-white">{driver.name_acronym}</div>
                      <div className="truncate text-sm text-zinc-400">{driver.team_name} / {driver.points} pts</div>
                    </div>
                  </div>
                  <div className={driver.change > 0 ? "text-green-400" : "text-red-400"}>{driver.change === 0 ? "" : driver.change > 0 ? `+${driver.change}` : driver.change}</div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-2xl font-black text-white">Constructor Standings</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              {teams.map((team) => {
                const change = team.position_start - team.position_current;
                return (
                  <Link href={`/constructors/${team.id}`} key={team.team_name} className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-4 rounded border border-white/10 bg-white/[0.03] p-3 transition hover:bg-white/10">
                    <div className="w-8 text-center text-xl font-black text-zinc-500">{team.position_current}</div>
                    <TeamLogo team={team} className="h-16 w-16" />
                    <div className="min-w-0">
                      <div className="truncate font-black text-white">{team.team_name}</div>
                      <div className="truncate text-sm text-zinc-400">{team.points_current} pts</div>
                    </div>
                    <div className={change > 0 ? "text-green-400" : "text-red-400"}>{change === 0 ? "" : change > 0 ? `+${change}` : change}</div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map(([label, value, Icon]) => (
            <Card key={label}>
              <CardContent>
                <Icon className="text-[#e10600]" size={24} />
                <div className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">{label}</div>
                <div className="mt-2 text-xl font-black text-white">{value}</div>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
