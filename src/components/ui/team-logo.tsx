import Image from "next/image";
import { cn } from "@/lib/utils";

type TeamBadge = {
  team_name?: string;
  name?: string;
  code?: string;
  color?: string;
};

function logoPath(name: string) {
  const key = name.toLowerCase();
  if (key.includes("mercedes")) return "/assets/constructors/mercedes.png";
  if (key.includes("ferrari")) return "/assets/constructors/ferrari.png";
  if (key.includes("mclaren")) return "/assets/constructors/mclaren.png";
  if (key.includes("red bull racing")) return "/assets/constructors/red-bull.png";
  if (key.includes("alpine")) return "/assets/constructors/alpine.png";
  if (key.includes("racing bulls")) return "/assets/constructors/racing-bulls.png";
  if (key.includes("haas")) return "/assets/constructors/haas.png";
  if (key.includes("williams")) return "/assets/constructors/williams.png";
  if (key.includes("audi")) return "/assets/constructors/audi.png";
  if (key.includes("aston martin")) return "/assets/constructors/aston-martin.png";
  if (key.includes("cadillac")) return "/assets/constructors/cadillac.png";
  return null;
}

export function TeamLogo({ team, className }: { team: TeamBadge; className?: string }) {
  const name = team.team_name ?? team.name ?? "Team";
  const logo = logoPath(name);
  return (
    <div
      className={cn("relative grid h-[72px] w-[72px] shrink-0 place-items-center overflow-hidden rounded-full border border-white/15 bg-black/70 shadow-lg shadow-black/20", className)}
      aria-label={`${name} logo`}
      title={name}
      style={{ boxShadow: `0 0 0 1px ${team.color ?? "#e10600"}55, 0 18px 45px rgba(0,0,0,.35)` }}
    >
      {logo ? <Image src={logo} alt={`${name} logo`} fill sizes="112px" className="object-cover" /> : <span className="text-sm font-black text-white">{team.code}</span>}
    </div>
  );
}
