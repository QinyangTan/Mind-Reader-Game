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
        entity.shortDescription.toLowerCase().includes(query) ||
        entity.aliases?.some((alias) => alias.toLowerCase().includes(query))
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
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d6a653]" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search the playbill..."
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
                "flex items-center justify-between rounded-[1.2rem] border px-4 py-3 text-left transition-colors duration-150",
                active
                  ? "brand-paper"
                  : "border-[rgba(240,217,162,0.14)] bg-[rgba(18,10,24,0.54)] hover:border-[rgba(240,217,162,0.24)] hover:bg-[rgba(29,16,38,0.88)]",
              )}
            >
              <div className="min-w-0">
                <p className={cn("truncate font-medium", active ? "text-[#2b1a1e]" : "text-[#f7efd9]")}>
                  <span className="mr-2">{entity.imageEmoji}</span>
                  {entity.name}
                  {isTeachEntityId(entity.id) ? (
                    <span className={cn(
                      "ml-2 rounded-md border px-2 py-0.5 text-[0.65rem]",
                      active
                        ? "border-[rgba(138,91,36,0.16)] bg-white/35 text-[#8a5b24]"
                        : "border-[rgba(240,217,162,0.16)] bg-[rgba(240,217,162,0.08)] text-[#f0d9a2]",
                    )}>
                      Teach
                    </span>
                  ) : null}
                </p>
                <p className={cn("truncate text-xs", active ? "text-[#5c433e]" : "text-[#af9c83]")}>{entity.shortDescription}</p>
              </div>
              {active ? <Sparkles className="h-4 w-4 shrink-0 text-[#8a5b24]" /> : null}
            </button>
          );
        })}

        {results.length === 0 ? (
          <div className="brand-inset rounded-[1.2rem] border-dashed px-4 py-6 text-center text-sm text-[#af9c83]">
            No match in the chamber archive yet. Try a broader clue.
          </div>
        ) : null}
      </div>
    </div>
  );
}
