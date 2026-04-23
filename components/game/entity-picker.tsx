"use client";

import { useDeferredValue, useState } from "react";
import { Search, Sparkles } from "lucide-react";

import {
  entityMatchesLookup,
  getEntitiesForCategory,
  normalizeEntityLookupText,
} from "@/lib/data/entities";
import { isTeachEntityId } from "@/lib/game/teach";
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
  const query = normalizeEntityLookupText(deferredSearch);

  const seeded = getEntitiesForCategory(category);
  const seededIds = new Set(seeded.map((entity) => entity.id));
  const extras = extraEntities.filter(
    (entity) => entity.category === category && !seededIds.has(entity.id),
  );

  const results = [...seeded, ...extras]
    .filter((entity) => !blocked.has(entity.id))
    .filter((entity) => entityMatchesLookup(entity, query))
    .toSorted((left, right) => {
      const leftName = normalizeEntityLookupText(left.name);
      const rightName = normalizeEntityLookupText(right.name);
      const leftStarts = leftName.startsWith(query);
      const rightStarts = rightName.startsWith(query);

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
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search the playbill..."
          className="flex h-12 w-full border border-[rgba(214,174,98,0.34)] bg-[linear-gradient(180deg,rgba(45,24,62,0.94),rgba(21,12,30,0.98))] pl-11 pr-4 text-sm text-[#f6e7bf] outline-none transition-[border-color,background-color,box-shadow] duration-150 placeholder:text-[#a99976] focus:border-[rgba(242,226,181,0.62)] focus:shadow-[0_0_20px_rgba(177,119,219,0.18)]"
          style={{
            clipPath:
              "polygon(16px 0, calc(100% - 16px) 0, 100% 30%, 100% 70%, calc(100% - 16px) 100%, 16px 100%, 0 70%, 0 30%)",
          }}
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
                "relative flex items-center justify-between overflow-hidden border px-4 py-3 text-left transition-[transform,border-color,background-color,color,box-shadow] duration-200",
                active
                  ? "border-[rgba(242,226,181,0.68)] bg-[linear-gradient(180deg,rgba(145,86,196,0.58),rgba(70,39,99,0.96))] text-[#f7ebcb] shadow-[0_0_28px_rgba(177,119,219,0.2)]"
                  : "border-[rgba(214,174,98,0.28)] bg-[linear-gradient(180deg,rgba(45,24,62,0.9),rgba(21,12,30,0.98))] text-[#e6d4a8] hover:-translate-y-[2px] hover:border-[rgba(239,218,163,0.48)]",
              )}
              style={{
                clipPath:
                  "polygon(16px 0, calc(100% - 16px) 0, 100% 30%, 100% 70%, calc(100% - 16px) 100%, 16px 100%, 0 70%, 0 30%)",
              }}
            >
              <div
                className="pointer-events-none absolute inset-[4px] border border-[rgba(242,226,181,0.14)]"
                style={{
                  clipPath:
                    "polygon(16px 0, calc(100% - 16px) 0, 100% 30%, 100% 70%, calc(100% - 16px) 100%, 16px 100%, 0 70%, 0 30%)",
                }}
              />
              <div className="min-w-0">
                <p className={cn("truncate font-medium", active ? "text-[#f7ebcb]" : "text-[#f6e7bf]")}>
                  <span className="mr-2">{entity.imageEmoji}</span>
                  {entity.name}
                  {isTeachEntityId(entity.id) ? (
                    <span className={cn(
                      "ml-2 rounded-md border px-2 py-0.5 text-[0.65rem]",
                      active
                        ? "border-[rgba(246,235,203,0.36)] bg-[rgba(255,255,255,0.16)] text-[#f7ebcb]"
                        : "border-[rgba(214,174,98,0.16)] bg-[rgba(240,217,162,0.08)] text-[#f0d9a2]",
                    )}>
                      Teach
                    </span>
                  ) : null}
                </p>
                <p className={cn("truncate text-xs", active ? "text-[#eadbb3]" : "text-[#af9c83]")}>{entity.shortDescription}</p>
              </div>
              {active ? <Sparkles className="h-4 w-4 shrink-0 text-[#f3d691]" /> : null}
            </button>
          );
        })}

        {results.length === 0 ? (
          <div className="rounded-[1.2rem] border border-dashed border-[rgba(214,174,98,0.2)] bg-[rgba(22,12,31,0.54)] px-4 py-6 text-center text-sm text-[#af9c83]">
            No match in the chamber archive yet. Try a broader clue.
          </div>
        ) : null}
      </div>
    </div>
  );
}
