// Adaptacio d'una recepta segons ingredients disponibles, restriccions i context del menu.
import { ArrowLeft, CheckCircle2, Clock3, LoaderCircle, SearchCheck, WandSparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { PageTransition } from "../components/layout/PageTransition";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { cn } from "../components/ui/utils";
import { dishes, formatEuro, getMeal, weekDays } from "../data/mockData";
import { useMenu } from "../hooks/useMenu";
import type { Dish, DishTag, MealCategory } from "../types";

function isMealCategory(value: string | null): value is MealCategory {
  return value === "dinar" || value === "sopar";
}

function timeLimitForPreference(availableTime: "short" | "moderate" | "long") {
  if (availableTime === "short") {
    return 20;
  }
  if (availableTime === "moderate") {
    return 40;
  }
  return Number.POSITIVE_INFINITY;
}

function matchesRestriction(dish: Dish, restriction: DishTag) {
  return restriction === "sense fruits secs" || dish.tags.includes(restriction);
}

function prettyRestriction(restriction: DishTag) {
  return restriction.charAt(0).toUpperCase() + restriction.slice(1);
}

export function AdaptRecipe() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { menu, preferences, replaceMeal } = useMenu();
  const dish = useMemo(() => dishes.find((item) => item.id === id), [id]);
  const [availability, setAvailability] = useState<Record<string, boolean>>(() => {
    const next: Record<string, boolean> = {};
    dish?.ingredients.forEach((ingredient) => {
      next[ingredient.id] = true;
    });
    return next;
  });
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!dish) {
    return (
      <PageTransition>
        <Card>
          <h1 className="text-xl font-extrabold">Recepta no trobada</h1>
          <Link to="/recipes" className="tap-target mt-4 inline-flex items-center rounded-[8px] bg-primary px-4 font-bold text-white">
            Tornar al catàleg
          </Link>
        </Card>
      </PageTransition>
    );
  }

  const day = searchParams.get("day");
  const mealParam = searchParams.get("meal");
  const meal = isMealCategory(mealParam) ? mealParam : null;
  const currentMenuMeal = day && meal ? getMeal(menu, day, meal) : undefined;
  const hasMenuContext = Boolean(day && meal && currentMenuMeal?.dishId === dish.id);
  const query = day && meal ? `?day=${day}&meal=${meal}` : "";
  const missing = dish.ingredients.filter((ingredient) => !availability[ingredient.id]);
  const maxTime = timeLimitForPreference(preferences.availableTime);
  const dayLabel = weekDays.find((item) => item.key === day)?.label.toLowerCase();
  const mealText = meal === "dinar" ? "dinar" : "sopar";

  // La primera passada respecta preferencies i temps disponible abans d'oferir resultats.
  const alternatives = dishes
    .filter((candidate) => candidate.id !== dish.id)
    .filter((candidate) => candidate.category === dish.category)
    .filter((candidate) => missing.every((ingredient) => !candidate.ingredients.some((item) => item.id === ingredient.id)))
    .filter((candidate) => preferences.restrictions.every((restriction) => matchesRestriction(candidate, restriction)))
    .filter((candidate) => candidate.time <= maxTime)
    .sort((a, b) => a.time - b.time || a.price - b.price)
    .slice(0, 3);

  // El fallback relaxa preferencies si no hi ha prou alternatives compatibles amb els ingredients presents.
  const fallbackAlternatives = alternatives.length >= 3
    ? alternatives
    : dishes
      .filter((candidate) => candidate.id !== dish.id)
      .filter((candidate) => candidate.category === dish.category)
      .filter((candidate) => missing.every((ingredient) => !candidate.ingredients.some((item) => item.id === ingredient.id)))
      .sort((a, b) => a.time - b.time || a.price - b.price)
      .slice(0, 3);

  const visibleAlternatives = alternatives.length > 0 ? alternatives : fallbackAlternatives;

  const toggleIngredient = (ingredientId: string, checked: boolean) => {
    setAvailability((current) => ({ ...current, [ingredientId]: checked }));
    setSearched(false);
  };

  // L'accio primaria decideix si cal cercar alternatives o continuar amb la recepta original.
  const handlePrimaryAction = async () => {
    if (missing.length === 0) {
      if (hasMenuContext && day) {
        navigate(`/menu?day=${day}`);
        return;
      }

      navigate(`/recipes/${dish.id}/cook`);
      return;
    }

    setLoading(true);
    await new Promise((resolve) => window.setTimeout(resolve, 1500));
    setSearched(true);
    setLoading(false);
  };

  // En context de menu la seleccio substitueix l'apat; fora d'aquest context entra directament a cuinar.
  const handleAlternativeSelected = (candidate: Dish) => {
    if (hasMenuContext && day && meal) {
      const toastText = dayLabel
        ? `El ${mealText} de ${dayLabel} s'ha actualitzat`
        : "Plat adaptat al menú";

      replaceMeal(day, meal, candidate.id, toastText);
      navigate(`/menu?day=${day}`);
      return;
    }

    navigate(`/recipes/${candidate.id}/cook`);
  };

  return (
    <PageTransition>
      <Link to={`/recipes/${dish.id}${query}`} className="tap-target mb-3 inline-flex items-center gap-2 rounded-[8px] text-sm font-bold text-muted-foreground hover:text-foreground">
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Recepta
      </Link>

      <header className="mb-5">
        <p className="text-sm font-semibold text-primary">Adaptar recepta</p>
        <h1 className="text-2xl font-extrabold leading-tight">Adaptar {dish.name}</h1>
        {hasMenuContext && (
          <p className="mt-2 text-sm text-muted-foreground">
            Tria una alternativa i actualitzarem aquest plat dins del menú setmanal.
          </p>
        )}
      </header>

      <div className="grid w-full flex-1 gap-4 lg:grid-cols-[minmax(280px,420px)_minmax(0,1fr)] lg:items-start">
        <Card className={cn("lg:sticky lg:top-6", !searched && "lg:col-span-2")}>
          <h2 className="mb-3 text-lg font-extrabold">Ingredients necessaris</h2>
          <ul className="space-y-2">
            {dish.ingredients.map((ingredient) => {
              const available = availability[ingredient.id];
              return (
                <li key={ingredient.id}>
                  <label htmlFor={`available-${ingredient.id}`} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-[8px] bg-muted px-3">
                    <input
                      id={`available-${ingredient.id}`}
                      type="checkbox"
                      checked={available}
                      onChange={(event) => toggleIngredient(ingredient.id, event.target.checked)}
                      className="h-5 w-5 accent-primary"
                    />
                    <span className="min-w-0 flex-1 text-sm font-semibold">{ingredient.name}</span>
                    {!available && <Badge tone="red">Falta</Badge>}
                  </label>
                </li>
              );
            })}
          </ul>
          <Button className="mt-4 w-full" onClick={handlePrimaryAction} isLoading={loading} loadingText="Buscant alternatives...">
            {missing.length > 0 ? (
              <>
                <SearchCheck aria-hidden="true" className="h-5 w-5" />
                Trobar alternatives
              </>
            ) : (
              <>
                <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
                Veure recepta original
              </>
            )}
          </Button>
        </Card>

        {loading && (
          <Card className="flex min-h-44 items-center justify-center text-center">
            <div>
              <LoaderCircle aria-hidden="true" className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-3 text-sm font-bold text-muted-foreground">Buscant alternatives...</p>
            </div>
          </Card>
        )}

        {searched && !loading && (
          <section className="space-y-3" aria-label="Alternatives amb ingredients disponibles">
            <div className="rounded-[10px] border border-primary bg-primary/10 p-3">
              <p className="flex items-center gap-2 text-sm font-bold text-primary">
                <WandSparkles aria-hidden="true" className="h-4 w-4" />
                Alternatives amb el que tens a casa
              </p>
            </div>
            {visibleAlternatives.map((candidate) => {
              const matchedRestriction = preferences.restrictions.find((restriction) => matchesRestriction(candidate, restriction));
              return (
                <button
                  type="button"
                  key={candidate.id}
                  onClick={() => handleAlternativeSelected(candidate)}
                  aria-label={hasMenuContext ? `Actualitzar el menú amb ${candidate.name}` : `Cuinar alternativa ${candidate.name}`}
                  className="w-full rounded-[10px] border border-border bg-card p-3 text-left shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-extrabold">{candidate.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{candidate.description}</p>
                    </div>
                    <Badge tone={candidate.time <= 15 ? "green" : "orange"}>
                      <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
                      {candidate.time} min
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge tone="green">{formatEuro(candidate.price)}</Badge>
                    {matchedRestriction && <Badge tone="blue">{prettyRestriction(matchedRestriction)} ✓</Badge>}
                    <Badge tone="neutral">Sense {missing.map((item) => item.name.toLowerCase()).join(", ")}</Badge>
                    {hasMenuContext && <Badge tone="orange">Actualitza menú</Badge>}
                  </div>
                </button>
              );
            })}
          </section>
        )}
      </div>
    </PageTransition>
  );
}
