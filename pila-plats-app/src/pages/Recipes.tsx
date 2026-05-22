// Cataleg navegable de receptes amb cerca textual i filtres de categoria o cost.
import { Clock3, Euro, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { PageLayout } from "../components/layout/PageLayout";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { cn } from "../components/ui/utils";
import { dishes, formatEuro } from "../data/mockData";

type RecipeFilter = "tots" | "dinar" | "sopar" | "rapid" | "economic";

const filters: Array<{ key: RecipeFilter; label: string }> = [
  { key: "tots", label: "Tots" },
  { key: "dinar", label: "Dinar" },
  { key: "sopar", label: "Sopar" },
  { key: "rapid", label: "Ràpid" },
  { key: "economic", label: "Econòmic" },
];

export function Recipes() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<RecipeFilter>("tots");

  // La cerca usa locale catala per tractar noms, descripcions i etiquetes de forma coherent.
  const filtered = useMemo(() => {
    return dishes
      .filter((dish) => filter !== "dinar" || dish.category === "dinar")
      .filter((dish) => filter !== "sopar" || dish.category === "sopar")
      .filter((dish) => filter !== "rapid" || dish.time <= 20 || dish.tags.includes("ràpid"))
      .filter((dish) => filter !== "economic" || dish.tags.includes("econòmic") || dish.price <= 2.2)
      .filter((dish) => {
        const haystack = `${dish.name} ${dish.description} ${dish.tags.join(" ")}`.toLocaleLowerCase("ca");
        return haystack.includes(query.toLocaleLowerCase("ca"));
      });
  }, [filter, query]);

  return (
    <PageLayout title="Catàleg de plats" eyebrow="Receptes">
      <div className="flex w-full flex-1 flex-col gap-4">
        <Card>
          <label htmlFor="recipe-search" className="text-sm font-bold">Cerca receptes</label>
          <div className="mt-2 flex items-center gap-2 rounded-[8px] border border-border bg-muted px-3">
            <Search aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
            <input
              id="recipe-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="pasta, ràpid, sense lactosa..."
              className="min-h-11 flex-1 bg-transparent text-sm outline-none"
            />
          </div>
        </Card>

        <section aria-label="Filtres de receptes" className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((item) => (
              <button
                key={item.key}
                type="button"
                aria-pressed={filter === item.key}
                onClick={() => setFilter(item.key)}
                className={cn(
                  "tap-target rounded-full border px-4 text-sm font-bold",
                  filter === item.key ? "border-primary bg-primary text-white" : "border-border bg-card text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <Badge tone="neutral">{filtered.length} plats trobats</Badge>
        </section>

        <section className="grid grid-cols-2 gap-3 md:gap-5 xl:grid-cols-3" aria-label="Resultats de receptes">
          {filtered.length === 0 && (
            <Card className="col-span-2 border-dashed bg-muted/60 text-center xl:col-span-3">
              <Search aria-hidden="true" className="mx-auto h-9 w-9 text-primary" />
              <h2 className="mt-3 text-lg font-extrabold">Cap recepta trobada</h2>
              <p className="mt-1 text-sm text-muted-foreground">Prova una cerca més general o canvia el filtre actiu.</p>
            </Card>
          )}
          {filtered.map((dish) => (
            <Link
              key={dish.id}
              to={`/recipes/${dish.id}`}
              aria-label={`Obrir recepta ${dish.name}`}
              className="group overflow-hidden rounded-[10px] border border-border bg-card shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]"
            >
              <img src={dish.image} alt={`Foto de ${dish.name}`} className="aspect-[4/3] w-full object-cover" loading="lazy" />
              <div className="p-3">
                <Badge tone={dish.category === "dinar" ? "green" : "blue"}>{dish.category === "dinar" ? "Dinar" : "Sopar"}</Badge>
                <h2 className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm font-extrabold leading-tight text-foreground md:text-base">{dish.name}</h2>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge>
                    <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
                    {dish.time} min
                  </Badge>
                  <Badge tone="green">
                    <Euro aria-hidden="true" className="h-3.5 w-3.5" />
                    {formatEuro(dish.price)}
                  </Badge>
                </div>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </PageLayout>
  );
}
