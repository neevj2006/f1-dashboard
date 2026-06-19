import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { FavoritesToggle } from "@/components/favorites-toggle";
import { Badge } from "@/components/ui/badge";
import { TeamLogo } from "@/components/ui/team-logo";
import { getHomeData } from "@/lib/openf1-data";

export const metadata = { title: "Constructors" };

export default async function ConstructorsPage() {
  const { teams } = await getHomeData();
  return (
    <div className="page-shell">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Badge>Teams Championship</Badge>
        <h1 className="mt-4 text-4xl font-black text-white sm:text-6xl">Constructors</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => (
            <div key={team.team_name} className="rounded-lg border border-white/10 p-5" style={{ background: `linear-gradient(135deg, ${team.color}30, #09090b 48%, #09090b)` }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="grid h-10 w-10 place-items-center rounded-full text-xl font-black text-white" style={{ backgroundColor: team.color }}>{team.position_current}</div>
                  <TeamLogo team={team} className="h-20 w-20 text-base" />
                </div>
                <FavoritesToggle id={`constructor:${team.id}`} label={team.team_name} />
              </div>
              <Link href={`/constructors/${team.id}`} className="mt-5 block text-3xl font-black text-white hover:underline">{team.team_name}</Link>
              <p className="mt-2 text-zinc-400">{team.drivers.map((driver) => driver.name_acronym).join(" / ") || "Drivers unavailable"}</p>
              <div className="mt-5 grid gap-3">
                <Stat label="Points" value={team.points_current} />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded border border-white/10 bg-white/5 p-3"><div className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</div><div className="text-2xl font-black text-white">{value}</div></div>;
}
