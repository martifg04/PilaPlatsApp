// Fusiona classes condicionals i resol conflictes de Tailwind en components reutilitzables.
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
