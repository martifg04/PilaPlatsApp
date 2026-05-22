// Detall de recepta: ingredients, temporitzador i progres abans d'entrar a la cuina guiada.
import { ArrowLeft, CheckCircle2, ChefHat, Clock3, Euro, ListChecks, Play, RotateCcw, WandSparkles } from "lucide-react";
import { useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { PageTransition } from "../components/layout/PageTransition";
import { CookingTimer } from "../components/shared/CookingTimer";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { dishes, formatEuro } from "../data/mockData";
import { useMenu } from "../hooks/useMenu";

export function RecipeDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { recipeProgress, resetRecipeProgress, setRecipeStepCompleted } = useMenu();
  const dish = useMemo(() => dishes.find((item) => item.id === id), [id]);
  const day = searchParams.get("day");
  const meal = searchParams.get("meal");
  // El context de menu es conserva a l'URL per adaptar o completar el mateix apat despres.
  const query = day && meal ? `?day=${day}&meal=${meal}` : "";

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

  const completedSteps = recipeProgress[dish.id]?.completedSteps ?? [];
  const progressPercent = Math.round((completedSteps.length / dish.instructions.length) * 100);

  return (
    <PageTransition className="pb-36">
      <Link to="/recipes" className="tap-target mb-3 inline-flex items-center gap-2 rounded-[8px] text-sm font-bold text-muted-foreground hover:text-foreground">
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Receptes
      </Link>

      <article className="mx-auto w-full max-w-5xl space-y-5">
        <Card className="overflow-hidden p-0">
          <img src={dish.image} alt={`Foto de ${dish.name}`} className="h-60 w-full object-cover md:h-[42vh] md:min-h-80" />
          <div className="p-4 md:p-6">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-primary">{dish.category === "dinar" ? "Dinar" : "Sopar"}</p>
                <h1 className="mt-1 text-2xl font-extrabold leading-tight text-foreground md:text-3xl">{dish.name}</h1>
              </div>
              <Badge tone="green">{formatEuro(dish.price)}</Badge>
            </div>
            <p className="text-sm text-muted-foreground md:text-base">{dish.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>
                <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
                {dish.time} min
              </Badge>
              <Badge tone="green">
                <Euro aria-hidden="true" className="h-3.5 w-3.5" />
                {formatEuro(dish.price)}
              </Badge>
              {dish.tags.map((tag) => (
                <Badge key={tag} tone="blue">{tag}</Badge>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
          <div className="space-y-5">
            <Card>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-lg font-extrabold">Ingredients</h2>
                <ListChecks aria-hidden="true" className="h-5 w-5 text-primary" />
              </div>
              <ul className="space-y-2">
                {dish.ingredients.map((ingredient) => (
                  <li key={ingredient.id} className="flex items-center justify-between gap-3 rounded-[8px] bg-muted px-3 py-2">
                    <span className="text-sm font-semibold">{ingredient.name}</span>
                    <span className="text-xs text-muted-foreground">{ingredient.amount}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <CookingTimer minutes={dish.time} />
          </div>

          <Card>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <ChefHat aria-hidden="true" className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-extrabold">Preparació</h2>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{completedSteps.length} de {dish.instructions.length} passos completats</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={progressPercent === 100 ? "green" : "neutral"}>{progressPercent}%</Badge>
                {completedSteps.length > 0 && (
                  <Button variant="ghost" size="icon" aria-label="Reiniciar progrés de la recepta" onClick={() => resetRecipeProgress(dish.id)}>
                    <RotateCcw aria-hidden="true" className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
            <ProgressBar
              className="mb-4"
              value={completedSteps.length}
              max={dish.instructions.length}
              tone="primary"
              label={`${completedSteps.length} de ${dish.instructions.length} passos completats`}
            />
            <ol className="space-y-3">
              {dish.instructions.map((instruction, index) => {
                const isCompleted = completedSteps.includes(index);
                return (
                  <li key={`${dish.id}-instruction-${index}`}>
                    <label htmlFor={`${dish.id}-step-${index}`} className="grid cursor-pointer grid-cols-[2rem_1fr_auto] gap-3 rounded-[8px] bg-muted p-3 transition hover:bg-primary/10">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-white">{index + 1}</span>
                      <span className="text-sm font-semibold leading-relaxed text-foreground">{instruction}</span>
                      <span className="relative inline-flex h-7 w-7 items-center justify-center self-center">
                        <input
                          id={`${dish.id}-step-${index}`}
                          type="checkbox"
                          checked={isCompleted}
                          onChange={(event) => setRecipeStepCompleted(dish.id, index, event.target.checked)}
                          className="peer h-7 w-7 appearance-none rounded-full border-2 border-border bg-card transition checked:border-primary checked:bg-primary focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        />
                        {isCompleted && <CheckCircle2 aria-hidden="true" className="check-pop pointer-events-none absolute h-5 w-5 text-white" />}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ol>
          </Card>
        </div>
      </article>

      <div className="fixed inset-x-0 bottom-[76px] z-30 mx-auto grid w-full max-w-3xl gap-2 bg-background/90 px-4 py-3 backdrop-blur sm:grid-cols-2 md:bottom-6 md:rounded-[12px] md:border md:border-border md:shadow-[var(--shadow-card)]">
        {day && meal && (
          <Link
            to={`/recipes/${dish.id}/adapt${query}`}
            className="tap-target inline-flex items-center justify-center gap-2 rounded-[8px] border border-border bg-card px-4 text-sm font-bold text-foreground hover:bg-muted"
          >
            <WandSparkles aria-hidden="true" className="h-4 w-4" />
            Adaptar recepta
          </Link>
        )}
        <Link
          to={`/recipes/${dish.id}/cook${query}`}
          className="tap-target inline-flex items-center justify-center gap-2 rounded-[8px] border border-primary bg-primary px-4 text-sm font-bold text-white shadow-[0_8px_18px_rgba(47,125,79,0.22)] hover:bg-[#256b43]"
        >
          <Play aria-hidden="true" className="h-4 w-4" />
          Cuinar ara
        </Link>
      </div>
    </PageTransition>
  );
}
