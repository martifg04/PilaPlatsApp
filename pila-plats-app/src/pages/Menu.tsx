// Vista setmanal del menu amb regeneracio i accions contextuals per cada apat.
import { CalendarCheck, Eye, Shuffle, SkipForward, Utensils, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { modalMotion, PageTransition } from "../components/layout/PageTransition";
import { BudgetBar } from "../components/shared/BudgetBar";
import { MealCard, mealLabel } from "../components/shared/MealCard";
import { WeekDaySelector } from "../components/shared/WeekDaySelector";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { cn } from "../components/ui/utils";
import { formatEuro, getDishById, getMeal, todayKey, weekDays } from "../data/mockData";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { useMenu } from "../hooks/useMenu";
import type { MealCategory, MenuMeal } from "../types";

interface SelectedMeal {
  meal: MenuMeal;
  dishName: string;
}

export function Menu() {
  const { menu, regenerateMenu, isRegenerating, skipMeal, budgetSpent, preferences } = useMenu();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeDay, setActiveDay] = useState(searchParams.get("day") ?? todayKey);
  const [selectedMeal, setSelectedMeal] = useState<SelectedMeal | null>(null);
  const daySectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // El dia seleccionat es pot enllacar des d'altres fluxos com substitucio o adaptacio.
  useEffect(() => {
    const day = searchParams.get("day");
    if (day) {
      setActiveDay(day);
    }
  }, [searchParams]);

  const dayInfo = weekDays.find((day) => day.key === activeDay) ?? weekDays[0];
  const meals = useMemo(() => ({
    dinar: getMeal(menu, activeDay, "dinar"),
    sopar: getMeal(menu, activeDay, "sopar"),
  }), [activeDay, menu]);
  const weekMenu = useMemo(() => weekDays.map((day) => ({
    day,
    meals: {
      dinar: getMeal(menu, day.key, "dinar"),
      sopar: getMeal(menu, day.key, "sopar"),
    },
  })), [menu]);
  const expectedMealCount = weekDays.length * 2;
  const plannedMealCount = menu.length;

  const handleSelectDay = (dayKey: string) => {
    setActiveDay(dayKey);
    setSearchParams({ day: dayKey });
    window.setTimeout(() => {
      daySectionRefs.current[dayKey]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const openOptions = (meal: MenuMeal) => {
    setSelectedMeal({ meal, dishName: getDishById(meal.dishId).name });
  };

  // El renderer concentra estats de carrega, franges saltades i targetes normals.
  const renderMeal = (dayKey: string, category: MealCategory) => {
    if (isRegenerating) {
      return (
        <Card className="overflow-hidden p-0">
          <div className="grid animate-pulse grid-cols-[108px_1fr] sm:grid-cols-[132px_1fr] xl:grid-cols-[148px_1fr]">
            <div className="min-h-[136px] bg-muted sm:min-h-[156px]" />
            <div className="space-y-3 p-4">
              <div className="h-3 w-20 rounded-full bg-muted" />
              <div className="h-5 w-3/4 rounded-full bg-muted" />
              <div className="flex gap-2">
                <div className="h-7 w-20 rounded-full bg-muted" />
                <div className="h-7 w-24 rounded-full bg-muted" />
              </div>
              <div className="h-10 w-32 rounded-[8px] bg-muted" />
            </div>
          </div>
        </Card>
      );
    }

    const meal = getMeal(menu, dayKey, category);
    if (!meal) {
      return (
        <Card className="border-dashed bg-muted/60">
          <p className="text-sm font-semibold text-muted-foreground">{mealLabel[category]}</p>
          <h3 className="mt-1 text-lg font-bold">Àpat saltat</h3>
          <p className="mt-1 text-sm text-muted-foreground">Pots regenerar el menú per omplir aquest espai.</p>
        </Card>
      );
    }

    const dish = getDishById(meal.dishId);
    return (
      <MealCard
        dish={dish}
        meal={meal}
        label={mealLabel[category]}
        highlighted={dayKey === todayKey && category === "sopar"}
        onOptions={() => openOptions(meal)}
      />
    );
  };

  return (
    <PageTransition>
      <header className="mb-5 md:mb-8">
        <p className="text-sm font-semibold text-muted-foreground">Proposta automàtica</p>
        <div className="mt-1 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground md:text-3xl">Menú setmanal</h1>
            <p className="text-sm text-muted-foreground">{formatEuro(budgetSpent)} / {formatEuro(preferences.budget)}</p>
          </div>
          <Badge tone={budgetSpent > preferences.budget ? "red" : "green"}>
            {budgetSpent > preferences.budget ? "Revisar pressupost" : "Pressupost OK"}
          </Badge>
        </div>
      </header>

      <Card className="mb-4 border-primary/30 bg-primary/5 md:mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] bg-primary text-white">
              <CalendarCheck aria-hidden="true" className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-primary">Menú generat</p>
              <h2 className="mt-1 text-lg font-extrabold leading-tight">Setmana completa del {weekDays[0].dateLabel} al {weekDays[weekDays.length - 1].dateLabel}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {plannedMealCount} de {expectedMealCount} àpats planificats. La llista de la compra es recalcula amb tota la setmana.
              </p>
            </div>
          </div>
          <Badge tone={plannedMealCount === expectedMealCount ? "green" : "orange"}>
            {plannedMealCount === expectedMealCount ? "7 dies complets" : "Revisar buits"}
          </Badge>
        </div>
      </Card>

      <div className="grid w-full flex-1 gap-4 md:gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] xl:items-start">
        <div className="min-w-0 space-y-4 md:space-y-6">
          <WeekDaySelector activeDay={activeDay} onSelectDay={handleSelectDay} />

          <section aria-label="Menú complet de la setmana" className="space-y-4">
            {weekMenu.map(({ day, meals: dayMeals }) => {
              const selected = day.key === activeDay;
              const completeDay = Boolean(dayMeals.dinar && dayMeals.sopar);

              return (
                <section
                  key={day.key}
                  ref={(node) => {
                    daySectionRefs.current[day.key] = node;
                  }}
                  aria-label={`Àpats de ${day.label}`}
                  className={cn(
                    "scroll-mt-4 rounded-[10px] border p-3 transition sm:p-4",
                    selected ? "border-primary bg-primary/5" : "border-border/80 bg-transparent",
                  )}
                >
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">{day.dateLabel}</p>
                      <h2 className="text-xl font-extrabold md:text-2xl">{day.label}</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {day.key === todayKey && <Badge tone="orange">Avui</Badge>}
                      <Badge tone={completeDay ? "green" : "neutral"}>{completeDay ? "2 àpats" : "Incomplet"}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {renderMeal(day.key, "dinar")}
                    {renderMeal(day.key, "sopar")}
                  </div>
                </section>
              );
            })}
          </section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6">
          <BudgetBar />
          <Card>
            <p className="text-sm font-semibold text-muted-foreground">Dia seleccionat</p>
            <h2 className="mt-1 text-2xl font-extrabold">{dayInfo.label}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{dayInfo.dateLabel}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Badge tone={meals.dinar ? "green" : "neutral"}>Dinar</Badge>
              <Badge tone={meals.sopar ? "green" : "neutral"}>Sopar</Badge>
            </div>
          </Card>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-[76px] z-30 flex justify-center px-4 md:inset-x-auto md:bottom-8 md:right-6 md:w-auto">
        <Button onClick={regenerateMenu} isLoading={isRegenerating} loadingText="Generant menú..." aria-label="Regenerar menú setmanal">
          <Shuffle aria-hidden="true" className="h-5 w-5" />
          Regenerar menú
        </Button>
      </div>

      {selectedMeal && (
        <MealOptionsSheet
          selectedMeal={selectedMeal}
          onClose={() => setSelectedMeal(null)}
          onSkip={() => {
            skipMeal(selectedMeal.meal.dayKey, selectedMeal.meal.category);
            setSelectedMeal(null);
          }}
        />
      )}
    </PageTransition>
  );
}

function MealOptionsSheet({ selectedMeal, onClose, onSkip }: { selectedMeal: SelectedMeal; onClose: () => void; onSkip: () => void }) {
  const { meal, dishName } = selectedMeal;
  // El full inferior conserva focus fins que l'usuari tria una accio o el tanca.
  const sheetRef = useFocusTrap<HTMLDivElement>(true);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 px-4" role="dialog" aria-modal="true" aria-labelledby="meal-options-title">
      <motion.div ref={sheetRef} {...modalMotion} className="w-full max-w-[440px] rounded-t-[18px] border border-border bg-card p-4 shadow-[0_-16px_48px_rgba(0,0,0,0.18)]">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">{mealLabel[meal.category]}</p>
            <h2 id="meal-options-title" className="text-xl font-extrabold">{dishName}</h2>
          </div>
          <Button variant="ghost" size="icon" aria-label="Tancar opcions del plat" onClick={onClose}>
            <X aria-hidden="true" className="h-5 w-5" />
          </Button>
        </div>
        <div className="grid gap-2">
          <Link
            to={`/recipes/${meal.dishId}?day=${meal.dayKey}&meal=${meal.category}`}
            className="tap-target inline-flex items-center gap-3 rounded-[8px] border border-border px-4 font-semibold hover:bg-muted"
            onClick={onClose}
          >
            <Eye aria-hidden="true" className="h-5 w-5 text-primary" />
            Veure recepta
          </Link>
          <Link
            to={`/substitute/${meal.dayKey}/${meal.category}`}
            className="tap-target inline-flex items-center gap-3 rounded-[8px] border border-primary bg-primary px-4 font-semibold text-white"
            onClick={onClose}
          >
            <Utensils aria-hidden="true" className="h-5 w-5" />
            Substituir plat
          </Link>
          <Button variant="secondary" className="justify-start" onClick={onSkip}>
            <SkipForward aria-hidden="true" className="h-5 w-5 text-accent" />
            Saltar plat
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
