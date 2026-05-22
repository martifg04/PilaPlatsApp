// Superficie base per agrupar contingut sense repetir vores i ombres.
import type { HTMLAttributes } from "react";
import { cn } from "./utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[10px] border border-border bg-card p-4 text-card-foreground shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-card-hover)]",
        className,
      )}
      {...props}
    />
  );
}
