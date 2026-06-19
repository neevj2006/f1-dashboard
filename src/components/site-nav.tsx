"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flag, Gauge, Home, Trophy, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/races", label: "Races", icon: Flag },
  { href: "/drivers", label: "Drivers", icon: Users },
  { href: "/constructors", label: "Constructors", icon: Trophy },
];

export function SiteNav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded bg-[#e10600] text-black"><Gauge size={22} /></span>
          <span className="font-black uppercase tracking-[0.22em] text-white">Apex F1</span>
        </Link>
        <div className="flex gap-1 overflow-x-auto">
          {items.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={cn("flex h-10 items-center gap-2 rounded px-3 text-sm font-semibold text-zinc-400 transition hover:bg-white/10 hover:text-white", active && "bg-white text-black hover:bg-white hover:text-black")}>
                <Icon size={16} />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
