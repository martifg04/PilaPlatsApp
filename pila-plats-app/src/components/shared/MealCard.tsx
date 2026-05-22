// Targeta de plat compartida entre cataleg i menu amb estat opcional de planificacio.
import { CheckCircle2, Clock3, Euro, MoreHorizontal, Sparkles, Utensils } from "lucide-react";
import { Link } from "react-router";
import type { Dish, MealCategory, MenuMeal } from "../../types";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { cn } from "../ui/utils";

interface MealCardProps {
  dish: Dish;
  meal?: MenuMeal;
  label: string;
  highlighted?: boolean;
  onOptions?: () => void;
  compact?: boolean;
}

const mealLabel: Record<MealCategory, string> = {
  dinar: "Dinar",
  sopar: "Sopar",
};

export function MealCard({ dish, meal, label, highlighted = false, onOptions, compact = false }: MealCardProps) {
  // Un apat completat segueix sent consultable pero ja no ofereix accions de substitucio.
  const completed = Boolean(meal?.completed);

  return (
    <Card
      className={cn(
        "overflow-hidden p-0 transition-transform hover:-translate-y-0.5",
        highlighted && "border-primary bg-primary/5",
        completed && "border-primary/40 bg-[#eef8f1] text-muted-foreground",
      )}
    >
      <div className="grid grid-cols-[108px_1fr] sm:grid-cols-[132px_1fr] xl:grid-cols-[148px_1fr]">
        <img
          src={dish.image}
          alt={`Foto de ${dish.name}`}
          className={cn("h-full min-h-[136px] w-full object-cover sm:min-h-[156px]", compact && "min-h-[112px] sm:min-h-[132px]", completed && "opacity-80")}
          loading="lazy"
        />
        <div className="flex min-w-0 flex-col p-3 sm:p-4">
          <div className="mb-1 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
              <h3 className={cn("mt-1 text-base font-bold leading-snug text-foreground", completed && "text-muted-foreground")}>{dish.name}</h3>
            </div>
            {onOptions && !completed && (
              <Button aria-label={`Obrir opcions per ${dish.name}`} variant="ghost" size="icon" onClick={onOptions} className="shrink-0">
                <MoreHorizontal aria-hidden="true" className="h-5 w-5" />
              </Button>
            )}
            {completed && <CheckCircle2 aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />}
          </div>
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge tone="neutral">
              <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
              {dish.time} min
            </Badge>
            <Badge tone="green">
              <Euro aria-hidden="true" className="h-3.5 w-3.5" />
              {dish.price.toFixed(2).replace(".", ",")} €
            </Badge>
            {meal?.substituted && <Badge tone="orange">Canviat</Badge>}
            {dish.tags.includes("sense lactosa") && <Badge tone="blue">Sense lactosa</Badge>}
          </div>
          <div className="mt-auto flex items-center justify-between gap-2">
            <Link
              to={`/recipes/${dish.id}${meal ? `?day=${meal.dayKey}&meal=${meal.category}` : ""}`}
              className="tap-target inline-flex items-center justify-center gap-2 rounded-[8px] border border-border px-3 text-sm font-semibold text-foreground hover:bg-muted"
            >
              <Utensils aria-hidden="true" className="h-4 w-4" />
              Veure recepta
            </Link>
            {completed && (
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                <Sparkles aria-hidden="true" className="h-4 w-4" />
                Completat
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export { mealLabel };
