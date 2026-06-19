import { notFound } from "next/navigation";
import { BarChart3, Trophy } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { FavoritesToggle } from "@/components/favorites-toggle";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DriverAvatar } from "@/components/ui/driver-avatar";
import { TeamLogo } from "@/components/ui/team-logo";
import { SeasonHistoryChart } from "@/components/season-history-chart";
import { getTeamById, getTeamHistory } from "@/lib/openf1-data";

export async function generateMetadata({ params }: { params: Promise<{ constructorId: string }> }) {
  const { constructorId } = await params;
  const team = await getTeamById(constructorId);
  return { title: team ? team.team_name : "Constructor" };
}

export default async function ConstructorPage({ params }: { params: Promise<{ constructorId: string }> }) {
  const { constructorId } = await params;
  const team = await getTeamById(constructorId);
  if (!team) notFound();
  const change = team.position_start - team.position_current;
  const history = await getTeamHistory(team.team_name);
  const pointDelta = team.points_current - team.points_start;

  return (
    <div className="page-shell">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <section className="rounded-lg border border-white/10 p-8" style={{ background: `linear-gradient(135deg, ${team.color}44, #09090b 55%)` }}>
          <div className="flex items-start justify-between gap-4">
            <TeamLogo team={team} className="h-24 w-24 text-lg" />
            <FavoritesToggle id={`constructor:${team.id}`} label={team.team_name} />
          </div>
          <h1 className="mt-6 text-5xl font-black text-white">{team.team_name}</h1>
          <p className="mt-3 max-w-3xl text-lg text-zinc-300">{team.team_name} is currently P{team.position_current} with {team.points_current} championship points.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Stat icon={Trophy} label="Position" value={team.position_current} />
            <Stat icon={BarChart3} label="Points" value={team.points_current} />
            <Stat icon={BarChart3} label="Position Change" value={change ? `${change > 0 ? "+" : ""}${change}` : "No change"} />
          </div>
        </section>
        <section className="mt-8 grid gap-6 lg:grid-cols-[.8fr_1fr]">
          <Card>
            <CardHeader><h2 className="text-2xl font-black text-white">Drivers</h2></CardHeader>
            <CardContent className="grid gap-3">
              {team.drivers.map((driver) => (
                <div key={driver.driver_number} className="flex items-center gap-4 rounded border border-white/10 bg-white/5 p-4">
                  <DriverAvatar driver={driver} size="sm" />
                  <div>
                    <div className="font-black text-white">{driver.full_name}</div>
                    <div className="text-zinc-400">{driver.name_acronym} / {driver.points} pts</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><h2 className="text-2xl font-black text-white">Season History</h2></CardHeader>
            <CardContent className="space-y-5">
              <SeasonHistoryChart history={history} accent={team.color} />
              {history.length ? history.map((season) => (
                <div key={season.year} className="grid grid-cols-4 gap-3 rounded border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
                  <span className="font-black text-white">{season.year}</span>
                  <span>P{season.position}</span>
                  <span>{season.points} pts</span>
                  <span>{season.points - season.pointsStart ? `${season.points - season.pointsStart > 0 ? "+" : ""}${season.points - season.pointsStart}` : "No gain"}</span>
                </div>
              )) : <div className="rounded border border-white/10 bg-white/5 p-4 text-zinc-300">No previous season results are published for this team.</div>}
              <div className="rounded border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
                Latest race points: <span className="font-black text-white">{pointDelta ? `+${pointDelta}` : "No gain"}</span>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string | number }) {
  return <div className="rounded border border-white/10 bg-black/30 p-4"><Icon className="text-[#e10600]" /><div className="mt-3 text-xs uppercase tracking-[0.18em] text-zinc-400">{label}</div><div className="text-2xl font-black text-white">{value}</div></div>;
}
