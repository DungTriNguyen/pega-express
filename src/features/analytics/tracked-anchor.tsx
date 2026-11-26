"use client";

import type { ComponentProps } from "react";
import { track, type TrackEvent } from "./track";

/** <a> có gắn sự kiện đo lường (gọi, Zalo, Messenger). */
export function TrackedAnchor({ event, onClick, ...rest }: ComponentProps<"a"> & { event: TrackEvent }) {
  return (
    <a
      {...rest}
      onClick={(e) => {
        track(event, { location: rest["data-location" as keyof typeof rest] as string | undefined });
        onClick?.(e);
      }}
    />
  );
}
