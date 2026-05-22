// Resum visual del pressupost amb estat derivat del menu setmanal actiu.
import { AlertTriangle, CheckCircle2, CircleGauge } from "lucide-react";
import { formatEuro } from "../../data/mockData";
import { useMenu } from "../../hooks/useMenu";
import { Badge } from "../ui/Badge";
import { ProgressBar } from "../ui/ProgressBar";

export function BudgetBar() {
  const { budgetSpent, preferences, remainingBudget } = useMenu();
  const percent = (budgetSpent / preferences.budget) * 100;
  const overBudget = percent > 90;
  const nearLimit = !overBudget && percent >= 70;

  // El color i el text canvien junts per no dependre nomes d'un indicador cromatic.
  const tone = overBudget ? "red" : nearLimit ? "orange" : "green";
  const Icon = overBudget ? AlertTriangle : nearLimit ? CircleGauge : CheckCircle2;
  const label = overBudget ? "Supera el pressupost" : nearLimit ? "Proper al límit" : "Dins del pressupost";

  return (
    <section className="rounded-[10px] border border-border bg-card p-4 shadow-sm" aria-label="Pressupost setmanal">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">Pressupost setmanal</p>
          <p className="mt-1 text-2xl font-extrabold text-foreground">
            <strong>{formatEuro(budgetSpent)}</strong>{" "}
            <span className="text-base font-semibold text-muted-foreground">de {formatEuro(preferences.budget)}</span>
          </p>
        </div>
        <Badge tone={tone}>
          <Icon aria-hidden="true" className="h-4 w-4" />
          {label}
        </Badge>
      </div>
      <ProgressBar value={budgetSpent} max={preferences.budget} label={`Pressupost gastat: ${formatEuro(budgetSpent)} de ${formatEuro(preferences.budget)}`} />
      <p className="mt-2 text-sm text-muted-foreground">
        {remainingBudget < 0
          ? `T'has passat de ${formatEuro(Math.abs(remainingBudget))}`
          : `Et queden ${formatEuro(remainingBudget)} per ajustar la setmana.`}
      </p>
    </section>
  );
}
