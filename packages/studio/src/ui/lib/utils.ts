import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "—"
  if (value instanceof Date) return value.toISOString()
  if (typeof value === "object") return JSON.stringify(value, null, 2)
  return String(value)
}
