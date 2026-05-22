// Etiqueta semantica curta amb tons coherents per metadades i estats.
import type { HTMLAttributes } from "react";
import { cn } from "./utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "green" | "orange" | "red" | "neutral" | "blue";
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center gap-1 rounded-full border px-2.5 text-xs font-semibold",
        tone === "green" && "border-primary/25 bg-primary/10 text-[#1f6f40]",
        tone === "orange" && "border-accent/35 bg-accent/15 text-[#8d4700]",
        tone === "red" && "border-destructive/30 bg-destructive/10 text-destructive",
        tone === "blue" && "border-sky-600/25 bg-sky-100 text-[#0369a1]",
        tone === "neutral" && "border-border bg-muted text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
