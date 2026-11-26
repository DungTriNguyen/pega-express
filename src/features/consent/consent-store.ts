"use client";

import { useSyncExternalStore } from "react";

export type ConsentState = "unknown" | "granted" | "denied";
const KEY = "pe-consent-v1";
const EVENT = "pe-consent-change";

function read(): ConsentState {
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : "unknown";
  } catch {
    return "unknown";
  }
}

export function setConsent(value: ConsentState) {
  try {
    if (value === "unknown") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, value);
  } catch {
    /* bộ nhớ bị chặn: chỉ giữ trong phiên */
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useConsent(): ConsentState | "ssr" {
  return useSyncExternalStore(subscribe, read, () => "ssr" as const);
}
