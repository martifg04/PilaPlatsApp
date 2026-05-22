// Navegacio compacta per a mobil amb els destins principals de l'app.
import { CalendarDays, Home, ListChecks, Settings, UtensilsCrossed } from "lucide-react";
import { NavLink } from "react-router";
import { useMenu } from "../../hooks/useMenu";
import { cn } from "../ui/utils";

const items = [
  { to: "/", label: "Inici", icon: Home },
  { to: "/menu", label: "Menú", icon: CalendarDays },
  { to: "/shopping", label: "Compra", icon: ListChecks },
  { to: "/recipes", label: "Receptes", icon: UtensilsCrossed },
  { to: "/profile", label: "Perfil", icon: Settings },
];

export function BottomNav() {
  const { currentUser } = useMenu();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 h-[64px] border-t border-border bg-card/95 px-1 backdrop-blur" aria-label="Navegació principal">
      <div className="grid h-full grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              aria-label={item.label}
              className={({ isActive }) =>
                cn(
                  "tap-target flex flex-col items-center justify-center gap-0.5 rounded-[8px] text-[11px] font-semibold transition",
                  isActive ? "text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Al perfil es prioritza la foto de sessio per reforcar el canvi d'usuari. */}
                  {item.to === "/profile" && currentUser?.photoURL ? (
                    <img src={currentUser.photoURL} alt="" className="h-6 w-6 rounded-full object-cover ring-2 ring-primary" />
                  ) : (
                    <Icon aria-hidden="true" className={cn("h-5 w-5", isActive && "stroke-[2.6]")} />
                  )}
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
