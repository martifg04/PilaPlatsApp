// Estat de domini de Pila-Plats: menu, pressupost, compra, progres de cuina i notificacions.
import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  buildShoppingGroups,
  calculateMenuTotal,
  defaultPreferences,
  dishes,
  formatEuro,
  initialWeeklyMenu,
  todayKey,
} from "../data/mockData";
import { useAuthUser } from "../lib/auth";
import type { CookingStats, Dish, DishTag, GoogleUser, MealCategory, MenuMeal, RecipeProgress, ShoppingGroup, ToastMessage, UserPreferences } from "../types";

interface MenuContextValue {
  currentUser: GoogleUser | null;
  menu: MenuMeal[];
  preferences: UserPreferences;
  budgetSpent: number;
  remainingBudget: number;
  shoppingGroups: ShoppingGroup[];
  checkedShoppingIds: string[];
  recipeProgress: Record<string, RecipeProgress>;
  cookingStats: CookingStats;
  toasts: ToastMessage[];
  isRegenerating: boolean;
  setPreferences: (preferences: UserPreferences) => void;
  finishOnboarding: (preferences: Pick<UserPreferences, "budget" | "restrictions" | "availableTime">) => void;
  replaceMeal: (dayKey: string, category: MealCategory, dishId: string, toastText?: string) => void;
  skipMeal: (dayKey: string, category: MealCategory) => void;
  completeMeal: (dayKey: string, category: MealCategory, dishId?: string) => void;
  toggleShoppingItem: (id: string) => void;
  markAllShoppingItems: () => void;
  resetShoppingList: () => void;
  setRecipeCurrentStep: (dishId: string, stepIndex: number) => void;
  setRecipeStepCompleted: (dishId: string, stepIndex: number, completed: boolean) => void;
  resetRecipeProgress: (dishId: string) => void;
  regenerateMenu: () => Promise<void>;
  showToast: (text: string, tone?: ToastMessage["tone"]) => void;
  dismissToast: (id: number) => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

// La versio i l'uid aillen la persistencia de cada compte en aquest dispositiu.
const STORAGE_KEY_PREFIX = "pila-plats-state-v2";

interface StoredState {
  menu?: MenuMeal[];
  preferences?: UserPreferences;
  checkedShoppingIds?: string[];
  recipeProgress?: Record<string, RecipeProgress>;
  completedDates?: string[];
}

function getStorageKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}:${userId}`;
}

function loadStoredState(storageKey: string): StoredState {
  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored ? (JSON.parse(stored) as StoredState) : {};
  } catch {
    return {};
  }
}

function saveStoredState(storageKey: string, state: StoredState) {
  window.localStorage.setItem(storageKey, JSON.stringify(state));
}

const dayKeys = ["dl", "dm", "dc", "dj", "dv", "ds", "dg"];
const mealCategories: MealCategory[] = ["dinar", "sopar"];
const expectedWeeklyMealCount = dayKeys.length * mealCategories.length;

function todayISODate() {
  return new Date().toLocaleDateString("sv-SE");
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function calculateCurrentStreak(completedDates: string[]) {
  const completed = new Set(completedDates);
  let cursor = new Date();

  if (!completed.has(todayISODate())) {
    const yesterday = addDays(cursor, -1).toLocaleDateString("sv-SE");
    if (!completed.has(yesterday)) {
      return 0;
    }
    cursor = addDays(cursor, -1);
  }

  let streak = 0;
  while (completed.has(cursor.toLocaleDateString("sv-SE"))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

// Les preferencies de temps es tradueixen a un limit que la generacio pot filtrar.
function timeLimitForPreference(availableTime: UserPreferences["availableTime"]) {
  if (availableTime === "short") {
    return 20;
  }
  if (availableTime === "moderate") {
    return 40;
  }
  return Number.POSITIVE_INFINITY;
}

function matchesRestrictions(dish: Dish, restrictions: DishTag[]) {
  return restrictions.every((restriction) => {
    // Aquest prototip no codifica fruits secs als plats; aquesta restriccio no pot excloure receptes amb fiabilitat.
    if (restriction === "sense fruits secs") {
      return true;
    }
    if (restriction === "vegetarià") {
      return dish.tags.includes("vegetarià") || dish.tags.includes("vegà");
    }
    return dish.tags.includes(restriction);
  });
}

function shuffle<T>(items: T[]) {
  return items
    .map((value) => ({ value, order: Math.random() }))
    .sort((a, b) => a.order - b.order)
    .map((item) => item.value);
}

function getDish(dishId: string) {
  return dishes.find((dish) => dish.id === dishId);
}

function getCandidatePool(category: MealCategory, restrictions: DishTag[], availableTime: UserPreferences["availableTime"]) {
  const maxTime = timeLimitForPreference(availableTime);
  const categoryDishes = dishes.filter((dish) => dish.category === category);
  const restricted = categoryDishes.filter((dish) => matchesRestrictions(dish, restrictions));
  // Si una restriccio deixa la categoria sense opcions, es prioritza mantenir el menu utilitzable.
  const compatible = restricted.length > 0 ? restricted : categoryDishes;

  const timed = compatible.filter((dish) => dish.time <= maxTime);
  return timed.length > 0 ? timed : compatible;
}

function selectDishForSlot(
  category: MealCategory,
  restrictions: DishTag[],
  budgetPerMeal: number,
  availableTime: UserPreferences["availableTime"],
  used: Set<string>,
  previousDishIds: Set<string>,
  previousDishId?: string,
) {
  const pool = getCandidatePool(category, restrictions, availableTime);
  const uniquePool = pool.filter((dish) => !used.has(dish.id));
  const source = uniquePool.length > 0 ? uniquePool : pool;

  // La puntuacio equilibra cost, rapidesa i varietat sense perdre una mica d'aleatorietat.
  return shuffle(source)
    .map((dish) => {
      const pricePressure = Math.max(0, dish.price - budgetPerMeal) * 2.1;
      const sameSlotPenalty = dish.id === previousDishId ? 4 : 0;
      const previousWeekPenalty = previousDishIds.has(dish.id) ? 0.85 : 0;
      const quickBonus = dish.tags.includes("ràpid") ? -0.2 : 0;
      const economicalBonus = dish.tags.includes("econòmic") ? -0.35 : 0;
      const naturalVariation = Math.random() * 1.35;
      return {
        dish,
        score: dish.price * 0.45 + dish.time * 0.018 + pricePressure + sameSlotPenalty + previousWeekPenalty + quickBonus + economicalBonus + naturalVariation,
      };
    })
    .sort((a, b) => a.score - b.score)[0]?.dish;
}

function reduceMenuToBudget(
  menu: MenuMeal[],
  budget: number,
  restrictions: DishTag[],
  availableTime: UserPreferences["availableTime"],
) {
  const nextMenu = [...menu];
  let guard = 0;

  // Primer es revisen els plats mes cars per reduir pressupost amb el minim nombre de canvis.
  while (calculateMenuTotal(nextMenu) > budget && guard < 28) {
    guard += 1;
    const orderedIndexes = nextMenu
      .map((meal, index) => ({ index, dish: getDish(meal.dishId) }))
      .filter((item): item is { index: number; dish: Dish } => Boolean(item.dish))
      .sort((a, b) => b.dish.price - a.dish.price);

    let replaced = false;

    for (const { index, dish: currentDish } of orderedIndexes) {
      const meal = nextMenu[index];
      const usedElsewhere = new Set(nextMenu.filter((_, currentIndex) => currentIndex !== index).map((item) => item.dishId));
      const pool = getCandidatePool(meal.category, restrictions, availableTime).filter((candidate) => candidate.price < currentDish.price);
      const uniquePool = pool.filter((candidate) => !usedElsewhere.has(candidate.id));
      const candidates = (uniquePool.length > 0 ? uniquePool : pool).sort((a, b) => a.price - b.price || a.time - b.time);
      const replacement = shuffle(candidates.slice(0, 4))[0];

      if (replacement) {
        nextMenu[index] = { ...meal, dishId: replacement.id, completed: false, substituted: false };
        replaced = true;
        break;
      }
    }

    if (!replaced) {
      break;
    }
  }

  return nextMenu;
}

function buildMenuAttempt(
  restrictions: DishTag[],
  budget: number,
  availableTime: UserPreferences["availableTime"],
  previousMenu: MenuMeal[] = [],
): MenuMeal[] {
  const nextMenu: MenuMeal[] = [];
  const used = new Set<string>();
  const previousBySlot = new Map(previousMenu.map((meal) => [`${meal.dayKey}-${meal.category}`, meal.dishId]));
  const previousDishIds = new Set(previousMenu.map((meal) => meal.dishId));
  const budgetPerMeal = budget / (dayKeys.length * mealCategories.length);

  dayKeys.forEach((dayKey) => {
    mealCategories.forEach((category) => {
      const choice = selectDishForSlot(
        category,
        restrictions,
        budgetPerMeal,
        availableTime,
        used,
        previousDishIds,
        previousBySlot.get(`${dayKey}-${category}`),
      );

      if (choice) {
        used.add(choice.id);
        nextMenu.push({ dayKey, category, dishId: choice.id });
      }
    });
  });

  return reduceMenuToBudget(nextMenu, budget, restrictions, availableTime);
}

function getMenuDifferenceCount(menu: MenuMeal[], previousMenu: MenuMeal[]) {
  if (previousMenu.length === 0) {
    return expectedWeeklyMealCount;
  }

  const previousBySlot = new Map(previousMenu.map((meal) => [`${meal.dayKey}-${meal.category}`, meal.dishId]));
  return menu.reduce((count, meal) => {
    return previousBySlot.get(`${meal.dayKey}-${meal.category}`) === meal.dishId ? count : count + 1;
  }, 0);
}

function scoreGeneratedMenu(menu: MenuMeal[], previousMenu: MenuMeal[], budget: number) {
  const total = calculateMenuTotal(menu);
  const missingSlotsPenalty = Math.max(0, expectedWeeklyMealCount - menu.length) * 8;
  const overBudgetPenalty = Math.max(0, total - budget) * 4;
  const differenceScore = getMenuDifferenceCount(menu, previousMenu) * 2;

  return menu.length + differenceScore - missingSlotsPenalty - overBudgetPenalty;
}

function pickMenuForPreferences(
  restrictions: DishTag[],
  budget: number,
  availableTime: UserPreferences["availableTime"],
  previousMenu: MenuMeal[] = [],
): MenuMeal[] {
  let bestMenu = buildMenuAttempt(restrictions, budget, availableTime, previousMenu);
  let bestScore = scoreGeneratedMenu(bestMenu, previousMenu, budget);
  const targetChanges = previousMenu.length > 0 ? Math.min(6, expectedWeeklyMealCount) : 0;

  // Es conserven intents alternatius per evitar setmanes repetitives o incompletes.
  for (let attempt = 1; attempt < 10; attempt += 1) {
    const candidate = buildMenuAttempt(restrictions, budget, availableTime, previousMenu);
    const candidateScore = scoreGeneratedMenu(candidate, previousMenu, budget);
    const candidateTotal = calculateMenuTotal(candidate);
    const changedSlots = getMenuDifferenceCount(candidate, previousMenu);

    if (candidateScore > bestScore) {
      bestMenu = candidate;
      bestScore = candidateScore;
    }

    if (candidate.length === expectedWeeklyMealCount && candidateTotal <= budget && changedSlots >= targetChanges) {
      return candidate;
    }
  }

  return bestMenu;
}

export function MenuProvider({ children }: { children: ReactNode }) {
  const { user: currentUser } = useAuthUser();
  // La key remunta la sessio de menu quan canvia l'usuari autenticat.
  return createElement(MenuSessionProvider, {
    key: currentUser?.uid ?? "signed-out",
    currentUser,
    children,
  });
}

function MenuSessionProvider({ children, currentUser }: { children: ReactNode; currentUser: GoogleUser | null }) {
  const storageKey = currentUser ? getStorageKey(currentUser.uid) : null;
  const stored = useMemo(() => storageKey ? loadStoredState(storageKey) : {}, [storageKey]);
  const [menu, setMenu] = useState<MenuMeal[]>(stored.menu ?? initialWeeklyMenu);
  const [preferences, setPreferencesState] = useState<UserPreferences>(stored.preferences ?? defaultPreferences);
  const [checkedShoppingIds, setCheckedShoppingIds] = useState<string[]>(stored.checkedShoppingIds ?? []);
  const [recipeProgress, setRecipeProgressState] = useState<Record<string, RecipeProgress>>(stored.recipeProgress ?? {});
  const [completedDates, setCompletedDates] = useState<string[]>(stored.completedDates ?? []);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const toastIdRef = useRef(0);

  const budgetSpent = useMemo(() => calculateMenuTotal(menu), [menu]);
  const remainingBudget = Number((preferences.budget - budgetSpent).toFixed(2));
  const shoppingGroups = useMemo(() => buildShoppingGroups(menu, checkedShoppingIds), [menu, checkedShoppingIds]);
  const cookingStats = useMemo<CookingStats>(() => ({
    completedMealCount: menu.filter((meal) => meal.completed).length,
    completedDates,
    currentStreak: calculateCurrentStreak(completedDates),
  }), [completedDates, menu]);

  // Sense usuari no es persisteix menu: el login nomes necessita valors per defecte per decidir onboarding.
  useEffect(() => {
    if (!storageKey) {
      return;
    }

    saveStoredState(storageKey, { menu, preferences, checkedShoppingIds, recipeProgress, completedDates });
  }, [checkedShoppingIds, completedDates, menu, preferences, recipeProgress, storageKey]);

  const showToast = useCallback((text: string, tone: ToastMessage["tone"] = "success") => {
    const id = toastIdRef.current + 1;
    toastIdRef.current = id;
    setToasts((current) => [...current, { id, text, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const setPreferences = useCallback((nextPreferences: UserPreferences) => {
    setPreferencesState(nextPreferences);
    showToast("Preferències actualitzades", "success");
  }, [showToast]);

  // Finalitzar onboarding reinicia estat derivat perque compra i progressos corresponguin al menu nou.
  const finishOnboarding = useCallback((next: Pick<UserPreferences, "budget" | "restrictions" | "availableTime">) => {
    const finalPreferences = { ...defaultPreferences, ...next, onboardingDone: true };
    const generated = pickMenuForPreferences(finalPreferences.restrictions, finalPreferences.budget, finalPreferences.availableTime);
    setPreferencesState(finalPreferences);
    setMenu(generated);
    setCheckedShoppingIds([]);
    setRecipeProgressState({});
    setCompletedDates([]);
    showToast(`Menú setmanal generat: ${generated.length} àpats planificats`, "success");
  }, [showToast]);

  const replaceMeal = useCallback((dayKey: string, category: MealCategory, dishId: string, toastText = "Plat substituït correctament") => {
    setMenu((current) =>
      current.map((meal) =>
        meal.dayKey === dayKey && meal.category === category
          ? { ...meal, dishId, completed: false, substituted: true }
          : meal,
      ),
    );
    setCheckedShoppingIds([]);
    showToast(toastText, "success");
  }, [showToast]);

  const skipMeal = useCallback((dayKey: string, category: MealCategory) => {
    setMenu((current) => current.filter((meal) => !(meal.dayKey === dayKey && meal.category === category)));
    setCheckedShoppingIds([]);
    showToast("Àpat saltat. La llista s'ha recalculat.", "warning");
  }, [showToast]);

  // Completar un apat tambe marca la recepta com acabada per mantenir coherencia entre pantalles.
  const completeMeal = useCallback((dayKey: string, category: MealCategory, dishId?: string) => {
    const targetMeal = menu.find((meal) => meal.dayKey === dayKey && meal.category === category);
    if (!targetMeal) {
      showToast("No he trobat aquest àpat al menú", "danger");
      return;
    }

    const finalDishId = dishId ?? targetMeal.dishId;
    const nextMenu = menu.map((meal) =>
      meal.dayKey === dayKey && meal.category === category
        ? {
          ...meal,
          dishId: finalDishId,
          completed: true,
          substituted: finalDishId !== meal.dishId ? true : meal.substituted,
        }
        : meal,
    );
    const completedDate = todayISODate();
    setMenu(nextMenu);
    setCompletedDates((current) => current.includes(completedDate) ? current : [...current, completedDate]);
    setRecipeProgressState((current) => {
      const dish = getDish(finalDishId);
      if (!dish) {
        return current;
      }
      return {
        ...current,
        [finalDishId]: {
          currentStep: Math.max(0, dish.instructions.length - 1),
          completedSteps: dish.instructions.map((_, index) => index),
          updatedAt: new Date().toISOString(),
        },
      };
    });
    showToast(`Plat completat. Pressupost: ${formatEuro(calculateMenuTotal(nextMenu))} / ${formatEuro(preferences.budget)}`, "success");
  }, [menu, preferences.budget, showToast]);

  const toggleShoppingItem = useCallback((id: string) => {
    const wasChecked = checkedShoppingIds.includes(id);
    setCheckedShoppingIds((current) => {
      return current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    });
    showToast(wasChecked ? "Ítem retornat a la llista" : "Ítem marcat com comprat", "success");
  }, [checkedShoppingIds, showToast]);

  const markAllShoppingItems = useCallback(() => {
    const allIds = shoppingGroups.flatMap((group) => group.items.map((item) => item.id));
    setCheckedShoppingIds(allIds);
    showToast("Tots els productes marcats com comprats", "success");
  }, [shoppingGroups, showToast]);

  const resetShoppingList = useCallback(() => {
    setCheckedShoppingIds([]);
    showToast("Llista reiniciada", "warning");
  }, [showToast]);

  const setRecipeCurrentStep = useCallback((dishId: string, stepIndex: number) => {
    setRecipeProgressState((current) => ({
      ...current,
      [dishId]: {
        currentStep: stepIndex,
        completedSteps: current[dishId]?.completedSteps ?? [],
        updatedAt: new Date().toISOString(),
      },
    }));
  }, []);

  const setRecipeStepCompleted = useCallback((dishId: string, stepIndex: number, completed: boolean) => {
    setRecipeProgressState((current) => {
      const existing = current[dishId] ?? { currentStep: stepIndex, completedSteps: [], updatedAt: new Date().toISOString() };
      const completedSteps = completed
        ? Array.from(new Set([...existing.completedSteps, stepIndex])).sort((a, b) => a - b)
        : existing.completedSteps.filter((item) => item !== stepIndex);

      return {
        ...current,
        [dishId]: {
          currentStep: Math.max(existing.currentStep, stepIndex),
          completedSteps,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const resetRecipeProgress = useCallback((dishId: string) => {
    setRecipeProgressState((current) => {
      const { [dishId]: _removed, ...rest } = current;
      return rest;
    });
    showToast("Progrés de recepta reiniciat", "warning");
  }, [showToast]);

  const regenerateMenu = useCallback(async () => {
    setIsRegenerating(true);
    await new Promise((resolve) => window.setTimeout(resolve, 900));
    const generated = pickMenuForPreferences(preferences.restrictions, preferences.budget, preferences.availableTime, menu);
    const changedSlots = getMenuDifferenceCount(generated, menu);
    const changedText = changedSlots === 1 ? "1 canvi" : `${changedSlots} canvis`;
    setMenu(generated);
    setCheckedShoppingIds([]);
    setIsRegenerating(false);
    showToast(`Menú setmanal regenerat: ${generated.length} àpats, ${changedText}`, "success");
  }, [menu, preferences.availableTime, preferences.budget, preferences.restrictions, showToast]);

  // El context exposa accions de domini, les pantalles no han de duplicar persistencia ni calculs.
  const value = useMemo<MenuContextValue>(() => ({
    currentUser,
    menu,
    preferences,
    budgetSpent,
    remainingBudget,
    shoppingGroups,
    checkedShoppingIds,
    recipeProgress,
    cookingStats,
    toasts,
    isRegenerating,
    setPreferences,
    finishOnboarding,
    replaceMeal,
    skipMeal,
    completeMeal,
    toggleShoppingItem,
    markAllShoppingItems,
    resetShoppingList,
    setRecipeCurrentStep,
    setRecipeStepCompleted,
    resetRecipeProgress,
    regenerateMenu,
    showToast,
    dismissToast,
  }), [
    budgetSpent,
    checkedShoppingIds,
    completeMeal,
    cookingStats,
    currentUser,
    dismissToast,
    finishOnboarding,
    isRegenerating,
    markAllShoppingItems,
    menu,
    preferences,
    regenerateMenu,
    remainingBudget,
    replaceMeal,
    resetRecipeProgress,
    resetShoppingList,
    recipeProgress,
    setPreferences,
    setRecipeCurrentStep,
    setRecipeStepCompleted,
    shoppingGroups,
    showToast,
    skipMeal,
    toasts,
    toggleShoppingItem,
  ]);

  return createElement(MenuContext.Provider, { value }, children);
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error("useMenu must be used within MenuProvider");
  }
  return context;
}

export { todayKey };
