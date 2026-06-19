import Image from "next/image";
import { cn } from "@/lib/utils";

export function CircuitPreview({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid min-h-64 place-items-center overflow-hidden rounded-lg border border-white/10 bg-zinc-950 p-6",
        className,
      )}
    >
      <div className="relative h-full min-h-52 w-full">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 620px"
          className="object-contain"
        />
      </div>
    </div>
  );
}
