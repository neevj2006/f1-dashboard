import Link from "next/link";
import Image from "next/image";
import { SiteNav } from "@/components/site-nav";
import { Badge } from "@/components/ui/badge";
import { getRaceMeetings } from "@/lib/openf1-data";
import { cn, formatDate } from "@/lib/utils";

export const metadata = { title: "Race Calendar" };

export default async function RacesPage() {
  const races = await getRaceMeetings();
  return (
    <div className="page-shell">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <Badge>2026 Calendar</Badge>
          <h1 className="mt-4 text-4xl font-black text-white sm:text-6xl">Race Calendar</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {races.map((race) => {
            const completed = race.status === "Completed";
            return (
            <Link
              key={race.meetingKey}
              href={`/races/${race.id}`}
              className={cn(
                "rounded-lg border border-white/10 bg-zinc-950 p-5 transition hover:-translate-y-1 hover:border-[#e10600]",
                completed && "opacity-75 saturate-75 hover:opacity-95"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-[#e10600]">Race #{race.raceNumber}</div>
                  <h2 className="mt-2 text-2xl font-black text-white">{race.name}</h2>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {completed ? (
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-zinc-400">
                      Completed
                    </span>
                  ) : null}
                  <div className="relative h-8 w-12 overflow-hidden rounded">
                    <Image src={race.countryFlag} alt={`${race.country} flag`} fill sizes="48px" className="object-cover" />
                  </div>
                </div>
              </div>
              <p className="mt-3 text-zinc-400">{race.circuit} / {race.circuitType}</p>
              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="text-sm text-zinc-300">{formatDate(race.date)}</span>
              </div>
            </Link>
          );
          })}
        </div>
      </main>
    </div>
  );
}
