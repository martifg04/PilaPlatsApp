// Analisi complementaria del pressupost: extrems de cost i mitjana per apat.
import { CircleGauge, TrendingDown, TrendingUp } from "lucide-react";
import { formatEuro, getDishById } from "../../data/mockData";
import { useMenu } from "../../hooks/useMenu";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";

export function BudgetInsights() {
  const { budgetSpent, menu, preferences, remainingBudget } = useMenu();
  const plannedDishes = menu.map((meal) => getDishById(meal.dishId));
  const cheapest = [...plannedDishes].sort((a, b) => a.price - b.price)[0];
  const mostExpensive = [...plannedDishes].sort((a, b) => b.price - a.price)[0];
  const averageMealCost = plannedDishes.length > 0 ? budgetSpent / plannedDishes.length : 0;
  const remainingPercent = Math.max(0, Math.min(100, (remainingBudget / preferences.budget) * 100));

  return (
    <Card>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Anàlisi intel·ligent</p>
          <h2 className="mt-1 text-lg font-extrabold text-foreground">Pressupost de la setmana</h2>
        </div>
        <Badge tone={remainingBudget >= 0 ? "green" : "red"}>
          <CircleGauge aria-hidden="true" className="h-4 w-4" />
          {Math.round(remainingPercent)}% lliure
        </Badge>
      </div>

      <ProgressBar
        value={Math.max(0, preferences.budget - Math.max(0, remainingBudget))}
        max={preferences.budget}
        label={`Pressupost usat: ${formatEuro(budgetSpent)} de ${formatEuro(preferences.budget)}`}
      />

      <div className="mt-4 grid gap-2">
        {cheapest && (
          <div className="rounded-[8px] bg-muted px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2 text-sm font-bold">
                <TrendingDown aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate">Més econòmic</span>
              </span>
              <Badge tone="green">{formatEuro(cheapest.price)}</Badge>
            </div>
            <p className="mt-1 truncate text-sm text-muted-foreground">{cheapest.name}</p>
          </div>
        )}
        {mostExpensive && (
          <div className="rounded-[8px] bg-muted px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2 text-sm font-bold">
                <TrendingUp aria-hidden="true" className="h-4 w-4 shrink-0 text-warning" />
                <span className="truncate">Més car</span>
              </span>
              <Badge tone="orange">{formatEuro(mostExpensive.price)}</Badge>
            </div>
            <p className="mt-1 truncate text-sm text-muted-foreground">{mostExpensive.name}</p>
          </div>
        )}
        <div className="flex items-center justify-between gap-3 rounded-[8px] border border-border px-3 py-2 text-sm">
          <span className="font-semibold text-muted-foreground">Cost mitjà per àpat</span>
          <strong>{formatEuro(averageMealCost)}</strong>
        </div>
      </div>
    </Card>
  );
}
