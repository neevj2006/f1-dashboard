import Image from "next/image";

type DriverImage = {
  full_name?: string;
  name?: string;
  name_acronym?: string;
  code?: string;
  headshot_url?: string;
  image?: string;
  color?: string;
};

function driverAssetPath(name?: string) {
  if (!name) return null;
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug ? `/assets/drivers/${slug}.png` : null;
}

export function DriverAvatar({ driver, size = "md" }: { driver: DriverImage; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-10 w-10 text-xs", md: "h-14 w-14 text-sm", lg: "h-24 w-24 text-2xl" };
  const label = driver.full_name ?? driver.name ?? driver.name_acronym ?? driver.code ?? "Driver";
  const image = driver.headshot_url ?? driver.image ?? driverAssetPath(label);
  return (
    <div
      className={`${sizes[size]} relative grid shrink-0 place-items-center overflow-hidden rounded-full border border-white/15 bg-zinc-950 font-black text-white shadow-lg`}
      style={{ background: `radial-gradient(circle at 35% 25%, rgba(255,255,255,.35), transparent 22%), linear-gradient(135deg, ${driver.color ?? "#e10600"}, #111)` }}
      aria-label={`${label} driver photo`}
    >
      {image ? <Image src={image} alt={`${label} portrait`} fill sizes={size === "lg" ? "96px" : size === "md" ? "56px" : "40px"} className="object-cover object-top" /> : <span>{driver.name_acronym ?? driver.code}</span>}
      <div className="absolute bottom-0 h-1/3 w-full bg-black/25" />
    </div>
  );
}
