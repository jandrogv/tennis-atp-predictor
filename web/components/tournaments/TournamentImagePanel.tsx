"use client";

import Image from "next/image";
import { useState } from "react";
import type { TournamentImageEntry } from "@/lib/tournaments/tournament-presentation";

export function TournamentImagePanel({
  src,
  alt,
  fallbackSrc,
  credit,
  priority = false,
  sizes,
  className = ""
}: {
  src: string;
  alt: string;
  fallbackSrc: string;
  credit?: TournamentImageEntry["credit"];
  priority?: boolean;
  sizes: string;
  className?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = failedSrc === src;
  return (
    <div className={`relative isolate overflow-hidden bg-[#050816] ${className}`}>
      <Image
        src={failed ? fallbackSrc : src}
        alt={failed ? "Illustration of a tennis court" : alt}
        fill
        preload={priority}
        onError={() => { if (!failed) setFailedSrc(src); }}
        sizes={sizes}
        className="object-cover transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-[1.015]"
      />
      {credit && !failed ? (
        <a
          href={credit.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Photo by ${credit.author}, ${credit.license}. Open source and license.`}
          title={`${credit.author} · ${credit.license}`}
          className="absolute bottom-3 right-3 z-10 max-w-[80%] truncate rounded-md bg-black/65 px-2 py-1 text-[11px] text-white underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300"
        >
          Photo: {credit.author}
        </a>
      ) : null}
      <div className="pointer-events-none absolute inset-0 bg-black/[0.20]" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,8,22,0)_24%,rgba(5,8,22,0.70)_72%,#050816_100%)] lg:bg-[linear-gradient(to_right,#050816_0%,rgba(5,8,22,0.96)_8%,rgba(5,8,22,0.68)_24%,rgba(5,8,22,0.18)_46%,rgba(5,8,22,0)_64%)]"
        aria-hidden="true"
      />
    </div>
  );
}
