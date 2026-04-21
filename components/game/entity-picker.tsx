"use client";

import { useDeferredValue, useState } from "react";
import { Search, Sparkles } from "lucide-react";

import { getEntitiesForCategory } from "@/lib/data/entities";
import { isTeachEntityId } from "@/lib/game/teach";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import type { EntityCategory, GameEntity } from "@/types/game";

interface EntityPickerProps {
  category: EntityCategory;
  selectedId?: string | null;
  excludedIds?: string[];
  onSelect: (entityId: string) => void;
  extraEntities?: GameEntity[];
}

export function EntityPicker({
  category,
  selectedId = null,
  excludedIds = [],
  onSelect,
  extraEntities = [],
}: EntityPickerProps) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const blocked = new Set(excludedIds);
  const query = deferredSearch.trim().toLowerCase();

  const seeded = getEntitiesForCategory(category);
  const seededIds = new Set(seeded.map((entity) => entity.id));
  const extras = extraEntities.filter(
    (entity) => entity.category === category && !seededIds.has(entity.id),
  );

  const results = [...seeded, ...extras]
    .filter((entity) => !blocked.has(entity.id))
    .filter((entity) => {
      if (!query) {
        return true;
      }

      return (
        entity.name.toLowerCase().includes(query) ||
        entity.shortDescription.toLowerCase().includes(query)
      );
    })
    .toSorted((left, right) => {
      const leftStarts = left.name.toLowerCase().startsWith(query);
      const rightStarts = right.name.toLowerCase().startsWith(query);

      if (leftStarts !== rightStarts) {
        return Number(rightStarts) - Number(leftStarts);
      }

      return left.name.localeCompare(right.name);
    })
    .slice(0, 10);

  return (
    <div className="space-y-4">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search the archive..."
          className="pl-11"
        />
      </label>

      <div className="grid gap-2">
        {results.map((entity) => {
          const active = selectedId === entity.id;

          return (
            <button
              key={entity.id}
              type="button"
              onClick={() => onSelect(entity.id)}
              className={cn(
                "flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition duration-300",
                active
                  ? "border-cyan-300/50 bg-cyan-300/12 shadow-[0_0_0_1px_rgba(103,232,249,0.2)]"
                  : "border-white/10 bg-white/5 hover:border-white/18 hover:bg-white/9",
              )}
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-100">
                  <span className="mr-2">{entity.imageEmoji}</span>
                  {entity.name}
                  {isTeachEntityId(entity.id) ? (
                    <span className="ml-2 rounded-full border border-emerald-200/30 bg-emerald-300/10 px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.22em] text-emerald-100">
                      Teach
                    </span>
                  ) : null}
                </p>
                <p className="truncate text-xs text-slate-400">{entity.shortDescription}</p>
              </div>
              {active ? <Sparkles className="h-4 w-4 shrink-0 text-cyan-200" /> : null}
            </button>
          );
        })}

        {results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/4 px-4 py-6 text-center text-sm text-slate-400">
            No match in the chamber archive yet. Try a broader clue.
          </div>
        ) : null}
      </div>
    </div>
  );
}
