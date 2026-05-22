// Gestio de sessio local amb entrada Google i alternativa de convidat sense backend propi.
import { googleLogout } from "@react-oauth/google";
import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { GoogleUser } from "../types";

const AUTH_STORAGE_KEY = "pila-plats-auth-v1";
const AUTH_CHANGE_EVENT = "pila-plats-auth-change";
const DEBUG = import.meta.env.DEV;

// Aquest valor s'ha de crear a Google Cloud Console com a OAuth client ID.
export const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

function debugAuth(message: string, data?: unknown) {
  if (DEBUG) {
    console.info(`[Pila-Plats debug] Auth: ${message}`, data ?? "");
  }
}

interface StoredAuth {
  accessToken?: string;
  provider?: "google" | "guest";
  user: GoogleUser;
}

interface GoogleProfileResponse {
  sub?: string;
  name?: string;
  email?: string;
  picture?: string;
}

interface AuthContextValue {
  user: GoogleUser | null;
  loading: boolean;
  signIn: () => void;
  signInAsGuest: (displayName: string) => GoogleUser;
  signOut: () => void;
}

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
  scope?: string;
}

interface GoogleTokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: "" | "none" | "consent" | "select_account" }) => void;
}

interface GoogleIdentityServices {
  accounts?: {
    oauth2?: {
      initTokenClient: (config: {
        client_id: string;
        scope: string;
        callback: (response: GoogleTokenResponse) => void;
        error_callback?: (error: unknown) => void;
        prompt?: "" | "none" | "consent" | "select_account";
      }) => GoogleTokenClient;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentityServices;
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

// La lectura es blinda per no bloquejar l'app si el localStorage conte dades corruptes.
function getStoredAuth() {
  try {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    const parsed = stored ? (JSON.parse(stored) as StoredAuth) : null;
    debugAuth("estat llegit de localStorage", {
      hasStoredAuth: Boolean(parsed),
      hasUser: Boolean(parsed?.user),
      email: parsed?.user.email,
    });
    return parsed;
  } catch (error) {
    console.error("[Pila-Plats debug] Auth: no s'ha pogut llegir localStorage", error);
    return null;
  }
}

// Despres d'escriure la sessio s'emet un esdeveniment local per sincronitzar el context al mateix tab.
function saveAuth(accessToken: string, user: GoogleUser) {
  debugAuth("desant sessio a localStorage", {
    hasAccessToken: Boolean(accessToken),
    email: user.email,
  });
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ accessToken, provider: "google", user }));
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

// Cada convidat rep un identificador propi per separar estat, onboarding i preferencies.
function saveGuestAuth(displayName: string) {
  const trimmedName = displayName.trim();

  if (!trimmedName) {
    throw new Error("missing_guest_name");
  }

  const user = {
    uid: `guest:${window.crypto?.randomUUID?.() ?? Date.now().toString(36)}`,
    displayName: trimmedName,
    email: "",
    photoURL: "",
  } satisfies GoogleUser;

  debugAuth("desant sessio de convidat a localStorage", {
    uid: user.uid,
    displayName: user.displayName,
  });
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ provider: "guest", user }));
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));

  return user;
}

function clearAuth() {
  debugAuth("neteja de sessio local");
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

// L'access token nomes serveix per obtenir les dades basiques del perfil autenticat.
async function fetchGoogleProfile(accessToken: string) {
  debugAuth("demanant perfil de Google", { hasAccessToken: Boolean(accessToken) });
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  debugAuth("resposta perfil de Google", { ok: response.ok, status: response.status });

  if (!response.ok) {
    throw new Error("google_profile_request_failed");
  }

  const profile = (await response.json()) as GoogleProfileResponse;

  if (!profile.sub || !profile.email) {
    throw new Error("google_profile_incomplete");
  }

  return {
    uid: profile.sub,
    displayName: profile.name ?? profile.email,
    email: profile.email,
    photoURL: profile.picture ?? "",
  } satisfies GoogleUser;
}

export async function signInWithGoogle(accessToken: string) {
  const user = await fetchGoogleProfile(accessToken);
  debugAuth("perfil de Google carregat", {
    uid: user.uid,
    email: user.email,
    hasPhoto: Boolean(user.photoURL),
  });
  saveAuth(accessToken, user);
  return user;
}

export function signOut() {
  debugAuth("signOut cridat");
  googleLogout();
  clearAuth();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [loading, setLoading] = useState(true);

  const syncStoredUser = useCallback(() => {
    const storedUser = getStoredAuth()?.user ?? null;
    debugAuth("sincronitzant usuari", {
      hasUser: Boolean(storedUser),
      email: storedUser?.email,
    });
    setUser(storedUser);
    setLoading(false);
  }, []);

  // "storage" cobreix altres pestanyes i l'esdeveniment propi cobreix canvis dins de la pestanya actual.
  useEffect(() => {
    debugAuth("AuthProvider muntat", {
      googleClientIdPresent: Boolean(googleClientId),
      googleScriptPresent: Boolean(window.google?.accounts?.oauth2),
    });
    syncStoredUser();

    window.addEventListener("storage", syncStoredUser);
    window.addEventListener(AUTH_CHANGE_EVENT, syncStoredUser);

    return () => {
      window.removeEventListener("storage", syncStoredUser);
      window.removeEventListener(AUTH_CHANGE_EVENT, syncStoredUser);
    };
  }, [syncStoredUser]);

  useEffect(() => {
    debugAuth("estat GSI", {
      googleScriptPresent: Boolean(window.google?.accounts?.oauth2),
      googleClientIdPresent: Boolean(googleClientId),
    });
  });

  // Google Identity Services crea el token client a demanda per mantenir el login sota accio explicita.
  const handleSignIn = useCallback(() => {
    debugAuth("intent d'inici de sessio", {
      googleClientIdPresent: Boolean(googleClientId),
      googleScriptPresent: Boolean(window.google?.accounts?.oauth2),
    });

    if (!googleClientId) {
      throw new Error("missing_google_client_id");
    }

    const oauthClient = window.google?.accounts?.oauth2;

    if (!oauthClient) {
      throw new Error("google_script_not_ready");
    }

    try {
      setLoading(true);

      const tokenClient = oauthClient.initTokenClient({
        client_id: googleClientId,
        scope: "openid profile email",
        prompt: "select_account",
        callback: async (tokenResponse) => {
          debugAuth("Google OAuth resposta", {
            hasAccessToken: Boolean(tokenResponse.access_token),
            error: tokenResponse.error,
            scope: tokenResponse.scope,
          });

          if (tokenResponse.error || !tokenResponse.access_token) {
            console.error("[Pila-Plats debug] Auth: Google OAuth ha retornat error", tokenResponse);
            setLoading(false);
            return;
          }

          try {
            const nextUser = await signInWithGoogle(tokenResponse.access_token);
            setUser(nextUser);
          } catch (error) {
            console.error("[Pila-Plats debug] Auth: error carregant perfil de Google", error);
            clearAuth();
            setUser(null);
          } finally {
            setLoading(false);
          }
        },
        error_callback: (error) => {
          console.error("[Pila-Plats debug] Auth: error no OAuth de Google", error);
          setLoading(false);
        },
      });

      tokenClient.requestAccessToken({ prompt: "select_account" });
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, []);

  const handleGuestSignIn = useCallback((displayName: string) => {
    debugAuth("intent d'inici de sessio com a convidat", { hasDisplayName: Boolean(displayName.trim()) });
    setLoading(true);

    try {
      const guestUser = saveGuestAuth(displayName);
      setUser(guestUser);
      return guestUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(() => {
    debugAuth("handleSignOut");
    signOut();
    setUser(null);
    setLoading(false);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    signIn: handleSignIn,
    signInAsGuest: handleGuestSignIn,
    signOut: handleSignOut,
  }), [handleGuestSignIn, handleSignIn, handleSignOut, loading, user]);

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuthUser() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthUser must be used within AuthProvider");
  }

  return context;
}
