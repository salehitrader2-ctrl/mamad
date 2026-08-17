import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind class strings, letting a later conflicting utility
 * (e.g. a caller-supplied `bg-*`) correctly win over a component's default
 * instead of the outcome depending on Tailwind's internal generation order.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return twMerge(classes.filter(Boolean).join(" "));
}
