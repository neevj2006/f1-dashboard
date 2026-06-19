import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateWithoutYear(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function raceStatus(startTimeUtc: string) {
  const start = new Date(startTimeUtc).getTime();
  const now = Date.now();
  const end = start + 3 * 60 * 60 * 1000;
  if (now >= start && now <= end) return "Live";
  if (now > end) return "Completed";
  return "Upcoming";
}

export function daysUntil(startTimeUtc: string) {
  const diff = new Date(startTimeUtc).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}
