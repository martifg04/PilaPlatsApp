// Configuracio inicial en tres passos per generar la primera setmana personalitzada.
import { CheckCircle2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useMenu } from "../hooks/useMenu";
import type { DishTag, UserPreferences } from "../types";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { cn } from "../components/ui/utils";
import { appLogoSrc } from "../data/appIdentity";

const restrictions: DishTag[] = ["vegetarià", "vegà", "sense gluten", "sense lactosa", "sense fruits secs"];

export function Onboarding() {
  const navigate = useNavigate();
  const { finishOnboarding } = useMenu();
  const [step, setStep] = useState(0);
  const [budget, setBudget] = useState(35);
  const [selectedRestrictions, setSelectedRestrictions] = useState<DishTag[]>(["sense lactosa"]);
  const [availableTime, setAvailableTime] = useState<UserPreferences["availableTime"]>("moderate");
  const [loading, setLoading] = useState(false);

  const toggleRestriction = (restriction: DishTag) => {
    setSelectedRestrictions((current) =>
      current.includes(restriction) ? current.filter((item) => item !== restriction) : [...current, restriction],
    );
  };

  // El pas final crea preferencies definitives i reinicia els derivats del menu des del context.
  const finish = async () => {
    setLoading(true);
    await new Promise((resolve) => window.setTimeout(resolve, 900));
    finishOnboarding({ budget, restrictions: selectedRestrictions, availableTime });
    navigate("/");
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex min-h-dvh w-full p-4 sm:p-6 lg:p-8"
    >
      <Card className="grid min-h-[calc(100dvh-2rem)] w-full overflow-hidden p-0 sm:min-h-[calc(100dvh-3rem)] lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
        <section className="flex flex-col justify-between gap-6 border-b border-border bg-primary/10 p-5 sm:p-6 lg:border-b-0 lg:border-r lg:p-8">
        <div>
          <img src={appLogoSrc} alt="Logotip de Pila-Plats" className="mb-5 h-16 w-16 rounded-[14px] border border-white/70 bg-white object-cover shadow-[var(--shadow-card)]" />
          <Badge tone="green">Pas {step + 1} de 3</Badge>
          <h1 className="mt-3 text-2xl font-extrabold">Configurem Pila-Plats</h1>
          <p className="mt-1 text-sm text-muted-foreground">Tres decisions ràpides i tens una proposta de setmana.</p>
        </div>
        </section>

        <section className="flex min-w-0 flex-1 flex-col p-5 sm:p-6 lg:p-8">
        <ProgressBar value={step + 1} max={3} tone="primary" label={`Progrés de configuració: pas ${step + 1} de 3`} />

        <div className="mt-6 min-h-[280px] flex-1">
          {step === 0 && (
            <section>
              <h2 className="text-xl font-extrabold">Quant vols gastar a la setmana?</h2>
              <p className="mt-1 text-sm text-muted-foreground">Incloent tots els àpats de dilluns a diumenge.</p>
              <label htmlFor="onboarding-budget" className="mt-6 block text-sm font-bold">Pressupost setmanal</label>
              <div className="mt-3 flex items-center gap-3">
                <input
                  id="onboarding-budget"
                  type="range"
                  min={25}
                  max={80}
                  value={budget}
                  onChange={(event) => setBudget(Number(event.target.value))}
                  className="min-h-11 flex-1 accent-primary"
                />
                <label htmlFor="onboarding-budget-number" className="sr-only">Pressupost en euros</label>
                <input
                  id="onboarding-budget-number"
                  type="number"
                  min={25}
                  max={80}
                  value={budget}
                  onChange={(event) => setBudget(Number(event.target.value))}
                  className="h-11 w-20 rounded-[8px] border border-border bg-card px-3 font-bold"
                />
              </div>
            </section>
          )}

          {step === 1 && (
            <section>
              <h2 className="text-xl font-extrabold">Tens alguna restricció?</h2>
              <p className="mt-1 text-sm text-muted-foreground">Pots triar-ne més d'una.</p>
              <div className="mt-5 grid gap-2">
                {restrictions.map((restriction) => (
                  <label key={restriction} htmlFor={`onboarding-${restriction}`} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-[8px] bg-muted px-3">
                    <input
                      id={`onboarding-${restriction}`}
                      type="checkbox"
                      checked={selectedRestrictions.includes(restriction)}
                      onChange={() => toggleRestriction(restriction)}
                      className="h-5 w-5 accent-primary"
                    />
                    <span className="font-semibold capitalize">{restriction}</span>
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedRestrictions([])}
                  className={cn("tap-target rounded-[8px] border px-3 text-left font-semibold", selectedRestrictions.length === 0 ? "border-primary bg-primary text-white" : "border-border bg-card")}
                >
                  Cap restricció
                </button>
              </div>
            </section>
          )}

          {step === 2 && (
            <section>
              <h2 className="text-xl font-extrabold">Quant temps tens normalment?</h2>
              <p className="mt-1 text-sm text-muted-foreground">Ajustarem els plats perquè encaixin amb el teu ritme.</p>
              <div className="mt-5 grid gap-2">
                {[
                  { key: "short", label: "Poc temps", description: "< 20 min" },
                  { key: "moderate", label: "Temps moderat", description: "20-40 min" },
                  { key: "long", label: "Tinc temps", description: "> 40 min" },
                ].map((option) => (
                  <button
                    type="button"
                    key={option.key}
                    aria-pressed={availableTime === option.key}
                    onClick={() => setAvailableTime(option.key as UserPreferences["availableTime"])}
                    className={cn(
                      "tap-target flex items-center justify-between rounded-[8px] border px-3 text-left",
                      availableTime === option.key ? "border-primary bg-primary text-white" : "border-border bg-card",
                    )}
                  >
                    <span className="font-bold">{option.label}</span>
                    <span className="text-sm opacity-80">{option.description}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button variant="secondary" disabled={step === 0 || loading} onClick={() => setStep((value) => Math.max(0, value - 1))}>
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            Anterior
          </Button>
          {step < 2 ? (
            <Button onClick={() => setStep((value) => Math.min(2, value + 1))}>
              Següent
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={finish} isLoading={loading} loadingText="Generant...">
              {loading ? <Sparkles aria-hidden="true" className="h-5 w-5 animate-pulse" /> : <CheckCircle2 aria-hidden="true" className="h-5 w-5" />}
              Generar el meu menú
            </Button>
          )}
        </div>
        </section>
      </Card>
    </motion.main>
  );
}
