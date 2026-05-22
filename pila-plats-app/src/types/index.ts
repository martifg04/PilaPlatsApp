// Contractes de domini compartits entre dades simulades, contextos i pantalles.
export type MealCategory = "dinar" | "sopar";

export type IngredientCategory =
  | "Verdures"
  | "Proteïnes"
  | "Bàsics"
  | "Làctics"
  | "Fruita"
  | "Altres";

export type DishTag =
  | "vegetarià"
  | "vegà"
  | "sense lactosa"
  | "sense gluten"
  | "sense fruits secs"
  | "ràpid"
  | "econòmic"
  | "proteic";

// La recepta es la unitat base del cataleg i de la generacio del menu.
export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  category: IngredientCategory;
  estimatedPrice: number;
}

export interface Dish {
  id: string;
  name: string;
  category: MealCategory;
  time: number;
  price: number;
  difficulty: 1 | 2 | 3;
  image: string;
  tags: DishTag[];
  ingredients: Ingredient[];
  instructions: string[];
  description: string;
}

export interface DayInfo {
  key: string;
  shortLabel: string;
  label: string;
  dateLabel: string;
}

// Un apat planificat nomes referencia el plat; estat de substitucio i completat son opcionals.
export interface MenuMeal {
  dayKey: string;
  category: MealCategory;
  dishId: string;
  completed?: boolean;
  substituted?: boolean;
}

export interface UserPreferences {
  budget: number;
  restrictions: DishTag[];
  availableTime: "short" | "moderate" | "long";
  onboardingDone: boolean;
}

// La compra agrupa ingredients acumulats per categoria i conserva els checks de l'usuari.
export interface ShoppingItem {
  id: string;
  name: string;
  amount: string;
  category: IngredientCategory;
  estimatedPrice: number;
  checked: boolean;
}

export interface ShoppingGroup {
  category: IngredientCategory;
  items: ShoppingItem[];
}

export interface ToastMessage {
  id: number;
  text: string;
  tone?: "success" | "warning" | "danger";
}

export interface GoogleUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
}

// Progres i estadistiques permeten compartir el seguiment entre detall, cuina guiada i perfil.
export interface RecipeProgress {
  currentStep: number;
  completedSteps: number[];
  updatedAt: string;
}

export interface CookingStats {
  completedMealCount: number;
  completedDates: string[];
  currentStreak: number;
}
