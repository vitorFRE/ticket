"use client";

import { ArrowLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";

export function MissingPage({
  title,
  body,
  imageSrc,
  backHref = "/",
  backLabel = "Eventos",
  ctaHref = "/",
  ctaLabel = "Ver eventos",
}: {
  title: string;
  body: string;
  imageSrc: string;
  backHref?: string;
  backLabel?: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className='relative z-10 min-h-[calc(100dvh-4rem)] overflow-hidden'>
      <img
        src={imageSrc}
        alt=''
        className='absolute inset-0 h-full w-full object-cover object-center'
      />
      <div className='absolute inset-0 bg-linear-to-t from-background via-background/80 to-background/25' />

      <div className='relative mx-auto flex min-h-[calc(100dvh-4rem)] max-w-6xl flex-col justify-end px-4 pb-16 pt-8 md:px-6 md:pb-20 lg:px-8'>
        <Link
          href={backHref}
          className='mb-auto inline-flex w-fit items-center gap-2 text-sm text-white/70 transition-colors hover:text-white'
        >
          <ArrowLeftIcon size={16} weight='bold' />
          {backLabel}
        </Link>

        <div className='max-w-lg'>
          <h1 className='text-4xl font-semibold tracking-[-0.04em] md:text-6xl'>
            {title}
          </h1>
          <p className='mt-4 max-w-[36ch] text-base leading-relaxed text-white/60'>
            {body}
          </p>
          <Link
            href={ctaHref}
            className='mt-8 inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-[transform,opacity] hover:opacity-90 active:scale-[0.98]'
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
