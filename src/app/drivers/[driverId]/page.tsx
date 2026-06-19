import { notFound } from "next/navigation";
import { BarChart3, Trophy } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { FavoritesToggle } from "@/components/favorites-toggle";
import { DriverAvatar } from "@/components/ui/driver-avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SeasonHistoryChart } from "@/components/season-history-chart";
import { getDriverById, getDriverHistory } from "@/lib/openf1-data";

export async function generateMetadata({ params }: { params: Promise<{ driverId: string }> }) {
  const { driverId } = await params;
  const driver = await getDriverById(driverId);
  return { title: driver ? driver.full_name : "Driver" };
}

export default async function DriverPage({ params }: { params: Promise<{ driverId: string }> }) {
  const { driverId } = await params;
  const driver = await getDriverById(driverId);
  if (!driver) notFound();
  const history = await getDriverHistory(driver.driver_number);
  const pointDelta = driver.points - driver.pointsStart;
  const bestSeason = history.length ? [...history].sort((a, b) => a.position - b.position)[0] : null;

  return (
    <div className="page-shell">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <section className="grid gap-8 lg:grid-cols-[.7fr_1fr]">
          <Card>
            <CardContent className="text-center">
              <div className="flex justify-end"><FavoritesToggle id={`driver:${driver.id}`} label={driver.full_name} /></div>
              <div className="flex justify-center"><DriverAvatar driver={driver} size="lg" /></div>
              <h1 className="mt-5 text-5xl font-black text-white">{driver.full_name}</h1>
              <p className="mt-2 text-zinc-400">{driver.name_acronym} / {driver.team_name}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><h2 className="text-2xl font-black text-white">Championship Profile</h2></CardHeader>
            <CardContent>
              <p className="text-lg leading-8 text-zinc-300">{driver.first_name} {driver.last_name} is currently P{driver.position} with {driver.points} points for {driver.team_name}.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <Stat icon={Trophy} label="Position" value={driver.position} />
                <Stat icon={BarChart3} label="Points" value={driver.points} />
                <Stat icon={BarChart3} label="Race Points" value={pointDelta ? `+${pointDelta}` : "No gain"} />
              </div>
            </CardContent>
          </Card>
        </section>
        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_.8fr]">
          <Card>
            <CardHeader><h2 className="text-2xl font-black text-white">Season History</h2></CardHeader>
            <CardContent className="space-y-5">
              <SeasonHistoryChart history={history} accent={driver.color} />
              {history.length ? history.map((season) => (
                <div key={season.year} className="grid grid-cols-4 gap-3 rounded border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
                  <span className="font-black text-white">{season.year}</span>
                  <span>P{season.position}</span>
                  <span>{season.points} pts</span>
                  <span>{season.points - season.pointsStart ? `${season.points - season.pointsStart > 0 ? "+" : ""}${season.points - season.pointsStart}` : "No gain"}</span>
                </div>
              )) : <div className="rounded border border-white/10 bg-white/5 p-4 text-zinc-300">No previous season results are published for this driver.</div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><h2 className="text-2xl font-black text-white">Race Identity</h2></CardHeader>
            <CardContent className="space-y-3">
              <Info label="Broadcast" value={driver.broadcast_name} />
              <Info label="Code" value={driver.name_acronym} />
              <Info label="Team" value={driver.team_name} />
              <Info label="Best Listed Season" value={bestSeason ? `${bestSeason.year} / P${bestSeason.position}` : "Current season only"} />
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string | number }) {
  return <div className="rounded border border-white/10 bg-white/5 p-4"><Icon className="text-[#e10600]" /><div className="mt-3 text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</div><div className="text-2xl font-black text-white">{value}</div></div>;
}

function Info({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded border border-white/10 bg-white/5 p-4"><div className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</div><div className="mt-1 font-black text-white">{value}</div></div>;
}
