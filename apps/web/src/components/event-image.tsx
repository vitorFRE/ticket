"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const EVENT_POSTER_PLACEHOLDER = "/images/event-poster-placeholder.webp";

const OPTIMIZABLE_HOSTS = ["image.tmdb.org", "s1.ticketm.net"];

function canOptimize(src: string): boolean {
  if (src.startsWith("/")) return true;
  try {
    const hostname = new URL(src).hostname;
    return OPTIMIZABLE_HOSTS.some(
      (host) => hostname === host || hostname.endsWith(`.${host}`),
    );
  } catch {
    return false;
  }
}

type EventImageProps = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
};

export function EventImage({
  src,
  alt,
  sizes,
  className,
  imgClassName,
  priority = false,
}: EventImageProps) {
  const [loaded, setLoaded] = useState(false);
  const optimize = canOptimize(src);

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      <Image
        src={EVENT_POSTER_PLACEHOLDER}
        alt=""
        fill
        sizes={sizes}
        className="object-cover"
        aria-hidden
      />
      {optimize ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn(
            "object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
            imgClassName,
          )}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(false)}
        />
      ) : (
        <img
          src={src}
          alt={alt}
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
            imgClassName,
          )}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(false)}
        />
      )}
    </div>
  );
}
