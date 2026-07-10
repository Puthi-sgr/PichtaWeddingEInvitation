import { Guest } from "../types";

export function useCurrentGuest(): Guest | null {
  if (typeof window === "undefined") return null;
  return window.__GUEST__ ?? null;
}
