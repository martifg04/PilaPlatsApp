// Tauler d'inici: resumeix l'apat del dia, pressupost i accessos recurrents.
import { CalendarDays, ChefHat, Clock3, Flame, Lightbulb, ListChecks, WandSparkles } from "lucide-react";
import { Link } from "react-router";
import { PageTransition } from "../components/layout/PageTransition";
import { BudgetInsights } from "../components/shared/BudgetInsights";
import { BudgetBar } from "../components/shared/BudgetBar";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { cn } from "../components/ui/utils";
import { appLogoSrc } from "../data/appIdentity";
import { formatEuro, getDishById, getMeal, todayKey, weekDays } from "../data/mockData";
import { useMenu } from "../hooks/useMenu";

const cookingTips = [
  "Deixa els ingredients tallats abans d'encendre el foc i cuinaràs amb menys presses.",
  "Bull una mica més d'arròs o pasta i tindràs base per a un altre àpat.",
  "Guarda una llimona a mà: aixeca plats senzills sense apujar el pressupost.",
  "Revisa la llista abans de sortir i agrupa la compra per categories.",
  "Marca els passos de la recepta mentre cuines per no perdre el fil.",
  "Si vas just de temps, prioritza plats ràpids i deixa els més llargs pel cap de setmana.",
  "Una carmanyola preparada avui és una decisió menys demà.",
];

export function Home() {
  const { cookingStats, currentUser, menu, budgetSpent, preferences } = useMenu();
  const today = weekDays.find((day) => day.key === todayKey) ?? weekDays[0];
  const todayDinner = getMeal(menu, todayKey, "sopar") ?? getMeal(menu, todayKey, "dinar");
  const todayDish = todayDinner ? getDishById(todayDinner.dishId) : undefined;
  const completedMeals = menu.filter((meal) => meal.completed).length;
  const totalMeals = weekDays.length * 2;
  const dailyTip = cookingTips[new Date().getDay()] ?? cookingTips[0];
  // La mostra d'ingredients evita duplicats entre dinar i sopar per fer el resum escanejable.
  const todayIngredients = menu
    .filter((meal) => meal.dayKey === todayKey)
    .flatMap((meal) => getDishById(meal.dishId).ingredients)
    .filter((ingredient, index, list) => list.findIndex((item) => item.id === ingredient.id) === index)
    .slice(0, 3);
  const firstName = currentUser?.displayName?.split(" ")[0] ?? "usuari";
  const profileAvatarSrc = currentUser?.photoURL || appLogoSrc;

  return (
    <PageTransition>
      <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:mb-8">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Bon dia, {firstName}!</p>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-foreground md:text-3xl">
            <ChefHat aria-hidden="true" className="h-7 w-7 text-primary" />
            Pila-Plats
          </h1>
        </div>
        <Link
          to="/profile"
          aria-label={`Anar al perfil de ${firstName}`}
          className="tap-target inline-flex items-center justify-center rounded-full border border-border bg-card p-1 text-sm font-bold text-foreground shadow-sm hover:bg-muted"
        >
          <img
            src={profileAvatarSrc}
            alt=""
            className={cn(
              "rounded-full object-cover",
              currentUser?.photoURL ? "h-8 w-8" : "h-9 w-9",
            )}
          />
        </Link>
      </header>

      <div className="grid w-full flex-1 grid-cols-1 gap-4 md:gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.8fr)] 2xl:grid-cols-[minmax(0,1.8fr)_minmax(340px,0.7fr)]">
        <div className="grid min-w-0 content-start gap-4 md:grid-cols-2 md:gap-6">
          {todayDish && todayDinner && (
            <Card className={todayDinner.completed ? "overflow-hidden border-primary bg-primary/5 p-0 md:col-span-2" : "overflow-hidden p-0 md:col-span-2"}>
              <img src={todayDish.image} alt={`Foto de ${todayDish.name}`} className="h-44 w-full object-cover md:h-64 xl:h-72" />
              <div className="p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-primary">Avui · {today.label}</p>
                    <h2 className="mt-1 text-xl font-extrabold leading-tight">{todayDish.name}</h2>
                  </div>
                  {todayDinner.completed ? <Badge tone="green">✓ Completat</Badge> : <Badge tone="green">{formatEuro(todayDish.price)}</Badge>}
                </div>
                <div className="mb-4 flex flex-wrap gap-2">
                  <Badge>
                    <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
                    {todayDish.time} min
                  </Badge>
                  {todayDish.tags.includes("sense lactosa") && <Badge tone="blue">Sense lactosa</Badge>}
                  {todayDish.tags.includes("ràpid") && <Badge tone="orange">Ràpid</Badge>}
                </div>
                {todayDinner.completed ? (
                  <p className="rounded-[8px] bg-white/70 px-3 py-2 text-sm font-semibold text-muted-foreground">
                    Aquest àpat ja queda registrat dins del progrés setmanal.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Link
                      to={`/recipes/${todayDish.id}?day=${todayDinner.dayKey}&meal=${todayDinner.category}`}
                      className="tap-target inline-flex items-center justify-center gap-2 rounded-[8px] border border-primary bg-primary px-3 text-sm font-bold text-white shadow-[0_8px_18px_rgba(47,125,79,0.22)]"
                    >
                      <ChefHat aria-hidden="true" className="h-4 w-4" />
                      Veure recepta
                    </Link>
                    <Link
                      to={`/recipes/${todayDish.id}/adapt?day=${todayDinner.dayKey}&meal=${todayDinner.category}`}
                      className="tap-target inline-flex items-center justify-center gap-2 rounded-[8px] border border-border bg-card px-3 text-sm font-bold text-foreground hover:bg-muted"
                    >
                      <WandSparkles aria-hidden="true" className="h-4 w-4" />
                      Adaptar recepta
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          )}

          <BudgetBar />

          <BudgetInsights />

          <Card>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold">Progrés del menú</h2>
                <p className="text-sm text-muted-foreground">
                  {completedMeals} de {totalMeals} àpats completats aquesta setmana
                </p>
              </div>
              <Badge tone="green">{Math.round((completedMeals / totalMeals) * 100)}%</Badge>
            </div>
            <ProgressBar value={completedMeals} max={totalMeals} tone="primary" label={`${completedMeals} de ${totalMeals} àpats completats`} />
          </Card>

          <Card className="border-primary/30 bg-primary/5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Ratxa actual</p>
                <h2 className="mt-1 text-2xl font-extrabold">
                  {cookingStats.currentStreak} {cookingStats.currentStreak === 1 ? "dia" : "dies"}
                </h2>
              </div>
              <Badge tone={cookingStats.currentStreak > 0 ? "orange" : "neutral"}>
                <Flame aria-hidden="true" className="h-4 w-4" />
                Cuina seguida
              </Badge>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {cookingStats.currentStreak > 0
                ? `Has cuinat ${cookingStats.currentStreak} ${cookingStats.currentStreak === 1 ? "dia seguit" : "dies seguits"}.`
                : "Completa un àpat avui per començar una nova ratxa."}
            </p>
          </Card>

          <Card>
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-accent/15 text-warning">
                <Lightbulb aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Consell d'avui</p>
                <p className="mt-1 text-sm font-bold leading-relaxed text-foreground">{dailyTip}</p>
              </div>
            </div>
          </Card>

          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:col-span-2" aria-label="Accessos ràpids">
            <Link
              to="/menu"
              className="tap-target rounded-[10px] border border-primary bg-primary p-4 font-bold text-white shadow-[0_10px_22px_rgba(47,125,79,0.25)]"
            >
              <CalendarDays aria-hidden="true" className="mb-3 h-6 w-6" />
              Veure menú setmanal
            </Link>
            <Link
              to="/shopping"
              className="tap-target rounded-[10px] border border-border bg-card p-4 font-bold text-foreground shadow-[var(--shadow-card)] hover:bg-muted"
            >
              <ListChecks aria-hidden="true" className="mb-3 h-6 w-6 text-accent" />
              Obrir llista de la compra
            </Link>
          </section>

          <Card className="md:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold">Compra d'avui</h2>
                <p className="text-sm text-muted-foreground">Ingredients destacats per {today.label.toLowerCase()}</p>
              </div>
              <Badge tone={budgetSpent > preferences.budget ? "red" : "green"}>{formatEuro(budgetSpent)}</Badge>
            </div>
            <ul className="space-y-2">
              {todayIngredients.map((ingredient) => (
                <li key={ingredient.id} className="flex items-center justify-between gap-3 rounded-[8px] bg-muted px-3 py-2">
                  <span className="text-sm font-semibold">{ingredient.name}</span>
                  <span className="text-sm text-muted-foreground">{ingredient.amount}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="hidden content-start gap-4 lg:grid">
          <Card className="p-4">
            <h2 className="mb-3 font-bold text-foreground">Estadístiques</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pressupost:</span>
                <span className="font-semibold">{formatEuro(budgetSpent)} / {formatEuro(preferences.budget)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Disponible:</span>
                <span className="font-semibold text-primary">{formatEuro(Math.max(0, preferences.budget - budgetSpent))}</span>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 font-bold text-foreground">Dreceres ràpides</h2>
            <div className="space-y-2">
              <Link to="/menu" className="flex min-h-11 items-center gap-2 rounded-lg border border-border p-3 text-sm font-semibold transition hover:bg-muted">
                <CalendarDays aria-hidden="true" className="h-4 w-4 text-primary" />
                Menú setmanal
              </Link>
              <Link to="/shopping" className="flex min-h-11 items-center gap-2 rounded-lg border border-border p-3 text-sm font-semibold transition hover:bg-muted">
                <ListChecks aria-hidden="true" className="h-4 w-4 text-accent" />
                Llista de compra
              </Link>
              <Link to="/recipes" className="flex min-h-11 items-center gap-2 rounded-lg border border-border p-3 text-sm font-semibold transition hover:bg-muted">
                <ChefHat aria-hidden="true" className="h-4 w-4 text-orange-600" />
                Totes les receptes
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
