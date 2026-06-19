import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { FavoritesToggle } from "@/components/favorites-toggle";
import { DriverAvatar } from "@/components/ui/driver-avatar";
import { Badge } from "@/components/ui/badge";
import { getHomeData } from "@/lib/openf1-data";

export const metadata = { title: "Drivers" };

export default async function DriversPage() {
  const { drivers } = await getHomeData();
  return (
    <div className="page-shell">
      <SiteNav />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Badge>Drivers Championship</Badge>
        <h1 className="mt-4 text-4xl font-black text-white sm:text-6xl">Drivers</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {drivers.map((driver) => (
            <div
              key={driver.driver_number}
              className="rounded-lg border border-white/10 p-5"
              style={{ background: `linear-gradient(135deg, ${driver.color}30, #09090b 48%, #09090b)` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="grid h-10 w-10 place-items-center rounded-full text-xl font-black text-white" style={{ backgroundColor: driver.color }}>
                    {driver.position}
                  </div>
                  <DriverAvatar driver={driver} size="lg" />
                </div>
                <FavoritesToggle id={`driver:${driver.id}`} label={driver.full_name} />
              </div>
              <Link href={`/drivers/${driver.id}`} className="mt-5 block text-3xl font-black text-white hover:underline">{driver.full_name}</Link>
              <p className="mt-2 text-zinc-400">#{driver.driver_number} {driver.name_acronym} / {driver.country_code ? `${driver.country_code} / ` : ""}{driver.team_name}</p>
              <div className="mt-5 grid gap-3">
                <Stat label="Points" value={driver.points} />
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
