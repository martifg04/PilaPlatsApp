// Selector horitzontal que manté visibles les dates calculades de la setmana actual.
import { weekDays } from "../../data/mockData";
import { cn } from "../ui/utils";

interface WeekDaySelectorProps {
  activeDay: string;
  onSelectDay: (dayKey: string) => void;
}

export function WeekDaySelector({ activeDay, onSelectDay }: WeekDaySelectorProps) {
  return (
    <div className="overflow-x-auto pb-2" aria-label="Selector de dies de la setmana">
      <div className="grid min-w-[410px] grid-cols-7 gap-2 md:min-w-0">
        {weekDays.map((day) => {
          const active = day.key === activeDay;
          return (
            <button
              key={day.key}
              type="button"
              aria-pressed={active}
              onClick={() => onSelectDay(day.key)}
              className={cn(
                "tap-target rounded-[8px] border px-2 py-2 text-center transition",
                active ? "border-primary bg-primary text-white shadow-[0_8px_16px_rgba(47,125,79,0.22)]" : "border-border bg-card text-foreground hover:border-primary/50",
              )}
            >
              <span className="block text-sm font-bold">{day.shortLabel}</span>
              <span className={cn("block text-[11px]", active ? "text-white/85" : "text-muted-foreground")}>{day.dateLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
