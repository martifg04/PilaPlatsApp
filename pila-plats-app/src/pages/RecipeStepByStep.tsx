// Mode de cuina guiada amb persistencia de passos, temporitzador i confirmacio final.
import confetti from "canvas-confetti";
import { CheckCircle2, ChefHat, Clock3, MoveLeft, MoveRight, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { modalMotion, PageTransition } from "../components/layout/PageTransition";
import { CookingTimer } from "../components/shared/CookingTimer";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { dishes, formatEuro } from "../data/mockData";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { useMenu } from "../hooks/useMenu";
import type { MealCategory } from "../types";

function isMealCategory(value: string | null): value is MealCategory {
  return value === "dinar" || value === "sopar";
}

function extractStepMinutes(text: string): number | null {
  // Alguns passos inclouen durada dins la instruccio i es mostren com a ajuda contextual.
  const match = text.match(/(\d+)\s*(minut|minuts|min)\b/i);
  return match ? Number(match[1]) : null;
}

export function RecipeStepByStep() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    budgetSpent,
    completeMeal,
    preferences,
    recipeProgress,
    setRecipeCurrentStep,
    setRecipeStepCompleted,
    showToast,
  } = useMenu();
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const modalRef = useFocusTrap<HTMLDivElement>(completed);

  const dish = useMemo(() => dishes.find((item) => item.id === id), [id]);
  const day = searchParams.get("day");
  const mealParam = searchParams.get("meal");
  const meal = isMealCategory(mealParam) ? mealParam : null;

  // En tornar a la recepta es repren el pas guardat, limitat al nombre actual d'instruccions.
  useEffect(() => {
    if (dish) {
      setStep(Math.min(dish.instructions.length - 1, recipeProgress[dish.id]?.currentStep ?? 0));
    }
  }, [dish?.id]);

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

  const totalSteps = dish.instructions.length;
  const completedSteps = recipeProgress[dish.id]?.completedSteps ?? [];
  const progressPercent = Math.round((completedSteps.length / totalSteps) * 100);
  const isLastStep = step === totalSteps - 1;
  const stepCompleted = completedSteps.includes(step);
  const stepMinutes = extractStepMinutes(dish.instructions[step]);

  const goToStep = (nextStep: number) => {
    const clampedStep = Math.min(totalSteps - 1, Math.max(0, nextStep));
    setStep(clampedStep);
    setRecipeCurrentStep(dish.id, clampedStep);
  };

  // Si el flux prove del menu, acabar la recepta actualitza l'apat planificat i el pressupost mostrat.
  const handleFinish = async () => {
    setFinishing(true);
    await new Promise((resolve) => window.setTimeout(resolve, 900));
    setRecipeStepCompleted(dish.id, step, true);

    if (day && meal) {
      completeMeal(day, meal, dish.id);
    } else {
      showToast("Plat completat", "success");
    }

    setCompleted(true);
    setFinishing(false);
    confetti({ particleCount: 80, spread: 65, origin: { y: 0.75 } });
  };

  return (
    <PageTransition className="pb-40">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-muted-foreground">Cuina guiada</p>
          <h1 className="text-2xl font-extrabold leading-tight text-foreground">{dish.name}</h1>
        </div>
        <Button variant="ghost" size="icon" aria-label="Sortir de la recepta" onClick={() => navigate(-1)}>
          <X aria-hidden="true" className="h-5 w-5" />
        </Button>
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5" aria-labelledby="step-title">
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-muted-foreground">Pas {step + 1} de {totalSteps}</p>
            <Badge tone={progressPercent === 100 ? "green" : "neutral"}>{progressPercent}% fet</Badge>
          </div>
          <ProgressBar
            value={completedSteps.length}
            max={totalSteps}
            tone="primary"
            label={`${completedSteps.length} de ${totalSteps} passos completats`}
          />
        </div>

        <Card className="flex min-h-[280px] flex-1 flex-col justify-center border-primary/25 bg-primary/5 text-center">
          <h2 id="step-title" className="sr-only">Instrucció del pas actual</h2>
          <p className="text-xl font-extrabold leading-relaxed text-foreground md:text-2xl">{dish.instructions[step]}</p>
          {stepMinutes && (
            <Badge tone="orange" className="mx-auto mt-5">
              <Clock3 aria-hidden="true" className="h-4 w-4" />
              {stepMinutes} min
            </Badge>
          )}
          <label htmlFor={`cook-step-${step}`} className="mx-auto mt-6 flex min-h-11 cursor-pointer items-center gap-3 rounded-full border border-border bg-card px-4 text-sm font-bold">
            <input
              id={`cook-step-${step}`}
              type="checkbox"
              checked={stepCompleted}
              onChange={(event) => setRecipeStepCompleted(dish.id, step, event.target.checked)}
              className="h-5 w-5 accent-primary"
            />
            {stepCompleted ? "Pas marcat com fet" : "Marcar aquest pas"}
          </label>
        </Card>

        <CookingTimer minutes={dish.time} compact />
      </section>

      <div className="fixed inset-x-0 bottom-[76px] z-30 mx-auto grid w-full max-w-3xl grid-cols-2 gap-2 bg-background/90 px-4 py-3 backdrop-blur md:bottom-6 md:rounded-[12px] md:border md:border-border md:shadow-[var(--shadow-card)]">
        <Button
          variant="secondary"
          disabled={step === 0 || finishing}
          onClick={() => goToStep(step - 1)}
          aria-label="Anar al pas anterior"
        >
          <MoveLeft aria-hidden="true" className="h-4 w-4" />
          Anterior
        </Button>
        {isLastStep ? (
          <Button onClick={handleFinish} isLoading={finishing} loadingText="Confirmant..." aria-label="Finalitzar la recepta">
            He acabat! <CheckCircle2 aria-hidden="true" className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            onClick={() => {
              setRecipeStepCompleted(dish.id, step, true);
              goToStep(step + 1);
            }}
            aria-label="Anar al pas següent"
          >
            Pas següent
            <MoveRight aria-hidden="true" className="h-4 w-4" />
          </Button>
        )}
      </div>

      {completed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4" role="dialog" aria-modal="true" aria-labelledby="done-title">
          <motion.div ref={modalRef} {...modalMotion} className="w-full max-w-sm">
            <Card className="border-primary text-center">
              <ChefHat aria-hidden="true" className="mx-auto h-10 w-10 text-primary" />
              <h2 id="done-title" className="mt-3 text-xl font-extrabold">Has preparat {dish.name} ✓</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Pressupost diari actualitzat: <strong className="text-foreground">{formatEuro(budgetSpent)}</strong> de {formatEuro(preferences.budget)}
              </p>
              <Button className="mt-5 w-full" onClick={() => navigate("/")}>
                Tornar a l'inici
              </Button>
            </Card>
          </motion.div>
        </div>
      )}
    </PageTransition>
  );
}
