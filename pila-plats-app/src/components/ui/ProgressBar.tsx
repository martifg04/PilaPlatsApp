// Barra accessible per pressupost, onboarding i seguiment de tasques.
import { cn } from "./utils";

interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  className?: string;
  tone?: "budget" | "primary";
}

export function ProgressBar({ value, max, label, className, tone = "budget" }: ProgressBarProps) {
  // Es limita l'amplada visual encara que el valor superi el maxim declarat.
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const color =
    tone === "primary"
      ? "bg-primary"
      : percent > 90
        ? "bg-budget-over"
        : percent >= 70
          ? "bg-budget-near"
          : "bg-budget-ok";

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className="h-3 overflow-hidden rounded-full border border-border bg-muted"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Number(value.toFixed(2))}
      >
        <div className={cn("h-full rounded-full transition-all duration-300", color)} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
