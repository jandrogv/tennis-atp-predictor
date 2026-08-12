"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/components/ui/utils";

const HERO_POSTER = "/assets/home-motion/hero-court-poster.webp";
const HERO_VIDEO = "/assets/home-motion/hero-court-ping-pong.mp4";

export function HeroBackgroundMedia() {
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    let disposed = false;
    let frameRequestId: number | null = null;
    let fallbackFrameId: number | null = null;
    let frameCheckPending = false;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      video.pause();
      return;
    }

    const revealVideo = () => {
      if (!disposed) {
        setIsVideoReady(true);
      }
    };

    const confirmDecodedFrame = () => {
      if (frameCheckPending || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        return;
      }
      frameCheckPending = true;

      if (typeof video.requestVideoFrameCallback === "function") {
        frameRequestId = video.requestVideoFrameCallback(() => {
          frameCheckPending = false;
          revealVideo();
        });
        return;
      }

      fallbackFrameId = window.requestAnimationFrame(() => {
        frameCheckPending = false;
        revealVideo();
      });
    };

    const keepPosterVisible = () => {
      setIsVideoReady(false);
    };

    video.addEventListener("loadeddata", confirmDecodedFrame);
    video.addEventListener("playing", confirmDecodedFrame);
    video.addEventListener("error", keepPosterVisible);

    void video.play().then(confirmDecodedFrame).catch(keepPosterVisible);

    return () => {
      disposed = true;
      if (frameRequestId !== null && typeof video.cancelVideoFrameCallback === "function") {
        video.cancelVideoFrameCallback(frameRequestId);
      }
      if (fallbackFrameId !== null) {
        window.cancelAnimationFrame(fallbackFrameId);
      }
      video.removeEventListener("loadeddata", confirmDecodedFrame);
      video.removeEventListener("playing", confirmDecodedFrame);
      video.removeEventListener("error", keepPosterVisible);
    };
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-0 bg-[#365246] bg-cover bg-[position:center_55%]"
      style={{ backgroundImage: `url(${HERO_POSTER})` }}
      aria-hidden="true"
    >
      <img
        src={HERO_POSTER}
        alt=""
        fetchPriority="high"
        decoding="sync"
        className={cn(
          "absolute inset-0 h-full w-full object-cover object-[center_55%] transition-[opacity,transform] duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none motion-reduce:transition-none",
          isVideoReady ? "scale-[1.008] opacity-0" : "scale-100 opacity-100"
        )}
      />
      <video
        ref={videoRef}
        className={cn(
          "absolute inset-0 h-full w-full object-cover object-[center_55%] opacity-0 transition-opacity duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          isVideoReady ? "opacity-100" : "opacity-0"
        )}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster={HERO_POSTER}
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>
    </div>
  );
}
