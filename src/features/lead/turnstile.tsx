"use client";

import { useEffect, useRef } from "react";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
    __peTurnstileLoading?: Promise<void>;
  }
}

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!window.__peTurnstileLoading) {
    window.__peTurnstileLoading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("turnstile load failed"));
      document.head.appendChild(s);
    });
  }
  return window.__peTurnstileLoading;
}

/** Widget Turnstile — chỉ tải script khi form xuất hiện (không làm chậm trang). */
export function Turnstile({
  siteKey,
  onToken,
  resetSignal,
  language,
}: {
  siteKey: string;
  onToken: (token: string) => void;
  resetSignal: number;
  language: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const cb = useRef(onToken);
  useEffect(() => {
    cb.current = onToken;
  });

  useEffect(() => {
    let cancelled = false;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        loadScript()
          .then(() => {
            if (cancelled || !window.turnstile || widgetId.current) return;
            widgetId.current = window.turnstile.render(el, {
              sitekey: siteKey,
              language,
              theme: "auto",
              callback: (t: string) => cb.current(t),
              "expired-callback": () => cb.current(""),
              "error-callback": () => cb.current(""),
            });
          })
          .catch(() => cb.current(""));
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = undefined;
    };
  }, [siteKey, language]);

  useEffect(() => {
    if (resetSignal && widgetId.current) window.turnstile?.reset(widgetId.current);
  }, [resetSignal]);

  return <div ref={ref} className="min-h-[65px]" />;
}
