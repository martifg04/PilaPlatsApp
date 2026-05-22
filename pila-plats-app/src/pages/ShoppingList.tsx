// Llista de compra derivada del menu, agrupada per seccions i preparada per compartir.
import confetti from "canvas-confetti";
import { Check, CheckCheck, ChevronDown, ChevronRight, ClipboardList, RotateCcw, Share2, ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatEuro, weekDays } from "../data/mockData";
import { useMenu } from "../hooks/useMenu";
import type { IngredientCategory } from "../types";
import { PageLayout } from "../components/layout/PageLayout";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { cn } from "../components/ui/utils";

export function ShoppingList() {
  const {
    budgetSpent,
    checkedShoppingIds,
    markAllShoppingItems,
    resetShoppingList,
    shoppingGroups,
    showToast,
    toggleShoppingItem,
  } = useMenu();
  const [expanded, setExpanded] = useState<Record<IngredientCategory, boolean>>({
    Verdures: true,
    Proteïnes: true,
    Bàsics: true,
    Làctics: true,
    Fruita: true,
    Altres: true,
  });
  const celebratedRef = useRef(false);

  const itemCount = shoppingGroups.reduce((count, group) => count + group.items.length, 0);
  const checkedCount = checkedShoppingIds.filter((id) => shoppingGroups.some((group) => group.items.some((item) => item.id === id))).length;
  const remainingCount = Math.max(0, itemCount - checkedCount);
  // El text pla serveix tant per porta-retalls com per la Web Share API.
  const shoppingText = useMemo(() => {
    const lines = [
      "Pila-Plats - Llista de la compra",
      `Setmana ${weekDays[0].dateLabel} - ${weekDays[weekDays.length - 1].dateLabel}`,
      `Total estimat: ${formatEuro(budgetSpent)}`,
      `Progrés: ${checkedCount}/${itemCount} productes`,
      "",
    ];

    shoppingGroups.forEach((group) => {
      lines.push(group.category);
      group.items.forEach((item) => {
        lines.push(`${checkedShoppingIds.includes(item.id) ? "[x]" : "[ ]"} ${item.name} - ${item.amount} (${formatEuro(item.estimatedPrice)})`);
      });
      lines.push("");
    });

    return lines.join("\n").trim();
  }, [budgetSpent, checkedCount, checkedShoppingIds, itemCount, shoppingGroups]);

  // La celebracio s'executa una sola vegada mentre la llista roman completada.
  useEffect(() => {
    if (itemCount > 0 && checkedCount === itemCount && !celebratedRef.current) {
      celebratedRef.current = true;
      confetti({ particleCount: 65, spread: 62, origin: { y: 0.78 } });
      showToast("Compra completada. Tot a punt per cuinar!", "success");
    }

    if (checkedCount < itemCount) {
      celebratedRef.current = false;
    }
  }, [checkedCount, itemCount, showToast]);

  const copyShoppingList = async () => {
    try {
      await navigator.clipboard.writeText(shoppingText);
      showToast("Llista copiada al porta-retalls", "success");
    } catch {
      showToast("No s'ha pogut copiar la llista", "danger");
    }
  };

  const shareShoppingList = async () => {
    const shareApi = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };

    if (typeof shareApi.share !== "function") {
      await copyShoppingList();
      return;
    }

    try {
      await shareApi.share({
        title: "Llista de la compra Pila-Plats",
        text: shoppingText,
      });
      showToast("Llista compartida", "success");
    } catch {
      showToast("Compartició cancel·lada", "warning");
    }
  };

  return (
    <PageLayout
      title="Llista de la compra"
      eyebrow="Generada automàticament"
      action={<Badge tone="green">Setmana {weekDays[0].dateLabel} - {weekDays[weekDays.length - 1].dateLabel}</Badge>}
    >
      <div className="grid w-full flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-start">
        <aside className="space-y-4 lg:sticky lg:top-6 lg:order-2">
          <Card className="lg:sticky lg:top-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Progrés de compra</p>
                <p className="mt-1 text-2xl font-extrabold">{checkedCount}/{itemCount}</p>
              </div>
              <Badge tone={remainingCount === 0 ? "green" : "blue"}>
                <ShoppingCart aria-hidden="true" className="h-4 w-4" />
                {remainingCount === 0 ? "Completada" : `${remainingCount} pendents`}
              </Badge>
            </div>
            <ProgressBar
              className="mt-4"
              value={checkedCount}
              max={Math.max(1, itemCount)}
              tone="primary"
              label={`${checkedCount} de ${itemCount} productes completats`}
            />
            <div className="mt-4 rounded-[8px] bg-muted px-3 py-2">
              <p className="text-xs font-bold uppercase text-muted-foreground">Total estimat</p>
              <p className="mt-1 text-xl font-extrabold">{formatEuro(budgetSpent)}</p>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-2">
            <Button className="col-span-2 w-full" onClick={copyShoppingList}>
              <ClipboardList aria-hidden="true" className="h-5 w-5" />
              Copiar llista
            </Button>
            <Button variant="secondary" onClick={shareShoppingList}>
              <Share2 aria-hidden="true" className="h-5 w-5" />
              Compartir
            </Button>
            <Button variant="secondary" onClick={markAllShoppingItems} disabled={itemCount === 0 || checkedCount === itemCount}>
              <CheckCheck aria-hidden="true" className="h-5 w-5" />
              Tot fet
            </Button>
            <Button variant="ghost" className="col-span-2" onClick={resetShoppingList} disabled={checkedCount === 0}>
              <RotateCcw aria-hidden="true" className="h-5 w-5" />
              Reiniciar llista
            </Button>
          </div>
        </aside>

        <div className="space-y-3 lg:order-1">
          {shoppingGroups.length === 0 && (
            <Card className="border-dashed bg-muted/60 text-center">
              <ShoppingCart aria-hidden="true" className="mx-auto h-9 w-9 text-primary" />
              <h2 className="mt-3 text-lg font-extrabold">Encara no hi ha productes</h2>
              <p className="mt-1 text-sm text-muted-foreground">Regenera o completa el menú setmanal per crear una llista automàtica.</p>
            </Card>
          )}

          {shoppingGroups.map((group) => {
            const isOpen = expanded[group.category];
            const groupTotal = group.items.reduce((total, item) => total + item.estimatedPrice, 0);
            const groupChecked = group.items.filter((item) => checkedShoppingIds.includes(item.id)).length;
            return (
              <section key={group.category} className="rounded-[10px] border border-border bg-card shadow-[var(--shadow-card)]">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setExpanded((current) => ({ ...current, [group.category]: !isOpen }))}
                  className="tap-target flex w-full items-center justify-between gap-3 rounded-[10px] px-4 py-3 text-left"
                >
                  <span className="flex items-center gap-2 font-extrabold">
                    {isOpen ? <ChevronDown aria-hidden="true" className="h-5 w-5 text-primary" /> : <ChevronRight aria-hidden="true" className="h-5 w-5 text-primary" />}
                    {group.category}
                  </span>
                  <span className="flex items-center gap-2">
                    <Badge tone={groupChecked === group.items.length ? "green" : "neutral"}>{groupChecked}/{group.items.length}</Badge>
                    <span className="text-sm font-semibold text-muted-foreground">{formatEuro(groupTotal)}</span>
                  </span>
                </button>
                {isOpen && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="border-t border-border px-4 py-2">
                    {group.items.map((item) => {
                      const checked = checkedShoppingIds.includes(item.id);
                      return (
                        <label
                          key={item.id}
                          htmlFor={item.id}
                          className={cn(
                            "flex min-h-12 cursor-pointer items-center gap-3 border-b border-border/70 px-2 py-2 transition last:border-b-0",
                            checked ? "opacity-70" : "rounded-[8px] bg-primary/5",
                          )}
                        >
                          <span className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center">
                            <input
                              id={item.id}
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleShoppingItem(item.id)}
                              className="peer h-6 w-6 appearance-none rounded-[6px] border-2 border-border bg-card transition checked:border-primary checked:bg-primary focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary"
                            />
                            {checked && <Check aria-hidden="true" className="check-pop pointer-events-none absolute h-4 w-4 text-white" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className={cn("block text-sm font-bold", checked && "text-muted-foreground line-through")}>{item.name}</span>
                            <span className="block text-xs text-muted-foreground">{item.amount}</span>
                          </span>
                          <span className="text-sm font-semibold text-muted-foreground">{formatEuro(item.estimatedPrice)}</span>
                        </label>
                      );
                    })}
                  </motion.div>
                )}
              </section>
            );
          })}
        </div>

      </div>
    </PageLayout>
  );
}
