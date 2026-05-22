// Substitucio d'un apat planificat amb filtres de pressupost, temps i categoria.
import { ArrowLeft, CheckCircle2, Clock3, Euro, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { PageTransition } from "../components/layout/PageTransition";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { cn } from "../components/ui/utils";
import { dishes, formatEuro, getDishById, getMeal } from "../data/mockData";
import { useMenu } from "../hooks/useMenu";
import type { Dish, DishTag, MealCategory } from "../types";

function isMealCategory(value: string | undefined): value is MealCategory {
  return value === "dinar" || value === "sopar";
}

function matchesRestrictions(dish: Dish, restrictions: DishTag[]) {
  return restrictions.every((restriction) => restriction === "sense fruits secs" || dish.tags.includes(restriction));
}

export function SubstitutePlate() {
  const navigate = useNavigate();
  const { dayKey, category } = useParams();
  const { menu, replaceMeal, budgetSpent, preferences } = useMenu();
  const [keepBudget, setKeepBudget] = useState(true);
  const [similarTime, setSimilarTime] = useState(true);
  const [sameCategory, setSameCategory] = useState(true);
  const [selected, setSelected] = useState<Dish | null>(null);
  const [confirming, setConfirming] = useState(false);

  const validCategory = isMealCategory(category) ? category : "sopar";
  const currentMeal = dayKey ? getMeal(menu, dayKey, validCategory) : undefined;
  const currentDish = currentMeal ? getDishById(currentMeal.dishId) : undefined;

  // Els filtres es combinen abans d'ordenar per prioritzar alternatives assumibles i rapides.
  const alternatives = useMemo(() => {
    if (!currentDish) {
      return [];
    }

    return dishes
      .filter((dish) => dish.id !== currentDish.id)
      .filter((dish) => !sameCategory || dish.category === currentDish.category)
      .filter((dish) => matchesRestrictions(dish, preferences.restrictions))
      .filter((dish) => !keepBudget || dish.price <= currentDish.price + 0.35)
      .filter((dish) => !similarTime || Math.abs(dish.time - currentDish.time) <= 12 || dish.time < currentDish.time)
      .sort((a, b) => a.price - b.price || a.time - b.time)
      .slice(0, 5);
  }, [currentDish, keepBudget, preferences.restrictions, sameCategory, similarTime]);

  if (!currentDish || !currentMeal || !dayKey) {
    return (
      <PageTransition>
        <Card>
          <h1 className="text-xl font-extrabold">No he trobat aquest àpat</h1>
          <p className="mt-2 text-sm text-muted-foreground">Torna al menú setmanal i tria un plat per substituir.</p>
          <Link to="/menu" className="tap-target mt-4 inline-flex items-center justify-center rounded-[8px] bg-primary px-4 font-bold text-white">
            Tornar al menú
          </Link>
        </Card>
      </PageTransition>
    );
  }

  // La projeccio valida el canvi abans d'escriure'l al menu persistent.
  const projectedTotal = selected ? Number((budgetSpent - currentDish.price + selected.price).toFixed(2)) : budgetSpent;
  const overBudget = projectedTotal > preferences.budget;

  const confirmSelection = async () => {
    if (!selected) {
      return;
    }
    setConfirming(true);
    await new Promise((resolve) => window.setTimeout(resolve, 900));
    replaceMeal(dayKey, currentMeal.category, selected.id);
    navigate(`/menu?day=${dayKey}`);
  };

  return (
    <PageTransition>
      <header className="mb-5">
        <Link to={`/menu?day=${dayKey}`} className="tap-target mb-3 inline-flex items-center gap-2 rounded-[8px] text-sm font-bold text-muted-foreground hover:text-foreground">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Tornar
        </Link>
        <p className="text-sm font-semibold text-muted-foreground">Substituir plat</p>
        <h1 className="text-2xl font-extrabold leading-tight">Substituir {currentDish.name}</h1>
      </header>

      <div className="grid w-full flex-1 gap-4 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)] lg:items-start">
        <aside className="space-y-4 lg:sticky lg:top-6">
          <Card>
            <p className="text-sm font-semibold text-muted-foreground">Plat actual</p>
            <div className="mt-2 flex gap-3">
              <img src={currentDish.image} alt={`Foto de ${currentDish.name}`} className="h-20 w-20 rounded-[8px] object-cover" />
              <div className="min-w-0 flex-1">
                <h2 className="font-extrabold">{currentDish.name}</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge>
                    <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
                    {currentDish.time} min
                  </Badge>
                  <Badge tone="green">
                    <Euro aria-hidden="true" className="h-3.5 w-3.5" />
                    {formatEuro(currentDish.price)}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          <section aria-label="Filtres d'alternatives" className="space-y-2">
            <h2 className="text-lg font-extrabold">Filtres</h2>
            <div className="grid gap-2">
              {[
                { label: "Mantenir pressupost", checked: keepBudget, set: setKeepBudget },
                { label: "Temps similar", checked: similarTime, set: setSimilarTime },
                { label: "Mateixa categoria", checked: sameCategory, set: setSameCategory },
              ].map((filter) => (
                <label key={filter.label} className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-[8px] border border-border bg-card px-4">
                  <span className="font-semibold">{filter.label}</span>
                  <input
                    type="checkbox"
                    checked={filter.checked}
                    onChange={(event) => filter.set(event.target.checked)}
                    className="h-5 w-5 accent-primary"
                  />
                </label>
              ))}
            </div>
          </section>
        </aside>

        <div className="min-w-0 space-y-4">
          <section className="space-y-3" aria-label="Alternatives de plat">
            <h2 className="text-lg font-extrabold">Alternatives recomanades</h2>
            <div className="grid gap-3 xl:grid-cols-2">
              {alternatives.map((dish) => {
                const active = selected?.id === dish.id;
                const nextTotal = Number((budgetSpent - currentDish.price + dish.price).toFixed(2));
                const isOk = nextTotal <= preferences.budget;

                return (
                  <button
                    key={dish.id}
                    type="button"
                    onClick={() => setSelected(dish)}
                    aria-label={`Seleccionar ${dish.name} com a substitut`}
                    className={cn(
                      "w-full rounded-[10px] border bg-card text-left shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 active:scale-[0.99]",
                      active ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50",
                    )}
                  >
                    <div className="grid grid-cols-[92px_1fr]">
                      <img src={dish.image} alt={`Foto de ${dish.name}`} className="h-full min-h-[120px] w-full rounded-l-[10px] object-cover" />
                      <div className="p-3">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <h3 className="text-base font-extrabold leading-tight">{dish.name}</h3>
                          {active && <CheckCircle2 aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge>
                            <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
                            {dish.time} min
                          </Badge>
                          <Badge tone="green">{formatEuro(dish.price)}</Badge>
                          {isOk ? (
                            <Badge tone="green">
                              <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" />
                              Pressupost OK
                            </Badge>
                          ) : (
                            <Badge tone="red">Supera límit</Badge>
                          )}
                          {dish.tags.includes("sense lactosa") && <Badge tone="blue">Sense lactosa</Badge>}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {selected && (
            <Card className={overBudget ? "border-destructive bg-destructive/5" : "border-primary bg-primary/5"}>
              <h2 className="text-lg font-extrabold">Confirmar canvi</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                El pressupost quedarà a {formatEuro(projectedTotal)} / {formatEuro(preferences.budget)}.
              </p>
              {overBudget && (
                <p className="mt-2 text-sm font-semibold text-destructive">
                  Aquest canvi supera el límit. Tria una alternativa més econòmica.
                </p>
              )}
              <Button className="mt-4 w-full" disabled={overBudget} onClick={confirmSelection} isLoading={confirming} loadingText="Substituint...">
                <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
                Confirmar substitució
              </Button>
            </Card>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
