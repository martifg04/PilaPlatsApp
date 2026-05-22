// Perfil i preferencies editables amb resum de pressupost i progres culinari.
import { Flame, ListChecks, LogOut, Save, Sparkles, Tags, WalletCards } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { PageLayout } from "../components/layout/PageLayout";
import { BudgetInsights } from "../components/shared/BudgetInsights";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { formatEuro, getDishById, weekDays } from "../data/mockData";
import { useMenu } from "../hooks/useMenu";
import { useAuthUser } from "../lib/auth";
import type { DishTag, UserPreferences } from "../types";

const restrictionOptions: DishTag[] = ["vegetarià", "vegà", "sense gluten", "sense lactosa", "sense fruits secs"];

const timeOptions: Array<{ value: UserPreferences["availableTime"]; label: string; helper: string }> = [
  { value: "short", label: "< 20 min", helper: "Sopars ràpids i plats de paella curta" },
  { value: "moderate", label: "20-40 min", helper: "Equilibri entre rapidesa i varietat" },
  { value: "long", label: "+ 40 min", helper: "Opcions més elaborades quan tens temps" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}

export function Profile() {
  const navigate = useNavigate();
  const { budgetSpent, cookingStats, currentUser, menu, preferences, remainingBudget, setPreferences, showToast } = useMenu();
  const { signOut } = useAuthUser();
  // El formulari treballa sobre un esborrany fins que l'usuari desa explicitament.
  const [draft, setDraft] = useState<UserPreferences>(preferences);
  const [saving, setSaving] = useState(false);
  const completedMeals = menu.filter((meal) => meal.completed).length;
  const totalMeals = weekDays.length * 2;
  const completionPercent = Math.round((completedMeals / totalMeals) * 100);
  const tagCounts = menu
    .flatMap((meal) => getDishById(meal.dishId).tags)
    .reduce<Record<string, number>>((counts, tag) => ({
      ...counts,
      [tag]: (counts[tag] ?? 0) + 1,
    }), {});
  // Sense restriccions declarades, el resum destaca les etiquetes mes presents al menu actual.
  const favoriteTags = preferences.restrictions.length > 0
    ? preferences.restrictions
    : Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([tag]) => tag);
  const selectedTime = timeOptions.find((option) => option.value === preferences.availableTime) ?? timeOptions[1];
  const userName = currentUser?.displayName || "Usuari";
  const userEmail = currentUser?.email || "Sessió iniciada";
  const firstName = userName.split(" ")[0] ?? "usuari";

  const toggleRestriction = (restriction: DishTag) => {
    setDraft((current) => ({
      ...current,
      restrictions: current.restrictions.includes(restriction)
        ? current.restrictions.filter((item) => item !== restriction)
        : [...current.restrictions, restriction],
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    await new Promise((resolve) => window.setTimeout(resolve, 900));
    setPreferences(draft);
    navigate("/");
  };

  const handleSignOut = () => {
    showToast("Sessió tancada", "success");
    signOut();
    navigate("/login", { replace: true });
  };

  return (
    <PageLayout title="Perfil" eyebrow={`Preferències de ${firstName}`}>
      <div className="grid w-full flex-1 gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-start">
        <aside className="space-y-4 xl:sticky xl:top-6">
          <Card className="border-primary/25 bg-primary/5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt={`Avatar de ${userName}`} className="h-20 w-20 rounded-full border border-white bg-white object-cover shadow-[var(--shadow-card)] ring-2 ring-primary/20" />
              ) : (
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-extrabold text-primary-foreground shadow-[var(--shadow-card)]" aria-hidden="true">
                  {getInitials(userName)}
                </span>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-muted-foreground">Bon dia</p>
                <h2 className="truncate text-2xl font-extrabold leading-tight">{userName}</h2>
                <p className="truncate text-sm text-muted-foreground">{userEmail}</p>
              </div>
            </div>
            <Button type="button" variant="secondary" className="mt-5 w-full" onClick={handleSignOut}>
              <LogOut aria-hidden="true" className="h-5 w-5" />
              Tanca sessió
            </Button>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <div className="rounded-[8px] bg-card px-3 py-2">
                <p className="text-xs font-bold uppercase text-muted-foreground">Àpats fets</p>
                <p className="mt-1 text-xl font-extrabold">{completedMeals}</p>
              </div>
              <div className="rounded-[8px] bg-card px-3 py-2">
                <p className="text-xs font-bold uppercase text-muted-foreground">Ratxa</p>
                <p className="mt-1 text-xl font-extrabold">{cookingStats.currentStreak} dies</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Estadístiques de cuina</p>
                <h2 className="mt-1 text-lg font-extrabold">Progrés setmanal</h2>
              </div>
              <Badge tone={completionPercent >= 50 ? "green" : "orange"}>
                <ListChecks aria-hidden="true" className="h-4 w-4" />
                {completionPercent}%
              </Badge>
            </div>
            <ProgressBar value={completedMeals} max={totalMeals} tone="primary" label={`${completedMeals} de ${totalMeals} àpats completats`} />
            <div className="mt-4 grid gap-2 text-sm">
              <div className="flex items-center justify-between rounded-[8px] bg-muted px-3 py-2">
                <span className="flex items-center gap-2 font-semibold text-muted-foreground">
                  <Flame aria-hidden="true" className="h-4 w-4 text-warning" />
                  Ratxa actual
                </span>
                <strong>{cookingStats.currentStreak} {cookingStats.currentStreak === 1 ? "dia" : "dies"}</strong>
              </div>
              <div className="flex items-center justify-between rounded-[8px] bg-muted px-3 py-2">
                <span className="flex items-center gap-2 font-semibold text-muted-foreground">
                  <WalletCards aria-hidden="true" className="h-4 w-4 text-primary" />
                  Disponible
                </span>
                <strong>{formatEuro(remainingBudget)}</strong>
              </div>
            </div>
          </Card>

          <BudgetInsights />
        </aside>

        <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Configuració activa</p>
                <h2 className="mt-1 text-lg font-extrabold">El teu pla</h2>
              </div>
              <Badge tone={budgetSpent <= preferences.budget ? "green" : "red"}>{formatEuro(budgetSpent)} / {formatEuro(preferences.budget)}</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[8px] bg-muted px-3 py-2">
                <p className="text-xs font-bold uppercase text-muted-foreground">Temps</p>
                <p className="mt-1 font-extrabold">{selectedTime.label}</p>
              </div>
              <div className="rounded-[8px] bg-muted px-3 py-2">
                <p className="text-xs font-bold uppercase text-muted-foreground">Pressupost</p>
                <p className="mt-1 font-extrabold">{formatEuro(preferences.budget)}</p>
              </div>
              <div className="rounded-[8px] bg-muted px-3 py-2">
                <p className="text-xs font-bold uppercase text-muted-foreground">Preferències</p>
                <p className="mt-1 font-extrabold">{favoriteTags.length || "Cap"}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="neutral">
                <Tags aria-hidden="true" className="h-4 w-4" />
                Etiquetes
              </Badge>
              {favoriteTags.map((tag) => (
                <Badge key={tag} tone="blue">{tag}</Badge>
              ))}
              {favoriteTags.length === 0 && <Badge tone="green">Sense restriccions</Badge>}
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <label htmlFor="budget" className="text-sm font-bold">Pressupost setmanal</label>
            <div className="mt-3 flex items-center gap-3">
              <input
                id="budget"
                type="range"
                min={25}
                max={80}
                value={draft.budget}
                onChange={(event) => setDraft((current) => ({ ...current, budget: Number(event.target.value) }))}
                className="min-h-11 flex-1 accent-primary"
              />
              <label htmlFor="budget-number" className="sr-only">Pressupost setmanal en euros</label>
              <input
                id="budget-number"
                type="number"
                min={25}
                max={80}
                value={draft.budget}
                onChange={(event) => setDraft((current) => ({ ...current, budget: Number(event.target.value) }))}
                className="h-11 w-24 rounded-[8px] border border-border bg-card px-3 font-bold"
              />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Valor actual: <strong className="text-foreground">{draft.budget} €</strong>
            </p>
          </Card>

          <Card>
            <fieldset>
              <legend className="mb-3 text-lg font-extrabold">Restriccions alimentàries</legend>
              <div className="grid gap-2">
                {restrictionOptions.map((restriction) => (
                  <label key={restriction} htmlFor={`profile-${restriction}`} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-[8px] bg-muted px-3">
                    <input
                      id={`profile-${restriction}`}
                      type="checkbox"
                      checked={draft.restrictions.includes(restriction)}
                      onChange={() => toggleRestriction(restriction)}
                      className="h-5 w-5 accent-primary"
                    />
                    <span className="font-semibold capitalize">{restriction}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </Card>

          <Card>
            <fieldset>
              <legend className="mb-3 text-lg font-extrabold">Temps de cuina màxim</legend>
              <div className="grid gap-2">
                {timeOptions.map((option) => (
                  <label key={option.value} htmlFor={`time-${option.value}`} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-[8px] border border-border bg-card px-3 py-2 hover:bg-muted">
                    <input
                      id={`time-${option.value}`}
                      name="availableTime"
                      type="radio"
                      checked={draft.availableTime === option.value}
                      onChange={() => setDraft((current) => ({ ...current, availableTime: option.value }))}
                      className="mt-1 h-5 w-5 accent-primary"
                    />
                    <span>
                      <span className="block font-semibold">{option.label}</span>
                      <span className="block text-sm text-muted-foreground">{option.helper}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </Card>

          <Button type="submit" className="w-full justify-self-end sm:w-auto sm:min-w-56 lg:col-span-2" isLoading={saving} loadingText="Desant...">
            {saving ? <Sparkles aria-hidden="true" className="h-5 w-5 animate-pulse" /> : <Save aria-hidden="true" className="h-5 w-5" />}
            Desar preferències
          </Button>
        </form>
      </div>
    </PageLayout>
  );
}
