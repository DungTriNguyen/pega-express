"use client";

import { createContext, useContext, type ReactNode } from "react";

/** { routeSlug: { vi: { "gui-hang-di-uc": "ship-to-australia" }, en: { "ship-to-australia": "gui-hang-di-uc" } }, … } */
export type SlugAlternates = Record<
  "routeSlug" | "serviceSlug" | "policySlug",
  Record<"vi" | "en", Record<string, string>>
>;

const empty: SlugAlternates = {
  routeSlug: { vi: {}, en: {} },
  serviceSlug: { vi: {}, en: {} },
  policySlug: { vi: {}, en: {} },
};

const Ctx = createContext<SlugAlternates>(empty);

export function SlugAlternatesProvider({ value, children }: { value: SlugAlternates; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useSlugAlternates = () => useContext(Ctx);
