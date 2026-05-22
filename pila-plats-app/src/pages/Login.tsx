// Porta d'entrada amb Google o convidat i redireccio cap al flux adequat.
import { LoaderCircle, UserRound, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router";
import { cn } from "../components/ui/utils";
import { appLogoSrc } from "../data/appIdentity";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { useMenu } from "../hooks/useMenu";
import { useAuthUser } from "../lib/auth";

const DEBUG = import.meta.env.DEV;

function debugLogin(message: string, data?: unknown) {
  if (DEBUG) {
    console.info(`[Pila-Plats debug] Login: ${message}`, data ?? "");
  }
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

// Patró discret del panell de login per reforcar context culinari sense dependre d'imatges externes.
function KitchenPattern() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.055]" aria-hidden="true">
      <defs>
        <pattern id="kitchen-pattern" width="112" height="112" patternUnits="userSpaceOnUse">
          <path d="M18 18c8 0 14 6 14 14H18V18Z" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M62 20c0 12-8 18-8 28m16-28c0 12-8 18-8 28" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
          <path d="M24 70c10-10 24-10 34 0M30 76h22" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#kitchen-pattern)" className="text-primary" />
    </svg>
  );
}

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { preferences } = useMenu();
  const { user, loading, signIn, signInAsGuest } = useAuthUser();
  const [error, setError] = useState("");
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestError, setGuestError] = useState("");
  const guestDialogRef = useFocusTrap<HTMLDivElement>(guestModalOpen);

  // Despres d'autenticar, un usuari nou entra a onboarding i un usuari configurat recupera la ruta origen.
  useEffect(() => {
    debugLogin("estat", {
      loading,
      hasUser: Boolean(user),
      onboardingDone: preferences.onboardingDone,
      currentPath: location.pathname,
      state: location.state,
    });

    if (loading || !user) {
      return;
    }

    const state = location.state as { from?: { pathname?: string; search?: string } } | null;
    const from = state?.from?.pathname ? `${state.from.pathname}${state.from.search ?? ""}` : "/";
    debugLogin("redirigint despres de login", {
      to: preferences.onboardingDone ? from : "/onboarding",
      from,
    });
    navigate(preferences.onboardingDone ? from : "/onboarding", { replace: true });
  }, [loading, location.state, navigate, preferences.onboardingDone, user]);

  const handleSignIn = () => {
    debugLogin("clic a Continua amb Google");
    setError("");

    try {
      signIn();
    } catch (authError) {
      console.error("[Pila-Plats debug] Login: error iniciant sessio", authError);
      const message = authError instanceof Error && authError.message === "missing_google_client_id"
        ? "Cal configurar el client de Google abans d'entrar."
        : "Google encara s'està preparant. Torna-ho a provar d'aquí uns segons.";
      setError(message);
    }
  };

  const openGuestModal = () => {
    debugLogin("clic a Continua com a convidat");
    setError("");
    setGuestError("");
    setGuestModalOpen(true);
  };

  const closeGuestModal = () => {
    setGuestModalOpen(false);
    setGuestError("");
  };

  const handleGuestSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = guestName.trim();

    if (!trimmedName) {
      setGuestError("Escriu el teu nom.");
      return;
    }

    try {
      signInAsGuest(trimmedName);
      setGuestModalOpen(false);
      setGuestName("");
      setGuestError("");
    } catch (authError) {
      console.error("[Pila-Plats debug] Login: error iniciant sessio com a convidat", authError);
      setGuestError("No se ha podido iniciar la sesion como invitado.");
    }
  };

  // Escape tanca el dialeg de convidat igual que la capa exterior o el boto de tancament.
  useEffect(() => {
    if (!guestModalOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeGuestModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [guestModalOpen]);

  return (
    <main className="relative flex min-h-dvh w-screen min-w-full items-center justify-center overflow-hidden bg-background px-5 py-8 text-foreground sm:px-8 lg:px-12">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 18%, rgba(47, 125, 79, 0.25), transparent 28rem), radial-gradient(circle at 82% 22%, rgba(242, 140, 40, 0.22), transparent 26rem), radial-gradient(circle at 50% 88%, rgba(47, 125, 79, 0.13), transparent 34rem), linear-gradient(135deg, #fbfcf7 0%, #f3f6ee 46%, #fff3df 100%)",
        }}
      />
      <KitchenPattern />
      <div className="absolute left-[8%] top-[12%] h-48 w-48 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-[10%] right-[10%] h-56 w-56 rounded-full bg-accent/15 blur-3xl" aria-hidden="true" />

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[10px] border border-white/70 bg-white/72 shadow-[0_28px_80px_rgba(34,45,28,0.18)] backdrop-blur-xl lg:grid-cols-[minmax(0,1fr)_420px]"
        aria-labelledby="login-title"
      >
        <div className="relative flex min-h-[360px] flex-col justify-between overflow-hidden bg-primary p-8 text-primary-foreground sm:p-10 lg:min-h-[540px]">
          <div
            className="absolute inset-0 opacity-25"
            style={{
              background:
                "radial-gradient(circle at 24% 20%, rgba(255,255,255,0.42), transparent 18rem), radial-gradient(circle at 78% 78%, rgba(242,140,40,0.55), transparent 20rem)",
            }}
            aria-hidden="true"
          />
          <KitchenPattern />
          <div className="relative">
            <img
              src={appLogoSrc}
              alt="Logotip de Pila-Plats"
              className="h-24 w-24 rounded-[10px] border border-white/35 bg-white object-cover shadow-[0_18px_45px_rgba(0,0,0,0.18)] sm:h-28 sm:w-28"
            />
            <h1 id="login-title" className="mt-8 font-hand text-7xl font-bold leading-none text-white sm:text-8xl">
              Pila-Plats
            </h1>
            <p className="mt-4 max-w-md text-balance text-lg font-semibold leading-relaxed text-white/86">
              El teu menú setmanal, sense complicacions.
            </p>
          </div>

          <div className="relative mt-10 grid grid-cols-3 gap-2 text-center text-xs font-bold text-white/85">
            <span className="rounded-[8px] border border-white/20 bg-white/12 px-3 py-2 backdrop-blur">Menú</span>
            <span className="rounded-[8px] border border-white/20 bg-white/12 px-3 py-2 backdrop-blur">Compra</span>
            <span className="rounded-[8px] border border-white/20 bg-white/12 px-3 py-2 backdrop-blur">Receptes</span>
          </div>
        </div>

        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
          <div className="mx-auto w-full max-w-sm text-center lg:mx-0 lg:text-left">
            <p className="text-sm font-extrabold uppercase text-primary">Inici de sessió</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
              Torna al teu pla setmanal.
            </h2>
            <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">
              Continua amb el teu compte per recuperar el menú i les preferències d'aquest dispositiu.
            </p>

            <button
              type="button"
              onClick={handleSignIn}
              disabled={loading}
              className={cn(
                "mt-8 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-[8px] border border-border bg-white px-4 text-sm font-extrabold text-foreground shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(34,45,28,0.16)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0",
                loading && "shadow-sm",
              )}
              aria-describedby={error ? "login-error" : "login-note"}
            >
              {loading ? <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin text-primary" /> : <GoogleLogo />}
              {loading ? "Connectant..." : "Continua amb Google"}
            </button>

            <div className="my-4 flex items-center gap-3" aria-hidden="true">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs font-extrabold uppercase text-muted-foreground">o</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <button
              type="button"
              onClick={openGuestModal}
              disabled={loading}
              className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-[8px] border border-primary bg-primary px-4 text-sm font-extrabold text-primary-foreground shadow-[0_12px_24px_rgba(47,125,79,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#256b43] hover:shadow-[0_16px_30px_rgba(34,45,28,0.16)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              <UserRound aria-hidden="true" className="h-5 w-5" />
              Continuar com convidat
            </button>

            {error && (
              <p id="login-error" className="mt-4 rounded-[8px] border border-destructive/30 bg-white/80 px-3 py-2 text-sm font-semibold text-destructive">
                {error}
              </p>
            )}

            <p id="login-note" className="mt-6 text-sm font-medium text-muted-foreground">
              Les teves dades només es guarden al teu dispositiu.
            </p>
          </div>
        </div>
      </motion.section>

      {guestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 px-5 backdrop-blur-sm" role="presentation" onMouseDown={closeGuestModal}>
          <motion.div
            ref={guestDialogRef}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="guest-title"
            aria-describedby="guest-description"
            className="w-full max-w-sm rounded-[10px] border border-white/70 bg-white p-5 text-left shadow-[0_28px_80px_rgba(34,45,28,0.24)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-extrabold uppercase text-primary">Convidat</p>
                <h2 id="guest-title" className="mt-1 text-2xl font-extrabold text-foreground">
                  Com vols que et diguem?
                </h2>
              </div>
              <button
                type="button"
                onClick={closeGuestModal}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-border bg-card text-foreground shadow-sm transition hover:bg-muted"
                aria-label="Cerrar"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <p id="guest-description" className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">
              Només necessitem el teu nom per mostrar-lo en el resto de la aplicació.
            </p>

            <form onSubmit={handleGuestSubmit} className="mt-5">
              <label htmlFor="guest-name" className="text-sm font-bold text-foreground">
                Nom
              </label>
              <input
                id="guest-name"
                type="text"
                value={guestName}
                onChange={(event) => {
                  setGuestName(event.target.value);
                  setGuestError("");
                }}
                autoComplete="name"
                autoFocus
                className="mt-2 h-12 w-full rounded-[8px] border border-border bg-card px-3 text-base font-semibold text-foreground shadow-sm"
                placeholder="El teu nom"
                aria-invalid={guestError ? "true" : undefined}
                aria-describedby={guestError ? "guest-error" : undefined}
              />

              {guestError && (
                <p id="guest-error" className="mt-3 rounded-[8px] border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm font-semibold text-destructive">
                  {guestError}
                </p>
              )}

              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeGuestModal}
                  className="inline-flex min-h-11 items-center justify-center rounded-[8px] border border-border bg-card px-4 text-sm font-bold text-foreground shadow-sm transition hover:bg-muted"
                >
                  Cancel·lar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] border border-primary bg-primary px-4 text-sm font-extrabold text-primary-foreground shadow-[0_8px_18px_rgba(47,125,79,0.22)] transition hover:bg-[#256b43] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading && <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />}
                  Entrar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </main>
  );
}
