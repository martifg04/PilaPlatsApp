// Navegacio lateral per escriptori amb calaix superposat a pantalles petites.
import { CalendarDays, Home, ListChecks, LogOut, Settings, UtensilsCrossed, Menu, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import { useState } from "react";
import { appLogoSrc } from "../../data/appIdentity";
import { useMenu } from "../../hooks/useMenu";
import { useAuthUser } from "../../lib/auth";
import { cn } from "../ui/utils";

const items = [
  { to: "/", label: "Inici", icon: Home },
  { to: "/menu", label: "Menú", icon: CalendarDays },
  { to: "/shopping", label: "Compra", icon: ListChecks },
  { to: "/recipes", label: "Receptes", icon: UtensilsCrossed },
  { to: "/profile", label: "Perfil", icon: Settings },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}

export function Sidebar() {
  const navigate = useNavigate();
  const { currentUser, showToast } = useMenu();
  const { signOut } = useAuthUser();
  const [isOpen, setIsOpen] = useState(false);
  const userName = currentUser?.displayName || "Usuari";
  const userEmail = currentUser?.email || "Compte actiu";

  const handleSignOut = () => {
    showToast("Sessió tancada", "success");
    signOut();
    setIsOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Control mobil que obre i tanca el mateix arbre de navegacio lateral. */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 hover:bg-muted rounded-lg"
        aria-label={isOpen ? "Tancar menú" : "Obrir menú"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Capa de fons que permet tancar el calaix tocant fora. */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Barra persistent en escriptori i desplacable en mobil. */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-dvh w-64 bg-card border-r border-border transition-transform duration-300 z-40 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
        aria-label="Navegació principal"
      >
        <div className="px-4 pt-6 pb-40">
          {/* Identitat visible abans de la navegacio. */}
          <div className="mb-8 flex items-center gap-2">
            <img src={appLogoSrc} alt="" className="h-10 w-10 rounded-[8px] border border-border bg-white object-cover shadow-sm" />
            <div>
              <h1 className="text-lg font-extrabold text-foreground">Pila-Plats</h1>
              <p className="text-xs text-muted-foreground">Menú setmanal</p>
            </div>
          </div>

          {/* React Router marca l'enllac actiu mentre es conserva un sol cataleg de rutes. */}
          <nav className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  aria-label={item.label}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition font-semibold text-sm",
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Resum de sessio i sortida accessible des de qualsevol seccio. */}
          <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-border bg-muted/80 p-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/30" />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-primary-foreground" aria-hidden="true">
                  {getInitials(userName)}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">{userName}</p>
                <p className="truncate">{userEmail}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-[8px] border border-border bg-card px-3 text-sm font-bold text-foreground shadow-sm transition hover:bg-white"
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
              Tanca sessió
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
