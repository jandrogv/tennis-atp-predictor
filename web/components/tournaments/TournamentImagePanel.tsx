import Image from "next/image";

export function TournamentImagePanel({
  src,
  alt,
  priority = false,
  sizes,
  className = ""
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes: string;
  className?: string;
}) {
  return (
    <div className={`relative isolate overflow-hidden bg-[#050816] ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-[1.015]"
      />
      <div className="pointer-events-none absolute inset-0 bg-black/[0.20]" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,8,22,0)_24%,rgba(5,8,22,0.70)_72%,#050816_100%)] lg:bg-[linear-gradient(to_right,#050816_0%,rgba(5,8,22,0.96)_8%,rgba(5,8,22,0.68)_24%,rgba(5,8,22,0.18)_46%,rgba(5,8,22,0)_64%)]"
        aria-hidden="true"
      />
    </div>
  );
}
