"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny global flag: becomes true when the preloader starts revealing the page.
 * Intro animations (navbar, hero) wait for it so they play in view, not behind the loader.
 */
let ready = false;
const listeners = new Set<() => void>();

export function markIntroDone() {
  if (ready) return;
  ready = true;
  listeners.forEach((l) => l());
}

export function useIntroReady() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => ready,
    () => false
  );
}
