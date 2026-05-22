// Arbre principal de l'app: combina proveidors, rutes i proteccions de sessio.
import { GoogleOAuthProvider } from "@react-oauth/google";
import { LoaderCircle } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router";
import { BottomNav } from "./components/layout/BottomNav";
import { Sidebar } from "./components/layout/Sidebar";
import { ToastViewport } from "./components/shared/ToastViewport";
import { MenuProvider, useMenu } from "./hooks/useMenu";
import { AuthProvider, googleClientId, useAuthUser } from "./lib/auth";
import { AdaptRecipe } from "./pages/AdaptRecipe";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Menu } from "./pages/Menu";
import { Onboarding } from "./pages/Onboarding";
import { Profile } from "./pages/Profile";
import { RecipeDetail } from "./pages/RecipeDetail";
import { RecipeStepByStep } from "./pages/RecipeStepByStep";
import { Recipes } from "./pages/Recipes";
import { ShoppingList } from "./pages/ShoppingList";
import { SubstitutePlate } from "./pages/SubstitutePlate";

const DEBUG = import.meta.env.DEV;

function debugLog(message: string, data?: unknown) {
  if (DEBUG) {
    console.info(`[Pila-Plats debug] ${message}`, data ?? "");
  }
}

function AuthLoadingScreen() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 text-center text-foreground">
      <div>
        <LoaderCircle aria-hidden="true" className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-sm font-semibold text-muted-foreground">Preparant el teu espai...</p>
      </div>
    </main>
  );
}

// Conserva la ruta original per retornar-hi despres del login quan la sessio ja es valida.
function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthUser();
  const location = useLocation();

  useEffect(() => {
    debugLog("RequireAuth", {
      path: location.pathname,
      loading,
      hasUser: Boolean(user),
    });
  }, [loading, location.pathname, user]);

  if (loading) {
    debugLog("RequireAuth mostra carregant", { path: location.pathname });
    return <AuthLoadingScreen />;
  }

  if (!user) {
    debugLog("RequireAuth redirigeix a /login", { from: location.pathname });
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  debugLog("RequireAuth deixa passar", { path: location.pathname });
  return children;
}

// La shell nomes s'obre quan el perfil actiu ja ha acabat la configuracio inicial.
function ProtectedShell() {
  const { preferences } = useMenu();
  const location = useLocation();

  useEffect(() => {
    debugLog("ProtectedShell", {
      path: location.pathname,
      onboardingDone: preferences.onboardingDone,
    });
  }, [location.pathname, preferences.onboardingDone]);

  if (!preferences.onboardingDone) {
    debugLog("ProtectedShell redirigeix a /onboarding", { from: location.pathname });
    return <Navigate to="/onboarding" replace state={{ from: location }} />;
  }

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="app-content">
        <Outlet />
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    debugLog("App muntada", {
      baseUrl: import.meta.env.BASE_URL,
      googleClientIdPresent: Boolean(googleClientId),
      currentPath: window.location.pathname,
    });
  }, []);

  // El router viu sota els proveidors per compartir autenticacio, menu, preferencies i toasts.
  const appContent = (
    <AuthProvider>
      <MenuProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
            <Route element={<RequireAuth><ProtectedShell /></RequireAuth>}>
              <Route index element={<Home />} />
              <Route path="menu" element={<Menu />} />
              <Route path="shopping" element={<ShoppingList />} />
              <Route path="recipes" element={<Recipes />} />
              <Route path="recipes/:id" element={<RecipeDetail />} />
              <Route path="recipes/:id/cook" element={<RecipeStepByStep />} />
              <Route path="recipes/:id/adapt" element={<AdaptRecipe />} />
              <Route path="profile" element={<Profile />} />
              <Route path="substitute/:dayKey/:category" element={<SubstitutePlate />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastViewport />
        </BrowserRouter>
      </MenuProvider>
    </AuthProvider>
  );

  // El mode convidat funciona sense OAuth; Google nomes s'inicialitza quan hi ha client configurat.
  if (!googleClientId) {
    debugLog("GoogleOAuthProvider desactivat: falta VITE_GOOGLE_CLIENT_ID");
    return appContent;
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {appContent}
    </GoogleOAuthProvider>
  );
}
